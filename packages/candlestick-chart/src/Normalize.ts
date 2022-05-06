export function normalize(pt, [minX, maxX], [minY, maxY]) {
  const xNew = (pt.x - minX) / (maxX - minX);
  const yNew = (pt.y - minY) / (maxY - minY);
  return new DOMPoint(xNew, yNew);
}
