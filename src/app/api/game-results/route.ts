// src/app/api/game-results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

// Initialize the database on the first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    const body = await request.json();

    // Validate required fields
    if (!body.difficulty || !body.rule || body.completionTime === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the game result into the database
    const result = await sql`
      INSERT INTO game_results 
        (difficulty, rule, completion_time, player_name, timestamp)
      VALUES 
        (${body.difficulty}, ${body.rule}, ${body.completionTime}, ${
      body.playerName || "匿名玩家"
    }, ${body.timestamp})
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      id: result[0].id,
    });
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
    await ensureDbInitialized();

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

    // Get top scores ordered by completion time (ascending)
    const results = await sql`
      SELECT 
        id, 
        difficulty, 
        rule, 
        completion_time AS "completionTime", 
        player_name AS "playerName", 
        timestamp
      FROM 
        game_results
      WHERE 
        difficulty = ${difficulty} AND rule = ${rule}
      ORDER BY 
        completion_time ASC
      LIMIT 
        ${limit}
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching game results:", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}
