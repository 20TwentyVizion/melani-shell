
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Invader extends GameObject {
  alive: boolean;
}

interface Bullet extends GameObject {
  active: boolean;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const INVADER_SPEED = 1;

const SpaceInvadersGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('paused');
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2 - 15, y: GAME_HEIGHT - 50, width: 30, height: 20 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [invaders, setInvaders] = useState<Invader[]>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  // Initialize invaders
  useEffect(() => {
    if (gameState === 'playing' && invaders.length === 0) {
      const newInvaders: Invader[] = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
          newInvaders.push({
            x: col * 45 + 20,
            y: row * 40 + 50,
            width: 30,
            height: 20,
            alive: true
          });
        }
      }
      setInvaders(newInvaders);
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Move player
      setPlayer(prev => {
        let newX = prev.x;
        if (keys['ArrowLeft'] && newX > 0) newX -= PLAYER_SPEED;
        if (keys['ArrowRight'] && newX < GAME_WIDTH - prev.width) newX += PLAYER_SPEED;
        return { ...prev, x: newX };
      });

      // Move bullets
      setBullets(prev => 
        prev.map(bullet => ({
          ...bullet,
          y: bullet.y - BULLET_SPEED,
          active: bullet.y > 0
        })).filter(bullet => bullet.active)
      );

      // Move invaders
      setInvaders(prev => 
        prev.map(invader => ({
          ...invader,
          y: invader.y + INVADER_SPEED * 0.5,
          x: invader.x + Math.sin(Date.now() * 0.001 + invader.x * 0.01) * 0.5
        }))
      );

      // Check collisions
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        setInvaders(prevInvaders => {
          const newInvaders = prevInvaders.map(invader => {
            if (!invader.alive) return invader;
            
            const hitBullet = remainingBullets.find(bullet => 
              bullet.active &&
              bullet.x < invader.x + invader.width &&
              bullet.x + 2 > invader.x &&
              bullet.y < invader.y + invader.height &&
              bullet.y + 4 > invader.y
            );

            if (hitBullet) {
              hitBullet.active = false;
              setScore(prev => prev + 10);
              return { ...invader, alive: false };
            }
            return invader;
          });

          // Check if all invaders are destroyed
          if (newInvaders.every(inv => !inv.alive)) {
            setGameState('gameOver');
          }

          return newInvaders;
        });

        return remainingBullets.filter(bullet => bullet.active);
      });

      // Check game over conditions
      setInvaders(prev => {
        if (prev.some(inv => inv.alive && inv.y > GAME_HEIGHT - 100)) {
          setGameState('gameOver');
        }
        return prev;
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
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % GAME_WIDTH;
        const y = (i * 23 + Date.now() * 0.05) % GAME_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
      }

      // Draw player
      ctx.fillStyle = '#00fff2';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Draw bullets
      ctx.fillStyle = '#ffd700';
      bullets.forEach(bullet => {
        if (bullet.active) {
          ctx.fillRect(bullet.x, bullet.y, 2, 4);
        }
      });

      // Draw invaders
      invaders.forEach(invader => {
        if (invader.alive) {
          ctx.fillStyle = '#ff00ff';
          ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        }
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [player, bullets, invaders]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      
      if (e.key === ' ' && gameState === 'playing') {
        setBullets(prev => [...prev, {
          x: player.x + player.width / 2,
          y: player.y,
          width: 2,
          height: 4,
          active: true
        }]);
      }
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
  }, [player, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayer({ x: GAME_WIDTH / 2 - 15, y: GAME_HEIGHT - 50, width: 30, height: 20 });
    setBullets([]);
    setInvaders([]);
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-lg">Score: {score}</span>
        <div className="flex gap-2">
          <Button onClick={startGame} variant="outline">
            New Game
          </Button>
          <Button onClick={pauseGame} variant="outline">
            {gameState === 'playing' ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border border-white/10 rounded-lg game-canvas"
      />

      {gameState === 'gameOver' && (
        <div className="text-center">
          <h3 className="text-xl mb-2">Game Over!</h3>
          <p className="mb-2">Final Score: {score}</p>
          <Button onClick={startGame}>Play Again</Button>
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        Arrow keys to move • Space to shoot • Destroy all invaders!
      </div>
    </div>
  );
};

export default SpaceInvadersGame;
