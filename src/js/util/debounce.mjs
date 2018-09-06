/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The initial function will be called after the debounced
 * function stops being called for a certain number of milliseconds.
 *
 * @param {Function} initialFunction Initial function to debounce
 * @param {Number} waitTime Time to wait for recurring bounces
 * @returns {Function} the debounced function.
 */
function debounce(initialFunction, waitTime) {
  // Store timeout ID outside the returned function.
  let timeoutID;

  return (...args) => {
    // If the debounced function was already invoked before, this will cancel
    // the earlier timeout; thus, it’s callback will not be invoked.
    clearTimeout(timeoutID);

    // Starts a new timer which will call the initial function after the
    // specified wait time unless the debounced function is called again.
    timeoutID = setTimeout(() => {
      initialFunction(...args);
    }, waitTime);
  };
};

export { debounce };
