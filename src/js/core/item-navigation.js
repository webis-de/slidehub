import { config } from '../config';
import { clamp, getFloatPropertyValue, numberOfVisibleElements } from '../util';
import { getActiveDocument, setActiveDocument } from './document-navigation';

export { navigateItem, getActiveItem, setActiveItem, getItemCount, storeItemOuterWidth };

let itemWidth;

/**
 * Main handler for item navigation.
 *
 * @param {number} distance
 */
function navigateItem(distance) {
  if (!itemsAligned()) {
    alignItems(distance);
  }

  updateActiveItem(distance);

  // If all items are already visible, we’re done here.
  if (allItemsVisible()) {
    return;
  }

  // If the active item is already inside the view, we’re done here.
  if (activeItemInView()) {
    return;
  }

  setScrollPos(getScrollPos() + distance);
}

/**
 * Returns true if items are aligned within a document, false otherwise.
 *
 * @returns {boolean}
 */
function itemsAligned() {
  if (getScrollPos() % itemWidth === 0) {
    return true;
  }

  return false;
}

/**
 * Aligns items to the grid.
 *
 * @param {number} distance
 */
function alignItems(distance) {
  const currentScrollPos = getScrollPos();
  const lastItemPos = getItemCount() - 1;
  const numberOfVisibleItems = numberOfVisibleElements(getActiveDocument(), itemWidth);
  const maxScrollPos = lastItemPos - numberOfVisibleItems;
  const alignedScrollPos = clamp(Math.round(currentScrollPos), 0, maxScrollPos);

  setScrollPos(alignedScrollPos);
}

/**
 * Determines the new active item.
 *
 * @param {number} distance
 */
function updateActiveItem(distance) {
  const currentPos = getActiveItemPos();
  const targetPos = clamp(currentPos + distance, 0, getItemCount() - 1);

  const items = getItems();
  setActiveItem(items.item(targetPos));
}

/**
 * Returns true if all items are visible within a document, false otherwise.
 *
 * @returns {boolean}
 */
function allItemsVisible() {
  const activeDoc = getActiveDocument();
  const numberOfVisibleItems = numberOfVisibleElements(activeDoc, itemWidth);

  return getItemCount() <= numberOfVisibleItems;
}

/**
 * Tests whether a documents’ active item is completely in view (i.e. the item
 * is completely visible and not occluded).
 *
 * @returns {boolean}
 */
function activeItemInView() {
  const docRect = getActiveDocument().getBoundingClientRect();
  const itemRect = getActiveItem().getBoundingClientRect();

  return (
    docRect.left <= itemRect.left &&
    itemRect.right <= docRect.right &&
    docRect.top <= itemRect.top &&
    itemRect.bottom <= docRect.bottom
  );
}

/**
 * Returns the current scroll position.
 *
 * @returns {number}
 */
function getScrollPos() {
  return getScrollbox().scrollLeft / itemWidth;
}

/**
 * Sets a new scroll position.
 *
 * @param {number} itemPos
 */
function setScrollPos(itemPos) {
  const numberOfVisibleItems = numberOfVisibleElements(getActiveDocument(), itemWidth);
  const invalidItemPositions = config.allowLastPageInFirstColumn ? numberOfVisibleItems : 1;
  const maxPos = getItemCount() - invalidItemPositions;
  itemPos = clamp(itemPos, 0, maxPos);

  getScrollbox().scrollLeft = itemPos * itemWidth;
}

/**
 * Returns the scrollbox for the currently active document.
 *
 * @returns {Element}
 */
function getScrollbox() {
  return getActiveDocument().querySelector(config.selector.scrollbox);
}

/**
 * Returns all items as an HTMLCollection.
 *
 * @returns {NodeListOf<Element>}
 */
function getItems() {
  return getActiveItem().parentElement.querySelectorAll('[data-page]');
}

/**
 * Returns the number of items.
 *
 * @returns {number}
 */
function getItemCount() {
  return getItems().length;
}

/**
 * Returns the position of the currently active item.
 *
 * @returns {number}
 */
function getActiveItemPos() {
  return Array.from(getItems()).indexOf(getActiveItem());
}

/**
 * Returns the currently active item.
 *
 * @returns {Element}
 */
function getActiveItem() {
  const activeDoc = getActiveDocument();

  return activeDoc.querySelector(`${config.selector.item}.active`);
}

/**
 * Sets a new active item.
 *
 * @param {Element} targetItem
 */
function setActiveItem(targetItem) {
  const itemContainer = targetItem.parentElement;
  const activeItem = getActiveItem();
  if (activeItem && itemContainer.contains(activeItem)) {
    activeItem.classList.remove('active');
  }

  targetItem.classList.add('active');
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

/**
 * Computes the item width. Must only be called once.
 */
function storeItemOuterWidth(itemOuterWidth) {
  itemWidth = itemOuterWidth;
  Object.freeze(itemWidth);
}
