import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Music, Terminal, Mail } from "lucide-react";

const RecentApps = () => {
  const recentApps = [
    { name: "Documents", icon: FileText, time: "2 mins ago", color: "text-neon-cyan" },
    { name: "Music Player", icon: Music, time: "15 mins ago", color: "text-neon-magenta" },
    { name: "Terminal", icon: Terminal, time: "1 hour ago", color: "text-neon-gold" },
    { name: "Mail", icon: Mail, time: "3 hours ago", color: "text-neon-cyan" },
  ];

  return (
    <Card className="glass-effect mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApps.map((app, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <app.icon className={`h-5 w-5 ${app.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentApps;