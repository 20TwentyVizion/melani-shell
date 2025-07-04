
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppUsage {
  appType: string;
  timestamp: number;
  timeOfDay: string;
  dayOfWeek: string;
}

interface SmartSuggestionsState {
  usageHistory: AppUsage[];
  addUsage: (appType: string) => void;
  getSmartSuggestions: (limit?: number) => string[];
  getMostUsedApps: (timeOfDay?: string) => string[];
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

const getDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

export const useSmartSuggestions = create<SmartSuggestionsState>()(
  persist(
    (set, get) => ({
      usageHistory: [],
      
      addUsage: (appType: string) => {
        const usage: AppUsage = {
          appType,
          timestamp: Date.now(),
          timeOfDay: getTimeOfDay(),
          dayOfWeek: getDayOfWeek(),
        };
        
        set(state => ({
          usageHistory: [...state.usageHistory.slice(-100), usage] // Keep last 100 entries
        }));
      },

      getSmartSuggestions: (limit = 4) => {
        const { usageHistory } = get();
        const currentTimeOfDay = getTimeOfDay();
        const currentDay = getDayOfWeek();
        
        // Score apps based on usage patterns
        const appScores: { [key: string]: number } = {};
        
        usageHistory.forEach(usage => {
          const app = usage.appType;
          if (!appScores[app]) appScores[app] = 0;
          
          // Base score
          appScores[app] += 1;
          
          // Time of day bonus
          if (usage.timeOfDay === currentTimeOfDay) {
            appScores[app] += 2;
          }
          
          // Day of week bonus
          if (usage.dayOfWeek === currentDay) {
            appScores[app] += 1;
          }
          
          // Recency bonus (more recent = higher score)
          const hoursSince = (Date.now() - usage.timestamp) / (1000 * 60 * 60);
          appScores[app] += Math.max(0, 1 - hoursSince / 168); // Decay over a week
        });
        
        // Convert to sorted array
        return Object.entries(appScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([app]) => app);
      },

      getMostUsedApps: (timeOfDay) => {
        const { usageHistory } = get();
        const filtered = timeOfDay 
          ? usageHistory.filter(u => u.timeOfDay === timeOfDay)
          : usageHistory;
        
        const counts: { [key: string]: number } = {};
        filtered.forEach(usage => {
          counts[usage.appType] = (counts[usage.appType] || 0) + 1;
        });
        
        return Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([app]) => app);
      }
    }),
    {
      name: 'melani-smart-suggestions',
    }
  )
);
