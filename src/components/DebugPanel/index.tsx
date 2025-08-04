import React from 'react';
import { WindowDetails } from '../../types/window';
import './styles.css';

interface DebugPanelProps {
  windowDetails: WindowDetails | null;
  path: string;
  screenCount: number;
  viewBox: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  windowDetails,
  path,
  screenCount,
  viewBox,
  position
}) => {
  const positionClass = `debug-panel--${position}`;

  return (
    <div className={`debug-panel ${positionClass}`}>
      <h3>Debug Information</h3>
      
      <div className="debug-section">
        <h4>Window Details</h4>
        {windowDetails ? (
          <div className="debug-info">
            <p><strong>Screen Position:</strong> ({windowDetails.screenX}, {windowDetails.screenY})</p>
            <p><strong>Window Size:</strong> {windowDetails.windowWidth} × {windowDetails.windowHeight}</p>
            <p><strong>Screen Size:</strong> {windowDetails.screenWidth} × {windowDetails.screenHeight}</p>
          </div>
        ) : (
          <p>No window details available</p>
        )}
      </div>

      <div className="debug-section">
        <h4>Screen Information</h4>
        <p><strong>Screen Count:</strong> {screenCount}</p>
        <p><strong>ViewBox:</strong> {viewBox}</p>
      </div>

      <div className="debug-section">
        <h4>Polygon Path</h4>
        <div className="debug-path">
          <code>{path || 'No path generated'}</code>
        </div>
      </div>
    </div>
  );
};