interface GameBoardProps {
  numbers: number[];
  handleClick: (number: number) => void;
  isPlaying: boolean;
  targetSequence: number[];
  nextExpectedIndex: number;
  wrongClick: number | null;
  size: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
  numbers,
  handleClick,
  isPlaying,
  targetSequence,
  nextExpectedIndex,
  wrongClick,
  size,
}) => {
  return (
    <div
      className={`w-full max-w-4xl h-2/3 grid gap-1 ${
        size === 10
          ? "grid-cols-10"
          : size === 7
          ? "grid-cols-7"
          : size === 5
          ? "grid-cols-5"
          : "grid-cols-3"
      }`}
    >
      {numbers.map((number) => {
        // const isTarget = targetSequence.includes(number);
        const isClicked =
          targetSequence.indexOf(number) < nextExpectedIndex &&
          targetSequence.includes(number);
        const isWrong = wrongClick === number;

        return (
          <button
            key={number}
            onClick={() => handleClick(number)}
            disabled={!isPlaying || !targetSequence.includes(number)}
            className={`w-full h-full text-white text-lg font-bold rounded-lg flex items-center justify-center transition-all 
              ${
                isClicked
                  ? "bg-teal-500"
                  : isPlaying
                  ? "bg-gray-600 cursor-pointer active:translate-y-[1px] active:inset-shadow-sm"
                  : "bg-gray-500"
              }
              ${isWrong ? "bg-red-400" : ""}`}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

export default GameBoard;
