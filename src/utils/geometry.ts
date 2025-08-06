import type {Bounds, Point, Polygon, Rectangle} from '../types/geometry';
import type {Screen, WindowState} from '../types/window';
import {WINDOW_CONSTANTS} from '../types/window';
import {CoordinateSystem} from './coordinates';
import {always, find, head, ifElse, isEmpty, length, map, prop, propEq, reduce, sortBy, when} from 'ramda';

export const calculatePolygonPath = (screens: Screen[]): string => {
    if (isEmpty(screens)) {
        return '';
    }

    if (length(screens) === 1) {
        return createSingleWindowPath(head(screens)!);
    }

    return createMultiWindowPath(screens);
};

export const calculateWindowPath = (screens: Screen[], currentWindowId: string): string => {
    if (length(screens) === 1) {
        return createSingleWindowPath(head(screens)!);
    }

    const currentScreen = find(propEq(currentWindowId, 0), screens);
    if (!currentScreen) {
        return '';
    }

    const globalPoints = map(
        ([, windowDetails]) => CoordinateSystem.getWindowCenter(windowDetails),
        screens
    );

    const sortedGlobalPoints = sortPointsForPolygon(globalPoints);

    const pathSegments = sortedGlobalPoints.map((point: Point, i: number) => 
        i === 0 ? `M${point.x},${point.y}` : ` L${point.x},${point.y}`
    );
    
    return reduce((acc: string, segment: string) => acc + segment, '', pathSegments) + ' Z';
};

const createSingleWindowPath = (screen: Screen): string => {
    const [, windowDetails] = screen;
    const center = CoordinateSystem.getWindowCenter(windowDetails);
    const radius = WINDOW_CONSTANTS.SINGLE_WINDOW_RADIUS;

    return createCirclePath(center, radius);
};

const createMultiWindowPath = (screens: Screen[]): string => {
    const points = map(
        ([, windowDetails]) => CoordinateSystem.getWindowCenter(windowDetails),
        screens
    );

    const sortedPoints = sortPointsForPolygon(points);

    const pathSegments = sortedPoints.map((point: Point, i: number) => 
        i === 0 ? `M${point.x},${point.y}` : ` L${point.x},${point.y}`
    );
    
    return reduce((acc: string, segment: string) => acc + segment, '', pathSegments) + ' Z';
};

export const createCirclePath = (center: Point, radius: number): string => {
    const {x, y} = center;
    return `M${x - radius},${y} A${radius},${radius} 0 1,1 ${x + radius},${y} A${radius},${radius} 0 1,1 ${x - radius},${y} Z`;
};

export const createRectanglePath = (rect: Rectangle): string => {
    const {x, y, width, height} = rect;
    return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
};

export const sortPointsForPolygon = (points: Point[]): Point[] => {
    return when<Point[], Point[]>(
        (pts: Point[]) => length(pts) > 2,
        (pts: Point[]) => {
            const center = getCentroid(pts);
            
            const indexedPoints = pts.map((point: Point, originalIndex: number) => ({point, originalIndex}));
            const sortedIndexedPoints = sortBy((item: {point: Point, originalIndex: number}) =>
                Math.atan2(item.point.y - center.y, item.point.x - center.x)
            )(indexedPoints);
            
            return sortedIndexedPoints.map(item => item.point);
        }
    )(points) as Point[];
};

export const getCentroid = (points: Point[]): Point => {
    return ifElse(
        isEmpty,
        always({x: 0, y: 0}),
        (pts: Point[]) => {
            const sum = reduce(
                (acc: Point, point: Point) => ({
                    x: acc.x + point.x,
                    y: acc.y + point.y,
                }),
                {x: 0, y: 0},
                pts
            );

            return {
                x: sum.x / length(pts),
                y: sum.y / length(pts),
            };
        }
    )(points);
};

export const getNeighborConnections = (windows: WindowState[]): Point[] => {
    return when<WindowState[], Point[]>(
        (wins: WindowState[]) => length(wins) > 1,
        (wins: WindowState[]) => {
            const centers = map(
                (window: WindowState) => CoordinateSystem.getWindowCenter(window.details),
                wins
            );
            return sortPointsForPolygon(centers);
        }
    )(windows) as Point[] || [];
};

export const doRectanglesIntersect = (rect1: Rectangle, rect2: Rectangle): boolean => {
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );
};

export const getBounds = (points: Point[]): Bounds => {
    return ifElse(
        isEmpty,
        always({minX: 0, minY: 0, maxX: 0, maxY: 0}),
        (pts: Point[]) => {
            const xValues = map(prop('x'), pts);
            const yValues = map(prop('y'), pts);
            
            return {
                minX: Math.min(...xValues),
                minY: Math.min(...yValues),
                maxX: Math.max(...xValues),
                maxY: Math.max(...yValues),
            };
        }
    )(points);
};

/**
 * Creates a polygon from an array of screens
 */
export const createPolygon = (screens: Screen[]): Polygon => {
    const points = map(
        ([, windowDetails]) => CoordinateSystem.getWindowCenter(windowDetails),
        screens
    );

    const sortedPoints = sortPointsForPolygon(points);
    const path = calculatePolygonPath(screens);
    const center = getCentroid(sortedPoints);

    return {
        points: sortedPoints,
        path,
        center,
    };
};

/**
 * Calculates the area of a polygon
 */
export const getPolygonArea = (points: Point[]): number => {
    return when<Point[], number>(
        (pts: Point[]) => length(pts) >= 3,
        (pts: Point[]) => {
            let area = 0;
            for (let i = 0; i < pts.length; i++) {
                const j = (i + 1) % pts.length;
                area += pts[i].x * pts[j].y;
                area -= pts[j].x * pts[i].y;
            }
            return Math.abs(area) / 2;
        }
    )(points) as number || 0;
};

/**
 * Checks if a point is inside a polygon
 */
export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (
            polygon[i].y > point.y !== polygon[j].y > point.y &&
            point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
        ) {
            inside = !inside;
        }
    }

    return inside;
};

/**
 * Creates a smoothed path through points (Bezier curves)
 */
export const createSmoothPath = (points: Point[], tension: number = 0.3): string => {
    return when<Point[], string>(
        (pts: Point[]) => length(pts) >= 2,
        (pts: Point[]) => {
            if (length(pts) === 2) {
                return `M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y}`;
            }

            let path = `M${pts[0].x},${pts[0].y}`;

            for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const next = pts[i + 1] || pts[0]; // Close to the first point

                const cp1x = prev.x + (curr.x - prev.x) * tension;
                const cp1y = prev.y + (curr.y - prev.y) * tension;
                const cp2x = curr.x - (next.x - prev.x) * tension;
                const cp2y = curr.y - (next.y - prev.y) * tension;

                path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
            }

            return path + ' Z';
        }
    )(points) as string || '';
};
