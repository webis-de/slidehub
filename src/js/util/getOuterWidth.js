export { getOuterWidth };

/**
 * Calculates the outer width of an element. In the context of this
 * application, the outer width of an element is its `offsetWidth` plus
 * left and right margins.
 *
 * @param {HTMLElement} element
 * @returns {Number} the outer width of `element`.
 */
function getOuterWidth(element) {
  const style = window.getComputedStyle(element);
  const marginLeft = parseInt(style.marginLeft);
  const marginRight = parseInt(style.marginRight);

  return marginLeft + element.offsetWidth + marginRight;
}
