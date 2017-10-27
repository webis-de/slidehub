import { listener } from '../util';
import { config } from '../config';
import { navigateView, getActiveView, setActiveView } from '../core/view-navigation';

export const WheelNavigationModule = {
  enabled: true,
  name: 'wheel-navigation',
  description: 'Navigate pages with mouse wheel',
  enable() {
    enableModifier();
    document.addEventListener('wheel', handleWheelNavigation, listener.active);
  },
  disable() {
    disableModifier();
    document.removeEventListener('wheel', handleWheelNavigation, listener.active);
  }
};

/*
* Modifier keys.
*/

// Maps key codes to key names
const modifierKeyNames = {
  16: 'shiftKey'
};

function enableModifier() {
  document.addEventListener('keydown', onModifierDown, listener.passive);
  document.addEventListener('keyup', onModifierUp, listener.passive);
  window.addEventListener('blur', onModifierBlur, listener.passive);
}

function disableModifier() {
  document.removeEventListener('keydown', onModifierDown, listener.passive);
  document.removeEventListener('keyup', onModifierUp, listener.passive);
  window.removeEventListener('blur', onModifierBlur, listener.passive);
}

function onModifierDown(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = getActiveView().querySelector(config.class.doc);
    doc.style.setProperty('cursor', 'ew-resize');
  }
}

function onModifierUp(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = getActiveView().querySelector(config.class.doc);
    doc.style.setProperty('cursor', 'auto');
  }
}

function onModifierBlur() {
  const doc = getActiveView().querySelector(config.class.doc);
  doc.style.setProperty('cursor', 'auto');
}

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

  setActiveView(view);

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
    navigateView(Math.sign(delta));
  }
}
