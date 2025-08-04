/**
 * Детали окна с координатами и размерами
 */
export interface WindowDetails {
  /** X координата окна на экране */
  screenX: number;
  /** Y координата окна на экране */
  screenY: number;
  /** Общая ширина всех экранов */
  screenWidth: number;
  /** Общая высота всех экранов */
  screenHeight: number;
  /** Ширина окна */
  windowWidth: number;
  /** Высота окна */
  windowHeight: number;
}

/**
 * Состояние окна с идентификатором и активностью
 */
export interface WindowState {
  /** Уникальный идентификатор окна */
  id: string;
  /** Детали окна */
  details: WindowDetails;
  /** Активно ли окно */
  isActive: boolean;
}

/**
 * Тип для представления экрана как кортежа [id, details]
 */
export type Screen = [string, WindowDetails];

/**
 * Константы для работы с окнами
 */
export const WINDOW_CONSTANTS = {
  /** Префикс для localStorage */
  STORAGE_PREFIX: 'screenId',
  /** Радиус круга для одного окна */
  SINGLE_WINDOW_RADIUS: 5,
} as const;