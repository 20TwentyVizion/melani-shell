import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import SystemStats from '@/components/dashboard/SystemStats';
import RecentApps from '@/components/dashboard/RecentApps';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';
import MovableWindow from '@/components/MovableWindow';
import { Bot, Apps, Settings } from 'lucide-react';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [showMelani, setShowMelani] = useState(true);
  const [showRecentApps, setShowRecentApps] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`dynamic-bg ${timeOfDay}`} />
      <SystemBar onSettingsClick={() => setShowSettings(true)} />
      
      {/* Desktop Icons */}
      {!showMelani && (
        <div 
          className="desktop-icon"
          style={{ left: '20px', top: '40px' }}
          onClick={() => setShowMelani(true)}
        >
          <Bot className="w-8 h-8 text-white/80" />
          <span className="text-xs mt-2">Melani</span>
        </div>
      )}
      
      {!showRecentApps && (
        <div 
          className="desktop-icon"
          style={{ left: '20px', top: '140px' }}
          onClick={() => setShowRecentApps(true)}
        >
          <Apps className="w-8 h-8 text-white/80" />
          <span className="text-xs mt-2">Recent</span>
        </div>
      )}

      {/* Movable Windows */}
      {showMelani && (
        <MovableWindow
          title="Melani Assistant"
          initialPosition={{ x: 100, y: 100 }}
          onMinimize={() => setShowMelani(false)}
        >
          <MelaniAssistant />
        </MovableWindow>
      )}

      {showRecentApps && (
        <MovableWindow
          title="Recent Applications"
          initialPosition={{ x: 500, y: 100 }}
          onMinimize={() => setShowRecentApps(false)}
        >
          <RecentApps />
        </MovableWindow>
      )}

      {showSettings && (
        <MovableWindow
          title="System Settings"
          initialPosition={{ x: 300, y: 200 }}
          onMinimize={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
        >
          <SystemStats />
        </MovableWindow>
      )}

      <Dock />
    </div>
  );
};

export default Index;