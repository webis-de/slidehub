import { config } from '../config';
import { clamp, numberOfVisibleElements } from '../util';
import { getSelectedDocument } from './document-navigation';

export {
  navigateItem,
  navigateItemInDocument,
  navigateItemToBoundary,
  getSelectedItem,
  selectItem,
  getHighlightedItem,
  highlightItem,
  storeItemOuterWidth,
  numberOfVisibleItems
};

/**
 * Main handler for item navigation.
 *
 * @param {Element} doc
 * @param {number} distance
 * @public
 */
function navigateItemInDocument(doc, distance) {
  if (!itemPositionIsAligned(doc)) {
    setItemPos(doc, Math.round(getItemPos(doc)));
  }

  updateSelectedItem(doc, distance);

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

  // If the selected item is already inside the view, we’re done here.
  // When an item can be moved to the first column, this behavior is disabled
  // as I prefer keeping the selected item in the first column in this case.
  if (!config.allowLastPageInFirstColumn && selectedItemInView(doc)) {
    return;
  }

  setItemPos(doc, newItemPos);
}

/**
 * @param {number} distance
 * @public
 */
function navigateItem(distance) {
  navigateItemInDocument(getSelectedDocument(), distance);
}

/**
 * @param {number} direction
 * @public
 */
function navigateItemToBoundary(direction) {
  const doc = getSelectedDocument();
  navigateItemInDocument(doc, direction * getItemCount(doc));
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
 * Determines the new item that should be selected.
 *
 * @param {Element} doc
 * @param {number} distance
 */
function updateSelectedItem(doc, distance) {
  const currentPos = getSelectedItemPos(doc);
  const targetPos = clamp(currentPos + distance, 0, getItemCount(doc) - 1);

  const items = getItems(doc);
  selectItem(doc, items.item(targetPos));
}

/**
 * Returns true if all items are visible within a document, false otherwise.
 *
 * @param {Element} doc
 * @returns {boolean}
 */
function allItemsVisible(doc) {
  return getItemCount(doc) <= numberOfVisibleItems(doc);
}

/**
 * Tests whether a documents’ selected item is completely in view (i.e. the item
 * is completely visible and not occluded).
 *
 * @param {Element} doc
 * @returns {boolean}
 */
function selectedItemInView(doc) {
  const docRect = getSelectedDocument().getBoundingClientRect();
  const itemRect = getSelectedItem(doc).getBoundingClientRect();

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
 * Returns the scrollbox for of a certain document.
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
  return doc.querySelectorAll('[data-page]');
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
 * Returns the position of the currently selected item.
 *
 * @param {Element} doc
 * @returns {number}
 */
function getSelectedItemPos(doc) {
  return Array.from(getItems(doc)).indexOf(getSelectedItem(doc));
}

const selectClassName = 'selected';

/**
 * Returns the currently selected item.
 *
 * @param {Element} doc
 * @returns {Element}
 */
function getSelectedItem(doc) {
  return doc.querySelector(`${config.selector.item}.${selectClassName}`);
}

/**
 * Sets a new selected item.
 *
 * @param {Element} doc
 * @param {Element} targetItem
 */
function selectItem(doc, targetItem) {
  const itemContainer = targetItem.parentElement;
  const selectedItem = getSelectedItem(doc);
  if (selectedItem && itemContainer.contains(selectedItem)) {
    selectedItem.classList.remove(selectClassName);
  }

  targetItem.classList.add(selectClassName);

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

const highlightClassName = 'highlighted';

/**
 * Returns the currently highlighted item.
 *
 * @param {Element} doc
 * @returns {Element}
 */
function getHighlightedItem(doc) {
  return doc.querySelector(`${config.selector.item}.${highlightClassName}`);
}

/**
 * Sets a new highlighted item.
 *
 * @param {Element} doc
 * @param {Element} targetItem
 */
function highlightItem(doc, targetItem) {
  const itemContainer = targetItem.parentElement;
  const highlightedItem = getHighlightedItem(doc);
  if (highlightedItem && itemContainer.contains(highlightedItem)) {
    highlightedItem.classList.remove(highlightClassName);
  }

  targetItem.classList.add(highlightClassName);

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

let itemWidth;

/**
 * Sets the item width.
 */
function storeItemOuterWidth(itemOuterWidth) {
  itemWidth = itemOuterWidth;
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
