import React from 'react';
import { WindowDetails } from '../../types/window';
import './styles.css';
import '../../background.css';

interface BackgroundLayerProps {
  windowDetails: WindowDetails | null;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  windowDetails
}) => {
  return (
    <div className="background-layer background-pattern">
      {windowDetails && (
        <div 
          className="background-layer__window-outline"
          style={{
            left: windowDetails.screenX,
            top: windowDetails.screenY,
            width: windowDetails.windowWidth,
            height: windowDetails.windowHeight,
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
};