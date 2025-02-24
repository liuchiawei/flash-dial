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
      className={`w-full max-w-xl h-96 grid gap-1 ${
        size === 7 ? "grid-cols-7" : size === 5 ? "grid-cols-5" : "grid-cols-3"
      }`}
    >
      {numbers.map((number) => {
        const isTarget = targetSequence.includes(number);
        const isClicked = targetSequence.indexOf(number) < nextExpectedIndex;
        const isWrong = wrongClick === number;

        return (
          <button
            key={number}
            onClick={() => handleClick(number)}
            disabled={!isPlaying || !isTarget}
            className={`w-full h-full text-white text-lg font-bold rounded flex items-center justify-center transition-all cursor-pointer
              ${
                isClicked
                  ? "bg-green-500"
                  : isTarget && isPlaying
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }
              ${isWrong ? "animate-shake" : ""}`}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

export default GameBoard;
