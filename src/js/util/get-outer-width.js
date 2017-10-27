import { getFloatPropertyValue } from '.';

/*
Computes the total outer width of an element.
The outer width is defined as the width plus any horizontal margins.
This is assumes the the `box-sizing` box model.
*/
export function getOuterWidth(element) {
  const width = getFloatPropertyValue(element, 'width');
  const marginLeft = getFloatPropertyValue(element, 'margin-left');
  const marginRight = getFloatPropertyValue(element, 'margin-right');

  return marginLeft + width + marginRight;
}
