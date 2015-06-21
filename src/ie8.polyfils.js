/*
 * IE8 Polyfils for iframeResizer.js
 *
 * Public domain code - Mozilla Contributors
 * https://developer.mozilla.org/
 */

 if (!Array.prototype.forEach){
	Array.prototype.forEach = function(fun /*, thisArg */){
		"use strict";
		if (this === void 0 || this === null || typeof fun !== "function") throw new TypeError();

		var
			t = Object(this),
			len = t.length >>> 0,
			thisArg = arguments.length >= 2 ? arguments[1] : void 0;

		for (var i = 0; i < len; i++)
			if (i in t)
				fun.call(thisArg, t[i], i, t);
	};
}


if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP ? this : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}


//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc){
  if(win.addEventListener) return;   //No need to polyfill

  function docHijack(p){
    var old = doc[p];
    doc[p] = function(v){
      return addListen(old(v));
    };
  }

  function addEvent(on, fn, self){
    return (self = this).attachEvent('on' + on, function(e){
      e = e || win.event;
      e.preventDefault  = e.preventDefault  || function(){e.returnValue = false;};
      e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true;};
      fn.call(self, e);
    });
  }

  function addListen(obj, i){
    i = obj.length;
    if(i) while(i--) obj[i].addEventListener = addEvent;
    else obj.addEventListener = addEvent;
    return obj;
  }

  addListen([doc, win]);
  if('Element' in win)win.Element.prototype.addEventListener = addEvent;      //IE8
  else{                                     //IE < 8
    doc.attachEvent('onreadystatechange', function(){addListen(doc.all);});    //Make sure we also init at domReady
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(doc.all); 
  }
})(window, document);