export { clamp };

/**
 * Clamps the given value between the min and max boundaries
 * Returns value if min <= value <= max.
 * Returns min if value < min.
 * Returns max if value > max.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
