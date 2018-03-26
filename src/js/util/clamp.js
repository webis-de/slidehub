export { clamp };

/**
 * Clamps the given value between the min and max boundaries.
 *
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} - `value` if `min <= value <= max`
 *                   - `min` if `value < min`
 *                   - `max` if `value > max`
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
