// import "regenerator-runtime/runtime";

export class PaginatedTimeSeries {
  view = [];
  loaded = false;
  onready: CallableFunction | null = null;
  worker: Worker;
  xL: number | null = null;
  xR: number | null = null;
  first: number | null = null;
  last: number | null = null;
  indexMin: number | null = null;
  indexMax: number | null = null;

  constructor(
    dataWorkerUrl: string,
    keys: string[],
    values: any[],
    xL: number,
    xR: number
  ) {
    this.worker = new Worker(dataWorkerUrl);
    this.worker.onmessage = msg => this.onmessage(msg);
    if (keys && values) {
      this._batchInsert(keys, values);
      this._setViewRange(xL, xR);
    }
  }

  onmessage(msg: any) {
    const [action, data] = msg.data;

    switch (action) {
      case 'set-view': {
        const { list, minKey, maxKey } = data;

        this.view = list;
        this.first = minKey;
        this.last = maxKey;

        if (!this.loaded) {
          this.loaded = true;
          this._updateElementsRange();
          if (this.onready) this.onready();
        }
        return;
      }
    }
  }

  _batchInsert(keys: string[], values: any[]) {
    if (!Array.isArray(keys) || !Array.isArray(values) || keys.length !== values.length) {
      throw new Error('batchInsert received invalid arguments');
    }
    this.worker.postMessage(['batch-insert', keys, values]);
  }

  _setViewRange(min: number, max: number) {
    this.xL = min;
    this.xR = max;
    this.worker.postMessage(['set-range', min, max]);
  }

  _updateElementsRange() {
    const len = this.view.length;
    if (!this.xL || !this.xR || !this.first || !this.last) return
    this.indexMin = Math.floor((this.xL - this.first) / (this.last - this.first) * len);
    this.indexMax = Math.floor((this.xR - this.first) / (this.last - this.first) * len);
  }

  forEach(fn: (val: any, index: number, array: any[]) => void) {
    return this.view.forEach(fn);
  }

  // insert(key, value) {
  //   if (typeof key !== 'number' || isNaN(key)) {
  //     throw new Error('Key received is not a valid number');
  //   }
  //   if (this.has(key)) {
  //     throw new Error(`Can't add duplicate key: '${key}'`);
  //   }
  //   this.worker.postMessage(['insert', key, value]);
  // }

  // read(min, max) {
  //   if (min >= max) throw new Error('filter(min, max): min must be less than max');
  //   return [this.indexMin, this.indexMax, this.view];
  // }
}
