import { Tuple, Coord } from './types'

export function normalize(
  pt: Coord,
  [minX, maxX]: Tuple<number, 2>,
  [minY, maxY]: Tuple<number, 2>
) {
  const xNew = (pt.x - minX) / (maxX - minX);
  const yNew = (pt.y - minY) / (maxY - minY);
  return new DOMPoint(xNew, yNew);
}
