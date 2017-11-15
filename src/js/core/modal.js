/*
* Modal window
*
* Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/

import { listener } from '../util';

let lastFocusedElement;

export const Modal = {
  enable() {
    document.addEventListener('DOMContentLoaded', function() {
      const modalOpenButtons = Array.from(document.querySelectorAll('button[data-target-modal]'));
      modalOpenButtons.forEach(button => {
        button.removeAttribute('disabled');
        button.addEventListener('click', openModal);
      });

      const modalCloseButtons = Array.from(document.querySelectorAll('button[data-close-modal]'));
      modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModal);
      });
    });
  }
};

function openModal(event) {
  const targetModalClass = event.currentTarget.dataset.targetModal;
  const modal = document.querySelector(`.${targetModalClass}`);

  if (modal === null) {
    return;
  }

  // Store last focused element
  lastFocusedElement = document.activeElement;

  document.body.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-hidden', 'false');

  modal.classList.remove('closed');

  getFocusableElements(modal)[0].focus();

  // Setup event listeners
  modal.addEventListener('keydown', closeModalOnEscape, listener.passive);
  modal.addEventListener('keydown', trapTabKey, listener.active);
  modal.addEventListener('click', closeModalOnBackground, listener.passive);
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
  modal.removeEventListener('keydown', closeModalOnEscape, listener.passive);
  modal.removeEventListener('keydown', trapTabKey, listener.active);
  modal.removeEventListener('click', closeModalOnBackground, listener.passive);

  // Restore previously focused element
  lastFocusedElement.focus();
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

const focusableElementsSelector =
  'a[href], input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]';

function getFocusableElements(ancestor = document) {
  return Array.from(ancestor.querySelectorAll(focusableElementsSelector));
}
