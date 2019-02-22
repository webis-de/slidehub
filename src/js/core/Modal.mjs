/**
 * Modal window.
 *
 * Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus.
 * https://github.com/gdkraus/accessible-modal-dialog
 */

let lastFocusedElement;

function enableModals() {
  const openButtonContainer = document.querySelector('[data-slidehub-modal-buttons]');

  if (openButtonContainer === null) {
    return;
  }

  injectModalButtons(openButtonContainer);

  const openButtons = Array.from(openButtonContainer.querySelectorAll('[data-target-modal]'));
  openButtons.forEach(openButton => {
    openButton.addEventListener('click', event => {
      const targetModalName = event.currentTarget.dataset.targetModal;
      const modal = document.querySelector(`[data-modal-${targetModalName}]`);
      openModal(modal);
    });
  });

  const closeButtons = Array.from(document.querySelectorAll('[data-close-modal]'));
  closeButtons.forEach(closeButton => {
    closeButton.addEventListener('click', event => {
      const modal = event.currentTarget.closest('[role="dialog"]');
      closeModal(modal);
    });
  });
}

function injectModalButtons(openButtonContainer) {
  const helpOpenButton = createOpenButton('Help');
  openButtonContainer.insertAdjacentHTML('beforeend', helpOpenButton);
}

function createOpenButton(title) {
  return `<button class="sh-button sh-button--subtle" data-target-modal="${title.toLowerCase()}">
    ${title}
  </button>`;
}

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
  document.addEventListener('keydown', closeOnEscape, { passive: true });
  modal.addEventListener('keydown', trapTabKey);
  modal.addEventListener('click', closeOnBackground, { passive: true });
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
  document.removeEventListener('keydown', closeOnEscape);
  modal.removeEventListener('keydown', trapTabKey);
  modal.removeEventListener('click', closeOnBackground);

  // Restore previously focused element
  lastFocusedElement.focus();
}

/**
 * Closes the modal when clicking on the background.
 *
 * @param {MouseEvent} event
 */
function closeOnBackground(event) {
  const modal = document.querySelector('.sh-modal[aria-hidden="false"]');
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
    closeModal(document.querySelector('.sh-modal[aria-hidden="false"]'));
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

const focusableElementsSelector = [
  'a[href]',
  'area[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'button:not(:disabled)',
  'iframe',
  'object',
  'embed',
  '[tabindex]'
].join(',');

export { enableModals };
