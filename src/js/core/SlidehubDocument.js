import { config } from '../config';
import { ItemNavigator } from './ItemNavigator';

export { SlidehubDocument };

const selectClassName = 'selected';
const highlightClassName = 'highlighted';

/**
 * Slidehub Document
 */
class SlidehubDocument {
  /**
   * @param {String} name
   * @param {Number} imageCount
   */
  constructor(slidehub, name, imageCount) {
    this.slidehub = slidehub;

    this._node = null;
    this._scrollboxNode = null;
    this._items = null;
    this._selectedItemNode = null;
    this._highlightedItemNode = null;
    this._itemNavigator = null;

    this._name = name;
    this._imageCount = imageCount;
    this._loaded = false;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {Number}
   */
  get imageCount() {
    return this._imageCount;
  }

  /**
   * @returns {Boolean}
   */
  get loaded() {
    return this._loaded;
  }

  /**
   * @param {Boolean} loaded
   */
  set loaded(loaded) {
    this._loaded = loaded;
  }

  get node() {
    return this._node;
  }

  set node(node) {
    this._node = node;
  }

  get scrollboxNode() {
    return this._scrollboxNode;
  }

  get items() {
    return this._items;
  }

  /**
   * @returns {Number}
   */
  itemCount() {
    return this.items.length - 1;
  }

  get navigateItem() {
    return this._itemNavigator;
  }

  /**
   * @param {HTMLElement} node
   */
  setNode(node) {
    this.node = node;
    this._scrollboxNode = node.querySelector(config.selector.scrollbox);
    // Avoid browsers remembering the scroll position when refreshing the page.
    this._scrollboxNode.scrollLeft = 0;
    this._items = node.querySelectorAll('[data-page]');
    this._itemNavigator = new ItemNavigator(this.slidehub, this);
    this.selectItem(node.querySelector(config.selector.item));
  }

  get selectedItemNode() {
    return this._selectedItemNode;
  }

  set selectedItemNode(item) {
    this._selectedItemNode = item;
  }

  /**
   * Sets a new selected item.
   *
   * @param {Element} targetItemNode
   */
  selectItem(targetItemNode) {
    const itemContainer = targetItemNode.parentElement;
    if (this.selectedItemNode && itemContainer.contains(this.selectedItemNode)) {
      this.selectedItemNode.classList.remove(selectClassName);
    }

    targetItemNode.classList.add(selectClassName);
    this.selectedItemNode = targetItemNode;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  get highlightedItemNode() {
    return this._highlightedItemNode;
  }

  set highlightedItemNode(item) {
    this._highlightedItemNode = item;
  }

  /**
   * Sets a new highlighted item.
   *
   * @param {Element} targetItemNode
   */
  highlightItem(targetItemNode) {
    const itemContainer = targetItemNode.parentElement;
    if (this.highlightedItemNode && itemContainer.contains(this.highlightedItemNode)) {
      this.highlightedItemNode.classList.remove(highlightClassName);
    }

    targetItemNode.classList.add(highlightClassName);
    this.highlightedItemNode = targetItemNode;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
};
