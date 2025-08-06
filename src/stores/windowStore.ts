import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WindowDetails, Screen } from '../types/window';
import { StorageManager } from '../utils/storage';
import { createBroadcastSync, type LocalSync } from '../utils/localSync';

interface WindowState {
  /** ID of the current window */
  currentWindowId: string | null;
  /** Details of the current window */
  currentWindowDetails: WindowDetails | null;
  /** All windows in the system */
  allWindows: Map<string, WindowDetails>;
  /** Is the state initialized */
  isInitialized: boolean;
  /** Flag for initialization to allow publishing without focus check */
  isInitializing: boolean;
}

interface WindowActions {
  /** Initialization of the store with screen ID */
  initialize: () => Promise<void>;
  /** Update details of the current window */
  updateCurrentWindow: (details: WindowDetails) => void;
  /** Update details of another window */
  updateOtherWindow: (windowId: string, details: WindowDetails) => void;
  /** Remove window from the list */
  removeWindow: (windowId: string) => void;
  /** Load all windows from localStorage */
  loadAllWindows: () => void;
  /** Get array of screens for compatibility */
  getScreens: () => Screen[];
  /** Get LocalSync for synchronization */
  getLocalSync: () => LocalSync | null;
  /** Clear all data */
  clear: () => void;
}

type WindowStore = WindowState & WindowActions;

// Create synchronization between windows
let windowSync: LocalSync | null = null;

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    currentWindowId: null,
    currentWindowDetails: null,
    allWindows: new Map(),
    isInitialized: false,
    isInitializing: false,

    // Actions
    initialize: async () => {
      try {
        // Get unique ID of the browser tab/window
        const windowId = StorageManager.generateScreenId();
        
        // Get current window details SYNCHRONOUSLY during initialization
        const { ScreenApiManager } = await import('../utils/screenApi');
        const currentWindowDetails = await ScreenApiManager.getWindowDetails();
        
        // Initialize state with current window data
        const allWindows = new Map<string, WindowDetails>();
        allWindows.set(windowId, currentWindowDetails);

        set({
          currentWindowId: windowId,
          currentWindowDetails,
          allWindows,
          isInitialized: true,
          isInitializing: true,
        });

        // Reset initialization flag after 5 seconds
        setTimeout(() => {
          set({ isInitializing: false });
        }, 5000);

        // Initialize synchronization between windows via BroadcastChannel
        windowSync = createBroadcastSync({
          channelName: 'browser-windows-sync',
          readState: () => get().allWindows,
          applyState: (newAllWindows) => {
            const { allWindows: currentAllWindows } = get();
            
            // Ensure it's a Map
            const incomingWindows = newAllWindows instanceof Map 
              ? newAllWindows 
              : new Map(Object.entries(newAllWindows || {}) as [string, WindowDetails][]);
            
            // Merge current data with incoming, prioritize incoming data
            const mergedWindows = new Map(currentAllWindows);
            for (const [windowId, windowDetails] of incomingWindows) {
              mergedWindows.set(windowId, windowDetails);
            }
            
            set({ allWindows: mergedWindows });
          },
        });

        // Request initial state from other windows and wait for response
        setTimeout(async () => {
          if (windowSync) {
            windowSync.requestInitialState();
            
            // Wait for initial synchronization to complete
            await windowSync.waitForInitialSync();
          }
        }, 50);
      } catch (error) {
        // Error during initialization - use fallback with empty state
        const windowId = StorageManager.generateScreenId();
        const allWindows = new Map<string, WindowDetails>();

        set({
          currentWindowId: windowId,
          allWindows,
          isInitialized: true,
          isInitializing: true,
        });

        // Reset initialization flag after 5 seconds
        setTimeout(() => {
          set({ isInitializing: false });
        }, 5000);
      }
    },

    updateCurrentWindow: (details: WindowDetails) => {
      const { currentWindowId, allWindows, isInitializing } = get();
      
      if (!currentWindowId) {
        return;
      }

      // Update in store
      const newAllWindows = new Map(allWindows);
      newAllWindows.set(currentWindowId, details);

      set({
        currentWindowDetails: details,
        allWindows: newAllWindows,
      });

      // Publish changes via BroadcastChannel if window is in focus or during initialization
      if (windowSync && !windowSync.isApplyingRemote() && (isInitializing || document.hasFocus())) {
        windowSync.publish();
      }
    },

    updateOtherWindow: (windowId: string, details: WindowDetails) => {
      const { allWindows } = get();
      
      const newAllWindows = new Map(allWindows);
      newAllWindows.set(windowId, details);

      set({ allWindows: newAllWindows });
    },

    removeWindow: (windowId: string) => {
      const { allWindows, currentWindowId, isInitializing } = get();
      
      if (windowId === currentWindowId) {
        return;
      }

      const newAllWindows = new Map(allWindows);
      newAllWindows.delete(windowId);

      set({ allWindows: newAllWindows });

      // Publish changes via BroadcastChannel if window is in focus or during initialization
      if (windowSync && !windowSync.isApplyingRemote() && (isInitializing || document.hasFocus())) {
        windowSync.publish();
      }
    },

    loadAllWindows: () => {
      // BroadcastChannel automatically synchronizes state between windows
      // This method is no longer needed, but kept for compatibility
    },

    getScreens: (): Screen[] => {
      const { allWindows } = get();
      
      // Check if allWindows is a Map
      if (!(allWindows instanceof Map)) {
        // If it's an object, convert to Map
        const mapFromObject = new Map(Object.entries(allWindows || {}) as [string, WindowDetails][]);
        set({ allWindows: mapFromObject });
        return Array.from(mapFromObject.entries());
      }
      
      return Array.from(allWindows.entries());
    },

    getLocalSync: () => {
      return windowSync;
    },

    clear: () => {
      // Clear synchronization
      if (windowSync) {
        windowSync.destroy();
        windowSync = null;
      }

      // Clear old data (for compatibility)
      StorageManager.clearAllScreens();

      set({
        currentWindowId: null,
        currentWindowDetails: null,
        allWindows: new Map(),
        isInitialized: false,
      });
    },
  }))
);

