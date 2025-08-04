/**
 * Точка в двумерном пространстве
 */
export interface Point {
  /** X координата */
  x: number;
  /** Y координата */
  y: number;
}

/**
 * Прямоугольник с координатами и размерами
 */
export interface Rectangle {
  /** X координата левого верхнего угла */
  x: number;
  /** Y координата левого верхнего угла */
  y: number;
  /** Ширина прямоугольника */
  width: number;
  /** Высота прямоугольника */
  height: number;
}

/**
 * Полигон с точками и SVG путем
 */
export interface Polygon {
  /** Массив точек полигона */
  points: Point[];
  /** SVG путь для отрисовки */
  path: string;
  /** Центр полигона */
  center: Point;
}

/**
 * ViewBox для SVG элемента
 */
export interface ViewBox {
  /** X координата начала */
  x: number;
  /** Y координата начала */
  y: number;
  /** Ширина области просмотра */
  width: number;
  /** Высота области просмотра */
  height: number;
}

/**
 * Границы области
 */
export interface Bounds {
  /** Минимальная X координата */
  minX: number;
  /** Минимальная Y координата */
  minY: number;
  /** Максимальная X координата */
  maxX: number;
  /** Максимальная Y координата */
  maxY: number;
}