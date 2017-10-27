/*
* Loads optional plugins
*/

export function loadPlugin(plugin) {
  if (plugin.enabled) {
    plugin.enable();
  }

  registerPlugin(plugin);
}

function registerPlugin(plugin) {
  const toggleButtonMarkup = `
    <div class="form-group form-group--switch">
      <span class="form-label" id="feature-${plugin.name}">${plugin.description}</span>
      <button role="switch" aria-checked="false" aria-labelledby="feature-${plugin.name}" data-feature="${plugin.name}">
        <span class="state state--true" aria-label="on"></span>
        <span class="state state--false" aria-label="off"></span>
      </button>
    </div>
  `;

  const fieldset = document.querySelector('.features-fieldset');
  fieldset.insertAdjacentHTML('beforeend', toggleButtonMarkup);

  const button = fieldset.querySelector(`[data-feature="${plugin.name}"]`);
  const stateAttr = button.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-checked';
  if (plugin.enabled) {
    button.setAttribute(stateAttr, 'true');
  } else {
    button.setAttribute(stateAttr, 'false');
  }

  button.addEventListener('click', event => toggle(event.currentTarget, plugin));
}

function toggle(button, plugin) {
  const stateAttr = button.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-checked';
  const isPressed = button.getAttribute(stateAttr) === 'true';
  button.setAttribute(stateAttr, String(!isPressed));

  triggerButtonAction(button, stateAttr, plugin);
}

function triggerButtonAction(button, stateAttr, plugin) {
  switch (true) {
    case button.hasAttribute('data-feature'):
      if (button.getAttribute(stateAttr) === 'true') {
        plugin.enable();
        console.info(`Enabled ${plugin.name}.`);
      } else {
        plugin.disable();
        console.info(`Disabled ${plugin.name}.`);
      }
      break;

    default:
      console.warn('No action is associated with the control', button);
      break;
  }
}
