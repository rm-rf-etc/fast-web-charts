import * as React from 'react';
import './App.css';
import { FwcCanvasReact } from '@fwc/fwc-canvas-react';
import { candleStickChart } from './candlestick-chart';

const style: React.HTMLAttributes<HTMLDivElement>['style'] = {
  position: 'absolute',
  height: '60%',
  width: '100%',
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
};
const canvasStyle: React.CSSProperties = {
  backgroundColor: 'black',
};

export default () => {
  return (
    <div style={style}>
      <FwcCanvasReact
        canvasStyle={canvasStyle}
        transparentBackground={false}
        onReady={candleStickChart}
      />
    </div>
  );
}
