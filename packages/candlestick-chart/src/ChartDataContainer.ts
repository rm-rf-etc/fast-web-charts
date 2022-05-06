// polyfill Array.at()
if (!Array.prototype.at) {
  Array.prototype.at = function(num) {
    const idx = num < 0 ? this.length + num : num;
    return this[idx];
  }
}

export const someNonAscendingKeys = (arr: any[]) => arr.some(([k], i) => (
  i < arr.length - 1 ? k >= arr[i + 1][0] : false
));
export const someNonDescendingKeys = (arr: any[]) => arr.some(([k], i) => (
  i < arr.length - 1 ? k <= arr[i + 1][0] : false
));

export class Float32TypedArray {
  ascendingOrder;
  chunkSize;
  index = [];
  list;

  constructor(chunkSize = 1000, ascendingOrder = true) {
    this.chunkSize = chunkSize;
    this.list = new Float32Array(chunkSize);
    this.ascendingOrder = !!ascendingOrder;
  }

  get min() {
    if (this.index.length === 0) return null;
    if (this.ascendingOrder) return this.list.at(0);
  }

  insertMulti(...items) {
    const firstKey = items.at(0).at(0);

    if (this.ascendingOrder) {

      if (someNonAscendingKeys(items)) {
        throw new Error("not all keys are in ascending order");
      }

      if (this.max && firstKey <= this.max) {
        throw new Error("first key is not greater than existing max");
      }
      if (!this.index.length) this.min = firstKey;

      if (items.length > this.chunkSize) {
        throw new Error(`can't push ${items.length} items, exceeds chunk size of ${this.chunkSize}`);
      }

      for (const [key, val] of items) {
        this.list[this.index.length] = val;
        this.index.push(key);
      }
      this.max = items.at(-1).at(0);

    } else {

      if (someNonDescendingKeys(items)) {
        throw new Error("not all keys are in descending order");
      }

      if (this.min && firstKey >= this.min) {
        throw new Error("first key is not less than existing min");
      }

      if (items.length > this.chunkSize) {
        throw new Error(`can't unshift ${items.length} items, exceeds chunk size of ${this.chunkSize}`);
      }

      if (!this.index.length) this.max = firstKey;

      for (const [key, val] of items) {
        this.list[this.chunkSize - this.index.length] = val;
        this.index.push(key);
      }
      this.min = items.at(0).at(0);

    }
  }

  has(key) {
    return this.index.includes(key);
  }

  push(key, val) {
    if (this.empty === 0) {
      throw new Error(`can't insert into Float32TypedArray because it's already full`);
    }
    this.list[this.index.length] = val;
    this.index.push(key);
    this.max = key;
  }

  get length() {
    return this.index.length;
  }

  get empty() {
    return this.chunkSize - this.index.length;
  }
}

export class ChunkedList {
  _chunks;
  chunkSize;
  length = 0;

  constructor(chunkSize = 1000, ascendingOrder = true) {
    this.chunkSize = chunkSize;
    this._chunks = [];
    this._chunks.push(new Float32TypedArray(chunkSize, !!ascendingOrder));
  }

  shiftChunk() {
    return this._chunks.shift();
  }

  loopForward(start, end) {
    const chunkIdx = this._chunks.findIndex(chunk => chunk.has(start));
    let i = this._chunks[chunkIdx].index.get(start);
    let endIdx;

    function* iter() {
      while (true) {
        if (i === this.chunkSize) {
          if (chunkIdx === this._chunks.length - 1) {
            return this._chunks[chunkIdx].list[i++];
          }

          i = 0;
          chunkIdx++;
          endIdx = activeChunk.index.findIndex(key => key === end);
        }

        if (i === endIdx) {
          return this._chunks[chunkIdx].list[i];
        } else {
          yield this._chunks[chunkIdx].list[i++];
        }
      }
    }

    return iter();
  }

  popChunk() {
    return this._chunks.pop();
  }

  pop(count) {}

  grow(forward = true) {
    const newChunk = new Float32TypedArray(this.chunkSize, forward);
    if (forward) {
      this._chunks.push(newChunk);
    } else {
      this._chunks.unshift(newChunk);
    }
    return newChunk;
  }

  push(...items) {
    let currentChunk = this._chunks.at(-1);
    if (currentChunk.empty === 0) currentChunk = this.grow();
    let spaceAvailable = currentChunk.empty;

    if (items.length > spaceAvailable) {
      currentChunk.insertMulti(...items.slice(0, spaceAvailable));
      this.push(...items.slice(spaceAvailable));
    } else {
      currentChunk.insertMulti(...items);
    }
    this.length = this._chunks.reduce((p, c) => p + c.length, 0);
  }

  unshift(...items) {
    let currentChunk = this._chunks.at(0);
    if (currentChunk.empty === 0) currentChunk = this.grow(false);
    let spaceAvailable = currentChunk.empty;

    if (items.length > spaceAvailable) {
      currentChunk.insertMulti(...items.slice(0, spaceAvailable));
      this.push(...items.slice(spaceAvailable));
    } else {
      currentChunk.insertMulti(...items);
    }
    this.length = this._chunks.reduce((p, c) => p + c.length, 0);
  }

  shift(count) {}
}

export class ChartDataContainer {
  constructor(data) {
    if (data instanceof Array) {
      this.data = convertCandles(data);
      this.interval = intervalTestArray(data);
      this.oldest = data[data.length - 1].t;
      this.newest = data[0].t;
    }

    if (!this.data) {
      this.data = null;
      this.oldest = null;
      this.newest = null;
      this.interval = null;
    }
  }

  prepend(data) {
    if (!Array.isArray(data)) throw new Error('data must be an Array');

    const incomingLast = data[data.length - 1].t;

    if (this.data === null) {
      this.data = convertCandles(data);
      this.interval = intervalTestArray(data);
    } else {
      if (this.oldest <= incomingLast) {
        throw new Error('last new entry does not come before current first entry');
      }
    }

    this.oldest = data[0].t;

    for (const c of data) {
      this.data.set(c.t, c);
    }
  }

  forEach(...args) {
    return this.data.forEach(...args);
  }

  get(...args) {
    return this.data.get(...args);
  }

  get size() {
    return this.data.size;
  }
}

// ----------------------------------------------------------------------------------

function convertCandles(candlesArray) {
  intervalTestArray(candlesArray);

  const candlesMap = new Map();

  for (const c of candlesArray) {
    candlesMap.set(c.t, c);
  }

  return candlesMap;
}

function intervalTestArray(data) {
  let prev = data[0].t;
  let interval = null;

  if (!prev) throw new Error('received invalid entry, property `t` is either missing or NaN');

  for (let i = 1; i < data.length; i++) {
    const item = data[i];

    if (typeof item.t !== 'number' || isNaN(item.t)) {
      throw new Error('received invalid entry, property `t` is either missing or NaN');
    }
    if (interval === null) {
      interval = prev - item.t;
    }
    if (prev <= item.t) {
      throw new Error('timeseries is not in descending order, meaning newest to oldest');
    }

    prev = item.t;
  }

  return interval;
}
