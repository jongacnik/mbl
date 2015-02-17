/**
 * MBL ~ Mad Basic Loader
 *
 * Functionality: 
 * - Loads images & fires callbacks
 */

module.exports = function(context, opts){

  var data = {
    images : [],
    total  : 0,
    count  : 0
  };

  var options = mextend({
    selector   : '[data-mbl]',
    sourceAttr : 'data-src',
    sequential : false,
    bgMode     : false,
    success    : function(i, elem){ }, // called on each image successful load
    error      : function(i, elem){ }, // called on each image error
    complete   : function(){ } // called once all images have completed (error/success agnostic)
  }, opts);

  function init(context){
    context = context || document;
    data.images = context.querySelectorAll(options.selector);
    data.total = data.images.length;
    kickoff();
  };

  function kickoff(){
    if(data.total <= 0)
      options.complete();
    else {
      if(!options.sequential)
        flood();
      else
        sequential();
    }
  };

  function flood(){
    for(var i = 0; i < data.total; i++)
      loadImage(i);
  };

  function sequential(){
    loadImage(0);
  };

  // Should split up this function someday
  function loadImage(index){

    if(index < data.total){

      var elem   = data.images[index];
      var src    = elem.getAttribute(options.sourceAttr);
      var next   = index + 1;
      var img    = new Image(); // create new image
      var loaded = false;

      // behavior on image load
      img.addEventListener('load', function(){
        if(!loaded){
          loaded = true;
          if(!options.bgMode)
            data.images[index].setAttribute('src',src);
          else
            elem.style.backgroundImage = "url('" + src + "')";
          elem.setAttribute('data-mbl', elem.getAttribute('data-mbl') + ' complete');
          options.success(index, elem);
          if(options.sequential) loadImage(next);
          data.count++; if(data.count >= data.total) options.complete();
        }
      });

      // behavior on image error
      img.addEventListener('error', function(){
        if(!loaded){
          loaded = true;
          options.error(index, elem);
          if(options.sequential) loadImage(next);
          data.count++; if(data.count >= data.total) options.complete();
        }
      });

      // set img src
      img.src = src;

      if(img.complete) trigger(img, 'load'); // ensure even cached image triggers load

    }

  };

  function trigger(target, type){
    var doc = document;
    if (doc.createEvent) {
      var event = new Event(type);
      target.dispatchEvent(event);
    } else {
      var event = doc.createEventObject();
      target.fireEvent('on' + type, event);
    }
  };

  function mextend(target, source){
    target = target || {};
    for(var prop in source) {
      if(typeof source[prop] === 'object')
        target[prop] = mextend(target[prop], source[prop]);
      else
        target[prop] = source[prop];
    }
    return target;
  };

  return init(context);

};