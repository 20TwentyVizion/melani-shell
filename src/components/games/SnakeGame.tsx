
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 15; // Smaller grid for mobile
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150; // Slightly slower for mobile

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 12, y: 12 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        context.fillStyle = '#ffd700';
      } else {
        context.fillStyle = '#00fff2';
      }
      context.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    context.fillStyle = '#ff00ff';
    context.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw grid lines
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      context.beginPath();
      context.moveTo(i * CELL_SIZE, 0);
      context.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, i * CELL_SIZE);
      context.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      context.stroke();
    }
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

  const changeDirection = (newDirection: { x: number; y: number }) => {
    if (gameOver || isPaused) return;
    
    // Prevent 180-degree turns
    if (
      !(direction.x === -newDirection.x && direction.y === -newDirection.y) &&
      !(direction.x === newDirection.x && direction.y === newDirection.y)
    ) {
      setDirection(newDirection);
    }
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
      const keyDirections: { [key: string]: { x: number; y: number } } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      if (keyDirections[e.key]) {
        changeDirection(keyDirections[e.key]);
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
    <div className="flex flex-col items-center gap-4 w-full">
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
        className="border border-white/10 rounded-lg game-canvas"
      />
      
      {isMobile && (
        <div className="game-controls grid grid-cols-3 gap-2 w-48">
          <div></div>
          <Button 
            className="game-control-btn"
            onTouchStart={() => changeDirection({ x: 0, y: -1 })}
            onClick={() => changeDirection({ x: 0, y: -1 })}
          >
            ↑
          </Button>
          <div></div>
          <Button 
            className="game-control-btn"
            onTouchStart={() => changeDirection({ x: -1, y: 0 })}
            onClick={() => changeDirection({ x: -1, y: 0 })}
          >
            ←
          </Button>
          <Button 
            className="game-control-btn"
            onClick={() => setIsPaused(prev => !prev)}
          >
            ⏸
          </Button>
          <Button 
            className="game-control-btn"
            onTouchStart={() => changeDirection({ x: 1, y: 0 })}
            onClick={() => changeDirection({ x: 1, y: 0 })}
          >
            →
          </Button>
          <div></div>
          <Button 
            className="game-control-btn"
            onTouchStart={() => changeDirection({ x: 0, y: 1 })}
            onClick={() => changeDirection({ x: 0, y: 1 })}
          >
            ↓
          </Button>
          <div></div>
        </div>
      )}
      
      {gameOver && (
        <div className="text-center">
          <h3 className="text-xl mb-2">Game Over!</h3>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}
      
      <div className="text-sm text-gray-400 mt-4 text-center">
        {isMobile ? 'Use the controls above to play' : 'Use arrow keys to move • Space to pause'}
      </div>
    </div>
  );
};

export default SnakeGame;
