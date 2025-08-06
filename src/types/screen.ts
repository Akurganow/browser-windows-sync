/**
 * Screen information from Screen Management API
 */
export interface ScreenInfo {
  /** Left screen coordinate */
  left: number;
  /** Top screen coordinate */
  top: number;
  /** Available screen width */
  availWidth: number;
  /** Available screen height */
  availHeight: number;
  /** Is this screen primary */
  isPrimary?: boolean;
  /** Screen scale */
  devicePixelRatio?: number;
}

/**
 * Details of all screens from Screen Management API
 */
export interface ScreenDetails {
  /** Array of all screens */
  screens: ScreenInfo[];
  /** Current screen */
  currentScreen?: ScreenInfo;
}

/**
 * Screen configuration for fallback mode
 */
export interface ScreenConfig {
  /** Default number of monitors (default) */
  defaultMonitorCount: number;
  /** Width of one monitor */
  defaultWidth: number;
  /** Height of one monitor */
  defaultHeight: number;
  /** Monitor layout (horizontal | vertical) */
  layout: 'horizontal' | 'vertical';
}

/**
 * Result of calculating common screen bounds
 */
export interface ScreenBounds {
  /** Minimum X coordinate */
  minX: number;
  /** Minimum Y coordinate */
  minY: number;
  /** Maximum X coordinate */
  maxX: number;
  /** Maximum Y coordinate */
  maxY: number;
  /** Total width */
  totalWidth: number;
  /** Total height */
  totalHeight: number;
}

/**
 * Constants for working with screens
 */
export const SCREEN_CONSTANTS = {
  /** Default configuration */
  DEFAULT_CONFIG: {
    defaultMonitorCount: 3,
    defaultWidth: 1920,
    defaultHeight: 1080,
    layout: 'horizontal' as const,
  },
  /** Minimum screen dimensions */
  MIN_DIMENSIONS: {
    width: 800,
    height: 600,
  },
} as const;