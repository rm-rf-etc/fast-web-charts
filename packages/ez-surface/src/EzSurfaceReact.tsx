import React from 'react';
import { EzSurface } from './EzSurface';
import styled from 'styled-components';

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: optimize-contrast;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
`

interface AppProps {
  alpha?: boolean;
  onReady?: (s: EzSurface) => void;
}
const EzSurfaceReact: React.FC<AppProps> = ({ alpha, onReady }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ezSurfaceRef = React.useRef<EzSurface | null>(null);

  React.useEffect(() => {
    if (canvasRef.current instanceof HTMLCanvasElement) {
      const context = canvasRef.current.getContext('2d', { alpha: alpha || false });
      if (!context) {
        throw new Error('Received null context');
      }
      ezSurfaceRef.current = new EzSurface(canvasRef.current, context);
      if (onReady) {
        onReady(ezSurfaceRef.current);
      }
    }
  }, [canvasRef.current]);

  return <Canvas ref={canvasRef} />;
}

export { EzSurfaceReact };