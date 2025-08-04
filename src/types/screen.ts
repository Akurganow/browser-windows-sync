/**
 * Информация об экране из Screen Management API
 */
export interface ScreenInfo {
  /** Левая координата экрана */
  left: number;
  /** Верхняя координата экрана */
  top: number;
  /** Доступная ширина экрана */
  availWidth: number;
  /** Доступная высота экрана */
  availHeight: number;
  /** Является ли экран основным */
  isPrimary?: boolean;
  /** Масштаб экрана */
  devicePixelRatio?: number;
}

/**
 * Детали всех экранов из Screen Management API
 */
export interface ScreenDetails {
  /** Массив всех экранов */
  screens: ScreenInfo[];
  /** Текущий экран */
  currentScreen?: ScreenInfo;
}

/**
 * Конфигурация экрана для fallback режима
 */
export interface ScreenConfig {
  /** Количество мониторов (по умолчанию) */
  defaultMonitorCount: number;
  /** Ширина одного монитора */
  defaultWidth: number;
  /** Высота одного монитора */
  defaultHeight: number;
  /** Расположение мониторов (horizontal | vertical) */
  layout: 'horizontal' | 'vertical';
}

/**
 * Результат расчета общих границ экранов
 */
export interface ScreenBounds {
  /** Минимальная X координата */
  minX: number;
  /** Минимальная Y координата */
  minY: number;
  /** Максимальная X координата */
  maxX: number;
  /** Максимальная Y координата */
  maxY: number;
  /** Общая ширина */
  totalWidth: number;
  /** Общая высота */
  totalHeight: number;
}

/**
 * Константы для работы с экранами
 */
export const SCREEN_CONSTANTS = {
  /** Конфигурация по умолчанию */
  DEFAULT_CONFIG: {
    defaultMonitorCount: 3,
    defaultWidth: 1920,
    defaultHeight: 1080,
    layout: 'horizontal' as const,
  },
  /** Минимальные размеры экрана */
  MIN_DIMENSIONS: {
    width: 800,
    height: 600,
  },
} as const;