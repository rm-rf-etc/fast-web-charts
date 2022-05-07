import BTree from 'sorted-btree';

const btree = new BTree(undefined, (a, b) => a > b ? 1 : -1);

onmessage = e => {
  const [action, ...args] = e.data;

  switch(action) {
    case 'batch-insert': {
      const [keys, values] = args;

      for (let i = 0; i < keys.length; i++) {
        btree.set(keys[i], values[i]);
      }

      postMessage(['set-view', {
        list: btree.valuesArray(),
        minKey: btree.minKey(),
        maxKey: btree.maxKey(),
      }]);
      return;
    }

    case 'insert': {
      const [key, value] = args;

      btree.set(key, value);

      postMessage(['set-view', {
        list: btree.valuesArray(),
        minKey: btree.minKey(),
        maxKey: btree.maxKey(),
      }]);
      return;
    }

    case 'set-range': {
      const [min, max] = args;
      let minKey = Infinity;
      let maxKey = -Infinity;
      const list = [];
      btree.forRange(min, max, true, (k, v) => {
        minKey = Math.min(minKey, k);
        maxKey = Math.max(maxKey, k);
        list.push(v);
      });
      postMessage(['set-view', { list, minKey, maxKey }]);
      return;
    }
  }
}
