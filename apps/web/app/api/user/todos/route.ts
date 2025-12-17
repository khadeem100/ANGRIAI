import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { withAuth } from "@/utils/middleware";

export type TodoItemWithDetails = Awaited<ReturnType<typeof getTodos>>[number];

async function getTodos({ emailAccountId }: { emailAccountId: string }) {
  const todos = await prisma.todoItem.findMany({
    where: {
      emailAccountId,
    },
    include: {
      subtasks: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  return todos;
}

export const GET = withAuth("user/todos", async (request) => {
  const { userId } = request.auth;
  
  // Get all email accounts for the user and their todos
  const emailAccounts = await prisma.emailAccount.findMany({
    where: { userId },
    select: { id: true },
  });
  
  const allTodos = await Promise.all(
    emailAccounts.map(account => getTodos({ emailAccountId: account.id }))
  );
  
  const todos = allTodos.flat();

  return NextResponse.json(todos);
});
