"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeading } from "@/components/Typography";
import { CheckCircle2, Clock, ListTodo, AlertCircle } from "lucide-react";
import { LoadingContent } from "@/components/LoadingContent";
import { TodoCard } from "./TodoCard";
import { TodoDetailModal } from "./TodoDetailModal";
import type { TodoItemWithDetails } from "@/app/api/user/todos/route";

export function TodosContent() {
  const {
    data: todos,
    isLoading,
    mutate,
  } = useSWR<TodoItemWithDetails[]>("/api/user/todos");
  const [selectedTodo, setSelectedTodo] = useState<TodoItemWithDetails | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("pending");

  if (isLoading) {
    return (
      <LoadingContent loading={true}>
        Loading your to-do items...
      </LoadingContent>
    );
  }

  const pendingTodos = todos?.filter((t) => t.status === "PENDING") || [];
  const inProgressTodos =
    todos?.filter((t) => t.status === "IN_PROGRESS") || [];
  const completedTodos = todos?.filter((t) => t.status === "COMPLETED") || [];
  const allTodos = todos || [];

  const stats = {
    total: allTodos.length,
    pending: pendingTodos.length,
    inProgress: inProgressTodos.length,
    completed: completedTodos.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <PageHeading>AI To-Do List</PageHeading>
          <p className="text-muted-foreground mt-1">
            Tasks and action items automatically extracted from your emails
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ListTodo className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({stats.inProgress})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <TodoList todos={pendingTodos} onSelectTodo={setSelectedTodo} />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <TodoList todos={inProgressTodos} onSelectTodo={setSelectedTodo} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TodoList todos={completedTodos} onSelectTodo={setSelectedTodo} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <TodoList todos={allTodos} onSelectTodo={setSelectedTodo} />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          open={!!selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdate={mutate}
        />
      )}
    </div>
  );
}

function TodoList({
  todos,
  onSelectTodo,
}: {
  todos: TodoItemWithDetails[];
  onSelectTodo: (todo: TodoItemWithDetails) => void;
}) {
  if (todos.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            AI will automatically create tasks from your emails
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onClick={() => onSelectTodo(todo)}
        />
      ))}
    </div>
  );
}
