import { listener } from '../util/passive-event-listener.mjs';

const controlKeyNames = {
  33: 'pageUp',
  34: 'pageDown',
  35: 'endKey',
  36: 'homeKey',
  37: 'arrowLeft',
  38: 'arrowUp',
  39: 'arrowRight',
  40: 'arrowDown'
};

/**
 * Keyboard Interaction.
 */
class SlidehubKeyboardInteraction {
  constructor(slidehub) {
    this.controlKey = {
      homeKey: {
        trigger: () => {
          slidehub.selectedDocument.navigateItem.left(
            slidehub.selectedDocument.itemCount()
          );
        }
      },
      endKey: {
        trigger: () => {
          slidehub.selectedDocument.navigateItem.right(
            slidehub.selectedDocument.itemCount()
          );
        }
      },
      arrowLeft: {
        trigger: event => {
          slidehub.selectedDocument.navigateItem.left(event.shiftKey ? 3 : 1);
        }
      },
      arrowRight: {
        trigger: event => {
          slidehub.selectedDocument.navigateItem.right(event.shiftKey ? 3 : 1);
        }
      },
      arrowUp: {
        trigger: event => {
          slidehub.navigateDocument.up(event.shiftKey ? 3 : 1);
        }
      },
      arrowDown: {
        trigger: event => {
          slidehub.navigateDocument.down(event.shiftKey ? 3 : 1);
        }
      },
      pageUp: {
        trigger: () => {
          slidehub.navigateDocument.up(3);
        }
      },
      pageDown: {
        trigger: () => {
          slidehub.navigateDocument.down(3);
        }
      }
    };

    document.addEventListener('keydown', this.handleKeyboardInput.bind(this), listener.active);
  }

  /**
   * Handles keyboard interactions with documents and items.
   *
   * @param {KeyboardEvent} event
   */
  handleKeyboardInput(event) {
    if (event.keyCode in controlKeyNames) {
      event.preventDefault();
      const keyName = controlKeyNames[event.keyCode];
      this.controlKey[keyName].trigger(event);
    }
  }
};

export { SlidehubKeyboardInteraction };
