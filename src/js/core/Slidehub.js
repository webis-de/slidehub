import { config } from '../config';
import { documentsData } from '../documents-data';
import { parseDocumentsData, parseDocumentsMarkup } from './SlidehubParser';
import { SlidehubDocumentBuilder } from './SlidehubDocumentBuilder';
import { SlidehubImageLoader } from './SlidehubImageLoader';
import { SlidehubMouseInteraction } from './SlidehubMouseInteraction';
import { SlidehubKeyboardInteraction } from './SlidehubKeyboardInteraction';
import { DocumentNavigator } from './DocumentNavigator';
import { enableModals } from './Modal';

import { Highlighter } from '../plugins/Highlighter';
import { DocumentSourceLinker } from '../plugins/DocumentSourceLinker';

import { debounce } from '../util/debounce';
import { getOuterWidth } from '../util/get-outer-width';
import { numberOfVisibleElements } from '../util/number-of-visible-elements';

export { Slidehub };

const selectClassName = 'selected';
const highlightClassName = 'highlighted';

/**
 * Main class.
 */
class Slidehub {
  /**
   * @public
   */
  constructor() {
    this._node = null;
    this._documents = null;
    this._selectedDocument = null;
    this._highlightedDocument = null;
    this._documentNavigator = null;

    this._itemWidth = null;
    this._visibleItems = null;
    this._scrollboxWidth = null;

    document.addEventListener('DOMContentLoaded', () => {
      this.start();
      this.loadPlugins();
    });
  }

  /**
   * Initializes all core functionality.
   *
   * @private
   */
  start() {
    this.node = initializeSlidehubNode();

    if (config.staticContent) {
      this.documents = parseDocumentsMarkup(this);
    } else {
      this.documents = parseDocumentsData(this, documentsData);
      const builder = new SlidehubDocumentBuilder(this);
      builder.build();
    }

    this.navigateDocument = new DocumentNavigator(this);

    this.exposeDocumentInfo();

    const imageLoader = new SlidehubImageLoader(this);
    imageLoader.start();

    const mouseInteraction = new SlidehubMouseInteraction(this);
    mouseInteraction.start();

    const keyboardInteraction = new SlidehubKeyboardInteraction(this);
    keyboardInteraction.start();

    enableModals();
  }

  /**
   * Loads optional plugins.
   *
   * @private
   */
  loadPlugins() {
    const highlighter = new Highlighter(this);
    highlighter.enable();

    const documentSourceLinker = new DocumentSourceLinker(this);
    documentSourceLinker.enable();
  }

  /**
   * @returns {HTMLElement}
   */
  get node() {
    return this._node;
  }

  /**
   * @param {HTMLElement} node
   */
  set node(node) {
    this._node = node;
  }

  /**
   * @returns {LinkedMap}
   */
  get documents() {
    return this._documents;
  }

  /**
   * @public
   */
  set documents(documents) {
    this._documents = documents;
  }

  /**
   * @returns {SlidehubDocument}
   */
  get selectedDocument() {
    return this._selectedDocument;
  }

  /**
   * @param {SlidehubDocument} doc
   */
  set selectedDocument(doc) {
    this._selectedDocument = doc;
  }

