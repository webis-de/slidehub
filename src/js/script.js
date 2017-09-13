'use strict'

/*
* Configuration
*/
const config = {
  // Location of the data directory containing PDF/PNG assets
  assetPath: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',

  itemWidth: 300,

  // How to position scrollable content
  //   true:  Use CSS transforms
  //   false: Use the views `scrollLeft`/`scrollTop` property
  moveViewItemsWithTransform: true,

  // Preserve aspect ratio of document items
  //   true:  Preserves aspect ratio
  //   false: Uses a default aspect ratio of 5:4
  preserveAspectRatio: true,

  // HTML classes that can be used in CSS selectors
  class: {
    main: '.main-content',
    view: '.doc-view',
    doc:  '.doc',
    item: '.doc__page'
  },

  // Modifier key. Possible values: ctrlKey, shiftKey, altKey
  modifierKey: 'shiftKey'
};



/*
* Features
*/
const features = {

  core: {
    enable: function() {
      enableModalButtons();
      enableToggleButtons();
    },
    disable: function() {
      console.error('Can’t disable core feature.');
    }
  },

  wheelNavigation: {
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
    enable: function() {
      document.addEventListener('keydown', handleKeyboardInput, activeListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleKeyboardInput, activeListener);
    }
  },

  itemLinking: {
    enable: function() {
      document.addEventListener('keydown', handleItemLinking, passiveListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleItemLinking, passiveListener);
    }
  },

  activatingOnHover: {
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
  visibleItems: null,
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
      // setViewPos(state.activeView, 0)
      moveItem(this.direction * getItemCount(state.activeView));
    }
  },
  endKey: {
    direction: 1,
    trigger: function() {
      // setViewPos(state.activeView, getLastItemIndex())
      moveItem(this.direction * getItemCount(state.activeView));
    }
  },
  arrowLeft: {
    direction: -1,
    trigger: function(event) {
      moveItem(this.direction * (event.ctrlKey ? 3 : 1));
    }
  },
  arrowRight: {
    direction: 1,
    trigger: function(event) {
      moveItem(this.direction * (event.ctrlKey ? 3 : 1));
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

module.exports = function () {
  initializeLazyLoader();

  document.addEventListener('DOMContentLoaded', function() {

    const documentObserver = new IntersectionObserver(
      documentObserverHandler,
      { threshold: 1 }
    );

    loadDocuments()
      .then(() => {
        // onFirstDocumentLoaded
        const firstView = document.querySelector(config.class.view);
        setActiveView(firstView);
        evaluateItemWidth();
        state.visibleItems = getFullyVisibleItems();

        const container = document.querySelector(config.class.main);
        documentObserver.observe(container.lastElementChild);
      });

    Object.values(features).forEach(feature => feature.enable());
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

  return loadDocumentBatch(batchSize)
    .then(docs => {
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
  enableDocumentScrolling(view);
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
        <div class="${config.class.doc.slice(1)}">
          <div class="${config.class.item.slice(1)} doc-info active" data-page="0">
            <h2 class="doc-title">
              <a href="${docSource}">${docName}</a>
            </h2>
            by <span class="doc-author">author</span>,
            <span class="doc-pages-count">${itemCount}</span> pages,
            2018
          </div>
          ${items}
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

function enableDocumentScrolling(view) {
  let prevX, prevY;
  let transitionValue;
  let doc;

  view.addEventListener('touchstart', function(event) {
    if (config.moveViewItemsWithTransform) {
      view.style.setProperty('will-change', 'transform');
    }

    state.touched = true;
    doc = view.querySelector(config.class.doc);
    transitionValue = getComputedStyle(doc).getPropertyValue('transition');
    doc.style.setProperty('transition', 'none');

    prevX = event.targetTouches[0].clientX;
  }, supportsPassive ? { passive: true } : false);

  view.addEventListener('touchmove', function(event) {
    if (state.touched) {
      const touch = event.targetTouches[0];
      const offsetX = touch.clientX - prevX;
      const offsetY = touch.clientY - prevY;

      // Determine vertical/horizontal scrolling ratio
      const directionRatio = Math.abs(offsetX / offsetY);
      if (directionRatio < 1) {
        return;
      }

      activateOnHover(event);
      const newItemX = getViewPixelPos(view) - offsetX;
      const disableTransition = true;
      setViewPixelPos(view, newItemX, disableTransition);
      prevX = touch.clientX;
      prevY = touch.clientY;
    }
  }, supportsPassive ? { passive: true } : false);

  view.addEventListener('touchend', function(event) {
    if (state.touched) {
      const newPos = getViewPos(view);
      setViewPos(view, Math.round(newPos));

      if (config.moveViewItemsWithTransform) {
        view.style.setProperty('will-change', 'auto');
      }

      state.touched = false
      doc.style.setProperty('transition', transitionValue)
    }
  }, supportsPassive ? { passive: true } : false);
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// NAVIGATION

function handleKeyboardInput(event) {
  if (event.keyCode in controlKeyNames) {
    event.preventDefault()
    const keyName = controlKeyNames[event.keyCode]
    controlKey[keyName].trigger(event)
  }
}

function activateOnHover(event) {
  const view = event.target.closest(config.class.view)
  const item = event.target.closest(config.class.item)

  if (view === null || item === null) {
    return
  }

  setActiveView(view)
  setActiveItem(view, item)
}





/*
* Item Linking.
*
* Open an items’ source document (e.g. a PDF page) by pressing <kbd>Return</kbd>.
*/
function handleItemLinking(event) {
  if (event.keyCode !== 13) {
    return
  }

  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(event.target)) {
    return
  }

  if (state.activeView !== null) {
    openItem(state.activeView, event.ctrlKey)
  }
}

function openItem(view, ctrlKey) {
  const docSource = view.getAttribute('data-doc-source')
  const itemIndex = getActiveItem(view).getAttribute('data-page')
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : ''
  const itemSource = docSource + fragment

  if (ctrlKey) {
    window.open(itemSource)
  } else {
    window.location.href = itemSource
  }
}





/*
* Modifier keys.
*/
function enableModifier() {
  const modifier = config.modifierKey.replace('Key', '');
  const modifierElements = Array.from(document.querySelectorAll('.shortcut__modifier'));
  modifierElements.forEach(element => element.innerText = modifier);

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
  const modifierKey = modifierKeyNames[event.keyCode]
  if (modifierKey === config.modifierKey) {
    const doc = state.activeView.querySelector(config.class.doc)
    doc.style.setProperty('cursor', 'ew-resize')
  }
}

function onModifierUp(event) {
  const modifierKey = modifierKeyNames[event.keyCode]
  if (modifierKey === config.modifierKey) {
    const doc = state.activeView.querySelector(config.class.doc)
    doc.style.setProperty('cursor', 'auto')
  }
}

function onModifierBlur() {
  const doc = state.activeView.querySelector(config.class.doc)
  doc.style.setProperty('cursor', 'auto')
}




/*
* Mouse wheel item navigation
*/
// let combinedDelta = 0;

function handleWheelNavigation(event) {
  const scrollingVertically = Math.abs(event.deltaX / event.deltaY) < 1;
  const delta = scrollingVertically ? event.deltaY : event.deltaX;

  // When scrolling vertically, only trigger navigation when modifier is pressed
  if (scrollingVertically && event[config.modifierKey] === false) {
    return
  }

  if (!scrollingVertically) {
    // combinedDelta += delta
    // console.log(combinedDelta)
    console.log('handle horizontal wheel scrolling properly')
  }

  const view = event.target.closest(config.class.view)
  if (view === null) {
    return
  }

  // Prevent vertical scrolling
  event.preventDefault()

  // Prevent unnecessary actions when there is nothing to scroll
  const numItems = view.querySelector(config.class.doc).childElementCount
  if (numItems <= state.visibleItems) {
    return
  }

  moveView(Math.sign(delta))
}

function moveView(distance) {
  const view = state.activeView
  if (view === null) {
    return
  }

  // Move items along with view
  // moveItem(distance)

  let currentViewPos = getViewPos(view)
  // if (isNotAligned(currentViewPos)) {
  //   currentViewPos = Math.round(currentViewPos)
  // }
  setViewPos(view, currentViewPos + distance)
}

function isNotAligned(itemsBeforeView) {
  return itemsBeforeView % 1 !== 0
}

function moveItem(distance) {
  const view = state.activeView
  const item = getActiveItem(view)
  const currentIndex = parseInt(item.getAttribute('data-page'))
  const lastIndex = getItemCount(view) - 1
  const targetIndex = clamp(currentIndex + distance, 0, lastIndex)
  const targetItem = getItemByIndex(view, targetIndex)
  setActiveItem(view, targetItem)

  // Move view if item would become partially hidden
  const targetRect = targetItem.getBoundingClientRect()
  const viewRect = view.getBoundingClientRect()
  const marginLeft = getFloatPropertyValue(targetItem, 'margin-left')
  const marginRight = getFloatPropertyValue(targetItem, 'margin-right')
  const isFullyVisible = (
    targetRect.left >= viewRect.left &&
    (targetRect.right + marginLeft + marginRight) <= (viewRect.left + viewRect.width)
  )
  const actualDistance = targetIndex - currentIndex
  if (isFullyVisible === false) {
    moveView(actualDistance)
    return
  }

  // Move view if it’s not aligned
  // let currentViewPos = getViewPos(view)
  // if (isNotAligned(currentViewPos) && Math.sign(distance) < 0) {
  //   setViewPos(view, Math.floor(currentViewPos))
  // }
}

function getViewPos(view) {
  return getViewPixelPos(view) / config.itemWidth
}

function getViewPixelPos(view) {
  if (config.moveViewItemsWithTransform) {
    const doc = view.querySelector(config.class.doc)
    // Negate the value in order to match scrollbar position values
    const itemPos = -1 * getTranslateX(doc)
    return itemPos
  }

  return view.scrollLeft
}

function setViewPos(view, itemPos) {
  if (view === null) {
    return
  }

  const doc = view.querySelector(config.class.doc)
  const maxPos = getItemCount(view) - state.visibleItems
  itemPos = clamp(itemPos, 0, maxPos)
  // if (itemPos < 0) {
  //   itemPos = 0
  // }
  // else if (itemPos > maxPos) {
  //   itemPos = maxPos
  // }

  let itemX = itemPos * config.itemWidth
  // const maxX = getOuterWidth(doc) - getOuterWidth(view)
  // if (itemX > maxX) {
  //   itemX = maxX
  // }

  setViewPixelPos(view, itemX)
}

function setViewPixelPos(view, itemX, disableTransition = false) {
  const doc = view.querySelector(config.class.doc)

  if (config.moveViewItemsWithTransform) {
    doc.style.setProperty('transform', `translateX(${-itemX}px)`)
  } else {
    view.scrollLeft = itemX
  }
}

function getTranslateX(element) {
  const matrix = getComputedStyle(element).getPropertyValue('transform')

  if (matrix === 'none') {
    return 0
  }

  return parseFloat(matrix.split(',')[4])
}

function goToPreviousView() {
  const target = state.activeView.previousElementSibling
  if (target !== null) {
    setActiveView(target)
  }
}

function goToNextView() {
  const target = state.activeView.nextElementSibling
  if (target !== null) {
    setActiveView(target)
  }
}

function getLastItemIndex() {
  const doc = state.activeView.querySelector(config.class.doc)
  return doc.childElementCount - 1
}

function setActiveView(view) {
  const views = document.querySelectorAll(`${config.class.view}.active`)
  Array.from(views).forEach(element => element.classList.remove('active'))
  state.activeView = view
  state.activeView.classList.add('active')
  document.activeElement.blur()
}

function getItemCount(view) {
  return parseInt(view.getAttribute('data-page-count'))
}

function getActiveItem(view) {
  return view.querySelector(`${config.class.item}.active`)
}

function setActiveItem(view, targetItem) {
  const activeItem = getActiveItem(view)
  activeItem.classList.remove('active')
  targetItem.classList.add('active')
  document.activeElement.blur()
}

function getItemByIndex(view, index) {
  const doc = view.querySelector(config.class.doc)
  return doc.children[index]
}





/*
* Modal window
*
* Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/
function enableModalButtons() {
  Array.from(document.querySelectorAll('.open-modal')).forEach(button => {
    button.removeAttribute('disabled')
    button.addEventListener('click', openModal)
  })

  Array.from(document.querySelectorAll('.close-modal')).forEach(button => {
    button.addEventListener('click', closeModal)
  })
}

function openModal(event) {
  const targetClass = event.currentTarget.getAttribute('data-target-modal')
  const modal = document.querySelector(`.${targetClass}`)

  if (modal === null) {
    return
  }

  // Save last focused element
  state.lastFocusedElement = document.activeElement

  document.body.setAttribute('aria-hidden', 'true')
  modal.setAttribute('aria-hidden', 'false')

  modal.classList.remove('closed')

  getFocusableElements(modal)[0].focus()

  // Setup event listeners
  modal.addEventListener('keydown', closeModalOnEscape, passiveListener)
  modal.addEventListener('keydown', trapTabKey, activeListener)
  modal.addEventListener('click', closeModalOnBackground, passiveListener)
}

function closeModal(event) {
  const modal = event.target.closest('.modal')

  if (modal === null) {
    return
  }

  document.body.setAttribute('aria-hidden', 'false')
  modal.setAttribute('aria-hidden', 'true')

  modal.classList.add('closed')

  // Clean up event listeners
  modal.removeEventListener('keydown', closeModalOnEscape, passiveListener)
  modal.removeEventListener('keydown', trapTabKey, activeListener)
  modal.removeEventListener('click', closeModalOnBackground, passiveListener)

  // Restore previously focused element
  state.lastFocusedElement.focus()
}

function closeModalOnBackground(event) {
  if (event.target === event.currentTarget) {
    closeModal(event)
  }
}

function closeModalOnEscape(event) {
  if (event.keyCode === 27) {
    closeModal(event)
  }
}

/*
* Make it impossible to focus an element outside the modal
*/
function trapTabKey(event) {
  if (event.keyCode !== 9) {
    return
  }

  const activeElement = document.activeElement
  const focusable = getFocusableElements(event.currentTarget)
  const tabbable = focusable.filter(element => element.tabIndex > -1);

  if (tabbable.length < 2) {
    event.preventDefault()
    return
  }

  if (event.shiftKey) {
    if (activeElement === tabbable[0]) {
      tabbable[tabbable.length - 1].focus()
      event.preventDefault()
    }
  } else {
    if (activeElement === tabbable[tabbable.length - 1]) {
      tabbable[0].focus()
      event.preventDefault()
    }
  }
}

const focusableElementsSelector = `
  a[href],
  area[href],
  input:not([disabled]),
  select:not([disabled]),
  textarea:not([disabled]),
  button:not([disabled]),
  iframe,
  object,
  embed,
  [tabindex],
  [contenteditable=true]
`;

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
  const switches = Array.from(document.querySelectorAll('.switch'));
  switches.forEach(switchButton => {
    switchButton.addEventListener('click', event => {
      const button = event.currentTarget;
      const isChecked = button.getAttribute('aria-checked') === 'true';
      const feature = features[button.getAttribute('data-feature')];
      if (isChecked) {
        feature.disable();
      } else {
        feature.enable();
      }
      button.setAttribute('aria-checked', String(!isChecked))
    });
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// LAZY LOADING PAGES

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initializeLazyLoader() {
  const options = {
    rootMargin: `500px 0px`
  }

  state.viewObserver = new IntersectionObserver(viewObservationHandler, options)
}

function viewObservationHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const view = entry.target
      const images = Array.from(view.querySelectorAll('img[data-src]'))
      // For each image …
      images.forEach(img => {
        // … swap out the `data-src` attribute with the `src` attribute.
        // This will start loading the images.
        if (img.hasAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src'))
          img.removeAttribute('data-src')
        }
      })

      images[0].addEventListener('load', function() {
        handleFirstItemImageLoaded(entry.target)
      })

      // Unobserve the current target because no further action is required
      observer.unobserve(entry.target)
    }
  }
}

function handleFirstItemImageLoaded(view) {
  if (config.preserveAspectRatio) {
    setItemAspectRatio(view)
  }
}

function setItemAspectRatio(view) {
  const imgSample = view.querySelector(`${config.class.item} > img`)
  const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight
  view.style.setProperty('--page-aspect-ratio', aspectRatio)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// MISC

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/*
* https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
*/
let supportsPassive = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true
    }
  });
  window.addEventListener('test', null, opts)
} catch (event) {}

const activeListener = supportsPassive ? { passive: false } : false
const passiveListener = supportsPassive ? { passive: true } : false


function getFloatPropertyValue(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property)

  if (value === '') {
    return 0
  }

  return parseFloat(value)
}

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
function getComputedOuterChildrenWidth(element) {
  let outerWidth = 0

  Array.from(element.children).forEach(child => {
    outerWidth += getOuterWidth(child)
  })

  return outerWidth
}

/*
* Computes the total outer width of an element.
* The outer width is defined as the width plus any horizontal margins.
* This is assumes the the `box-sizing` box model.
*/
function getOuterWidth(element) {
  const width = getFloatPropertyValue(element, 'width')
  const marginLeft = getFloatPropertyValue(element, 'margin-left')
  const marginRight = getFloatPropertyValue(element, 'margin-right')

  return marginLeft + width + marginRight
}
