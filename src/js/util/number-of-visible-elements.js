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
  return Math.floor(parentElementWidth / childElementWidth);
}
