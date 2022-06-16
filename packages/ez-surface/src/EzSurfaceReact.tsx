import React, { useEffect, useRef } from 'react';
import { EzSurface } from './EzSurface';

const defaultParentStyle = {
  height: '100%',
  width: '100%',
};

const defaultCanvasStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  imageRendering: 'auto',
};

interface AppProps {
  transparentBackground?: boolean;
  onReady?: (s: EzSurface) => void;
  parentStyle?: React.HTMLAttributes<HTMLCanvasElement>;
  canvasStyle?: React.HTMLAttributes<HTMLCanvasElement>;
}

const EzSurfaceReact: React.FC<AppProps> = ({
  transparentBackground,
  onReady,
  parentStyle = {},
  canvasStyle = {},
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ezSurfaceRef = useRef<EzSurface | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !divRef.current) return;

    ezSurfaceRef.current = new EzSurface(canvasRef.current, divRef.current, transparentBackground || true);
    if (onReady) {
      onReady(ezSurfaceRef.current);
    }
  }, [canvasRef.current]);

  return (
    <div style={{ ...parentStyle, ...defaultParentStyle }} ref={divRef}>
      <canvas style={{ ...defaultCanvasStyle, ...canvasStyle }} ref={canvasRef} />
    </div>
  );
}

export { EzSurfaceReact };
