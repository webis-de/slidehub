import { config } from '../config';
import { ItemNavigator } from './ItemNavigator';

export { SlidehubDocument };

const selectClassName = 'selected';
const hoverClassName = 'highlighted';

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

    this.selectedItemNode = targetItemNode;
    this.selectedItemNode.classList.add(selectClassName);

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
   * @param {Element} targetItemNode
   */
  hoverItem(targetItemNode) {
    this.unhoverItem();

    this.hoveredItemNode = targetItemNode;
    this.hoveredItemNode.classList.add(hoverClassName);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Removes the hover from the currently hovered item.
   */
  unhoverItem() {
    if (this.hoveredItemNode) {
      this.hoveredItemNode.classList.remove(hoverClassName);
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
    const scrollboxClassName = config.selector.scrollbox.slice(1);
    const itemContainerClassName = config.selector.itemContainer.slice(1);
    const itemClassName = config.selector.item.slice(1);

    let items = '';
    for (var i = 0; i < this.imageCount; i++) {
      const imageSource = `${config.assets.images}/${this.name}-${i}.png`;
      items += `<div class="${itemClassName}" data-page="${i + 1}">
        <img data-src="${imageSource}" alt="page ${i + 1}">
      </div>`;
    }

    const documentSource = `${config.assets.documents}/${this.name}`;

    const metaSlide = `<div class="${itemClassName} ${itemClassName}--text" data-page="0">
      <div class="doc-meta">
        <h2 class="doc-meta__title">
          <a href="${documentSource}">${this.name}</a>
        </h2>
        by author, ${this.imageCount} pages, 2018
      </div>
    </div>`;

    const dummyPage = `<div
      class="${itemClassName} dummy-page"
      aria-hidden="true"
      style="visibility: hidden;"
    ></div>`;

    return `<div class="${scrollboxClassName}">
      <div class="${itemContainerClassName}">
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
