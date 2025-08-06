import React from 'react';
import { WindowCanvas } from '../WindowCanvas';
import { DebugPanel } from '../DebugPanel';
import { BackgroundLayer } from '../BackgroundLayer';
import { useWindowDetails } from '../../hooks/useWindowDetails';
import { useScreenManager } from '../../hooks/useScreenManager';
import { usePolygonPath } from '../../hooks/usePolygonPath';
import './styles.css';

interface WindowManagerProps {
  /** Show debug panel */
  showDebugPanel?: boolean;
  /** Debug panel position */
  debugPanelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Polygon stroke color */
  strokeColor?: string;
  /** Polygon stroke width */
  strokeWidth?: number;
  /** CSS class for customization */
  className?: string;
}

/**
 * Main component for managing windows and displaying the polygon
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
          <span>Loading window details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window-manager window-manager--error">
        <div className="window-manager__error">
          <h3>Error loading</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`window-manager ${className}`}>
      {/* Background layer */}
      <BackgroundLayer windowDetails={windowDetails} />

      {/* SVG polygon */}
      {screenCount > 0 && (
        <WindowCanvas
          path={path}
          viewBox={viewBox}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {/* Debug panel */}
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