/**
 * MBL ~ Mad Basic Loader (jQuery)
 *
 * Functionality: 
 * - Loads images & fires callbacks
 *
 * Note:
 * - The jQuery version does not trigger events
 */

(function($) {
    
  $.fn.mbl = function(opts) {

    var options = $.extend({
      'sourceAttr' : 'data-src',
      'sequential' : false,
      'bgMode'     : false,
      'success'    : function(i, elem) { }, // called on each image successful load
      'error'      : function(i, elem) { }, // called on each image error
      'begin'      : function() { }, // called once loading begins
      'complete'   : function() { } // called once all images have completed (error/success agnostic)
    }, opts);

    var data = {
      'images' : [],
      'total'  : 0,
      'count'  : 0
    };

    var init = function(ele) {
      data.images = ele;
      data.total = data.images.length;
      kickoff();
    };

    var kickoff = function() {
      options.begin();
      if (data.total <= 0) {
        options.complete();
      } else {
        if (!options.sequential) {
          flood();
        } else {
          sequential();
        }
      }
    };

    var flood = function() {
      for (var i = 0; i < data.total; i++) {
        loadImage(i);
      }
    };

    var sequential = function() {
      loadImage(0);
    };

    var loadImage = function(index) {

      if (index < data.total) {

        var $elem = $(data.images[index]);
        var src   = $elem.attr(options.sourceAttr);
        var next  = index + 1;
        var img   = new Image(); // create new image

        // behavior on image load
        $(img).one('load', function() {
          if (options.bgMode || $elem.is('[data-bgmode]')) {
            $elem.css('background-image', "url('" + src + "')");
          } else {
            $(data.images[index]).attr('src',src);
          }
          $elem.attr('data-mbl-complete', '');
          options.success(index, $elem);
          if (options.sequential) {
            loadImage(next);
          }
          data.count++; 
          if (data.count >= data.total) {
            options.complete();
          }
        });

        // behavior on image error
        $(img).one('error', function() {          
          options.error(index, $elem);
          if (options.sequential) {
            loadImage(next);
          }
          data.count++; 
          if (data.count >= data.total) {
            options.complete();
          }
        });

        // set img src
        img.src = src;

        if (img.complete) {
          $(img).load(); // ensure even cached image triggers load
        }

      }

    };

    return init(this);

  };

})(jQuery);