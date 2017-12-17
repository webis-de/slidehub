/**
 * Modal window.
 *
 * Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus.
 * https://github.com/gdkraus/accessible-modal-dialog
 */

import { listener } from '../util';

export { Modal };

let lastFocusedElement;

const Modal = {
  enable() {
    document.addEventListener('DOMContentLoaded', function() {
      const modalOpenButtons = Array.from(document.querySelectorAll('button[data-target-modal]'));
      modalOpenButtons.forEach(button => {
        button.removeAttribute('disabled');
        button.addEventListener('click', event => {
          const targetModalClass = event.currentTarget.dataset.targetModal;
          const modal = document.querySelector(`.${targetModalClass}`);
          openModal(modal);
        });
      });

      const modalCloseButtons = Array.from(document.querySelectorAll('button[data-close-modal]'));
      modalCloseButtons.forEach(button => {
        button.addEventListener('click', event => {
          const modal = event.currentTarget.closest('.modal');
          closeModal(modal);
        });
      });
    });
  }
};

/**
 * Opens the modal.
 *
 * @param {Element} modal
 */
function openModal(modal) {
  if (modal === null) {
    return;
  }

  // Store last focused element
  lastFocusedElement = document.activeElement;

  document.body.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-hidden', 'false');

  moveFocusToModal(modal);

  // Setup event listeners
  document.addEventListener('keydown', closeOnEscape, listener.passive);
  modal.addEventListener('keydown', trapTabKey, listener.active);
  modal.addEventListener('click', closeOnBackground, listener.passive);
}

/**
 * Move focus to the first focusable element inside the modal.
 *
 * @param {Element} modal
 */
function moveFocusToModal(modal) {
  const focusable = getFocusableElements(modal);
  focusable[0].focus();
}

/**
 * Closes the modal.
 *
 * @param {Element} modal
 */
function closeModal(modal) {
  if (modal === null) {
    return;
  }

  document.body.setAttribute('aria-hidden', 'false');
  modal.setAttribute('aria-hidden', 'true');

  // Clean up event listeners
  document.removeEventListener('keydown', closeOnEscape, listener.passive);
  modal.removeEventListener('keydown', trapTabKey, listener.active);
  modal.removeEventListener('click', closeOnBackground, listener.passive);

  // Restore previously focused element
  lastFocusedElement.focus();
}

/**
 * Closes the modal when clicking on the background.
 *
 * @param {MouseEvent} event
 */
function closeOnBackground(event) {
  const modal = document.querySelector('.modal[aria-hidden="false"]');
  if (modal === event.target) {
    closeModal(modal);
  }
}

/**
 * Closes the modal when pressing the <kbd>Esc</kbd>.
 *
 * @param {KeyboardEvent} event
 */
function closeOnEscape(event) {
  if (event.keyCode === 27) {
    closeModal(document.querySelector('.modal[aria-hidden="false"]'));
  }
}

/**
 * Make it impossible to focus an element outside the modal
 *
 * @param {KeyboardEvent} event
 */
function trapTabKey(event) {
  if (event.keyCode !== 9) {
    return;
  }

  const activeElement = document.activeElement;
  const focusable = getFocusableElements(event.currentTarget);
  const tabable = focusable.filter(element => element.tabIndex > -1);

  if (tabable.length < 2) {
    event.preventDefault();
    return;
  }

  if (event.shiftKey) {
    if (activeElement === tabable[0]) {
      tabable[tabable.length - 1].focus();
      event.preventDefault();
    }
  } else {
    if (activeElement === tabable[tabable.length - 1]) {
      tabable[0].focus();
      event.preventDefault();
    }
  }
}

/**
 * Selects all focusable elements currently present in the DOM/
 *
 * @param {Element|document} ancestor
 * @returns {Array}
 */
function getFocusableElements(ancestor = document) {
  return Array.from(ancestor.querySelectorAll(focusableElementsSelector));
}

const focusableElementsSelector =
  'a[href], input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]';
