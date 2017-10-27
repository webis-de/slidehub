import { getOuterWidth } from '.';

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
export function getComputedOuterChildrenWidth(element) {
  let outerWidth = 0;

  Array.from(element.children).forEach(child => {
    outerWidth += getOuterWidth(child);
  });

  return outerWidth;
}
