// src/app/api/game-results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv"; // Using Vercel KV storage for simplicity
// Note: You'll need to install this with: npm install @vercel/kv
// And configure it according to Vercel's documentation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.difficulty || !body.rule || body.completionTime === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a unique ID for the result
    const id = `game:${Date.now()}:${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Store in KV
    await kv.hset(id, body);

    // Also maintain a sorted set by completion time for each difficulty/rule combination
    const scoreKey = `scores:${body.difficulty}:${body.rule}`;
    await kv.zadd(scoreKey, { score: body.completionTime, member: id });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving game result:", error);
    return NextResponse.json(
      { error: "Failed to save game result" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const rule = searchParams.get("rule");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!difficulty || !rule) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get top scores from sorted set
    const scoreKey = `scores:${difficulty}:${rule}`;
    const topScoreIds = await kv.zrange(scoreKey, 0, limit - 1);

    // Fetch full details for each score
    const results = [];
    for (const id of topScoreIds) {
      const result = await kv.hgetall(id as string);
      if (result) {
        results.push(result);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching game results:", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}
