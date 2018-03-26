export { ReverseIterableMap };

/**
 * A reverse-iterable map implementation based on the built-in [`Map`][Map] object.
 *
 * It exposes its order via iterable iterators which can be used for both forwards and backwards
 * iteration. As per `Map`, the order of a `ReverseIterableMap` is the insertion order.
 *
 * [Map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *
 * @typedef {class} ReverseIterableMapType
 * @template K, V
 * @property {Map<K, V>} _map
 * @property {ReverseIterableMapNode} _first
 * @property {ReverseIterableMapNode} _last
 *
 * @type {ReverseIterableMapType}
 */
class ReverseIterableMap {
  /**
   * An [iterable][iterable] object whose elements are key-value pairs.
   *
   * [iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol
   *
   * @param {Iterable?} iterable
   * @public
   */
  constructor(iterable = null) {
    this._map = new Map();
    this._first = null;
    this._last = null;

    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  /**
   * The [`@@toStringTag`][toStr] property is used is used when `toString()` is called on a
   * `ReverseIterableMap` object.
   *
   * [toStr]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@toStringTag
   *
   * @returns {string} The string tag of the `ReverseIterableMap` class.
   * @public
   */
  get [Symbol.toStringTag]() {
    return 'ReverseIterableMap';
  }

  /**
   * Returns the first `ReverseIterableMapNode` from a `ReverseIterableMap` object.
   *
   * @returns {ReverseIterableMapNode} The `ReverseIterableMapNode` object.
   * @private
   */
  get first() {
    return this._first;
  }

  /**
   * Sets the first `ReverseIterableMapNode` of a `ReverseIterableMap` object.
   *
   * @param {ReverseIterableMapNode} node The `ReverseIterableMapNode` object.
   * @private
   */
  set first(node) {
    this._first = node;
  }

  /**
   * Returns the last `ReverseIterableMapNode` from a `ReverseIterableMap` object.
   *
   * @returns {ReverseIterableMapNode} The `ReverseIterableMapNode` object.
   * @private
   */
  get last() {
    return this._last;
  }

  /**
   * Sets the last `ReverseIterableMapNode` of a `ReverseIterableMap` object.
   *
   * @param {ReverseIterableMapNode} node The `ReverseIterableMapNode` object.
   * @private
   */
  set last(node) {
    this._last = node;
  }

  /**
   * The `size` accessor property returns the number of elements in a `ReverseIterableMap` object.
   * Calls [`Map.prototype.size`][size].
   *
   * [size]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
   *
   * @returns {number} The size of the ReverseIterableMap.
   * @public
   */
  get size() {
    return this._map.size;
  }

  /**
   * The `clear()` method removes all elements from a `ReverseIterableMap` object. Calls
   * [`Map.prototype.clear`][clear].
   *
   * [clear]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
   *
   * @public
   */
  clear() {
    this._map.clear();
    this._first = null;
    this._last = null;
  }

  /**
   * The `has()` method returns a boolean indicating whether an element with the specified key
   * exists or not. Calls [`Map.prototype.has`][has].
   *
   * [has]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
   *
   * @param {*} key
   * @returns {boolean} `true` if an element with the specified key exists in a
   * `ReverseIterableMap` object; otherwise `false`.
   * @public
   */
  has(key) {
    return this._map.has(key);
  }

  /**
   * The `get()` method returns a specified element from a `ReverseIterableMap` object. Calls
   * [`Map.prototype.get`][get].
   *
   * [get]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
   *
   * @param {*} key
   * @returns {*|undefined}
   * @public
   */
  get(key) {
    return this._map.get(key).value;
  }

  /**
   * The `getLast()` method returns the last element from a `ReverseIterableMap` object.
   *
   * @returns {*|null} The last element or `null` if the map is empty.
   * @public
   */
  getLast() {
    if (this.last) {
      return this.last.value;
    }

    return null;
  }

  /**
   * The `getFirst()` method returns the first element from a `ReverseIterableMap` object.
   *
   * @returns {*|null} The first element or `null` if the map is empty.
   * @public
   */
  getFirst() {
    if (this.first) {
      return this.first.value;
    }

    return null;
  }

  /**
   * The `add()` method adds a new element to the internal `Map` object. It does not link itself
   * with its neighboring elements which is why this method must never be called directly.
   *
   * @param {*} key The key of the element to add to the `ReverseIterableMap` object.
   * @param {*} value The value of the element to add to the `ReverseIterableMap` object.
   * @returns {ReverseIterableMapNode} The `ReverseIterableMapNode` object.
   * @private
   */
  add(key, value) {
    let node = this._map.get(key);

    if (node) {
      node.value = value;
    } else {
      node = new ReverseIterableMapNode(key, value);

      this._map.set(key, node);
    }

    return node;
  }

  /**
   * The `set()` method adds a new element to a `ReverseIterableMap` object in insertion order or
   * updates the value of an existing element.
   *
   * @param {*} key The key of the element to add to the `ReverseIterableMap` object.
   * @param {*} value The value of the element to add to the `ReverseIterableMap` object.
   * @returns {ReverseIterableMap} The `ReverseIterableMap` object.
   * @public
   */
  set(key, value) {
    const node = this.add(key, value);

    if (this.first === null && this.last === null) {
      this.first = node;
      this.last = node;
    } else {
      node.prev = this.last;
      this.last.next = node;
      this.last = node;
    }

    return this;
  }

  /**
   * The `setFront()` method adds a new element to a `ReverseIterableMap` object in
   * reverse insertion order or updates the value of an existing element.
   *
   * @param {*} key The key of the element to add to the `ReverseIterableMap` object.
   * @param {*} value The value of the element to add to the `ReverseIterableMap` object.
   * @returns {ReverseIterableMap} The `ReverseIterableMap` object.
   * @public
   */
  setFirst(key, value) {
    const node = this.add(key, value);

    if (this.first === null && this.last === null) {
      this.first = node;
      this.last = node;
    } else {
      node.next = this.first;
      this.first.prev = node;
      this.first = node;
    }

    return this;
  }

  /**
   * The `delete()` method removes the specified element from a
   * `ReverseIterableMap` object. Calls [`Map.prototype.delete`][del].
   *
   * [del]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
   *
   * @param {*} key The key of the element to remove from the
   * `ReverseIterableMap` object.
   * @returns {boolean} `true` if an element in the `ReverseIterableMap` object
   * existed and has been removed, or `false` if the element does not exist.
   * @public
   */
  delete(key) {
    if (this.has(key)) {
      const node = this._map.get(key);

      if (this.first === this.last) {
        this.first = null;
        this.last = null;
      } else if (this.first === node) {
        node.next.prev = null;
        this.first = node.next;
      } else if (this.last === node) {
        node.prev.next = null;
        this.last = node.prev;
      } else {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }

      this._map.delete(key);

      return true;
    }

    return false;
  }

  /**
   * The `forEach()` method executes a provided function once per each key/value pair in the
   * `ReverseIterableMap` object, in insertion order. For reference, see
   * [`Map.prototype.forEach`][fe].
   *
   * [fe]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
   *
   * @param {function} callback
   * @param {*?} thisArg
   * @public
   */
  forEach(callback, thisArg = undefined) {
    for (const [key, value] of this.entries()) {
      callback(value, key, thisArg);
    }
  }

  /**
   * The `forEachReverse()` method executes a provided function once per each key/value pair in the
   * `ReverseIterableMap` object, in reverse insertion order.
   *
   * @param {function} callback
   * @param {*?} thisArg
   * @public
   */
  forEachReverse(callback, thisArg = undefined) {
    for (const [key, value] of this.entries().reverse()) {
      callback(value, key, thisArg);
    }
  }

  /**
   * The initial value of the @@iterator property is the same function object as the initial value
   * of the entries property.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
   *
   * @returns {IterableIterator}
   * @public
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   * Allows usage of the [iteration protocols][ip] for reverse iteration.
   *
   * [ip]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
   *
   * Examples:
   *
   * ```js
   * const map = new ReverseIterableMap();
   *
   * [...map.reverse()];
   *
   * for (const [key, value] of map.reverse()) {
   *   console.log(key, value);
   * }
   * ```
   *
   * @returns {IterableIterator}
   * @public
   */
  reverse() {
    return this.entries().reverse();
  }

  /**
   * The `entries()` method returns a new [Iterator][it] object that contains the `[key, value]`
   * pairs for each element in a `ReverseIterableMap` object in insertion order.
   *
   * [it]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
   *
   * @returns {IterableIterator}
   * @public
   */
  entries() {
    const getIteratorValue = function(node) {
      return [node.key, node.value];
    };

    return this.iterableIterator(getIteratorValue);
  }

  /**
   * The `keys()` method returns a new [Iterator][it] object that contains the keys for each
   * element in a `ReverseIterableMap` object in insertion order.
   *
   * [it]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
   *
   * @returns {IterableIterator}
   * @public
   */
  keys() {
    const getIteratorValue = function(node) {
      return node.key;
    };

    return this.iterableIterator(getIteratorValue);
  }

  /**
   * The `values()` method returns a new [Iterator][it] object that contains the values for each
   * element in a `ReverseIterableMap` object in insertion order.
   *
   * [it]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
   *
   * @returns {IterableIterator}
   * @public
   */
  values() {
    const getIteratorValue = function(node) {
      return node.value;
    };

    return this.iterableIterator(getIteratorValue);
  }

  /**
   * The `iteratorFor()` method returns a new [Iterator][it] object that contains the
   * `[key, value]` pairs for each element in a `ReverseIterableMap` object in insertion order
   *  **starting with the pair specified by the `key` parameter**.
   *
   * [it]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
   *
   * @param {*} key The key of the element to start iterating from.
   * @returns {IterableIterator}
   * @public
   */
  iteratorFor(key) {
    let startNode = this._map.get(key);
    const getIteratorValue = function(node) {
      return [node.key, node.value];
    };

    return this.iterableIterator(getIteratorValue, startNode);
  }

  /**
   * Returns an object which is both an iterable and an iterator. It fulfills the requirements of
   * the [iteration protocols][ip] plus allowing reverse-iteration.
   *
   * - **Iterator requirements**: An object that implements a function `next`. This function
   *   returns an object with two properties: `value` and `done`.
   *
   * - **Iterable requirements**: An object that implements a function `[Symbol.iterator]()`. This
   *   function returns an iterator.
   *
   * - **Reverse-iterable requirements**: An object that implements a function `reverse()`. This
   *   function returns an iterator with the special behavior of iterating in reverse insertion
   *   order. This is non-standard behavior.
   *
   * [ip]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
   *
   * @param {function} getIteratorValue
   * @param {ReverseIterableMapNode?} startNode
   * @returns {IterableIterator}
   * @private
   */
  iterableIterator(getIteratorValue, startNode = undefined) {
    let currentNode = startNode ? startNode : this.first;
    // Store the this.last node as inside the reverse() method, `this` will be
    // bound to iterableIterator, not ReverseIterableMap. That’s on purpose.
    const last = this.last;
    let nextProp = 'next';

    return {
      reverse() {
        currentNode = startNode ? startNode : last;
        nextProp = 'prev';
        return this;
      },
      [Symbol.iterator]() {
        // Return the iterable itself.
        return this;
      },
      next: function() {
        let value;
        if (currentNode) {
          value = getIteratorValue(currentNode);
          currentNode = currentNode[nextProp];
        }
        return iteratorResult(value);
      }
    };
  }
}

/**
 * The `ReverseIterableMapNode` object represents an element in a `ReverseIterableMap` object.
 * Its main purpose is storing a `[key, value]` pair. Additionally, it keeps references to the
 * `ReverseIterableMapNode` objects appearing before and after itself in a `ReverseIterableMap`
 * object.
 *
 * @typedef {class} ReverseIterableMapNodeType
 * @template K, V
 * @property {K} _key
 * @property {V} _value
 * @property {ReverseIterableMapNode} _prev
 * @property {ReverseIterableMapNode} _next
 *
 * @type {ReverseIterableMapNodeType}
 * @protected
 */
class ReverseIterableMapNode {
  /**
   * A `[key, value]` pair that is part of a `ReverseIterableMap` object.
   *
   * @template K, V
   * @param {K} key
   * @param {V} value
   */
  constructor(key, value) {
    this._key = key;
    this._value = value;
    this._next = null;
    this._prev = null;
  }

