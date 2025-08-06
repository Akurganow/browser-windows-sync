import {useState, useEffect, useCallback, useRef} from 'react';
import type {WindowDetails} from '../types/window';
import {ScreenApiManager} from '../utils/screenApi';

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

    useCallback(() => {
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
        const handleWindowChange = () => {
            void updateWindowDetails();
        };

        window.addEventListener('resize', handleWindowChange);
        window.addEventListener('move', handleWindowChange);
        window.addEventListener('beforeunload', handleWindowChange);

        const unsubscribeScreenChanges = ScreenApiManager.subscribeToScreenChanges(() => {
            void updateWindowDetails();
        });

        return () => {
            window.removeEventListener('resize', handleWindowChange);
            window.removeEventListener('move', handleWindowChange);
            window.removeEventListener('beforeunload', handleWindowChange);

            if (unsubscribeScreenChanges) {
                unsubscribeScreenChanges();
            }
        };
    }, [updateWindowDetails]);

    return {
        windowDetails,
        isLoading,
        error,
        updateWindowDetails,
    };
};