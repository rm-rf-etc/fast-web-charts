type Point = [number, number];

export default class Edge {
  p1 = new DOMPoint();
  p2 = new DOMPoint();

  constructor([x1, y1]: Point, [x2, y2]: Point) {
    this.p1 = new DOMPoint(x1, y1);
    this.p2 = new DOMPoint(x2, y2);
  }
}
