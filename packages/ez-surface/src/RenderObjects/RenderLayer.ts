import Curve from './Curve';
// import Circle from './Circle';

type Point = [number, number];

export class RenderLayer {
  _path: Path2D;
  label: string | null = null;
  strokeStyle: string | null = null;
  isVisible: boolean = true;
  fillStyle: string | null = null;
  lineWidth: number | null = null;
  blendMode: GlobalCompositeOperation | null = null;

  constructor(
    label: string,
    lineWidth: number,
    strokeStyle?: string,
    fillStyle?: string,
    blendMode?: GlobalCompositeOperation
  ) {
    this._path = new Path2D();
    this.strokeStyle = strokeStyle || null;
    this.fillStyle = fillStyle || null;
    this.lineWidth = lineWidth || null;
    this.blendMode = blendMode || null;
    this.label = label;
  }

  renderPath(matrix?: DOMMatrix) {
    if (matrix) {
      const newPath = new Path2D();
      newPath.addPath(this._path, matrix);
      return newPath;
    }
    return this._path;
  }

  newCurve() {
    return new Curve(undefined, this._path);
  }

  newLine([x1, y1]: Point, [x2, y2]: Point) {
    this._path.moveTo(x1, y1);
    this._path.lineTo(x2, y2);
    return this;
  }

  // newCircle(key, ...args) {
  //   const circle = new Circle(...args);
  //   this._map.set(key, circle);
  //   return this;
  // }
}
