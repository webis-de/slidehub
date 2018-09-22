import { config } from '../config.mjs';
import { getDocuments } from './SlidehubParser.mjs';
import { SlidehubDocumentLoader } from './SlidehubDocumentLoader.mjs';
import { SlidehubImageLoader } from './SlidehubImageLoader.mjs';
import { SlidehubMouseInteraction } from './SlidehubMouseInteraction.mjs';
import { SlidehubKeyboardInteraction } from './SlidehubKeyboardInteraction.mjs';
import { DocumentNavigator } from './DocumentNavigator.mjs';
import { enableModals } from './Modal.mjs';

import * as plugin from '../plugins/namespace.mjs';

import { debounce } from '../util/debounce.mjs';
import { getOuterWidth } from '../util/getOuterWidth.mjs';
import { getFragmentIdentifier } from '../util/getFragmentIdentifier.mjs';
import { SlidehubDocument } from './SlidehubDocument.mjs';

/**
 * Main Slidehub prototype.
 *
 * @property {SlidehubDocument} _selectedDocument
 * @property {SlidehubDocument} _hoveredDocument
 * @property {DocumentNavigator} _documentNavigator
 * @property {HTMLDivElement} _node
 * @property {ReverseIterableMap<String, SlidehubDocument>} _documents
 * @property {SlidehubDocument} _targetDocument
 * @property {Number} _itemWidth
 * @property {Number} _visibleItems
 * @property {Number} _scrollboxWidth
 */
class Slidehub {
  constructor() {
    this._selectedDocument = null;
    this._hoveredDocument = null;
    this._documentNavigator = new DocumentNavigator(this);

    this._node = getSlidehubNode();
    this.insertStatusBar();
    this._documents = getDocuments(this);
    this._targetDocument = this.determineTargetDocument();

    new SlidehubKeyboardInteraction(this);
    new SlidehubMouseInteraction(this);
    new SlidehubImageLoader(this);

    if (!config.staticContent) {
      new SlidehubDocumentLoader(this);
    }

    this.selectDocument(this.targetDocument);

    this.centerFragmentTargetDocument();

    this._itemWidth = null;
    this._visibleItems = null;
    this._scrollboxWidth = null;
    this.exposeDocumentInfo();

    this.loadPlugins();

    enableModals();
  }

  get node() {
    return this._node;
  }

  get documents() {
    return this._documents;
  }

  get targetDocument() {
    return this._targetDocument;
  }

  get selectedDocument() {
    return this._selectedDocument;
  }

  get hoveredDocument() {
    return this._hoveredDocument;
  }

  get navigateDocument() {
    return this._documentNavigator;
  }

  get itemWidth() {
    return this._itemWidth;
  }

  get visibleItems() {
    return this._visibleItems;
  }

  get scrollboxWidth() {
    return this._scrollboxWidth;
  }

