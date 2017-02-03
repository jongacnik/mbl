(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mbl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * MBL ~ Mad Basic Loader
 * Loads images, fires callbacks & triggers events
 */
var imgload = require('imgload')
var xtend = require('xtend')
var sanitize = require('sanitize-elements')
var Emitter = require('tiny-emitter')

module.exports = function ($images, opts) {
  var events = new Emitter()

  var options = xtend({
    sourceAttr: 'data-src',
    sequential: false,
    mode: 'src', // src, background, load/false
    success: function (elem) { }, // called on each image load
    error: function (elem) { }, // called on each image error
    begin: function () { }, // called once loading begins
    complete: function () { }  // called once all images have completed (error/success agnostic)
  }, opts)

  var data = {
    total: 0,
    count: 0
  }

  var init = function () {
    if ($images = sanitize($images, true)) {
      data.total = $images.length
    } else {
      console.warn('no images here!')
      return
    }
    kickoff()
    return this
  }

  var kickoff = function () {
    begin()
    if (data.total <= 0) {
      complete()
    } else {
      if (!options.sequential) {
        flood()
      } else {
        sequential()
      }
    }
  }

  var flood = function () {
    for (var i = 0; i < data.total; i++) {
      loadImage(i)
    }
  }

  var sequential = function () {
    loadImage(0)
  }

  var loadImage = function (index) {
    if (index < data.total) {
      var $img = $images[index]
      var src = $img.getAttribute(options.sourceAttr)

      var imgloader = imgload(src)

      imgloader
        .on('error', function () {
          error($img)
        })
        .on('load', function () {
          var mode = $img.getAttribute('data-mbl-mode') || options.mode
          if (mode !== 'load') {
            if (mode === 'background') {
              $img.style.backgroundImage = "url('" + src + "')"
              $img.setAttribute('data-mbl-complete', '')
            } else {
              $img.setAttribute('src', src)
              $img.setAttribute('data-mbl-complete', '')
            }
          }
          success($img)
        })
        .on('always', function () {
          if (options.sequential) {
            loadImage(index + 1)
          }
          data.count++
          if (data.count >= data.total) {
            complete()
          }
        })
        .start()
    }
  }

  var success = function (elem) {
    options.success(elem)
    events.emit('success', {
      element: elem
    })
  }

  var error = function (elem) {
    options.error(elem)
    events.emit('error', {
      element: elem
    })
  }

  var begin = function () {
    options.begin()
    events.emit('begin')
  }

  var complete = function () {
    options.complete()
    events.emit('complete')
  }

  return {
    start: init,
    on: function(ev, cb) { events.on(ev, cb); return this }
  }
}

},{"imgload":3,"sanitize-elements":7,"tiny-emitter":8,"xtend":9}],2:[function(require,module,exports){
/**
 * @param target is any DOM Element or EventTarget
 * @param type Event type (i.e. 'click')
 */
module.exports = function(target, type) {
  var doc = document;
  if (doc.createEvent) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(type, false, false, {});
    target.dispatchEvent(event);
  } else {
    var event = doc.createEventObject();
    target.fireEvent('on' + type, event);
  }
};
},{}],3:[function(require,module,exports){
/**
 * imgload
 * Loads an image src and triggers events
 */

var trigger  = require('etrig')
var Emitter  = require('tiny-emitter')

module.exports = function (src) {

  var events = new Emitter()

  function load () {

    var img = new Image()

    img.addEventListener('load', function () {
      events
        .emit('load', {
          src : src
        })
        .emit('always', {
          src : src,
          result : 'load'
        })
    })

    img.addEventListener('error', function () {
      events
        .emit('error', {
          src : src
        })
        .emit('always', {
          src : src,
          result : 'error'
        })
    })

    img.src = src

    if (img.complete) {
      trigger(img, 'load') // ensure cached image triggers load
    }

    return this

  }

  return {
    start : load,
    on : function (ev, cb) { events.once(ev, cb); return this }
  }

}

},{"etrig":2,"tiny-emitter":8}],4:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],5:[function(require,module,exports){
(function(root) {
  function isElement(value) {
    return (value && value.nodeType === 1) &&
           (value && typeof value == 'object') &&
           (Object.prototype.toString.call(value).indexOf('Element') > -1);
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = isElement;
    }
    exports.isElement = isElement;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return isElement;
    });
  } else {
    root.isElement = isElement;
  }

})(this);

},{}],6:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],7:[function(require,module,exports){
/**
 * @param $elements are dom element(s)
 * @param wrap true/false if single elements should be wrapped as array
 */
var isElement = require('is-element')
var isObject  = require('is-object')
var isArray   = require('is-array')

module.exports = function($elements, wrap) {
  
  if ($elements === undefined
      || !isObject($elements)
      || $elements === window
      || $elements === document) {
    return false
  }

  var $sanitized = []

  if (isElement($elements)) {
    if (wrap) {
      $sanitized.push($elements)
    } else {
      return $elements
    }
  } 
  else if (isArray($elements)) {
    $elements.forEach(function(value) {
      if (isElement(value)) {
        $sanitized.push(value)
      }
    })
  }
  else if (isObject($elements)) {
    Object.keys($elements).forEach(function(key) {
      if (isElement($elements[key])) {
        $sanitized.push($elements[key])
      }
    })
  } 

  if (!$sanitized.length) {
    return false
  }

  return $sanitized

}
},{"is-array":4,"is-element":5,"is-object":6}],8:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],9:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1])(1)
});