  /**
   * Sets a new selected document.
   *
   * @param {SlidehubDocument} doc
   */
  selectDocument(doc) {
    // Remove selected class from currently selected document
    if (this.selectedDocument) {
      this.selectedDocument.node.classList.remove(selectClassName);
    }

    // Set new selected document
    doc.node.classList.add(selectClassName);
    this.selectedDocument = doc;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * @returns {SlidehubDocument}
   */
  get highlightedDocument() {
    return this._highlightedDocument;
  }

  /**
   * @param {SlidehubDocument} doc
   */
  set highlightedDocument(doc) {
    this._highlightedDocument = doc;
  }

  /**
   * Sets a new highlighted document.
   *
   * @param {SlidehubDocument} doc
   */
  highlightDocument(doc) {
    this.unhighlightDocument();

    // Set new highlighted document
    doc.node.classList.add(highlightClassName);
    this.highlightedDocument = doc;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Removes the highlight from the currently highlighted document.
   */
  unhighlightDocument() {
    // Remove highlighted class from currently highlighted document
    if (this.highlightedDocument) {
      this.highlightedDocument.unhighlightItem();
      this.highlightedDocument.node.classList.remove(highlightClassName);
      this.highlightedDocument = null;
    }
  }

  get navigateDocument() {
    return this._documentNavigator;
  }

  set navigateDocument(documentNavigator) {
    this._documentNavigator = documentNavigator;
  }

  get itemWidth() {
    return this._itemWidth;
  }

  set itemWidth(itemWidth) {
    this._itemWidth = itemWidth;
  }

  get visibleItems() {
    return this._visibleItems;
  }

  set visibleItems(visibleItems) {
    this._visibleItems = visibleItems;
  }

  get scrollboxWidth() {
    return this._scrollboxWidth;
  }

  set scrollboxWidth(scrollboxWidth) {
    this._scrollboxWidth = scrollboxWidth;
  }

  /**
   * @private
   */
  exposeDocumentInfo() {
    this.exposeItemWidth();
    this.exposeScrollboxWidth();
    this.exposeNumberOfVisibleItems();

    // Recalculate the scrollbox width on resize.
    window.addEventListener('resize', debounce(() => {
      this.exposeItemWidth();
      this.exposeScrollboxWidth();
      this.exposeNumberOfVisibleItems();
    }, 200));
  }

  /**
   * Computes and stores the outer width of items in the DOM in the form of a
   * custom property. This way, it is accessible from within CSS.
   *
   * TO DO: Check for box-sizing value and compute accordingly.
   *
   * @private
   */
  exposeItemWidth() {
    const doc = this.node.querySelector(`${config.selector.doc}[data-loaded]`);
    const item = doc.querySelector(config.selector.item);
    const itemWidth = getOuterWidth(item);

    if (this.itemWidth !== itemWidth) {
      this.itemWidth = itemWidth;

      this.node.style.setProperty('--page-outer-width', itemWidth + 'px');
    }
  }

  /**
   * Exposes the current width of the first scrollbox to the DOM.
   *
   * @private
   */
  exposeScrollboxWidth() {
    const doc = this.node.querySelector(`${config.selector.doc}[data-loaded]`);
    const scrollbox = doc.querySelector(config.selector.scrollbox);
    const scrollboxWidth = getOuterWidth(scrollbox);

    if (this.scrollboxWidth !== scrollboxWidth) {
      this.scrollboxWidth = scrollboxWidth;

      this.node.style.setProperty('--scrollbox-width', scrollboxWidth + 'px');
    }
  }

  /**
   * Exposes the current number of visible items in a document to the DOM.
   *
   * @private
   */
  exposeNumberOfVisibleItems() {
    const docNode = this.node.querySelector(`${config.selector.doc}[data-loaded]`);
    const visibleItems = numberOfVisibleElements(docNode, this.itemWidth);

    if (this.visibleItems !== visibleItems) {
      this.visibleItems = visibleItems;

      this.node.style.setProperty('--visible-pages', visibleItems);
    }
  }
};

/**
 *
 * @returns {HTMLElement}
 */
function initializeSlidehubNode() {
  const existingNode = document.querySelector(config.selector.slidehub);
  const slidehubNode = existingNode ? existingNode : createSlidehubNode();

  // Expose select/highlight color overrides to the DOM.
  // This allows CSS to use inside of a rule declaration.
  if (config.selectColor && config.selectColor !== '') {
    slidehubNode.style.setProperty('--c-selected', config.selectColor);
  }

  if (config.highlightColor && config.highlightColor !== '') {
    slidehubNode.style.setProperty('--c-highlighted', config.highlightColor);
  }

  return slidehubNode;
}

/**
 * Hooks the Slidehub container element into the DOM.
 *
 * Requires an element with a custom attribute `data-slidehub`. A new <div> element
 * will be created inside of it. No existing markup will be changed or removed.
 *
 * @returns {HTMLElement}
 */
function createSlidehubNode() {
  const slidehubNode = document.createElement('div');
  slidehubNode.classList.add(config.selector.slidehub.slice(1));

  document.querySelector('[data-slidehub]').appendChild(slidehubNode);

  return slidehubNode;
}
