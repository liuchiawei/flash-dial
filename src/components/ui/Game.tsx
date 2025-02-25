"use client";

import { useState, useEffect } from "react";
import GameBoard from "./GameBaord";
import { Icon } from "@iconify/react";

// 定義難度和規則的類型
type Difficulty = "easy" | "medium" | "hard" | "crazy";
type Rule = "sequence" | "odd" | "even" | "prime";

interface DifficultyConfig {
  size: number;
  max: number;
}

const difficulties: Record<Difficulty, DifficultyConfig> = {
  easy: { size: 3, max: 9 },
  medium: { size: 5, max: 25 },
  hard: { size: 7, max: 49 },
  crazy: { size: 10, max: 100 },
};

const ruleLabels: Record<Rule, string> = {
  sequence: "依序",
  odd: "奇數",
  even: "偶數",
  prime: "質數",
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [rule, setRule] = useState<Rule>("sequence");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextExpectedIndex, setNextExpectedIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [wrongClick, setWrongClick] = useState<number | null>(null);

  // 質數檢查函數
  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  // 生成目標序列
  const generateTargetSequence = (max: number, rule: Rule): number[] => {
    const allNumbers = Array.from({ length: max }, (_, i) => i + 1);
    return allNumbers.filter((num) => {
      if (rule === "odd") return num % 2 === 1;
      if (rule === "even") return num % 2 === 0;
      if (rule === "prime") return isPrime(num);
      return true; // sequence
    });
  };

  // 隨機排列數字
  const shuffleNumbers = (): number[] => {
    const { max } = difficulties[difficulty];
    const nums = Array.from({ length: max }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  };

  // 開始或重置遊戲
  const startGame = () => {
    const shuffled = shuffleNumbers();
    setNumbers(shuffled);
    setNextExpectedIndex(0);
    setTimer(0);
    setStartTime(Date.now());
    setIsPlaying(true);
    setWrongClick(null);

    // 載入最佳時間
    const storedBest = localStorage.getItem(`bestTime_${difficulty}_${rule}`);
    setBestTime(storedBest ? parseFloat(storedBest) : null);
  };

  // 計時器邏輯
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTimer(((Date.now() - (startTime || 0)) / 1000).toFixed(2) as any);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, startTime]);

  // 檢查遊戲是否完成並更新最佳時間
  useEffect(() => {
    const targetSequence = generateTargetSequence(
      difficulties[difficulty].max,
      rule
    );
    if (nextExpectedIndex >= targetSequence.length && isPlaying) {
      setIsPlaying(false);
      const currentTime = parseFloat(timer.toString());
      const storedBest = localStorage.getItem(`bestTime_${difficulty}_${rule}`);
      const best = storedBest ? parseFloat(storedBest) : Infinity;
      if (currentTime < best) {
        localStorage.setItem(
          `bestTime_${difficulty}_${rule}`,
          currentTime.toString()
        );
        setBestTime(currentTime);
      }
    }
  }, [nextExpectedIndex, isPlaying, difficulty, rule, timer]);

  useEffect(() => {
    setNumbers(shuffleNumbers());
  }, [difficulty, rule]);

  // 處理點擊事件
  const handleClick = (number: number) => {
    if (!isPlaying) return;
    const targetSequence = generateTargetSequence(
      difficulties[difficulty].max,
      rule
    );
    // 如果點擊的數字是目標序列的下一個數字，則更新下一個預期索引
    if (number === targetSequence[nextExpectedIndex]) {
      setNextExpectedIndex((prev) => prev + 1);
      setWrongClick(null);
    } else {
      // 如果點擊的數字不是目標序列的下一個數字，則設置錯誤點擊
      setWrongClick(number);
      setTimeout(() => setWrongClick(null), 300); // 震動0.3秒後清除
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-svh w-full bg-linear-140 from-slate-800 to-gray-900 p-4 gap-4 text-gray-50">
      {/* Title Section 標題 */}
      {!isPlaying && !numbers.length && (
        <p className="text-gray-500 text-justify">
          這是一個反應訓練小遊戲，請由小到大依序點擊畫面中的數字
        </p>
      )}
      {/* Difficulty and Rule Selection Section 顯示難度和規則選擇 */}
      {!isPlaying && (
        <div className="flex gap-4 *:cursor-pointer">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="p-2 border rounded bg-gray-800"
            disabled={isPlaying}
            title="難度"
          >
            <option value="easy">S (3x3)</option>
            <option value="medium">M (5x5)</option>
            <option value="hard">L (7x7)</option>
            <option value="crazy">XL (10x10)</option>
          </select>
          <select
            value={rule}
            onChange={(e) => setRule(e.target.value as Rule)}
            className="p-2 border rounded bg-gray-800"
            disabled={isPlaying}
            title="規則"
          >
            {Object.entries(ruleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Time Display Section 顯示時間和最佳時間 */}
      {(isPlaying ||
        nextExpectedIndex >=
          generateTargetSequence(difficulties[difficulty].max, rule)
            .length) && (
        <div className="flex flex-col items-center justify-center gap-1">
          {isPlaying ? (
            <div className="text-xl">時間：{timer} 秒</div>
          ) : (
            // Game Completion Message Section 顯示遊戲完成訊息
            <div className="text-lg font-bold text-center">
              恭喜！你在 {timer} 秒內完成。
            </div>
          )}
          <div className="text-gray-500">
            最佳時間：{bestTime !== null ? `${bestTime} 秒` : "尚未記錄"}
          </div>
        </div>
      )}

      {/* Game Board Section 遊戲面板 */}
      {numbers.length === 0 ? (
        <div className="text-xl">請點擊「開始遊戲」開始</div>
      ) : (
        <GameBoard
          numbers={numbers}
          handleClick={handleClick}
          isPlaying={isPlaying}
          targetSequence={generateTargetSequence(
            difficulties[difficulty].max,
            rule
          )}
          nextExpectedIndex={nextExpectedIndex}
          wrongClick={wrongClick}
          size={difficulties[difficulty].size}
        />
      )}

      {/* Start Button Section 開始按鈕 */}
      <button
        onClick={isPlaying ? () => setIsPlaying(false) : startGame}
        className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600 cursor-pointer"
      >
        {isPlaying ? (
          <Icon icon="material-symbols:stop-rounded" width="24" height="24" />
        ) : (
          <Icon icon="material-symbols:replay-rounded" width="24" height="24" />
        )}
      </button>
    </div>
  );
}
