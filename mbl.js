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
