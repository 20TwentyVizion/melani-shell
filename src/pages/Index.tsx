import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import DesktopIcons from '@/components/desktop/DesktopIcons';
import WindowManager from '@/components/desktop/WindowManager';
import GlobalSearch from '@/components/search/GlobalSearch';
import SmartSuggestions from '@/components/suggestions/SmartSuggestions';
import ParticleBackground from '@/components/effects/ParticleBackground';
import DynamicWallpaper from '@/components/effects/DynamicWallpaper';
import FluidAnimations from '@/components/effects/FluidAnimations';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { useWindowStates } from '@/hooks/useWindowStates';
import { AIIntegrationService } from '@/lib/aiIntegration';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [isMobile, setIsMobile] = useState(false);
  const [aiService, setAiService] = useState<AIIntegrationService | null>(null);
  
  const { currentTheme } = useTheme();
  const { showInfo, showSuccess } = useNotification();
  const { currentUser } = useUser();
  const { windowStates, openWindow, closeWindow, handleIconClick } = useWindowStates();

  // Initialize AI integration service
  useEffect(() => {
    const ai = new AIIntegrationService();
    ai.initialize((command) => {
      console.log('AI command received:', command);
      
      if (command.startsWith('open ')) {
        const app = command.replace('open ', '');
        const appMap: { [key: string]: string } = {
          'settings': 'settings',
          'files': 'files',
          'calculator': 'calculator',
          'notes': 'notes',
          'melani': 'melani',
          'calendar': 'calendar',
          'music': 'music',
          'profile': 'profile'
        };
        
        if (appMap[app]) {
          openWindow(appMap[app]);
          ai.addUsageTracking(appMap[app]);
          showSuccess('Voice Command', `Opening ${app}`);
        }
      } else if (command.startsWith('search ')) {
        openWindow('search');
        showInfo('Voice Command', 'Opening search');
      } else if (command.startsWith('time ')) {
        const time = command.replace('time ', '');
        showInfo('Current Time', time);
      } else if (command.startsWith('query ') || command === 'melani help') {
        const query = command.replace('query ', '').replace('melani help', 'help');
        openWindow('melani');
        showInfo('AI Query', `Processing: "${query}"`);
      } else if (command === 'smart suggestions') {
        const suggestions = ai.getSmartSuggestions(3);
        showInfo('Smart Suggestions', `Recommended: ${suggestions.join(', ')}`);
      } else if (command === 'system status') {
        showInfo('System Status', 'System running optimally. All services active.');
      }
    });
    
    setAiService(ai);
    
    return () => {
      ai.stopVoiceListening();
    };
  }, [openWindow, showInfo, showSuccess]);

  // Enhanced icon click handler with AI integration
  const enhancedIconClick = (iconType: string) => {
    handleIconClick(iconType);
    if (aiService) {
      aiService.addUsageTracking(iconType);
    }
  };

  // Enhanced keyboard shortcuts with AI integration
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
      key: 'p',
      ctrlKey: true,
      action: () => openWindow('profile'),
      description: 'Open profile'
    },
    {
      key: 'Escape',
      action: () => closeWindow('search'),
      description: 'Close search'
    },
    // Enhanced voice command shortcut
    {
      key: 'v',
      ctrlKey: true,
      action: () => {
        if (aiService?.isVoiceSupported()) {
          aiService.startVoiceListening();
          showInfo('Voice Commands', 'Listening for voice commands... Try saying "open settings" or "hey melani"');
        } else {
          showInfo('Voice Commands', 'Voice commands not supported in this browser');
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
    
    // Enhanced welcome notification with AI features
    setTimeout(() => {
      showInfo('Welcome to Melani OS', `Good ${timeOfDay}, ${currentUser?.name || 'User'}! Your AI-enhanced experience is ready! Press Ctrl+V for voice commands or ask Melani for help.`);
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', resizeListener);
    };
  }, [showInfo, timeOfDay, currentUser]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <DynamicWallpaper />
      <FluidAnimations />
      
      <SystemBar onSettingsClick={() => openWindow('settings')} />
      
      <SmartSuggestions 
        onAppClick={(appType) => {
          openWindow(appType);
          if (aiService) {
            aiService.addUsageTracking(appType);
          }
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
