
import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import DesktopIcons from '@/components/desktop/DesktopIcons';
import WindowManager from '@/components/desktop/WindowManager';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { useWindowStates } from '@/hooks/useWindowStates';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [isMobile, setIsMobile] = useState(false);
  
  const { currentTheme } = useTheme();
  const { showInfo } = useNotification();
  const { currentUser } = useUser();
  const { windowStates, openWindow, closeWindow, handleIconClick } = useWindowStates();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => openWindow('search'),
      description: 'Open global search'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => openWindow('notes'),
      description: 'Open notes'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => openWindow('calculator'),
      description: 'Open calculator'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => openWindow('files'),
      description: 'Open file explorer'
    },
    {
      key: 'Escape',
      action: () => closeWindow('search'),
      description: 'Close search'
    }
  ]);

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
      showInfo('Welcome to Melani OS', `Good ${timeOfDay}, ${currentUser?.name || 'User'}! Your enhanced desktop experience is ready!`);
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', resizeListener);
    };
  }, [showInfo, timeOfDay, currentUser]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="fixed inset-0 -z-10 transition-opacity duration-700 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentTheme.wallpaper})` }}
      />
      
      <SystemBar onSettingsClick={() => openWindow('settings')} />
      
      <DesktopIcons 
        isMobile={isMobile} 
        onIconClick={handleIconClick} 
      />

      {windowStates.showSearch && (
        <GlobalSearch onClose={() => closeWindow('search')} />
      )}

      <WindowManager 
        isMobile={isMobile}
        windowStates={windowStates}
        onCloseWindow={closeWindow}
      />

      <Dock 
        onSettingsClick={() => openWindow('settings')}
        onFilesClick={() => openWindow('files')}
        onCalendarClick={() => openWindow('calendar')}
        onMusicClick={() => openWindow('music')}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Index;
