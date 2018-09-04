import { config } from '../config.mjs';
import { ItemNavigator } from './ItemNavigator.mjs';

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

    this._name = name;
    this._imageCount = imageCount;
    this._loaded = false;

    this._node = null;
    this._scrollboxNode = null;
    this._items = null;
    this._selectedItemNode = null;
    this._hoveredItemNode = null;
    this._itemNavigator = null;
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

  /**
   * @returns {Number}
   */
  totalPages() {
    return this.itemCount() + (config.metaSlide ? 0 : 1);
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
   * @param {Element} itemNode
   */
  selectItem(itemNode) {
    if (this.selectedItemNode === itemNode) {
      return;
    }

    const itemContainer = itemNode.parentElement;
    if (this.selectedItemNode && itemContainer.contains(this.selectedItemNode)) {
      this.selectedItemNode.classList.remove(config.className.selected);
    }

    this.selectedItemNode = itemNode;
    this.selectedItemNode.classList.add(config.className.selected);

    const slidehubSelectItemEvent = new CustomEvent('SlidehubSelectItem', {
      bubbles: true,
      detail: { itemNode }
    });
    this.node.dispatchEvent(slidehubSelectItemEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  get hoveredItemNode() {
    return this._hoveredItemNode;
  }

  set hoveredItemNode(item) {
    this._hoveredItemNode = item;
  }

  /**
   * Sets a new hovered item.
   *
   * @param {Element} itemNode
   */
  hoverItem(itemNode) {
    if (this.hoveredItemNode === itemNode) {
      return;
    }

    this.unhoverItem();

    this.hoveredItemNode = itemNode;
    this.hoveredItemNode.classList.add(config.className.highlighted);

    const slidehubHoverItemEvent = new CustomEvent('SlidehubHoverItem', {
      bubbles: true,
      detail: { itemNode }
    });
    this.node.dispatchEvent(slidehubHoverItemEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Removes the hover from the currently hovered item.
   */
  unhoverItem() {
    if (this.hoveredItemNode) {
      this.hoveredItemNode.classList.remove(config.className.highlighted);
      this.hoveredItemNode = null;
    }
  }

  get navigateItem() {
    return this._itemNavigator;
  }

  load() {
    const markup = this.createMarkup();
    const docNode = document.getElementById(this.name);
    docNode.insertAdjacentHTML('beforeend', markup);

    this.setNode(docNode);

    return docNode;
  }

  /**
   * Creates the complete markup for a document under the following assumptions:
   * - A file named `this.name` exists on the document assets path
   * - The document’s item images are on the image assets path
   *
   * @returns {String}
   */
  createMarkup() {
    let items = '';
    for (var i = 0; i < this.imageCount; i++) {
      const imageSource = `${config.assets.images}/${this.name}-${i}.png`;
      items += `<div class="${config.className.item}" data-page="${i + 1}">
        <img data-src="${imageSource}" alt="page ${i + 1}">
      </div>`;
    }

    const documentSource = `${config.assets.documents}/${this.name}`;

    const metaSlide = `<div class="${config.className.item} ${config.className.item}--text" data-page="0">
      <div class="sh-doc-meta">
        <h2 class="sh-doc-meta__title">
          <a href="${documentSource}">${this.name}</a>
        </h2>
        by author, ${this.imageCount} pages, 2018
      </div>
    </div>`;

    const dummyPage = `<div
      class="${config.className.item} dummy-page"
      aria-hidden="true"
      style="visibility: hidden;"
    ></div>`;

    return `<div class="${config.className.scrollbox}">
      <div class="${config.className.itemContainer}">
        ${config.metaSlide ? metaSlide : ''}
        ${items}
        ${dummyPage}
      </div>
    </div>`;
  }

  /**
   * @param {HTMLElement} node
   */
  setNode(node) {
    this.node = node;
    this._scrollboxNode = node.querySelector(config.selector.scrollbox);
    this._items = node.querySelectorAll('[data-page]');
    this._itemNavigator = new ItemNavigator(this.slidehub, this);

    if (!this.slidehub.selectedDocument) {
      this.slidehub.selectDocument(this);
    }
    this.selectItem(node.querySelector(config.selector.item));

    this.loaded = true;
  }
};

export { SlidehubDocument };
