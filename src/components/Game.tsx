"use client";

import { useState, useEffect, useRef } from "react";
import GameBoard from "./GameBoard";
import { Icon } from "@iconify/react";
import { Difficulty, Rule, DifficultyConfig } from "@/lib/types";

const difficulties: Record<Difficulty, DifficultyConfig> = {
  easy: { size: 3, max: 9 },
  medium: { size: 5, max: 25 },
  hard: { size: 7, max: 49 },
  crazy: { size: 10, max: 100 },
};

const ruleLabels: Record<Rule, string> = {
  // 日本語に変換しました
  sequence: "順番",
  odd: "奇数",
  even: "偶数",
  prime: "素数",
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
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // タッチスクロールを無効化
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
  }, []);

  // 素数判定関数
  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  // ターゲットシーケンス生成
  const generateTargetSequence = (max: number, rule: Rule): number[] => {
    const allNumbers = Array.from({ length: max }, (_, i) => i + 1);
    return allNumbers.filter((num) => {
      if (rule === "odd") return num % 2 === 1;
      if (rule === "even") return num % 2 === 0;
      if (rule === "prime") return isPrime(num);
      return true; // sequence
    });
  };

  // 数字をランダムに配置
  const shuffleNumbers = (): number[] => {
    const { max } = difficulties[difficulty];
    const nums = Array.from({ length: max }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  };

  // ゲーム開始またはリセット
  const startGame = () => {
    const shuffled = shuffleNumbers();
    setNumbers(shuffled);
    setNextExpectedIndex(0);
    setTimer(0);
    setStartTime(Date.now());
    setIsPlaying(true);
    setIsGameOver(false);
    setWrongClick(null);

    // ベストタイム読み込み
    const storedBest = localStorage.getItem(`bestTime_${difficulty}_${rule}`);
    setBestTime(storedBest ? parseFloat(storedBest) : null);
  };

  // ゲーム結果記録
  const recordGame = () => {
    const completionTime = parseFloat(timer.toString());
    const userId = "anonymous";
    if (userId) {
      fetch("/api/record", {
        method: "POST",
        body: JSON.stringify({ userId, completionTime, difficulty, rule }),
      });
    }
  };

  // isPlaying イベント
  useEffect(() => {
    if (isPlaying) {
      // タイマー開始
      const interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTimer(((Date.now() - (startTime || 0)) / 1000).toFixed(2) as any);
      }, 50);

      // タッチスクロールを無効化
      const container = containerRef.current;
      if (container) {
        const handleTouchMove = (e: TouchEvent) => {
          e.preventDefault();
        };
        container.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });

        return () => {
          clearInterval(interval);
          container.removeEventListener("touchmove", handleTouchMove);
        };
      }
    }
  }, [isPlaying, startTime]);

  // ゲーム完了チェックとベストタイム更新
  useEffect(() => {
    const targetSequence = generateTargetSequence(
      difficulties[difficulty].max,
      rule
    );
    // ゲーム完了
    if (nextExpectedIndex >= targetSequence.length && isPlaying) {
      setIsPlaying(false);
      setIsGameOver(true);
      const currentTime = parseFloat(timer.toString());
      const storedBest = localStorage.getItem(`bestTime_${difficulty}_${rule}`);
      const best = storedBest ? parseFloat(storedBest) : Infinity;
      // ベストタイム更新
      if (currentTime < best) {
        localStorage.setItem(
          `bestTime_${difficulty}_${rule}`,
          currentTime.toString()
        );
        setBestTime(currentTime);
      }
      // ゲーム結果記録
      recordGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextExpectedIndex, isPlaying, difficulty, rule, timer]);

  useEffect(() => {
    setNumbers(shuffleNumbers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, rule]);

  // クリックイベント処理
  const handleClick = (number: number) => {
    if (!isPlaying) return;
    const targetSequence = generateTargetSequence(
      difficulties[difficulty].max,
      rule
    );
    // クリックした数字がターゲットシーケンスの次の数字の場合、次の期待インデックスを更新
    if (number === targetSequence[nextExpectedIndex]) {
      setNextExpectedIndex((prev) => prev + 1);
      setWrongClick(null);
    } else {
      // クリックした数字がターゲットシーケンスの次の数字でない場合、エラークリックを設定
      setWrongClick(number);
      setTimeout(() => setWrongClick(null), 300); // 0.3秒後にクリア
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-svh w-full p-4 gap-4"
      ref={containerRef}
    >
      {/* Title Section タイトル */}
      {!isPlaying && !numbers.length && (
        <p className="text-gray-500 text-justify">
          これは反応訓練ゲームです。画面の数字を小さい順にクリックしてください。
        </p>
      )}
      {/* Difficulty and Rule Selection Section 難易度とルール選択 */}
      {!isPlaying && (
        <div className="flex gap-4 *:cursor-pointer">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="p-2 border rounded bg-gray-800"
            disabled={isPlaying}
            title="難易度"
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
            title="ルール"
          >
            {Object.entries(ruleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Time Display Section 時間とベストタイム表示 */}
      {(isPlaying ||
        nextExpectedIndex >=
          generateTargetSequence(difficulties[difficulty].max, rule)
            .length) && (
        <div className="flex flex-col items-center justify-center gap-1">
          {isPlaying ? (
            <div className="text-xl">タイム：{timer} 秒</div>
          ) : (
            // Game Completion Message Section ゲーム完了メッセージ
            <div className="text-lg font-bold text-center">
              おめでとうございます！{timer} 秒でクリアしました。
            </div>
          )}
          <div className="text-gray-500">
            ベストタイム：{bestTime !== null ? `${bestTime} 秒` : "まだ記録されていません"}
          </div>
        </div>
      )}

      {/* Game Board Section ゲームボード */}
      {numbers.length === 0 ? (
        <div className="text-xl">「スタート」をクリックしてください</div>
      ) : (
        <GameBoard
          numbers={numbers}
          handleClick={handleClick}
          isPlaying={isPlaying}
          isGameOver={isGameOver}
          targetSequence={generateTargetSequence(
            difficulties[difficulty].max,
            rule
          )}
          nextExpectedIndex={nextExpectedIndex}
          wrongClick={wrongClick}
          size={difficulties[difficulty].size}
        />
      )}

      {/* Start Button Section スタートボタン */}
      <button
        title={isPlaying ? "ストップ" : "スタート"}
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
