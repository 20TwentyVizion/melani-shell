
import { Palette, User, Bell, Shield, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';

interface SettingsPanelProps {
  onSystemMonitorClick?: () => void;
}

const SettingsPanel = ({ onSystemMonitorClick }: SettingsPanelProps) => {
  const { currentTheme, themes, setTheme } = useTheme();
  const { showSuccess, showInfo } = useNotification();

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    showSuccess('Theme changed', 'Your theme has been updated successfully');
  };

  const handleEditProfile = () => {
    showInfo('Profile Editor', 'Opening profile settings...');
    // This would typically open a profile editing modal or navigate to profile page
  };

  const handleSystemMonitor = () => {
    if (onSystemMonitorClick) {
      onSystemMonitorClick();
    } else {
      showInfo('System Monitor', 'Opening system monitor...');
    }
  };

  const handlePerformanceSettings = () => {
    showInfo('Performance Settings', 'Optimizing system performance...');
    // This would typically open performance tuning options
  };

  const handleStorageManagement = () => {
    showInfo('Storage Management', 'Analyzing storage usage...');
    // This would typically open storage cleanup tools
  };

  return (
    <div className="w-full h-full p-4 space-y-4">
      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Themes & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                  currentTheme.id === theme.id ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div
                  className="w-full h-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${theme.wallpaper})` }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium">{theme.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm opacity-70">john.doe@example.com</div>
            </div>
          </div>
          <Button className="w-full glass-effect" onClick={handleEditProfile}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>System notifications</span>
            <Button size="sm" className="glass-effect">ON</Button>
          </div>
          <div className="flex items-center justify-between">
            <span>App notifications</span>
            <Button size="sm" className="glass-effect">ON</Button>
          </div>
          <div className="flex items-center justify-between">
            <span>Sound alerts</span>
            <Button size="sm" className="glass-effect">OFF</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full glass-effect" onClick={handleSystemMonitor}>
            System Monitor
          </Button>
          <Button className="w-full glass-effect" onClick={handlePerformanceSettings}>
            Performance Settings
          </Button>
          <Button className="w-full glass-effect" onClick={handleStorageManagement}>
            Storage Management
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
