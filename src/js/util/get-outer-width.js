export { getOuterWidth };

import { getFloatPropertyValue } from './get-float-property-value';

/**
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
