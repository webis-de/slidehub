import { config } from '../config';
import { clamp, getFloatPropertyValue } from '../util';
import { getActiveDocument, setActiveDocument } from './document-navigation';

export { navigateView, getActiveItem, setActiveItem, getItemCount };

function navigateView(distance) {
  if (!viewIsAligned()) {
    // console.log('> View is not aligned. Correcting ...');
    alignView(distance);
  }

  updateActiveItem(distance);

  // If all items are already visible, we’re done here.
  if (allItemsVisible()) {
    // console.log('> All items are visible. Not navigating view.');
    return;
  }

  // If the active item is already inside the view, we’re done here.
  if (activeItemInsideView()) {
    // console.log('> Active item already in view. Not navigating view.');
    return;
  }

  // console.log('> View needs update');
  setViewPos(getViewPos() + distance);
}

function viewIsAligned() {
  const viewPos = getViewPos();
  // if ((viewPos % config.itemWidth) % 1 === 0) {
  if (viewPos % config.itemWidth === 0) {
    return true;
  }

  return false;
}

function alignView(distance) {
  const currentViewPos = getViewPos();
  const lastItemIndex = getItemCount() - 1;
  const maxViewPos = lastItemIndex - getFullyVisibleItems(getActiveDocument());
  const alignedViewPos = clamp(Math.round(currentViewPos), 0, maxViewPos);
  setViewPos(alignedViewPos);
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
Tests whether a view’s active item is completely inside the view (i.e. the item
is completely visible and not occluded).
*/
function activeItemInsideView() {
  const viewRect = getActiveDocument().getBoundingClientRect();
  const itemRect = getActiveItem().getBoundingClientRect();

  if (
    viewRect.left <= itemRect.left &&
    itemRect.right <= viewRect.right &&
    viewRect.top <= itemRect.top &&
    itemRect.bottom <= viewRect.bottom
  ) {
    return true;
  }

  return false;
}

function getFullyVisibleItems() {
  const activeDoc = getActiveDocument();
  const docWidth = getFloatPropertyValue(activeDoc, 'width');
  return Math.floor(docWidth / config.itemWidth);
}

function getViewPos() {
  return getScrollbox().scrollLeft / config.itemWidth;
}

function setViewPos(itemPos) {
  const maxPos = getItems().length - getFullyVisibleItems(getActiveDocument());
  itemPos = clamp(itemPos, 0, maxPos);

  getScrollbox().scrollLeft = itemPos * config.itemWidth;
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
