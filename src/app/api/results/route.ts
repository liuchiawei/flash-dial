import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Difficulty, Rule } from "@/lib/types";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const rule = searchParams.get("rule");
  try {
    const data = await prisma.gameCompletion.findMany({
      where: {
        difficulty: difficulty as Difficulty,
        rule: rule as Rule,
      },
      orderBy: {
        createdAt: "desc",
      },
      // take: 10,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
