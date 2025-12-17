"use client";

import { useEffect, useState } from "react";
import { HistoryIcon, Loader2, PlusIcon, Settings2, Brain } from "lucide-react";
import { Messages } from "./messages";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats } from "@/hooks/useChats";
import { LoadingContent } from "@/components/LoadingContent";
import { ExamplesDialog } from "@/components/assistant-chat/examples-dialog";
import { Tooltip } from "@/components/Tooltip";
import { useChat } from "@/providers/ChatProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocalStorage } from "usehooks-ts";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError } from "@/components/Toast";
import { useAccount } from "@/providers/EmailAccountProvider";
import { fetchWithAccount } from "@/utils/fetch";

const MAX_MESSAGES = 200;

export function Chat() {
  const {
    chat,
    chatId,
    input,
    setInput,
    handleSubmit,
    setNewChat,
    context,
    setContext,
  } = useChat();
  const { messages, status, stop, regenerate, setMessages } = chat;
  const { emailAccountId } = useAccount();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    "",
  );
  const [learningConsent, setLearningConsent] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch learning consent status
  const fetchLearningStatus = async () => {
    try {
      const res = await fetchWithAccount({
        url: "/api/user/ai-learning-consent",
        emailAccountId,
      });
      const data = await res.json();
      setLearningConsent(data.consent ?? false);
    } catch (error) {
      console.error("Error fetching consent:", error);
    }
  };

  useEffect(() => {
    if (emailAccountId) {
      fetchLearningStatus();

      // Poll every 5 seconds to keep in sync
      const interval = setInterval(fetchLearningStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [emailAccountId]);

  const handleToggleLearning = async (enabled: boolean) => {
    try {
      const response = await fetchWithAccount({
        url: "/api/user/ai-learning-consent",
        emailAccountId,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent: enabled }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        toastError({
          title: "Failed to update learning settings",
          description: "Please try again or check your connection.",
        });
        throw new Error(
          `Failed to update learning consent: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("Learning consent updated:", result);

      // Update local state immediately
      setLearningConsent(enabled);

      // Fetch again to confirm
      await fetchLearningStatus();

      toastSuccess({
        description: enabled
          ? "Learning enabled! Jenn will now learn from your conversations."
          : "Learning disabled. Jenn will not collect training data.",
      });
    } catch (error) {
      console.error("Error updating learning consent:", error);
      // Revert on error
      await fetchLearningStatus();
    }
  };

  useEffect(() => {
    if (!chatId) {
      setNewChat();
    }
  }, [chatId, setNewChat]);

  // Sync input with localStorage
  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  // Load from localStorage on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run on mount
  useEffect(() => {
    if (localStorageInput) {
      setInput(localStorageInput);
    }
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col bg-gradient-to-t from-blue-100 from-0% via-blue-100/30 via-10% to-transparent to-25% dark:bg-background">
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <SidebarTrigger name="chat-sidebar" />
          {messages.length > MAX_MESSAGES ? (
            <div className="rounded-md border border-red-200 bg-red-100 p-2 text-sm text-red-800">
              The chat is too long. Please start a new conversation.
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <NewChatButton />
          <ExamplesDialog setInput={setInput} />
          <ChatHistoryDropdown />
        </div>
      </div>

      <Messages
        status={status}
        messages={messages}
        setMessages={setMessages}
        setInput={setInput}
        regenerate={regenerate}
        isArtifactVisible={false}
      />

      <div className="mx-auto w-full px-4 pb-4 md:max-w-3xl md:pb-6">
        {context ? (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Fix: {context.message.headers.subject.slice(0, 60)}
              {context.message.headers.subject.length > 60 ? "..." : ""}
              <button
                type="button"
                aria-label="Remove context"
                className="ml-1 rounded p-0.5 hover:bg-muted-foreground/10"
                onClick={() => setContext(null)}
              >
                ×
              </button>
            </span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <PromptInputBox
              onSend={(message, files) => {
                if (message.trim() && status === "ready") {
                  // Directly send the message using chat.sendMessage
                  chat.sendMessage({
                    role: "user",
                    parts: [
                      {
                        type: "text",
                        text: message.trim(),
                      },
                    ],
                  });
                  setLocalStorageInput("");
                }
              }}
              isLoading={status === "streaming" || status === "submitted"}
              placeholder="Ask me anything about your emails..."
            />
          </div>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Chat Settings
                </DialogTitle>
                <DialogDescription>
                  Configure how Jenn learns from your conversations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="learning-mode"
                      className="text-base font-medium"
                    >
                      Enable Learning
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow Jenn to learn from your conversations to improve
                      responses over time.
                      {learningConsent &&
                        " Training data is stored securely on your server."}
                    </p>
                  </div>
                  <Switch
                    id="learning-mode"
                    checked={learningConsent}
                    onCheckedChange={handleToggleLearning}
                  />
                </div>

                {learningConsent && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Learning Active</p>
                        <p className="text-xs text-muted-foreground">
                          Jenn is collecting training data from your
                          conversations to continuously improve. All data stays
                          on your server and is used only for fine-tuning your
                          AI model.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function NewChatButton() {
  const { setNewChat } = useChat();

  return (
    <Tooltip content="Start a new conversation">
      <Button variant="ghost" size="icon" onClick={setNewChat}>
        <PlusIcon className="size-5" />
        <span className="sr-only">New Chat</span>
      </Button>
    </Tooltip>
  );
}

function ChatHistoryDropdown() {
  const { setChatId } = useChat();
  const [shouldLoadChats, setShouldLoadChats] = useState(false);
  const { data, error, isLoading, mutate } = useChats(shouldLoadChats);

  return (
    <DropdownMenu>
      <Tooltip content="View previous conversations">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onMouseEnter={() => setShouldLoadChats(true)}
            onClick={() => mutate()}
          >
            <HistoryIcon className="size-5" />
            <span className="sr-only">Chat History</span>
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <LoadingContent
          loading={isLoading}
          error={error}
          loadingComponent={
            <DropdownMenuItem
              disabled
              className="flex items-center justify-center"
            >
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading chats...
            </DropdownMenuItem>
          }
          errorComponent={
            <DropdownMenuItem disabled>Error loading chats</DropdownMenuItem>
          }
        >
          {data && data.chats.length > 0 ? (
            data.chats.map((chatItem) => (
              <DropdownMenuItem
                key={chatItem.id}
                onSelect={() => {
                  setChatId(chatItem.id);
                }}
              >
                {`Chat from ${new Date(chatItem.createdAt).toLocaleString()}`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              No previous chats found
            </DropdownMenuItem>
          )}
        </LoadingContent>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
