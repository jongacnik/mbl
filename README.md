# MBL (Mad Basic Loader)

MBL gives better control over image loading in the browser. Images can be loaded all at once or sequentially, they can be rendered as an image or set as the background image of an element. Callbacks/events are fired once image loading begins, as each image succeeds or fails, and once all images have loaded.

Built on top of [imgload](https://www.npmjs.com/package/imgload) for simple image loading events.

## Getting Started

MBL is meant to be consumed in a [CommonJS](http://www.commonjs.org/), [Browserify](http://browserify.org/) environment (though you can also use a pre-bundled version, more below):

	npm install mbl

## Usage

**Example HTML**

	<img data-src="image.jpg" data-mbl>
	<img data-src="other.jpg" data-mbl>

**Javascript**

	// require
	var mbl = require('mbl')

	// gather some images
	var images = document.querySelectorAll('[data-mbl]')

	// setup
	var imageload = mbl(images)

	// start!
	imageload.start()

### Options

You can get more specific if you want (the following are defaults):

	var imageload = mbl(images, {
		sourceAttr : 'data-src' // attribute containing image source
		sequential : false, // sequential mode (details below)
		mode       : 'src', // mbl mode (details below)
		success    : function(elem) { }, // on each image load
		error      : function(elem) { }, // on each image error
		begin      : function() { } // once loading begins
		complete   : function() { } // once all images have completed
	})

### Events

Events are also triggered along with the callbacks. Bind to events like so:

	imageload.on('success', function(data) {
		// triggered on each image successful load
	})

	imageload.on('error', function(data) {
		// triggered on each image error
	})

	imageload.on('begin', function() {
		// triggered when loading begins
	})

	imageload.on('complete', function() {
		// triggered when all images have completed
	})

## What happens to the DOM

Example HTML from above:

	<img data-src="image.jpg" data-mbl>
	<img data-src="other.jpg" data-mbl>

after MBL completes (assuming success) DOM becomes:

	<img data-src="image.jpg" src="image.jpg" data-mbl-complete>
	<img data-src="other.jpg" src="other.jpg" data-mbl-complete>

## More about options

### Sequential

If `sequential` is set to **true**, the images are loaded sequentially, one by one. Each image waits for the prior to complete (success or error) before beginning to load. Handy when a linear load sequence is desired, or load throttling for some other reason:

	<img data-src="image.jpg" data-mbl>
	<img data-src="other.jpg" data-mbl> // waits for image.jpg
	<img data-src="third.jpg" data-mbl> // waits for other.jpg
	// etc...

### Loading Mode ( src | background | load )

Mode | Behavior
--- | ---
`src` | source of the loaded image is set as the `src` attribute
`background` | source of the loaded image is set as the `background-image` style attribute
`load` | no DOM changes, but callbacks/events fired

This setting is handy for responsive images using `background-size: cover;`

	<span data-src="image.jpg" data-mbl></span>
	<span data-src="other.jpg" data-mbl></span>

after MBL completes (assuming success) with `mode: background` DOM becomes:

	<span
		data-src="image.jpg"
		style="background-image:url('image.jpg');"
		data-mbl-complete
	></span>
	<span
		data-src="other.jpg"
		style="background-image:url('other.jpg');"
		data-mbl-complete
	></span>

The mode can also be changed on an element basis by adding an attribute to the element:

	<img
		data-src="image.jpg"
		data-mbl-mode="src|background|load"
	>

## Bundled Version

If you don't want to mess with a build process you can also include the pre-bundled version found in `dist/mbl.bundled.js` in your project which exposes `mbl()` globally.

## jQuery

There's still an old jQuery version of MBL in `dist` as well. This hasn't been maintained but it's there for tinkering. Usage is:

	var mbl = require('mbl/jquery.mbl.js'); // or just include as a script tag

	$('[data-mbl]').mbl({
		'sequential' : false,
		'bgMode'     : false,
		'success'    : function(index, elem) { },
		'error'      : function(index, elem) { },
		'begin'      : function() { }
		'complete'   : function() { }
	})

## Todo

- Sequential image throttling
- Pause / resume sequential loads
- Tests
