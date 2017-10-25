'use strict';

/*
* Configuration
*/
const config = {
  // Location of the data directory containing PDF/PNG assets
  assetPath: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',

  itemWidth: 300,

  // Preserve aspect ratio of document items
  //   true:  Preserves aspect ratio
  //   false: Uses a default aspect ratio of 5:4
  preserveAspectRatio: true,

  // HTML classes that can be used in CSS selectors
  class: {
    main: '.doc-container',
    view: '.doc-view',
    scrollbox: '.doc-scrollbox',
    doc: '.doc',
    item: '.doc__page'
  }
};

/*
* Features
*/
const features = {
  core: {
    enabled: true,
    enable: function() {
      // detectScrollingCapabilities();
      enableModalButtons();
      enableToggleButtons();
    },
    disable: function() {
      console.info('Not very effective. (Can’t disable core feature.)');
    }
  },

  wheelNavigation: {
    enabled: true,
    scrollingMode: 'native',
    enable: function() {
      enableModifier();
      document.addEventListener('wheel', handleWheelNavigation, activeListener);
    },
    disable: function() {
      disableModifier();
      document.removeEventListener('wheel', handleWheelNavigation, activeListener);
    }
  },

  keyboardNavigation: {
    enabled: true,
    enable: function() {
      document.addEventListener('keydown', handleKeyboardInput, activeListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleKeyboardInput, activeListener);
    }
  },

  itemLinking: {
    enabled: true,
    enable: function() {
      document.addEventListener('keydown', handleItemLinking, passiveListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleItemLinking, passiveListener);
    }
  },

  activatingOnHover: {
    enabled: false,
    enable: function() {
      document.addEventListener('mousemove', activateOnHover, passiveListener);
    },
    disable: function() {
      document.removeEventListener('mousemove', activateOnHover, passiveListener);
    }
  }
};

const state = {
  activeView: null,
  viewObserver: null,
  lastFocusedElement: null,
  touched: false
};

// Maps key codes to key names
const modifierKeyNames = Object.freeze({
  16: 'shiftKey',
  17: 'ctrlKey',
  18: 'altKey'
});

/*
* Maps key codes to key names.
* It’s used within keyboard-related event handlers in order to work with the
* keys’ names instead of key codes.
*
* Removing an entry here disables its application-related interactions
*/
const controlKeyNames = Object.freeze({
  // 9: 'tabKey',
  35: 'endKey',
  36: 'homeKey',
  37: 'arrowLeft',
  38: 'arrowUp',
  39: 'arrowRight',
  40: 'arrowDown'
});

