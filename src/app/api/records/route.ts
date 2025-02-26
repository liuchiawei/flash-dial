import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
// import { neon } from "@neondatabase/serverless";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // 儲存完成時間
    const { time } = req.body;
    // database link test
    console.log("Received time:", time);
    if (typeof time !== "number" || time <= 0) {
      return res.status(400).json({ error: "時間無效" });
    }
    await prisma.record.create({
      data: { time },
    });
    console.log("Record saved to database"); // test for record saved 打印紀錄已保存
    return res.status(201).json({ message: "紀錄已保存" });
  } else if (req.method === "GET") {
    // 獲取所有完成時間
    const records = await prisma.record.findMany({
      select: { time: true },
      orderBy: { time: "asc" },
    });
    return res.status(200).json(records.map((r) => r.time));
  } else {
    return res.status(405).json({ error: "不允許的方法" });
  }
}
