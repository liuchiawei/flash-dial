import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // 從請求中獲取資料
    const { userId, completionTime, difficulty, rule } = req.body;

    // 儲存遊戲完成資料
    await prisma.gameCompletion.create({
      data: {
        userId,
        completionTime,
        difficulty,
        rule,
      },
    });

    // 計算比該使用者快的記錄數（包括等於）
    const betterThanCount = await prisma.gameCompletion.count({
      where: {
        difficulty,
        rule,
        completionTime: {
          lte: completionTime,
        },
      },
    });

    // 計算相同難度和規則的總記錄數
    const totalCount = await prisma.gameCompletion.count({
      where: {
        difficulty,
        rule,
      },
    });

    // 計算排名百分比
    const percentage =
      totalCount > 0 ? (betterThanCount / totalCount) * 100 : 0;

    // 回傳百分比
    res.status(200).json({ percentage });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
  // 測試
  console.log("Game completion data saved");
}
