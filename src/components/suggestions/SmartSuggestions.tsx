
import { useEffect, useState } from 'react';
import { Bot, Clock, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartSuggestions } from '@/lib/smartSuggestions';

interface SmartSuggestionsProps {
  onAppClick: (appType: string) => void;
}

const SmartSuggestions = ({ onAppClick }: SmartSuggestionsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const { getSmartSuggestions, getMostUsedApps } = useSmartSuggestions();

  useEffect(() => {
    // Show suggestions after a delay
    const timer = setTimeout(() => {
      const suggestions = getSmartSuggestions(3);
      if (suggestions.length > 0) {
        setCurrentSuggestions(suggestions);
        setIsVisible(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => setIsVisible(false), 10000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [getSmartSuggestions]);

  const getAppDisplayName = (appType: string) => {
    const names: { [key: string]: string } = {
      melani: 'Melani Assistant',
      recent: 'Recent Apps',
      profile: 'Profile',
      games: 'Games',
      notes: 'Notes',
      calculator: 'Calculator',
      tasks: 'Tasks',
      search: 'Search',
      appStore: 'App Store',
      settings: 'Settings',
      files: 'File Explorer',
      calendar: 'Calendar',
      music: 'Music Player'
    };
    return names[appType] || appType;
  };

  const getTimeBasedMessage = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning! Here are some suggestions to start your day:';
    if (hour >= 12 && hour < 17) return 'Good afternoon! Ready to be productive?';
    if (hour >= 17 && hour < 20) return 'Good evening! Time to wrap up your work:';
    return 'Working late? Here are some helpful apps:';
  };

  if (!isVisible || currentSuggestions.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 animate-fade-in">
      <Card className="glass-effect border-none max-w-xs">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white/90">Smart Suggestions</span>
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-auto text-white/60 hover:text-white/90 text-xs"
            >
              ×
            </button>
          </div>
          
          <p className="text-xs text-white/70 mb-3">
            {getTimeBasedMessage()}
          </p>
          
          <div className="space-y-2">
            {currentSuggestions.map((appType, index) => (
              <Button
                key={appType}
                variant="ghost"
                size="sm"
                className="w-full justify-start glass-effect hover:bg-white/10 text-white/80"
                onClick={() => {
                  onAppClick(appType);
                  setIsVisible(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <TrendingUp className="w-3 h-3" />}
                  {index === 1 && <Clock className="w-3 h-3" />}
                  {index === 2 && <Zap className="w-3 h-3" />}
                  <span className="text-xs">{getAppDisplayName(appType)}</span>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-white/10">
            <button 
              onClick={() => setIsVisible(false)}
              className="text-xs text-white/60 hover:text-white/80 w-full text-center"
            >
              Dismiss suggestions
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartSuggestions;
