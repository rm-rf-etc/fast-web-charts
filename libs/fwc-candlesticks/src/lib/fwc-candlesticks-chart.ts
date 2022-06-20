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
  fwcCanvas: FwcCanvas;
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

  constructor(fwcCanvas: FwcCanvas, data: any[], conf: CandleStickChartConfig = {}) {
    this.fwcCanvas = fwcCanvas;
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
    const S = this.fwcCanvas;
    S.zoomY = 0;
    S.setMinMaxX(this.data.at(-101).x, this.data.at(-1).x + 1);
    S.setMinMaxY(Infinity, -Infinity);

    // this.timeseries = new PaginatedTimeSeries(
    //   this.workerUrl,
    //   this.data.map(c => c.x),
    //   this.data,
    //   this.data.at(0).x,
    //   this.data.at(-1).x,
    // );

    const bodiesLayerG = new RenderLayer("bodiesG", 3, this.colors.bullish);
    const bodiesLayerR = new RenderLayer("bodiesR", 3, this.colors.bearish);
    const wicksLayerG = new RenderLayer("wicksG", 1, this.colors.bullish);
    const wicksLayerR = new RenderLayer("wicksR", 1, this.colors.bearish);
    const sma20Layer = new RenderLayer("sma20", 1, this.colors.line1);
    const sma40Layer = new RenderLayer("sma40", 1, this.colors.line2);
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
    this.data.forEach(({ x, o, c, h, l, sma20, sma40 }) => {
      if (c > o) {
        wicksLayerG.newLine([x, l], [x, h]);
        bodiesLayerG.newLine([x, o], [x, c]);
      } else {
        wicksLayerR.newLine([x, l], [x, h]);
        bodiesLayerR.newLine([x, o], [x, c]);
      }
      curve20.addPoint(x, sma20);
      curve40.addPoint(x, sma40);
    });

    Object.defineProperty(bodiesLayerG, "isVisible", {
      get: () => {
        try {
          return (S.layersMap as any).bodiesG.lineWidth > 2;
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
          return (S.layersMap as any).bodiesR.lineWidth > 2;
        } catch (_) {
          return false;
        }
      },
      enumerable: true,
      configurable: true,
    });

    S.config({
      render: () => this.render(),
      layers: [wicksLayerG, wicksLayerR, bodiesLayerG, bodiesLayerR, sma20Layer, sma40Layer],
      events: { mousewheel: evt => this.handleMouseWheelEvent(evt) },
    });

    this.render();
    // S.startAnimationLoop();
  }

  handleMouseWheelEvent(evt: Event) {
    if (!(evt instanceof WheelEvent)) return;
    evt.preventDefault();

    const S = this.fwcCanvas;
    const delta = evt.deltaY + evt.deltaX;

    if (this.controls.zoomEnabled && this.controls.keyboardMeta) {
      const maxHeight = S.canvas.height * 0.9;
      S.zoomY = Math.min(maxHeight, S.zoomY + S.rangeY * delta * 0.001);
      if (this.onViewChanged) {
        this.onViewChanged(S.minX, S.maxX, S.minY, S.maxY, S.zoomY);
      }
      this.render();
      return;
    }

    if (this.controls.zoomEnabled && this.controls.keyboardShift) {
      if (S.maxX === null) return;
      const newMinX = S.maxX - (S.rangeX + S.rangeX * delta * 0.0005);
      const newMaxX = Math.min(this.lastX + Math.round(S.rangeX) * 0.5, S.maxX + delta * 0.1);
      S.setMinMaxX(newMinX, newMaxX);
      if (this.onViewChanged) {
        this.onViewChanged(newMinX, newMaxX, S.minY, S.maxY, S.zoomY);
      }
      this.render();
      return;
    }

    if (!this.controls.scrollEnabled) {
      return;
    }

    if (this.controls.autoScale) {
      if (S.maxX === null) return;
      const rangeX = S.rangeX;
      const maxMaxX = this.lastX + Math.round(S.rangeX) * 0.5;
      const newMaxX = Math.min(maxMaxX, S.maxX - (evt.deltaY - evt.deltaX) * S.rangeX * 0.0005);
      const newMinX = newMaxX - rangeX;
      S.setMinMaxX(newMinX, newMaxX);
      if (this.onViewChanged) {
        this.onViewChanged(newMinX, newMaxX, S.minY, S.maxY, S.zoomY);
      }
      this.render();
      return;
    }

    if (S.maxX === null || S.minX === null || S.maxY === null || S.minY === null) return;
    const xSlideRate = 0.001 * devicePixelRatio;
    const ySlideRate = 0.0005 * devicePixelRatio;
    const slideDeltaX = evt.deltaX * S.rangeX * xSlideRate;
    const newMinX = S.minX + slideDeltaX;
    const newMaxX = S.maxX + slideDeltaX;
    const newMinY = S.minY - S.rangeY * evt.deltaY * 1 / -S.yZoomUnit * ySlideRate;
    const newMaxY = S.maxY - S.rangeY * evt.deltaY * 1 / -S.yZoomUnit * ySlideRate;
    S.setMinMaxX(newMinX, newMaxX);
    S.setMinMaxY(newMinY, newMaxY);
    if (this.onViewChanged) {
      this.onViewChanged(newMinX, newMaxX, S.minY, S.maxY, S.zoomY);
    }

    this.render();
  }

  render() {
    const S = this.fwcCanvas;
    S.layersMap['bodiesG'].lineWidth = S.xUnit * 0.8;
    S.layersMap['bodiesR'].lineWidth = S.xUnit * 0.8;

    if (this.controls.autoScale || S.minY === Infinity || S.maxY === -Infinity) {
      let minY = Infinity;
      let maxY = -Infinity;

      if (S.minX === null || S.maxX === null) return;

      for (const el of this.data) { // this.timeseries.view) {
        if (el.x < S.minX || el.x > S.maxX) continue;
        maxY = Math.max(maxY, el.h);
        minY = Math.min(minY, el.l);
      }

      S.setMinMaxY(minY, maxY);
    }

    S.renderLayers();
  }
}
