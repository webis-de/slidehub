export { getFloatPropertyValue };

/**
 * Returns a property value parsed as a floating-point number.
 *
 * @param {Element} element
 * @param {string} property
 * @returns {number}
 */
function getFloatPropertyValue(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property);

  if (value === '') {
    return 0;
  }

  return parseFloat(value);
}
