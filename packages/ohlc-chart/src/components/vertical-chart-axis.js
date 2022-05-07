export class VerticalChartAxis {
  surface;

  constructor(chart) {
    this.chartParent = chart;
  }

  onready({ detail: { surface: S } }) {
    this.surface = S;

    this.layer = S.newLayer("yAxisNumbers", 1, "white", "white");
    S.setMinMaxX(0, S.canvas.width);

    S.config({
      render: () => this.render(),
      layers: [this.layer],
    });

    S.startAnimationLoop();
  }

  render() {
    const { minY, maxY, zoomY } = this.chartParent.surface;
    if (!minY || !maxY || maxY === -Infinity || minY === Infinity) return;

    const S = this.surface;
    const width = S.canvas.width;
    const height = S.canvas.height;
    const dataRange = maxY - minY;

    const max = -((zoomY * 0.5 * dataRange - height * dataRange) / (height - zoomY) - minY);
    const min = -((zoomY * 0.5 * dataRange) / (height - zoomY) - minY);

    S.context.beginPath();
    S.context.font = `${pr(12)}px sans-serif`;
    S.context.textAlign = "left";
    S.context.fillStyle = "white";
    S.context.strokeStyle = "white";
    S.context.clearRect(0, 0, width, height);

    const stepSize = dataRange * 0.1;
    const labelSpacing = Math.round(stepSize);
    const first = min + labelSpacing;
    let y = first - first % labelSpacing;
    const getAxisY = () => (minY - y) * (height - zoomY) / dataRange + height - zoomY * 0.5;

    while (y < max) {
      S.context.fillText(String(y), pr(1), getAxisY() + pr(3), width);
      y += labelSpacing;
    }
  }
}

function pr(n) {
  return n * devicePixelRatio;
}
