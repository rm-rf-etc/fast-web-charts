type Point = [number, number];

export default class Curve {
  points: DOMPoint[] = [];
  cache = {};
  started = false;
  _path;

  constructor(points?: Point[], path?: Path2D) {
    if (Array.isArray(points)) {
      this.points = points.map(([x, y]) => new DOMPoint(x, y));
    }
    this._path = path ? path : new Path2D();
  }

  // appendPointV1(x: number, y: number) {
  //   this.points.push([this.points.length, new DOMPoint(x, y)]);
  // }

  addPoint(x: number, y: number) {
    if (!this.started) {
      this._path.moveTo(x, y);
      this.started = true;
      return;
    }

    this._path.lineTo(x, y);
  }
}
