# SlideHub

SlideHub ([demo](http://test.webis.de/slidehub)) is a web-based overview of paged documents (i.e. slide decks of a presentation/talk/lecture/…). Its goal is to provide quick access to a database of documents.

Each document is converted to a set of graphics—one for each page. These graphics are arranged in a grid-like structure where each row represents a document. The cells of a row are the pages of that document.



## Development Setup

**Install dependencies**:

Installs development and production dependencies as configured in `package.json`.

```
npm install
```

**Start local development server**:

Starts a local development server and generates bundled JavaScript/CSS files in memory.

```
webpack-dev-server
```

**Generate production bundles**:

Generates bundled JavaScript/CSS files on disk. This is configured in `webpack.config.js`.

```
webpack
```

/!\ **Note**: The `-p` argument is currently not supported as webpack uses uglifiy for minifying JavaScript internally, however uglify does not work with ES6 syntax (e.g. it will throw parsing errors on arrow functions, etc.).



## Features

- Documents are listed row-wise with its pages displayed side-by-side in a horizontal slider
- Page images are lazy-loaded



## Navigation

The application needs to be usable on mobile and desktop devices utilizing the present primary input techniques.

- mouse input
- touchpad input
- keyboard input (lower priority)

The challenge is implementing a navigation pattern for a layout that is interactive in two dimensions. While a keyboard offers a variety of possibilities for doing so, a mouse is more limited. It’s safe to assume a mouse with a primary and secondary mouse button and a scrolling wheel with the ability to trigger a click as well. That said, browsers already leverage these buttons for navigation of a web page.

The scrolling wheel moves the viewport across the vertical axis while the primary mouse button is used for all sorts of interaction on the page (e.g. opening links, clicking buttons, etc.). The secondary mouse button is mostly used for opening a context menu in order to invoke browser-specific features.

### Current Concept

#### Mouse

Navigating through pages of documents on the horizontal axis is done by using the scrolling wheel with a configurable modifier. It’s advised to not use <kbd>Ctrl</kbd> since most user agents change the zoom level with <kbd>Ctrl</kbd><kbd>ScrollingWheel</kbd>.

#### Keyboard

The arrow keys are used to navigate across documents and pages. Vertical navigation across documents is done with <kbd>↑</kbd> and <kbd>↓</kbd>. Horizontal navigation across pages is done with <kbd>←</kbd> and <kbd>→</kbd>.

Additionally, <kbd title="tab key">⇥</kbd> and <kbd>Shift</kbd><kbd title="tab key">⇥</kbd> navigate across documents as well.



## To Do

- Title bar that is always displayed with some basic information
- Organization of slides by, e.g., topic, year, etc.
- Prepended "slide" that displays meta information such as year, venue
- Linking to the actual PDF and its pages from each slide
- Selection/highlighting of slides (already supported by Sly library)
- Responsiveness (esp. touch devices)
- Dragscrolling with ballistics
- Dynamic determination of the number of slides per slide deck
- Dynamic loading of slide decks based on our publications infrastructure
- Study the quality-size trade-off of slide PNGs
- Store often-used properties globally (e.g. page width)
- Implement horizontal scrolling for document containers
- Evaluate whether to set `will-change: contents;` when moving pages
- Recalculate view with `IntersectionObserver` when item is not fully visible anymore
- <s>Re-calculate page item sizes to avoid sub-pixel values</s>



## Known Issues

- Scalability: Many slide decks cause the initialization script to run very long (Dynamically loading documents [e.g. like infinite scrolling] is doable with `IntersectionObserver`)
- ImageMagick occasionally creates transparent PNGs (For documents with a specific background color, this might have a drastic impact on perceivability)
- documents `unit-en-radial-basis-functions.pdf`, `unit-de-conceptual-design3.pdf`, `unit-de-relational-design0.pdf` have no PNGs (e.g. all entries with only one page)
- Holding the modifier key currently shows an `ew-resize` cursor on containers. That signifies a click-and-drag interaction instead of the intended scrolling interaction. However <kbd>Alt</kbd><kbd>Click-dragging</kbd> on Ubuntu is an OS-level feature that allows dragging a window. It cannot be disabled via JavaScript’s `event.preventDefault()`. Therefor, the `ew-resize` cursor is not appropriate.
- Modifiers are somewhat problematic:
  - Holding <kbd>Alt</kbd> triggers the browser menu bar on some platforms.
  - Holding <kbd>Ctrl</kbd> while scrolling usually adjusts the zoom level
- <s>Negative margins to collapse borders leads to last items showing a border that is one pixel off.</s>
- <s>`overflow: hidden;` on a document container hides the scrollbars as intended but disables scrolling which is not intended on mobile platforms. Possible solutions: Show scrollbars on desktop platforms *or* reimplement horizontal scrolling on mobile platforms (requires UA-sniffing)</s>
- <s>Adding new documents after the initial scripts are already executed results in non-interactive documents since no event listener have been attached etc. (The initialization logic needs to re-evaluatable) → Adding/removing documents needs to trigger a reevaluation of all kinds of event listeners etc.</s>
- <s>Lazy-loading doesn’t work reliably when `img` elements are nested in `div`’s (Needs further investigation)</s> (Fixed via af5b3017)
- <s>The horizontal sliders do not align correctly with the slide matrix when scrolling to the end</s> (Fixed by the new slider logic)
- <s>In Chrome, dragscrolling sometimes selects content despite the CSS rules preventing that, causing hickups</s> (Fixed via c238ea31)



## Generate graphics from PDF files

[ImageMagick](https://www.imagemagick.org) is capable of a wide variety of image manipulation tasks. The following examples use the typical way of invoking it via the command line.

First of all, the package needs to be installed.

```
sudo apt-get install imagemagick
```

### Examples

**Converting a single file**:

```
convert -density 72 -quality 90 slides.pdf slides.pdf.png
```

The input file is a PDF with a certain amount of pages. Therefor, this command produces as many graphics as there are pages in the document. Without specifyingh further arguments, an index suffic will be added to the file name (e.g. `slides-0.png`, etc.).

**Converting multiple files**:

The `convert` command can be called from inside a loop to process multiple files.

```
for f in *.pdf; do convert -density 72 -quality 90 $f $f.png; done
```

Alternatively, the `mogrify` command covers the looping part as well.

```
mogrify -format png -density 72 -quality 90 *.pdf
```

**Counting the number of graphics per document**:

```
for f in *.pdf; do echo $f; ls -l $f*.png | wc -l; done
```

**Resizing images to a specific width**

The following command shrinks all files with the `png` extension to a width of 600 pixels while maintaining the aspect ratio. Smaller files are not resized.

```
mogrify -resize '600x>' *.png
```
