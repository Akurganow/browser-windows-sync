import React from 'react';
import { WindowCanvas } from '../WindowCanvas';
import { DebugPanel } from '../DebugPanel';
import { BackgroundLayer } from '../BackgroundLayer';
import { useWindowDetails } from '../../hooks/useWindowDetails';
import { useScreenManager } from '../../hooks/useScreenManager';
import { usePolygonPath } from '../../hooks/usePolygonPath';
import './styles.css';

interface WindowManagerProps {
  /** Показывать ли отладочную панель */
  showDebugPanel?: boolean;
  /** Позиция отладочной панели */
  debugPanelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Цвет обводки полигона */
  strokeColor?: string;
  /** Ширина обводки полигона */
  strokeWidth?: number;
  /** CSS класс для кастомизации */
  className?: string;
}

/**
 * Основной компонент для управления окнами и отображения полигона
 */
export const WindowManager: React.FC<WindowManagerProps> = ({
  showDebugPanel = true,
  debugPanelPosition = 'top-left',
  strokeColor = 'yellow',
  strokeWidth = 3,
  className = '',
}) => {
  const { 
    windowDetails, 
    isLoading, 
    error 
  } = useWindowDetails();

  const { 
    screens,
    screenId
  } = useScreenManager(windowDetails);


  const { 
    path, 
    viewBox, 
    screenCount 
  } = usePolygonPath(screens, screenId || undefined);


  if (isLoading) {
    return (
      <div className="window-manager window-manager--loading">
        <div className="window-manager__loader">
          <div className="window-manager__spinner"></div>
          <span>Загрузка деталей окна...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window-manager window-manager--error">
        <div className="window-manager__error">
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`window-manager ${className}`}>
      {/* Фоновый слой */}
      <BackgroundLayer windowDetails={windowDetails} />

      {/* SVG полигон */}
      {screenCount > 0 && (
        <WindowCanvas
          path={path}
          viewBox={viewBox}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {/* Отладочная панель */}
      {showDebugPanel && (
        <DebugPanel
          windowDetails={windowDetails}
          path={path}
          screenCount={screenCount}
          viewBox={viewBox}
          position={debugPanelPosition}
        />
      )}
    </div>
  );
};