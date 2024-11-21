import { useState, useEffect } from 'react';
import { Wifi, Battery, Bell, Sun, Moon } from 'lucide-react';

const SystemBar = () => {
  const [time, setTime] = useState(new Date());
  const [isDaytime, setIsDaytime] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setIsDaytime(now.getHours() >= 6 && now.getHours() < 18);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-effect fixed top-0 w-full h-8 px-4 flex items-center justify-between animate-fade-in z-50">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Melani OS</span>
        {isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Bell className="w-4 h-4" />
        </div>
        <div className="text-sm font-medium">
          {time.toLocaleTimeString()} • {time.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SystemBar;