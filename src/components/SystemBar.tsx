
import { useState, useEffect } from 'react';

interface SystemBarProps {
  onSettingsClick: () => void;
}

const SystemBar = ({ onSettingsClick }: SystemBarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-effect fixed top-0 w-full h-8 px-4 flex items-center justify-between animate-fade-in z-50">
      <div className="flex items-center">
        <span className="text-sm font-medium">Melani OS</span>
      </div>
      <div className="text-sm font-medium">
        {time.toLocaleTimeString()} • {time.toLocaleDateString()}
      </div>
    </div>
  );
};

export default SystemBar;
