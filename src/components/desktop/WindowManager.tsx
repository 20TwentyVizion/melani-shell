
import MovableWindow from '@/components/MovableWindow';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';
import RecentApps from '@/components/dashboard/RecentApps';
import SettingsPanel from '@/components/settings/SettingsPanel';
import EnhancedFileExplorer from '@/components/files/EnhancedFileExplorer';
import Profile from '@/components/profile/Profile';
import Games from '@/components/games/Games';
import CalendarApp from '@/components/Calendar';
import MusicPlayer from '@/components/MusicPlayer';
import NotesApp from '@/components/productivity/NotesApp';
import Calculator from '@/components/productivity/Calculator';
import TaskManager from '@/components/productivity/TaskManager';
import SystemMonitor from '@/components/system/SystemMonitor';
import AppStore from '@/components/marketplace/AppStore';

interface WindowManagerProps {
  isMobile: boolean;
  windowStates: {
    showMelani: boolean;
    showRecentApps: boolean;
    showSettings: boolean;
    showFiles: boolean;
    showProfile: boolean;
    showGames: boolean;
    showCalendar: boolean;
    showMusic: boolean;
    showNotes: boolean;
    showCalculator: boolean;
    showTasks: boolean;
    showSystemMonitor: boolean;
    showAppStore: boolean;
  };
  onCloseWindow: (windowType: string) => void;
}

const WindowManager = ({ isMobile, windowStates, onCloseWindow }: WindowManagerProps) => {
  return (
    <>
      {windowStates.showMelani && (
        <MovableWindow
          title="Melani Assistant"
          initialPosition={{ x: isMobile ? 10 : 100, y: isMobile ? 60 : 100 }}
          onMinimize={() => onCloseWindow('melani')}
          isMobile={isMobile}
        >
          <MelaniAssistant />
        </MovableWindow>
      )}

      {windowStates.showRecentApps && (
        <MovableWindow
          title="Recent Applications"
          initialPosition={{ x: isMobile ? 10 : 500, y: isMobile ? 60 : 100 }}
          onMinimize={() => onCloseWindow('recent')}
          isMobile={isMobile}
        >
          <RecentApps />
        </MovableWindow>
      )}

      {windowStates.showSettings && (
        <MovableWindow
          title="System Settings"
          initialPosition={{ x: isMobile ? 10 : 300, y: isMobile ? 60 : 200 }}
          onMinimize={() => onCloseWindow('settings')}
          onClose={() => onCloseWindow('settings')}
          isMobile={isMobile}
        >
          <SettingsPanel />
        </MovableWindow>
      )}

      {windowStates.showFiles && (
        <MovableWindow
          title="File Explorer"
          initialPosition={{ x: isMobile ? 10 : 200, y: isMobile ? 60 : 150 }}
          onMinimize={() => onCloseWindow('files')}
          onClose={() => onCloseWindow('files')}
          isMobile={isMobile}
        >
          <EnhancedFileExplorer />
        </MovableWindow>
      )}

      {windowStates.showProfile && (
        <MovableWindow
          title="User Profile"
          initialPosition={{ x: isMobile ? 10 : 400, y: isMobile ? 60 : 150 }}
          onMinimize={() => onCloseWindow('profile')}
          onClose={() => onCloseWindow('profile')}
          isMobile={isMobile}
        >
          <Profile />
        </MovableWindow>
      )}

      {windowStates.showGames && (
        <MovableWindow
          title="Games"
          initialPosition={{ x: isMobile ? 10 : 300, y: isMobile ? 60 : 150 }}
          onMinimize={() => onCloseWindow('games')}
          onClose={() => onCloseWindow('games')}
          isMobile={isMobile}
        >
          <Games />
        </MovableWindow>
      )}

      {windowStates.showCalendar && (
        <MovableWindow
          title="Calendar"
          initialPosition={{ x: isMobile ? 10 : 250, y: isMobile ? 60 : 120 }}
          onMinimize={() => onCloseWindow('calendar')}
          onClose={() => onCloseWindow('calendar')}
          isMobile={isMobile}
        >
          <CalendarApp />
        </MovableWindow>
      )}

      {windowStates.showMusic && (
        <MovableWindow
          title="Music Player"
          initialPosition={{ x: isMobile ? 10 : 350, y: isMobile ? 60 : 140 }}
          onMinimize={() => onCloseWindow('music')}
          onClose={() => onCloseWindow('music')}
          isMobile={isMobile}
        >
          <MusicPlayer />
        </MovableWindow>
      )}

      {windowStates.showNotes && (
        <MovableWindow
          title="Notes"
          initialPosition={{ x: isMobile ? 10 : 400, y: isMobile ? 60 : 100 }}
          onMinimize={() => onCloseWindow('notes')}
          onClose={() => onCloseWindow('notes')}
          isMobile={isMobile}
        >
          <NotesApp />
        </MovableWindow>
      )}

      {windowStates.showCalculator && (
        <MovableWindow
          title="Calculator"
          initialPosition={{ x: isMobile ? 10 : 450, y: isMobile ? 60 : 200 }}
          onMinimize={() => onCloseWindow('calculator')}
          onClose={() => onCloseWindow('calculator')}
          isMobile={isMobile}
        >
          <Calculator />
        </MovableWindow>
      )}

      {windowStates.showTasks && (
        <MovableWindow
          title="Task Manager"
          initialPosition={{ x: isMobile ? 10 : 500, y: isMobile ? 60 : 150 }}
          onMinimize={() => onCloseWindow('tasks')}
          onClose={() => onCloseWindow('tasks')}
          isMobile={isMobile}
        >
          <TaskManager />
        </MovableWindow>
      )}

      {windowStates.showSystemMonitor && (
        <MovableWindow
          title="System Monitor"
          initialPosition={{ x: isMobile ? 10 : 350, y: isMobile ? 60 : 100 }}
          onMinimize={() => onCloseWindow('systemMonitor')}
          onClose={() => onCloseWindow('systemMonitor')}
          isMobile={isMobile}
        >
          <SystemMonitor />
        </MovableWindow>
      )}

      {windowStates.showAppStore && (
        <MovableWindow
          title="App Store"
          initialPosition={{ x: isMobile ? 10 : 200, y: isMobile ? 60 : 100 }}
          onMinimize={() => onCloseWindow('appStore')}
          onClose={() => onCloseWindow('appStore')}
          isMobile={isMobile}
        >
          <AppStore />
        </MovableWindow>
      )}
    </>
  );
};

export default WindowManager;
