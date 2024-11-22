import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    return newFood;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const drawGame = (context: CanvasRenderingContext2D) => {
    // Clear canvas
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake
    context.fillStyle = '#00fff2';
    snake.forEach(segment => {
      context.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });

    // Draw food
    context.fillStyle = '#ff00ff';
    context.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  };

  const updateGame = () => {
    if (gameOver || isPaused) return;

    const newHead = {
      x: (snake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
      y: (snake[0].y + direction.y + GRID_SIZE) % GRID_SIZE
    };

    // Check collision with self
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood());
      setScore(prev => prev + 10);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const gameLoop = setInterval(updateGame, GAME_SPEED);
    const draw = () => {
      drawGame(context);
      requestAnimationFrame(draw);
    };

    draw();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      const keyDirections: { [key: string]: { x: number; y: number } } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      if (keyDirections[e.key]) {
        const newDirection = keyDirections[e.key];
        // Prevent 180-degree turns
        if (
          !(direction.x === -newDirection.x && direction.y === -newDirection.y) &&
          !(direction.x === newDirection.x && direction.y === newDirection.y)
        ) {
          setDirection(newDirection);
        }
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction, gameOver, isPaused]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-lg">Score: {score}</span>
        <Button
          variant="outline"
          onClick={() => setIsPaused(prev => !prev)}
          className="ml-4"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-white/10 rounded-lg"
      />
      {gameOver && (
        <div className="text-center">
          <h3 className="text-xl mb-2">Game Over!</h3>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}
      <div className="text-sm text-gray-400 mt-4">
        Use arrow keys to move • Space to pause
      </div>
    </div>
  );
};

export default SnakeGame;