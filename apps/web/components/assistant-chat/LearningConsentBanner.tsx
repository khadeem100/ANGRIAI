"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Brain, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LearningConsentBannerProps {
  hasConsent: boolean | null;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
}

export function LearningConsentBanner({
  hasConsent,
  onAccept,
  onDecline,
}: LearningConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(
    hasConsent === null || hasConsent === false,
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isVisible || hasConsent === true) return null;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept();
      setIsVisible(false);
    } catch (error) {
      console.error("Error accepting consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await onDecline();
      setIsVisible(false);
    } catch (error) {
      console.error("Error declining consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-3xl px-4 pb-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-white p-6 shadow-lg dark:border-purple-800 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-background">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 opacity-10">
              <Brain className="h-full w-full text-purple-500" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-purple-100 dark:hover:bg-purple-900/50"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            <div className="relative">
              {/* Icon */}
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/50">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Help Jenn Learn & Improve
                </h3>
              </div>

              {/* Content */}
              <div className="mb-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Jenn</strong> can become smarter and more helpful by
                  learning from your conversations!
                </p>
                <p>By enabling learning, you allow Jenn to:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Understand your communication style better</li>
                  <li>Improve email automation accuracy</li>
                  <li>Learn from successful rule executions</li>
                  <li>Provide more personalized assistance</li>
                </ul>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Your data stays on your server and is used only to
                  fine-tune your custom AI model. No data is shared with
                  external services.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Yes, Help Jenn Learn
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={isLoading}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
