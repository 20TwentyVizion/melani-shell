import { useState, useEffect } from 'react';
import { Wifi, Battery, Bell } from 'lucide-react';

const SystemBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-effect fixed top-0 w-full h-8 px-4 flex items-center justify-between animate-fade-in z-50">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Melani OS</span>
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