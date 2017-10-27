export function getFloatPropertyValue(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property);

  if (value === '') {
    return 0;
  }

  return parseFloat(value);
}
