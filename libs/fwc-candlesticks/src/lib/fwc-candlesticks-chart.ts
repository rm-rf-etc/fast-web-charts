import { FwcCanvas, RenderLayer } from '@fwc/fwc-canvas'
import { PaginatedTimeSeries } from '@fwc/paginated-data-client'

interface CandleStickChartConfig {
  bearish?: string;
  bullish?: string;
  line1?: string;
  line2?: string;
  onViewChanged?: CallableFunction;
  workerUrl?: string | null;
  controls?: {
    keyboardMeta?: boolean,
    keyboardShift?: boolean,
    keyboardControl?: boolean,
    scrollEnabled?: boolean,
    zoomEnabled?: boolean,
    autoScale?: boolean,
  }
}

export class FwcCandlesticksChart {
  data: any[] = [];
  canvas: FwcCanvas;
  onViewChanged: CallableFunction | null = null;
  workerUrl: string | null;
  layersMap = {};
  controls = {
    keyboardMeta: false,
    keyboardShift: false,
    keyboardControl: false,
    scrollEnabled: false,
    zoomEnabled: false,
    autoScale: false,
  };
  colors: CandleStickChartConfig = {};
  lastX: number;
  timeseries: PaginatedTimeSeries | null = null;

  constructor(canvas: FwcCanvas, data: any[], conf: CandleStickChartConfig = {}) {
    this.canvas = canvas;
    this.workerUrl = conf.workerUrl || null;
    this.data = data;
    this.colors.bearish = conf.bearish || "rgb(232,59,63)";
    this.colors.bullish = conf.bullish || "rgb(36,152,136)";
    this.colors.line1 = conf.line1 || "rgb(22,134,254)";
    this.colors.line2 = conf.line2 || "rgb(254,233,58)";
    this.onViewChanged = conf.onViewChanged || null;
    this.lastX = data.at(-1).x;
    if (conf.controls) {
      this.controls = Object.assign(this.controls, conf.controls);
    }
  }

