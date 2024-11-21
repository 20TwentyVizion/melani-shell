import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';
import SystemStats from '@/components/dashboard/SystemStats';
import RecentApps from '@/components/dashboard/RecentApps';
import MelaniAssistant from '@/components/assistant/MelaniAssistant';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <SystemBar />
      <main className="container mx-auto pt-16 px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold text-center lg:text-left animate-fade-in">
              Welcome to Melani OS
            </h1>
            <SystemStats />
            <RecentApps />
          </div>
          <div className="lg:col-span-1">
            <MelaniAssistant />
          </div>
        </div>
      </main>
      <Dock />
    </div>
  );
};

export default Index;