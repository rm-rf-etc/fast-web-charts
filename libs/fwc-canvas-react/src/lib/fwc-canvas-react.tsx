import React, { useEffect, useRef } from 'react';
import { FwcCanvas } from '@fwc/fwc-canvas';

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
  onReady?: (s: FwcCanvas) => void;
  parentStyle?: React.CSSProperties;
  canvasStyle?: React.CSSProperties;
}

const FwcCanvasReact: React.FC<AppProps> = ({
  transparentBackground,
  onReady,
  parentStyle = {},
  canvasStyle = {},
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const FwcCanvasRef = useRef<FwcCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !divRef.current) return;

    FwcCanvasRef.current = new FwcCanvas(canvasRef.current, divRef.current, transparentBackground || true);
    if (onReady) {
      onReady(FwcCanvasRef.current);
    }
  }, [canvasRef.current]);

  return (
    <div style={{ ...parentStyle, ...defaultParentStyle }} ref={divRef}>
      <canvas style={{ ...defaultCanvasStyle, ...canvasStyle }} ref={canvasRef} />
    </div>
  );
}

export { FwcCanvasReact };
