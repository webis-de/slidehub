import { config } from '../config';
import { parseDocumentsData, parseDocumentsMarkup } from './SlidehubParser';
import { SlidehubDocumentLoader } from './SlidehubDocumentLoader';
import { SlidehubImageLoader } from './SlidehubImageLoader';
import { SlidehubMouseInteraction } from './SlidehubMouseInteraction';
import { SlidehubKeyboardInteraction } from './SlidehubKeyboardInteraction';
import { DocumentNavigator } from './DocumentNavigator';
import { enableModals } from './Modal';

import * as plugin from '../plugins/namespace';

import { debounce } from '../util/debounce';
import { getOuterWidth } from '../util/getOuterWidth';
import { getFragmentIdentifier } from '../util/getFragmentIdentifier';

export { Slidehub };

const selectClassName = 'selected';
const hoverClassName = 'highlighted';

/**
 * Main Slidehub prototype.
 */
class Slidehub {
  /**
   * @public
   */
  constructor() {
    this._node = null;
    this._documents = null;
    this._selectedDocument = null;
    this._hoveredDocument = null;
    this._documentNavigator = null;

    this._itemWidth = null;
    this._visibleItems = null;
    this._scrollboxWidth = null;

    document.addEventListener('DOMContentLoaded', () => {
      this._node = this.getNode();
      this._documents = this.getDocuments();

      let documentLoader;

      if (!config.staticContent) {
        documentLoader = new SlidehubDocumentLoader(this);
        documentLoader.insertDocumentFrames();
      }

      const targetDoc = this.determineTargetDocument();

      if (!config.staticContent) {
        documentLoader.start(targetDoc);
      }

      this.selectDocument(targetDoc);
      this.jumpToTargetDocument(targetDoc);

      this.start();
      this.loadPlugins();
    });
  }

