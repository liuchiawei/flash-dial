// src/services/gameService.ts

interface GameResult {
  difficulty: string;
  rule: string;
  completionTime: number;
  timestamp: number;
  playerName?: string; // Optional player name
}

/**
 * Saves a game result to the database
 */
export async function saveGameResult(result: GameResult): Promise<boolean> {
  try {
    const response = await fetch("/api/game-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error("Failed to save game result");
    }

    return true;
  } catch (error) {
    console.error("Error saving game result:", error);
    return false;
  }
}

/**
 * Gets top scores for a specific difficulty and rule
 */
export async function getTopScores(
  difficulty: string,
  rule: string,
  limit = 10
): Promise<GameResult[]> {
  try {
    const response = await fetch(
      `/api/game-results?difficulty=${difficulty}&rule=${rule}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch top scores");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top scores:", error);
    return [];
  }
}
