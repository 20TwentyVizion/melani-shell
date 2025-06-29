
import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

const SystemMonitor = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0
  });

  useEffect(() => {
    const updateStats = () => {
      // Simulate real system stats with some randomness
      setStats({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        storage: 65 + Math.floor(Math.random() * 20), // More stable storage
        network: Math.floor(Math.random() * 100)
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getColorClass = (value: number) => {
    if (value < 50) return 'text-green-400';
    if (value < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const StatCard = ({ title, value, icon: Icon, unit = '%' }: {
    title: string;
    value: number;
    icon: any;
    unit?: string;
  }) => (
    <Card className="glass-effect border-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          <span className={getColorClass(value)}>{value}{unit}</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              value < 50 ? 'bg-green-400' :
              value < 80 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard title="CPU Usage" value={stats.cpu} icon={Cpu} />
        <StatCard title="Memory" value={stats.memory} icon={Activity} />
        <StatCard title="Storage" value={stats.storage} icon={HardDrive} />
        <StatCard title="Network" value={stats.network} icon={Wifi} />
      </div>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">OS:</span>
              <span>Melani OS v1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Uptime:</span>
              <span>2 hours, 34 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Total Memory:</span>
              <span>8.0 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Storage:</span>
              <span>256 GB SSD</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Processes:</span>
              <span>{Math.floor(Math.random() * 200) + 50}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitor;
