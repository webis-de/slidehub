export { config };

/**
 * @typedef Config
 * @type {object}
 * @property {ConfigPropertyAssets} assets
 * @property {boolean} metaSlide
 * @property {boolean} preserveAspectRatio
 * @property {string|null} highlightColor
 * @property {ConfigPropertySelector} selector
 *
 * @typedef ConfigPropertyAssets
 * @type {object}
 * @property {string} documents
 * @property {string} images
 *
 * @typedef ConfigPropertySelector
 * @type {object}
 * @property {string} slidehub
 * @property {string} doc
 * @property {string} scrollbox
 * @property {string} itemContainer
 * @property {string} item
 */

/**
 * Global configuration object.
 *
 * @type {Config}
 */
const config = {
  // Location of the data directory containing PDF/PNG assets
  assets: {
    documents: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',
    images: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data'
  },

  // Create a meta slide for each document?
  metaSlide: true,

  // Preserve aspect ratio of document items?
  preserveAspectRatio: false,

  // Overrides the default highlight color
  // Takes string values that represent a valid CSS color value; for example:
  // 'transparent', 'tomato', '#f90', 'hsl(220, 50%, 40%)'
  // Setting highlightColor to `null` will not override the default.
  highlightColor: null,

  // Selectors for UI components
  selector: {
    slidehub: '.slidehub-container',
    doc: '.doc',
    scrollbox: '.doc-scrollbox',
    itemContainer: '.page-container',
    item: '.page'
  }
};
