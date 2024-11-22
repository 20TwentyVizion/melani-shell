import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';
import MovableWindow from '@/components/MovableWindow';
import FileExplorer from '@/components/FileExplorer';
import SystemStats from '@/components/dashboard/SystemStats';
import RecentApps from '@/components/dashboard/RecentApps';
import Profile from '@/components/profile/Profile';
import Games from '@/components/games/Games';
import TextEditor from '@/components/TextEditor';
import { Bot, AppWindow, UserRound, Gamepad2, FileText } from 'lucide-react';

const WALLPAPERS = [
  'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_3.jpg',
  'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_2.jpg',
  'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_1.jpg',
  'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_0.jpg'
];

interface DesktopIconProps {
  icon: any;
  label: string;
  onClick: () => void;
  top: number;
}

const DesktopIcon = ({ icon: Icon, label, onClick, top }: DesktopIconProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div 
      className="fixed left-4 flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
      style={{ top: `${top + 48}px` }}
      onClick={handleClick}
    >
      <Icon className="w-8 h-8 text-white/80" />
      <span className="text-xs mt-2 text-white/80">{label}</span>
    </div>
  );
};

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [showMelani, setShowMelani] = useState(false);
  const [showRecentApps, setShowRecentApps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentWallpaper] = useState(() => {
    const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
    return WALLPAPERS[randomIndex];
  });

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  const desktopIcons = [
    { icon: Bot, label: 'Melani', onClick: () => setShowMelani(true) },
    { icon: AppWindow, label: 'Recent', onClick: () => setShowRecentApps(true) },
    { icon: UserRound, label: 'Profile', onClick: () => setShowProfile(true) },
    { icon: Gamepad2, label: 'Games', onClick: () => setShowGames(true) },
    { icon: FileText, label: 'Text Editor', onClick: () => setShowTextEditor(true) },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="dynamic-bg"
        style={{ 
          backgroundImage: `url(${currentWallpaper})`,
        }} 
      />
      <SystemBar onSettingsClick={() => setShowSettings(true)} />
      
      {desktopIcons.map((icon, index) => (
        <DesktopIcon
          key={index}
          icon={icon.icon}
          label={icon.label}
          onClick={icon.onClick}
          top={index * 80}
        />
      ))}

      {showMelani && (
        <MovableWindow
          title="Melani Assistant"
          onMinimize={() => setShowMelani(false)}
          onClose={() => setShowMelani(false)}
        >
          <MelaniAssistant />
        </MovableWindow>
      )}

      {showRecentApps && (
        <MovableWindow
          title="Recent Applications"
          onMinimize={() => setShowRecentApps(false)}
          onClose={() => setShowRecentApps(false)}
        >
          <RecentApps />
        </MovableWindow>
      )}

      {showSettings && (
        <MovableWindow
          title="System Settings"
          onMinimize={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
        >
          <SystemStats />
        </MovableWindow>
      )}

      {showFiles && (
        <MovableWindow
          title="File Explorer"
          onMinimize={() => setShowFiles(false)}
          onClose={() => setShowFiles(false)}
        >
          <FileExplorer />
        </MovableWindow>
      )}

      {showProfile && (
        <MovableWindow
          title="User Profile"
          onMinimize={() => setShowProfile(false)}
          onClose={() => setShowProfile(false)}
        >
          <Profile />
        </MovableWindow>
      )}

      {showGames && (
        <MovableWindow
          title="Games"
          onMinimize={() => setShowGames(false)}
          onClose={() => setShowGames(false)}
        >
          <Games />
        </MovableWindow>
      )}

      {showTextEditor && (
        <MovableWindow
          title="Text Editor"
          onMinimize={() => setShowTextEditor(false)}
          onClose={() => setShowTextEditor(false)}
        >
          <TextEditor />
        </MovableWindow>
      )}

      <Dock 
        onSettingsClick={() => setShowSettings(true)}
        onFilesClick={() => setShowFiles(true)}
      />
    </div>
  );
};

export default Index;