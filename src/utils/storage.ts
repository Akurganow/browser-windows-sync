import type { WindowDetails, Screen } from '../types/window';
import { WINDOW_CONSTANTS } from '../types/window';

/**
 * Utilities for working with localStorage and sessionStorage
 */
export class StorageManager {
  /**
   * Saves window details to localStorage
   */
  static saveWindowDetails(screenId: string, details: WindowDetails): void {
    try {
      window.localStorage.setItem(screenId, JSON.stringify(details));
    } catch (error) {
      console.warn('Failed to save window details to localStorage:', error);
    }
  }

  /**
   * Loads window details from localStorage
   */
  static loadWindowDetails(screenId: string): WindowDetails | null {
    try {
      const data = window.localStorage.getItem(screenId);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load window details from localStorage:', error);
      return null;
    }
  }

  /**
   * Removes window details from localStorage and sessionStorage
   */
  static removeWindowDetails(screenId: string): void {
    try {
      window.localStorage.removeItem(screenId);
      
      // Also clear sessionStorage for this window
      if (window.sessionStorage.getItem(WINDOW_CONSTANTS.STORAGE_PREFIX) === screenId) {
        window.sessionStorage.removeItem(WINDOW_CONSTANTS.STORAGE_PREFIX);
      }
    } catch (error) {
      console.warn('Failed to remove window details from localStorage:', error);
    }
  }

  /**
   * Gets all screens from localStorage with deterministic sorting
   */
  static getAllScreens(): Screen[] {
    try {
      return Object.entries(window.localStorage)
        .filter(([key]) => key.startsWith(WINDOW_CONSTANTS.STORAGE_PREFIX))
        .map(([key, value]) => [key, JSON.parse(value)] as Screen)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)); // Deterministic sorting by ID
    } catch (error) {
      console.warn('Failed to get screens from localStorage:', error);
      return [];
    }
  }

  /**
   * Gets screens except the current one
   */
  static getOtherScreens(currentScreenId: string): Screen[] {
    return StorageManager.getAllScreens()
      .filter(([key]) => key !== currentScreenId);
  }

  /**
   * Generates a unique ID for a window/browser tab
   */
  static generateScreenId(): string {
    const existingScreenId = sessionStorage.getItem(WINDOW_CONSTANTS.STORAGE_PREFIX);

    if (existingScreenId) {
      return existingScreenId;
    }

    // Generates a unique ID for each browser tab/window
    const uniqueWindowId = crypto.randomUUID();
    const fullScreenId = `${WINDOW_CONSTANTS.STORAGE_PREFIX}_${uniqueWindowId}`;

    sessionStorage.setItem(WINDOW_CONSTANTS.STORAGE_PREFIX, fullScreenId);

    return fullScreenId;
  }

  /**
   * Clears all screen data from localStorage
   */
  static clearAllScreens(): void {
    try {
      const keysToRemove = Object.keys(window.localStorage)
        .filter(key => key.startsWith(WINDOW_CONSTANTS.STORAGE_PREFIX));
      
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear screen data:', error);
    }
  }

  /**
   * Checks if localStorage is supported
   */
  static isLocalStorageSupported(): boolean {
    try {
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if sessionStorage is supported
   */
  static isSessionStorageSupported(): boolean {
    try {
      const testKey = '__sessionStorage_test__';
      window.sessionStorage.setItem(testKey, 'test');
      window.sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Subscribes to localStorage changes
   */
  static subscribeToStorageChanges(
    callback: (event: StorageEvent) => void,
    screenId?: string
  ): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key && event.key.startsWith(WINDOW_CONSTANTS.STORAGE_PREFIX)) {
        if (!screenId || event.key !== screenId) {
          callback(event);
        }
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }
}