import { useEffect } from 'react';
import type { WindowDetails } from '../types/window';
import { useWindowStore } from '../stores/windowStore';

/**
 * Хук для управления экранами через Zustand store
 */
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

  // Инициализация store при первом запуске
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Обновление текущего окна при изменении detalей
  useEffect(() => {
    if (isInitialized && currentWindowId) {
      updateCurrentWindow(windowDetails);
    }
  }, [isInitialized, currentWindowId, windowDetails, updateCurrentWindow]);


  // Очистка при размонтировании
  useEffect(() => {
    const handleUnload = () => {
      if (currentWindowId) {
        removeWindow(currentWindowId);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // Не вызываем handleUnload в cleanup, так как это вызовет удаление при каждом ререндере
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