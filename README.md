# MBL (Mad Basic Loader)

MBL lets us use a `data-src` attribute on an element to load images in the DOM properly. Sort of like [imagesloaded](https://github.com/desandro/imagesloaded) without all the event emissions and with more control over image load order and where the images go. Images can be loaded all at once or sequentially, they can be rendered as an image or set as the background image of an element, and callbacks are fired as each image succeeds or fails, as well as once all images in a set have loaded.

## Getting Started

MBL comes in two flavors, a [CommonJS](http://www.commonjs.org/) dependency-free module (IE9+) for use in a [Browserify](http://browserify.org/) environment or as a [jQuery](http://jquery.com/) plugin (also CommonJS or AMD compatible). Either way:

	npm install mbl

Using the CommonJS module:

	var mbl = require('mbl');

	mbl(document, { // can pass in document (default) or any DOM element
		selector   : '[data-mbl]', // selector for mbl elements
		sequential : false, // load all at once (default) or sequentially
		bgMode     : false, // load into <img src> (default) or as background-image
		success    : function(i, elem){ }, // called on each image successful load
		error      : function(i, elem){ }, // called on each image error
		complete   : function(){ } // called once all images have completed
	});
	
Using jQuery plugin (jQuery not included as a dependency so include however you like):

	var mbl = require('mbl/jquery.mbl.js'); // or just include as a script tag
	
	$(document).mbl({
		selector   : '[data-mbl]',
		sequential : false,
		bgMode     : false,
		success    : function(i, elem){ },
		error      : function(i, elem){ },
		complete   : function(){ }
	});

MBL will search within whatever node is passed into the first argument for elements matching your selector and load the images as specified. Elements must have a data-src attribute with an image source specified. Our HTML might look like:

	<img data-src="image.jpg" data-mbl>
	<img data-src="other.jpg" data-mbl>
	
and after MBL completes (assuming success) our DOM will look like:

	<img data-src="image.jpg" src="image.jpg" data-mbl="complete">
	<img data-src="other.jpg" src="other.jpg" data-mbl="complete">
	
### Sequential

If `sequential` is set to **true**, the images will be loaded one-by-one, sequentially, as they appear in the DOM. Each image waits for the prior to complete (succeed or error) before it begins to load. Handy when a linear load sequence is desired, or load throttling for some other reason:

	<img data-src="image.jpg" data-mbl>
	<img data-src="other.jpg" data-mbl> // waits for image.jpg
	<img data-src="third.jpg" data-mbl> // waits for image.jpg & third.jpg
	// etc...	
	
### Background Mode

Background mode, or `bgMode`, lets us place loaded images directly into the elements `background-image` style attribute. This is super handy for responsive images using `background-size: cover;`

	<span data-src="image.jpg" data-mbl></span>
	<span data-src="other.jpg" data-mbl></span>

and after MBL completes (assuming success) if `bgMode` were set to **true**, our DOM will look like:

	<span 
		data-src="image.jpg" 
		style="background-image:url('image.jpg');" 
		data-mbl="complete"></span>
	<span 
		data-src="other.jpg" 
		style="background-image:url('image.jpg');" 
		data-mbl="complete"></span>
	
## Multiple Instances

You can have multiple instances of MBL on a single page without assigning to a variable or using the `new` keyword:

	mbl(document.querySelector('.container')); // MBL will execute on .container
	mbl(document.querySelector('.slider')); // MBL will execute on .slider
	
## Support
	
The CommonJS version does not attempt to have very deep browser support, it should work in IE9+ and all good browsers. If deeper browser support is required, you are probably already using jQuery and should go for the jQuery version of MBL. There's no feature difference in the two, just the jQuery dependency.

## Todo

- Tests
- Responsive image handling?