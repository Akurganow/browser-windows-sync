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

export const DebugPanel = React.memo<DebugPanelProps>(({
  windowDetails,
  path,
  screenCount,
  viewBox,
  position
}) => {
  const positionClass = `debug-panel--${position}`;

  const copyAllDebugInfo = () => {
    const debugInfo = [
      '=== DEBUG INFORMATION ===',
      '',
      '--- Window Details ---',
      windowDetails ? [
        `Screen Position: (${windowDetails.screenX}, ${windowDetails.screenY})`,
        `Window Size: ${windowDetails.windowWidth} × ${windowDetails.windowHeight}`,
        `Screen Size: ${windowDetails.screenWidth} × ${windowDetails.screenHeight}`
      ].join('\n') : 'No window details available',
      '',
      '--- Screen Information ---',
      `Screen Count: ${screenCount}`,
      `ViewBox: ${viewBox}`,
      '',
      '--- Polygon Path ---',
      path || 'No path generated'
    ].join('\n');
    
    navigator.clipboard.writeText(debugInfo);
  };

  return (
    <div className={`debug-panel ${positionClass}`}>
      <div className="debug-panel-header">
        <h3>Debug Information</h3>
        <button 
          className="copy-button copy-button--main"
          onClick={copyAllDebugInfo}
          title="Copy all debug information"
        >
          Copy All
        </button>
      </div>
      
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
});