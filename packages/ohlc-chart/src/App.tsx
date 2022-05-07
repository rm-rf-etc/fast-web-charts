import './App.css';
import React from 'react';
import { EzSurfaceReact, EzSurface } from 'ez-surface';
import { candleStickChart } from './candleStickChart';

export const App = () => {
  const onReady = React.useCallback((s: EzSurface) => {
    const csc = candleStickChart(s);
    // console.log('on ready', s);
  }, []);

  return (
    <div className="App">
      <EzSurfaceReact onReady={onReady} />
    </div>
  );
}
