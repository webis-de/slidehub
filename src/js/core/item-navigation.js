import { config } from '../config';
import { clamp, getFloatPropertyValue, getOuterWidth } from '../util';
import { getActiveDocument, setActiveDocument } from './document-navigation';

export { navigateItem, getActiveItem, setActiveItem, getItemCount, determineItemWidth };

let itemWidth;

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

  // console.log('> View needs update');
  setScrollPos(getScrollPos() + distance);
}

function itemsAligned() {
  if (getScrollPos() % itemWidth === 0) {
    return true;
  }

  return false;
}

function alignItems(distance) {
  const currentScrollPos = getScrollPos();
  const lastItemIndex = getItemCount() - 1;
  const maxScrollPos = lastItemIndex - getFullyVisibleItems(getActiveDocument());
  const alignedScrollPos = clamp(Math.round(currentScrollPos), 0, maxScrollPos);
  setScrollPos(alignedScrollPos);
}

// TO DO refactor see document-navigation.js#getTargetDoc
function updateActiveItem(distance) {
  const items = getItems();
  const currentIndex = getItemPos();
  const targetIndex = clamp(currentIndex + distance, 0, items.length - 1);
  setActiveItem(items[targetIndex]);
}

function allItemsVisible() {
  const activeDoc = getActiveDocument();
  const numItems = getItemCount();
  if (numItems <= getFullyVisibleItems(activeDoc)) {
    return true;
  }
}

/*
Tests whether a document’s active item is completely in view (i.e. the item
is completely visible and not occluded).
*/
function activeItemInView() {
  const docRect = getActiveDocument().getBoundingClientRect();
  const itemRect = getActiveItem().getBoundingClientRect();

  if (
    docRect.left <= itemRect.left &&
    itemRect.right <= docRect.right &&
    docRect.top <= itemRect.top &&
    itemRect.bottom <= docRect.bottom
  ) {
    return true;
  }

  return false;
}

function getFullyVisibleItems() {
  const activeDoc = getActiveDocument();
  const docWidth = getFloatPropertyValue(activeDoc, 'width');
  return Math.floor(docWidth / itemWidth);
}

function getScrollPos() {
  return getScrollbox().scrollLeft / itemWidth;
}

function setScrollPos(itemPos) {
  const maxPos = getItems().length - getFullyVisibleItems(getActiveDocument());
  itemPos = clamp(itemPos, 0, maxPos);

  getScrollbox().scrollLeft = itemPos * itemWidth;
}

function getScrollbox() {
  return getActiveDocument().querySelector(config.selector.scrollbox);
}

function getItems() {
  return getActiveItem().parentElement.children;
}

function getItemCount() {
  return getItems().length;
}

function getItemPos() {
  return Array.from(getItems()).indexOf(getActiveItem());
}

function getActiveItem() {
  const activeDoc = getActiveDocument();
  return activeDoc.querySelector(`${config.selector.item}.active`);
}

function setActiveItem(targetItem) {
  const activeItem = getActiveItem();
  if (activeItem) {
    activeItem.classList.remove('active');
  }

  targetItem.classList.add('active');
  document.activeElement.blur();
}

function determineItemWidth(newItemWidth) {
  const itemSample = document.querySelector(config.selector.item);
  itemWidth = getOuterWidth(itemSample);
  Object.freeze(itemWidth);
}
