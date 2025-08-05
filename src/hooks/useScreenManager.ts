import { useEffect } from 'react';
import type { WindowDetails } from '../types/window';
import { useWindowStore } from '../stores/windowStore';

export const useScreenManager = (windowDetails: WindowDetails) => {
  const {
    currentWindowId,
    isInitialized,
    initialize,
    updateCurrentWindow,
    getScreens,
    removeWindow,
    loadAllWindows,
  } = useWindowStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (isInitialized && currentWindowId) {
      updateCurrentWindow(windowDetails);
    }
  }, [isInitialized, currentWindowId, windowDetails, updateCurrentWindow]);


  useEffect(() => {
    const handleUnload = () => {
      if (currentWindowId) {
        removeWindow(currentWindowId);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentWindowId, removeWindow]);

  const screens = getScreens();
  const otherScreens = screens.filter(([id]) => id !== currentWindowId);

  return {
    screens,
    otherScreens,
    screenId: currentWindowId,
    updateOtherScreens: loadAllWindows,
  };
};