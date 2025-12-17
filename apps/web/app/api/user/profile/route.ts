import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/utils/prisma";
import { withAuth } from "@/utils/middleware";

const updateProfileBody = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBody>;

export const PATCH = withAuth("user/profile", async (request) => {
  const userId = request.auth.userId;
  const body = await request.json();

  const result = updateProfileBody.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name } = result.data;

  // Update user name
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json(updatedUser);
});
