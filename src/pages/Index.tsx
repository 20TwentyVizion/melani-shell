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
import CalendarApp from '@/components/Calendar';
import MusicPlayer from '@/components/MusicPlayer';
import { Bot, AppWindow, UserRound, Gamepad2 } from 'lucide-react';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [showMelani, setShowMelani] = useState(false);
  const [showRecentApps, setShowRecentApps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateTimeOfDay();
    checkMobile();
    
    const timeInterval = setInterval(updateTimeOfDay, 60000);
    const resizeListener = () => checkMobile();
    window.addEventListener('resize', resizeListener);
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  const desktopIcons = [
    { icon: Bot, label: 'Melani', onClick: () => setShowMelani(true) },
    { icon: AppWindow, label: 'Recent', onClick: () => setShowRecentApps(true) },
    { icon: UserRound, label: 'Profile', onClick: () => setShowProfile(true) },
    { icon: Gamepad2, label: 'Games', onClick: () => setShowGames(true) },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`dynamic-bg ${timeOfDay}`} />
      <SystemBar onSettingsClick={() => setShowSettings(true)} />
      
      {/* Desktop Icons - Mobile Responsive */}
      {isMobile ? (
        <div className="pt-12 pb-20 px-4">
          <div className="grid grid-cols-2 gap-4">
            {desktopIcons.map((icon, index) => (
              <div
                key={index}
                className="desktop-icon bg-black/20 rounded-xl"
                onClick={icon.onClick}
              >
                <icon.icon className="w-8 h-8 text-white/80 mb-2" />
                <span className="text-sm text-center">{icon.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div 
            className="desktop-icon"
            style={{ left: '20px', top: '40px' }}
            onClick={() => setShowMelani(true)}
          >
            <Bot className="w-8 h-8 text-white/80" />
            <span className="text-xs mt-2">Melani</span>
          </div>
          
          <div 
            className="desktop-icon"
            style={{ left: '20px', top: '140px' }}
            onClick={() => setShowRecentApps(true)}
          >
            <AppWindow className="w-8 h-8 text-white/80" />
            <span className="text-xs mt-2">Recent</span>
          </div>

          <div 
            className="desktop-icon"
            style={{ left: '20px', top: '240px' }}
            onClick={() => setShowProfile(true)}
          >
            <UserRound className="w-8 h-8 text-white/80" />
            <span className="text-xs mt-2">Profile</span>
          </div>

          <div 
            className="desktop-icon"
            style={{ left: '20px', top: '340px' }}
            onClick={() => setShowGames(true)}
          >
            <Gamepad2 className="w-8 h-8 text-white/80" />
            <span className="text-xs mt-2">Games</span>
          </div>
        </>
      )}

      {/* Movable Windows */}
      {showMelani && (
        <MovableWindow
          title="Melani Assistant"
          initialPosition={{ x: isMobile ? 10 : 100, y: isMobile ? 60 : 100 }}
          onMinimize={() => setShowMelani(false)}
          isMobile={isMobile}
        >
          <MelaniAssistant />
        </MovableWindow>
      )}

      {showRecentApps && (
        <MovableWindow
          title="Recent Applications"
          initialPosition={{ x: isMobile ? 10 : 500, y: isMobile ? 60 : 100 }}
          onMinimize={() => setShowRecentApps(false)}
          isMobile={isMobile}
        >
          <RecentApps />
        </MovableWindow>
      )}

      {showSettings && (
        <MovableWindow
          title="System Settings"
          initialPosition={{ x: isMobile ? 10 : 300, y: isMobile ? 60 : 200 }}
          onMinimize={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
          isMobile={isMobile}
        >
          <SystemStats />
        </MovableWindow>
      )}

      {showFiles && (
        <MovableWindow
          title="File Explorer"
          initialPosition={{ x: isMobile ? 10 : 200, y: isMobile ? 60 : 150 }}
          onMinimize={() => setShowFiles(false)}
          onClose={() => setShowFiles(false)}
          isMobile={isMobile}
        >
          <FileExplorer />
        </MovableWindow>
      )}

      {showProfile && (
        <MovableWindow
          title="User Profile"
          initialPosition={{ x: isMobile ? 10 : 400, y: isMobile ? 60 : 150 }}
          onMinimize={() => setShowProfile(false)}
          onClose={() => setShowProfile(false)}
          isMobile={isMobile}
        >
          <Profile />
        </MovableWindow>
      )}

      {showGames && (
        <MovableWindow
          title="Games"
          initialPosition={{ x: isMobile ? 10 : 300, y: isMobile ? 60 : 150 }}
          onMinimize={() => setShowGames(false)}
          onClose={() => setShowGames(false)}
          isMobile={isMobile}
        >
          <Games />
        </MovableWindow>
      )}

      {showCalendar && (
        <MovableWindow
          title="Calendar"
          initialPosition={{ x: isMobile ? 10 : 250, y: isMobile ? 60 : 120 }}
          onMinimize={() => setShowCalendar(false)}
          onClose={() => setShowCalendar(false)}
          isMobile={isMobile}
        >
          <CalendarApp />
        </MovableWindow>
      )}

      {showMusic && (
        <MovableWindow
          title="Music Player"
          initialPosition={{ x: isMobile ? 10 : 350, y: isMobile ? 60 : 140 }}
          onMinimize={() => setShowMusic(false)}
          onClose={() => setShowMusic(false)}
          isMobile={isMobile}
        >
          <MusicPlayer />
        </MovableWindow>
      )}

      <Dock 
        onSettingsClick={() => setShowSettings(true)}
        onFilesClick={() => setShowFiles(true)}
        onCalendarClick={() => setShowCalendar(true)}
        onMusicClick={() => setShowMusic(true)}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Index;
