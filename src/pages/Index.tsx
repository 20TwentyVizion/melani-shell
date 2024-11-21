import { useEffect, useState } from 'react';
import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import SystemStats from '@/components/dashboard/SystemStats';
import RecentApps from '@/components/dashboard/RecentApps';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState('morning');

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
      <SystemBar />
      <main className="container mx-auto pt-16 px-4 pb-24">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <h1 className="text-4xl font-bold text-center lg:text-left animate-fade-in">
              Welcome to Melani OS
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemStats />
              <RecentApps />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <MelaniAssistant />
          </div>
        </div>
      </main>
      <Dock />
    </div>
  );
};

export default Index;