import { useMemo } from 'react';
import type { Screen } from '../types/window';
import { calculateWindowPath, calculatePolygonPath } from '../utils/geometry';
import { CoordinateSystem } from '../utils/coordinates';

export const usePolygonPath = (
  screens: Screen[], 
  currentWindowId?: string
): {
  path: string;
  polygon: string;
  viewBox: string;
  screenCount: number;
} => {
  const path = useMemo(() => {
    if (currentWindowId) {
      return calculateWindowPath(screens, currentWindowId);
    }
    return calculatePolygonPath(screens);
  }, [screens, currentWindowId]);

  const polygon = useMemo(() => {
    return calculatePolygonPath(screens);
  }, [screens]);

  const viewBox = useMemo(() => {
    if (screens.length === 0) {
      return '0 0 1920 1080';
    }

    if (currentWindowId) {
      const currentScreen = screens.find(([id]) => id === currentWindowId);
      if (currentScreen) {
        const [, currentWindowDetails] = currentScreen;
        
        return `${currentWindowDetails.screenX} ${currentWindowDetails.screenY} ${currentWindowDetails.windowWidth} ${currentWindowDetails.windowHeight}`;
      }
    }

    const [, firstWindowDetails] = screens[0];
    const viewBoxObj = CoordinateSystem.calculateViewBox(firstWindowDetails);
    return CoordinateSystem.formatViewBox(viewBoxObj);
  }, [screens, currentWindowId]);

  const screenCount = screens.length;

  return {
    path,
    polygon,
    viewBox,
    screenCount,
  };
};