  onready() {
    const canvas = this.canvas;
    canvas.zoomY = 0;
    canvas.setMinMaxX(this.data.at(-101).x, this.data.at(-1).x + 1);
    canvas.setMinMaxY(Infinity, -Infinity);

    // this.timeseries = new PaginatedTimeSeries(
    //   this.workerUrl,
    //   this.data.map(c => c.x),
    //   this.data,
    //   this.data.at(0).x,
    //   this.data.at(-1).x,
    // );

    const { bearish, bullish, line1, line2 } = this.colors;
    const bodiesLayerG = new RenderLayer("bodiesG", 3, bullish, bullish);
    const bodiesLayerR = new RenderLayer("bodiesR", 3, bearish, bearish);
    const wicksLayerG = new RenderLayer("wicksG", 1, bullish);
    const wicksLayerR = new RenderLayer("wicksR", 1, bearish);
    const sma20Layer = new RenderLayer("sma20", 1, line1);
    const sma40Layer = new RenderLayer("sma40", 1, line2);
    const curve20 = sma20Layer.newCurve();
    const curve40 = sma40Layer.newCurve();

    // this.timeseries.onready = () => {
    //   this.timeseries.forEach(({ x, o, c, h, l, sma20, sma40 }) => {
    //     if (c > o) {
    //       wicksLayerG.newLine([x, l], [x, h]);
    //       bodiesLayerG.newLine([x, o], [x, c]);
    //     } else {
    //       wicksLayerR.newLine([x, l], [x, h]);
    //       bodiesLayerR.newLine([x, o], [x, c]);
    //     }
    //     curve20.addPoint(x, sma20);
    //     curve40.addPoint(x, sma40);
    //   });
    // };
    const xUnit = canvas.xUnit * 0.012
    this.data.forEach(({ x, o, c, h, l, sma20, sma40 }) => {
      if (c > o) {
        wicksLayerG.newLine([x, l], [x, h]);
        // bodiesLayerG.newLine([x, o], [x, c]);
        bodiesLayerG.newRect([x - xUnit, o], [x + xUnit, c]);
      } else {
        wicksLayerR.newLine([x, l], [x, h]);
        // bodiesLayerR.newLine([x, o], [x, c]);
        bodiesLayerR.newRect([x - xUnit, o], [x + xUnit, c]);
      }
      curve20.addPoint(x, sma20);
      curve40.addPoint(x, sma40);
    });

    Object.defineProperty(bodiesLayerG, "isVisible", {
      get: () => {
        try {
          return (canvas.layersMap as any).bodiesG.lineWidth > 2;
        } catch (_) {
          return false;
        }
      },
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(bodiesLayerR, "isVisible", {
      get: () => {
        try {
          return (canvas.layersMap as any).bodiesR.lineWidth > 2;
        } catch (_) {
          return false;
        }
      },
      enumerable: true,
      configurable: true,
    });

    canvas.config({
      render: () => this.render(),
      layers: [wicksLayerG, wicksLayerR, bodiesLayerG, bodiesLayerR, sma20Layer, sma40Layer],
      events: { mousewheel: evt => this.handleMouseWheelEvent(evt) },
    });

    this.render();
    // canvas.startAnimationLoop();
  }

  handleMouseWheelEvent(evt: Event) {
    if (!(evt instanceof WheelEvent)) return;
    evt.preventDefault();

    const canvas = this.canvas;
    const delta = evt.deltaY + evt.deltaX;

    if (this.controls.zoomEnabled && this.controls.keyboardMeta) {
      const maxHeight = canvas.canvas.height * 0.9;
      canvas.zoomY = Math.min(maxHeight, canvas.zoomY + canvas.rangeY * delta * 0.001);
      if (this.onViewChanged) {
        this.onViewChanged(canvas.minX, canvas.maxX, canvas.minY, canvas.maxY, canvas.zoomY);
      }
      this.render();
      return;
    }

    if (this.controls.zoomEnabled && this.controls.keyboardShift) {
      if (canvas.maxX === null) return;
      const newMinX = canvas.maxX - (canvas.rangeX + canvas.rangeX * delta * 0.0005);
      const newMaxX = Math.min(this.lastX + Math.round(canvas.rangeX) * 0.5, canvas.maxX + delta * 0.1);
      canvas.setMinMaxX(newMinX, newMaxX);
      if (this.onViewChanged) {
        this.onViewChanged(newMinX, newMaxX, canvas.minY, canvas.maxY, canvas.zoomY);
      }
      this.render();
      return;
    }

    if (!this.controls.scrollEnabled) {
      return;
    }

    if (this.controls.autoScale) {
      if (canvas.maxX === null) return;
      const rangeX = canvas.rangeX;
      const maxMaxX = this.lastX + Math.round(canvas.rangeX) * 0.5;
      const newMaxX = Math.min(maxMaxX, canvas.maxX - (evt.deltaY - evt.deltaX) * canvas.rangeX * 0.0005);
      const newMinX = newMaxX - rangeX;
      canvas.setMinMaxX(newMinX, newMaxX);
      if (this.onViewChanged) {
        this.onViewChanged(newMinX, newMaxX, canvas.minY, canvas.maxY, canvas.zoomY);
      }
      this.render();
      return;
    }

    if (canvas.maxX === null || canvas.minX === null || canvas.maxY === null || canvas.minY === null) return;
    const xSlideRate = 0.001 * devicePixelRatio;
    const ySlideRate = 0.0005 * devicePixelRatio;
    const slideDeltaX = evt.deltaX * canvas.rangeX * xSlideRate;
    const newMinX = canvas.minX + slideDeltaX;
    const newMaxX = canvas.maxX + slideDeltaX;
    const newMinY = canvas.minY - canvas.rangeY * evt.deltaY * 1 / -canvas.yZoomUnit * ySlideRate;
    const newMaxY = canvas.maxY - canvas.rangeY * evt.deltaY * 1 / -canvas.yZoomUnit * ySlideRate;
    canvas.setMinMaxX(newMinX, newMaxX);
    canvas.setMinMaxY(newMinY, newMaxY);
    if (this.onViewChanged) {
      this.onViewChanged(newMinX, newMaxX, canvas.minY, canvas.maxY, canvas.zoomY);
    }

    this.render();
  }

  render() {
    const canvas = this.canvas;
    // canvas.layersMap['bodiesG'].lineWidth = canvas.xUnit * 0.8;
    // canvas.layersMap['bodiesR'].lineWidth = canvas.xUnit * 0.8;

    if (this.controls.autoScale || canvas.minY === Infinity || canvas.maxY === -Infinity) {
      let minY = Infinity;
      let maxY = -Infinity;

      if (canvas.minX === null || canvas.maxX === null) return;

      for (const el of this.data) { // this.timeseries.view) {
        if (el.x < canvas.minX || el.x > canvas.maxX) continue;
        maxY = Math.max(maxY, el.h);
        minY = Math.min(minY, el.l);
      }

      canvas.setMinMaxY(minY, maxY);
    }

    canvas.renderLayers();
  }
}
