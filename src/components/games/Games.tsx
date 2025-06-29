
import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import SnakeGame from './SnakeGame';
import TetrisGame from './TetrisGame';
import TicTacToeGame from './TicTacToeGame';
import SpaceInvadersGame from './SpaceInvadersGame';
import PongGame from './PongGame';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    { id: 'snake', name: 'Snake', component: SnakeGame },
    { id: 'tetris', name: 'Tetris', component: TetrisGame },
    { id: 'tictactoe', name: 'Tic Tac Toe', component: TicTacToeGame },
    { id: 'spaceinvaders', name: 'Space Invaders', component: SpaceInvadersGame },
    { id: 'pong', name: 'Pong', component: PongGame },
  ];

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game?.component) {
      const GameComponent = game.component;
      return (
        <div className="w-full h-full flex flex-col items-center">
          <button 
            onClick={() => setSelectedGame(null)}
            className="mb-4 px-4 py-2 text-sm glass-effect rounded-lg hover:bg-white/20"
          >
            ← Back to Games
          </button>
          <div className="w-full flex justify-center">
            <GameComponent />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Choose a Game</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 w-full max-w-md mx-auto">
        {games.map((game) => (
          <Card 
            key={game.id}
            className="glass-effect border-none cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setSelectedGame(game.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 min-h-[100px]">
              <Gamepad2 className="w-8 h-8 mb-2 text-neon-cyan" />
              <span className="text-center font-medium">{game.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Games;
