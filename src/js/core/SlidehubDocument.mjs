import { config } from '../config.mjs';
import { ItemNavigator } from './ItemNavigator.mjs';

/**
 * Slidehub Document
 *
 * Once Custom Elements v1 ([browser support][1]) are implemented in all major browsers, we should
 * make use of them with `class SlidehubDocument extends HTMLElement {};`.
 *
 * Currently, the `SlidehubDocument` object is not exposed to the DOM and needs to be referenced by
 * the document node’s ID.
 *
 * [1]: https://caniuse.com/#feat=custom-elementsv1
 */
class SlidehubDocument {
  /**
   * @param {Slidehub} slidehub
   * @param {String} name
   * @param {Number} imageCount
   * @param {HTMLDivElement?} node
   */
  constructor(slidehub, name, imageCount, node = undefined) {
    this.slidehub = slidehub;
    this._name = name;
    this._imageCount = imageCount;
    this._loaded = false;
    this._node = node ? node : this.insertDocumentNode();

    this._scrollboxNode = null;
    this._items = null;
    this._selectedItemNode = null;
    this._hoveredItemNode = null;
    this._itemNavigator = null;
  }

  get name() {
    return this._name;
  }

  get imageCount() {
    return this._imageCount;
  }

  get loaded() {
    return this._loaded;
  }

  get node() {
    return this._node;
  }

  get scrollboxNode() {
    return this._scrollboxNode;
  }

  get items() {
    return this._items;
  }

  get selectedItemNode() {
    return this._selectedItemNode;
  }

  get hoveredItemNode() {
    return this._hoveredItemNode;
  }

  get navigateItem() {
    return this._itemNavigator;
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

    this._selectedItemNode = itemNode;
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

    this._hoveredItemNode = itemNode;
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
      this._hoveredItemNode = null;
    }
  }

  /**
   * Inserts the node for the `SlidehubDocument` object into the DOM.
   *
   * @returns {HTMLDivElement}
   * @private
   */
  insertDocumentNode() {
    const documentSource = `${config.assets.documents}/${this.name}`;

    const docNode = document.createElement('div');
    docNode.classList.add(config.className.doc);
    docNode.id = this.name;
    docNode.setAttribute('data-doc-source', documentSource);
    const pages = this.imageCount + (config.metaSlide ? 1 : 0);
    docNode.style.setProperty('--sh-pages', pages.toString());

    this.slidehub.node.insertAdjacentElement('beforeend', docNode);

    return docNode;
  }

  /**
   * Loads a SlidehubDocument.
   */
  load() {
    const docNodeInnerMarkup = this.createInnerMarkup();
    this.node.insertAdjacentHTML('beforeend', docNodeInnerMarkup);

    this.finalizeLoading();
  }

  /**
   * Creates the complete markup for a document under the following assumptions:
   * - A file named `this.name` exists on the document assets path
   * - The document’s item images are on the image assets path
   *
   * @returns {String}
   * @private
   */
  createInnerMarkup() {
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
   * Finalizes loading of a SlidehubDocument. This routine mainly sets up references to often used
   * DOM nodes.
   */
  finalizeLoading() {
    this._scrollboxNode = this.node.querySelector(config.selector.scrollbox);
    this._items = this.node.querySelectorAll('[data-page]');
    this._itemNavigator = new ItemNavigator(this.slidehub, this);

    if (!this.slidehub.selectedDocument) {
      this.slidehub.selectDocument(this);
    }

    this.selectItem(this.node.querySelector(config.selector.item));

    this._loaded = true;

    this.node.dispatchEvent(new Event('SlidehubDocumentContentLoaded'));
  }
};

export { SlidehubDocument };
