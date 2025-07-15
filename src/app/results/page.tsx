"use client";
import { useEffect, useState } from "react";
import { GameCompletion, Difficulty, Rule } from "@/lib/types";
import AreaChartBoard from "@/components/AreaChartBoard";

export default function Page() {
  const [data, setData] = useState<GameCompletion[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [rule, setRule] = useState<Rule>("sequence");

  useEffect(() => {
    fetch(`/api/results?difficulty=${difficulty}&rule=${rule}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [difficulty, rule]);

  // 日時変換関数
  const formattedDate: (date: string) => string = (date: string) =>
    new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));

  return (
    <div>
      <div className="flex gap-2 *:bg-gray-800">
        <select
          title="difficulty"
          name="difficulty"
          id="difficulty"
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty);
          }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="crazy">Crazy</option>
        </select>
        <select
          title="rule"
          name="rule"
          id="rule"
          onChange={(e) => {
            setRule(e.target.value as Rule);
          }}
        >
          <option value="sequence">Sequence</option>
          <option value="odd">Odd</option>
          <option value="even">Even</option>
          <option value="prime">Prime</option>
        </select>
      </div>
      <h1 className="text-2xl font-bold">
        {difficulty} | {rule}
      </h1>
      {/* TODO: AreaChartBoardのデータをdataに変更する */}
      {data.length > 0 && <AreaChartBoard data={data} />}

      {data.map((item: GameCompletion) => (
        <div className="flex gap-1" key={item.id}>
          <div>{item.completionTime}</div>
          <div>{item.difficulty}</div>
          <div>{item.rule}</div>
          <div>{formattedDate(item.createdAt.toString())}</div>
        </div>
      ))}
    </div>
  );
}
