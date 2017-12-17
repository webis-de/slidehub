import { getFloatPropertyValue } from '.';

export { getOuterWidth };

/**
 * Returns the computed total outer width of an element.
 * The outer width is defined as the width plus any horizontal margins.
 * This is assumes the `box-sizing` box model.
 *
 * @param {Element} element
 * @returns {number}
 */
function getOuterWidth(element) {
  const width = getFloatPropertyValue(element, 'width');
  const marginLeft = getFloatPropertyValue(element, 'margin-left');
  const marginRight = getFloatPropertyValue(element, 'margin-right');

  return marginLeft + width + marginRight;
}
