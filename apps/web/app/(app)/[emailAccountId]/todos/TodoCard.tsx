"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TodoItemWithDetails } from "@/app/api/user/todos/route";

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

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-500" },
  IN_PROGRESS: { icon: AlertTriangle, color: "text-orange-500" },
  COMPLETED: { icon: CheckCircle2, color: "text-green-500" },
  CANCELLED: { icon: Clock, color: "text-gray-500" },
};

export function TodoCard({
  todo,
  onClick,
}: {
  todo: TodoItemWithDetails;
  onClick: () => void;
}) {
  const StatusIcon = statusConfig[todo.status].icon;
  const priorityStyle = priorityConfig[todo.priority];

  const completedSubtasks =
    todo.subtasks?.filter((s) => s.status === "COMPLETED").length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {todo.title}
            </h3>
          </div>
          <Badge variant="outline" className={priorityStyle.color}>
            {priorityStyle.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* AI Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {todo.aiSummary}
        </p>

        {/* Subtasks Progress */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {completedSubtasks}/{totalSubtasks} subtasks completed
            </span>
          </div>
        )}

        {/* AI Actions Badge */}
        {todo.aiActionsCompleted &&
          Array.isArray(todo.aiActionsCompleted) &&
          todo.aiActionsCompleted.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {todo.aiActionsCompleted.length} AI action
                {todo.aiActionsCompleted.length > 1 ? "s" : ""} taken
              </Badge>
            </div>
          )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusIcon
              className={`h-4 w-4 ${statusConfig[todo.status].color}`}
            />
            <span className="capitalize">
              {todo.status.toLowerCase().replace("_", " ")}
            </span>
          </div>

          {todo.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(todo.dueDate), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
