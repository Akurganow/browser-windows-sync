import type { Point, Polygon, Rectangle, Bounds } from '../types/geometry';
import type { WindowState, Screen } from '../types/window';
import { WINDOW_CONSTANTS } from '../types/window';
import { CoordinateSystem } from './coordinates';
import * as R from 'ramda';

/**
 * Утилиты для геометрических расчетов и создания SVG путей
 */
export class GeometryUtils {
  /**
   * Создает SVG путь для полигона из массива экранов
   */
  static calculatePolygonPath(screens: Screen[]): string {
    if (screens.length === 0) {
      return '';
    }

    if (screens.length === 1) {
      return GeometryUtils.createSingleWindowPath(screens[0]);
    }

    return GeometryUtils.createMultiWindowPath(screens);
  }

  /**
   * Создает SVG путь для текущего окна - только линии к двум соседним окнам в полигоне
   */
  static calculateWindowPath(screens: Screen[], currentWindowId: string): string {
    if (screens.length === 1) {
      return GeometryUtils.createSingleWindowPath(screens[0]);
    }

    const currentScreen = screens.find(([id]) => id === currentWindowId);
    if (!currentScreen) {
      return '';
    }

    const [, currentWindowDetails] = currentScreen;
    
    // Центр текущего окна в его собственных локальных координатах
    const currentCenterLocal = CoordinateSystem.getLocalWindowCenter(currentWindowDetails);

    // Используем диагональ ОКНА, т.к. ViewBox теперь равен размеру окна
    const windowDiagonal = Math.sqrt(
      currentWindowDetails.windowWidth * currentWindowDetails.windowWidth +
      currentWindowDetails.windowHeight * currentWindowDetails.windowHeight
    );

    // Получаем только двух соседних окон в полигоне
    const neighborScreens = GeometryUtils.getTwoNeighborWindows(screens, currentWindowId);
    
    if (neighborScreens.length === 0) {
      // Для одного окна ничего не рисуем в этом режиме
      return '';
    }

    // Создаем линии от текущего окна к двум соседним окнам
    const createLine = ([, otherWindowDetails]: Screen) => {
      // Глобальные координаты центра другого окна
      const targetCenterGlobal = CoordinateSystem.getWindowCenter(otherWindowDetails);
      
      // Преобразуем глобальные координаты цели в локальные координаты текущего окна
      const targetCenterLocal = CoordinateSystem.globalToLocal(targetCenterGlobal, currentWindowDetails);
      
      // Вычисляем направление от локального центра к локальной цели
      const dx = targetCenterLocal.x - currentCenterLocal.x;
      const dy = targetCenterLocal.y - currentCenterLocal.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Если окна почти в одной точке, рисуем луч в случайном направлении
      if (distance < 1) {
        const randomAngle = Math.random() * 2 * Math.PI;
        const endX = currentCenterLocal.x + Math.cos(randomAngle) * windowDiagonal;
        const endY = currentCenterLocal.y + Math.sin(randomAngle) * windowDiagonal;
        return `M${currentCenterLocal.x},${currentCenterLocal.y} L${endX},${endY}`;
      }
      
      // Нормализуем направление и умножаем на диагональ окна
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      const endX = currentCenterLocal.x + normalizedX * windowDiagonal;
      const endY = currentCenterLocal.y + normalizedY * windowDiagonal;
      
      return `M${currentCenterLocal.x},${currentCenterLocal.y} L${endX},${endY}`;
    };

    const lines = R.map(createLine, neighborScreens);

    return lines.join(' ');
  }


  /**
   * Создает путь для одного окна (маленький круг)
   */
  private static createSingleWindowPath(screen: Screen): string {
    const [, windowDetails] = screen;
    const center = CoordinateSystem.getWindowCenter(windowDetails);
    const radius = WINDOW_CONSTANTS.SINGLE_WINDOW_RADIUS;

    return GeometryUtils.createCirclePath(center, radius);
  }

  /**
   * Создает путь для множественных окон (соединяющий полигон)
   */
  private static createMultiWindowPath(screens: Screen[]): string {
    const points = screens.map(([, windowDetails]) => 
      CoordinateSystem.getWindowCenter(windowDetails)
    );

    // Сортируем точки для создания правильного полигона
    const sortedPoints = GeometryUtils.sortPointsForPolygon(points);

    return sortedPoints
      .reduce((acc, point, i) => {
        return acc + (i === 0 ? `M${point.x},${point.y}` : ` L${point.x},${point.y}`);
      }, '') + ' Z';
  }

  /**
   * Создает SVG путь для круга
   */
  static createCirclePath(center: Point, radius: number): string {
    const { x, y } = center;
    return `M${x - radius},${y} A${radius},${radius} 0 1,1 ${x + radius},${y} A${radius},${radius} 0 1,1 ${x - radius},${y} Z`;
  }

  /**
   * Создает SVG путь для прямоугольника
   */
  static createRectanglePath(rect: Rectangle): string {
    const { x, y, width, height } = rect;
    return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
  }

