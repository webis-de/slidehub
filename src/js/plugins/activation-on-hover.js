import { listener } from '../util';
import { config } from '../config';
import { setActiveView, setActiveItem } from '../core/view-navigation';

export { ActivationOnHover };

const ActivationOnHover = {
  enabled: false,
  name: 'activation-on-hover',
  description: 'Activate pages on hover',
  enable() {
    document.addEventListener('mousemove', handleActivationOnHover, listener.passive);
  },
  disable() {
    document.removeEventListener('mousemove', handleActivationOnHover, listener.passive);
  }
};

function handleActivationOnHover(event) {
  const view = event.target.closest(config.class.view);
  const item = event.target.closest(config.class.item);

  if (view === null || item === null) {
    return;
  }

  setActiveView(view);
  setActiveItem(view, item);
}