  /**
   * Sets a new selected document.
   *
   * @param {SlidehubDocument} doc
   */
  selectDocument(doc) {
    if (this.selectedDocument === doc) {
      return;
    }

    // Remove selected class from currently selected document
    if (this.selectedDocument) {
      this.selectedDocument.node.classList.remove(config.className.selected);
    }

    // Set new selected document
    this._selectedDocument = doc;
    this.selectedDocument.node.classList.add(config.className.selected);

    const slidehubSelectDocumentEvent = new CustomEvent('SlidehubSelectDocument', {
      detail: { doc }
    });
    this.node.dispatchEvent(slidehubSelectDocumentEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Sets a new hovered document after unsetting the old one.
   *
   * @param {SlidehubDocument} doc the new hovered document.
   */
  hoverDocument(doc) {
    if (this.hoveredDocument === doc) {
      return;
    }

    this.unhoverDocument();

    // Set new hovered document
    this._hoveredDocument = doc;
    this.hoveredDocument.node.classList.add(config.className.highlighted);

    const slidehubHoverDocumentEvent = new CustomEvent('SlidehubHoverDocument', {
      detail: { doc }
    });
    this.node.dispatchEvent(slidehubHoverDocumentEvent);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Determines the most likely target document. This is the document that will be initially
   * selected. Also, the loading logic will start loading documents around this document instead of
   * using the DOM order.
   *
   * @returns {SlidehubDocument}
   * @private
   */
  determineTargetDocument() {
    const fragmentIdentifier = getFragmentIdentifier(window.location.toString());

    if (this.documents.has(fragmentIdentifier)) {
      return this.documents.get(fragmentIdentifier);
    } else if (document.documentElement.scrollTop !== 0) {
      // The page was scrolled (e.g. the page was reloaded with a non-zero scroll position)
      // In this case, Slidehub attempts to load the document in the center of the view.
      const slidehubWidth = this.node.clientWidth;
      const centerElement = document.elementFromPoint(slidehubWidth / 2, window.innerHeight / 2);
      const centerDocNode = centerElement.closest(config.selector.doc);
      return this.documents.get(centerDocNode.id);
    }

    // If the viewport was not scrolled already, just start from the top
    return this.documents.values().next().value;
  }

  /**
   * Scrolls the window so that the document indentified by the fragment identifier is centered in
   * the viewport.
   *
   * @private
   */
  centerFragmentTargetDocument() {
    const fragmentIdentifier = getFragmentIdentifier(window.location.toString());

    if (this.documents.has(fragmentIdentifier)) {
      const targetDoc = this.documents.get(fragmentIdentifier);
      // After a short while, scroll the viewport to center the document
      // In the future, `Element.scrollIntoView({ block: 'center' })` should work:
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      const centerOffset = (window.innerHeight - targetDoc.node.clientHeight) / 2;
      setTimeout(() => window.scrollBy(0, -centerOffset), 200);
    }
  }

  /**
   * Loads and enables plugins.
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
   * Removes the hover from the currently hovered document.
   *
   * **Side effect**: Also removes the hover from the currently hovered item
   * within that document.
   *
   * @private
   */
  unhoverDocument() {
    // Remove hovered class from currently hovered document
    if (this.hoveredDocument) {
      this.hoveredDocument.unhoverItem();
      this.hoveredDocument.node.classList.remove(config.className.highlighted);
      this._hoveredDocument = null;
    }
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
      this._itemWidth = itemOuterWidth;

      this.node.style.setProperty('--sh-page-outer-width', this.itemWidth + 'px');
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
      this._scrollboxWidth = scrollboxNode.clientWidth;

      this.node.style.setProperty('--sh-scrollbox-width', this.scrollboxWidth + 'px');
    }
  }

  /**
   * Exposes the current number of visible items in a document to the DOM.
   *
   * @private
   */
  exposeNumberOfVisibleItems() {
    this._visibleItems = Math.floor(this.scrollboxWidth / this.itemWidth);
  }

  /**
   * Insert the status bar. This is done in JavaScript because at the moment, it’s only used for
   * explanatory content relevant when JavaScript is activated.
   */
  insertStatusBar() {
    const markup = `<footer class="sh-status-bar">
      <div data-slidehub-page-widget></div>
      <div data-slidehub-mousewheel-tip></div>
      <div data-slidehub-modal-buttons></div>
    </footer>`;
    this.node.insertAdjacentHTML('beforebegin', markup);
  }
};

/**
 * Sets up the main Slidehub HTML element.
 *
 * @returns {HTMLDivElement} the Slidehub DOM node.
 */
function getSlidehubNode() {
  const existingNode = document.querySelector(config.selector.slidehub);
  const slidehubNode = existingNode ? existingNode : createSlidehubNode();

  // Expose select/highlight color overrides to the DOM.
  // This allows CSS to use inside of a rule declaration.
  if (config.selectColor && config.selectColor !== '') {
    slidehubNode.style.setProperty('--sh-c-selected', config.selectColor);
  }

  if (config.highlightColor && config.highlightColor !== '') {
    slidehubNode.style.setProperty('--sh-c-highlighted', config.highlightColor);
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
 */
function createSlidehubNode() {
  const slidehubNode = document.createElement('div');
  slidehubNode.classList.add(config.className.slidehub);

  document.querySelector('[data-slidehub]').appendChild(slidehubNode);

  return slidehubNode;
}

export { Slidehub };
