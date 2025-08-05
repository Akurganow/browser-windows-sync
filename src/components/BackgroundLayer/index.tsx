import React, { useMemo } from 'react';
import { WindowDetails } from '../../types/window';
import './styles.css';
import '../../background.css';

interface BackgroundLayerProps {
  windowDetails: WindowDetails | null;
}

export const BackgroundLayer = React.memo<BackgroundLayerProps>(({
  windowDetails
}) => {
  const style = useMemo(() => windowDetails ? {
    '--bg-offset-x': `${-windowDetails.screenX}px`,
    '--bg-offset-y': `${-windowDetails.screenY}px`,
  } as React.CSSProperties : {}, [windowDetails]);

  return (
    <div className="background-layer background-pattern" style={style}>
      {windowDetails && (
        <div 
          className="background-layer__window-outline"
          style={{
            transform: `translate3d(${windowDetails.screenX}px, ${windowDetails.screenY}px, 0)`,
            width: windowDetails.windowWidth,
            height: windowDetails.windowHeight,
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
});