  /**
   * Sets up the main Slidehub HTML element.
   *
   * @returns {HTMLElement} the Slidehub DOM node.
   * @private
   */
  getNode() {
    const existingNode = document.querySelector(config.selector.slidehub);
    const slidehubNode = existingNode ? existingNode : this.createNode();

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
   * Requires an element with a custom attribute `data-slidehub` to be present
   * in the DOM. A new <div> element will be created inside of it. No existing
   * markup will be changed or removed.
   *
   * @returns {HTMLDivElement} the empty Slidehub DOM node.
   * @private
   */
  createNode() {
    const slidehubNode = document.createElement('div');
    slidehubNode.classList.add(config.selector.slidehub.slice(1));

    document.querySelector('[data-slidehub]').appendChild(slidehubNode);

    return slidehubNode;
  }

  /**
   * @returns {ReverseIterableMap} the internal documents data structure.
   */
  getDocuments() {
    return config.staticContent ? parseDocumentsMarkup(this) : parseDocumentsData(this);
  }

  /**
   * @returns {SlidehubDocument}
   */
  determineTargetDocument() {
    const fragmentIdentifier = getFragmentIdentifier(window.location.toString());

    let targetDoc;

    if (this.documents.has(fragmentIdentifier)) {
      targetDoc = this.documents.get(fragmentIdentifier);
    } else if (document.documentElement.scrollTop === 0) {
      // If the viewport was not scrolled already, just start from the top
      targetDoc = this.documents.values().next().value;
    } else {
      // The page was scrolled (e.g. the page was reloaded with a non-zero scroll position)
      // In this case, Slidehub attempts to load the document in the center of the view.
      const slidehubWidth = this.node.clientWidth;
      const centerElement = document.elementFromPoint(slidehubWidth / 2, window.innerHeight / 2);
      const centerDocument = centerElement.closest(config.selector.doc);
      targetDoc = this.documents.get(centerDocument.id);
    }

    return targetDoc;
  }

  jumpToTargetDocument(targetDoc) {
    const fragmentIdentifier = getFragmentIdentifier(window.location.toString());
    if (document.documentElement.scrollTop !== 0 || fragmentIdentifier) {
      const centerOffset = (window.innerHeight - targetDoc.node.clientHeight) / 2;
      // After a short while, scroll the viewport to center the document
      // In the future, `Element.scrollIntoView({ block: 'center' })` should work
      setTimeout(() => window.scrollBy(0, -centerOffset), 200);
    }
  }

  /**
   * Initializes all core functionality.
   *
   * @private
   */
  start() {
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
    const documentSourceLinker = new plugin.DocumentSourceLinker(this);
    documentSourceLinker.enable();

    const pageWidgetPlugin = new plugin.PageWidgetPlugin(this);
    pageWidgetPlugin.enable();
  }

  /**
   * @returns {HTMLElement} the Slidehub DOM node.
   * @public
   */
  get node() {
    return this._node;
  }

  /**
   * @returns {ReverseIterableMap} the Slidehub documents data structure.
   * @public
   */
  get documents() {
    return this._documents;
  }

  /**
   * @returns {SlidehubDocument} the currently selected document.
   * @public
   */
  get selectedDocument() {
    return this._selectedDocument;
  }

  /**
   * @param {SlidehubDocument} doc the new selected document.
   * @private
   */
  set selectedDocument(doc) {
    this._selectedDocument = doc;
  }

  /**
   * Sets a new selected document.
   *
   * @param {SlidehubDocument} doc
   * @public
   */
  selectDocument(doc) {
    // Remove selected class from currently selected document
    if (this.selectedDocument) {
      this.selectedDocument.node.classList.remove(selectClassName);
    }

    // Set new selected document
    this.selectedDocument = doc;
    this.selectedDocument.node.classList.add(selectClassName);

    const slidehubSelectDocumentEvent = new CustomEvent('SlidehubSelectDocument', {
      detail: { doc }
    });
    this.node.dispatchEvent(slidehubSelectDocumentEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * @returns {SlidehubDocument} the currently hovered document.
   * @public
   */
  get hoveredDocument() {
    return this._hoveredDocument;
  }

  /**
   * @param {SlidehubDocument} doc the new hovered document.
   * @private
   */
  set hoveredDocument(doc) {
    this._hoveredDocument = doc;
  }

  /**
   * Sets a new hovered document after unsetting the old one.
   *
   * @param {SlidehubDocument} doc the new hovered document.
   * @public
   */
  hoverDocument(doc) {
    this.unhoverDocument();

    // Set new hovered document
    this.hoveredDocument = doc;
    this.hoveredDocument.node.classList.add(hoverClassName);

    const slidehubHoverDocumentEvent = new CustomEvent('SlidehubHoverDocument', {
      detail: { doc }
    });
    this.node.dispatchEvent(slidehubHoverDocumentEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Removes the hover from the currently hovered document.
   *
   * **Side effect**: Also removes the hover from the currently hovered item
   * within that document.
   *
   * @public
   */
  unhoverDocument() {
    // Remove hovered class from currently hovered document
    if (this.hoveredDocument) {
      this.hoveredDocument.unhoverItem();
      this.hoveredDocument.node.classList.remove(hoverClassName);
      this.hoveredDocument = null;
    }
  }

  /**
   * @returns {DocumentNavigator} the document navigator object.
   * @public
   */
  get navigateDocument() {
    return this._documentNavigator;
  }

  /**
   * @param {DocumentNavigator} documentNavigator
   * @private
   */
  set navigateDocument(documentNavigator) {
    this._documentNavigator = documentNavigator;
  }

  /**
   * @returns {Number}
   * @public
   */
  get itemWidth() {
    return this._itemWidth;
  }

  /**
   * @param {Number} itemWidth
   * @private
   */
  set itemWidth(itemWidth) {
    this._itemWidth = itemWidth;
  }

  /**
   * @returns {Number}
   * @public
   */
  get visibleItems() {
    return this._visibleItems;
  }

  /**
   * @param {Number} visibleItems
   * @private
   */
  set visibleItems(visibleItems) {
    this._visibleItems = visibleItems;
  }

  /**
   * @returns {Number}
   * @public
   */
  get scrollboxWidth() {
    return this._scrollboxWidth;
  }

  /**
   * @param {Number} scrollboxWidth
   * @private
   */
  set scrollboxWidth(scrollboxWidth) {
    this._scrollboxWidth = scrollboxWidth;
  }

  /**
   * Wrapper method for all expose methods.
   *
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
   * Exposes the current outer width of an item to the DOM.
   *
   * @private
   */
  exposeItemWidth() {
    const item = this.selectedDocument.node.querySelector(config.selector.item);
    const itemOuterWidth = getOuterWidth(item);

    if (this.itemWidth !== itemOuterWidth) {
      this.itemWidth = itemOuterWidth;

      this.node.style.setProperty('--page-outer-width', this.itemWidth + 'px');
    }
  }

  /**
   * Exposes the current `clientWidth` of the selected scrollbox to the DOM.
   *
   * @private
   */
  exposeScrollboxWidth() {
    const scrollboxNode = this.selectedDocument.node.querySelector(config.selector.scrollbox);

    if (this.scrollboxWidth !== scrollboxNode.clientWidth) {
      this.scrollboxWidth = scrollboxNode.clientWidth;

      this.node.style.setProperty('--scrollbox-width', this.scrollboxWidth + 'px');
    }
  }

  /**
   * Exposes the current number of visible items in a document to the DOM.
   *
   * @private
   */
  exposeNumberOfVisibleItems() {
    this.visibleItems = Math.floor(this.scrollboxWidth / this.itemWidth);
  }
};
