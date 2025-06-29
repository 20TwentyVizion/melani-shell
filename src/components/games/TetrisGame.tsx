
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: { type: 'I', shape: [[1, 1, 1, 1]], color: '#00fff2' },
  O: { type: 'O', shape: [[1, 1], [1, 1]], color: '#ffd700' },
  T: { type: 'T', shape: [[0, 1, 0], [1, 1, 1]], color: '#ff00ff' },
  S: { type: 'S', shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
  Z: { type: 'Z', shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
  J: { type: 'J', shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' },
  L: { type: 'L', shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }
};

interface GamePiece {
  tetromino: Tetromino;
  x: number;
  y: number;
  rotation: number;
}

const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<(string | null)[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<GamePiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [dropTime, setDropTime] = useState(1000);

  const getRandomTetromino = (): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return TETROMINOES[randomType];
  };

  const rotatePiece = (shape: number[][]): number[][] => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j];
      }
    }
    return rotated;
  };

  const isValidPosition = useCallback((piece: GamePiece, board: (string | null)[][], offsetX = 0, offsetY = 0) => {
    const shape = piece.tetromino.shape;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = piece.x + col + offsetX;
          const newY = piece.y + row + offsetY;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: GamePiece, board: (string | null)[][]) => {
    const newBoard = board.map(row => [...row]);
    const shape = piece.tetromino.shape;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardY = piece.y + row;
          const boardX = piece.x + col;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.tetromino.color;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((board: (string | null)[][]) => {
    const newBoard = [];
    let clearedCount = 0;
    
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      if (board[row].every(cell => cell !== null)) {
        clearedCount++;
      } else {
        newBoard.push([...board[row]]);
      }
    }
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    return { board: newBoard, linesCleared: clearedCount };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const newTetromino = getRandomTetromino();
    const newPiece: GamePiece = {
      tetromino: newTetromino,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newTetromino.shape[0].length / 2),
      y: 0,
      rotation: 0
    };
    
    if (!isValidPosition(newPiece, board)) {
      setGameOver(true);
      return null;
    }
    
    return newPiece;
  }, [board, isValidPosition]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    if (isValidPosition(currentPiece, board, 0, 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      const newBoard = placePiece(currentPiece, board);
      const { board: clearedBoard, linesCleared: cleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLinesCleared(prev => prev + cleared);
      setScore(prev => prev + cleared * 100 * level);
      setLevel(Math.floor((linesCleared + cleared) / 10) + 1);
      
      const newPiece = spawnNewPiece();
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, gameOver, isPaused, isValidPosition, placePiece, clearLines, level, linesCleared, spawnNewPiece]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameOver || isPaused) return;

    const offsetX = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const offsetY = direction === 'down' ? 1 : 0;

    if (isValidPosition(currentPiece, board, offsetX, offsetY)) {
      setCurrentPiece(prev => prev ? {
        ...prev,
        x: prev.x + offsetX,
        y: prev.y + offsetY
      } : null);
    }
  }, [currentPiece, board, gameOver, isPaused, isValidPosition]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedShape = rotatePiece(currentPiece.tetromino.shape);
    const rotatedPiece = {
      ...currentPiece,
      tetromino: { ...currentPiece.tetromino, shape: rotatedShape }
    };

    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gameOver, isPaused, isValidPosition]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      dropPiece();
    }, dropTime);

    return () => clearInterval(interval);
  }, [dropPiece, dropTime]);

  // Update drop time based on level
  useEffect(() => {
    setDropTime(Math.max(100, 1000 - (level - 1) * 100));
  }, [level]);

  // Initialize first piece
  useEffect(() => {
    if (!currentPiece && !gameOver && !isPaused) {
      setCurrentPiece(spawnNewPiece());
    }
  }, [currentPiece, gameOver, isPaused, spawnNewPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left');
          break;
        case 'ArrowRight':
          movePiece('right');
          break;
        case 'ArrowDown':
          movePiece('down');
          break;
        case 'ArrowUp':
          rotatePieceHandler();
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceHandler]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    // Draw board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (board[row][col]) {
          ctx.fillStyle = board[row][col] as string;
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.tetromino.color;
      const shape = currentPiece.tetromino.shape;
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            ctx.fillRect(
              (currentPiece.x + col) * CELL_SIZE,
              (currentPiece.y + row) * CELL_SIZE,
              CELL_SIZE - 1,
              CELL_SIZE - 1
            );
          }
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
  }, [board, currentPiece]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-sm">
          <div>Score: {score}</div>
          <div>Level: {level}</div>
          <div>Lines: {linesCleared}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetGame} variant="outline">
            New Game
          </Button>
          <Button onClick={() => setIsPaused(prev => !prev)} variant="outline">
            {isPaused ? 'Start' : 'Pause'}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="border border-white/10 rounded-lg game-canvas"
      />

      {gameOver && (
        <div className="text-center">
          <h3 className="text-xl mb-2">Game Over!</h3>
          <p className="mb-2">Final Score: {score}</p>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        Arrow keys to move • Up arrow to rotate • Space to pause
      </div>
    </div>
  );
};

export default TetrisGame;
