
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface WallpaperConfig {
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
}

const timeBasedWallpapers: { [key: string]: WallpaperConfig } = {
  default: {
    morning: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    afternoon: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    evening: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070',
    night: 'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_3.jpg'
  },
  neon: {
    morning: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070',
    afternoon: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070',
    evening: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070',
    night: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070'
  },
  forest: {
    morning: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    afternoon: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    evening: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    night: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071'
  },
  sunset: {
    morning: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    afternoon: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    evening: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    night: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070'
  }
};

const DynamicWallpaper = () => {
  const [currentWallpaper, setCurrentWallpaper] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const { currentTheme } = useTheme();

  useEffect(() => {
    const updateTimeAndWallpaper = () => {
      const hour = new Date().getHours();
      let newTimeOfDay = 'morning';
      
      if (hour >= 5 && hour < 12) {
        newTimeOfDay = 'morning';
      } else if (hour >= 12 && hour < 17) {
        newTimeOfDay = 'afternoon';
      } else if (hour >= 17 && hour < 20) {
        newTimeOfDay = 'evening';
      } else {
        newTimeOfDay = 'night';
      }
      
      setTimeOfDay(newTimeOfDay);
      
      const wallpaperConfig = timeBasedWallpapers[currentTheme.id];
      if (wallpaperConfig) {
        setCurrentWallpaper(wallpaperConfig[newTimeOfDay as keyof WallpaperConfig]);
      } else {
        setCurrentWallpaper(currentTheme.wallpaper);
      }
    };

    updateTimeAndWallpaper();
    const interval = setInterval(updateTimeAndWallpaper, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentTheme]);

  return (
    <div
      className="fixed inset-0 -z-30 transition-all duration-1000 ease-in-out bg-cover bg-center"
      style={{
        backgroundImage: `url(${currentWallpaper})`,
        filter: 'brightness(0.8) saturate(1.1)'
      }}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      
      {/* Time-based color overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          timeOfDay === 'morning' ? 'bg-orange-500/5' :
          timeOfDay === 'afternoon' ? 'bg-blue-500/5' :
          timeOfDay === 'evening' ? 'bg-purple-500/10' :
          'bg-indigo-900/15'
        }`}
      />
    </div>
  );
};

export default DynamicWallpaper;
