/**
 * Point in two-dimensional space
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Rectangle with coordinates and dimensions
 */
export interface Rectangle {
  /** X coordinate of the top-left corner */
  x: number;
  /** Y coordinate of the top-left corner */
  y: number;
  /** Width of the rectangle */
  width: number;
  /** Height of the rectangle */
  height: number;
}

/**
 * Polygon with points and SVG path
 */
export interface Polygon {
  /** Array of polygon points */
  points: Point[];
  /** SVG path for drawing */
  path: string;
  /** Polygon center */
  center: Point;
}

/**
 * ViewBox for SVG element
 */
export interface ViewBox {
  /** X coordinate of the start */
  x: number;
  /** Y coordinate of the start */
  y: number;
  /** Width of the viewing area */
  width: number;
  /** Height of the viewing area */
  height: number;
}

/**
 * Bounds of the area
 */
export interface Bounds {
  /** Minimum X coordinate */
  minX: number;
  /** Minimum Y coordinate */
  minY: number;
  /** Maximum X coordinate */
  maxX: number;
  /** Maximum Y coordinate */
  maxY: number;
}