import type { WindowDetails, Screen } from '../types/window';
import { WINDOW_CONSTANTS } from '../types/window';

/**
 * Утилиты для работы с localStorage и sessionStorage
 */
export class StorageManager {
  /**
   * Сохраняет детали окна в localStorage
   */
  static saveWindowDetails(screenId: string, details: WindowDetails): void {
    try {
      window.localStorage.setItem(screenId, JSON.stringify(details));
    } catch (error) {
      console.warn('Не удалось сохранить детали окна в localStorage:', error);
    }
  }

  /**
   * Загружает детали окна из localStorage
   */
  static loadWindowDetails(screenId: string): WindowDetails | null {
    try {
      const data = window.localStorage.getItem(screenId);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Не удалось загрузить детали окна из localStorage:', error);
      return null;
    }
  }

  /**
   * Удаляет детали окна из localStorage и sessionStorage
   */
  static removeWindowDetails(screenId: string): void {
    try {
      window.localStorage.removeItem(screenId);
      
      // Также очищаем sessionStorage для этого окна
      if (window.sessionStorage.getItem(WINDOW_CONSTANTS.STORAGE_PREFIX) === screenId) {
        window.sessionStorage.removeItem(WINDOW_CONSTANTS.STORAGE_PREFIX);
      }
    } catch (error) {
      console.warn('Не удалось удалить детали окна из localStorage:', error);
    }
  }

  /**
   * Получает все экраны из localStorage с детерминированной сортировкой
   */
  static getAllScreens(): Screen[] {
    try {
      return Object.entries(window.localStorage)
        .filter(([key]) => key.startsWith(WINDOW_CONSTANTS.STORAGE_PREFIX))
        .map(([key, value]) => [key, JSON.parse(value)] as Screen)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)); // Детерминированная сортировка по ID
    } catch (error) {
      console.warn('Не удалось получить экраны из localStorage:', error);
      return [];
    }
  }

  /**
   * Получает экраны кроме текущего
   */
  static getOtherScreens(currentScreenId: string): Screen[] {
    return StorageManager.getAllScreens()
      .filter(([key]) => key !== currentScreenId);
  }

  /**
   * Генерирует уникальный ID для окна/вкладки браузера
   */
  static generateScreenId(): string {
    const existingScreenId = sessionStorage.getItem(WINDOW_CONSTANTS.STORAGE_PREFIX);

    if (existingScreenId) {
      return existingScreenId;
    }

    // Генерируем уникальный ID для каждой вкладки/окна браузера
    const uniqueWindowId = crypto.randomUUID();
    const fullScreenId = `${WINDOW_CONSTANTS.STORAGE_PREFIX}_${uniqueWindowId}`;

    sessionStorage.setItem(WINDOW_CONSTANTS.STORAGE_PREFIX, fullScreenId);

    return fullScreenId;
  }

  /**
   * Очищает все данные экранов из localStorage
   */
  static clearAllScreens(): void {
    try {
      const keysToRemove = Object.keys(window.localStorage)
        .filter(key => key.startsWith(WINDOW_CONSTANTS.STORAGE_PREFIX));
      
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Не удалось очистить данные экранов:', error);
    }
  }

  /**
   * Проверяет, поддерживается ли localStorage
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
   * Проверяет, поддерживается ли sessionStorage
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
   * Подписывается на изменения в localStorage
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