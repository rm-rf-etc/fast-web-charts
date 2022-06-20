import { render } from '@testing-library/react';
import { FwcCanvasReact } from './fwc-canvas-react';

describe('FwcCanvasReact', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FwcCanvasReact />);
    expect(baseElement).toBeTruthy();
  });
});
