import type { WindowDetails } from '../types/window';
import type { ScreenDetails, ScreenInfo, ScreenBounds, ScreenConfig } from '../types/screen';
import { SCREEN_CONSTANTS } from '../types/screen';

/**
 * Утилиты для работы с Screen Management API
 */
export class ScreenApiManager {
  /**
   * Проверяет, поддерживается ли Screen Management API
   */
  static isScreenManagementSupported(): boolean {
    return 'getScreenDetails' in window;
  }

  /**
   * Получает детали всех экранов через Screen Management API
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
      console.warn('Screen Management API недоступен:', error);
      return null;
    }
  }

  /**
   * Вычисляет границы всех экранов
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
   * Создает fallback конфигурацию для случаев без Screen Management API
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
   * Получает детали окна с учетом всех экранов
   */
  static async getWindowDetails(): Promise<WindowDetails> {
    let bounds: ScreenBounds;

    // Попытка использовать Screen Management API
    const screenDetails = await ScreenApiManager.getScreenDetails();
    
    if (screenDetails && screenDetails.screens.length > 0) {
      bounds = ScreenApiManager.calculateScreenBounds(screenDetails.screens);
    } else {
      // Fallback: просто используем текущие размеры экрана как есть
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
      windowWidth: window.outerWidth,
      windowHeight: window.outerHeight,
    };
  }

  /**
   * Проверяет, изменились ли размеры экранов
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
   * Получает информацию о текущем экране с ID
   */
  static async getCurrentScreenInfo(): Promise<ScreenInfo & { id?: string } | null> {
    const screenDetails = await ScreenApiManager.getScreenDetails();
    
    if (!screenDetails) {
      return null;
    }

    // Находим экран, на котором находится текущее окно
    const windowDetails = await ScreenApiManager.getWindowDetails();
    const windowX = windowDetails.screenX;
    const windowY = windowDetails.screenY;

    const currentScreen = screenDetails.screens.find(screen => 
      windowX >= screen.left && 
      windowX < screen.left + screen.availWidth &&
      windowY >= screen.top && 
      windowY < screen.top + screen.availHeight
    );

    if (!currentScreen) {
      return null;
    }

    // Проверяем, есть ли ID в реальном API
    const screenWithId = currentScreen as any;
    
    return {
      ...currentScreen,
      id: screenWithId.id || screenWithId.internal?.displayId || screenWithId.label || null
    };
  }

  /**
   * Получает стабильный ID экрана
   */
  static async getScreenId(): Promise<string> {
    const currentScreen = await ScreenApiManager.getCurrentScreenInfo();
    
    if (currentScreen?.id) {
      return `screen_${currentScreen.id}`;
    }

    // Fallback: создаем постоянный ID на основе геометрии экрана
    const screenKey = currentScreen 
      ? `${currentScreen.left}_${currentScreen.top}_${currentScreen.availWidth}_${currentScreen.availHeight}`
      : `${(window.screen as any).availLeft || 0}_${(window.screen as any).availTop || 0}_${window.screen.width}_${window.screen.height}`;
    
    return `screen_${screenKey}`;
  }

  /**
   * Подписывается на изменения экранов (если поддерживается)
   */
  static subscribeToScreenChanges(callback: () => void): (() => void) | null {
    if (!ScreenApiManager.isScreenManagementSupported()) {
      return null;
    }

    // В будущих версиях Screen Management API может появиться событие изменения экранов
    // Пока используем fallback через resize
    const handler = () => {
      callback();
    };

    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }
}