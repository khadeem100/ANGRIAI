"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Mail,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import type { TodoItemWithDetails } from "@/app/api/user/todos/route";
import {
  updateTodoStatusAction,
  updateSubtaskStatusAction,
} from "@/utils/actions/todos";

const priorityConfig = {
  LOW: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    label: "Low",
  },
  MEDIUM: {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    label: "Medium",
  },
  HIGH: {
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    label: "High",
  },
  URGENT: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "Urgent",
  },
};

export function TodoDetailModal({
  todo,
  open,
  onClose,
  onUpdate,
}: {
  todo: TodoItemWithDetails;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(todo.emailContext);
    setCopied(true);
    toast.success("Email content copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  ) => {
    setUpdatingStatus(true);
    try {
      await updateTodoStatusAction({ todoId: todo.id, status: newStatus });
      toast.success("Status updated");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubtaskToggle = async (
    subtaskId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await updateSubtaskStatusAction({ subtaskId, status: newStatus });
      onUpdate();
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  const completedSubtasks =
    todo.subtasks?.filter((s) => s.status === "COMPLETED").length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl">{todo.title}</DialogTitle>
            <Badge
              variant="outline"
              className={priorityConfig[todo.priority].color}
            >
              {priorityConfig[todo.priority].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={todo.status === "PENDING" ? "default" : "outline"}
              onClick={() => handleStatusChange("PENDING")}
              disabled={updatingStatus}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </Button>
            <Button
              size="sm"
              variant={todo.status === "IN_PROGRESS" ? "default" : "outline"}
              onClick={() => handleStatusChange("IN_PROGRESS")}
              disabled={updatingStatus}
            >
              <Clock className="h-4 w-4 mr-2" />
              In Progress
            </Button>
            <Button
              size="sm"
              variant={todo.status === "COMPLETED" ? "default" : "outline"}
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={updatingStatus}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed
            </Button>
          </div>

          {/* AI Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Summary
            </h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              {todo.aiSummary}
            </p>
          </div>

          {/* Description */}
          {todo.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {todo.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Subtasks</h3>
                <span className="text-sm text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-2">
                {todo.subtasks?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={subtask.status === "COMPLETED"}
                      onCheckedChange={() =>
                        handleSubtaskToggle(subtask.id, subtask.status)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm ${subtask.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}
                      >
                        {subtask.title}
                      </p>
                      {subtask.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {subtask.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Actions Completed */}
          {todo.aiActionsCompleted &&
            Array.isArray(todo.aiActionsCompleted) &&
            todo.aiActionsCompleted.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Actions Already Taken
                </h3>
                <div className="space-y-2">
                  {todo.aiActionsCompleted.map((action: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-green-500/5 border-green-500/20"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {action.action || action.title}
                          </p>
                          {action.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          )}
                          {action.rule && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Rule: {action.rule}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Email Context */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Context
              </h3>
              <Button size="sm" variant="outline" onClick={handleCopyEmail}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30 max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {todo.highlightedText || todo.emailContext}
              </pre>
            </div>

            {todo.threadId && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`/mail?threadId=${todo.threadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Email
                </a>
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(todo.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {todo.dueDate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(todo.dueDate), "PPP")}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
