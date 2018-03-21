import { config } from '../config';
import { buildDocuments } from './SlidehubDocumentBuilder';
import { loadImages } from './SlidehubImageLoader';
import { enableMouseInteraction } from './SlidehubMouseInteraction';
import { enableKeyboardInteraction } from './SlidehubKeyboardInteraction';
import { enableModals } from './SlidehubModal';
import { loadPlugin } from './SlidehubPluginLoader';

import * as plugins from '../plugins';

import { numberOfVisibleItems, storeItemOuterWidth } from './item-navigation';
import { debounce, getOuterWidth } from '../util';

export { Slidehub };

class Slidehub {
  /**
   * @public
   */
  constructor() {
    this.node = null;

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
    this.node = initializeNode();

    if (!config.staticContent) {
      buildDocuments(this.node);
    }

    exposeDocumentInfo();

    loadImages(this.node);
    enableMouseInteraction(this.node);
    enableKeyboardInteraction();
    enableModals();
  }

  /**
   * Loads optional plugins.
   *
   * @private
   */
  loadPlugins() {
    for (const plugin of Object.values(plugins)) {
      loadPlugin(plugin);
    }
  }
};

/**
 *
 * @returns {HTMLElement}
 */
function initializeNode() {
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

function exposeDocumentInfo() {
  exposeItemOuterWidth();
  exposeScrollboxWidth();
  exposeNumberOfVisibleItems();

  // Recalculate the scrollbox width on resize.
  window.addEventListener('resize', debounce(() => {
    exposeItemOuterWidth();
    exposeScrollboxWidth();
    exposeNumberOfVisibleItems();
  }, 200));
}

/**
 * Exposes the current width of the first scrollbox to the DOM.
 *
 * This function is a closure. It is instanciated once, creating a state
 * variable and keeping it alive. Also, an inner function is returned by the
 * function which uses the state variable. The purpose for this is keeping the
 * state varialbe private to this function. Otherwise, when storing it outside
 * the function, it would be exposed to the whole module.
 */
const exposeScrollboxWidth = (function () {
  // State variable. Will be kept alive so that further calls to this function
  // can re-use its value.
  let storedScrollboxWidth;

  return function () {
    const scrollbox = document.querySelector(config.selector.scrollbox);
    const scrollboxWidth = getOuterWidth(scrollbox);

    if (storedScrollboxWidth !== scrollboxWidth) {
      storedScrollboxWidth = scrollboxWidth;

      exposeCustomProperty('--scrollbox-width', scrollboxWidth + 'px');
    }
  };
})();

/**
 * Exposes the current number of visible items in a document to the DOM.
 *
 * This function is a closure. See {@see exposeScrollboxWidth} for an explanation.
 */
const exposeNumberOfVisibleItems = (function () {
  let storedVisibleItems;

  return function () {
    const doc = document.querySelector(config.selector.doc);
    const visibleItems = numberOfVisibleItems(doc);

    if (storedVisibleItems !== visibleItems) {
      storedVisibleItems = visibleItems;

      exposeCustomProperty('--visible-pages', visibleItems);
    }
  };
})();

/**
 * Computes and stores the outer width of items in the DOM in the form of a
 * custom property. This way, it is accessible from within CSS.
 *
 * TO DO: Check for box-sizing value and compute accordingly.
 */
const exposeItemOuterWidth = (function () {
  let storedItemOuterWidth;

  return function () {
    const doc = document.querySelector(`${config.selector.doc}[data-loaded]`);
    const item = doc.querySelector(config.selector.item);
    const itemOuterWidth = getOuterWidth(item);

    if (storedItemOuterWidth !== itemOuterWidth) {
      storedItemOuterWidth = itemOuterWidth;
      storeItemOuterWidth(itemOuterWidth);

      exposeCustomProperty('--page-outer-width', itemOuterWidth + 'px');
    }
  };
})();

/**
 * Exposes data to the DOM node which represents the Slidehub container. This
 * allows accessing the data from CSS.
 *
 * @param {string} propertyName
 * @param {string} value
 */
function exposeCustomProperty(propertyName, value) {
  const slidehubContainer = document.querySelector(config.selector.slidehub);
  slidehubContainer.style.setProperty(propertyName, value);
}
