
import { useState } from 'react';

export const useWindowStates = () => {
  const [windowStates, setWindowStates] = useState({
    showMelani: false,
    showRecentApps: false,
    showSettings: false,
    showFiles: false,
    showProfile: false,
    showGames: false,
    showCalendar: false,
    showMusic: false,
    showNotes: false,
    showCalculator: false,
    showTasks: false,
    showSystemMonitor: false,
    showSearch: false,
    showAppStore: false,
  });

  const openWindow = (windowType: string) => {
    setWindowStates(prev => ({
      ...prev,
      [`show${windowType.charAt(0).toUpperCase() + windowType.slice(1)}`]: true
    }));
  };

  const closeWindow = (windowType: string) => {
    setWindowStates(prev => ({
      ...prev,
      [`show${windowType.charAt(0).toUpperCase() + windowType.slice(1)}`]: false
    }));
  };

  const handleIconClick = (iconType: string) => {
    const windowMap: { [key: string]: string } = {
      melani: 'Melani',
      recent: 'RecentApps',
      profile: 'Profile',
      games: 'Games',
      notes: 'Notes',
      calculator: 'Calculator',
      tasks: 'Tasks',
      search: 'Search',
      appStore: 'AppStore'
    };

    const windowName = windowMap[iconType];
    if (windowName) {
      openWindow(windowName.toLowerCase());
    }
  };

  return {
    windowStates,
    openWindow,
    closeWindow,
    handleIconClick
  };
};
