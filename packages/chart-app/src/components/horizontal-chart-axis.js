export class HorizontalChartAxis {
  surface;

  constructor(chart) {
    this.chartParent = chart;
  }

  onready({ detail: { surface: S } }) {
    this.surface = S;

    this.layer = S.newLayer("xAxisNumbers", 1, "white", "white");
    S.setMinMaxY(0, S.canvas.height);

    S.config({
      render: () => this.render(),
      layers: [this.layer],
    });

    S.startAnimationLoop();
  }

  render() {
    const { minX, maxX } = this.chartParent.surface;
    if (!minX || !maxX || maxX === -Infinity || minX === Infinity) return;

    const S = this.surface;
    const width = S.canvas.width;
    const height = S.canvas.height;
    const dataRange = maxX - minX;

    const max = -((dataRange - width * dataRange) / width - minX);
    const min = -(dataRange / width - minX);

    S.context.beginPath();
    S.context.font = `${pr(12)}px sans-serif`;
    S.context.textAlign = "center";
    S.context.fillStyle = "white";
    S.context.strokeStyle = "white";
    S.context.clearRect(0, 0, width, height);

    const stepSize = dataRange * 0.1;
    const labelSpacing = Math.round(stepSize);
    const first = min + labelSpacing;
    let x = first - first % labelSpacing;
    const getAxisX = () => (minX - x) * -width / dataRange;

    while (x < max) {
      S.context.fillText(String(x), getAxisX(), pr(10), 50);
      x += labelSpacing;
    }
  }
}

function pr(n) {
  return n * devicePixelRatio;
}
