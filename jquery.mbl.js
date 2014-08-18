/**
 * MBL ~ Mad Basic Loader
 * Desc : Loads images
 */
 (function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    
    $.fn.mbl = function(Options) {

    var Data = {
      $mbl  : null,
      total : 0,
      count : 0
    };

    var Self = {

      Options: $.extend(true, {}, {
        mblSelector : '.mbl',
        sequential  : false,
        bgMode      : false,
        callbacks   : {
          eachDone : function(i, ele) { console.log('image ' + i + ' done!'); },
          eachFail : function(i, ele) { console.log('image ' + i + ' fail!'); },
          allDone  : function() { console.log('All done!'); }
        }
      }, Options),

      Init : function(ele) {
        
        // Set cache & count 'em
        Data.$mbl  = ele.find(Self.Options.mblSelector);
        Data.total = Data.$mbl.length;

        // Kick off
        if(Data.total <= 0)
          Self.Options.callbacks.allDone();
        else {
          if(!Self.Options.sequential)
            Self.FloodLoad();
          else
            Self.SequentialLoad();
        }

      },

      // Load images all at once
      FloodLoad : function() {
        for(var i = 0; i < Data.total; i++) {
          Self.LoadThis(i);
        }
      },

      // Load images sequentially, one at time
      SequentialLoad : function() {
        Self.LoadThis(0);
      },
   
      LoadThis : function(index) {

        var $ele = $(Data.$mbl[index]); // Get single mbl from index
        var src  = $ele.data('src');    // Grab src
        var next = index+1;

        if(index < Data.total) {

          var img = new Image(); // Create new image
          img.src = src;         // Set the src 

          $(img).one('load', function() {

            // Set img src or set bg src
            if(!Self.Options.bgMode) {
              $ele.attr('src',src).addClass('mbl-complete');
            } else {
              $ele.css('background-image','url(\'' + src + '\')').addClass('mbl-complete');
            }

            Self.Options.callbacks.eachDone(index, $ele); // Fire callback for single image load
            Data.count++; if(Data.count >= Data.total) Self.Options.callbacks.allDone(); // Fire callback for all images loaded, if true
            
            if(Self.Options.sequential) Self.LoadThis(next); // If using sequential mode, load the next image

          }).one('error', function(e) {

            Self.Options.callbacks.eachFail(index, $ele); // Fire failed callback

            if(Self.Options.sequential) Self.LoadThis(next); // If using sequential mode, load the next image

          });
     
          if(img.complete) $(img).load();

        } // end if
        
      } // end LoadThis

    }

    return Self.Init(this);

  };

}));