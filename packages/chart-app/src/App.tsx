import * as React from 'react';
import './App.css';
import { EzSurfaceReact } from 'ez-surface';
import { candleStickChart } from './CandleStickChart';

const style: React.HTMLAttributes<HTMLDivElement>['style'] = {
  position: 'absolute',
  height: '60%',
  width: '100%',
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
};
const canvasStyle = {
  backgroundColor: 'black',
};

export default () => {
  return (
    <div style={style}>
      <EzSurfaceReact
        canvasStyle={canvasStyle}
        transparentBackground={false}
        onReady={candleStickChart}
      />
    </div>
  );
}
