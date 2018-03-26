export { getFragmentIdentifier };

/**
 * Returns the fragment identifier of a URL if it is present.
 *
 * @param {String} url
 * @returns {String|null} the fragment identifier of a URL if it is present,
 *                        `null` otherwise.
 */
function getFragmentIdentifier(url) {
  const hashPosition = url.indexOf('#');
  if (hashPosition > 0) {
    return url.substring(hashPosition + 1);
  }

  return null;
}
