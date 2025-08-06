import type { WindowDetails } from '../types/window';
import type { ScreenDetails, ScreenInfo, ScreenBounds, ScreenConfig } from '../types/screen';
import { SCREEN_CONSTANTS } from '../types/screen';

/**
 * Utilities for working with Screen Management API
 */
export class ScreenApiManager {
  /**
   * Checks if Screen Management API is supported
   */
  static isScreenManagementSupported(): boolean {
    return 'getScreenDetails' in window;
  }

  /**
   * Gets details of all screens via Screen Management API
   */
  static async getScreenDetails(): Promise<ScreenDetails | null> {
    if (!ScreenApiManager.isScreenManagementSupported()) {
      return null;
    }

    try {
      const screenDetails = await (window as any).getScreenDetails();
      return {
        screens: screenDetails.screens || [],
        currentScreen: screenDetails.currentScreen,
      };
    } catch (error) {
      console.warn('Screen Management API is not available:', error);
      return null;
    }
  }

  /**
   * Calculates bounds of all screens
   */
  static calculateScreenBounds(screens: ScreenInfo[]): ScreenBounds {
    if (screens.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: SCREEN_CONSTANTS.DEFAULT_CONFIG.defaultWidth,
        maxY: SCREEN_CONSTANTS.DEFAULT_CONFIG.defaultHeight,
        totalWidth: SCREEN_CONSTANTS.DEFAULT_CONFIG.defaultWidth,
        totalHeight: SCREEN_CONSTANTS.DEFAULT_CONFIG.defaultHeight,
      };
    }

    const minX = Math.min(...screens.map(s => s.left));
    const minY = Math.min(...screens.map(s => s.top));
    const maxX = Math.max(...screens.map(s => s.left + s.availWidth));
    const maxY = Math.max(...screens.map(s => s.top + s.availHeight));

    return {
      minX,
      minY,
      maxX,
      maxY,
      totalWidth: maxX - minX,
      totalHeight: maxY - minY,
    };
  }

  /**
   * Creates a fallback configuration for cases without Screen Management API
   */
  static createFallbackBounds(config: ScreenConfig = SCREEN_CONSTANTS.DEFAULT_CONFIG): ScreenBounds {
    const { defaultMonitorCount, defaultWidth, defaultHeight, layout } = config;

    if (layout === 'horizontal') {
      return {
        minX: 0,
        minY: 0,
        maxX: defaultWidth * defaultMonitorCount,
        maxY: defaultHeight,
        totalWidth: defaultWidth * defaultMonitorCount,
        totalHeight: defaultHeight,
      };
    } else {
      return {
        minX: 0,
        minY: 0,
        maxX: defaultWidth,
        maxY: defaultHeight * defaultMonitorCount,
        totalWidth: defaultWidth,
        totalHeight: defaultHeight * defaultMonitorCount,
      };
    }
  }

  /**
   * Gets details of a window considering all screens
   */
  static async getWindowDetails(): Promise<WindowDetails> {
    let bounds: ScreenBounds;

    // Attempt to use Screen Management API
    const screenDetails = await ScreenApiManager.getScreenDetails();
    
    if (screenDetails && screenDetails.screens.length > 0) {
      bounds = ScreenApiManager.calculateScreenBounds(screenDetails.screens);
    } else {
      // Fallback: simply use current screen dimensions as is
      const realScreenWidth = window.screen.availWidth;
      const realScreenHeight = window.screen.availHeight;
      
      bounds = {
        minX: 0,
        minY: 0,
        maxX: realScreenWidth,
        maxY: realScreenHeight,
        totalWidth: realScreenWidth,
        totalHeight: realScreenHeight,
      };
    }

    return {
      screenX: window.screenX - bounds.minX,
      screenY: window.screenY - bounds.minY,
      screenWidth: bounds.totalWidth,
      screenHeight: bounds.totalHeight,
      // Use innerWidth/innerHeight to work with display area dimensions without browser frames
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  }

  /**
   * Checks if screen layout has changed
   */
  static async hasScreenLayoutChanged(previousBounds: ScreenBounds): Promise<boolean> {
    const screenDetails = await ScreenApiManager.getScreenDetails();
    
    if (!screenDetails) {
      return false;
    }

    const currentBounds = ScreenApiManager.calculateScreenBounds(screenDetails.screens);
    
    return (
      currentBounds.totalWidth !== previousBounds.totalWidth ||
      currentBounds.totalHeight !== previousBounds.totalHeight ||
      currentBounds.minX !== previousBounds.minX ||
      currentBounds.minY !== previousBounds.minY
    );
  }

  /**
   * Gets current screen info with ID
   */
  static async getCurrentScreenInfo(): Promise<ScreenInfo & { id?: string } | null> {
    const screenDetails = await ScreenApiManager.getScreenDetails();
    
    if (!screenDetails) {
      return null;
    }

    // Find the screen on which the current window is located
    const windowDetails = await ScreenApiManager.getWindowDetails();
    const windowX = windowDetails.screenX;
    const windowY = windowDetails.screenY;
    
    // Get bounds for correct coordinate comparison
    const bounds = ScreenApiManager.calculateScreenBounds(screenDetails.screens);

    const currentScreen = screenDetails.screens.find(screen => {
      const adjustedScreenLeft = screen.left - bounds.minX;
      const adjustedScreenTop = screen.top - bounds.minY;
      return windowX >= adjustedScreenLeft && 
             windowX < adjustedScreenLeft + screen.availWidth &&
             windowY >= adjustedScreenTop && 
             windowY < adjustedScreenTop + screen.availHeight;
    });

    if (!currentScreen) {
      return null;
    }

    // Check if there is an ID in the real API
    const screenWithId = currentScreen as any;
    
    return {
      ...currentScreen,
      id: screenWithId.id || screenWithId.internal?.displayId || screenWithId.label || null
    };
  }

  /**
   * Gets a stable screen ID
   */
  static async getScreenId(): Promise<string> {
    const currentScreen = await ScreenApiManager.getCurrentScreenInfo();
    
    if (currentScreen?.id) {
      return `screen_${currentScreen.id}`;
    }

    // Fallback: create a permanent ID based on screen geometry
    const screenKey = currentScreen 
      ? `${currentScreen.left}_${currentScreen.top}_${currentScreen.availWidth}_${currentScreen.availHeight}`
      : `${(window.screen as any).availLeft || 0}_${(window.screen as any).availTop || 0}_${window.screen.width}_${window.screen.height}`;
    
    return `screen_${screenKey}`;
  }

  /**
   * Subscribes to screen changes (if supported)
   */
  static subscribeToScreenChanges(callback: () => void): (() => void) | null {
    if (!ScreenApiManager.isScreenManagementSupported()) {
      return null;
    }

    // In future versions of Screen Management API, screen change events may appear
    // For now, we use a fallback via resize
    const handler = () => {
      callback();
    };

    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }
}