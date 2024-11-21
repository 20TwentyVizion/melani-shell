import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Memory, Activity, Clock } from "lucide-react";

const SystemStats = () => {
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
          <div className="text-2xl font-bold text-neon-cyan">45%</div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-neon-magenta/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-magenta">
            Memory
          </CardTitle>
          <Memory className="h-4 w-4 text-neon-magenta" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-magenta">8.2 GB</div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-neon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neon-gold">
            System Load
          </CardTitle>
          <Activity className="h-4 w-4 text-neon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neon-gold">1.2</div>
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
          <div className="text-2xl font-bold text-neon-cyan">24h 12m</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStats;