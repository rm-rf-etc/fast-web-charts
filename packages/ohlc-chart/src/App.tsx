import './App.css';
import React from 'react';
import { EzSurfaceReact, EzSurface } from 'ez-surface';
// import { CandleStickChart } from './lib/CandleStickChart/CandleStickChart';

export const App = () => {
  const onReady = React.useCallback((s: EzSurface) => {
    // const csc = new CandleStickChart(s);
    console.log('on ready', s);
  }, []);

  return (
    <div className="App">
      <EzSurfaceReact onReady={onReady} />
    </div>
  );
}
