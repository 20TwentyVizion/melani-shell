
import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([30]);

  const tracks = [
    { title: 'Neon Dreams', artist: 'Synthwave Collective', duration: '3:42' },
    { title: 'Digital Horizon', artist: 'Cyber Echo', duration: '4:15' },
    { title: 'Electric Pulse', artist: 'Future Sound', duration: '3:28' },
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="w-full h-full p-4">
      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MusicIcon className="w-5 h-5" />
            Music Player
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Track */}
          <div className="text-center space-y-2">
            <div className="w-32 h-32 mx-auto rounded-lg glass-effect flex items-center justify-center">
              <MusicIcon className="w-12 h-12 text-neon-cyan" />
            </div>
            <h3 className="text-lg font-semibold">{tracks[currentTrack].title}</h3>
            <p className="text-sm opacity-70">{tracks[currentTrack].artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs opacity-70">
              <span>1:23</span>
              <span>{tracks[currentTrack].duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="sm" 
              variant="ghost" 
              className="glass-effect"
              onClick={handlePrevious}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="glass-effect rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="glass-effect"
              onClick={handleNext}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Playlist */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium opacity-70">Playlist</h4>
            {tracks.map((track, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrack ? 'glass-effect' : 'hover:bg-white/5'
                }`}
                onClick={() => setCurrentTrack(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-xs opacity-70">{track.artist}</p>
                  </div>
                  <span className="text-xs opacity-70">{track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicPlayer;
