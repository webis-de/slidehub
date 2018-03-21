/**
 * Plugin Loader.
 */

export { loadPlugin };

/**
 * @typedef {object} SlidehubPlugin
 * @property {function(): void} enable
 * @property {function(): void} disable
 * @property {string} name
 * @property {string} description
 * @property {boolean} enabled
 */

/**
 * Loads a plugin and potentially enables it.
 *
 * @param {SlidehubPlugin} plugin
 */
function loadPlugin(plugin) {
  if (plugin.enabled) {
    plugin.enable();
  }

  registerPlugin(plugin);
}

const pluginRegistry = new Map();

/**
 * Registers a new plugin.
 *
 * @param {SlidehubPlugin} plugin
 */
function registerPlugin(plugin) {
  const button = createToggleButton(plugin);

  if (button) {
    pluginRegistry.set(plugin.name, plugin);

    button.addEventListener('click', toggleButton);
  }
}

/**
 * Creates a feature toggle button in the user interface.
 *
 * @param {SlidehubPlugin} plugin
 * @returns {Element|null}
 */
function createToggleButton(plugin) {
  const fieldset = document.querySelector('.features-fieldset');

  if (!fieldset) {
    return null;
  }

  const toggleButtonMarkup = `
    <div class="form-group form-group--switch">
      <span class="form-label" id="${plugin.name}-label">${plugin.description}</span>
      <button role="switch" aria-checked="false" aria-labelledby="${
        plugin.name
      }-label" data-feature="${plugin.name}">
        <span class="state state--true" aria-label="on"></span>
        <span class="state state--false" aria-label="off"></span>
      </button>
    </div>
  `;

  fieldset.insertAdjacentHTML('beforeend', toggleButtonMarkup);

  const button = fieldset.querySelector(`[data-feature="${plugin.name}"]`);
  button.setAttribute('aria-checked', plugin.enabled.toString());

  return button;
}

/**
 * Toggles a toggle button and triggers its associated action.
 *
 * @param {MouseEvent} event
 */
function toggleButton(event) {
  const button = event.currentTarget;

  if (button instanceof HTMLElement) {
    const plugin = pluginRegistry.get(button.dataset.feature);
    const isPressed = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', String(!isPressed));

    triggerButtonAction(button, 'aria-checked', plugin);
  }
}

/**
 * Triggers the associated action of a toggle button.
 *
 * @param {HTMLElement} button
 * @param {'aria-checked'|'aria-pressed'} stateAttr
 * @param {SlidehubPlugin} plugin
 */
function triggerButtonAction(button, stateAttr, plugin) {
  switch (true) {
    case button.hasAttribute('data-feature'):
      if (button.getAttribute(stateAttr) === 'true') {
        plugin.enable();
        console.info('Enabled', plugin.name);
      } else {
        plugin.disable();
        console.info('Disabled', plugin.name);
      }
      break;

    default:
      console.warn('No action is associated with the control', button);
      break;
  }
}
