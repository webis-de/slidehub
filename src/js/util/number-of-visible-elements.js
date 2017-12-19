import { config } from '../config';
import { getFloatPropertyValue } from '.';

export { numberOfVisibleElements };

/**
 * Calculates how many child elements fit into the width of a parent element.
 *
 * Intentional side effect:
 * Whenever this function is called, potentially returning a new value after
 * its last calculation, another function is called that stores the value in
 * the DOM.
 *
 * @param {Element} parentElement
 * @param {number} childElementWidth
 * @returns {number}
 */
function numberOfVisibleElements(parentElement, childElementWidth) {
  const parentElementWidth = getFloatPropertyValue(parentElement, 'width');
  const numberOfVisibleElements = Math.floor(parentElementWidth / childElementWidth);

  storeVisibleItemsInDOM(numberOfVisibleElements);

  return numberOfVisibleElements;
}

/**
 * Stores the number of visible items in the DOM in order to expose the value
 * to the CSS.
 *
 * @param {number} numberOfVisibleItems
 */
function storeVisibleItemsInDOM(numberOfVisibleItems) {
  const slidehubContainer = document.querySelector(config.selector.slidehub);
  slidehubContainer.style.setProperty('--visible-pages', numberOfVisibleItems.toString());
}
