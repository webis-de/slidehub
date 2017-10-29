import { config } from '../config';
import { clamp } from '../util';
import { getFullyVisibleItems } from '../util';

export {
  navigateView,
  getActiveItem,
  setActiveItem,
  getActiveView,
  setActiveView,
  getItemCount,
  navigateDocument
};

let activeDocument;

function navigateView(distance) {
  const view = activeDocument;

  if (!viewIsAligned(view)) {
    // console.log('> View is not aligned. Correcting ...');
    alignView(view, distance);
  }

  updateActiveItem(view, distance);

  // If all items are already visible, we’re done here.
  if (allItemsVisible(view)) {
    // console.log('> All items are visible. Not navigating view.');
    return;
  }

  // If the active item is already inside the view, we’re done here.
  if (activeItemInsideView(view)) {
    // console.log('> Active item already in view. Not navigating view.');
    return;
  }

  // console.log('> View needs update');
  updateView(view, distance);
}

function updateActiveItem(view, distance) {
  const nextElementProp = `${distance > 0 ? 'next' : 'previous'}ElementSibling`;
  let steps = Math.abs(distance);
  while (steps--) {
    setNextActiveItem(view, nextElementProp);
  }
}

/*
Updates the active item in a view if necessary. For example, if the active item
is the last item in a document, moving it past the end is not possible. In this
case, the active item stays the same.
*/
function setNextActiveItem(view, nextElementProp) {
  const activeItem = getActiveItem(view);
  const nextItem = activeItem[nextElementProp];

  // Only update the active item if necessary.
  if (nextItem !== null) {
    setActiveItem(view, nextItem);
  }
}

function viewIsAligned(view) {
  const currentViewPos = getViewPos(view);
  if ((currentViewPos % config.itemWidth) % 1 === 0) {
    return true;
  }

  return false;
}

function alignView(view, distance) {
  const currentViewPos = getViewPos(view);
  const maxViewPos = getLastItemIndex(view) - getFullyVisibleItems(view);
  const alignedViewPos = clamp(Math.round(currentViewPos), 0, maxViewPos);
  setViewPos(view, alignedViewPos);
}

function allItemsVisible(view) {
  const numItems = view.querySelector(config.class.doc).childElementCount;
  if (numItems <= getFullyVisibleItems(view)) {
    return true;
  }
}

/*
Tests whether a view’s active item is completely inside the view (i.e. the item
is completely visible and not occluded).
*/
function activeItemInsideView(view) {
  const viewRect = view.getBoundingClientRect();
  const itemRect = getActiveItem(view).getBoundingClientRect();

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

function updateView(view, distance) {
  const activeItem = getActiveItem(view);
  const currentViewPos = getViewPos(view);
  const currentItemPos = getItemPos(activeItem);
  let newItemPos;
  if (distance > 0) {
    newItemPos = currentViewPos - currentItemPos;
  } else {
    const lastVisibleItem = currentViewPos + getFullyVisibleItems(view);
    newItemPos = lastVisibleItem - currentItemPos;
  }

  setViewPos(view, currentViewPos + distance);
}

function getViewPos(view) {
  return getViewPixelPos(view) / config.itemWidth;
}

function getViewPixelPos(view) {
  const scrollbox = view.querySelector(config.class.scrollbox);
  return scrollbox.scrollLeft;
}

function setViewPos(view, itemPos) {
  const doc = view.querySelector(config.class.doc);
  const maxPos = getItemCount(view) - getFullyVisibleItems(view);
  itemPos = clamp(itemPos, 0, maxPos);

  let itemX = itemPos * config.itemWidth;

  setViewPixelPos(view, itemX);
}

function setViewPixelPos(view, itemX, disableTransition = false) {
  const scrollbox = view.querySelector(config.class.scrollbox);
  scrollbox.scrollLeft = itemX;
}

function getItemPos(item) {
  return parseInt(item.dataset.page);
}

function getLastItemIndex(view) {
  const doc = view.querySelector(config.class.doc);
  return doc.childElementCount - 1;
}

function getItemCount(view) {
  return view.querySelector(config.class.doc).childElementCount;
}

function getActiveView() {
  return activeDocument;
}

function setActiveView(view) {
  // Remove active class from currently active view
  if (activeDocument) {
    activeDocument.classList.remove('active');
  }

  // Set new active view
  activeDocument = view;
  activeDocument.classList.add('active');
  document.activeElement.blur();
}

function getActiveItem(view) {
  return view.querySelector(`${config.class.item}.active`);
}

function setActiveItem(view, targetItem) {
  const activeItem = getActiveItem(view);
  activeItem.classList.remove('active');
  targetItem.classList.add('active');
  document.activeElement.blur();
}

function getItemByIndex(view, index) {
  const doc = view.querySelector(config.class.doc);
  return doc.children[index];
}

/*
Navigates through documents in a certain direction.
*/
function navigateDocument(direction) {
  // Choose `nextElementSibling` or `previousElementSibling` based on direction
  const prop = `${direction < 0 ? 'previous' : 'next'}ElementSibling`;
  const targetDoc = activeDocument[prop];

  if (targetDoc === null) {
    return;
  }

  setActiveView(targetDoc);

  const offset = getOutOfViewOffset(targetDoc, direction);
  if (offset < 0) {
    // The missing part is indicated by a negative value, so we need to flip it
    const missingPart = -offset;
    // Adding a little extra so a new document is already partially visisble
    const extraPart = targetDoc.clientHeight / 2;
    document.documentElement.scrollTop += direction * (missingPart + extraPart);
  }
}

function getOutOfViewOffset(doc, direction) {
  const documentEl = document.documentElement;

  if (direction < 0) {
    const viewportOffsetTop = window.scrollY;
    return doc.offsetTop - viewportOffsetTop;
  } else {
    const viewportOffsetBot = window.scrollY + documentEl.clientHeight;
    const docOffsetBot = doc.offsetTop + doc.offsetHeight;
    return viewportOffsetBot - docOffsetBot;
  }
}
