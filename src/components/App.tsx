import React, {CSSProperties, useCallback, useEffect, useMemo, useState} from 'react'

type WindowDetails = {
    sX: number;
    sY: number;
    sW: number;
    sH: number;
    w: number;
    h: number;
}

type Screen = [string, WindowDetails]

const INTERVAL = 16;
const STORAGE_PREFIX = 'screenId';

const App = () => {
    const [windowDetails, setWindowDetails] = useState(getWindowDetails());
    const screenId = useMemo(() => `${STORAGE_PREFIX}${getScreenId()}`, [])
    const screens = useMemo(() => {
        const screens = getScreens().filter(([key]) => key !== screenId)
        const currentScreen = [screenId, windowDetails] as Screen

        return [currentScreen, ...screens]
    }, [screenId, windowDetails])
    const path = useMemo(() => getPath(screens), [screens])

    const positionStyle = useMemo<CSSProperties>(() => ({
        transform: `translate(${-windowDetails.sX}px, ${-windowDetails.sY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: windowDetails.sW,
        height: windowDetails.sH,
    }), [windowDetails.sH, windowDetails.sW, windowDetails.sX, windowDetails.sY]);

    const updateWindowDetails = useCallback(() => {
        const details = getWindowDetails()

        setWindowDetails(details)
        window.localStorage.setItem(screenId, JSON.stringify(details))
    }, [screenId])

    const handleUnload = useCallback(() => {
        window.localStorage.removeItem(screenId);
    }, [screenId])

    useEffect(() => {
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [handleUnload]);

    useEffect(() => {
        updateWindowDetails();

        const windowDetailsIntervalId = setInterval(() => requestAnimationFrame(updateWindowDetails), INTERVAL);

        return () => {
            clearInterval(windowDetailsIntervalId);
        };
    }, [updateWindowDetails])

    const svgStyle = useMemo<CSSProperties>(() => ({
        ...positionStyle,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    }), [positionStyle]);

    const imageStyle = useMemo<CSSProperties>(() => ({
        ...positionStyle,
        zIndex: -1,
        objectFit: 'cover',
    }), [positionStyle]);

    return (
        <>
            <svg style={svgStyle} viewBox={`0 0 ${windowDetails.sW} ${windowDetails.sH}`}>
                <path d={path} stroke="yellow" strokeWidth="3" fill="transparent"/>
            </svg>
            <img src="https://picsum.photos/id/10/1920/1080" style={imageStyle} alt="" />
        </>
    );
};

export default App;

function getPath(screens = getScreens()) {
    return screens
        .map(([_key, screen]) => {
            const x = screen.sX + screen.w / 2;
            const y = screen.sY + screen.h / 2;
            return { x, y };
        })
        .reduce((acc, point, i) => {
            return acc + (i === 0 ? `M${point.x},${point.y}` : ` L${point.x},${point.y}`);
        }, '') + ' Z'
}

function getWindowDetails(): WindowDetails {
    return {
        sX: window.screenX,
        sY: window.screenY,
        sW: window.screen.availWidth,
        sH: window.screen.availHeight,
        w: window.outerWidth,
        h: window.innerHeight,
    };
}

function getScreens(): Screen[] {
    return Object.entries(window.localStorage)
        .filter(([key]) => key.startsWith(STORAGE_PREFIX))
        .map(([key, value]) => [key, JSON.parse(value)]);
}

function getScreenId() {
    const existingScreenId = sessionStorage.getItem(STORAGE_PREFIX);

    if (existingScreenId) {
        return parseInt(existingScreenId.replace(STORAGE_PREFIX, ''), 10);
    }

    const existingScreens = Object.keys(window.localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => parseInt(key.replace(STORAGE_PREFIX, ''), 10))

    const newScreenId = existingScreens.length > 0 ? Math.max(...existingScreens) + 1 : 0;

    sessionStorage.setItem(STORAGE_PREFIX, `${STORAGE_PREFIX}${newScreenId}`);

    return newScreenId
}
