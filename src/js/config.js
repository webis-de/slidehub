/*
* Configuration
*/
export const config = {
  // Location of the data directory containing PDF/PNG assets
  assetPath: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',

  itemWidth: 300,

  // Preserve aspect ratio of document items
  //   true:  Preserves aspect ratio
  //   false: Uses a default aspect ratio of 5:4
  preserveAspectRatio: true,

  // Selectors for UI components
  selector: {
    main: '.doc-container',
    view: '.doc-view',
    scrollbox: '.doc-scrollbox',
    doc: '.doc',
    item: '.doc__page'
  }
};
