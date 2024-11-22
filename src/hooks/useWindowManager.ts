import { useState } from 'react';

export const useWindowManager = () => {
  const [showMelani, setShowMelani] = useState(false);
  const [showRecentApps, setShowRecentApps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);

  const handleWindowToggle = (windowName: string) => {
    const windowSetters = {
      'Melani': setShowMelani,
      'Recent': setShowRecentApps,
      'Settings': setShowSettings,
      'Files': setShowFiles,
      'Profile': setShowProfile,
      'Games': setShowGames,
      'Text Editor': setShowTextEditor
    };

    const setter = windowSetters[windowName as keyof typeof windowSetters];
    if (setter) {
      setter(true);
    }
  };

  return {
    showMelani,
    showRecentApps,
    showSettings,
    showFiles,
    showProfile,
    showGames,
    showTextEditor,
    setShowMelani,
    setShowRecentApps,
    setShowSettings,
    setShowFiles,
    setShowProfile,
    setShowGames,
    setShowTextEditor,
    handleWindowToggle
  };
};