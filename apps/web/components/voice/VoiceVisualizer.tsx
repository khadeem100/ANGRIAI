"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils";

interface VoiceVisualizerProps {
  state: "idle" | "listening" | "processing" | "speaking";
  analyser?: AnalyserNode | null;
  className?: string;
  barColor?: string;
}

export function VoiceVisualizer({
  state,
  analyser,
  className,
  barColor = "#3b82f6",
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state === "idle" || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bars = 30; // Increased number of bars for sleeker look
    const barWidth = rect.width / bars;
    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = analyser ? new Uint8Array(bufferLength) : null;
    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (state === "listening" && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      const centerY = rect.height / 2;

      for (let i = 0; i < bars; i++) {
        let height = 2;

        if (state === "processing") {
          // pulsing loading animation
          height = 4 + Math.sin(phase + i * 0.5) * 4;
        } else if (state === "listening" && analyser && dataArray) {
          // Real audio visualization
          // Map bar index to frequency bin (focus on vocal range)
          // Bin index calculation to spread the frequencies better
          const binIndex = Math.floor((i / bars) * (bufferLength / 4)); // focus on lower 1/4 of spectrum
          const value = dataArray[binIndex] || 0;
          // Scale height
          height = 4 + (value / 255) * (rect.height * 0.8);
        } else if (state === "speaking") {
          // Fake speaking waveform
          height =
            4 +
            Math.sin(phase * 0.2 + i * 0.5) * (Math.sin(phase * 0.1) * 10 + 15);
        }

        // Mirror the bars around the center
        const x = i * barWidth;
        const y = centerY - height / 2;

        // Rounded caps
        ctx.fillStyle = barColor;
        ctx.beginPath();
        // @ts-ignore - roundRect is new
        if (ctx.roundRect) {
          // @ts-ignore
          ctx.roundRect(x + 1, y, barWidth - 2, height, 4);
        } else {
          ctx.rect(x + 1, y, barWidth - 2, height);
        }
        ctx.fill();
      }

      phase += 0.2;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [state, analyser, barColor]);

  if (state === "idle") return null;

  return (
    <div
      className={cn("flex items-center justify-center h-12 w-full", className)}
    >
      <canvas ref={canvasRef} className="h-full w-full rounded-md opacity-90" />
    </div>
  );
}
