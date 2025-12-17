"use server";

import { z } from "zod";
import { actionClient } from "@/utils/actions/safe-action";
import prisma from "@/utils/prisma";

export const updateTodoStatusAction = actionClient
  .metadata({ name: "updateTodoStatus" })
  .schema(
    z.object({
      todoId: z.string(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    }),
  )
  .action(
    async ({ parsedInput: { todoId, status }, ctx: { emailAccountId } }) => {
      const todo = await prisma.todoItem.update({
        where: {
          id: todoId,
          emailAccountId,
        },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      return todo;
    },
  );

export const updateSubtaskStatusAction = actionClient
  .metadata({ name: "updateSubtaskStatus" })
  .schema(
    z.object({
      subtaskId: z.string(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    }),
  )
  .action(async ({ parsedInput: { subtaskId, status } }) => {
    const subtask = await prisma.todoSubtask.update({
      where: {
        id: subtaskId,
      },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    return subtask;
  });

export const addTodoNoteAction = actionClient
  .metadata({ name: "addTodoNote" })
  .schema(
    z.object({
      todoId: z.string(),
      notes: z.string(),
    }),
  )
  .action(
    async ({ parsedInput: { todoId, notes }, ctx: { emailAccountId } }) => {
      const todo = await prisma.todoItem.update({
        where: {
          id: todoId,
          emailAccountId,
        },
        data: {
          notes,
        },
      });

      return todo;
    },
  );
