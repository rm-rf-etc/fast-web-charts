import chartData from './candles.json';
export const bgDark = 0x171924;
export const greenBase16 = 0x83cc66;
export const redBase16 = 0xcc6666;
export const greenHexCode = '#83CC66';
export const redHexCode = '#CC6666';
export const candleWidth = 10;
export const candleSpacing = 1.5;
export const candleStep = candleWidth * candleSpacing;
// export const holdingsJson = JSON.parse(document.getElementById('holdings')?.innerHTML || '{}');

export const controls = {
  shift: false,
  zoomToFit: false,
};

const sum = (arr: number[]) => arr.reduce((p, c) => p + c, 0);
const lwa = (arr: number[], l: number) => {
  let count = 0;
  return arr.slice(-l).reduce((p, c, i) => {
    count += i + 1;
    return p + c * (i + 1);
  }, 1) / count;
}

const period20 = 20;
const period40 = 40;
const close = chartData.map(candle => candle.c);
chartData.forEach((candle, i) => {
  if (i > period20) {
    // const sma20 = sum(chartData.slice(Math.max(0, i - period20), i).map(c => c.c)) / period20;
    Object.assign(candle, { sma20: lwa(close.slice(0, i), 20) });
  }
  if (i > period40) {
    // const sma40 = sum(chartData.slice(Math.max(0, i - period40), i).map(c => c.c)) / period40;
    Object.assign(candle, { sma40: lwa(close.slice(0, i), 40) });
  }
});

for (let i = chartData.length; i > 0; i--) {
  Object.assign(chartData[i - 1], { x: i });
}

export { chartData };
