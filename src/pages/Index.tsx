import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import DesktopIcons from '@/components/desktop/DesktopIcons';
import WindowManager from '@/components/desktop/WindowManager';
import GlobalSearch from '@/components/search/GlobalSearch';
import SmartSuggestions from '@/components/suggestions/SmartSuggestions';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { useWindowStates } from '@/hooks/useWindowStates';
import { useSmartSuggestions } from '@/lib/smartSuggestions';
import { VoiceCommandService } from '@/lib/voiceCommands';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [isMobile, setIsMobile] = useState(false);
  const [voiceCommandService, setVoiceCommandService] = useState<VoiceCommandService | null>(null);
  
  const { currentTheme } = useTheme();
  const { showInfo, showSuccess } = useNotification();
  const { currentUser } = useUser();
  const { windowStates, openWindow, closeWindow, handleIconClick } = useWindowStates();
  const { addUsage } = useSmartSuggestions();

  // Initialize voice commands
  useEffect(() => {
    const vcs = new VoiceCommandService();
    vcs.onCommand((command) => {
      console.log('Voice command received:', command);
      
      if (command.startsWith('open ')) {
        const app = command.replace('open ', '');
        const appMap: { [key: string]: string } = {
          'settings': 'settings',
          'files': 'files',
          'calculator': 'calculator',
          'notes': 'notes',
          'melani': 'melani',
          'calendar': 'calendar',
          'music': 'music'
        };
        
        if (appMap[app]) {
          openWindow(appMap[app]);
          addUsage(appMap[app]);
          showSuccess('Voice Command', `Opening ${app}`);
        }
      } else if (command.startsWith('search ')) {
        openWindow('search');
        showInfo('Voice Command', 'Opening search');
      } else if (command.startsWith('time ')) {
        const time = command.replace('time ', '');
        showInfo('Current Time', time);
      } else if (command.startsWith('query ')) {
        const query = command.replace('query ', '');
        openWindow('melani');
        showInfo('AI Query', `Processing: "${query}"`);
      }
    });
    
    setVoiceCommandService(vcs);
    
    return () => {
      vcs.stopListening();
    };
  }, [openWindow, addUsage, showInfo, showSuccess]);

  // Enhanced icon click handler with usage tracking
  const enhancedIconClick = (iconType: string) => {
    handleIconClick(iconType);
    addUsage(iconType);
  };

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
    },
    // New voice command shortcut
    {
      key: 'v',
      ctrlKey: true,
      action: () => {
        if (voiceCommandService?.isSupported()) {
          voiceCommandService.startListening();
          showInfo('Voice Commands', 'Listening for voice commands...');
        }
      },
      description: 'Start voice commands'
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
      showInfo('Welcome to Melani OS', `Good ${timeOfDay}, ${currentUser?.name || 'User'}! Your enhanced desktop experience is ready! Press Ctrl+V for voice commands.`);
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
      
      <SmartSuggestions 
        onAppClick={(appType) => {
          openWindow(appType);
          addUsage(appType);
        }}
      />
      
      <DesktopIcons 
        isMobile={isMobile} 
        onIconClick={enhancedIconClick} 
      />

      {windowStates.showSearch && (
        <GlobalSearch onClose={() => closeWindow('search')} />
      )}

      <WindowManager 
        isMobile={isMobile}
        windowStates={windowStates}
        onCloseWindow={closeWindow}
        onOpenWindow={openWindow}
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
