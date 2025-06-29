
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Player = 'X' | 'O' | null;

const TicTacToeGame = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (newBoard: Player[]) => {
    for (const [a, b, c] of winningCombinations) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
    } else if (newBoard.every(cell => cell !== null)) {
      setGameOver(true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        {winner ? (
          <h3 className="text-xl mb-2">Player {winner} Wins!</h3>
        ) : gameOver ? (
          <h3 className="text-xl mb-2">It's a Draw!</h3>
        ) : (
          <h3 className="text-lg mb-2">Player {currentPlayer}'s Turn</h3>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 w-64 h-64">
        {board.map((cell, index) => (
          <button
            key={index}
            className="w-20 h-20 bg-black/20 border border-white/20 rounded-lg text-2xl font-bold hover:bg-white/10 transition-colors"
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
      
      <Button onClick={resetGame} className="mt-4">
        New Game
      </Button>
    </div>
  );
};

export default TicTacToeGame;
