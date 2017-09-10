# SlideHub

SlideHub ([demo](http://test.webis.de/slidehub)) is a web-based overview of paged documents (i.e. slide decks of a presentation/talk/lecture/…). Its goal is to provide quick access to a database of documents.

Each document is converted to a set of graphics—one for each page. These graphics are arranged in a grid-like structure where each row represents a document. The cells of a row are the pages of that document.



## Development Setup

**Install dependencies**:

Installs all required development dependencies as defined in `package.json`.

```
npm install
```

**Generate development/production bundles**:

The regular build script just bundles JavaScript files into one file that can be sourced from an HTML document. The same applies for CSS files. This can be configured in the `webpack.config.js` file.

```
npm run build
```

There is also a build script for production using the `webpack -p` command instead of just `webpack`. This build step includes minification of the JavaScript and CSS bundles.

```
npm run build-production
```

**Start local development server**:

Starts a local development server and generates bundled JavaScript/CSS files in memory.

```
npm start
```

This will run the `start` script as defined in `package.json`.



## Features

- Documents are listed row-wise with its pages displayed side-by-side in a horizontal container.
- Page images are only loaded if they become visible (i.e. if they are about to enter the viewport).
- The original PDF pages of a document are referenced from their SlideHub page. They can be opened by navigating to them and pressing <kbd>Return</kbd>.



## Navigation

The application needs to be usable on mobile and desktop devices utilizing the following primary input devices:

- Mouse
- Touchpad
- Keyboard

The challenge is implementing a navigation pattern for a layout that is interactive in two dimensions. While a keyboard offers a variety of possibilities for doing so, a mouse is more limited. It’s safe to assume a mouse with a primary and secondary mouse button and a scrolling wheel with the ability to trigger a click as well. That said, browsers already leverage these buttons for navigation of a web page.

The scrolling wheel moves the viewport across the vertical axis while the primary mouse button is used for all sorts of interaction on the page (e.g. opening links, clicking buttons, etc.). The secondary mouse button is mostly used for opening a context menu in order to invoke browser-specific features. These interactions vary across operating systems. While it’s easy to overwrite the default behavior in most cases, such a step needs to be justified.

### Current Concept

#### Mouse

Navigating through pages of documents on the horizontal axis is done by using the scrolling wheel in addition to holding a modifier key. It’s advised to not use <kbd>Ctrl</kbd> since most user agents change the zoom level with <kbd>Ctrl</kbd><kbd>MouseWheel</kbd>. Also, the <kbd>Alt</kbd> key is problematic, as on some browsers (e.g. Firefox) pressing the <kbd>Alt</kbd> key reveals the browsers menu bar. This leaves only the <kbd>Shift</kbd> key as an option without immediate conflicts.

#### Keyboard

The arrow keys are used to navigate across documents and pages. Vertical navigation across documents is done with Arrow Up <kbd>↑</kbd> and Arrow Down <kbd>↓</kbd>. Horizontal navigation across pages is done with Arrow Left <kbd>←</kbd> and Arrow Right <kbd>→</kbd>.

One can also navigate in chunks of 3 by holding <kbd>Ctrl</kbd> while navigating pages of a document.

Additionally, the <kbd>Home</kbd> or <kbd>Pos1</kbd> key jumps to the first page of a document, while the <kbd>End</kbd> key jumps to the last page.



## To Do

- *Interaction*: Marking/selecting pages in order to generate a new PDF (low priority)
- *Interaction*: Drag-scrolling with ballistics
- *Interaction*: Implement horizontal scrolling for document containers *→ Horizontal scrolling via touch devices is not great. Feels slow and unresponsive.*
- *Internal Logic*: Recalculate view with `IntersectionObserver` when item is not fully visible anymore
- *Internal Logic*: Dynamic determination of the number of slides per slide deck
- *Performance*: Study the quality-size trade-off of slide PNGs
- *Performance*: Evaluate whether to set `will-change: contents;` when moving pages
- *Layout*: Evaluate usage of CSS Grid. Does grid allow overflowing grid cells?
- *Layout*: Dynamic solution for toolbox on small screens
- *PDF Linking*: Opening of PDF with a mouse/pointer device (currently, only via keyboard)

**Server-related**:

- Prepended page with meta information such as year, venue, author. *→ Needs server integration.*
- Dynamic loading of documents based on our publications infrastructure. *→ Needs server integration.*
- Organization of documents by, e.g., topic, year, etc. *→ Missing data. Will there be a metadata file for each document?*
-



## Known Issues

- Scalability: A large amount of documents cause the initialization to run very long *→ This needs thorough investigation. How can the documents be loaded in the background without blocking interactions with the page?*
- ImageMagick occasionally creates transparent PNGs (For documents with a specific background color, this might have a drastic impact on perceivability)
- documents `unit-en-radial-basis-functions.pdf`, `unit-de-conceptual-design3.pdf`, `unit-de-relational-design0.pdf` have no PNGs (e.g. all entries with only one page)
- Holding the modifier key currently shows an `ew-resize` cursor on containers. That signifies a click-and-drag interaction instead of the intended scrolling interaction. However <kbd>Alt</kbd><kbd>Click-dragging</kbd> on Ubuntu is an OS-level feature that allows dragging a window. It cannot be disabled via JavaScript’s `event.preventDefault()`. Therefor, the `ew-resize` cursor is not appropriate.
- Some modifiers are problematic:
  - Holding <kbd>Alt</kbd> triggers the browser menu bar on some platforms.
  - Holding <kbd>Ctrl</kbd> while scrolling usually adjusts the zoom level



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
