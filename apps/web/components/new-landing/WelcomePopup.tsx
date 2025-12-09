"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem("welcome-popup-seen");

    // Show popup after 1.5 seconds if not seen
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      localStorage.setItem("welcome-popup-seen", "true");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Welcome from Tynktech!{" "}
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </DialogTitle>
          <DialogDescription>
            A little note from the hearts behind the code.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-base text-muted-foreground leading-relaxed">
            Hello wonderful human! 👋
            <br />
            <br />
            We're the dreamers and builders at Tynktech, and we are absolutely
            thrilled to welcome you to Angri.
            <br />
            <br />
            We built Angri with a simple wish: to give you back your time and
            peace of mind. We've poured our hearts into crafting an experience
            that feels less like software and more like a helpful friend.
            <br />
            <br />
            Thank you for being here. It means the world to us to share this
            journey with you.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Awesome, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
