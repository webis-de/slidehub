import { listener } from '../util';
import {
  navigateView,
  setActiveView,
  getItemCount,
  goToPreviousView,
  goToNextView
} from '../core/view-navigation';

export const KeyboardNavigationModule = {
  enabled: true,
  name: 'keyboard-navigation',
  description: 'Navigate pages with keyboard',
  enable() {
    document.addEventListener('keydown', handleKeyboardInput, listener.active);
  },

  disable() {
    document.removeEventListener('keydown', handleKeyboardInput, listener.active);
  }
};

function handleKeyboardInput(event) {
  if (event.keyCode in controlKeyNames) {
    event.preventDefault();
    const keyName = controlKeyNames[event.keyCode];
    controlKey[keyName].trigger(event);
  }
}

/*
* Maps key codes to key names.
* It’s used within keyboard-related event handlers in order to work with the
* keys’ names instead of key codes.
*
* Removing an entry here disables its application-related interactions
*/
const controlKeyNames = Object.freeze({
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
      // navigateView(this.direction * getItemCount(view));
    }
  },
  endKey: {
    direction: 1,
    trigger: function() {
      // navigateView(this.direction * getItemCount(view));
    }
  },
  arrowLeft: {
    direction: -1,
    trigger: function(event) {
      navigateView(this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowRight: {
    direction: 1,
    trigger: function(event) {
      navigateView(this.direction * (event.shiftKey ? 3 : 1));
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
