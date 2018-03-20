/**
 * Application entry point.
 *
 * Loads core modules and plugins.
 */

import './lib/intersection-observer';
import { config } from './config';
import { numberOfVisibleItems, storeItemOuterWidth } from './core/item-navigation';
import { debounce, getOuterWidth } from './util';
import * as plugins from './plugins';
import {
  loadPlugin,
  DocumentLoader,
  ImageLoader,
  KeyboardInteraction,
  Modal,
  MouseInteraction
} from './core';

/**
 * An Immediately Invoked Function Expression, called like that because it’s
 * immediately executed when a JavaScript file like this is sourced.
 *
 * Starts the engines for Slidehub.
 */
(function () {
  loadCoreModules();
  loadPlugins();
})();

/**
 * Loads core modules.
 */
function loadCoreModules() {
  ImageLoader.enable();
  DocumentLoader.enable();

  document.addEventListener('DOMContentLoaded', () => {
    exposeItemOuterWidth();
    exposeScrollboxWidth();
    exposeNumberOfVisibleItems();

    // Recalculate the scrollbox width on resize.
    window.addEventListener('resize', debounce(() => {
      exposeItemOuterWidth();
      exposeScrollboxWidth();
      exposeNumberOfVisibleItems();
    }, 200));
  });

  Modal.enable();
  KeyboardInteraction.enable();
  MouseInteraction.enable();
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
    console.log(visibleItems);

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
 *
 */
const exposeItemOuterWidth = (function () {
  let storedItemOuterWidth;

  return function () {
    const doc = document.querySelector(config.selector.doc);
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

/**
 * Loads all plugins from the ./plugins directory.
 */
function loadPlugins() {
  document.addEventListener('DOMContentLoaded', function () {
    for (const plugin of Object.values(plugins)) {
      loadPlugin(plugin);
    }
  });
}
