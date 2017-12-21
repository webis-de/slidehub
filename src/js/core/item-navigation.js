import { config } from '../config';
import { clamp, numberOfVisibleElements, getOuterWidth } from '../util';
import { getSelectedDocument } from './document-navigation';

export {
  navigateItem,
  getActiveItem,
  setActiveItem,
  getItemCount,
  storeItemOuterWidth,
  storeScrollboxWidthInDOM
};

/**
 * Main handler for item navigation.
 *
 * @param {Element} doc
 * @param {number} distance
 */
function navigateItem(doc, distance) {
  exposeCustomProperty('--visible-pages', numberOfVisibleItems(doc));
  storeScrollboxWidthInDOM();

  if (!itemPositionIsAligned(doc)) {
    setItemPos(doc, Math.round(getItemPos(doc)));
  }

  updateActiveItem(doc, distance);

  // If all items are already visible, we’re done here.
  if (allItemsVisible(doc)) {
    return;
  }

  const currentScrollPos = getItemPos(doc);
  const newItemPos = calculateNewItemPos(doc, getItemPos(doc) + distance);

  // Nothing to gain, current position is already the destination.
  if (currentScrollPos === newItemPos) {
    return;
  }

  // If the active item is already inside the view, we’re done here.
  // When an item can be moved to the first column, this behavior is disabled
  // as I prefer keeping the active item in the first column in this case.
  if (!config.allowLastPageInFirstColumn && activeItemInView(doc)) {
    return;
  }

  setItemPos(doc, newItemPos);
}

/**
 * Returns true if items are aligned within a document, false otherwise.
 *
 * @param {Element} doc
 * @returns {boolean}
 */
function itemPositionIsAligned(doc) {
  if (getItemPos(doc) % 1 === 0) {
    return true;
  }

  return false;
}

/**
 * Determines the new active item.
 *
 * @param {Element} doc
 * @param {number} distance
 */
function updateActiveItem(doc, distance) {
  const currentPos = getActiveItemPos(doc);
  const targetPos = clamp(currentPos + distance, 0, getItemCount(doc) - 1);

  const items = getItems(doc);
  setActiveItem(doc, items.item(targetPos));
}

/**
 * Returns true if all items are visible within a document, false otherwise.
 *
 * @param {Element} doc
 * @returns {boolean}
 */
function allItemsVisible(doc) {
  const activeDoc = getSelectedDocument();
  return getItemCount(doc) <= numberOfVisibleItems(doc);
}

/**
 * Tests whether a documents’ active item is completely in view (i.e. the item
 * is completely visible and not occluded).
 *
 * @param {Element} doc
 * @returns {boolean}
 */
function activeItemInView(doc) {
  const docRect = getSelectedDocument().getBoundingClientRect();
  const itemRect = getActiveItem(doc).getBoundingClientRect();

  return (
    docRect.left <= itemRect.left &&
    itemRect.right <= docRect.right &&
    docRect.top <= itemRect.top &&
    itemRect.bottom <= docRect.bottom
  );
}

/**
 * Returns the current item position.
 *
 * @param {Element} doc
 * @returns {number}
 */
function getItemPos(doc) {
  return getScrollbox(doc).scrollLeft / itemWidth;
}

/**
 * Sets a new item position.
 *
 * @param {Element} doc
 * @param {number} itemPos
 */
function setItemPos(doc, itemPos) {
  const newItemPos = calculateNewItemPos(doc, itemPos);
  getScrollbox(doc).scrollLeft = newItemPos * itemWidth;
}

/**
 *
 * @param {Element} doc
 * @param {number} itemPos
 * @returns {number}
 */
function calculateNewItemPos(doc, itemPos) {
  const visibleItems = numberOfVisibleItems(doc);
  const invalidItemPositions = config.allowLastPageInFirstColumn ? 1 : visibleItems;
  const maxPos = getItemCount(doc) - invalidItemPositions;

  return clamp(itemPos, 0, maxPos);
}

/**
 * Returns the scrollbox for the currently active document.
 *
 * @param {Element} doc
 * @returns {Element}
 */
function getScrollbox(doc) {
  return doc.querySelector(config.selector.scrollbox);
}

/**
 * Returns all items as an HTMLCollection.
 *
 * @param {Element} doc
 * @returns {NodeListOf<Element>}
 */
function getItems(doc) {
  return doc.parentElement.querySelectorAll('[data-page]');
}

/**
 * Returns the number of items.
 *
 * @param {Element} doc
 * @returns {number}
 */
function getItemCount(doc) {
  return getItems(doc).length;
}

/**
 * Returns the position of the currently active item.
 *
 * @param {Element} doc
 * @returns {number}
 */
function getActiveItemPos(doc) {
  return Array.from(getItems(doc)).indexOf(getActiveItem(doc));
}

/**
 * Returns the currently active item.
 *
 * @param {Element} doc
 * @returns {Element}
 */
function getActiveItem(doc) {
  return doc.querySelector(`${config.selector.item}.active`);
}

/**
 * Sets a new active item.
 *
 * @param {Element} doc
 * @param {Element} targetItem
 */
function setActiveItem(doc, targetItem) {
  const itemContainer = targetItem.parentElement;
  const activeItem = getActiveItem(doc);
  if (activeItem && itemContainer.contains(activeItem)) {
    activeItem.classList.remove('active');
  }

  targetItem.classList.add('active');
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

let itemWidth;

/**
 * Computes the item width. Must only be called once.
 */
function storeItemOuterWidth(itemOuterWidth) {
  itemWidth = itemOuterWidth;
  Object.freeze(itemWidth);
}

/**
 * Wrapper for {@link numberOfVisibleElements}.
 *
 * @param {Element} doc
 * @returns {number}
 */
function numberOfVisibleItems(doc) {
  return numberOfVisibleElements(doc, itemWidth);
}

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
 * Exposes the current width of the first scrollbox to the DOM.
 *
 * This function is a closure. It is instanciated once, creating a state
 * variable and keeping it alive. Also, an inner function is returned by the
 * function which uses the state variable. The purpose for this is keeping the
 * state varialbe private to this function. Otherwise, when storing it outside
 * the function, it would be exposed to the whole module.
 */
const storeScrollboxWidthInDOM = (function() {
  // State variable. Will be kept alive so that further calls to this function
  // can re-use its value.
  let storedScrollboxWidth;

  return function() {
    const scrollbox = document.querySelector(config.selector.scrollbox);
    const scrollboxWidth = getOuterWidth(scrollbox);

    if (storedScrollboxWidth !== scrollboxWidth) {
      storedScrollboxWidth = scrollboxWidth;
      console.log(storedScrollboxWidth);

      exposeCustomProperty('--scrollbox-width', scrollboxWidth + 'px');
    }
  };
})();
