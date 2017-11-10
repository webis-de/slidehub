# SlideHub

SlideHub ([demo website](http://test.webis.de/slidehub)) is a web-based presentation/lecture/talk slide explorer. Its goal is to provide quick access to a database of paged documents. The documents are represented as rows of a grid-like structure while each cell is a page.

All documents are available as PDF files. In addition, all slides are available as images that act as a kind of preview for the actual documents’ page.

- [Features](#features)
- [Navigation](#navigation)
- [Browser Support](#browser-support)
- [Development Setup](#development-setup)
- [To Do](#to-do)
- [Known Issues](#known-issues)
- [Generate graphics from PDF files](#generate-graphics-from-pdf-files)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)



## Features

- Keyboard navigation
- Page images are only loaded when necessary
- Each page links to its original PDF file (using the *page* fragment in the URL for browsers that support targetting individual pages in their PDF viewer)



## Navigation

The application can be navigated with the most common input devices (i.e. mouse, trackpad, touchpad, keyboard).

With a mouse, one can navigate the pages within a document by holding down <kbd>Shift</kbd> and turning the mouse wheel. With a double-click on a page, the PDF is opened at this page.

With a keyboard, the arrow keys allow navigating the pages within documents and the documents itself. Holding down <kbd>Shift</kbd> while pressing an arrow key navigates three pages or documents at a time. Furthermore, <kbd>Home</kbd>/<kbd>End</kbd> jump to the first/last page of a document.



## Browser Support

| IE | Edge | Firefox | Chrome | Safari | Opera |
|---:|-----:|--------:|-------:|-------:|------:|
| —  | 15   | 31      | 49     | 9.1    | 36    |

SlideHub does not support Internet Explorer. All features listed below are not supported by Internet Explorer (unless a polyfill is provided). To achieve support for Internet Explorer 11, the JavaScript code needs to be transpiled to not use unsupported features (like promises). In addition, the CSS has to be written in a way to either not use custom properties at all or provide explicit fallbacks to property declarations using them.

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

### Troubleshooting

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
