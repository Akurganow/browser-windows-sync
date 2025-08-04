import { useMemo } from 'react';
import type { Screen } from '../types/window';
import { GeometryUtils } from '../utils/geometry';
import { CoordinateSystem } from '../utils/coordinates';

/**
 * Хук для расчета путей полигона с мемоизацией
 */
export const usePolygonPath = (
  screens: Screen[], 
  currentWindowId?: string
) => {
  const path = useMemo(() => {
    if (currentWindowId) {
      return GeometryUtils.calculateWindowPath(screens, currentWindowId);
    }
    return GeometryUtils.calculatePolygonPath(screens);
  }, [screens, currentWindowId]);

  const polygon = useMemo(() => {
    return GeometryUtils.createPolygon(screens);
  }, [screens]);

  const viewBox = useMemo(() => {
    if (screens.length === 0) {
      return '0 0 1920 1080';
    }

    // Если есть currentWindowId, создаем ViewBox размером с диагональ экрана в каждую сторону
    if (currentWindowId) {
      const currentScreen = screens.find(([id]) => id === currentWindowId);
      if (currentScreen) {
        const [, currentWindowDetails] = currentScreen;
        return `0 0 ${currentWindowDetails.windowWidth} ${currentWindowDetails.windowHeight}`;
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
