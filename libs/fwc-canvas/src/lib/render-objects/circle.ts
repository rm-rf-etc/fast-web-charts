export default class Circle {
  center = new DOMPoint();
  start = new DOMPoint();

  constructor(center: DOMPoint, start: DOMPoint) {
    this.center = center;
    this.start = start;
  }
}
