/**
 * Window details with coordinates and dimensions
 */
export interface WindowDetails {
  /** X coordinate of the window on the screen */
  screenX: number;
  /** Y coordinate of the window on the screen */
  screenY: number;
  /** Total width of all screens */
  screenWidth: number;
  /** Total height of all screens */
  screenHeight: number;
  /** Window width */
  windowWidth: number;
  /** Window height */
  windowHeight: number;
}

/**
 * Window state with identifier and activity
 */
export interface WindowState {
  /** Unique window identifier */
  id: string;
  /** Window details */
  details: WindowDetails;
  /** Is the window active */
  isActive: boolean;
}

/**
 * Type for representing a screen as a tuple [id, details]
 */
export type Screen = [string, WindowDetails];

/**
 * Constants for working with windows
 */
export const WINDOW_CONSTANTS = {
  /** LocalStorage prefix */
  STORAGE_PREFIX: 'screenId',
  /** Radius for a single window */
  SINGLE_WINDOW_RADIUS: 5,
} as const;