/*
* Maps control keys to a trigger function that is executed when the key is
* pressed.
*/
const controlKey = Object.freeze({
  homeKey: {
    direction: -1,
    trigger: function() {
      const view = state.activeView;
      navigateView(view, this.direction * getItemCount(state.activeView));
    }
  },
  endKey: {
    direction: 1,
    trigger: function() {
      const view = state.activeView;
      navigateView(view, this.direction * getItemCount(state.activeView));
    }
  },
  arrowLeft: {
    direction: -1,
    trigger: function(event) {
      const view = state.activeView;
      navigateView(view, this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowRight: {
    direction: 1,
    trigger: function(event) {
      const view = state.activeView;
      navigateView(view, this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowUp: {
    trigger: function() {
      goToPreviousView();
    }
  },
  arrowDown: {
    trigger: function() {
      goToNextView();
    }
  },
  tabKey: {
    trigger: function(event) {
      if (event.shiftKey) {
        goToPreviousView();
      } else {
        goToNextView();
      }
    }
  }
});

module.exports = function() {
  initializeLazyLoader();

  document.addEventListener('DOMContentLoaded', function() {
    const documentObserver = new IntersectionObserver(documentObserverHandler, { threshold: 1 });

    loadDocuments().then(() => {
      // onFirstDocumentLoaded
      const firstView = document.querySelector(config.class.view);
      setActiveView(firstView);
      evaluateItemWidth();

      const container = document.querySelector(config.class.main);
      documentObserver.observe(container.lastElementChild);
    });

    Object.values(features).forEach(feature => {
      if (feature.enabled) {
        feature.enable();
      }
    });
  });
};

/*
* Document Loading
*/

function documentObserverHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting === false) {
      continue;
    }

    observer.unobserve(entry.target);

    // add loading indicator

    loadDocuments()
      .then(() => {
        // remove loading indicator
        const container = document.querySelector(config.class.main);
        observer.observe(container.lastElementChild);
      })
      .catch(message => {
        console.info(message);

        if ('disconnect' in IntersectionObserver.prototype) {
          observer.disconnect();
        } else {
          console.error('IntersectionObserver.disconnect not available.');
        }
      });
  }
}

function loadDocuments() {
  const batchSize = 10;
  const container = document.querySelector(config.class.main);

  if (documentsData.length === 0) {
    return Promise.reject('No documents left to load.');
  }

  return loadDocumentBatch(batchSize).then(docs => {
    console.info('Loaded document batch.');
    docs.forEach(doc => onDocumentLoaded(container, doc));
  });
}

function loadDocumentBatch(batchSize) {
  const documents = [];

  for (let i = 0; i < batchSize && documentsData.length > 0; i++) {
    const data = documentsData.shift();
    documents.push(createDocument(data[0], data[1]));
  }

  return Promise.all(documents);
}

function onDocumentLoaded(container, doc) {
  container.insertAdjacentHTML('beforeend', doc);
  const view = container.lastElementChild;
  state.viewObserver.observe(view);
  setDocumentWidth(view.querySelector(config.class.doc));
}

function createDocument(docName, itemCount) {
  return new Promise((resolve, reject) => {
    let items = '';
    for (var i = 0; i < itemCount; i++) {
      const source = `${config.assetPath}/${docName}-${i}.png`;
      items += `
        <div class="${config.class.item.slice(1)}" data-page="${i + 1}">
          <img data-src="${source}" alt="page ${i + 1}">
        </div>
      `;
    }

    const docSource = `${config.assetPath}/${docName}`;

    const docMarkup = `
      <div
        class="${config.class.view.slice(1)}"
        id="${docName}"
        data-doc-source="${docSource}"
        data-page-count="${itemCount + 1}">
        <div class="doc-scrollbox">
          <div class="${config.class.doc.slice(1)}">
            <div class="${config.class.item.slice(1)} active" data-page="0">
              <div class="doc-meta">
                <h2 class="doc-meta__title">
                  <a href="${docSource}">${docName}</a>
                </h2>
                by author, ${itemCount} pages, 2018
              </div>
            </div>
            ${items}
          </div>
        </div>
      </div>
    `;

    resolve(docMarkup);
  });
}

function setDocumentWidth(doc) {
  const documentOuterWidth =
    getFloatPropertyValue(doc, 'margin-left') +
    getFloatPropertyValue(doc, 'border-left-width') +
    getComputedOuterChildrenWidth(doc) +
    getFloatPropertyValue(doc, 'border-right-width') +
    getFloatPropertyValue(doc, 'margin-right');

  doc.style.setProperty('width', documentOuterWidth + 'px');
}

function evaluateItemWidth() {
  const itemSample = document.querySelector(config.class.item);
  const itemOuterWidth = getOuterWidth(itemSample);

  if (itemOuterWidth !== config.itemWidth) {
    console.info(
      'Pre-configured page width does not match actual page width.',
      'Updating configuration.'
    );
    config.itemWidth = itemOuterWidth;
  }
}

function getFullyVisibleItems() {
  const itemSample = document.querySelector(config.class.item);
  const itemOuterWidth = getOuterWidth(itemSample);

  const viewSample = document.querySelector(config.class.view);
  const viewWidth = getFloatPropertyValue(viewSample, 'width');
  return Math.floor(viewWidth / itemOuterWidth);
}

function detectScrollingCapabilities() {
  if (userAgentNeedsCustomScrolling()) {
    // Prevent auto-loading wheel navigation with custom scrolling
    // features.wheelNavigation.enabled = true;
    features.wheelNavigation.scrollingMode = 'custom';
  } else {
    // features.wheelNavigation.enabled = false;
    features.wheelNavigation.scrollingMode = 'native';
  }
}

/*
Returns true for user agents that require custom scrolling due to a missing
interaction technique for horizontal scrolling.

Detailed explanation: https://github.com/webis-de/slidehub/issues/9
*/
function userAgentNeedsCustomScrolling() {
  return userAgentIsEdge() || userAgentIsFirefoxBelowVersion(58);
}

/*
Returns true for any user agent representing a desktop version of Edge.
*/
function userAgentIsEdge() {
  return window.navigator.userAgent.includes('Edge/');
}

/*
Returns true for any user agent representing Firefox up to a certain version.
*/
function userAgentIsFirefoxBelowVersion(targetVersion) {
  const last = window.navigator.userAgent.split(' ').slice(-1)[0];
  if (last.includes('Firefox/')) {
    const version = last.split('/')[1];
    const majorVersion = parseInt(version.split('.')[0]);
    if (majorVersion < targetVersion) {
      return true;
    }
  }
  return false;
}

/*
* Navigation
*/
function handleKeyboardInput(event) {
  if (event.keyCode in controlKeyNames) {
    event.preventDefault();
    const keyName = controlKeyNames[event.keyCode];
    controlKey[keyName].trigger(event);
  }
}

function activateOnHover(event) {
  const view = event.target.closest(config.class.view);
  const item = event.target.closest(config.class.item);

  if (view === null || item === null) {
    return;
  }

  setActiveView(view);
  setActiveItem(view, item);
}

/*
* Item Linking.
*
* Open an items’ source document (e.g. a PDF page) by pressing <kbd>Return</kbd>.
*/
function handleItemLinking(event) {
  if (event.keyCode !== 13) {
    return;
  }

  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(event.target)) {
    return;
  }

  if (state.activeView !== null) {
    openItem(state.activeView, event.ctrlKey);
  }
}

function openItem(view, ctrlKey) {
  const docSource = view.getAttribute('data-doc-source');
  const itemIndex = getActiveItem(view).getAttribute('data-page');
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
  const itemSource = docSource + fragment;

  if (ctrlKey) {
    window.open(itemSource);
  } else {
    window.location.href = itemSource;
  }
}

/*
* Modifier keys.
*/
function enableModifier() {
  document.addEventListener('keydown', onModifierDown, passiveListener);
  document.addEventListener('keyup', onModifierUp, passiveListener);
  window.addEventListener('blur', onModifierBlur, passiveListener);
}

function disableModifier() {
  document.removeEventListener('keydown', onModifierDown, passiveListener);
  document.removeEventListener('keyup', onModifierUp, passiveListener);
  window.removeEventListener('blur', onModifierBlur, passiveListener);
}

function onModifierDown(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = state.activeView.querySelector(config.class.doc);
    doc.style.setProperty('cursor', 'ew-resize');
  }
}

function onModifierUp(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = state.activeView.querySelector(config.class.doc);
    doc.style.setProperty('cursor', 'auto');
  }
}

