import React from 'react';
import './styles.css';

interface WindowCanvasProps {
  path: string;
  viewBox: string;
  strokeColor: string;
  strokeWidth: number;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({
  path,
  viewBox,
  strokeColor,
  strokeWidth
}) => {
  if (!path || !viewBox) {
    return null;
  }

  return (
    <div className="window-canvas">
      <svg
        className="window-canvas__svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};