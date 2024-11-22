import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Database, Activity, Clock } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import { useEffect, useState } from "react";

const SystemStats = () => {
  const { totalMemory, usedMemory, processes } = useSystemMemory();
  const [uptime, setUptime] = useState("0h 0m");
  const [cpuUsage, setCpuUsage] = useState(0);

  useEffect(() => {
    // Simulate CPU usage fluctuation
    const cpuInterval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 40); // Random between 40-70%
    }, 3000);

    // Update uptime
    const startTime = Date.now();
    const uptimeInterval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setUptime(`${hours}h ${minutes}m`);
    }, 60000);

    return () => {
      clearInterval(cpuInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="glass-effect border-neon-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-cyan">
            CPU Usage
          </CardTitle>
          <Cpu className="h-4 w-4 text-neon-cyan" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-cyan">{cpuUsage}%</div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-neon-magenta/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-magenta">
            Memory
          </CardTitle>
          <Database className="h-4 w-4 text-neon-magenta" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-magenta">
            {memoryUsagePercent.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-neon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-gold">
            Processes
          </CardTitle>
          <Activity className="h-4 w-4 text-neon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-gold">
            {processes.length}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-neon-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-cyan">
            Uptime
          </CardTitle>
          <Clock className="h-4 w-4 text-neon-cyan" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-cyan">{uptime}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStats;