import { config } from '../config';
import { getFloatPropertyValue, getOuterWidth } from '.';

export function getFullyVisibleItems(view) {
  const itemSample = view.querySelector(config.class.item);
  const itemOuterWidth = getOuterWidth(itemSample);

  const viewWidth = getFloatPropertyValue(view, 'width');
  return Math.floor(viewWidth / itemOuterWidth);
}
