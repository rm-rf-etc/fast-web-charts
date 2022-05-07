import React from 'react';
import { EzSurface } from './EzSurface';

const defaultParentStyle = {
  height: '100%',
  width: '100%',
};

const defaultCanvasStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  '-ms-interpolation-mode': 'nearest-neighbor',
  'image-rendering': [
    'optimizeSpeed',
    '-moz-crisp-edges',
    '-webkit-optimize-contrast',
    'optimize-contrast',
    'pixelated'
  ],
};

interface AppProps {
  alpha?: boolean;
  onReady?: (s: EzSurface) => void;
  parentStyle?: Record<string, string>;
  canvasStyle?: Record<string, string>;
}

const EzSurfaceReact: React.FC<AppProps> = ({
  alpha,
  onReady,
  parentStyle=defaultParentStyle,
  canvasStyle=defaultCanvasStyle,
}) => {
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ezSurfaceRef = React.useRef<EzSurface | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current || !divRef.current) return;

    ezSurfaceRef.current = new EzSurface(canvasRef.current, divRef.current, alpha || false);
    if (onReady) {
      onReady(ezSurfaceRef.current);
    }
  }, [canvasRef.current]);

  return (
    <div style={parentStyle} ref={divRef}>
      <canvas style={canvasStyle} ref={canvasRef} />
    </div>
  );
}

export { EzSurfaceReact };
