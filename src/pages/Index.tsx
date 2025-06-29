
import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';
import MovableWindow from '@/components/MovableWindow';
import FileExplorer from '@/components/FileExplorer';
import EnhancedFileExplorer from '@/components/files/EnhancedFileExplorer';
import SystemStats from '@/components/dashboard/SystemStats';
import SystemMonitor from '@/components/system/SystemMonitor';
import RecentApps from '@/components/dashboard/RecentApps';
import Profile from '@/components/profile/Profile';
import Games from '@/components/games/Games';
import CalendarApp from '@/components/Calendar';
import MusicPlayer from '@/components/MusicPlayer';
import NotesApp from '@/components/productivity/NotesApp';
import Calculator from '@/components/productivity/Calculator';
import TaskManager from '@/components/productivity/TaskManager';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { Bot, AppWindow, UserRound, Gamepad2, FileText, Calculator as CalcIcon, CheckSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';

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
  const [showNotes, setShowNotes] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showSystemMonitor, setShowSystemMonitor] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { currentTheme } = useTheme();
  const { showInfo } = useNotification();

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
    
    // Welcome notification
    setTimeout(() => {
      showInfo('Welcome to Melani OS', 'Your enhanced desktop experience is ready!');
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', resizeListener);
    };
  }, [showInfo]);

  const desktopIcons = [
    { icon: Bot, label: 'Melani', onClick: () => setShowMelani(true) },
    { icon: AppWindow, label: 'Recent', onClick: () => setShowRecentApps(true) },
    { icon: UserRound, label: 'Profile', onClick: () => setShowProfile(true) },
    { icon: Gamepad2, label: 'Games', onClick: () => setShowGames(true) },
    { icon: FileText, label: 'Notes', onClick: () => setShowNotes(true) },
    { icon: CalcIcon, label: 'Calculator', onClick: () => setShowCalculator(true) },
    { icon: CheckSquare, label: 'Tasks', onClick: () => setShowTasks(true) },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="fixed inset-0 -z-10 transition-opacity duration-700 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentTheme.wallpaper})` }}
      />
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
          {desktopIcons.map((icon, index) => (
            <div 
              key={index}
              className="desktop-icon"
              style={{ left: '20px', top: `${40 + index * 100}px` }}
              onClick={icon.onClick}
            >
              <icon.icon className="w-8 h-8 text-white/80" />
              <span className="text-xs mt-2">{icon.label}</span>
            </div>
          ))}
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
          <SettingsPanel />
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
          <EnhancedFileExplorer />
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

      {showNotes && (
        <MovableWindow
          title="Notes"
          initialPosition={{ x: isMobile ? 10 : 400, y: isMobile ? 60 : 100 }}
          onMinimize={() => setShowNotes(false)}
          onClose={() => setShowNotes(false)}
          isMobile={isMobile}
        >
          <NotesApp />
        </MovableWindow>
      )}

      {showCalculator && (
        <MovableWindow
          title="Calculator"
          initialPosition={{ x: isMobile ? 10 : 450, y: isMobile ? 60 : 200 }}
          onMinimize={() => setShowCalculator(false)}
          onClose={() => setShowCalculator(false)}
          isMobile={isMobile}
        >
          <Calculator />
        </MovableWindow>
      )}

      {showTasks && (
        <MovableWindow
          title="Task Manager"
          initialPosition={{ x: isMobile ? 10 : 500, y: isMobile ? 60 : 150 }}
          onMinimize={() => setShowTasks(false)}
          onClose={() => setShowTasks(false)}
          isMobile={isMobile}
        >
          <TaskManager />
        </MovableWindow>
      )}

      {showSystemMonitor && (
        <MovableWindow
          title="System Monitor"
          initialPosition={{ x: isMobile ? 10 : 350, y: isMobile ? 60 : 100 }}
          onMinimize={() => setShowSystemMonitor(false)}
          onClose={() => setShowSystemMonitor(false)}
          isMobile={isMobile}
        >
          <SystemMonitor />
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
