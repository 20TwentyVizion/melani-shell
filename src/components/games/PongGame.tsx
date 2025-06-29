
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;

interface GameState {
  leftPaddle: { y: number };
  rightPaddle: { y: number };
  ball: { x: number; y: number; dx: number; dy: number };
  score: { left: number; right: number };
}

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused'>('paused');
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [game, setGame] = useState<GameState>({
    leftPaddle: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    rightPaddle: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 3, dy: 2 },
    score: { left: 0, right: 0 }
  });

  const resetBall = () => {
    return {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * 3,
      dy: (Math.random() > 0.5 ? 1 : -1) * 2
    };
  };

  const resetGame = () => {
    setGame({
      leftPaddle: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      rightPaddle: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ball: resetBall(),
      score: { left: 0, right: 0 }
    });
    setGameState('playing');
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGame(prevGame => {
        const newGame = { ...prevGame };
        
        // Move paddles
        const paddleSpeed = 5;
        if (keys['w'] && newGame.leftPaddle.y > 0) {
          newGame.leftPaddle.y -= paddleSpeed;
        }
        if (keys['s'] && newGame.leftPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
          newGame.leftPaddle.y += paddleSpeed;
        }
        if (keys['ArrowUp'] && newGame.rightPaddle.y > 0) {
          newGame.rightPaddle.y -= paddleSpeed;
        }
        if (keys['ArrowDown'] && newGame.rightPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
          newGame.rightPaddle.y += paddleSpeed;
        }

        // Simple AI for right paddle
        const paddleCenter = newGame.rightPaddle.y + PADDLE_HEIGHT / 2;
        const aiSpeed = 2;
        if (newGame.ball.dx > 0) { // Ball moving towards AI
          if (paddleCenter < newGame.ball.y - 10) {
            newGame.rightPaddle.y = Math.min(newGame.rightPaddle.y + aiSpeed, CANVAS_HEIGHT - PADDLE_HEIGHT);
          } else if (paddleCenter > newGame.ball.y + 10) {
            newGame.rightPaddle.y = Math.max(newGame.rightPaddle.y - aiSpeed, 0);
          }
        }

        // Move ball
        newGame.ball.x += newGame.ball.dx;
        newGame.ball.y += newGame.ball.dy;

        // Ball collision with top/bottom walls
        if (newGame.ball.y <= 0 || newGame.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newGame.ball.dy = -newGame.ball.dy;
        }

        // Ball collision with paddles
        // Left paddle
        if (
          newGame.ball.x <= PADDLE_WIDTH &&
          newGame.ball.y >= newGame.leftPaddle.y &&
          newGame.ball.y <= newGame.leftPaddle.y + PADDLE_HEIGHT
        ) {
          newGame.ball.dx = Math.abs(newGame.ball.dx);
          const relativeIntersectY = (newGame.leftPaddle.y + PADDLE_HEIGHT / 2) - newGame.ball.y;
          newGame.ball.dy = -relativeIntersectY * 0.1;
        }

        // Right paddle
        if (
          newGame.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          newGame.ball.y >= newGame.rightPaddle.y &&
          newGame.ball.y <= newGame.rightPaddle.y + PADDLE_HEIGHT
        ) {
          newGame.ball.dx = -Math.abs(newGame.ball.dx);
          const relativeIntersectY = (newGame.rightPaddle.y + PADDLE_HEIGHT / 2) - newGame.ball.y;
          newGame.ball.dy = -relativeIntersectY * 0.1;
        }

        // Scoring
        if (newGame.ball.x < 0) {
          newGame.score.right++;
          newGame.ball = resetBall();
        }
        if (newGame.ball.x > CANVAS_WIDTH) {
          newGame.score.left++;
          newGame.ball = resetBall();
        }

        return newGame;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, keys]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#00fff2';
      ctx.fillRect(0, game.leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, game.rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(game.ball.x, game.ball.y, BALL_SIZE, BALL_SIZE);

      // Draw scores
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(game.score.left.toString(), CANVAS_WIDTH / 4, 40);
      ctx.fillText(game.score.right.toString(), (CANVAS_WIDTH * 3) / 4, 40);

      requestAnimationFrame(draw);
    };

    draw();
  }, [game]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-lg">Player: {game.score.left} | AI: {game.score.right}</span>
        <div className="flex gap-2">
          <Button onClick={resetGame} variant="outline">
            New Game
          </Button>
          <Button onClick={togglePause} variant="outline">
            {gameState === 'playing' ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-white/10 rounded-lg game-canvas"
      />

      <div className="text-sm text-gray-400 text-center">
        W/S keys to move left paddle • Arrow keys for right paddle
        <br />
        First to 10 points wins!
      </div>
    </div>
  );
};

export default PongGame;
