"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Volume2, X, Square } from "lucide-react";
import { cn } from "@/utils";
import type { VoiceMode } from "@/hooks/useVoiceChat";
import { Tooltip } from "@/components/Tooltip";

interface VoiceButtonProps {
  voiceMode: VoiceMode;
  isVoiceEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function VoiceButton({
  voiceMode,
  isVoiceEnabled,
  onToggle,
  className,
}: VoiceButtonProps) {
  
  // If voice is strictly disabled in settings, we might want to hide this or show a "disabled" state.
  // But for now, let's assume if it's rendered, it's usable.
  
  const handleClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission if inside form
      onToggle();
  }

  if (voiceMode === "listening") {
      return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Tooltip content="Stop recording">
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleClick}
                    className="relative z-10 h-10 w-10 rounded-full shadow-md transition-all hover:scale-105 bg-red-500 hover:bg-red-600"
                >
                    <Square className="size-4 fill-current" />
                    <span className="sr-only">Stop Recording</span>
                </Button>
            </Tooltip>
        </div>
      );
  }

  if (voiceMode === "speaking") {
      return (
        <div className={cn("relative flex items-center justify-center", className)}>
             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20" />
            <Tooltip content="Stop speaking">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClick}
                    className="relative z-10 h-10 w-10 rounded-full border-blue-200 bg-blue-50 text-blue-600 shadow-sm hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                >
                    <X className="size-5" />
                    <span className="sr-only">Stop Speaking</span>
                </Button>
            </Tooltip>
        </div>
      );
  }
  
  if (voiceMode === "processing") {
      return (
        <Button
            variant="ghost"
            size="icon"
            disabled
            className={cn("h-10 w-10 rounded-full", className)}
        >
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="sr-only">Processing...</span>
        </Button>
      );
  }

  return (
    <Tooltip content="Talk to Angri">
        <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
            "h-10 w-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
            className,
        )}
        >
        <Mic className="size-5" />
        <span className="sr-only">Start Voice Chat</span>
        </Button>
    </Tooltip>
  );
}
