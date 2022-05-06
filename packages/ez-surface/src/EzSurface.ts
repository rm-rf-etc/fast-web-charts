import { RenderLayer } from './RenderObjects/RenderLayer';

export interface ConfigOptions {
  layers?: Array<RenderLayer>;
  events?: Record<string, EventListenerOrEventListenerObject>;
  render?: CallableFunction;
}

export interface LayersMap {
  [k: string]: RenderLayer;
}

class EzSurface {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  name?: string | null;
  animationActive: boolean = false;
  layersList: RenderLayer[] = [];
  layersMap: Record<string, RenderLayer> = {};
  redrawFn: CallableFunction = () => {};
  rangeY = 0;
  rangeX = 0;
  zoomY = 0;
  minX: number | null = null;
  maxX: number | null = null;
  minY: number | null = null;
  maxY: number | null = null;

  get xUnit() { return this.canvas.width / this.rangeX }
  get yUnit() { return this.canvas.height / this.rangeY }
  get yZoomUnit() { return (this.canvas.height - this.zoomY) / -this.rangeY }
  get yZoomMargin() { return this.zoomY / this.yZoomUnit }

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
  }

  config(opts: ConfigOptions) {
    if (opts.render) {
      this.redrawFn = opts.render;
    }
    if (opts.layers) {
      opts.layers.forEach(layer => {
        if (layer.label) {
          this.layersMap[layer.label] = layer
        }
      });
      this.layersList = [...this.layersList, ...opts.layers];
    }
    if (opts.events) {
      Object.entries(opts.events).forEach(([name, handler]) => {
        this.canvas.addEventListener(name, handler);
      });
    }
  }

  connectedCallback() {
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
    this.name = this.canvas.getAttribute("name");
    if (!this.name) throw "killer-canvas requires a name attribute";

    window.addEventListener("resize", () => {
      this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
      this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
      this.render();
    });

    // window.canvasComponents = window.canvasComponents || {};
    // window.canvasComponents[this.name] = this;
    window.dispatchEvent(new CustomEvent("canvas-ready", {
      detail: { surface: this, name: this.name },
    }));
  }

  setMinMaxX(minX: number, maxX: number) {
    this.minX = minX;
    this.maxX = maxX;
    this.rangeX = this.maxX - this.minX;
  }

  setMinMaxY(minY: number, maxY: number) {
    this.minY = minY;
    this.maxY = maxY;
    this.rangeY = this.maxY - this.minY;
  }

  appendLayers(...layers: RenderLayer[]) {
    layers.forEach(layer => {
      if (layer.label) {
        this.layersMap[layer.label] = layer;
      }
    });
    this.layersList = [...this.layersList, ...layers];
    return this;
  }

  getViewTransformValues() {
    if (!this.maxY || !this.minX) {
      return null;
    }
    const yZoomUnit = this.yZoomUnit;
    const yOffset = 2 * this.maxY;
    const xShift = 0.5 - this.minX;
    const yShift = (yOffset - this.zoomY / yZoomUnit) * -0.5;
    return [this.xUnit, yZoomUnit, xShift, yShift];
  }

  getViewMatrix() {
    const viewTransformValues = this.getViewTransformValues();
    if (!viewTransformValues) {
      return null;
    }
    const [xScale, yScale, xShift, yShift] = viewTransformValues;
    return new DOMMatrix().scale(xScale, yScale).translate(xShift, yShift);
  }

  renderLayers(clear = true) {
    if (this.rangeY === -Infinity || this.rangeY === Infinity) return;
    if (clear) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const viewTransforms = this.getViewMatrix();

    if (!viewTransforms) {
      return this;
    }

    for (const layer of this.layersList) {
      if (!layer.isVisible) continue;
      this.paintLayer(layer, viewTransforms);
    }

    return this;
  }

  paintLayer(layer: RenderLayer, matrix: DOMMatrix) {
    layer._path = new Path2D();
    layer._path.addPath(layer._path, matrix);
    if (layer.fillStyle) this.context.fillStyle = layer.fillStyle;
    if (layer.lineWidth) this.context.lineWidth = layer.lineWidth;
    if (layer.strokeStyle) this.context.strokeStyle = layer.strokeStyle;
    if (layer.blendMode) this.context.globalCompositeOperation = layer.blendMode;
    this.context.stroke(layer._path);
  }

  render() {
    this.redrawFn();
    return this;
  }

  startAnimationLoop(fn?: CallableFunction) {
    // skip if already active
    if (this.animationActive) return;
    this.animationActive = true;

    if (typeof fn === "function") {
      this.redrawFn = fn;
    }

    const render = (time: number) => {
      if (!this.animationActive) return;
      if (typeof this.redrawFn !== "function") return;
      this.redrawFn(time);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return this;
  }

  stopAnimationLoop() {
    this.animationActive = false;
    return this;
  }

  toggleAnimationLoop() {
    if (!this.animationActive) {
      this.startAnimationLoop();
    } else {
      this.stopAnimationLoop();
    }
    return this;
  }
}

export { EzSurface };
