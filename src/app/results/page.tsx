"use client";
import { useEffect, useState } from "react";
import { GameCompletion } from "@prisma/client";

export default function Page() {
  const [data, setData] = useState<GameCompletion[]>([]);
  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  // 日時変換関数
  const formattedDate: (date: string) => string = (date: string) =>
    new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));

  return (
    <div>
      {data.map((item: any) => (
        <div className="flex gap-1" key={item.id}>
          <div>{item.completionTime}</div>
          <div>{item.difficulty}</div>
          <div>{item.rule}</div>
          <div>{formattedDate(item.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}
