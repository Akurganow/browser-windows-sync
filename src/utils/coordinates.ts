import type { Point, ViewBox } from '../types/geometry';
import type { WindowDetails } from '../types/window';

/**
 * Утилиты для работы с координатными системами
 */
export class CoordinateSystem {
  /**
   * Преобразует глобальные координаты в локальные относительно окна
   */
  static globalToLocal(globalPoint: Point, windowDetails: WindowDetails): Point {
    return {
      x: globalPoint.x - windowDetails.screenX,
      y: globalPoint.y - windowDetails.screenY,
    };
  }

  /**
   * Преобразует локальные координаты в глобальные
   */
  static localToGlobal(localPoint: Point, windowDetails: WindowDetails): Point {
    return {
      x: localPoint.x + windowDetails.screenX,
      y: localPoint.y + windowDetails.screenY,
    };
  }

  /**
   * Получает центр окна в глобальных координатах
   */
  static getWindowCenter(windowDetails: WindowDetails): Point {
    return {
      x: Math.round(windowDetails.screenX + windowDetails.windowWidth / 2),
      y: Math.round(windowDetails.screenY + windowDetails.windowHeight / 2),
    };
  }

  /**
   * Создает ViewBox для SVG элемента
   */
  static calculateViewBox(windowDetails: WindowDetails): ViewBox {
    return {
      x: 0,
      y: 0,
      width: windowDetails.screenWidth,
      height: windowDetails.screenHeight,
    };
  }

  /**
   * Форматирует ViewBox в строку для SVG
   */
  static formatViewBox(viewBox: ViewBox): string {
    return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  }

  /**
   * Проверяет, находится ли точка внутри прямоугольника
   */
  static isPointInRectangle(
    point: Point,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  /**
   * Вычисляет расстояние между двумя точками
   */
  static getDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Создает CSS переменные для координат
   */
  static createCSSVariables(windowDetails: WindowDetails): Record<string, string> {
    return {
      '--screen-width': `${windowDetails.screenWidth}px`,
      '--screen-height': `${windowDetails.screenHeight}px`,
      '--screen-x': `${-windowDetails.screenX}px`,
      '--screen-y': `${-windowDetails.screenY}px`,
      '--window-width': `${windowDetails.windowWidth}px`,
      '--window-height': `${windowDetails.windowHeight}px`,
    };
  }
}
