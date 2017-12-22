export { config };

/**
 * @typedef {object} Config
 * @property {ConfigPropertyAssets} assets
 * @property {boolean} metaSlide
 * @property {boolean} allowLastPageInFirstColumn
 * @property {boolean} preserveAspectRatio
 * @property {string|null} selectColor
 * @property {string|null} highlightColor
 * @property {ConfigPropertySelector} selector
 *
 * @typedef {object} ConfigPropertyAssets
 * @property {string} documents
 * @property {string} images
 *
 * @typedef {object} ConfigPropertySelector
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

  // Allows navigating pages so that the last page can be placed in the first
  // column of a document container.
  allowLastPageInFirstColumn: true,

  // Preserve aspect ratio of document items?
  preserveAspectRatio: false,

  // Overrides the default select color
  // Takes string values that represent a valid CSS color value; for example:
  // 'transparent', 'tomato', '#f90', 'hsl(220, 50%, 40%)'
  // Setting `null` uses the default color.
  selectColor: null,

  // Overrides the default highlight color.
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
