import { useState, useEffect, useCallback, useRef } from 'react';
import type { WindowDetails } from '../types/window';
import { ScreenApiManager } from '../utils/screenApi';

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

  const updateWindowDetails = useCallback(async () => {
    try {
      setError(null);
      const details = await ScreenApiManager.getWindowDetails();

      setWindowDetails(details);

      setIsLoading(false);
      lastUpdateRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting window details');
      setIsLoading(false);
    }
  }, []);


  const forceUpdate = useCallback(() => {
    void updateWindowDetails();
  }, [updateWindowDetails]);

  useEffect(() => {
    void updateWindowDetails();
  }, [updateWindowDetails]);

  useEffect(() => {
    let frameId: number;

    const loop = () => {
      void updateWindowDetails();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [updateWindowDetails]);

  useEffect(() => {
    const handleResize = () => {
      forceUpdate();
    };

    const handleMove = () => {
      void updateWindowDetails();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleMove);

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
  };
};