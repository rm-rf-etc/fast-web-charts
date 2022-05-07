import './App.css';
import { EzSurfaceReact } from 'ez-surface';
import { candleStickChart } from './candleStickChart';

const style: React.HTMLAttributes<HTMLDivElement>['style'] = {
  position: 'absolute',
  height: '60%',
  width: '100%',
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
};

export const App = () => {
  return (
    <div style={style}>
      <EzSurfaceReact onReady={candleStickChart} />
    </div>
  );
}
