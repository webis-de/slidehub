# SlideHub

SlideHub ([demo website](http://test.webis.de/slidehub)) is a web-based presentation/lecture/talk slide explorer. Its goal is to provide quick access to a database of paged documents. The documents are represented as rows of a grid-like structure while each cell is a page.

All documents are available as PDF files. In addition, all slides are available as images that act as a kind of preview for the actual documents’ page.



## Features

- Keyboard navigation
- Page images are lazy-loaded (i.e. if they are about to become visible)
- Each page links to its original PDF file (with *page* URL parameter for browsers that support targetting individual pages)



## Navigation

The application needs to be usable on mobile and desktop devices utilizing the following primary input devices:

- Mouse/Trackpad
- Touchpad
- Keyboard

The challenge is implementing a navigation pattern for a layout that is interactive in two dimensions. While a keyboard offers a variety of possibilities for doing so, a mouse is more limited. It’s safe to assume a mouse with a primary and secondary mouse button and a scrolling wheel with the ability to trigger a click as well. That said, browsers already leverage these buttons for navigation of a web page.

The scrolling wheel moves the viewport across the vertical axis while the primary mouse button is used for all sorts of interaction on the page (e.g. opening links, clicking buttons, etc.). The secondary mouse button is mostly used for opening a context menu in order to invoke browser-specific features. These interactions vary across operating systems. While it’s easy to overwrite the default behavior in most cases, such a step needs to be justified.

### Current Concept

#### Mouse

Navigating through pages of documents on the horizontal axis is done by using the scrolling wheel in addition to holding a modifier key. It’s advised to not use <kbd>Ctrl</kbd> since most user agents change the zoom level with <kbd>Ctrl</kbd><kbd>MouseWheel</kbd>. Also, the <kbd>Alt</kbd> key is problematic, as on some browsers (e.g. Firefox) pressing the <kbd>Alt</kbd> key reveals the browsers menu bar. This leaves only the <kbd>Shift</kbd> key as an option without immediate conflicts.

#### Keyboard

The arrow keys are used to navigate across documents and pages. Vertical navigation across documents is done with Upwards Arrow <kbd>↑</kbd> and Downwards Arrow <kbd>↓</kbd>. Horizontal navigation across pages is done with Leftwards Arrow <kbd>←</kbd> and Rightwards Arrow <kbd>→</kbd>.

One can also navigate in chunks of 3 by holding <kbd>Shift</kbd> while navigating pages of a document.

Additionally, the <kbd>Home</kbd> (or <kbd>Pos1</kbd>) key jumps to the first page of a document, while the <kbd>End</kbd> key jumps to the last page.



## Browser Support

| IE | Edge | Firefox | Chrome | Safari | Opera |
|---:|-----:|--------:|-------:|-------:|------:|
| —  | 15   | 31      | 49     | 9.1    | 36    |

Currently, SlideHub does not support Internet Explorer in any version. All features listed below are not supported by Internet Explorer (unless a polyfill is provided). To achieve support for Internet Explorer 11, the JavaScript code needs to be transpiled to not use unsupported features (like promises). In addition, the CSS has to be written in a way to either not use custom properties at all or provide explicit fallbacks to property declarations using them.

I’d like to avoid Internet Explorer. It doesn’t have great support for [Flexbox](https://caniuse.com/#feat=flexbox). It only has [support for an old version](https://caniuse.com/#feat=css-grid) of the CSS grid specification. It also lacks support for a lot of [ECMAScript 6](https://kangax.github.io/compat-table/es6/) features.

**Used Features** (sorted by most unsupported feature first):

- [CSS custom properties](https://caniuse.com/#feat=css-variables)
- [Promises](https://caniuse.com/#feat=promises)
- [IntersectionObserver](https://caniuse.com/#feat=intersectionobserver) with [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)



## Development Setup

**Install dependencies**:

Installs all required development dependencies.

```
npm install
```

**Build production bundles**:

The build script bundles JavaScript and CSS files into one file each. It also applies minification in order to reduce file size (i.e. the amount of data that needs to be transferred to the user).

```
npm run build
```

*(Runs the `build` script as defined in `package.json`.)*

**Development environment**:

Starts a local development server and generates bundled JavaScript/CSS files in memory. This is currently not configured to apply minification.

```
npm start
```

*(Runs the `start` script as defined in `package.json`.)*



## To Do

- Marking/selecting pages in order to generate a new PDF (low priority)
- Dynamic determination of the number of slides per slide deck
- Study the quality-size trade-off of slide PNGs

**Server-related**:

- Prepending page with meta information such as year, venue, author.
- Dynamic loading of documents based on our publications infrastructure.
- Organization of documents by, e.g., topic, year, etc. *→ Missing data. Will there be a metadata file for each document?*



## Known Issues

- Horizontal page navigation state via the `ew-resize` cursor is not transferred in all cases (e.g. when holding shift and scrolling up/down).
- Some modifiers are problematic:
  - Holding <kbd>Alt</kbd> triggers the browser menu bar on some platforms.
  - Holding <kbd>Ctrl</kbd> while scrolling usually adjusts the zoom level
- documents `unit-en-radial-basis-functions.pdf`, `unit-de-conceptual-design3.pdf`, `unit-de-relational-design0.pdf` have no PNGs (e.g. all entries with only one page)
- ImageMagick occasionally creates transparent PNGs (For documents with a specific background color, this might have a drastic impact on perceivability)



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

The input file is a PDF with a certain amount of pages. Therefor, this command produces as many graphics as there are pages in the document. Without specifying further arguments, an index suffic will be added to the file name (e.g. `slides-0.png`, etc.).

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

The same argument can also specified when converting from PDF.

#### Troubleshooting

One might run out of memory while converting some large PDFs. If this is the case, an error like the one below is printed.

```
convert-im6.q16: DistributedPixelCache '127.0.0.1' @ error/distribute-cache.c/ConnectPixelCacheServer/244.
convert-im6.q16: cache resources exhausted `/tmp/magick-30849GyqwEjT6yu7947' @ error/cache.c/OpenPixelCache/3945.
convert-im6.q16: DistributedPixelCache '127.0.0.1' @ error/distribute-cache.c/ConnectPixelCacheServer/244.
convert-im6.q16: cache resources exhausted `/tmp/magick-30849GyqwEjT6yu7947' @ error/cache.c/OpenPixelCache/3945.
```

I tried specifying `-limit memory 2GiB` as an additional argument for `convert` or `mogrify` without any effect. However I was able to work around this issue by changing the default limit in `/etc/ImageMagick/policy.xml`.

I replaced the line …

```
<policy domain="resource" name="memory" value="256MiB"/>
```

… with …

```
<policy domain="resource" name="memory" value="2GiB"/>
```
