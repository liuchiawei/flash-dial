import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.gameCompletion.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