  /**
   * Сортирует точки для создания правильного полигона (по часовой стрелке) со стабильной сортировкой
   */
  static sortPointsForPolygon(points: Point[]): Point[] {
    if (points.length <= 2) {
      return points;
    }

    // Находим центр всех точек
    const center = GeometryUtils.getCentroid(points);

    // Создаем массив с исходными индексами для стабильной сортировки
    return points
      .map((point, originalIndex) => ({ point, originalIndex }))
      .sort((a, b) => {
        const angleA = Math.atan2(a.point.y - center.y, a.point.x - center.x);
        const angleB = Math.atan2(b.point.y - center.y, b.point.x - center.x);
        
        // Если углы одинаковые (с учетом погрешности), сортируем по исходному индексу
        if (Math.abs(angleA - angleB) < 1e-10) {
          return a.originalIndex - b.originalIndex;
        }
        
        return angleA - angleB;
      })
      .map(({ point }) => point);
  }

  /**
   * Вычисляет центроид (геометрический центр) множества точек
   */
  static getCentroid(points: Point[]): Point {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }

    const sum = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
      }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }

  /**
   * Находит соседние окна для создания правильных соединений
   */
  static getNeighborConnections(windows: WindowState[]): Point[] {
    if (windows.length <= 1) {
      return [];
    }

    const centers = windows.map(window => 
      CoordinateSystem.getWindowCenter(window.details)
    );

    // Для простоты соединяем все окна в порядке их расположения
    // В будущем можно улучшить алгоритм для поиска реальных соседей
    return GeometryUtils.sortPointsForPolygon(centers);
  }

  /**
   * Находит только двух соседних окон для текущего окна в полигоне
   */
  static getTwoNeighborWindows(screens: Screen[], currentWindowId: string): Screen[] {
    if (screens.length <= 2) {
      return R.filter(([id]) => id !== currentWindowId, screens);
    }

    // Создаем массив центров с привязкой к исходным экранам
    const screensWithCenters = R.map(
      (screen: Screen) => {
        const [id, windowDetails] = screen;
        const center = CoordinateSystem.getWindowCenter(windowDetails);
        return { screen, center, id };
      },
      screens
    );

    // Сортируем по углу для создания правильного полигона
    const centroid = GeometryUtils.getCentroid(R.map(R.prop('center'), screensWithCenters));
    
    const sortedScreens = R.sort(
      (a, b) => {
        const angleA = Math.atan2(a.center.y - centroid.y, a.center.x - centroid.x);
        const angleB = Math.atan2(b.center.y - centroid.y, b.center.x - centroid.x);
        return angleA - angleB;
      },
      screensWithCenters
    );

    // Находим индекс текущего окна в отсортированном массиве
    const currentIndex = sortedScreens.findIndex(item => item.id === currentWindowId);
    
    if (currentIndex === -1) {
      return [];
    }

    // Находим предыдущего и следующего соседа (с циклическим переходом)
    const prevIndex = (currentIndex - 1 + sortedScreens.length) % sortedScreens.length;
    const nextIndex = (currentIndex + 1) % sortedScreens.length;

    return [
      sortedScreens[prevIndex].screen,
      sortedScreens[nextIndex].screen
    ];
  }


  /**
   * Проверяет, пересекаются ли два прямоугольника
   */
  static doRectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Вычисляет границы множества точек
   */
  static getBounds(points: Point[]): Bounds {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    return {
      minX: Math.min(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxX: Math.max(...points.map(p => p.x)),
      maxY: Math.max(...points.map(p => p.y)),
    };
  }

  /**
   * Создает полигон из массива экранов
   */
  static createPolygon(screens: Screen[]): Polygon {
    const points = screens.map(([, windowDetails]) => 
      CoordinateSystem.getWindowCenter(windowDetails)
    );

    const sortedPoints = GeometryUtils.sortPointsForPolygon(points);
    const path = GeometryUtils.calculatePolygonPath(screens);
    const center = GeometryUtils.getCentroid(sortedPoints);

    return {
      points: sortedPoints,
      path,
      center,
    };
  }

  /**
   * Вычисляет площадь полигона
   */
  static getPolygonArea(points: Point[]): number {
    if (points.length < 3) {
      return 0;
    }

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Проверяет, находится ли точка внутри полигона
   */
  static isPointInPolygon(point: Point, polygon: Point[]): boolean {
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
  }

  /**
   * Создает сглаженный путь через точки (кривые Безье)
   */
  static createSmoothPath(points: Point[], tension: number = 0.3): string {
    if (points.length < 2) {
      return '';
    }

    if (points.length === 2) {
      return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
    }

    let path = `M${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1] || points[0]; // Замыкаем на первую точку

      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y + (curr.y - prev.y) * tension;
      const cp2x = curr.x - (next.x - prev.x) * tension;
      const cp2y = curr.y - (next.y - prev.y) * tension;

      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }

    return path + ' Z';
  }
}
