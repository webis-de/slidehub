import { listener } from '../util/passive-event-listener';

export { SlidehubKeyboardInteraction };

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
    this.slidehub = slidehub;

    this.controlKey = {
      homeKey: {
        trigger: () => {
          this.slidehub.selectedDocument.navigateItem.left(
            this.slidehub.selectedDocument.itemCount()
          );
        }
      },
      endKey: {
        trigger: () => {
          this.slidehub.selectedDocument.navigateItem.right(
            this.slidehub.selectedDocument.itemCount()
          );
        }
      },
      arrowLeft: {
        trigger: event => {
          this.slidehub.selectedDocument.navigateItem.left(event.shiftKey ? 3 : 1);
        }
      },
      arrowRight: {
        trigger: event => {
          this.slidehub.selectedDocument.navigateItem.right(event.shiftKey ? 3 : 1);
        }
      },
      arrowUp: {
        trigger: event => {
          this.slidehub.navigateDocument.up(event.shiftKey ? 3 : 1);
        }
      },
      arrowDown: {
        trigger: event => {
          this.slidehub.navigateDocument.down(event.shiftKey ? 3 : 1);
        }
      },
      pageUp: {
        trigger: () => {
          this.slidehub.navigateDocument.up(3);
        }
      },
      pageDown: {
        trigger: () => {
          this.slidehub.navigateDocument.down(3);
        }
      }
    };
  }

  start() {
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
