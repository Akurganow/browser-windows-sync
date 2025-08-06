import type { WindowDetails } from '../types/window';

export interface LocalSync {
  publish: () => void;
  requestState: () => void;
  requestInitialState: () => void;
  isApplyingRemote: () => boolean;
  destroy: () => void;
  waitForInitialSync: () => Promise<void>;
}

interface BroadcastSyncOptions {
  channelName: string;
  readState: () => Map<string, WindowDetails>;
  applyState: (state: Map<string, WindowDetails>) => void;
}

class BroadcastSync implements LocalSync {
  private channel: BroadcastChannel;
  private readState: () => Map<string, WindowDetails>;
  private applyState: (state: Map<string, WindowDetails>) => void;
  private isApplyingRemoteState = false;
  private initialSyncResolve: (() => void) | null = null;
  private initialSyncPromise: Promise<void>;
  private hasReceivedInitialData = false;

  constructor(options: BroadcastSyncOptions) {
    this.channel = new BroadcastChannel(options.channelName);
    this.readState = options.readState;
    this.applyState = options.applyState;

    // Create a Promise to wait for initial synchronization
    this.initialSyncPromise = new Promise<void>((resolve) => {
      this.initialSyncResolve = resolve;
      
      // Automatically resolve after 3 seconds if no one responded
      setTimeout(() => {
        if (!this.hasReceivedInitialData) {
          this.hasReceivedInitialData = true;
          resolve();
        }
      }, 3000);
    });

    this.channel.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    try {
      const { type, data } = event.data;
      
      if (type === 'window-state-update') {
        this.isApplyingRemoteState = true;
        
        // Convert object back to Map with correct type
        const stateMap = new Map(Object.entries(data || {}) as [string, WindowDetails][]);
        this.applyState(stateMap);
        
        // Mark that we received data and resolve the initial synchronization Promise
        if (!this.hasReceivedInitialData && stateMap.size > 0) {
          this.hasReceivedInitialData = true;
          if (this.initialSyncResolve) {
            this.initialSyncResolve();
            this.initialSyncResolve = null;
          }
        }
        
        this.isApplyingRemoteState = false;
      } else if (type === 'request-state') {
        // Another window requests our state - send it via a special method
        this.publishStateResponse();
      } else if (type === 'request-initial-state') {
        // A new window requests full state for initialization
        this.publishInitialStateResponse();
      }
    } catch (error) {
      this.isApplyingRemoteState = false;
    }
  }

  publish(): void {
    if (this.isApplyingRemoteState) {
      return; // Avoid circular synchronization
    }

    try {
      const currentState = this.readState();
      
      // Convert Map to object for transmission via BroadcastChannel
      const stateObject = Object.fromEntries(currentState.entries());
      
      this.channel.postMessage({
        type: 'window-state-update',
        data: stateObject,
        timestamp: Date.now()
      });
    } catch (error) {
      // Publication error - ignore
    }
  }

  /**
   * Sends state in response to a request, bypassing normal focus checks
   */
  private publishStateResponse(): void {
    if (this.isApplyingRemoteState) {
      return; // Avoid circular synchronization
    }

    try {
      const currentState = this.readState();
      
      // Send state only if we have data about multiple windows
      // or if it's the only window with full data
      if (currentState.size > 0) {
        // Convert Map to object for transmission via BroadcastChannel
        const stateObject = Object.fromEntries(currentState.entries());
        
        this.channel.postMessage({
          type: 'window-state-update',
          data: stateObject,
          timestamp: Date.now(),
          isResponse: true // Mark as response to a request
        });
      }
    } catch (error) {
      // Publication error - ignore
    }
  }

  /**
   * Sends full state for initialization of a new window
   */
  private publishInitialStateResponse(): void {
    if (this.isApplyingRemoteState) {
      return; // Avoid circular synchronization
    }

    try {
      const currentState = this.readState();
      
      // Always send state for initialization, even if we only have one window
      const stateObject = Object.fromEntries(currentState.entries());
      
      this.channel.postMessage({
        type: 'window-state-update',
        data: stateObject,
        timestamp: Date.now(),
        isInitialResponse: true // Mark as response to an initialization request
      });
    } catch (error) {
      // Publication error - ignore
    }
  }

  requestState(): void {
    try {
      this.channel.postMessage({
        type: 'request-state',
        timestamp: Date.now()
      });
    } catch (error) {
      // Request error - ignore
    }
  }

  /**
   * Requests full state for initialization of a new window
   */
  requestInitialState(): void {
    try {
      this.channel.postMessage({
        type: 'request-initial-state',
        timestamp: Date.now()
      });
    } catch (error) {
      // Request error - ignore
    }
  }

  isApplyingRemote(): boolean {
    return this.isApplyingRemoteState;
  }

  async waitForInitialSync(): Promise<void> {
    return this.initialSyncPromise;
  }

  destroy(): void {
    this.channel.close();
  }
}

export function createBroadcastSync(options: BroadcastSyncOptions): LocalSync {
  return new BroadcastSync(options);
}