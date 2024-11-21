import SystemBar from '@/components/SystemBar';
import Dock from '@/components/Dock';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <SystemBar />
      <main className="pt-8 px-4">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-center mt-20">
            Welcome to Melani OS
          </h1>
          <p className="text-center mt-4 text-muted-foreground">
            Your next-generation operating system
          </p>
        </div>
      </main>
      <Dock />
    </div>
  );
};

export default Index;