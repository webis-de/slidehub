import { getFloatPropertyValue } from '.';

export { numberOfVisibleElements };

/**
 * Calculates how many child elements fit into the width of a parent element.
 *
 * @param {Element} parentElement
 * @param {number} childElementWidth
 * @returns {number}
 */
function numberOfVisibleElements(parentElement, childElementWidth) {
  const parentElementWidth = getFloatPropertyValue(parentElement, 'width');
  return Math.floor(parentElementWidth / childElementWidth);
}
