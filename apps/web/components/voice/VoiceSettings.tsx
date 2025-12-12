"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  displayName: string;
}

interface VoiceSettingsProps {
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

export function VoiceSettings({
  isVoiceEnabled,
  setIsVoiceEnabled,
  selectedVoice,
  setSelectedVoice,
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/voice/voices");
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="size-5" />
          <span className="sr-only">Voice Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
          <DialogDescription>
            Configure how Angri speaks to you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-enabled">Enable Voice Mode</Label>
              <p className="text-sm text-muted-foreground">
                AI will speak responses automatically
              </p>
            </div>
            <Switch
              id="voice-enabled"
              checked={isVoiceEnabled}
              onCheckedChange={setIsVoiceEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <Select
              value={selectedVoice}
              onValueChange={setSelectedVoice}
              disabled={isLoading || !isVoiceEnabled}
            >
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.name}>
                    {voice.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the voice that Angri will use
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
              How to use Voice Mode
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Click "Talk to me" to start speaking</li>
              <li>• Speak your question or command</li>
              <li>• Click again to stop and send</li>
              <li>• Angri will respond with voice and text</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