  /**
   * Returns the key from a `ReverseIterableMapNode` object.
   *
   * @returns {*} The key.
   * @protected
   */
  get key() {
    return this._key;
  }

  /**
   * Returns the value from a `ReverseIterableMapNode` object.
   *
   * @returns {*} The value.
   * @protected
   */
  get value() {
    return this._value;
  }

  /**
   * Sets the value of a `ReverseIterableMapNode` object.
   *
   * @param {*} value The value.
   * @protected
   */
  set value(value) {
    this._value = value;
  }

  /**
   * Returns the reference to the next node of a `ReverseIterableMapNode` object.
   *
   * @returns {ReverseIterableMapNode} The `ReverseIterableMapNode` object.
   * @protected
   */
  get next() {
    return this._next;
  }

  /**
   * Sets the reference to the next node of a `ReverseIterableMapNode` object.
   *
   * @param {ReverseIterableMapNode} next The `ReverseIterableMapNode` object.
   * @protected
   */
  set next(next) {
    this._next = next;
  }

  /**
   * Returns the reference to the previous node of a `ReverseIterableMapNode` object.
   *
   * @returns {ReverseIterableMapNode} The `ReverseIterableMapNode` object.
   * @protected
   */
  get prev() {
    return this._prev;
  }

  /**
   * Sets the reference to the previous node of a `ReverseIterableMapNode` object.
   *
   * @param {ReverseIterableMapNode} prev The `ReverseIterableMapNode` object.
   * @protected
   */
  set prev(prev) {
    this._prev = prev;
  }
}

/**
 * Returns an `IteratorResult` object as per the following rules:
 * - If `value` is not `undefined`, `done` is `false`.
 * - If `value` is `undefined`, `done` is `true`. In this case, `value` may be omitted.
 *
 * This function does not belong to `ReverseIterableMap` as it doesn’t need access to any
 * of its properties.
 *
 * @param {*|undefined} value
 * @returns {IteratorResult}
 */
function iteratorResult(value) {
  return {
    value: value,
    done: value === undefined
  };
}
