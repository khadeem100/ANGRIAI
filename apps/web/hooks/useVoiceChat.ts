"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useChat } from "@/providers/ChatProvider";
import { useAccount } from "@/providers/EmailAccountProvider";
import { EMAIL_ACCOUNT_HEADER } from "@/utils/config";
import { toast } from "sonner";

export type VoiceMode = "idle" | "listening" | "processing" | "speaking";

export function useVoiceChat() {
  const { input, setInput, handleSubmit, chat } = useChat();
  const { userEmail, emailAccountId } = useAccount();
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("idle");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("rachel");
  const [transcript, setTranscript] = useState("");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Speak text using ElevenLabs
  const speakText = useCallback(
    async (text: string): Promise<void> => {
      if (!text) return;

      return new Promise((resolve, reject) => {
        (async () => {
          try {
            setVoiceMode("speaking");

            // Stop any currently playing audio
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
            }

            const response = await fetch("/api/voice/synthesize", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                [EMAIL_ACCOUNT_HEADER]: emailAccountId,
              },
              body: JSON.stringify({
                text,
                voiceId: selectedVoice,
              }),
            });

            if (!response.ok) {
              throw new Error("Speech synthesis failed");
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            currentAudioRef.current = audio;

            audio.onended = () => {
              setVoiceMode("idle");
              URL.revokeObjectURL(audioUrl);
              currentAudioRef.current = null;
              resolve();
            };

            audio.onerror = (e) => {
              console.error("Audio playback error", e);
              setVoiceMode("idle");
              URL.revokeObjectURL(audioUrl);
              currentAudioRef.current = null;
              reject(e);
            };

            await audio.play();
          } catch (error) {
            console.error("Error speaking text:", error);
            setVoiceMode("idle");
            resolve(); // Resolve anyway to not block flow
          }
        })();
      });
    },
    [selectedVoice, emailAccountId],
  );

  // Transcribe audio using Deepgram
  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          headers: {
            [EMAIL_ACCOUNT_HEADER]: emailAccountId,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Transcription failed");
        }

        const data = await response.json();
        const transcribedText = data.transcript;

        if (transcribedText && transcribedText.trim()) {
          setTranscript(transcribedText);

          // Send message directly
          chat.sendMessage({
            role: "user",
            parts: [{ type: "text", text: transcribedText }],
          });
        } else {
          toast.error("I didn't catch that. Please try again.");
        }

        setVoiceMode("idle");
      } catch (error) {
        console.error("Error transcribing audio:", error);
        toast.error("Failed to transcribe audio.");
        setVoiceMode("idle");
      }
    },
    [chat, emailAccountId],
  );

  // Start actual recording logic
  const startRecordingInternal = useCallback(async () => {
    try {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Analyser
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyserNode = audioContextRef.current.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        setAnalyser(analyserNode);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setAnalyser(null);

        setVoiceMode("processing");
        // Transcribe the audio
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setVoiceMode("listening");
    } catch (error) {
      console.error("Error starting recording:", error);
      setVoiceMode("idle");
    }
  }, [transcribeAudio]);

  // Initiate voice session (Greeting -> Listening)
  const startListening = useCallback(async () => {
    setIsVoiceEnabled(true);

    // Check if we need to greet
    const today = new Date().toDateString();
    const lastGreetingDate = localStorage.getItem("lastVoiceGreetingDate");
    const hasGreetedToday = lastGreetingDate === today;

    // Get user name from email (simple heuristic)
    const name = userEmail ? userEmail.split("@")[0].split(".")[0] : "there";
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    if (!hasGreetedToday) {
      // First time today
      localStorage.setItem("lastVoiceGreetingDate", today);
      await speakText(`Hello ${capitalizedName}, how can I help you today?`);
      startRecordingInternal();
    } else {
      // Just listen immediately? Or ask short question?
      // User requested: "after that is just ask how can i help"
      // But if I ask "How can I help", I delay listening.
      // Let's assume user wants to speak immediately unless I prompt.
      // Actually, let's follow instruction: "after that is just ask how can i help"
      // This implies speaking first.
      await speakText("How can I help?");
      startRecordingInternal();
    }
  }, [userEmail, speakText, startRecordingInternal]);

  // Stop recording
  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      // State change to processing happens in onstop
    }
  }, []);

  // Auto-speak AI responses when voice is enabled
  useEffect(() => {
    if (!isVoiceEnabled || chat.status !== "ready") return;
    const lastMessage = chat.messages[chat.messages.length - 1];

    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.id !== lastSpokenMessageIdRef.current
    ) {
      lastSpokenMessageIdRef.current = lastMessage.id;

      const textParts = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => ("text" in part ? part.text : ""))
        .join(" ");

      if (textParts) {
        speakText(textParts);
      }
    }
  }, [chat.messages, chat.status, isVoiceEnabled, speakText]);

  // Toggle voice mode
  const toggleVoiceMode = useCallback(() => {
    if (voiceMode === "listening") {
      stopListening();
    } else if (voiceMode === "idle") {
      startListening();
    }
  }, [voiceMode, startListening, stopListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setVoiceMode("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    voiceMode,
    isVoiceEnabled,
    setIsVoiceEnabled,
    selectedVoice,
    setSelectedVoice,
    transcript,
    startListening, // Starts the session (Greeting -> Record)
    stopListening, // Stops recording -> Process
    toggleVoiceMode, // Toggles between startListening / stopListening
    speakText,
    stopSpeaking,
    analyser, // For visualization
  };
}
