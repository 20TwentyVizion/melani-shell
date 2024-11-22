import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import SnakeGame from './SnakeGame';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    { id: 'snake', name: 'Snake', component: SnakeGame },
    { id: 'tetris', name: 'Tetris', component: null },
    { id: 'tictactoe', name: 'Tic Tac Toe', component: null },
    { id: 'spaceinvaders', name: 'Space Invaders', component: null },
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
            Back to Games
          </button>
          <GameComponent />
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 w-full">
      {games.map((game) => (
        <Card 
          key={game.id}
          className="glass-effect border-none cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setSelectedGame(game.id)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Gamepad2 className="w-8 h-8 mb-2" />
            <span>{game.name}</span>
            {!game.component && <span className="text-xs text-gray-400">(Coming Soon)</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Games;