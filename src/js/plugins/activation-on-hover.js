import { listener } from '../util';
import { config } from '../config';
import { setActiveItem } from '../core/view-navigation';
import { setActiveDocument } from '../core/document-navigation';

export { ActivationOnHover };

let touched = false;

const ActivationOnHover = {
  enabled: true,
  name: 'activation-on-hover',
  description: 'Activate pages on hover',
  enable() {
    document.addEventListener('touchstart', setTouched, listener.passive);
    document.addEventListener('mousemove', handleActivationOnHover, listener.passive);
    document.addEventListener('mouseup', resetTouched, listener.passive);
  },
  disable() {
    document.removeEventListener('touchstart', setTouched, listener.passive);
    document.removeEventListener('mousemove', handleActivationOnHover, listener.passive);
    document.removeEventListener('mouseup', resetTouched, listener.passive);
  }
};

function setTouched() {
  touched = true;
}

function resetTouched() {
  touched = false;
}

function handleActivationOnHover(event) {
  if (touched) {
    return;
  }

  const view = event.target.closest(config.selector.view);
  const item = event.target.closest(config.selector.item);

  if (view === null || item === null) {
    return;
  }

  setActiveDocument(view);
  setActiveItem(item);
}
