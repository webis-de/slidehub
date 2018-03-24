export { SlidehubPlugin };

class SlidehubPlugin {
  constructor(slidehub, name, description) {
    this.slidehub = slidehub;
    this.name = name;
    this.description = description;
    this.enabled = false;
    this.toggleButton = null;

    if (new.target === SlidehubPlugin) {
      throw new TypeError('Cannot construct SlidehubPlugin instances directly');
    }

    if (this.enable === SlidehubPlugin.prototype.enable) {
      throw new TypeError('A SlidehubPlugin has to implement its own enable method.');
    }

    if (this.disable === SlidehubPlugin.prototype.disable) {
      throw new TypeError('A SlidehubPlugin has to implement its own disable method.');
    }
  }

  enable() {
    this.enabled = true;

    if (!this.toggleButton) {
      this.toggleButton = this.createToggleButton();
      if (this.toggleButton) {
        this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
      }
    }
  }

  disable() {
    this.enabled = false;
  }

  /**
   * Creates a feature toggle button in the user interface.
   *
   * @returns {Element|null}
   */
  createToggleButton() {
    const fieldset = document.querySelector('.features-fieldset');

    if (!fieldset) {
      return null;
    }

    const toggleButtonMarkup = `
      <div class="form-group form-group--switch">
        <span class="form-label" id="${this.name}-label">${this.description}</span>
        <button
          role="switch"
          aria-checked="false"
          aria-labelledby="${this.name}-label"
          data-feature="${this.name}"
        >
          <span class="state state--true" aria-label="on"></span>
          <span class="state state--false" aria-label="off"></span>
        </button>
      </div>
    `;

    fieldset.insertAdjacentHTML('beforeend', toggleButtonMarkup);

    const button = fieldset.querySelector(`[data-feature="${this.name}"]`);
    button.setAttribute('aria-checked', this.enabled.toString());

    return button;
  }

  /**
   * Toggles a toggle button and triggers its associated action.
   *
   * @param {MouseEvent} event
   */
  handleToggleButton(event) {
    const button = event.currentTarget;

    if (button instanceof HTMLElement) {
      const isPressed = button.getAttribute('aria-checked') === 'true';
      button.setAttribute('aria-checked', String(!isPressed));

      this.triggerButtonAction(button, 'aria-checked');
    }
  }

  /**
   * Triggers the associated action of a toggle button.
   *
   * @param {HTMLElement} button
   * @param {'aria-checked'|'aria-pressed'} stateAttr
   */
  triggerButtonAction(button, stateAttr) {
    switch (true) {
      case button.hasAttribute('data-feature'):
        if (button.getAttribute(stateAttr) === 'true') {
          this.enable();
        } else {
          this.disable();
        }
        break;

      default:
        console.warn('No action is associated with the control', button);
        break;
    }
  }
};

/* class MyPlugin extends SlidehubPlugin {
  constructor() {
    super();
  }

  enable() {
    console.log('MyPlugin.enable');
    super.enable();
  }

  disable() {
    console.log('MyPlugin.disable');
    super.disable();
  }
};

const x = new MyPlugin();
x.enable(); */
