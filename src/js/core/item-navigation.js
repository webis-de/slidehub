import { config } from '../config';
import { clamp, getFloatPropertyValue, numberOfVisibleElements, getOuterWidth } from '../util';
import { getActiveDocument, setActiveDocument } from './document-navigation';

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
 * @param {number} distance
 */
function navigateItem(distance) {
  storeVisibleItemsInDOM(numberOfVisibleItems());

  if (!itemPositionIsAligned()) {
    setItemPos(Math.round(getItemPos()));
  }

  updateActiveItem(distance);

  // If all items are already visible, we’re done here.
  if (allItemsVisible()) {
    return;
  }

  const currentScrollPos = getItemPos();
  const newItemPos = calculateNewItemPos(getItemPos() + distance);

  // Nothing to gain, current position is already the destination.
  if (currentScrollPos === newItemPos) {
    return;
  }

  // If the active item is already inside the view, we’re done here.
  // When an item can be moved to the first column, this behavior is disabled
  // as I prefer keeping the active item in the first column in this case.
  if (!config.allowLastPageInFirstColumn && activeItemInView()) {
    return;
  }

  setItemPos(newItemPos);
}

/**
 * Returns true if items are aligned within a document, false otherwise.
 *
 * @returns {boolean}
 */
function itemPositionIsAligned() {
  if (getItemPos() % 1 === 0) {
    return true;
  }

  return false;
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
  return getItemCount() <= numberOfVisibleItems();
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
 * Returns the current item position.
 *
 * @returns {number}
 */
function getItemPos() {
  return getScrollbox().scrollLeft / itemWidth;
}

/**
 * Sets a new item position.
 *
 * @param {number} itemPos
 */
function setItemPos(itemPos) {
  const newItemPos = calculateNewItemPos(itemPos);
  getScrollbox().scrollLeft = newItemPos * itemWidth;
}

/**
 *
 * @param {number} itemPos
 * @returns {number}
 */
function calculateNewItemPos(itemPos) {
  const visibleItems = numberOfVisibleItems();
  const invalidItemPositions = config.allowLastPageInFirstColumn ? 1 : visibleItems;
  const maxPos = getItemCount() - invalidItemPositions;

  return clamp(itemPos, 0, maxPos);
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
 * @returns {number}
 */
function numberOfVisibleItems() {
  return numberOfVisibleElements(getActiveDocument(), itemWidth);
}

/**
 * Stores the number of visible items in the DOM in order to expose the value
 * to the CSS.
 *
 * @param {number} visibleItems
 */
function storeVisibleItemsInDOM(visibleItems) {
  const slidehubContainer = document.querySelector(config.selector.slidehub);
  slidehubContainer.style.setProperty('--visible-pages', visibleItems.toString());
}

let storedScrollboxWidth;

function storeScrollboxWidthInDOM() {
  const scrollbox = document.querySelector(config.selector.scrollbox);
  const scrollboxWidth = getOuterWidth(scrollbox);

  if (storedScrollboxWidth !== scrollboxWidth) {
    storedScrollboxWidth = scrollboxWidth;

    const slidehubContainer = document.querySelector(config.selector.slidehub);
    slidehubContainer.style.setProperty('--scrollbox-width', scrollboxWidth + 'px');
  }
}