function onModifierBlur() {
  const doc = state.activeView.querySelector(config.class.doc);
  doc.style.setProperty('cursor', 'auto');
}

/*
* Mouse wheel handler for item navigation
*/

const scrolling = {
  vertical: {
    delta: 'deltaY'
  },
  horizontal: {
    delta: 'deltaX'
  }
};

/*
Handles horizontal view navigation
*/
function handleWheelNavigation(event) {
  // Don’t handle scrolling on elements that are not inside a view
  const view = event.target.closest(config.class.view);
  if (view === null) {
    return;
  }

  const ratio = Math.abs(event.deltaX / event.deltaY);
  const scrollingDirection = ratio < 1 ? scrolling.vertical : scrolling.horizontal;

  if (scrollingDirection === scrolling.horizontal) {
    console.log('Horizontal scrolling ...');
  }

  // When scrolling vertically, only trigger navigation when modifier is pressed
  if (scrollingDirection === scrolling.vertical && event.shiftKey) {
    // Prevent vertical scrolling
    event.preventDefault();

    const delta = event[scrollingDirection.delta];
    navigateView(view, Math.sign(delta));
  }
}

function navigateView(view, distance) {
  setActiveView(view);

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

function setActiveView(view) {
  // Remove all active views
  const views = document.querySelectorAll(`${config.class.view}.active`);
  Array.from(views).forEach(element => element.classList.remove('active'));

  // Set new active view
  state.activeView = view;
  state.activeView.classList.add('active');
  document.activeElement.blur();
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
  const maxViewPos = getLastItemIndex(view) - getFullyVisibleItems();
  const alignedViewPos = clamp(Math.round(currentViewPos), 0, maxViewPos);
  setViewPos(view, alignedViewPos);
}

function allItemsVisible(view) {
  const numItems = view.querySelector(config.class.doc).childElementCount;
  if (numItems <= getFullyVisibleItems()) {
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
    const lastVisibleItem = currentViewPos + getFullyVisibleItems();
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
  const maxPos = getItemCount(view) - getFullyVisibleItems();
  itemPos = clamp(itemPos, 0, maxPos);

  let itemX = itemPos * config.itemWidth;

  setViewPixelPos(view, itemX);
}

function setViewPixelPos(view, itemX, disableTransition = false) {
  const scrollbox = view.querySelector(config.class.scrollbox);
  scrollbox.scrollLeft = itemX;
}

function goToPreviousView() {
  const target = state.activeView.previousElementSibling;
  if (target !== null) {
    setActiveView(target);
  }
}

function goToNextView() {
  const target = state.activeView.nextElementSibling;
  if (target !== null) {
    setActiveView(target);
  }
}

function getItemPos(item) {
  return parseInt(item.dataset.page);
}

function getLastItemIndex(view) {
  const doc = view.querySelector(config.class.doc);
  return doc.childElementCount - 1;
}

function getItemCount(view) {
  return parseInt(view.dataset.pageCount);
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
* Modal window
*
* Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/
function enableModalButtons() {
  Array.from(document.querySelectorAll('button[data-target-modal]')).forEach(button => {
    button.removeAttribute('disabled');
    button.addEventListener('click', openModal);
  });

  Array.from(document.querySelectorAll('.modal__close')).forEach(button => {
    button.addEventListener('click', closeModal);
  });
}

function openModal(event) {
  const targetClass = event.currentTarget.getAttribute('data-target-modal');
  const modal = document.querySelector(`.${targetClass}`);

  if (modal === null) {
    return;
  }

  // Save last focused element
  state.lastFocusedElement = document.activeElement;

  document.body.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-hidden', 'false');

  modal.classList.remove('closed');

  getFocusableElements(modal)[0].focus();

  // Setup event listeners
  modal.addEventListener('keydown', closeModalOnEscape, passiveListener);
  modal.addEventListener('keydown', trapTabKey, activeListener);
  modal.addEventListener('click', closeModalOnBackground, passiveListener);
}

function closeModal(event) {
  const modal = event.target.closest('.modal');

  if (modal === null) {
    return;
  }

  document.body.setAttribute('aria-hidden', 'false');
  modal.setAttribute('aria-hidden', 'true');

  modal.classList.add('closed');

  // Clean up event listeners
  modal.removeEventListener('keydown', closeModalOnEscape, passiveListener);
  modal.removeEventListener('keydown', trapTabKey, activeListener);
  modal.removeEventListener('click', closeModalOnBackground, passiveListener);

  // Restore previously focused element
  state.lastFocusedElement.focus();
}

function closeModalOnBackground(event) {
  if (event.target === event.currentTarget) {
    closeModal(event);
  }
}

function closeModalOnEscape(event) {
  if (event.keyCode === 27) {
    closeModal(event);
  }
}

/*
* Make it impossible to focus an element outside the modal
*/
function trapTabKey(event) {
  if (event.keyCode !== 9) {
    return;
  }

  const activeElement = document.activeElement;
  const focusable = getFocusableElements(event.currentTarget);
  const tabbable = focusable.filter(element => element.tabIndex > -1);

  if (tabbable.length < 2) {
    event.preventDefault();
    return;
  }

  if (event.shiftKey) {
    if (activeElement === tabbable[0]) {
      tabbable[tabbable.length - 1].focus();
      event.preventDefault();
    }
  } else {
    if (activeElement === tabbable[tabbable.length - 1]) {
      tabbable[0].focus();
      event.preventDefault();
    }
  }
}

const focusableElementsSelector =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable=true]';

function getFocusableElements(ancestor = document) {
  return Array.from(ancestor.querySelectorAll(focusableElementsSelector));
}

function isInteractive(element) {
  const tag = element.tagName.toLowerCase();
  let potentiallyInteractive = false;
  switch (true) {
    case ['a', 'area'].includes(tag):
      if (element.hasAttribute('href') === false) {
        return false;
      }
      potentiallyInteractive = true;
      break;
    case ['input', 'select', 'textarea', 'button'].includes(tag):
      if (element.disabled) {
        return false;
      }
      potentiallyInteractive = true;
      break;
    case ['iframe', 'object', 'embed'].includes(tag):
      potentiallyInteractive = true;
      break;
    default:
      if (element.getAttribute('contenteditable') === 'true') {
        potentiallyInteractive = true;
      }
      break;
  }

  if (potentiallyInteractive && element.offsetParent !== null) {
    return true;
  }

  return false;
}

/*
* Toggle Buttons
*/
function enableToggleButtons() {
  const toggleButtons = document.querySelectorAll('[aria-pressed], [aria-checked]');
  Array.from(toggleButtons).forEach(button => {
    const featureName = button.getAttribute('data-feature');
    const stateAttr = button.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-checked';
    if (features[featureName].enabled) {
      button.setAttribute(stateAttr, 'true');
    } else {
      button.setAttribute(stateAttr, 'false');
    }

    button.addEventListener('click', event => toggle(event.currentTarget));
  });
}

function toggle(button) {
  const stateAttr = button.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-checked';
  const isPressed = button.getAttribute(stateAttr) === 'true';
  button.setAttribute(stateAttr, String(!isPressed));

  triggerButtonAction(button, stateAttr);
}

function triggerButtonAction(button, stateAttr) {
  switch (true) {
    case button.hasAttribute('data-feature'):
      const featureName = button.getAttribute('data-feature');
      const feature = features[featureName];
      if (button.getAttribute(stateAttr) === 'true') {
        feature.enable();
        console.info(`Enabled ${featureName}.`);
      } else {
        feature.disable();
        console.info(`Disabled ${featureName}.`);
      }
      break;

    default:
      console.warn('No action is associated with the control', button);
      break;
  }
}

/*
* Lazy-loading page images
*/

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initializeLazyLoader() {
  const options = {
    rootMargin: `500px 0px`
  };

  state.viewObserver = new IntersectionObserver(viewObservationHandler, options);
}

function viewObservationHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const view = entry.target;
      const images = Array.from(view.querySelectorAll('img[data-src]'));
      // For each image …
      images.forEach(img => {
        // … swap out the `data-src` attribute with the `src` attribute.
        // This will start loading the images.
        if (img.hasAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src'));
          img.removeAttribute('data-src');
        }
      });

      images[0].addEventListener('load', () => handleFirstItemImageLoaded(entry.target));

      // Unobserve the current target because no further action is required
      observer.unobserve(entry.target);
    }
  }
}

