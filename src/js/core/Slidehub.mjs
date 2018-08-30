import { config } from '../config.mjs';
import { parseDocumentsData, parseDocumentsMarkup } from './SlidehubParser.mjs';
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
 */
class Slidehub {
  /**
   * @public
   */
  constructor() {
    this._node = this.getNode();
    this._documents = this.getDocuments();
    this._selectedDocument = null;
    this._hoveredDocument = null;
    this._documentNavigator = null;

    this._itemWidth = null;
    this._visibleItems = null;
    this._scrollboxWidth = null;

    if (!config.staticContent) {
      new SlidehubDocumentLoader(this);
    }

    this.jumpToTargetDocument();

    this.start();
    this.loadPlugins();
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
   * @private
   */
  createNode() {
    const slidehubNode = document.createElement('div');
    slidehubNode.classList.add(config.className.slidehub);

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
   * @private
   */
  jumpToTargetDocument() {
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
   * Initializes all core functionality.
   *
   * @private
   */
  start() {
    this.navigateDocument = new DocumentNavigator(this);

    this.exposeDocumentInfo();

    this.imageLoader = new SlidehubImageLoader(this);
    this.imageLoader.start();

    this.mouseInteraction = new SlidehubMouseInteraction(this);
    this.mouseInteraction.start();

    const keyboardInteraction = new SlidehubKeyboardInteraction(this);
    keyboardInteraction.start();

    this.observeDocumentLoaded();
    enableModals();
  }

  /**
   * Observes documents being loaded
   */
  observeDocumentLoaded() {
    const documentLoadedObserver = new MutationObserver(this.mutationHandler.bind(this));

    const documentNodes = Array.from(this.node.querySelectorAll(config.selector.doc));
    documentNodes.forEach(docNode => {
      documentLoadedObserver.observe(docNode, { childList: true });
    });
  }

  /**
   *
   * @param {Array<MutationRecord>} mutationsList
   */
  mutationHandler(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length !== 0) {
        const docNode = mutation.target;
        this.imageLoader.startImageObserver(docNode);
        const scrollbox = docNode.querySelector(config.selector.scrollbox);
        if (scrollbox) {
          this.mouseInteraction.initScrollInteraction(scrollbox);
        }
      }
    }
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
    if (this.selectedDocument === doc) {
      return;
    }

    // Remove selected class from currently selected document
    if (this.selectedDocument) {
      this.selectedDocument.node.classList.remove(config.className.selected);
    }

    // Set new selected document
    this.selectedDocument = doc;
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
    if (this.hoveredDocument === doc) {
      return;
    }

    this.unhoverDocument();

    // Set new hovered document
    this.hoveredDocument = doc;
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
      this.hoveredDocument.node.classList.remove(config.className.highlighted);
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

export { Slidehub };
