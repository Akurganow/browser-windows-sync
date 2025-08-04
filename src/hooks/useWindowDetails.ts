import { useState, useEffect, useCallback, useRef } from 'react';
import type { WindowDetails } from '../types/window';
import { ScreenApiManager } from '../utils/screenApi';

/**
 * Хук для управления деталями окна с оптимизированным отслеживанием изменений
 */
export const useWindowDetails = () => {
  const [windowDetails, setWindowDetails] = useState<WindowDetails>({
    screenX: 0,
    screenY: 0,
    screenWidth: 0,
    screenHeight: 0,
    windowWidth: 0,
    windowHeight: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  /**
   * Обновляет детали окна
   */
  const updateWindowDetails = useCallback(async () => {
    try {
      setError(null);
      const details = await ScreenApiManager.getWindowDetails();
      
      // Проверяем, изменились ли детали (избегаем лишних ререндеров)
      setWindowDetails(prevDetails => {
        const hasChanged = (
          prevDetails.screenX !== details.screenX ||
          prevDetails.screenY !== details.screenY ||
          prevDetails.screenWidth !== details.screenWidth ||
          prevDetails.screenHeight !== details.screenHeight ||
          prevDetails.windowWidth !== details.windowWidth ||
          prevDetails.windowHeight !== details.windowHeight
        );

        return hasChanged ? details : prevDetails;
      });

      setIsLoading(false);
      lastUpdateRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения деталей окна');
      setIsLoading(false);
    }
  }, []);


  /**
   * Принудительное обновление деталей окна
   */
  const forceUpdate = useCallback(() => {
    updateWindowDetails();
  }, [updateWindowDetails]);

  /**
   * Проверяет, изменились ли размеры окна
   */
  const hasWindowSizeChanged = useCallback((newDetails: WindowDetails): boolean => {
    return (
      windowDetails.windowWidth !== newDetails.windowWidth ||
      windowDetails.windowHeight !== newDetails.windowHeight
    );
  }, [windowDetails]);

  /**
   * Проверяет, изменилась ли позиция окна
   */
  const hasWindowPositionChanged = useCallback((newDetails: WindowDetails): boolean => {
    return (
      windowDetails.screenX !== newDetails.screenX ||
      windowDetails.screenY !== newDetails.screenY
    );
  }, [windowDetails]);

  /**
   * Проверяет, изменились ли размеры экрана
   */
  const hasScreenSizeChanged = useCallback((newDetails: WindowDetails): boolean => {
    return (
      windowDetails.screenWidth !== newDetails.screenWidth ||
      windowDetails.screenHeight !== newDetails.screenHeight
    );
  }, [windowDetails]);

  // Инициализация при монтировании
  useEffect(() => {
    updateWindowDetails();
  }, [updateWindowDetails]);

  // Плавное обновление через requestAnimationFrame
  useEffect(() => {
    let frameId: number;

    const loop = () => {
      updateWindowDetails();
      frameId = requestAnimationFrame(loop);
    };

    // Запускаем цикл
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [updateWindowDetails]);

  // Подписка на события изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      // При ресайзе форсируем полное обновление деталей окна включая размеры экрана
      forceUpdate();
    };

    const handleMove = () => {
      updateWindowDetails();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleMove);

    // Подписка на изменения экранов (если поддерживается)
    const unsubscribeScreenChanges = ScreenApiManager.subscribeToScreenChanges(() => {
      forceUpdate();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleMove);
      
      if (unsubscribeScreenChanges) {
        unsubscribeScreenChanges();
      }
    };
  }, [updateWindowDetails, forceUpdate]);

  return {
    windowDetails,
    isLoading,
    error,
    updateWindowDetails: forceUpdate,
    hasWindowSizeChanged,
    hasWindowPositionChanged,
    hasScreenSizeChanged,
  };
};