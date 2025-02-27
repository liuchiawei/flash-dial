import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { completionTime, difficulty, rule, userId } = await request.json();
  const data = await prisma.gameCompletion.create({
    data: { userId, completionTime, difficulty, rule },
  });
  return NextResponse.json(data);
}
