import { listener } from '../util';
import { config } from '../config';
import { setActiveView, setActiveItem } from '../core/view-navigation';

export const ActivateOnHoverModule = {
  enabled: false,
  name: 'activate-on-hover',
  description: 'Activate pages on hover',
  enable() {
    document.addEventListener('mousemove', activateOnHover, listener.passive);
  },
  disable() {
    document.removeEventListener('mousemove', activateOnHover, listener.passive);
  }
};

function activateOnHover(event) {
  const view = event.target.closest(config.class.view);
  const item = event.target.closest(config.class.item);

  if (view === null || item === null) {
    return;
  }

  setActiveView(view);
  setActiveItem(view, item);
}
