
import { useState } from 'react';
import { Download, Star, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/contexts/NotificationContext';

interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  rating: number;
  downloads: number;
  category: string;
  icon: string;
  installed: boolean;
}

const AppStore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { showSuccess } = useNotification();

  const apps: App[] = [
    {
      id: '1',
      name: 'Advanced Text Editor',
      description: 'Professional text editor with syntax highlighting',
      version: '2.1.0',
      rating: 4.8,
      downloads: 15420,
      category: 'productivity',
      icon: '📝',
      installed: false
    },
    {
      id: '2',
      name: 'Photo Viewer',
      description: 'Fast and lightweight image viewer',
      version: '1.5.2',
      rating: 4.6,
      downloads: 8932,
      category: 'media',
      icon: '🖼️',
      installed: false
    },
    {
      id: '3',
      name: 'Terminal Emulator',
      description: 'Full-featured terminal with customization',
      version: '3.0.1',
      rating: 4.9,
      downloads: 22150,
      category: 'development',
      icon: '💻',
      installed: true
    },
    {
      id: '4',
      name: 'Weather App',
      description: 'Real-time weather updates and forecasts',
      version: '1.2.3',
      rating: 4.4,
      downloads: 5678,
      category: 'utilities',
      icon: '🌤️',
      installed: false
    }
  ];

  const categories = ['all', 'productivity', 'media', 'development', 'utilities'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (app: App) => {
    showSuccess('App Installed', `${app.name} has been installed successfully`);
  };

  const handleUninstall = (app: App) => {
    showSuccess('App Uninstalled', `${app.name} has been uninstalled`);
  };

  return (
    <div className="w-full h-full p-4 space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-effect border-white/20"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-gray-800">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApps.map(app => (
          <Card key={app.id} className="glass-effect border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <div className="text-lg">{app.name}</div>
                  <div className="text-sm opacity-70 font-normal">v{app.version}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm opacity-80">{app.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{app.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{app.downloads.toLocaleString()}</span>
                </div>
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs capitalize">
                  {app.category}
                </span>
              </div>

              <Button
                className={`w-full glass-effect ${
                  app.installed ? 'bg-red-500/20 hover:bg-red-500/30' : 
                  'bg-blue-500/20 hover:bg-blue-500/30'
                }`}
                onClick={() => app.installed ? handleUninstall(app) : handleInstall(app)}
              >
                {app.installed ? 'Uninstall' : 'Install'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppStore;
