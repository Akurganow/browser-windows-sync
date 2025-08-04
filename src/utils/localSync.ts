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

    // Создаем Promise для ожидания начальной синхронизации
    this.initialSyncPromise = new Promise<void>((resolve) => {
      this.initialSyncResolve = resolve;
      
      // Автоматически резолвим через 3 секунды, если никто не ответил
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
        
        // Конвертируем объект обратно в Map с правильной типизацией
        const stateMap = new Map(Object.entries(data || {}) as [string, WindowDetails][]);
        this.applyState(stateMap);
        
        // Отмечаем, что получили данные, и резолвим Promise начальной синхронизации
        if (!this.hasReceivedInitialData && stateMap.size > 0) {
          this.hasReceivedInitialData = true;
          if (this.initialSyncResolve) {
            this.initialSyncResolve();
            this.initialSyncResolve = null;
          }
        }
        
        this.isApplyingRemoteState = false;
      } else if (type === 'request-state') {
        // Другое окно запрашивает наше состояние - отправляем его через специальный метод
        this.publishStateResponse();
      } else if (type === 'request-initial-state') {
        // Новое окно запрашивает полное состояние для инициализации
        this.publishInitialStateResponse();
      }
    } catch (error) {
      this.isApplyingRemoteState = false;
    }
  }

  publish(): void {
    if (this.isApplyingRemoteState) {
      return; // Избегаем циклической синхронизации
    }

    try {
      const currentState = this.readState();
      
      // Конвертируем Map в объект для передачи через BroadcastChannel
      const stateObject = Object.fromEntries(currentState.entries());
      
      this.channel.postMessage({
        type: 'window-state-update',
        data: stateObject,
        timestamp: Date.now()
      });
    } catch (error) {
      // Ошибка публикации - игнорируем
    }
  }

  /**
   * Отправляет состояние в ответ на запрос, минуя обычные проверки фокуса
   */
  private publishStateResponse(): void {
    if (this.isApplyingRemoteState) {
      return; // Избегаем циклической синхронизации
    }

    try {
      const currentState = this.readState();
      
      // Отправляем состояние только если у нас есть данные о нескольких окнах
      // или если это единственное окно с полными данными
      if (currentState.size > 0) {
        // Конвертируем Map в объект для передачи через BroadcastChannel
        const stateObject = Object.fromEntries(currentState.entries());
        
        this.channel.postMessage({
          type: 'window-state-update',
          data: stateObject,
          timestamp: Date.now(),
          isResponse: true // Помечаем как ответ на запрос
        });
      }
    } catch (error) {
      // Ошибка публикации - игнорируем
    }
  }

  /**
   * Отправляет полное состояние для инициализации нового окна
   */
  private publishInitialStateResponse(): void {
    if (this.isApplyingRemoteState) {
      return; // Избегаем циклической синхронизации
    }

    try {
      const currentState = this.readState();
      
      // Всегда отправляем состояние для инициализации, даже если у нас только одно окно
      const stateObject = Object.fromEntries(currentState.entries());
      
      this.channel.postMessage({
        type: 'window-state-update',
        data: stateObject,
        timestamp: Date.now(),
        isInitialResponse: true // Помечаем как ответ на запрос инициализации
      });
    } catch (error) {
      // Ошибка публикации - игнорируем
    }
  }

  requestState(): void {
    try {
      this.channel.postMessage({
        type: 'request-state',
        timestamp: Date.now()
      });
    } catch (error) {
      // Ошибка запроса - игнорируем
    }
  }

  /**
   * Запрашивает полное состояние для инициализации нового окна
   */
  requestInitialState(): void {
    try {
      this.channel.postMessage({
        type: 'request-initial-state',
        timestamp: Date.now()
      });
    } catch (error) {
      // Ошибка запроса - игнорируем
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