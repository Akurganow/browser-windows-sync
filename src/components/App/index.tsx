import React from 'react';
import { WindowManager } from '../WindowManager';

const App: React.FC = () => {
  return (
    <WindowManager
      showDebugPanel={false}
      debugPanelPosition="top-left"
      strokeColor="black"
      strokeWidth={3}
    />
  );
};

export default App;