function handleFirstItemImageLoaded(view) {
  if (config.preserveAspectRatio) {
    setItemAspectRatio(view);
  }
}

function setItemAspectRatio(view) {
  const imgSample = view.querySelector(`${config.class.item} > img`);
  const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight;
  view.style.setProperty('--page-aspect-ratio', aspectRatio);
}

/*
* MISC
*/

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/*
* https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
*/
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener('test', null, opts);
} catch (event) {}

const activeListener = supportsPassive ? { passive: false } : false;
const passiveListener = supportsPassive ? { passive: true } : false;

function getFloatPropertyValue(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property);

  if (value === '') {
    return 0;
  }

  return parseFloat(value);
}

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
function getComputedOuterChildrenWidth(element) {
  let outerWidth = 0;

  Array.from(element.children).forEach(child => {
    outerWidth += getOuterWidth(child);
  });

  return outerWidth;
}

/*
* Computes the total outer width of an element.
* The outer width is defined as the width plus any horizontal margins.
* This is assumes the the `box-sizing` box model.
*/
function getOuterWidth(element) {
  const width = getFloatPropertyValue(element, 'width');
  const marginLeft = getFloatPropertyValue(element, 'margin-left');
  const marginRight = getFloatPropertyValue(element, 'margin-right');

  return marginLeft + width + marginRight;
}
