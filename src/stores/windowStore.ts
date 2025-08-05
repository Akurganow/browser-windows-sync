import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WindowDetails, Screen } from '../types/window';
import { StorageManager } from '../utils/storage';
import { createBroadcastSync, type LocalSync } from '../utils/localSync';

interface WindowState {
  /** ID текущего окна */
  currentWindowId: string | null;
  /** Детали текущего окна */
  currentWindowDetails: WindowDetails | null;
  /** Все окна в системе */
  allWindows: Map<string, WindowDetails>;
  /** Инициализировано ли состояние */
  isInitialized: boolean;
  /** Флаг инициализации для разрешения публикации без проверки фокуса */
  isInitializing: boolean;
}

interface WindowActions {
  /** Инициализация store с получением ID экрана */
  initialize: () => Promise<void>;
  /** Обновление деталей текущего окна */
  updateCurrentWindow: (details: WindowDetails) => void;
  /** Обновление данных другого окна */
  updateOtherWindow: (windowId: string, details: WindowDetails) => void;
  /** Удаление окна из списка */
  removeWindow: (windowId: string) => void;
  /** Загрузка всех окон из localStorage */
  loadAllWindows: () => void;
  /** Получение массива экранов для совместимости */
  getScreens: () => Screen[];
  /** Получение LocalSync для работы с синхронизацией */
  getLocalSync: () => LocalSync | null;
  /** Очистка всех данных */
  clear: () => void;
}

type WindowStore = WindowState & WindowActions;

// Создаем синхронизацию между окнами
let windowSync: LocalSync | null = null;

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector((set, get) => ({
    // Состояние
    currentWindowId: null,
    currentWindowDetails: null,
    allWindows: new Map(),
    isInitialized: false,
    isInitializing: false,

    // Действия
    initialize: async () => {
      try {
        // Получаем уникальный ID вкладки/окна браузера
        const windowId = StorageManager.generateScreenId();
        
        // Получаем данные текущего окна СИНХРОННО при инициализации
        const { ScreenApiManager } = await import('../utils/screenApi');
        const currentWindowDetails = await ScreenApiManager.getWindowDetails();
        
        // Инициализируем состояние с данными текущего окна
        const allWindows = new Map<string, WindowDetails>();
        allWindows.set(windowId, currentWindowDetails);

        set({
          currentWindowId: windowId,
          currentWindowDetails,
          allWindows,
          isInitialized: true,
          isInitializing: true,
        });

        // Сбрасываем флаг инициализации через 5 секунд
        setTimeout(() => {
          set({ isInitializing: false });
        }, 5000);

        // Инициализируем синхронизацию между окнами через BroadcastChannel
        windowSync = createBroadcastSync({
          channelName: 'browser-windows-sync',
          readState: () => get().allWindows,
          applyState: (newAllWindows) => {
            const { allWindows: currentAllWindows } = get();
            
            // Убеждаемся, что это Map
            const incomingWindows = newAllWindows instanceof Map 
              ? newAllWindows 
              : new Map(Object.entries(newAllWindows || {}) as [string, WindowDetails][]);
            
            // Объединяем текущие данные с входящими, приоритет у входящих данных
            const mergedWindows = new Map(currentAllWindows);
            for (const [windowId, windowDetails] of incomingWindows) {
              mergedWindows.set(windowId, windowDetails);
            }
            
            set({ allWindows: mergedWindows });
          },
        });

        // Запрашиваем начальное состояние от других окон и ждем ответа
        setTimeout(async () => {
          if (windowSync) {
            windowSync.requestInitialState();
            
            // Ждем завершения начальной синхронизации
            await windowSync.waitForInitialSync();
          }
        }, 50);
      } catch (error) {
        // Ошибка инициализации - используем fallback с пустым состоянием
        const windowId = StorageManager.generateScreenId();
        const allWindows = new Map<string, WindowDetails>();

        set({
          currentWindowId: windowId,
          allWindows,
          isInitialized: true,
          isInitializing: true,
        });

        // Сбрасываем флаг инициализации через 5 секунд
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

      // Обновляем в store
      const newAllWindows = new Map(allWindows);
      newAllWindows.set(currentWindowId, details);

      set({
        currentWindowDetails: details,
        allWindows: newAllWindows,
      });

      // Публикуем изменения через BroadcastChannel если окно в фокусе или во время инициализации
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

      // Публикуем изменения через BroadcastChannel если окно в фокусе или во время инициализации
      if (windowSync && !windowSync.isApplyingRemote() && (isInitializing || document.hasFocus())) {
        windowSync.publish();
      }
    },

    loadAllWindows: () => {
      // BroadcastChannel автоматически синхронизирует состояние между окнами
      // Этот метод больше не нужен, но оставляем для совместимости
    },

    getScreens: (): Screen[] => {
      const { allWindows } = get();
      
      // Проверяем, что allWindows является Map
      if (!(allWindows instanceof Map)) {
        // Если это объект, конвертируем в Map
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
      // Очищаем синхронизацию
      if (windowSync) {
        windowSync.destroy();
        windowSync = null;
      }

      // Очищаем старые данные (для совместимости)
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

