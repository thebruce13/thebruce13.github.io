/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.3.1
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	  /*
	   * variables
	   */

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // cache document.documentElement
	  var doc = document.documentElement;

	  // form input types
	  var formInputs = ['input', 'select', 'textarea'];

	  var functionList = [];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [16, // shift
	  17, // control
	  18, // alt
	  91, // Windows key / left Apple cmd
	  93 // Windows menu / right Apple cmd
	  ];

	  // list of keys for which we change intent even for form inputs
	  var changeIntentMap = [9 // tab
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    keydown: 'keyboard',
	    keyup: 'keyboard',
	    mousedown: 'mouse',
	    mousemove: 'mouse',
	    MSPointerDown: 'pointer',
	    MSPointerMove: 'pointer',
	    pointerdown: 'pointer',
	    pointermove: 'pointer',
	    touchstart: 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer is active
	  var isBuffering = false;

	  // boolean: true if the page is being scrolled
	  var isScrolling = false;

	  // store current mouse position
	  var mousePos = {
	    x: null,
	    y: null
	  };

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  var supportsPassive = false;

	  try {
	    var opts = Object.defineProperty({}, 'passive', {
	      get: function get() {
	        supportsPassive = true;
	      }
	    });

	    window.addEventListener('test', null, opts);
	  } catch (e) {}

	  /*
	   * set up
	   */

	  var setUp = function setUp() {
	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };

	  /*
	   * events
	   */

	  var addListeners = function addListeners() {
	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately
	    var options = supportsPassive ? { passive: true } : false;

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      doc.addEventListener('pointerdown', updateInput);
	      doc.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      doc.addEventListener('MSPointerDown', updateInput);
	      doc.addEventListener('MSPointerMove', setIntent);
	    } else {
	      // mouse events
	      doc.addEventListener('mousedown', updateInput);
	      doc.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        doc.addEventListener('touchstart', touchBuffer, options);
	        doc.addEventListener('touchend', touchBuffer);
	      }
	    }

	    // mouse wheel
	    doc.addEventListener(detectWheel(), setIntent, options);

	    // keyboard events
	    doc.addEventListener('keydown', updateInput);
	    doc.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function updateInput(event) {
	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentInput !== value || currentIntent !== value) {
	        var activeElem = document.activeElement;
	        var activeInput = false;
	        var notFormInput = activeElem && activeElem.nodeName && formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1;

	        if (notFormInput || changeIntentMap.indexOf(eventKey) !== -1) {
	          activeInput = true;
	        }

	        if (value === 'touch' ||
	        // ignore mouse modifier keys
	        value === 'mouse' ||
	        // don't switch if the current element is a form input
	        value === 'keyboard' && eventKey && activeInput && ignoreMap.indexOf(eventKey) === -1) {
	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function setInput() {
	    doc.setAttribute('data-whatinput', currentInput);
	    doc.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      doc.className += ' whatinput-types-' + currentInput;
	    }

	    fireFunctions('input');
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function setIntent(event) {
	    // test to see if `mousemove` happened relative to the screen
	    // to detect scrolling versus mousemove
	    if (mousePos['x'] !== event.screenX || mousePos['y'] !== event.screenY) {
	      isScrolling = false;

	      mousePos['x'] = event.screenX;
	      mousePos['y'] = event.screenY;
	    } else {
	      isScrolling = true;
	    }

	    // only execute if the touch buffer timer isn't running
	    // or scrolling isn't happening
	    if (!isBuffering && !isScrolling) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        doc.setAttribute('data-whatintent', currentIntent);

	        fireFunctions('intent');
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function touchBuffer(event) {
	    if (event.type === 'touchstart') {
	      isBuffering = false;

	      // set the current input
	      updateInput(event);
	    } else {
	      isBuffering = true;
	    }
	  };

	  var fireFunctions = function fireFunctions(type) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].type === type) {
	        functionList[i].fn.call(undefined, currentIntent);
	      }
	    }
	  };

	  /*
	   * utilities
	   */

	  var pointerType = function pointerType(event) {
	    if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	    } else {
	      // treat pen like touch
	      return event.pointerType === 'pen' ? 'touch' : event.pointerType;
	    }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function detectWheel() {
	    var wheelType = void 0;

	    // Modern browsers support "wheel"
	    if ('onwheel' in document.createElement('div')) {
	      wheelType = 'wheel';
	    } else {
	      // Webkit and IE support at least "mousewheel"
	      // or assume that remaining browsers are older Firefox
	      wheelType = document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	    }

	    return wheelType;
	  };

	  var objPos = function objPos(match) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].fn === match) {
	        return i;
	      }
	    }
	  };

	  /*
	   * init
	   */

	  // don't start script unless browser cuts the mustard
	  // (also passes if polyfills are used)
	  if ('addEventListener' in window && Array.prototype.indexOf) {
	    setUp();
	  }

	  /*
	   * api
	   */

	  return {
	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function ask(opt) {
	      return opt === 'loose' ? currentIntent : currentInput;
	    },

	    // returns array: all the detected input types
	    types: function types() {
	      return inputTypes;
	    },

	    // overwrites ignored keys with provided array
	    ignoreKeys: function ignoreKeys(arr) {
	      ignoreMap = arr;
	    },

	    // attach functions to input and intent "events"
	    // funct: function to fire on change
	    // eventType: 'input'|'intent'
	    registerOnChange: function registerOnChange(fn, eventType) {
	      functionList.push({
	        fn: fn,
	        type: eventType || 'input'
	      });
	    },

	    unRegisterOnChange: function unRegisterOnChange(fn) {
	      var position = objPos(fn);

	      if (position) {
	        functionList.splice(position, 1);
	      }
	    }
	  };
	}();

/***/ }
/******/ ])
});
;
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! lazysizes - v3.0.0 */
!function (a, b) {
  var c = b(a, a.document);a.lazySizes = c, "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = c);
}(window, function (a, b) {
  "use strict";
  if (b.getElementsByClassName) {
    var c,
        d = b.documentElement,
        e = a.Date,
        f = a.HTMLPictureElement,
        g = "addEventListener",
        h = "getAttribute",
        i = a[g],
        j = a.setTimeout,
        k = a.requestAnimationFrame || j,
        l = a.requestIdleCallback,
        m = /^picture$/i,
        n = ["load", "error", "lazyincluded", "_lazyloaded"],
        o = {},
        p = Array.prototype.forEach,
        q = function q(a, b) {
      return o[b] || (o[b] = new RegExp("(\\s|^)" + b + "(\\s|$)")), o[b].test(a[h]("class") || "") && o[b];
    },
        r = function r(a, b) {
      q(a, b) || a.setAttribute("class", (a[h]("class") || "").trim() + " " + b);
    },
        s = function s(a, b) {
      var c;(c = q(a, b)) && a.setAttribute("class", (a[h]("class") || "").replace(c, " "));
    },
        t = function t(a, b, c) {
      var d = c ? g : "removeEventListener";c && t(a, b), n.forEach(function (c) {
        a[d](c, b);
      });
    },
        u = function u(a, c, d, e, f) {
      var g = b.createEvent("CustomEvent");return g.initCustomEvent(c, !e, !f, d || {}), a.dispatchEvent(g), g;
    },
        v = function v(b, d) {
      var e;!f && (e = a.picturefill || c.pf) ? e({ reevaluate: !0, elements: [b] }) : d && d.src && (b.src = d.src);
    },
        w = function w(a, b) {
      return (getComputedStyle(a, null) || {})[b];
    },
        x = function x(a, b, d) {
      for (d = d || a.offsetWidth; d < c.minSize && b && !a._lazysizesWidth;) {
        d = b.offsetWidth, b = b.parentNode;
      }return d;
    },
        y = function () {
      var a,
          c,
          d = [],
          e = [],
          f = d,
          g = function g() {
        var b = f;for (f = d.length ? e : d, a = !0, c = !1; b.length;) {
          b.shift()();
        }a = !1;
      },
          h = function h(d, e) {
        a && !e ? d.apply(this, arguments) : (f.push(d), c || (c = !0, (b.hidden ? j : k)(g)));
      };return h._lsFlush = g, h;
    }(),
        z = function z(a, b) {
      return b ? function () {
        y(a);
      } : function () {
        var b = this,
            c = arguments;y(function () {
          a.apply(b, c);
        });
      };
    },
        A = function A(a) {
      var b,
          c = 0,
          d = 125,
          f = 666,
          g = f,
          h = function h() {
        b = !1, c = e.now(), a();
      },
          i = l ? function () {
        l(h, { timeout: g }), g !== f && (g = f);
      } : z(function () {
        j(h);
      }, !0);return function (a) {
        var f;(a = a === !0) && (g = 44), b || (b = !0, f = d - (e.now() - c), 0 > f && (f = 0), a || 9 > f && l ? i() : j(i, f));
      };
    },
        B = function B(a) {
      var b,
          c,
          d = 99,
          f = function f() {
        b = null, a();
      },
          g = function g() {
        var a = e.now() - c;d > a ? j(g, d - a) : (l || f)(f);
      };return function () {
        c = e.now(), b || (b = j(g, d));
      };
    },
        C = function () {
      var f,
          k,
          l,
          n,
          o,
          x,
          C,
          E,
          F,
          G,
          H,
          I,
          J,
          K,
          L,
          M = /^img$/i,
          N = /^iframe$/i,
          O = "onscroll" in a && !/glebot/.test(navigator.userAgent),
          P = 0,
          Q = 0,
          R = 0,
          S = -1,
          T = function T(a) {
        R--, a && a.target && t(a.target, T), (!a || 0 > R || !a.target) && (R = 0);
      },
          U = function U(a, c) {
        var e,
            f = a,
            g = "hidden" == w(b.body, "visibility") || "hidden" != w(a, "visibility");for (F -= c, I += c, G -= c, H += c; g && (f = f.offsetParent) && f != b.body && f != d;) {
          g = (w(f, "opacity") || 1) > 0, g && "visible" != w(f, "overflow") && (e = f.getBoundingClientRect(), g = H > e.left && G < e.right && I > e.top - 1 && F < e.bottom + 1);
        }return g;
      },
          V = function V() {
        var a, e, g, i, j, m, n, p, q;if ((o = c.loadMode) && 8 > R && (a = f.length)) {
          e = 0, S++, null == K && ("expand" in c || (c.expand = d.clientHeight > 500 && d.clientWidth > 500 ? 500 : 370), J = c.expand, K = J * c.expFactor), K > Q && 1 > R && S > 2 && o > 2 && !b.hidden ? (Q = K, S = 0) : Q = o > 1 && S > 1 && 6 > R ? J : P;for (; a > e; e++) {
            if (f[e] && !f[e]._lazyRace) if (O) {
              if ((p = f[e][h]("data-expand")) && (m = 1 * p) || (m = Q), q !== m && (C = innerWidth + m * L, E = innerHeight + m, n = -1 * m, q = m), g = f[e].getBoundingClientRect(), (I = g.bottom) >= n && (F = g.top) <= E && (H = g.right) >= n * L && (G = g.left) <= C && (I || H || G || F) && (l && 3 > R && !p && (3 > o || 4 > S) || U(f[e], m))) {
                if (ba(f[e]), j = !0, R > 9) break;
              } else !j && l && !i && 4 > R && 4 > S && o > 2 && (k[0] || c.preloadAfterLoad) && (k[0] || !p && (I || H || G || F || "auto" != f[e][h](c.sizesAttr))) && (i = k[0] || f[e]);
            } else ba(f[e]);
          }i && !j && ba(i);
        }
      },
          W = A(V),
          X = function X(a) {
        r(a.target, c.loadedClass), s(a.target, c.loadingClass), t(a.target, Z);
      },
          Y = z(X),
          Z = function Z(a) {
        Y({ target: a.target });
      },
          $ = function $(a, b) {
        try {
          a.contentWindow.location.replace(b);
        } catch (c) {
          a.src = b;
        }
      },
          _ = function _(a) {
        var b,
            d,
            e = a[h](c.srcsetAttr);(b = c.customMedia[a[h]("data-media") || a[h]("media")]) && a.setAttribute("media", b), e && a.setAttribute("srcset", e), b && (d = a.parentNode, d.insertBefore(a.cloneNode(), a), d.removeChild(a));
      },
          aa = z(function (a, b, d, e, f) {
        var g, i, k, l, o, q;(o = u(a, "lazybeforeunveil", b)).defaultPrevented || (e && (d ? r(a, c.autosizesClass) : a.setAttribute("sizes", e)), i = a[h](c.srcsetAttr), g = a[h](c.srcAttr), f && (k = a.parentNode, l = k && m.test(k.nodeName || "")), q = b.firesLoad || "src" in a && (i || g || l), o = { target: a }, q && (t(a, T, !0), clearTimeout(n), n = j(T, 2500), r(a, c.loadingClass), t(a, Z, !0)), l && p.call(k.getElementsByTagName("source"), _), i ? a.setAttribute("srcset", i) : g && !l && (N.test(a.nodeName) ? $(a, g) : a.src = g), (i || l) && v(a, { src: g })), a._lazyRace && delete a._lazyRace, s(a, c.lazyClass), y(function () {
          (!q || a.complete && a.naturalWidth > 1) && (q ? T(o) : R--, X(o));
        }, !0);
      }),
          ba = function ba(a) {
        var b,
            d = M.test(a.nodeName),
            e = d && (a[h](c.sizesAttr) || a[h]("sizes")),
            f = "auto" == e;(!f && l || !d || !a.src && !a.srcset || a.complete || q(a, c.errorClass)) && (b = u(a, "lazyunveilread").detail, f && D.updateElem(a, !0, a.offsetWidth), a._lazyRace = !0, R++, aa(a, b, f, e, d));
      },
          ca = function ca() {
        if (!l) {
          if (e.now() - x < 999) return void j(ca, 999);var a = B(function () {
            c.loadMode = 3, W();
          });l = !0, c.loadMode = 3, W(), i("scroll", function () {
            3 == c.loadMode && (c.loadMode = 2), a();
          }, !0);
        }
      };return { _: function _() {
          x = e.now(), f = b.getElementsByClassName(c.lazyClass), k = b.getElementsByClassName(c.lazyClass + " " + c.preloadClass), L = c.hFac, i("scroll", W, !0), i("resize", W, !0), a.MutationObserver ? new MutationObserver(W).observe(d, { childList: !0, subtree: !0, attributes: !0 }) : (d[g]("DOMNodeInserted", W, !0), d[g]("DOMAttrModified", W, !0), setInterval(W, 999)), i("hashchange", W, !0), ["focus", "mouseover", "click", "load", "transitionend", "animationend", "webkitAnimationEnd"].forEach(function (a) {
            b[g](a, W, !0);
          }), /d$|^c/.test(b.readyState) ? ca() : (i("load", ca), b[g]("DOMContentLoaded", W), j(ca, 2e4)), f.length ? (V(), y._lsFlush()) : W();
        }, checkElems: W, unveil: ba };
    }(),
        D = function () {
      var a,
          d = z(function (a, b, c, d) {
        var e, f, g;if (a._lazysizesWidth = d, d += "px", a.setAttribute("sizes", d), m.test(b.nodeName || "")) for (e = b.getElementsByTagName("source"), f = 0, g = e.length; g > f; f++) {
          e[f].setAttribute("sizes", d);
        }c.detail.dataAttr || v(a, c.detail);
      }),
          e = function e(a, b, c) {
        var e,
            f = a.parentNode;f && (c = x(a, f, c), e = u(a, "lazybeforesizes", { width: c, dataAttr: !!b }), e.defaultPrevented || (c = e.detail.width, c && c !== a._lazysizesWidth && d(a, f, e, c)));
      },
          f = function f() {
        var b,
            c = a.length;if (c) for (b = 0; c > b; b++) {
          e(a[b]);
        }
      },
          g = B(f);return { _: function _() {
          a = b.getElementsByClassName(c.autosizesClass), i("resize", g);
        }, checkElems: g, updateElem: e };
    }(),
        E = function E() {
      E.i || (E.i = !0, D._(), C._());
    };return function () {
      var b,
          d = { lazyClass: "lazyload", loadedClass: "lazyloaded", loadingClass: "lazyloading", preloadClass: "lazypreload", errorClass: "lazyerror", autosizesClass: "lazyautosizes", srcAttr: "data-src", srcsetAttr: "data-srcset", sizesAttr: "data-sizes", minSize: 40, customMedia: {}, init: !0, expFactor: 1.5, hFac: .8, loadMode: 2 };c = a.lazySizesConfig || a.lazysizesConfig || {};for (b in d) {
        b in c || (c[b] = d[b]);
      }a.lazySizesConfig = c, j(function () {
        c.init && E();
      });
    }(), { cfg: c, autoSizer: D, loader: C, init: E, uP: v, aC: r, rC: s, hC: q, fire: u, gW: x, rAF: y };
  }
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.6.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var Slick = window.Slick || {};

    Slick = function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function customPaging(slider, i) {
                    return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.registerBreakpoints();
            _.init(true);
        }

        return Slick;
    }();

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });
    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof index === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }

        _.unload();

        if (typeof index === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function step(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' + now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' + now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function complete() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;
    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && (typeof asNavFor === 'undefined' ? 'undefined' : _typeof(asNavFor)) === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }
    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }
    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
                    _.direction = 0;
                } else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }
                }
            }

            _.slideHandler(slideTo);
        }
    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                }
            } else {

                _.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
                    'aria-disabled': 'true',
                    'tabindex': '-1'
                });
            }
        }
    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i,
            dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');
        }
    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }
    };

    Slick.prototype.buildRows = function () {

        var _ = this,
            a,
            b,
            c,
            newSlides,
            numOfSlides,
            originalSlides,
            slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children().css({
                'width': 100 / _.options.slidesPerRow + '%',
                'display': 'inline-block'
            });
        }
    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint,
            targetBreakpoint,
            respondToWidth,
            triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint = targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }
    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset,
            slideOffset,
            unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }
    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables,
            prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,
            originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }
    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }
    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }

        if (_.$slides) {

            _.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
                $(this).attr('style', $(this).data('originalStyling'));
            });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }
    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }
        }
    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });
        }
    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        _.$slider.off('focus.slick blur.slick').on('focus.slick blur.slick', '*:not(.slick-arrow)', function (event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function () {

                if (_.options.pauseOnFocus) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }
            }, 0);
        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;
    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;
    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                verticalOffset = verticalHeight * _.options.slidesToShow * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;
    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];
    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;
    };

    Slick.prototype.getSlick = function () {

        return this;
    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed,
            swipedSlide,
            centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;
        } else {
            return _.options.slidesToScroll;
        }
    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);
    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();
        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();
        }
    };

    Slick.prototype.initADA = function () {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            }).first().attr('aria-selected', 'true').end().find('button').attr('role', 'button').end().closest('div').attr('role', 'toolbar');
        }
        _.activateADA();
    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.off('click.slick').on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.off('click.slick').on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }
    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true) {

            $('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();
        }
    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }
    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange,
            cloneRange,
            rangeStart,
            rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image.animate({ opacity: 0 }, 100, function () {
                        image.attr('src', imageSource).animate({ opacity: 1 }, 200, function () {
                            image.removeAttr('data-lazy').removeClass('slick-loading');
                        });
                        _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                    });
                };

                imageToLoad.onerror = function () {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);
                };

                imageToLoad.src = imageSource;
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }
    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }
    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });
    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();
    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;
    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;
    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            _.setPosition();

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();
            }
        }
    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });
    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                image.attr('src', imageSource).removeAttr('data-lazy').removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();
            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);
                } else {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();
                }
            };

            imageToLoad.src = imageSource;
        } else {

            _.$slider.trigger('allImagesLoaded', [_]);
        }
    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this,
            currentSlide,
            lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);
        }
    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this,
            breakpoint,
            currentBreakpoint,
            l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
                }
            }

            _.breakpoints.sort(function (a, b) {
                return _.options.mobileFirst ? a - b : b - a;
            });
        }
    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);
    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof index === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x,
            y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }
    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: '0px ' + _.options.centerPadding
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + ' 0px'
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();

        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });
    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }
    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this,
            l,
            item,
            option,
            value,
            refresh = false,
            type;

        if ($.type(arguments[0]) === 'object') {

            option = arguments[0];
            refresh = arguments[1];
            type = 'multiple';
        } else if ($.type(arguments[0]) === 'string') {

            option = arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                type = 'responsive';
            } else if (typeof arguments[1] !== 'undefined') {

                type = 'single';
            }
        }

        if (type === 'single') {

            _.options[option] = value;
        } else if (type === 'multiple') {

            $.each(option, function (opt, val) {

                _.options[opt] = val;
            });
        } else if (type === 'responsive') {

            for (item in value) {

                if ($.type(_.options.responsive) !== 'array') {

                    _.options.responsive = [value[item]];
                } else {

                    l = _.options.responsive.length - 1;

                    // loop through the responsive object and splice out duplicates.
                    while (l >= 0) {

                        if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                            _.options.responsive.splice(l, 1);
                        }

                        l--;
                    }

                    _.options.responsive.push(value[item]);
                }
            }
        }

        if (refresh) {

            _.unload();
            _.reinit();
        }
    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);
    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
    };

    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset,
            allSlides,
            indexOffset,
            remainder;

        allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

        _.$slides.eq(index).addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {

                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                }

                if (index === 0) {

                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {

                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }
            }

            _.$slides.eq(index).addClass('slick-center');
        } else {

            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {

                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides.addClass('slick-active').attr('aria-hidden', 'false');
            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {

                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                }
            }
        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i,
            slideIndex,
            infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });
            }
        }
    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;
        }

        _.slideHandler(index);
    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide,
            animSlide,
            oldSlide,
            slideLeft,
            targetLeft = null,
            _ = this,
            navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }
        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }
    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();
        }

        _.$slider.addClass('slick-loading');
    };

    Slick.prototype.swipeDirection = function () {

        var xDist,
            yDist,
            r,
            swipeAngle,
            _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? 'right' : 'left';
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';
    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.interrupted = false;
        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:

            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);
            }
        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }
    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft,
            swipeDirection,
            swipeLength,
            positionOffset,
            touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }

        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);
    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;
    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();
    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            }
        }
    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active').attr('aria-hidden', 'true');

            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr('aria-hidden', 'false');
        }
    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;
            } else {

                _.interrupted = false;
            }
        }
    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
"use strict";
!function (t) {
  function e(t, e, o, i) {
    var s,
        h,
        n,
        w,
        d = f(t);if (e) {
      var r = f(e);h = d.offset.top + d.height <= r.height + r.offset.top, s = d.offset.top >= r.offset.top, n = d.offset.left >= r.offset.left, w = d.offset.left + d.width <= r.width + r.offset.left;
    } else h = d.offset.top + d.height <= d.windowDims.height + d.windowDims.offset.top, s = d.offset.top >= d.windowDims.offset.top, n = d.offset.left >= d.windowDims.offset.left, w = d.offset.left + d.width <= d.windowDims.width;var l = [h, s, n, w];return o ? n === w == !0 : i ? s === h == !0 : l.indexOf(!1) === -1;
  }function f(t, e) {
    if (t = t.length ? t[0] : t, t === window || t === document) throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");var f = t.getBoundingClientRect(),
        o = t.parentNode.getBoundingClientRect(),
        i = document.body.getBoundingClientRect(),
        s = window.pageYOffset,
        h = window.pageXOffset;return { width: f.width, height: f.height, offset: { top: f.top + s, left: f.left + h }, parentDims: { width: o.width, height: o.height, offset: { top: o.top + s, left: o.left + h } }, windowDims: { width: i.width, height: i.height, offset: { top: s, left: h } } };
  }function o(t, e, o, i, s, h) {
    var n = f(t),
        w = e ? f(e) : null;switch (o) {case "top":
        return { left: Foundation.rtl() ? w.offset.left - n.width + w.width : w.offset.left, top: w.offset.top - (n.height + i) };case "left":
        return { left: w.offset.left - (n.width + s), top: w.offset.top };case "right":
        return { left: w.offset.left + w.width + s, top: w.offset.top };case "center top":
        return { left: w.offset.left + w.width / 2 - n.width / 2, top: w.offset.top - (n.height + i) };case "center bottom":
        return { left: h ? s : w.offset.left + w.width / 2 - n.width / 2, top: w.offset.top + w.height + i };case "center left":
        return { left: w.offset.left - (n.width + s), top: w.offset.top + w.height / 2 - n.height / 2 };case "center right":
        return { left: w.offset.left + w.width + s + 1, top: w.offset.top + w.height / 2 - n.height / 2 };case "center":
        return { left: n.windowDims.offset.left + n.windowDims.width / 2 - n.width / 2, top: n.windowDims.offset.top + n.windowDims.height / 2 - n.height / 2 };case "reveal":
        return { left: (n.windowDims.width - n.width) / 2, top: n.windowDims.offset.top + i };case "reveal full":
        return { left: n.windowDims.offset.left, top: n.windowDims.offset.top };case "left bottom":
        return { left: w.offset.left, top: w.offset.top + w.height + i };case "right bottom":
        return { left: w.offset.left + w.width + s - n.width, top: w.offset.top + w.height + i };default:
        return { left: Foundation.rtl() ? w.offset.left - n.width + w.width : w.offset.left + s, top: w.offset.top + w.height + i };}
  }Foundation.Box = { ImNotTouchingYou: e, GetDimensions: f, GetOffsets: o };
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },

    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },

    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },

    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },

    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
"use strict";
!function (e) {
  function n(e) {
    var n = {};for (var t in e) {
      n[e[t]] = e[t];
    }return n;
  }var t = { 9: "TAB", 13: "ENTER", 27: "ESCAPE", 32: "SPACE", 37: "ARROW_LEFT", 38: "ARROW_UP", 39: "ARROW_RIGHT", 40: "ARROW_DOWN" },
      o = {},
      r = { keys: n(t), parseKey: function parseKey(e) {
      var n = t[e.which || e.keyCode] || String.fromCharCode(e.which).toUpperCase();return n = n.replace(/\W+/, ""), e.shiftKey && (n = "SHIFT_" + n), e.ctrlKey && (n = "CTRL_" + n), e.altKey && (n = "ALT_" + n), n = n.replace(/_$/, "");
    }, handleKey: function handleKey(n, t, r) {
      var a,
          i,
          d,
          f = o[t],
          u = this.parseKey(n);if (!f) return console.warn("Component not defined!");if (a = "undefined" == typeof f.ltr ? f : Foundation.rtl() ? e.extend({}, f.ltr, f.rtl) : e.extend({}, f.rtl, f.ltr), i = a[u], d = r[i], d && "function" == typeof d) {
        var l = d.apply();(r.handled || "function" == typeof r.handled) && r.handled(l);
      } else (r.unhandled || "function" == typeof r.unhandled) && r.unhandled();
    }, findFocusable: function findFocusable(n) {
      return !!n && n.find("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]").filter(function () {
        return !(!e(this).is(":visible") || e(this).attr("tabindex") < 0);
      });
    }, register: function register(e, n) {
      o[e] = n;
    }, trapFocus: function trapFocus(e) {
      var n = Foundation.Keyboard.findFocusable(e),
          t = n.eq(0),
          o = n.eq(-1);e.on("keydown.zf.trapfocus", function (e) {
        e.target === o[0] && "TAB" === Foundation.Keyboard.parseKey(e) ? (e.preventDefault(), t.focus()) : e.target === t[0] && "SHIFT_TAB" === Foundation.Keyboard.parseKey(e) && (e.preventDefault(), o.focus());
      });
    }, releaseFocus: function releaseFocus(e) {
      e.off("keydown.zf.trapfocus");
    } };Foundation.Keyboard = r;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (e) {
  function t(e) {
    var t = {};return "string" != typeof e ? t : (e = e.trim().slice(1, -1)) ? t = e.split("&").reduce(function (e, t) {
      var n = t.replace(/\+/g, " ").split("="),
          r = n[0],
          i = n[1];return r = decodeURIComponent(r), i = void 0 === i ? null : decodeURIComponent(i), e.hasOwnProperty(r) ? Array.isArray(e[r]) ? e[r].push(i) : e[r] = [e[r], i] : e[r] = i, e;
    }, {}) : t;
  }var n = { queries: [], current: "", _init: function _init() {
      var n,
          r = this,
          i = e(".foundation-mq").css("font-family");n = t(i);for (var a in n) {
        n.hasOwnProperty(a) && r.queries.push({ name: a, value: "only screen and (min-width: " + n[a] + ")" });
      }this.current = this._getCurrentSize(), this._watcher();
    }, atLeast: function atLeast(e) {
      var t = this.get(e);return !!t && window.matchMedia(t).matches;
    }, is: function is(e) {
      return e = e.trim().split(" "), e.length > 1 && "only" === e[1] ? e[0] === this._getCurrentSize() : this.atLeast(e[0]);
    }, get: function get(e) {
      for (var t in this.queries) {
        if (this.queries.hasOwnProperty(t)) {
          var n = this.queries[t];if (e === n.name) return n.value;
        }
      }return null;
    }, _getCurrentSize: function _getCurrentSize() {
      for (var e, t = 0; t < this.queries.length; t++) {
        var n = this.queries[t];window.matchMedia(n.value).matches && (e = n);
      }return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) ? e.name : e;
    }, _watcher: function _watcher() {
      var t = this;e(window).on("resize.zf.mediaquery", function () {
        var n = t._getCurrentSize(),
            r = t.current;n !== r && (t.current = n, e(window).trigger("changed.zf.mediaquery", [n, r]));
      });
    } };Foundation.MediaQuery = n, window.matchMedia || (window.matchMedia = function () {
    var e = window.styleMedia || window.media;if (!e) {
      var t = document.createElement("style"),
          n = document.getElementsByTagName("script")[0],
          r = null;t.type = "text/css", t.id = "matchmediajs-test", n && n.parentNode && n.parentNode.insertBefore(t, n), r = "getComputedStyle" in window && window.getComputedStyle(t, null) || t.currentStyle, e = { matchMedium: function matchMedium(e) {
          var n = "@media " + e + "{ #matchmediajs-test { width: 1px; } }";return t.styleSheet ? t.styleSheet.cssText = n : t.textContent = n, "1px" === r.width;
        } };
    }return function (t) {
      return { matches: e.matchMedium(t || "all"), media: t || "all" };
    };
  }()), Foundation.MediaQuery = n;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
"use strict";
!function (n) {
  function i(n, i, e) {
    function t(s) {
      r || (r = s), o = s - r, e.apply(i), o < n ? a = window.requestAnimationFrame(t, i) : (window.cancelAnimationFrame(a), i.trigger("finished.zf.animate", [i]).triggerHandler("finished.zf.animate", [i]));
    }var a,
        o,
        r = null;return 0 === n ? (e.apply(i), void i.trigger("finished.zf.animate", [i]).triggerHandler("finished.zf.animate", [i])) : void (a = window.requestAnimationFrame(t));
  }function e(i, e, o, r) {
    function s() {
      i || e.hide(), u(), r && r.apply(e);
    }function u() {
      e[0].style.transitionDuration = 0, e.removeClass(d + " " + f + " " + o);
    }if (e = n(e).eq(0), e.length) {
      var d = i ? t[0] : t[1],
          f = i ? a[0] : a[1];u(), e.addClass(o).css("transition", "none"), requestAnimationFrame(function () {
        e.addClass(d), i && e.show();
      }), requestAnimationFrame(function () {
        e[0].offsetWidth, e.css("transition", "").addClass(f);
      }), e.one(Foundation.transitionend(e), s);
    }
  }var t = ["mui-enter", "mui-leave"],
      a = ["mui-enter-active", "mui-leave-active"],
      o = { animateIn: function animateIn(n, i, t) {
      e(!0, n, i, t);
    }, animateOut: function animateOut(n, i, t) {
      e(!1, n, i, t);
    } };Foundation.Move = i, Foundation.Motion = o;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
"use strict";
!function (e) {
  var a = { Feather: function Feather(a) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "zf";a.attr("role", "menubar");var n = a.find("li").attr({ role: "menuitem" }),
          i = "is-" + t + "-submenu",
          u = i + "-item",
          s = "is-" + t + "-submenu-parent";n.each(function () {
        var a = e(this),
            n = a.children("ul");n.length && (a.addClass(s).attr({ "aria-haspopup": !0, "aria-label": a.children("a:first").text() }), "drilldown" === t && a.attr({ "aria-expanded": !1 }), n.addClass("submenu " + i).attr({ "data-submenu": "", role: "menu" }), "drilldown" === t && n.attr({ "aria-hidden": !0 })), a.parent("[data-submenu]").length && a.addClass("is-submenu-item " + u);
      });
    }, Burn: function Burn(e, a) {
      var t = "is-" + a + "-submenu",
          n = t + "-item",
          i = "is-" + a + "-submenu-parent";e.find(">li, .menu, .menu > li").removeClass(t + " " + n + " " + i + " is-submenu-item submenu is-active").removeAttr("data-submenu").css("display", "");
    } };Foundation.Nest = a;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,

    //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
"use strict";
!function (t) {
  function e(t, e, i) {
    var a,
        s,
        n = this,
        r = e.duration,
        o = Object.keys(t.data())[0] || "timer",
        u = -1;this.isPaused = !1, this.restart = function () {
      u = -1, clearTimeout(s), this.start();
    }, this.start = function () {
      this.isPaused = !1, clearTimeout(s), u = u <= 0 ? r : u, t.data("paused", !1), a = Date.now(), s = setTimeout(function () {
        e.infinite && n.restart(), i && "function" == typeof i && i();
      }, u), t.trigger("timerstart.zf." + o);
    }, this.pause = function () {
      this.isPaused = !0, clearTimeout(s), t.data("paused", !0);var e = Date.now();u -= e - a, t.trigger("timerpaused.zf." + o);
    };
  }function i(e, i) {
    function a() {
      s--, 0 === s && i();
    }var s = e.length;0 === s && i(), e.each(function () {
      if (this.complete || 4 === this.readyState || "complete" === this.readyState) a();else {
        var e = t(this).attr("src");t(this).attr("src", e + (e.indexOf("?") >= 0 ? "&" : "?") + new Date().getTime()), t(this).one("load", function () {
          a();
        });
      }
    });
  }Foundation.Timer = e, Foundation.onImagesLoaded = i;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
"use strict";

!function (e) {
  function t() {
    this.removeEventListener("touchmove", n), this.removeEventListener("touchend", t), r = !1;
  }function n(n) {
    if (e.spotSwipe.preventDefault && n.preventDefault(), r) {
      var o,
          i = n.touches[0].pageX,
          c = (n.touches[0].pageY, s - i);h = new Date().getTime() - u, Math.abs(c) >= e.spotSwipe.moveThreshold && h <= e.spotSwipe.timeThreshold && (o = c > 0 ? "left" : "right"), o && (n.preventDefault(), t.call(this), e(this).trigger("swipe", o).trigger("swipe" + o));
    }
  }function o(e) {
    1 == e.touches.length && (s = e.touches[0].pageX, c = e.touches[0].pageY, r = !0, u = new Date().getTime(), this.addEventListener("touchmove", n, !1), this.addEventListener("touchend", t, !1));
  }function i() {
    this.addEventListener && this.addEventListener("touchstart", o, !1);
  }e.spotSwipe = { version: "1.0.0", enabled: "ontouchstart" in document.documentElement, preventDefault: !1, moveThreshold: 75, timeThreshold: 200 };var s,
      c,
      u,
      h,
      r = !1;e.event.special.swipe = { setup: i }, e.each(["left", "up", "down", "right"], function () {
    e.event.special["swipe" + this] = { setup: function setup() {
        e(this).on("swipe", e.noop);
      } };
  });
}(jQuery), !function (e) {
  e.fn.addTouch = function () {
    this.each(function (n, o) {
      e(o).bind("touchstart touchmove touchend touchcancel", function () {
        t(event);
      });
    });var t = function t(e) {
      var t,
          n = e.changedTouches,
          o = n[0],
          i = { touchstart: "mousedown", touchmove: "mousemove", touchend: "mouseup" },
          s = i[e.type];"MouseEvent" in window && "function" == typeof window.MouseEvent ? t = new window.MouseEvent(s, { bubbles: !0, cancelable: !0, screenX: o.screenX, screenY: o.screenY, clientX: o.clientX, clientY: o.clientY }) : (t = document.createEvent("MouseEvent"), t.initMouseEvent(s, !0, !0, window, 1, o.screenX, o.screenY, o.clientX, o.clientY, !1, !1, !1, !1, 0, null)), o.target.dispatchEvent(t);
    };
  };
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (t) {
  function e() {
    o(), a(), i(), n(), r();
  }function r(e) {
    var r = t("[data-yeti-box]"),
        a = ["dropdown", "tooltip", "reveal"];if (e && ("string" == typeof e ? a.push(e) : "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && "string" == typeof e[0] ? a.concat(e) : console.error("Plugin names must be strings")), r.length) {
      var i = a.map(function (t) {
        return "closeme.zf." + t;
      }).join(" ");t(window).off(i).on(i, function (e, r) {
        var a = e.namespace.split(".")[0],
            i = t("[data-" + a + "]").not('[data-yeti-box="' + r + '"]');i.each(function () {
          var e = t(this);e.triggerHandler("close.zf.trigger", [e]);
        });
      });
    }
  }function a(e) {
    var r = void 0,
        a = t("[data-resize]");a.length && t(window).off("resize.zf.trigger").on("resize.zf.trigger", function (i) {
      r && clearTimeout(r), r = setTimeout(function () {
        g || a.each(function () {
          t(this).triggerHandler("resizeme.zf.trigger");
        }), a.attr("data-events", "resize");
      }, e || 10);
    });
  }function i(e) {
    var r = void 0,
        a = t("[data-scroll]");a.length && t(window).off("scroll.zf.trigger").on("scroll.zf.trigger", function (i) {
      r && clearTimeout(r), r = setTimeout(function () {
        g || a.each(function () {
          t(this).triggerHandler("scrollme.zf.trigger");
        }), a.attr("data-events", "scroll");
      }, e || 10);
    });
  }function n(e) {
    var r = t("[data-mutate]");r.length && g && r.each(function () {
      t(this).triggerHandler("mutateme.zf.trigger");
    });
  }function o() {
    if (!g) return !1;var e = document.querySelectorAll("[data-resize], [data-scroll], [data-mutate]"),
        r = function r(e) {
      var r = t(e[0].target);switch (e[0].type) {case "attributes":
          "scroll" === r.attr("data-events") && "data-events" === e[0].attributeName && r.triggerHandler("scrollme.zf.trigger", [r, window.pageYOffset]), "resize" === r.attr("data-events") && "data-events" === e[0].attributeName && r.triggerHandler("resizeme.zf.trigger", [r]), "style" === e[0].attributeName && (r.closest("[data-mutate]").attr("data-events", "mutate"), r.closest("[data-mutate]").triggerHandler("mutateme.zf.trigger", [r.closest("[data-mutate]")]));break;case "childList":
          r.closest("[data-mutate]").attr("data-events", "mutate"), r.closest("[data-mutate]").triggerHandler("mutateme.zf.trigger", [r.closest("[data-mutate]")]);break;default:
          return !1;}
    };if (e.length) for (var a = 0; a <= e.length - 1; a++) {
      var i = new g(r);i.observe(e[a], { attributes: !0, childList: !0, characterData: !1, subtree: !0, attributeFilter: ["data-events", "style"] });
    }
  }var g = function () {
    for (var t = ["WebKit", "Moz", "O", "Ms", ""], e = 0; e < t.length; e++) {
      if (t[e] + "MutationObserver" in window) return window[t[e] + "MutationObserver"];
    }return !1;
  }(),
      s = function s(e, r) {
    e.data(r).split(" ").forEach(function (a) {
      t("#" + a)["close" === r ? "trigger" : "triggerHandler"](r + ".zf.trigger", [e]);
    });
  };t(document).on("click.zf.trigger", "[data-open]", function () {
    s(t(this), "open");
  }), t(document).on("click.zf.trigger", "[data-close]", function () {
    var e = t(this).data("close");e ? s(t(this), "close") : t(this).trigger("close.zf.trigger");
  }), t(document).on("click.zf.trigger", "[data-toggle]", function () {
    var e = t(this).data("toggle");e ? s(t(this), "toggle") : t(this).trigger("toggle.zf.trigger");
  }), t(document).on("close.zf.trigger", "[data-closable]", function (e) {
    e.stopPropagation();var r = t(this).data("closable");"" !== r ? Foundation.Motion.animateOut(t(this), r, function () {
      t(this).trigger("closed.zf");
    }) : t(this).fadeOut().trigger("closed.zf");
  }), t(document).on("focus.zf.trigger blur.zf.trigger", "[data-toggle-focus]", function () {
    var e = t(this).data("toggle-focus");t("#" + e).triggerHandler("toggle.zf.trigger", [t(this)]);
  }), t(window).on("load", function () {
    e();
  }), Foundation.IHearYou = e;
}(jQuery);
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Abide(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */

    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.validateOnBlur) {
          this.$inputs.off('blur.zf.abide').on('blur.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Get the set of labels associated with a set of radio els in this order
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findRadioLabels',
      value: function findRadioLabels($els) {
        var _this3 = this;

        var labels = $els.map(function (i, el) {
          var id = el.id;
          var $label = _this3.$element.find('label[for="' + id + '"]');

          if (!$label.length) {
            $label = $(el).closest('label');
          }
          return $label[0];
        });

        return $(labels);
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Remove CSS error classes etc from an entire radio button group
       * @param {String} groupName - A string that specifies the name of a radio button group
       *
       */

    }, {
      key: 'removeRadioErrorClasses',
      value: function removeRadioErrorClasses(groupName) {
        var $els = this.$element.find(':radio[name="' + groupName + '"]');
        var $labels = this.findRadioLabels($els);
        var $formErrors = this.findFormError($els);

        if ($labels.length) {
          $labels.removeClass(this.options.labelErrorClass);
        }

        if ($formErrors.length) {
          $formErrors.removeClass(this.options.formErrorClass);
        }

        $els.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        // radios need to clear all of the els
        if ($el[0].type == 'radio') {
          return this.removeRadioErrorClasses($el.attr('name'));
        }

        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type. 
       * Ignores inputs with data-abide-ignore, type="hidden" or disabled attributes set
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var _this4 = this;

        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        // don't validate ignored inputs or hidden inputs or disabled inputs
        if ($el.is('[data-abide-ignore]') || $el.is('[type="hidden"]') || $el.is('[disabled]')) {
          return true;
        }

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        if (goodToGo) {
          // Re-validate inputs that depend on this one with equalto
          var dependentElements = this.$element.find('[data-equalto="' + $el.attr('id') + '"]');
          if (dependentElements.length) {
            (function () {
              var _this = _this4;
              dependentElements.each(function () {
                if ($(this).val()) {
                  _this.validateInput($(this));
                }
              });
            })();
          }
        }

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // A pattern can be passed to this function, or it will be infered from the input's "pattern" attribute, or it's "type" attribute
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();
        var valid = false;

        if (inputText.length) {
          // If the pattern attribute on the element is in Abide's list of patterns, then test that regexp
          if (this.options.patterns.hasOwnProperty(pattern)) {
            valid = this.options.patterns[pattern].test(inputText);
          }
          // If the pattern name isn't also the type attribute of the field, then test it as a regexp
          else if (pattern !== $el.attr('type')) {
              valid = new RegExp(pattern).test(inputText);
            } else {
              valid = true;
            }
        }
        // An empty field is valid if it's not required
        else if (!$el.prop('required')) {
            valid = true;
          }

        return valid;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected. Although the function targets a single `<input>`, it validates by checking the `required` and `checked` properties of all radio buttons in its group.
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        // If at least one radio in the group has the `required` attribute, the group is considered required
        // Per W3C spec, all radio buttons in a group should have `required`, but we're being nice
        var $group = this.$element.find(':radio[name="' + groupName + '"]');
        var valid = false,
            required = false;

        // For the group to be required, at least one radio needs to be required
        $group.each(function (i, e) {
          if ($(e).attr('required')) {
            required = true;
          }
        });
        if (!required) valid = true;

        if (!valid) {
          // For the group to be valid, at least one radio needs to be checked
          $group.each(function (i, e) {
            if ($(e).prop('checked')) {
              valid = true;
            }
          });
        };

        return valid;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this5 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this5.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, :radio, :checkbox, [data-abide-ignore]').val('').removeAttr('data-invalid');
        $(':input:radio', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        $(':input:checkbox', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */

  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @type {?string}
     * @default 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @type {string}
     * @default 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @type {string}
     * @default 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @type {string}
     * @default '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @type {string}
     * @default 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @type {boolean}
     * @default false
     */
    liveValidate: false,

    /**
     * Set to true to validate inputs on blur.
     * @option
     * @type {boolean}
     * @default false
     */
    validateOnBlur: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function equalTo(el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };

  // Window exports
  Foundation.plugin(Abide, 'Abide');
}(jQuery);
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

!function ($) {

  /**
   * DropdownMenu module.
   * @module foundation.dropdown-menu
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.nest
   */

  var DropdownMenu = function () {
    /**
     * Creates a new instance of DropdownMenu.
     * @class
     * @fires DropdownMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function DropdownMenu(element, options) {
      _classCallCheck(this, DropdownMenu);

      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the plugin, and calls _prepareMenu
     * @private
     * @function
     */

    _createClass(DropdownMenu, [{
      key: '_init',
      value: function _init() {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      }
    }, {
      key: '_isVertical',
      value: function _isVertical() {
        return this.$tabs.css('display') === 'block';
      }

      /**
       * Adds event listeners to elements within the menu
       * @private
       * @function
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
            parClass = 'is-dropdown-submenu-parent';

        // used for onClick and in the keyboard handlers
        var handleClickFn = function handleClickFn(e) {
          var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
              hasSub = $elem.hasClass(parClass),
              hasClicked = $elem.attr('data-is-click') === 'true',
              $sub = $elem.children('.is-dropdown-submenu');

          if (hasSub) {
            if (hasClicked) {
              if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
                return;
              } else {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this._hide($elem);
              }
            } else {
              e.preventDefault();
              e.stopImmediatePropagation();
              _this._show($sub);
              $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
            }
          }
        };

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
        }

        // Handle Leaf element Clicks
        if (_this.options.closeOnClickInside) {
          this.$menuItems.on('click.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (!hasSub) {
              _this._hide();
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay));
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
                return false;
              }

              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime));
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
              isTab = _this.$tabs.index($element) > -1,
              $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function nextSibling() {
            if (!$element.is(':last-child')) {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            }
          },
              prevSibling = function prevSibling() {
            $prevElement.children('a:first').focus();
            e.preventDefault();
          },
              openSub = function openSub() {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
              e.preventDefault();
            } else {
              return;
            }
          },
              closeSub = function closeSub() {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            e.preventDefault();
            //}
          };
          var functions = {
            open: openSub,
            close: function close() {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
              e.preventDefault();
            },
            handled: function handled() {
              e.stopImmediatePropagation();
            }
          };

          if (isTab) {
            if (_this._isVertical()) {
              // vertical menu
              if (Foundation.rtl()) {
                // right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub
                });
              } else {
                // left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub
                });
              }
            } else {
              // horizontal menu
              if (Foundation.rtl()) {
                // right aligned
                $.extend(functions, {
                  next: prevSibling,
                  previous: nextSibling,
                  down: openSub,
                  up: closeSub
                });
              } else {
                // left aligned
                $.extend(functions, {
                  next: nextSibling,
                  previous: prevSibling,
                  down: openSub,
                  up: closeSub
                });
              }
            }
          } else {
            // not tabs -> one sub
            if (Foundation.rtl()) {
              // right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling
              });
            } else {
              // left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling
              });
            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body),
            _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {
            return;
          }

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
       * Opens a dropdown pane, and checks for collisions first.
       * @param {jQuery} $sub - ul element that is a submenu to show
       * @function
       * @private
       * @fires DropdownMenu#show
       */

    }, {
      key: '_show',
      value: function _show($sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').parent('li.is-dropdown-submenu-parent').addClass('is-active');
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
              $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }
        /**
         * Fires when the new dropdown pane is visible.
         * @event DropdownMenu#show
         */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
       * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
       * @function
       * @param {jQuery} $elem - element with a submenu to hide
       * @param {Number} idx - index of the $tabs collection to hide
       * @private
       */

    }, {
      key: '_hide',
      value: function _hide($elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'data-is-click': false
          }).removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
           * Fires when the open menus are closed.
           * @event DropdownMenu#hide
           */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
       * Destroys the plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return DropdownMenu;
  }();

  /**
   * Default settings for plugin
   */

  DropdownMenu.defaults = {
    /**
     * Disallows hover events from opening submenus
     * @option
     * @type {boolean}
     * @default false
     */
    disableHover: false,
    /**
     * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
     * @option
     * @type {boolean}
     * @default true
     */
    autoclose: true,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @type {number}
     * @default 50
     */
    hoverDelay: 50,
    /**
     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
     * @option
     * @type {boolean}
     * @default false
     */
    clickOpen: false,
    /**
     * Amount of time to delay closing a submenu on a mouseleave event.
     * @option
     * @type {number}
     * @default 500
     */

    closingTime: 500,
    /**
     * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
     * @option
     * @type {string}
     * @default 'left'
     */
    alignment: 'left',
    /**
     * Allow clicks on the body to close any open submenus.
     * @option
     * @type {boolean}
     * @default true
     */
    closeOnClick: true,
    /**
     * Allow clicks on leaf anchor links to close any open submenus.
     * @option
     * @type {boolean}
     * @default true
     */
    closeOnClickInside: true,
    /**
     * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
     * @option
     * @type {string}
     * @default 'vertical'
     */
    verticalClass: 'vertical',
    /**
     * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
     * @option
     * @type {string}
     * @default 'align-right'
     */
    rightClass: 'align-right',
    /**
     * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
     * @option
     * @type {boolean}
     * @default true
     */
    forceFollow: true
  };

  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery);
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.keyboard
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */

    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
       * @private
       */

    }, {
      key: '_stopScrolling',
      value: function _stopScrolling(event) {
        return false;
      }

      // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
      // Only really works for y, not sure how to extend to x or if we need to.

    }, {
      key: '_recordScrollable',
      value: function _recordScrollable(event) {
        var elem = this; // called from event handler context with this as elem

        // If the element is scrollable (content overflows), then...
        if (elem.scrollHeight !== elem.clientHeight) {
          // If we're at the top, scroll down one pixel to allow scrolling up
          if (elem.scrollTop === 0) {
            elem.scrollTop = 1;
          }
          // If we're at the bottom, scroll up one pixel to allow scrolling down
          if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
          }
        }
        elem.allowUp = elem.scrollTop > 0;
        elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
        elem.lastY = event.originalEvent.pageY;
      }
    }, {
      key: '_stopScrollPropagation',
      value: function _stopScrollPropagation(event) {
        var elem = this; // called from event handler context with this as elem
        var up = event.pageY < elem.lastY;
        var down = !up;
        elem.lastY = event.pageY;

        if (up && elem.allowUp || down && elem.allowDown) {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
          this.$element.on('touchstart', this._recordScrollable);
          this.$element.on('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
          this.$element.off('touchstart', this._recordScrollable);
          this.$element.off('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(e) {
        var _this2 = this;

        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          }
        });
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @type {boolean}
     * @default true
     */
    closeOnClick: true,

    /**
     * Adds an overlay on top of `[data-off-canvas-content]`.
     * @option
     * @type {boolean}
     * @default true
     */
    contentOverlay: true,

    /**
     * Enable/disable scrolling of the main content when an off canvas panel is open.
     * @option
     * @type {boolean}
     * @default true
     */
    contentScroll: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @type {number}
     * @default 0
     */
    transitionTime: 0,

    /**
     * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
     * @option
     * @type {string}
     * @default push
     */
    transition: 'push',

    /**
     * Force the page to scroll to top or bottom on open.
     * @option
     * @type {?string}
     * @default null
     */
    forceTo: null,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @type {boolean}
     * @default false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @type {?string}
     * @default null
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
     * @option
     * @type {boolean}
     * @default true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * @type {string}
     * @default reveal-for-
     * @todo improve the regex testing for this.
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @type {boolean}
     * @default false
     */
    trapFocus: false
  };

  // Window exports
  Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

!function ($) {

  /**
   * Orbit module.
   * @module foundation.orbit
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.timerAndImageLoader
   * @requires foundation.util.touch
   */

  var Orbit = function () {
    /**
    * Creates a new instance of an orbit carousel.
    * @class
    * @param {jQuery} element - jQuery object to make into an Orbit Carousel.
    * @param {Object} options - Overrides to the default plugin settings.
    */
    function Orbit(element, options) {
      _classCallCheck(this, Orbit);

      this.$element = element;
      this.options = $.extend({}, Orbit.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Orbit');
      Foundation.Keyboard.register('Orbit', {
        'ltr': {
          'ARROW_RIGHT': 'next',
          'ARROW_LEFT': 'previous'
        },
        'rtl': {
          'ARROW_LEFT': 'next',
          'ARROW_RIGHT': 'previous'
        }
      });
    }

    /**
    * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
    * @function
    * @private
    */

    _createClass(Orbit, [{
      key: '_init',
      value: function _init() {
        // @TODO: consider discussion on PR #9278 about DOM pollution by changeSlide
        this._reset();

        this.$wrapper = this.$element.find('.' + this.options.containerClass);
        this.$slides = this.$element.find('.' + this.options.slideClass);

        var $images = this.$element.find('img'),
            initActive = this.$slides.filter('.is-active'),
            id = this.$element[0].id || Foundation.GetYoDigits(6, 'orbit');

        this.$element.attr({
          'data-resize': id,
          'id': id
        });

        if (!initActive.length) {
          this.$slides.eq(0).addClass('is-active');
        }

        if (!this.options.useMUI) {
          this.$slides.addClass('no-motionui');
        }

        if ($images.length) {
          Foundation.onImagesLoaded($images, this._prepareForOrbit.bind(this));
        } else {
          this._prepareForOrbit(); //hehe
        }

        if (this.options.bullets) {
          this._loadBullets();
        }

        this._events();

        if (this.options.autoPlay && this.$slides.length > 1) {
          this.geoSync();
        }

        if (this.options.accessible) {
          // allow wrapper to be focusable to enable arrow navigation
          this.$wrapper.attr('tabindex', 0);
        }
      }

      /**
      * Creates a jQuery collection of bullets, if they are being used.
      * @function
      * @private
      */

    }, {
      key: '_loadBullets',
      value: function _loadBullets() {
        this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
      }

      /**
      * Sets a `timer` object on the orbit, and starts the counter for the next slide.
      * @function
      */

    }, {
      key: 'geoSync',
      value: function geoSync() {
        var _this = this;
        this.timer = new Foundation.Timer(this.$element, {
          duration: this.options.timerDelay,
          infinite: false
        }, function () {
          _this.changeSlide(true);
        });
        this.timer.start();
      }

      /**
      * Sets wrapper and slide heights for the orbit.
      * @function
      * @private
      */

    }, {
      key: '_prepareForOrbit',
      value: function _prepareForOrbit() {
        var _this = this;
        this._setWrapperHeight();
      }

      /**
      * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
      * @function
      * @private
      * @param {Function} cb - a callback function to fire when complete.
      */

    }, {
      key: '_setWrapperHeight',
      value: function _setWrapperHeight(cb) {
        //rewrite this to `for` loop
        var max = 0,
            temp,
            counter = 0,
            _this = this;

        this.$slides.each(function () {
          temp = this.getBoundingClientRect().height;
          $(this).attr('data-slide', counter);

          if (_this.$slides.filter('.is-active')[0] !== _this.$slides.eq(counter)[0]) {
            //if not the active slide, set css position and display property
            $(this).css({ 'position': 'relative', 'display': 'none' });
          }
          max = temp > max ? temp : max;
          counter++;
        });

        if (counter === this.$slides.length) {
          this.$wrapper.css({ 'height': max }); //only change the wrapper height property once.
          if (cb) {
            cb(max);
          } //fire callback with max height dimension.
        }
      }

      /**
      * Sets the max-height of each slide.
      * @function
      * @private
      */

    }, {
      key: '_setSlideHeight',
      value: function _setSlideHeight(height) {
        this.$slides.each(function () {
          $(this).css('max-height', height);
        });
      }

      /**
      * Adds event listeners to basically everything within the element.
      * @function
      * @private
      */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        //***************************************
        //**Now using custom event - thanks to:**
        //**      Yohai Ararat of Toronto      **
        //***************************************
        //
        this.$element.off('.resizeme.zf.trigger').on({
          'resizeme.zf.trigger': this._prepareForOrbit.bind(this)
        });
        if (this.$slides.length > 1) {

          if (this.options.swipe) {
            this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(true);
            }).on('swiperight.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(false);
            });
          }
          //***************************************

          if (this.options.autoPlay) {
            this.$slides.on('click.zf.orbit', function () {
              _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
              _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
            });

            if (this.options.pauseOnHover) {
              this.$element.on('mouseenter.zf.orbit', function () {
                _this.timer.pause();
              }).on('mouseleave.zf.orbit', function () {
                if (!_this.$element.data('clickedOn')) {
                  _this.timer.start();
                }
              });
            }
          }

          if (this.options.navButtons) {
            var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
            $controls.attr('tabindex', 0)
            //also need to handle enter/return and spacebar key presses
            .on('click.zf.orbit touchend.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide($(this).hasClass(_this.options.nextClass));
            });
          }

          if (this.options.bullets) {
            this.$bullets.on('click.zf.orbit touchend.zf.orbit', function () {
              if (/is-active/g.test(this.className)) {
                return false;
              } //if this is active, kick out of function.
              var idx = $(this).data('slide'),
                  ltr = idx > _this.$slides.filter('.is-active').data('slide'),
                  $slide = _this.$slides.eq(idx);

              _this.changeSlide(ltr, $slide, idx);
            });
          }

          if (this.options.accessible) {
            this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e) {
              // handle keyboard event with keyboard util
              Foundation.Keyboard.handleKey(e, 'Orbit', {
                next: function next() {
                  _this.changeSlide(true);
                },
                previous: function previous() {
                  _this.changeSlide(false);
                },
                handled: function handled() {
                  // if bullet is focused, make sure focus moves
                  if ($(e.target).is(_this.$bullets)) {
                    _this.$bullets.filter('.is-active').focus();
                  }
                }
              });
            });
          }
        }
      }

      /**
       * Resets Orbit so it can be reinitialized
       */

    }, {
      key: '_reset',
      value: function _reset() {
        // Don't do anything if there are no slides (first run)
        if (typeof this.$slides == 'undefined') {
          return;
        }

        if (this.$slides.length > 1) {
          // Remove old events
          this.$element.off('.zf.orbit').find('*').off('.zf.orbit');

          // Restart timer if autoPlay is enabled
          if (this.options.autoPlay) {
            this.timer.restart();
          }

          // Reset all sliddes
          this.$slides.each(function (el) {
            $(el).removeClass('is-active is-active is-in').removeAttr('aria-live').hide();
          });

          // Show the first slide
          this.$slides.first().addClass('is-active').show();

          // Triggers when the slide has finished animating
          this.$element.trigger('slidechange.zf.orbit', [this.$slides.first()]);

          // Select first bullet if bullets are present
          if (this.options.bullets) {
            this._updateBullets(0);
          }
        }
      }

      /**
      * Changes the current slide to a new one.
      * @function
      * @param {Boolean} isLTR - flag if the slide should move left to right.
      * @param {jQuery} chosenSlide - the jQuery element of the slide to show next, if one is selected.
      * @param {Number} idx - the index of the new slide in its collection, if one chosen.
      * @fires Orbit#slidechange
      */

    }, {
      key: 'changeSlide',
      value: function changeSlide(isLTR, chosenSlide, idx) {
        if (!this.$slides) {
          return;
        } // Don't freak out if we're in the middle of cleanup
        var $curSlide = this.$slides.filter('.is-active').eq(0);

        if (/mui/g.test($curSlide[0].className)) {
          return false;
        } //if the slide is currently animating, kick out of the function

        var $firstSlide = this.$slides.first(),
            $lastSlide = this.$slides.last(),
            dirIn = isLTR ? 'Right' : 'Left',
            dirOut = isLTR ? 'Left' : 'Right',
            _this = this,
            $newSlide;

        if (!chosenSlide) {
          //most of the time, this will be auto played or clicked from the navButtons.
          $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
          this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass) : //pick next slide if moving left to right
          this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass); //pick prev slide if moving right to left
        } else {
          $newSlide = chosenSlide;
        }

        if ($newSlide.length) {
          /**
          * Triggers before the next slide starts animating in and only if a next slide has been found.
          * @event Orbit#beforeslidechange
          */
          this.$element.trigger('beforeslidechange.zf.orbit', [$curSlide, $newSlide]);

          if (this.options.bullets) {
            idx = idx || this.$slides.index($newSlide); //grab index to update bullets
            this._updateBullets(idx);
          }

          if (this.options.useMUI && !this.$element.is(':hidden')) {
            Foundation.Motion.animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 }), this.options['animInFrom' + dirIn], function () {
              $newSlide.css({ 'position': 'relative', 'display': 'block' }).attr('aria-live', 'polite');
            });

            Foundation.Motion.animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function () {
              $curSlide.removeAttr('aria-live');
              if (_this.options.autoPlay && !_this.timer.isPaused) {
                _this.timer.restart();
              }
              //do stuff?
            });
          } else {
            $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
            $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
            if (this.options.autoPlay && !this.timer.isPaused) {
              this.timer.restart();
            }
          }
          /**
          * Triggers when the slide has finished animating in.
          * @event Orbit#slidechange
          */
          this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
        }
      }

      /**
      * Updates the active state of the bullets, if displayed.
      * @function
      * @private
      * @param {Number} idx - the index of the current slide.
      */

    }, {
      key: '_updateBullets',
      value: function _updateBullets(idx) {
        var $oldBullet = this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
            span = $oldBullet.find('span:last').detach(),
            $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
      }

      /**
      * Destroys the carousel and hides the element.
      * @function
      */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Orbit;
  }();

  Orbit.defaults = {
    /**
    * Tells the JS to look for and loadBullets.
    * @option
     * @type {boolean}
    * @default true
    */
    bullets: true,
    /**
    * Tells the JS to apply event listeners to nav buttons
    * @option
     * @type {boolean}
    * @default true
    */
    navButtons: true,
    /**
    * motion-ui animation class to apply
    * @option
     * @type {string}
    * @default 'slide-in-right'
    */
    animInFromRight: 'slide-in-right',
    /**
    * motion-ui animation class to apply
    * @option
     * @type {string}
    * @default 'slide-out-right'
    */
    animOutToRight: 'slide-out-right',
    /**
    * motion-ui animation class to apply
    * @option
     * @type {string}
    * @default 'slide-in-left'
    *
    */
    animInFromLeft: 'slide-in-left',
    /**
    * motion-ui animation class to apply
    * @option
     * @type {string}
    * @default 'slide-out-left'
    */
    animOutToLeft: 'slide-out-left',
    /**
    * Allows Orbit to automatically animate on page load.
    * @option
     * @type {boolean}
    * @default true
    */
    autoPlay: true,
    /**
    * Amount of time, in ms, between slide transitions
    * @option
     * @type {number}
    * @default 5000
    */
    timerDelay: 5000,
    /**
    * Allows Orbit to infinitely loop through the slides
    * @option
     * @type {boolean}
    * @default true
    */
    infiniteWrap: true,
    /**
    * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
    * @option
     * @type {boolean}
    * @default true
    */
    swipe: true,
    /**
    * Allows the timing function to pause animation on hover.
    * @option
     * @type {boolean}
    * @default true
    */
    pauseOnHover: true,
    /**
    * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
    * @option
     * @type {boolean}
    * @default true
    */
    accessible: true,
    /**
    * Class applied to the container of Orbit
    * @option
     * @type {string}
    * @default 'orbit-container'
    */
    containerClass: 'orbit-container',
    /**
    * Class applied to individual slides.
    * @option
     * @type {string}
    * @default 'orbit-slide'
    */
    slideClass: 'orbit-slide',
    /**
    * Class applied to the bullet container. You're welcome.
    * @option
     * @type {string}
    * @default 'orbit-bullets'
    */
    boxOfBullets: 'orbit-bullets',
    /**
    * Class applied to the `next` navigation button.
    * @option
     * @type {string}
    * @default 'orbit-next'
    */
    nextClass: 'orbit-next',
    /**
    * Class applied to the `previous` navigation button.
    * @option
     * @type {string}
    * @default 'orbit-previous'
    */
    prevClass: 'orbit-previous',
    /**
    * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
    * @option
     * @type {boolean}
    * @default true
    */
    useMUI: true
  };

  // Window exports
  Foundation.plugin(Orbit, 'Orbit');
}(jQuery);
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

!function ($) {

  /**
   * ResponsiveMenu module.
   * @module foundation.responsiveMenu
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   */

  var ResponsiveMenu = function () {
    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @fires ResponsiveMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveMenu(element, options) {
      _classCallCheck(this, ResponsiveMenu);

      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */

    _createClass(ResponsiveMenu, [{
      key: '_init',
      value: function _init() {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
        // Add data-mutate since children may need it.
        this.$element.attr('data-mutate', this.$element.attr('data-mutate') || Foundation.GetYoDigits(6, 'responsive-menu'));
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveMenu;
  }();

  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
"use strict";

(function ($) {
  $(document).foundation();

  $("#js-form").submit(function (e) {
    e.preventDefault();
    var $form = $(this);

    $.post($form.attr("action"), $form.serialize()).then(function () {
      // Hide the form and show the confirmation mesage. 
      $form.hide();
      $("#js-confirmation").show().css("height", $form.height());
    });
  });

  var validate = function validate($form) {};

  $(document).ready(function () {
    $("#rooms").slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 4,
      nextArrow: '<button class="slick-next-arrow" aria-label="Next rooms"><svg class="icon"><use xlink:href="#angle-right"></use></svg></button>',
      prevArrow: '<button class="slick-previous-arrow" aria-label="Previous rooms"><svg class="icon"><use xlink:href="#angle-left"></use></svg></button>',
      responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      }]
    });
  });
  /*
     $(document).ready(function() {
     $("#arriveDt").datepicker();
     $("#departDt").datepicker();
     });
      function submitform() {
     if (!$("#arriveDt").val() || !$("#departDt").val()) {
     window.alert("Please enter a Start and End Date!");
     return false;
     }
     $('#resblock').submit();
     return false;
     }
     */
  // arriveDt
  // departDt
  /**
   * Initialize Pikaday datepickers.
   * @type {*}
   */
  /*
    var checkinEl = document.getElementById("arriveDt"),
        checkoutEl = document.getElementById("departDt"),
        checkinPika = pikadayResponsive(checkinEl, {
            format: 'M/DD/YYYY',
            pikadayOptions: {
                minDate: new Date
            }
        }),
        checkoutPika = pikadayResponsive(checkoutEl, {
            format: 'M/DD/YYYY',
            pikadayOptions: {
                minDate: new Date
            }
        });
  */
  // Check checkoutdate
  /*
    $(checkinEl).on('change-date', function (e, date) {
        // If check out date is before check in date
        if (date.date.isAfter(checkoutPika.date)) {
            checkoutPika.setDate(date.date.add(1, 'day'));
        }
         // Set the min date for the checkout input.
        checkoutPika.pikaday.setMinDate(checkinPika.date.toDate());
    });
     $('.booking-accordion-title').click(function(){
        var title = $(this);
        var bar = $('.booking-bar');
        bar.slideToggle('fast', function () {
            bar.toggleClass('open');
            if (bar.hasClass('open')) {
                title.text('Close');
            } else {
                title.text('Book Now');
            }
        });
    });
  */
  $(".hero-slick").slick({
    nextArrow: '<button class="slick-next-arrow" aria-label="Next rooms"><svg class="icon"><use xlink:href="#angle-right"></use></svg></button>',
    prevArrow: '<button class="slick-previous-arrow" aria-label="Previous rooms"><svg class="icon"><use xlink:href="#angle-left"></use></svg></button>'
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwic2xpY2suanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm1vdGlvbi5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmFiaWRlLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMiLCJmb3VuZGF0aW9uLm9mZmNhbnZhcy5qcyIsImZvdW5kYXRpb24ub3JiaXQuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbImEiLCJiIiwiYyIsImRvY3VtZW50IiwibGF6eVNpemVzIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJkIiwiZG9jdW1lbnRFbGVtZW50IiwiZSIsIkRhdGUiLCJmIiwiSFRNTFBpY3R1cmVFbGVtZW50IiwiZyIsImgiLCJpIiwiaiIsInNldFRpbWVvdXQiLCJrIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibCIsInJlcXVlc3RJZGxlQ2FsbGJhY2siLCJtIiwibiIsIm8iLCJwIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwicSIsIlJlZ0V4cCIsInRlc3QiLCJyIiwic2V0QXR0cmlidXRlIiwidHJpbSIsInMiLCJyZXBsYWNlIiwidCIsInUiLCJjcmVhdGVFdmVudCIsImluaXRDdXN0b21FdmVudCIsImRpc3BhdGNoRXZlbnQiLCJ2IiwicGljdHVyZWZpbGwiLCJwZiIsInJlZXZhbHVhdGUiLCJlbGVtZW50cyIsInNyYyIsInciLCJnZXRDb21wdXRlZFN0eWxlIiwieCIsIm9mZnNldFdpZHRoIiwibWluU2l6ZSIsIl9sYXp5c2l6ZXNXaWR0aCIsInBhcmVudE5vZGUiLCJ5IiwibGVuZ3RoIiwic2hpZnQiLCJhcHBseSIsImFyZ3VtZW50cyIsInB1c2giLCJoaWRkZW4iLCJfbHNGbHVzaCIsInoiLCJBIiwibm93IiwidGltZW91dCIsIkIiLCJDIiwiRSIsIkYiLCJHIiwiSCIsIkkiLCJKIiwiSyIsIkwiLCJNIiwiTiIsIk8iLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJQIiwiUSIsIlIiLCJTIiwiVCIsInRhcmdldCIsIlUiLCJib2R5Iiwib2Zmc2V0UGFyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwiViIsImxvYWRNb2RlIiwiZXhwYW5kIiwiY2xpZW50SGVpZ2h0IiwiY2xpZW50V2lkdGgiLCJleHBGYWN0b3IiLCJfbGF6eVJhY2UiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYSIsInByZWxvYWRBZnRlckxvYWQiLCJzaXplc0F0dHIiLCJXIiwiWCIsImxvYWRlZENsYXNzIiwibG9hZGluZ0NsYXNzIiwiWiIsIlkiLCIkIiwiY29udGVudFdpbmRvdyIsImxvY2F0aW9uIiwiXyIsInNyY3NldEF0dHIiLCJjdXN0b21NZWRpYSIsImluc2VydEJlZm9yZSIsImNsb25lTm9kZSIsInJlbW92ZUNoaWxkIiwiYWEiLCJkZWZhdWx0UHJldmVudGVkIiwiYXV0b3NpemVzQ2xhc3MiLCJzcmNBdHRyIiwibm9kZU5hbWUiLCJmaXJlc0xvYWQiLCJjbGVhclRpbWVvdXQiLCJjYWxsIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsYXp5Q2xhc3MiLCJjb21wbGV0ZSIsIm5hdHVyYWxXaWR0aCIsInNyY3NldCIsImVycm9yQ2xhc3MiLCJkZXRhaWwiLCJEIiwidXBkYXRlRWxlbSIsImNhIiwicHJlbG9hZENsYXNzIiwiaEZhYyIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJvYnNlcnZlIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsImF0dHJpYnV0ZXMiLCJzZXRJbnRlcnZhbCIsInJlYWR5U3RhdGUiLCJjaGVja0VsZW1zIiwidW52ZWlsIiwiZGF0YUF0dHIiLCJ3aWR0aCIsImluaXQiLCJsYXp5U2l6ZXNDb25maWciLCJsYXp5c2l6ZXNDb25maWciLCJjZmciLCJhdXRvU2l6ZXIiLCJsb2FkZXIiLCJ1UCIsImFDIiwickMiLCJoQyIsImZpcmUiLCJnVyIsInJBRiIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJyZXF1aXJlIiwialF1ZXJ5IiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsImVsZW1lbnQiLCJzZXR0aW5ncyIsImRhdGFTZXR0aW5ncyIsImRlZmF1bHRzIiwiYWNjZXNzaWJpbGl0eSIsImFkYXB0aXZlSGVpZ2h0IiwiYXBwZW5kQXJyb3dzIiwiYXBwZW5kRG90cyIsImFycm93cyIsImFzTmF2Rm9yIiwicHJldkFycm93IiwibmV4dEFycm93IiwiYXV0b3BsYXkiLCJhdXRvcGxheVNwZWVkIiwiY2VudGVyTW9kZSIsImNlbnRlclBhZGRpbmciLCJjc3NFYXNlIiwiY3VzdG9tUGFnaW5nIiwic2xpZGVyIiwidGV4dCIsImRvdHMiLCJkb3RzQ2xhc3MiLCJkcmFnZ2FibGUiLCJlYXNpbmciLCJlZGdlRnJpY3Rpb24iLCJmYWRlIiwiZm9jdXNPblNlbGVjdCIsImluZmluaXRlIiwiaW5pdGlhbFNsaWRlIiwibGF6eUxvYWQiLCJtb2JpbGVGaXJzdCIsInBhdXNlT25Ib3ZlciIsInBhdXNlT25Gb2N1cyIsInBhdXNlT25Eb3RzSG92ZXIiLCJyZXNwb25kVG8iLCJyZXNwb25zaXZlIiwicm93cyIsInJ0bCIsInNsaWRlIiwic2xpZGVzUGVyUm93Iiwic2xpZGVzVG9TaG93Iiwic2xpZGVzVG9TY3JvbGwiLCJzcGVlZCIsInN3aXBlIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiZGlyZWN0aW9uIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImV4dGVuZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd1RpbWVyIiwiZGF0YSIsIm9wdGlvbnMiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJjbGlja0hhbmRsZXIiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImZpbmQiLCJhdHRyIiwiYWRkU2xpZGUiLCJzbGlja0FkZCIsIm1hcmt1cCIsImluZGV4IiwiYWRkQmVmb3JlIiwidW5sb2FkIiwiYXBwZW5kVG8iLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiY2hpbGRyZW4iLCJkZXRhY2giLCJhcHBlbmQiLCJlYWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsInRhcmdldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiYW5pbWF0ZSIsImhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJjYWxsYmFjayIsImFuaW1Qcm9wcyIsImFuaW1TdGFydCIsImR1cmF0aW9uIiwic3RlcCIsIk1hdGgiLCJjZWlsIiwiY3NzIiwiYXBwbHlUcmFuc2l0aW9uIiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJub3QiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJjbGVhckludGVydmFsIiwic2xpZGVUbyIsImJ1aWxkQXJyb3dzIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsInJlbW92ZUF0dHIiLCJhZGQiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImZpcnN0IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsInJvdyIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsInJlZnJlc2giLCJ0cmlnZ2VyIiwiZXZlbnQiLCJkb250QW5pbWF0ZSIsIiR0YXJnZXQiLCJjdXJyZW50VGFyZ2V0IiwiaW5kZXhPZmZzZXQiLCJ1bmV2ZW5PZmZzZXQiLCJpcyIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VzdCIsIm1lc3NhZ2UiLCJjaGVja05hdmlnYWJsZSIsIm5hdmlnYWJsZXMiLCJwcmV2TmF2aWdhYmxlIiwiZ2V0TmF2aWdhYmxlSW5kZXhlcyIsImNsZWFuVXBFdmVudHMiLCJvZmYiLCJpbnRlcnJ1cHQiLCJ2aXNpYmlsaXR5IiwiY2xlYW5VcFNsaWRlRXZlbnRzIiwib3JpZW50YXRpb25DaGFuZ2UiLCJyZXNpemUiLCJjbGVhblVwUm93cyIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInN0b3BQcm9wYWdhdGlvbiIsImRlc3Ryb3kiLCJyZW1vdmUiLCJmYWRlU2xpZGUiLCJzbGlkZUluZGV4Iiwib3BhY2l0eSIsImZhZGVTbGlkZU91dCIsImZpbHRlclNsaWRlcyIsInNsaWNrRmlsdGVyIiwiZmlsdGVyIiwiZm9jdXNIYW5kbGVyIiwib24iLCIkc2YiLCJnZXRDdXJyZW50Iiwic2xpY2tDdXJyZW50U2xpZGUiLCJicmVha1BvaW50IiwiY291bnRlciIsInBhZ2VyUXR5IiwiZ2V0TGVmdCIsInZlcnRpY2FsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJ0YXJnZXRTbGlkZSIsImZsb29yIiwib2Zmc2V0TGVmdCIsIm91dGVyV2lkdGgiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImFicyIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsImVuZCIsImluaXRBcnJvd0V2ZW50cyIsImluaXREb3RFdmVudHMiLCJpbml0U2xpZGVFdmVudHMiLCJhY3Rpb24iLCJpbml0VUkiLCJzaG93IiwidGFnTmFtZSIsIm1hdGNoIiwia2V5Q29kZSIsImxvYWRSYW5nZSIsImNsb25lUmFuZ2UiLCJyYW5nZVN0YXJ0IiwicmFuZ2VFbmQiLCJsb2FkSW1hZ2VzIiwiaW1hZ2VzU2NvcGUiLCJpbWFnZSIsImltYWdlU291cmNlIiwiaW1hZ2VUb0xvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwic2xpY2UiLCJwcm9ncmVzc2l2ZUxhenlMb2FkIiwibmV4dCIsInNsaWNrTmV4dCIsInBhdXNlIiwic2xpY2tQYXVzZSIsInBsYXkiLCJzbGlja1BsYXkiLCJwb3N0U2xpZGUiLCJwcmV2Iiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsInR5cGUiLCJzcGxpY2UiLCJzb3J0Iiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BzIiwic2V0RGltZW5zaW9ucyIsInBhZGRpbmciLCJvZmZzZXQiLCJzZXRGYWRlIiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwidmFsdWUiLCJvcHQiLCJ2YWwiLCJib2R5U3R5bGUiLCJzdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJ1bmRlZmluZWQiLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJpbmZpbml0ZUNvdW50IiwiY2xvbmUiLCJ0b2dnbGUiLCJ0YXJnZXRFbGVtZW50IiwicGFyZW50cyIsInN5bmMiLCJhbmltU2xpZGUiLCJvbGRTbGlkZSIsInNsaWRlTGVmdCIsIm5hdlRhcmdldCIsImhpZGUiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJzd2lwZUFuZ2xlIiwic3RhcnRYIiwiY3VyWCIsInN0YXJ0WSIsImN1clkiLCJhdGFuMiIsInJvdW5kIiwiUEkiLCJzd2lwZUVuZCIsInN3aXBlTGVuZ3RoIiwiZWRnZUhpdCIsIm1pblN3aXBlIiwiaW5kZXhPZiIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInBhZ2VYIiwiY2xpZW50WCIsInBhZ2VZIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsImZuIiwiYXJncyIsInJldCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJ1bnJlZ2lzdGVyUGx1Z2luIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsIl9pbml0IiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJuYW1lc3BhY2UiLCJyYW5kb20iLCJ0b1N0cmluZyIsInJlZmxvdyIsImVsZW0iLCIkZWxlbSIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJtYXAiLCJlbCIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImhlYWQiLCJNZWRpYVF1ZXJ5IiwicGx1Z0NsYXNzIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJnZXRUaW1lIiwidmVuZG9ycyIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJsYXN0VGltZSIsIm5leHRUaW1lIiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJwYXJEaW1zIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJwYXJSZWN0Iiwid2luUmVjdCIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImtleSIsIndoaWNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCIkbGFzdEZvY3VzYWJsZSIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwia2NzIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiaW5mbyIsImlkIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0Iiwib25lIiwiZmluaXNoIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsIkJ1cm4iLCJyb2xlIiwiVGltZXIiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsImR4IiwiZHkiLCJkaXIiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwidGVhcmRvd24iLCJzcGVjaWFsIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiaW5pdE1vdXNlRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJtdXRhdGVMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCJhdHRyaWJ1dGVOYW1lIiwiZWxlbWVudE9ic2VydmVyIiwiY2hhcmFjdGVyRGF0YSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsIkFiaWRlIiwiJGlucHV0cyIsIl9ldmVudHMiLCJfdGhpczIiLCJyZXNldEZvcm0iLCJ2YWxpZGF0ZUZvcm0iLCJ2YWxpZGF0ZU9uIiwidmFsaWRhdGVJbnB1dCIsImxpdmVWYWxpZGF0ZSIsInZhbGlkYXRlT25CbHVyIiwiX3JlZmxvdyIsInJlcXVpcmVkQ2hlY2siLCJpc0dvb2QiLCJjaGVja2VkIiwiZmluZEZvcm1FcnJvciIsIiRlcnJvciIsInNpYmxpbmdzIiwiZm9ybUVycm9yU2VsZWN0b3IiLCJmaW5kTGFiZWwiLCIkbGFiZWwiLCJmaW5kUmFkaW9MYWJlbHMiLCIkZWxzIiwiX3RoaXMzIiwibGFiZWxzIiwiYWRkRXJyb3JDbGFzc2VzIiwiJGZvcm1FcnJvciIsImxhYmVsRXJyb3JDbGFzcyIsImZvcm1FcnJvckNsYXNzIiwiaW5wdXRFcnJvckNsYXNzIiwicmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMiLCJncm91cE5hbWUiLCIkbGFiZWxzIiwiJGZvcm1FcnJvcnMiLCJyZW1vdmVFcnJvckNsYXNzZXMiLCJfdGhpczQiLCJjbGVhclJlcXVpcmUiLCJ2YWxpZGF0ZWQiLCJjdXN0b21WYWxpZGF0b3IiLCJ2YWxpZGF0b3IiLCJlcXVhbFRvIiwidmFsaWRhdGVSYWRpbyIsInZhbGlkYXRlVGV4dCIsIm1hdGNoVmFsaWRhdGlvbiIsInZhbGlkYXRvcnMiLCJnb29kVG9HbyIsImRlcGVuZGVudEVsZW1lbnRzIiwiYWNjIiwibm9FcnJvciIsInBhdHRlcm4iLCJpbnB1dFRleHQiLCJ2YWxpZCIsInBhdHRlcm5zIiwiJGdyb3VwIiwicmVxdWlyZWQiLCJfdGhpczUiLCJjbGVhciIsIiRmb3JtIiwiYWxwaGEiLCJhbHBoYV9udW1lcmljIiwiaW50ZWdlciIsIm51bWJlciIsImNhcmQiLCJjdnYiLCJlbWFpbCIsInVybCIsImRvbWFpbiIsImRhdGV0aW1lIiwiZGF0ZSIsInRpbWUiLCJkYXRlSVNPIiwibW9udGhfZGF5X3llYXIiLCJkYXlfbW9udGhfeWVhciIsImNvbG9yIiwiRHJvcGRvd25NZW51Iiwic3VicyIsIiRtZW51SXRlbXMiLCIkdGFicyIsInZlcnRpY2FsQ2xhc3MiLCJyaWdodENsYXNzIiwiYWxpZ25tZW50IiwiY2hhbmdlZCIsIl9pc1ZlcnRpY2FsIiwiaGFzVG91Y2giLCJvbnRvdWNoc3RhcnQiLCJwYXJDbGFzcyIsImhhbmRsZUNsaWNrRm4iLCJwYXJlbnRzVW50aWwiLCJoYXNTdWIiLCJoYXNDbGlja2VkIiwiY2xvc2VPbkNsaWNrIiwiY2xpY2tPcGVuIiwiZm9yY2VGb2xsb3ciLCJfaGlkZSIsIl9zaG93IiwiY2xvc2VPbkNsaWNrSW5zaWRlIiwiZGlzYWJsZUhvdmVyIiwiaG92ZXJEZWxheSIsImF1dG9jbG9zZSIsImNsb3NpbmdUaW1lIiwiaXNUYWIiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJuZXh0U2libGluZyIsInByZXZTaWJsaW5nIiwib3BlblN1YiIsImNsb3NlU3ViIiwiY2xvc2UiLCJvcGVuIiwiZG93biIsInVwIiwicHJldmlvdXMiLCJfYWRkQm9keUhhbmRsZXIiLCIkYm9keSIsIiRsaW5rIiwiaWR4IiwiJHNpYnMiLCJvbGRDbGFzcyIsIiRwYXJlbnRMaSIsIiR0b0Nsb3NlIiwic29tZXRoaW5nVG9DbG9zZSIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsIiRvdmVybGF5IiwiaXNSZXZlYWxlZCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJfaGFuZGxlS2V5Ym9hcmQiLCJyZXZlYWwiLCIkY2xvc2VyIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvcCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiYXV0b0ZvY3VzIiwiT3JiaXQiLCJfcmVzZXQiLCIkd3JhcHBlciIsImNvbnRhaW5lckNsYXNzIiwic2xpZGVDbGFzcyIsIiRpbWFnZXMiLCJpbml0QWN0aXZlIiwidXNlTVVJIiwiX3ByZXBhcmVGb3JPcmJpdCIsImJ1bGxldHMiLCJfbG9hZEJ1bGxldHMiLCJnZW9TeW5jIiwiYWNjZXNzaWJsZSIsIiRidWxsZXRzIiwiYm94T2ZCdWxsZXRzIiwidGltZXJEZWxheSIsIl9zZXRXcmFwcGVySGVpZ2h0IiwidGVtcCIsIl9zZXRTbGlkZUhlaWdodCIsIm5hdkJ1dHRvbnMiLCIkY29udHJvbHMiLCJuZXh0Q2xhc3MiLCJwcmV2Q2xhc3MiLCIkc2xpZGUiLCJfdXBkYXRlQnVsbGV0cyIsImlzTFRSIiwiY2hvc2VuU2xpZGUiLCIkY3VyU2xpZGUiLCIkZmlyc3RTbGlkZSIsIiRsYXN0U2xpZGUiLCJsYXN0IiwiZGlySW4iLCJkaXJPdXQiLCIkbmV3U2xpZGUiLCJpbmZpbml0ZVdyYXAiLCIkb2xkQnVsbGV0IiwiYmx1ciIsInNwYW4iLCIkbmV3QnVsbGV0IiwiYW5pbUluRnJvbVJpZ2h0IiwiYW5pbU91dFRvUmlnaHQiLCJhbmltSW5Gcm9tTGVmdCIsImFuaW1PdXRUb0xlZnQiLCJSZXNwb25zaXZlTWVudSIsInJ1bGVzIiwiY3VycmVudE1xIiwiY3VycmVudFBsdWdpbiIsInJ1bGVzVHJlZSIsInJ1bGUiLCJydWxlU2l6ZSIsInJ1bGVQbHVnaW4iLCJNZW51UGx1Z2lucyIsImlzRW1wdHlPYmplY3QiLCJfY2hlY2tNZWRpYVF1ZXJpZXMiLCJtYXRjaGVkTXEiLCJjc3NDbGFzcyIsImRyb3Bkb3duIiwiZHJpbGxkb3duIiwiYWNjb3JkaW9uIiwic3VibWl0IiwicG9zdCIsInNlcmlhbGl6ZSIsInRoZW4iLCJ2YWxpZGF0ZSIsInJlYWR5Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUZSO0FBRlosT0FWVSxFQWlCVjtBQUNFb0osb0JBQVksR0FEZDtBQUVFNUwsa0JBQVU7QUFDUnVDLHdCQUFjLENBRE47QUFFUkMsMEJBQWdCO0FBRlI7QUFLWjtBQUNBO0FBQ0E7QUFUQSxPQWpCVTtBQVZJLEtBQWxCO0FBdUNELEdBeENEO0FBeUNBOzs7Ozs7Ozs7Ozs7OztBQWVBO0FBQ0E7QUFDQTs7OztBQUlBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkFyRyxJQUFFLGFBQUYsRUFBaUJzTixLQUFqQixDQUF1QjtBQUNyQi9JLGVBQ0UsaUlBRm1CO0FBR3JCRCxlQUNFO0FBSm1CLEdBQXZCO0FBTUQsQ0FoSUQsRUFnSUdiLE1BaElIIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY0LjMuMVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdCAgLypcblx0ICAgKiB2YXJpYWJsZXNcblx0ICAgKi9cblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IG51bGw7XG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gWydpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnXTtcblxuXHQgIHZhciBmdW5jdGlvbkxpc3QgPSBbXTtcblxuXHQgIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuXHQgIC8vIGNhbiBiZSBzYWZlbHkgaWdub3JlZCB0byBwcmV2ZW50IGZhbHNlIGtleWJvYXJkIGRldGVjdGlvblxuXHQgIHZhciBpZ25vcmVNYXAgPSBbMTYsIC8vIHNoaWZ0XG5cdCAgMTcsIC8vIGNvbnRyb2xcblx0ICAxOCwgLy8gYWx0XG5cdCAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICA5MyAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbGlzdCBvZiBrZXlzIGZvciB3aGljaCB3ZSBjaGFuZ2UgaW50ZW50IGV2ZW4gZm9yIGZvcm0gaW5wdXRzXG5cdCAgdmFyIGNoYW5nZUludGVudE1hcCA9IFs5IC8vIHRhYlxuXHQgIF07XG5cblx0ICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dE1hcCA9IHtcblx0ICAgIGtleWRvd246ICdrZXlib2FyZCcsXG5cdCAgICBrZXl1cDogJ2tleWJvYXJkJyxcblx0ICAgIG1vdXNlZG93bjogJ21vdXNlJyxcblx0ICAgIG1vdXNlbW92ZTogJ21vdXNlJyxcblx0ICAgIE1TUG9pbnRlckRvd246ICdwb2ludGVyJyxcblx0ICAgIE1TUG9pbnRlck1vdmU6ICdwb2ludGVyJyxcblx0ICAgIHBvaW50ZXJkb3duOiAncG9pbnRlcicsXG5cdCAgICBwb2ludGVybW92ZTogJ3BvaW50ZXInLFxuXHQgICAgdG91Y2hzdGFydDogJ3RvdWNoJ1xuXHQgIH07XG5cblx0ICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dFR5cGVzID0gW107XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRvdWNoIGJ1ZmZlciBpcyBhY3RpdmVcblx0ICB2YXIgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdGhlIHBhZ2UgaXMgYmVpbmcgc2Nyb2xsZWRcblx0ICB2YXIgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgIC8vIHN0b3JlIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cblx0ICB2YXIgbW91c2VQb3MgPSB7XG5cdCAgICB4OiBudWxsLFxuXHQgICAgeTogbnVsbFxuXHQgIH07XG5cblx0ICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXHQgIH07XG5cblx0ICB2YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cblx0ICB0cnkge1xuXHQgICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuXHQgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0ICAgICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuXHQgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcblx0ICB9IGNhdGNoIChlKSB7fVxuXG5cdCAgLypcblx0ICAgKiBzZXQgdXBcblx0ICAgKi9cblxuXHQgIHZhciBzZXRVcCA9IGZ1bmN0aW9uIHNldFVwKCkge1xuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiBldmVudHNcblx0ICAgKi9cblxuXHQgIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKSB7XG5cdCAgICAvLyBgcG9pbnRlcm1vdmVgLCBgTVNQb2ludGVyTW92ZWAsIGBtb3VzZW1vdmVgIGFuZCBtb3VzZSB3aGVlbCBldmVudCBiaW5kaW5nXG5cdCAgICAvLyBjYW4gb25seSBkZW1vbnN0cmF0ZSBwb3RlbnRpYWwsIGJ1dCBub3QgYWN0dWFsLCBpbnRlcmFjdGlvblxuXHQgICAgLy8gYW5kIGFyZSB0cmVhdGVkIHNlcGFyYXRlbHlcblx0ICAgIHZhciBvcHRpb25zID0gc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZTtcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hCdWZmZXIsIG9wdGlvbnMpO1xuXHQgICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoQnVmZmVyKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50LCBvcHRpb25zKTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZUlucHV0KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciB1cGRhdGVJbnB1dCA9IGZ1bmN0aW9uIHVwZGF0ZUlucHV0KGV2ZW50KSB7XG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8IGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICAgIHZhciBhY3RpdmVJbnB1dCA9IGZhbHNlO1xuXHQgICAgICAgIHZhciBub3RGb3JtSW5wdXQgPSBhY3RpdmVFbGVtICYmIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiYgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xO1xuXG5cdCAgICAgICAgaWYgKG5vdEZvcm1JbnB1dCB8fCBjaGFuZ2VJbnRlbnRNYXAuaW5kZXhPZihldmVudEtleSkgIT09IC0xKSB7XG5cdCAgICAgICAgICBhY3RpdmVJbnB1dCA9IHRydWU7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKHZhbHVlID09PSAndG91Y2gnIHx8XG5cdCAgICAgICAgLy8gaWdub3JlIG1vdXNlIG1vZGlmaWVyIGtleXNcblx0ICAgICAgICB2YWx1ZSA9PT0gJ21vdXNlJyB8fFxuXHQgICAgICAgIC8vIGRvbid0IHN3aXRjaCBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIGEgZm9ybSBpbnB1dFxuXHQgICAgICAgIHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGV2ZW50S2V5ICYmIGFjdGl2ZUlucHV0ICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTEpIHtcblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24gc2V0SW5wdXQoKSB7XG5cdCAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cdCAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW5wdXQpO1xuXG5cdCAgICBpZiAoaW5wdXRUeXBlcy5pbmRleE9mKGN1cnJlbnRJbnB1dCkgPT09IC0xKSB7XG5cdCAgICAgIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuXHQgICAgICBkb2MuY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cblx0ICAgIGZpcmVGdW5jdGlvbnMoJ2lucHV0Jyk7XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbiBzZXRJbnRlbnQoZXZlbnQpIHtcblx0ICAgIC8vIHRlc3QgdG8gc2VlIGlmIGBtb3VzZW1vdmVgIGhhcHBlbmVkIHJlbGF0aXZlIHRvIHRoZSBzY3JlZW5cblx0ICAgIC8vIHRvIGRldGVjdCBzY3JvbGxpbmcgdmVyc3VzIG1vdXNlbW92ZVxuXHQgICAgaWYgKG1vdXNlUG9zWyd4J10gIT09IGV2ZW50LnNjcmVlblggfHwgbW91c2VQb3NbJ3knXSAhPT0gZXZlbnQuc2NyZWVuWSkge1xuXHQgICAgICBpc1Njcm9sbGluZyA9IGZhbHNlO1xuXG5cdCAgICAgIG1vdXNlUG9zWyd4J10gPSBldmVudC5zY3JlZW5YO1xuXHQgICAgICBtb3VzZVBvc1sneSddID0gZXZlbnQuc2NyZWVuWTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGlzU2Nyb2xsaW5nID0gdHJ1ZTtcblx0ICAgIH1cblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgLy8gb3Igc2Nyb2xsaW5nIGlzbid0IGhhcHBlbmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZyAmJiAhaXNTY3JvbGxpbmcpIHtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW50ZW50KTtcblxuXHQgICAgICAgIGZpcmVGdW5jdGlvbnMoJ2ludGVudCcpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbiB0b3VjaEJ1ZmZlcihldmVudCkge1xuXHQgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgICAgIC8vIHNldCB0aGUgY3VycmVudCBpbnB1dFxuXHQgICAgICB1cGRhdGVJbnB1dChldmVudCk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIHZhciBmaXJlRnVuY3Rpb25zID0gZnVuY3Rpb24gZmlyZUZ1bmN0aW9ucyh0eXBlKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZnVuY3Rpb25MaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgIGlmIChmdW5jdGlvbkxpc3RbaV0udHlwZSA9PT0gdHlwZSkge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdFtpXS5mbi5jYWxsKHVuZGVmaW5lZCwgY3VycmVudEludGVudCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiB1dGlsaXRpZXNcblx0ICAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uIHBvaW50ZXJUeXBlKGV2ZW50KSB7XG5cdCAgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgICByZXR1cm4gZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24gZGV0ZWN0V2hlZWwoKSB7XG5cdCAgICB2YXIgd2hlZWxUeXBlID0gdm9pZCAwO1xuXG5cdCAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblx0ICAgIGlmICgnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpIHtcblx0ICAgICAgd2hlZWxUeXBlID0gJ3doZWVsJztcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAvLyBvciBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICAgICAgd2hlZWxUeXBlID0gZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgPyAnbW91c2V3aGVlbCcgOiAnRE9NTW91c2VTY3JvbGwnO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gd2hlZWxUeXBlO1xuXHQgIH07XG5cblx0ICB2YXIgb2JqUG9zID0gZnVuY3Rpb24gb2JqUG9zKG1hdGNoKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZnVuY3Rpb25MaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgIGlmIChmdW5jdGlvbkxpc3RbaV0uZm4gPT09IG1hdGNoKSB7XG5cdCAgICAgICAgcmV0dXJuIGk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiBpbml0XG5cdCAgICovXG5cblx0ICAvLyBkb24ndCBzdGFydCBzY3JpcHQgdW5sZXNzIGJyb3dzZXIgY3V0cyB0aGUgbXVzdGFyZFxuXHQgIC8vIChhbHNvIHBhc3NlcyBpZiBwb2x5ZmlsbHMgYXJlIHVzZWQpXG5cdCAgaWYgKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0ICAgIHNldFVwKCk7XG5cdCAgfVxuXG5cdCAgLypcblx0ICAgKiBhcGlcblx0ICAgKi9cblxuXHQgIHJldHVybiB7XG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnbG9vc2UnfCdzdHJpY3QnXG5cdCAgICAvLyAnc3RyaWN0JyAoZGVmYXVsdCk6IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGBkYXRhLXdoYXRpbnB1dGAgYXR0cmlidXRlXG5cdCAgICAvLyAnbG9vc2UnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIG1vcmUgY3VycmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24gYXNrKG9wdCkge1xuXHQgICAgICByZXR1cm4gb3B0ID09PSAnbG9vc2UnID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDtcblx0ICAgIH0sXG5cblx0ICAgIC8vIHJldHVybnMgYXJyYXk6IGFsbCB0aGUgZGV0ZWN0ZWQgaW5wdXQgdHlwZXNcblx0ICAgIHR5cGVzOiBmdW5jdGlvbiB0eXBlcygpIHtcblx0ICAgICAgcmV0dXJuIGlucHV0VHlwZXM7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBvdmVyd3JpdGVzIGlnbm9yZWQga2V5cyB3aXRoIHByb3ZpZGVkIGFycmF5XG5cdCAgICBpZ25vcmVLZXlzOiBmdW5jdGlvbiBpZ25vcmVLZXlzKGFycikge1xuXHQgICAgICBpZ25vcmVNYXAgPSBhcnI7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBhdHRhY2ggZnVuY3Rpb25zIHRvIGlucHV0IGFuZCBpbnRlbnQgXCJldmVudHNcIlxuXHQgICAgLy8gZnVuY3Q6IGZ1bmN0aW9uIHRvIGZpcmUgb24gY2hhbmdlXG5cdCAgICAvLyBldmVudFR5cGU6ICdpbnB1dCd8J2ludGVudCdcblx0ICAgIHJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHJlZ2lzdGVyT25DaGFuZ2UoZm4sIGV2ZW50VHlwZSkge1xuXHQgICAgICBmdW5jdGlvbkxpc3QucHVzaCh7XG5cdCAgICAgICAgZm46IGZuLFxuXHQgICAgICAgIHR5cGU6IGV2ZW50VHlwZSB8fCAnaW5wdXQnXG5cdCAgICAgIH0pO1xuXHQgICAgfSxcblxuXHQgICAgdW5SZWdpc3Rlck9uQ2hhbmdlOiBmdW5jdGlvbiB1blJlZ2lzdGVyT25DaGFuZ2UoZm4pIHtcblx0ICAgICAgdmFyIHBvc2l0aW9uID0gb2JqUG9zKGZuKTtcblxuXHQgICAgICBpZiAocG9zaXRpb24pIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cdH0oKTtcblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIi8qISBsYXp5c2l6ZXMgLSB2My4wLjAgKi9cbiFmdW5jdGlvbihhLGIpe3ZhciBjPWIoYSxhLmRvY3VtZW50KTthLmxhenlTaXplcz1jLFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9Yyl9KHdpbmRvdyxmdW5jdGlvbihhLGIpe1widXNlIHN0cmljdFwiO2lmKGIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7dmFyIGMsZD1iLmRvY3VtZW50RWxlbWVudCxlPWEuRGF0ZSxmPWEuSFRNTFBpY3R1cmVFbGVtZW50LGc9XCJhZGRFdmVudExpc3RlbmVyXCIsaD1cImdldEF0dHJpYnV0ZVwiLGk9YVtnXSxqPWEuc2V0VGltZW91dCxrPWEucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxqLGw9YS5yZXF1ZXN0SWRsZUNhbGxiYWNrLG09L15waWN0dXJlJC9pLG49W1wibG9hZFwiLFwiZXJyb3JcIixcImxhenlpbmNsdWRlZFwiLFwiX2xhenlsb2FkZWRcIl0sbz17fSxwPUFycmF5LnByb3RvdHlwZS5mb3JFYWNoLHE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gb1tiXXx8KG9bYl09bmV3IFJlZ0V4cChcIihcXFxcc3xeKVwiK2IrXCIoXFxcXHN8JClcIikpLG9bYl0udGVzdChhW2hdKFwiY2xhc3NcIil8fFwiXCIpJiZvW2JdfSxyPWZ1bmN0aW9uKGEsYil7cShhLGIpfHxhLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsKGFbaF0oXCJjbGFzc1wiKXx8XCJcIikudHJpbSgpK1wiIFwiK2IpfSxzPWZ1bmN0aW9uKGEsYil7dmFyIGM7KGM9cShhLGIpKSYmYS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLChhW2hdKFwiY2xhc3NcIil8fFwiXCIpLnJlcGxhY2UoYyxcIiBcIikpfSx0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jP2c6XCJyZW1vdmVFdmVudExpc3RlbmVyXCI7YyYmdChhLGIpLG4uZm9yRWFjaChmdW5jdGlvbihjKXthW2RdKGMsYil9KX0sdT1mdW5jdGlvbihhLGMsZCxlLGYpe3ZhciBnPWIuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtyZXR1cm4gZy5pbml0Q3VzdG9tRXZlbnQoYywhZSwhZixkfHx7fSksYS5kaXNwYXRjaEV2ZW50KGcpLGd9LHY9ZnVuY3Rpb24oYixkKXt2YXIgZTshZiYmKGU9YS5waWN0dXJlZmlsbHx8Yy5wZik/ZSh7cmVldmFsdWF0ZTohMCxlbGVtZW50czpbYl19KTpkJiZkLnNyYyYmKGIuc3JjPWQuc3JjKX0sdz1mdW5jdGlvbihhLGIpe3JldHVybihnZXRDb21wdXRlZFN0eWxlKGEsbnVsbCl8fHt9KVtiXX0seD1mdW5jdGlvbihhLGIsZCl7Zm9yKGQ9ZHx8YS5vZmZzZXRXaWR0aDtkPGMubWluU2l6ZSYmYiYmIWEuX2xhenlzaXplc1dpZHRoOylkPWIub2Zmc2V0V2lkdGgsYj1iLnBhcmVudE5vZGU7cmV0dXJuIGR9LHk9ZnVuY3Rpb24oKXt2YXIgYSxjLGQ9W10sZT1bXSxmPWQsZz1mdW5jdGlvbigpe3ZhciBiPWY7Zm9yKGY9ZC5sZW5ndGg/ZTpkLGE9ITAsYz0hMTtiLmxlbmd0aDspYi5zaGlmdCgpKCk7YT0hMX0saD1mdW5jdGlvbihkLGUpe2EmJiFlP2QuYXBwbHkodGhpcyxhcmd1bWVudHMpOihmLnB1c2goZCksY3x8KGM9ITAsKGIuaGlkZGVuP2o6aykoZykpKX07cmV0dXJuIGguX2xzRmx1c2g9ZyxofSgpLHo9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9mdW5jdGlvbigpe3koYSl9OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxjPWFyZ3VtZW50czt5KGZ1bmN0aW9uKCl7YS5hcHBseShiLGMpfSl9fSxBPWZ1bmN0aW9uKGEpe3ZhciBiLGM9MCxkPTEyNSxmPTY2NixnPWYsaD1mdW5jdGlvbigpe2I9ITEsYz1lLm5vdygpLGEoKX0saT1sP2Z1bmN0aW9uKCl7bChoLHt0aW1lb3V0Omd9KSxnIT09ZiYmKGc9Zil9OnooZnVuY3Rpb24oKXtqKGgpfSwhMCk7cmV0dXJuIGZ1bmN0aW9uKGEpe3ZhciBmOyhhPWE9PT0hMCkmJihnPTQ0KSxifHwoYj0hMCxmPWQtKGUubm93KCktYyksMD5mJiYoZj0wKSxhfHw5PmYmJmw/aSgpOmooaSxmKSl9fSxCPWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD05OSxmPWZ1bmN0aW9uKCl7Yj1udWxsLGEoKX0sZz1mdW5jdGlvbigpe3ZhciBhPWUubm93KCktYztkPmE/aihnLGQtYSk6KGx8fGYpKGYpfTtyZXR1cm4gZnVuY3Rpb24oKXtjPWUubm93KCksYnx8KGI9aihnLGQpKX19LEM9ZnVuY3Rpb24oKXt2YXIgZixrLGwsbixvLHgsQyxFLEYsRyxILEksSixLLEwsTT0vXmltZyQvaSxOPS9eaWZyYW1lJC9pLE89XCJvbnNjcm9sbFwiaW4gYSYmIS9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksUD0wLFE9MCxSPTAsUz0tMSxUPWZ1bmN0aW9uKGEpe1ItLSxhJiZhLnRhcmdldCYmdChhLnRhcmdldCxUKSwoIWF8fDA+Unx8IWEudGFyZ2V0KSYmKFI9MCl9LFU9ZnVuY3Rpb24oYSxjKXt2YXIgZSxmPWEsZz1cImhpZGRlblwiPT13KGIuYm9keSxcInZpc2liaWxpdHlcIil8fFwiaGlkZGVuXCIhPXcoYSxcInZpc2liaWxpdHlcIik7Zm9yKEYtPWMsSSs9YyxHLT1jLEgrPWM7ZyYmKGY9Zi5vZmZzZXRQYXJlbnQpJiZmIT1iLmJvZHkmJmYhPWQ7KWc9KHcoZixcIm9wYWNpdHlcIil8fDEpPjAsZyYmXCJ2aXNpYmxlXCIhPXcoZixcIm92ZXJmbG93XCIpJiYoZT1mLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLGc9SD5lLmxlZnQmJkc8ZS5yaWdodCYmST5lLnRvcC0xJiZGPGUuYm90dG9tKzEpO3JldHVybiBnfSxWPWZ1bmN0aW9uKCl7dmFyIGEsZSxnLGksaixtLG4scCxxO2lmKChvPWMubG9hZE1vZGUpJiY4PlImJihhPWYubGVuZ3RoKSl7ZT0wLFMrKyxudWxsPT1LJiYoXCJleHBhbmRcImluIGN8fChjLmV4cGFuZD1kLmNsaWVudEhlaWdodD41MDAmJmQuY2xpZW50V2lkdGg+NTAwPzUwMDozNzApLEo9Yy5leHBhbmQsSz1KKmMuZXhwRmFjdG9yKSxLPlEmJjE+UiYmUz4yJiZvPjImJiFiLmhpZGRlbj8oUT1LLFM9MCk6UT1vPjEmJlM+MSYmNj5SP0o6UDtmb3IoO2E+ZTtlKyspaWYoZltlXSYmIWZbZV0uX2xhenlSYWNlKWlmKE8paWYoKHA9ZltlXVtoXShcImRhdGEtZXhwYW5kXCIpKSYmKG09MSpwKXx8KG09USkscSE9PW0mJihDPWlubmVyV2lkdGgrbSpMLEU9aW5uZXJIZWlnaHQrbSxuPS0xKm0scT1tKSxnPWZbZV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksKEk9Zy5ib3R0b20pPj1uJiYoRj1nLnRvcCk8PUUmJihIPWcucmlnaHQpPj1uKkwmJihHPWcubGVmdCk8PUMmJihJfHxIfHxHfHxGKSYmKGwmJjM+UiYmIXAmJigzPm98fDQ+Uyl8fFUoZltlXSxtKSkpe2lmKGJhKGZbZV0pLGo9ITAsUj45KWJyZWFrfWVsc2UhaiYmbCYmIWkmJjQ+UiYmND5TJiZvPjImJihrWzBdfHxjLnByZWxvYWRBZnRlckxvYWQpJiYoa1swXXx8IXAmJihJfHxIfHxHfHxGfHxcImF1dG9cIiE9ZltlXVtoXShjLnNpemVzQXR0cikpKSYmKGk9a1swXXx8ZltlXSk7ZWxzZSBiYShmW2VdKTtpJiYhaiYmYmEoaSl9fSxXPUEoViksWD1mdW5jdGlvbihhKXtyKGEudGFyZ2V0LGMubG9hZGVkQ2xhc3MpLHMoYS50YXJnZXQsYy5sb2FkaW5nQ2xhc3MpLHQoYS50YXJnZXQsWil9LFk9eihYKSxaPWZ1bmN0aW9uKGEpe1koe3RhcmdldDphLnRhcmdldH0pfSwkPWZ1bmN0aW9uKGEsYil7dHJ5e2EuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGIpfWNhdGNoKGMpe2Euc3JjPWJ9fSxfPWZ1bmN0aW9uKGEpe3ZhciBiLGQsZT1hW2hdKGMuc3Jjc2V0QXR0cik7KGI9Yy5jdXN0b21NZWRpYVthW2hdKFwiZGF0YS1tZWRpYVwiKXx8YVtoXShcIm1lZGlhXCIpXSkmJmEuc2V0QXR0cmlidXRlKFwibWVkaWFcIixiKSxlJiZhLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGUpLGImJihkPWEucGFyZW50Tm9kZSxkLmluc2VydEJlZm9yZShhLmNsb25lTm9kZSgpLGEpLGQucmVtb3ZlQ2hpbGQoYSkpfSxhYT16KGZ1bmN0aW9uKGEsYixkLGUsZil7dmFyIGcsaSxrLGwsbyxxOyhvPXUoYSxcImxhenliZWZvcmV1bnZlaWxcIixiKSkuZGVmYXVsdFByZXZlbnRlZHx8KGUmJihkP3IoYSxjLmF1dG9zaXplc0NsYXNzKTphLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZSkpLGk9YVtoXShjLnNyY3NldEF0dHIpLGc9YVtoXShjLnNyY0F0dHIpLGYmJihrPWEucGFyZW50Tm9kZSxsPWsmJm0udGVzdChrLm5vZGVOYW1lfHxcIlwiKSkscT1iLmZpcmVzTG9hZHx8XCJzcmNcImluIGEmJihpfHxnfHxsKSxvPXt0YXJnZXQ6YX0scSYmKHQoYSxULCEwKSxjbGVhclRpbWVvdXQobiksbj1qKFQsMjUwMCkscihhLGMubG9hZGluZ0NsYXNzKSx0KGEsWiwhMCkpLGwmJnAuY2FsbChrLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic291cmNlXCIpLF8pLGk/YS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixpKTpnJiYhbCYmKE4udGVzdChhLm5vZGVOYW1lKT8kKGEsZyk6YS5zcmM9ZyksKGl8fGwpJiZ2KGEse3NyYzpnfSkpLGEuX2xhenlSYWNlJiZkZWxldGUgYS5fbGF6eVJhY2UscyhhLGMubGF6eUNsYXNzKSx5KGZ1bmN0aW9uKCl7KCFxfHxhLmNvbXBsZXRlJiZhLm5hdHVyYWxXaWR0aD4xKSYmKHE/VChvKTpSLS0sWChvKSl9LCEwKX0pLGJhPWZ1bmN0aW9uKGEpe3ZhciBiLGQ9TS50ZXN0KGEubm9kZU5hbWUpLGU9ZCYmKGFbaF0oYy5zaXplc0F0dHIpfHxhW2hdKFwic2l6ZXNcIikpLGY9XCJhdXRvXCI9PWU7KCFmJiZsfHwhZHx8IWEuc3JjJiYhYS5zcmNzZXR8fGEuY29tcGxldGV8fHEoYSxjLmVycm9yQ2xhc3MpKSYmKGI9dShhLFwibGF6eXVudmVpbHJlYWRcIikuZGV0YWlsLGYmJkQudXBkYXRlRWxlbShhLCEwLGEub2Zmc2V0V2lkdGgpLGEuX2xhenlSYWNlPSEwLFIrKyxhYShhLGIsZixlLGQpKX0sY2E9ZnVuY3Rpb24oKXtpZighbCl7aWYoZS5ub3coKS14PDk5OSlyZXR1cm4gdm9pZCBqKGNhLDk5OSk7dmFyIGE9QihmdW5jdGlvbigpe2MubG9hZE1vZGU9MyxXKCl9KTtsPSEwLGMubG9hZE1vZGU9MyxXKCksaShcInNjcm9sbFwiLGZ1bmN0aW9uKCl7Mz09Yy5sb2FkTW9kZSYmKGMubG9hZE1vZGU9MiksYSgpfSwhMCl9fTtyZXR1cm57XzpmdW5jdGlvbigpe3g9ZS5ub3coKSxmPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmxhenlDbGFzcyksaz1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5sYXp5Q2xhc3MrXCIgXCIrYy5wcmVsb2FkQ2xhc3MpLEw9Yy5oRmFjLGkoXCJzY3JvbGxcIixXLCEwKSxpKFwicmVzaXplXCIsVywhMCksYS5NdXRhdGlvbk9ic2VydmVyP25ldyBNdXRhdGlvbk9ic2VydmVyKFcpLm9ic2VydmUoZCx7Y2hpbGRMaXN0OiEwLHN1YnRyZWU6ITAsYXR0cmlidXRlczohMH0pOihkW2ddKFwiRE9NTm9kZUluc2VydGVkXCIsVywhMCksZFtnXShcIkRPTUF0dHJNb2RpZmllZFwiLFcsITApLHNldEludGVydmFsKFcsOTk5KSksaShcImhhc2hjaGFuZ2VcIixXLCEwKSxbXCJmb2N1c1wiLFwibW91c2VvdmVyXCIsXCJjbGlja1wiLFwibG9hZFwiLFwidHJhbnNpdGlvbmVuZFwiLFwiYW5pbWF0aW9uZW5kXCIsXCJ3ZWJraXRBbmltYXRpb25FbmRcIl0uZm9yRWFjaChmdW5jdGlvbihhKXtiW2ddKGEsVywhMCl9KSwvZCR8XmMvLnRlc3QoYi5yZWFkeVN0YXRlKT9jYSgpOihpKFwibG9hZFwiLGNhKSxiW2ddKFwiRE9NQ29udGVudExvYWRlZFwiLFcpLGooY2EsMmU0KSksZi5sZW5ndGg/KFYoKSx5Ll9sc0ZsdXNoKCkpOlcoKX0sY2hlY2tFbGVtczpXLHVudmVpbDpiYX19KCksRD1mdW5jdGlvbigpe3ZhciBhLGQ9eihmdW5jdGlvbihhLGIsYyxkKXt2YXIgZSxmLGc7aWYoYS5fbGF6eXNpemVzV2lkdGg9ZCxkKz1cInB4XCIsYS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGQpLG0udGVzdChiLm5vZGVOYW1lfHxcIlwiKSlmb3IoZT1iLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic291cmNlXCIpLGY9MCxnPWUubGVuZ3RoO2c+ZjtmKyspZVtmXS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGQpO2MuZGV0YWlsLmRhdGFBdHRyfHx2KGEsYy5kZXRhaWwpfSksZT1mdW5jdGlvbihhLGIsYyl7dmFyIGUsZj1hLnBhcmVudE5vZGU7ZiYmKGM9eChhLGYsYyksZT11KGEsXCJsYXp5YmVmb3Jlc2l6ZXNcIix7d2lkdGg6YyxkYXRhQXR0cjohIWJ9KSxlLmRlZmF1bHRQcmV2ZW50ZWR8fChjPWUuZGV0YWlsLndpZHRoLGMmJmMhPT1hLl9sYXp5c2l6ZXNXaWR0aCYmZChhLGYsZSxjKSkpfSxmPWZ1bmN0aW9uKCl7dmFyIGIsYz1hLmxlbmd0aDtpZihjKWZvcihiPTA7Yz5iO2IrKyllKGFbYl0pfSxnPUIoZik7cmV0dXJue186ZnVuY3Rpb24oKXthPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmF1dG9zaXplc0NsYXNzKSxpKFwicmVzaXplXCIsZyl9LGNoZWNrRWxlbXM6Zyx1cGRhdGVFbGVtOmV9fSgpLEU9ZnVuY3Rpb24oKXtFLml8fChFLmk9ITAsRC5fKCksQy5fKCkpfTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYixkPXtsYXp5Q2xhc3M6XCJsYXp5bG9hZFwiLGxvYWRlZENsYXNzOlwibGF6eWxvYWRlZFwiLGxvYWRpbmdDbGFzczpcImxhenlsb2FkaW5nXCIscHJlbG9hZENsYXNzOlwibGF6eXByZWxvYWRcIixlcnJvckNsYXNzOlwibGF6eWVycm9yXCIsYXV0b3NpemVzQ2xhc3M6XCJsYXp5YXV0b3NpemVzXCIsc3JjQXR0cjpcImRhdGEtc3JjXCIsc3Jjc2V0QXR0cjpcImRhdGEtc3Jjc2V0XCIsc2l6ZXNBdHRyOlwiZGF0YS1zaXplc1wiLG1pblNpemU6NDAsY3VzdG9tTWVkaWE6e30saW5pdDohMCxleHBGYWN0b3I6MS41LGhGYWM6LjgsbG9hZE1vZGU6Mn07Yz1hLmxhenlTaXplc0NvbmZpZ3x8YS5sYXp5c2l6ZXNDb25maWd8fHt9O2ZvcihiIGluIGQpYiBpbiBjfHwoY1tiXT1kW2JdKTthLmxhenlTaXplc0NvbmZpZz1jLGooZnVuY3Rpb24oKXtjLmluaXQmJkUoKX0pfSgpLHtjZmc6YyxhdXRvU2l6ZXI6RCxsb2FkZXI6Qyxpbml0OkUsdVA6dixhQzpyLHJDOnMsaEM6cSxmaXJlOnUsZ1c6eCxyQUY6eX19fSk7IiwiLypcbiAgICAgXyBfICAgICAgXyAgICAgICBfXG4gX19ffCAoXykgX19ffCB8IF9fICAoXylfX19cbi8gX198IHwgfC8gX198IHwvIC8gIHwgLyBfX3xcblxcX18gXFwgfCB8IChfX3wgICA8IF8gfCBcXF9fIFxcXG58X19fL198X3xcXF9fX3xffFxcXyhfKS8gfF9fXy9cbiAgICAgICAgICAgICAgICAgICB8X18vXG5cbiBWZXJzaW9uOiAxLjYuMFxuICBBdXRob3I6IEtlbiBXaGVlbGVyXG4gV2Vic2l0ZTogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvXG4gICAgRG9jczogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvL3NsaWNrXG4gICAgUmVwbzogaHR0cDovL2dpdGh1Yi5jb20va2Vud2hlZWxlci9zbGlja1xuICBJc3N1ZXM6IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2svaXNzdWVzXG5cbiAqL1xuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIGRlZmluZSwgalF1ZXJ5LCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCAqL1xuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxuXG59KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xuXG4gICAgU2xpY2sgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlVWlkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xuXG4gICAgICAgICAgICB2YXIgXyA9IHRoaXMsIGRhdGFTZXR0aW5ncztcblxuICAgICAgICAgICAgXy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NpYmlsaXR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgYXBwZW5kRG90czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stcHJldlwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiIHRhYmluZGV4PVwiMFwiIHJvbGU9XCJidXR0b25cIj5QcmV2aW91czwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stbmV4dFwiIGFyaWEtbGFiZWw9XCJOZXh0XCIgdGFiaW5kZXg9XCIwXCIgcm9sZT1cImJ1dHRvblwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICBjc3NFYXNlOiAnZWFzZScsXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgLz4nKS50ZXh0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzcG9uZFRvOiAnd2luZG93JyxcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvd3M6IDEsXG4gICAgICAgICAgICAgICAgcnRsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZTogJycsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgICBzcGVlZDogNTAwLFxuICAgICAgICAgICAgICAgIHN3aXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvdWNoVGhyZXNob2xkOiA1LFxuICAgICAgICAgICAgICAgIHVzZUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VUcmFuc2Zvcm06IHRydWUsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsU3dpcGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2FpdEZvckFuaW1hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZVdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICRsaXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdW5zbGlja2VkOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8uYW5pbVByb3AgPSBudWxsO1xuICAgICAgICAgICAgXy5icmVha3BvaW50cyA9IFtdO1xuICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3MgPSBbXTtcbiAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaGlkZGVuID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IG51bGw7XG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IG51bGw7XG4gICAgICAgICAgICBfLnJvd0NvdW50ID0gMTtcbiAgICAgICAgICAgIF8uc2hvdWxkQ2xpY2sgPSB0cnVlO1xuICAgICAgICAgICAgXy4kc2xpZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAwO1xuICAgICAgICAgICAgXy53aW5kb3dUaW1lciA9IG51bGw7XG5cbiAgICAgICAgICAgIGRhdGFTZXR0aW5ncyA9ICQoZWxlbWVudCkuZGF0YSgnc2xpY2snKSB8fCB7fTtcblxuICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8uZGVmYXVsdHMsIHNldHRpbmdzLCBkYXRhU2V0dGluZ3MpO1xuXG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG5cbiAgICAgICAgICAgIF8ub3JpZ2luYWxTZXR0aW5ncyA9IF8ub3B0aW9ucztcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnbW96SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbW96dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnd2Via2l0SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnd2Via2l0dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYXV0b1BsYXkgPSAkLnByb3h5KF8uYXV0b1BsYXksIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUNsZWFyID0gJC5wcm94eShfLmF1dG9QbGF5Q2xlYXIsIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUl0ZXJhdG9yID0gJC5wcm94eShfLmF1dG9QbGF5SXRlcmF0b3IsIF8pO1xuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSA9ICQucHJveHkoXy5jaGFuZ2VTbGlkZSwgXyk7XG4gICAgICAgICAgICBfLmNsaWNrSGFuZGxlciA9ICQucHJveHkoXy5jbGlja0hhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZWxlY3RIYW5kbGVyID0gJC5wcm94eShfLnNlbGVjdEhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZXRQb3NpdGlvbiA9ICQucHJveHkoXy5zZXRQb3NpdGlvbiwgXyk7XG4gICAgICAgICAgICBfLnN3aXBlSGFuZGxlciA9ICQucHJveHkoXy5zd2lwZUhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5kcmFnSGFuZGxlciA9ICQucHJveHkoXy5kcmFnSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmtleUhhbmRsZXIgPSAkLnByb3h5KF8ua2V5SGFuZGxlciwgXyk7XG5cbiAgICAgICAgICAgIF8uaW5zdGFuY2VVaWQgPSBpbnN0YW5jZVVpZCsrO1xuXG4gICAgICAgICAgICAvLyBBIHNpbXBsZSB3YXkgdG8gY2hlY2sgZm9yIEhUTUwgc3RyaW5nc1xuICAgICAgICAgICAgLy8gU3RyaWN0IEhUTUwgcmVjb2duaXRpb24gKG11c3Qgc3RhcnQgd2l0aCA8KVxuICAgICAgICAgICAgLy8gRXh0cmFjdGVkIGZyb20galF1ZXJ5IHYxLjExIHNvdXJjZVxuICAgICAgICAgICAgXy5odG1sRXhwciA9IC9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKikkLztcblxuXG4gICAgICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIF8uaW5pdCh0cnVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFNsaWNrO1xuXG4gICAgfSgpKTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hY3RpdmF0ZUFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stYWN0aXZlJykuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAnZmFsc2UnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJzAnXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hZGRTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0FkZCA9IGZ1bmN0aW9uKG1hcmt1cCwgaW5kZXgsIGFkZEJlZm9yZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBhZGRCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IDAgfHwgKGluZGV4ID49IF8uc2xpZGVDb3VudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgJiYgXy4kc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEJlZm9yZShfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEFmdGVyKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFkZEJlZm9yZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5wcmVwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hbmltYXRlSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEgJiYgXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgICAgICAgXy4kbGlzdC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodFxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZVNsaWRlID0gZnVuY3Rpb24odGFyZ2V0TGVmdCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgYW5pbVByb3BzID0ge30sXG4gICAgICAgICAgICBfID0gdGhpcztcblxuICAgICAgICBfLmFuaW1hdGVIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gLXRhcmdldExlZnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50TGVmdCA9IC0oXy5jdXJyZW50TGVmdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoe1xuICAgICAgICAgICAgICAgICAgICBhbmltU3RhcnQ6IF8uY3VycmVudExlZnRcbiAgICAgICAgICAgICAgICB9KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogXy5vcHRpb25zLnNwZWVkLFxuICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IF8ub3B0aW9ucy5lYXNpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uKG5vdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gTWF0aC5jZWlsKG5vdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgwcHgsJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gTWF0aC5jZWlsKHRhcmdldExlZnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgwcHgsJyArIHRhcmdldExlZnQgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2VGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3I7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAmJiBhc05hdkZvciAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gJChhc05hdkZvcikubm90KF8uJHNsaWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXNOYXZGb3I7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBhc05hdkZvciA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAhPT0gbnVsbCAmJiB0eXBlb2YgYXNOYXZGb3IgPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgYXNOYXZGb3IuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzKS5zbGljaygnZ2V0U2xpY2snKTtcbiAgICAgICAgICAgICAgICBpZighdGFyZ2V0LnVuc2xpY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc2xpZGVIYW5kbGVyKGluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hcHBseVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgaWYgKCBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheVRpbWVyID0gc2V0SW50ZXJ2YWwoIF8uYXV0b1BsYXlJdGVyYXRvciwgXy5vcHRpb25zLmF1dG9wbGF5U3BlZWQgKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUNsZWFyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmF1dG9QbGF5VGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUl0ZXJhdG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIGlmICggIV8ucGF1c2VkICYmICFfLmludGVycnVwdGVkICYmICFfLmZvY3Vzc2VkICkge1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8uZGlyZWN0aW9uID09PSAxICYmICggXy5jdXJyZW50U2xpZGUgKyAxICkgPT09ICggXy5zbGlkZUNvdW50IC0gMSApKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmICggXy5kaXJlY3Rpb24gPT09IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggXy5jdXJyZW50U2xpZGUgLSAxID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIHNsaWRlVG8gKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgPSAkKF8ub3B0aW9ucy5wcmV2QXJyb3cpLmFkZENsYXNzKCdzbGljay1hcnJvdycpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ID0gJChfLm9wdGlvbnMubmV4dEFycm93KS5hZGRDbGFzcygnc2xpY2stYXJyb3cnKTtcblxuICAgICAgICAgICAgaWYoIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucHJlcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkKCBfLiRuZXh0QXJyb3cgKVxuXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBkb3Q7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1kb3R0ZWQnKTtcblxuICAgICAgICAgICAgZG90ID0gJCgnPHVsIC8+JykuYWRkQ2xhc3MoXy5vcHRpb25zLmRvdHNDbGFzcyk7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QuYXBwZW5kKCQoJzxsaSAvPicpLmFwcGVuZChfLm9wdGlvbnMuY3VzdG9tUGFnaW5nLmNhbGwodGhpcywgXywgaSkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kZG90cyA9IGRvdC5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kRG90cyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuZmluZCgnbGknKS5maXJzdCgpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRPdXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVzID1cbiAgICAgICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgICAgIC5jaGlsZHJlbiggXy5vcHRpb25zLnNsaWRlICsgJzpub3QoLnNsaWNrLWNsb25lZCknKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcblxuICAgICAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleClcbiAgICAgICAgICAgICAgICAuZGF0YSgnb3JpZ2luYWxTdHlsaW5nJywgJChlbGVtZW50KS5hdHRyKCdzdHlsZScpIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrID0gKF8uc2xpZGVDb3VudCA9PT0gMCkgP1xuICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLmFwcGVuZFRvKF8uJHNsaWRlcikgOlxuICAgICAgICAgICAgXy4kc2xpZGVzLndyYXBBbGwoJzxkaXYgY2xhc3M9XCJzbGljay10cmFja1wiLz4nKS5wYXJlbnQoKTtcblxuICAgICAgICBfLiRsaXN0ID0gXy4kc2xpZGVUcmFjay53cmFwKFxuICAgICAgICAgICAgJzxkaXYgYXJpYS1saXZlPVwicG9saXRlXCIgY2xhc3M9XCJzbGljay1saXN0XCIvPicpLnBhcmVudCgpO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLm5vdCgnW3NyY10nKS5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLmJ1aWxkRG90cygpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuXG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXModHlwZW9mIF8uY3VycmVudFNsaWRlID09PSAnbnVtYmVyJyA/IF8uY3VycmVudFNsaWRlIDogMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3QuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYSwgYiwgYywgbmV3U2xpZGVzLCBudW1PZlNsaWRlcywgb3JpZ2luYWxTbGlkZXMsc2xpZGVzUGVyU2VjdGlvbjtcblxuICAgICAgICBuZXdTbGlkZXMgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG5cbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChuZXdTbGlkZXMpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmNoaWxkcmVuKCkuY2hpbGRyZW4oKS5jaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICd3aWR0aCc6KDEwMCAvIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgJyUnLFxuICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja1Jlc3BvbnNpdmUgPSBmdW5jdGlvbihpbml0aWFsLCBmb3JjZVVwZGF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrcG9pbnQsIHRhcmdldEJyZWFrcG9pbnQsIHJlc3BvbmRUb1dpZHRoLCB0cmlnZ2VyQnJlYWtwb2ludCA9IGZhbHNlO1xuICAgICAgICB2YXIgc2xpZGVyV2lkdGggPSBfLiRzbGlkZXIud2lkdGgoKTtcbiAgICAgICAgdmFyIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgaWYgKF8ucmVzcG9uZFRvID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSB3aW5kb3dXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCBzbGlkZXJXaWR0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5yZXNwb25zaXZlICYmXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGggJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50IHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljayh0YXJnZXRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSBfLm9yaWdpbmFsU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgYnJlYWtwb2ludHMgZHVyaW5nIGFuIGFjdHVhbCBicmVhay4gbm90IG9uIGluaXRpYWxpemUuXG4gICAgICAgICAgICBpZiggIWluaXRpYWwgJiYgdHJpZ2dlckJyZWFrcG9pbnQgIT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdicmVha3BvaW50JywgW18sIHRyaWdnZXJCcmVha3BvaW50XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIGluZGV4T2Zmc2V0LCBzbGlkZU9mZnNldCwgdW5ldmVuT2Zmc2V0O1xuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBhIGxpbmssIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uXG4gICAgICAgIGlmKCR0YXJnZXQuaXMoJ2EnKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBub3QgdGhlIDxsaT4gZWxlbWVudCAoaWU6IGEgY2hpbGQpLCBmaW5kIHRoZSA8bGk+LlxuICAgICAgICBpZighJHRhcmdldC5pcygnbGknKSkge1xuICAgICAgICAgICAgJHRhcmdldCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuZXZlbk9mZnNldCA9IChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApO1xuICAgICAgICBpbmRleE9mZnNldCA9IHVuZXZlbk9mZnNldCA/IDAgOiAoXy5zbGlkZUNvdW50IC0gXy5jdXJyZW50U2xpZGUpICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ByZXZpb3VzJzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIGluZGV4T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgKyBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBldmVudC5kYXRhLmluZGV4ID09PSAwID8gMCA6XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXggfHwgJHRhcmdldC5pbmRleCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jaGVja05hdmlnYWJsZShpbmRleCksIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5jaGlsZHJlbigpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrTmF2aWdhYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBuYXZpZ2FibGVzLCBwcmV2TmF2aWdhYmxlO1xuXG4gICAgICAgIG5hdmlnYWJsZXMgPSBfLmdldE5hdmlnYWJsZUluZGV4ZXMoKTtcbiAgICAgICAgcHJldk5hdmlnYWJsZSA9IDA7XG4gICAgICAgIGlmIChpbmRleCA+IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgaW5kZXggPSBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG5hdmlnYWJsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBuYXZpZ2FibGVzW25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcHJldk5hdmlnYWJsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZOYXZpZ2FibGUgPSBuYXZpZ2FibGVzW25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgJiYgXy4kZG90cyAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXG4gICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hlbmQuc2xpY2sgbW91c2V1cC5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eSk7XG5cbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3Qub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9mZignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ub3JpZW50YXRpb25DaGFuZ2UpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub2ZmKCdkcmFnc3RhcnQnLCBfLnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBTbGlkZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRsaXN0Lm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgb3JpZ2luYWxTbGlkZXM7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlcy5jaGlsZHJlbigpLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmVtcHR5KCkuYXBwZW5kKG9yaWdpbmFsU2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihyZWZyZXNoKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcblxuICAgICAgICBfLmNsZWFuVXBFdmVudHMoKTtcblxuICAgICAgICAkKCcuc2xpY2stY2xvbmVkJywgXy4kc2xpZGVyKS5kZXRhY2goKTtcblxuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKCBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCBzbGljay1hcnJvdyBzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywnJyk7XG5cbiAgICAgICAgICAgIGlmICggXy5odG1sRXhwci50ZXN0KCBfLm9wdGlvbnMucHJldkFycm93ICkpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5uZXh0QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay12aXNpYmxlIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29yaWdpbmFsU3R5bGluZycpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRsaXN0LmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYXBwZW5kKF8uJHNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBfLmNsZWFuVXBSb3dzKCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZXInKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgIF8udW5zbGlja2VkID0gdHJ1ZTtcblxuICAgICAgICBpZighcmVmcmVzaCkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2Rlc3Ryb3knLCBbX10pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRpc2FibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICcnO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlID0gZnVuY3Rpb24oc2xpZGVJbmRleCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGVPdXQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJylcbiAgICAgICAgICAgIC5vbignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycsXG4gICAgICAgICAgICAgICAgJyo6bm90KC5zbGljay1hcnJvdyknLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHZhciAkc2YgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYoIF8ub3B0aW9ucy5wYXVzZU9uRm9jdXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9jdXNzZWQgPSAkc2YuaXMoJzpmb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCAwKTtcblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldEN1cnJlbnQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tDdXJyZW50U2xpZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLmN1cnJlbnRTbGlkZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0RG90Q291bnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAwO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIHZhciBwYWdlclF0eSA9IDA7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYWdlclF0eSA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIGlmKCFfLm9wdGlvbnMuYXNOYXZGb3IpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gMSArIE1hdGguY2VpbCgoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFnZXJRdHkgLSAxO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRhcmdldExlZnQsXG4gICAgICAgICAgICB2ZXJ0aWNhbEhlaWdodCxcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIHRhcmdldFNsaWRlO1xuXG4gICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICB2ZXJ0aWNhbEhlaWdodCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IChfLnNsaWRlV2lkdGggKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKHZlcnRpY2FsSGVpZ2h0ICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA+IF8uc2xpZGVDb3VudCAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogXy5zbGlkZVdpZHRoO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogdmVydGljYWxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSAtIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiBfLnNsaWRlV2lkdGgpICogLTEpICsgXy5zbGlkZU9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uJHNsaWRlVHJhY2sud2lkdGgoKSAtIHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgLSB0YXJnZXRTbGlkZS53aWR0aCgpKSAqIC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIGNvdW50ZXIgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IG1heCkge1xuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xuICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGljayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGlkZUNvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkLCBzd2lwZWRTbGlkZSwgY2VudGVyT2Zmc2V0O1xuXG4gICAgICAgIGNlbnRlck9mZnNldCA9IF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlID8gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgOiAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1zbGlkZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHNsaWRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlLm9mZnNldExlZnQgLSBjZW50ZXJPZmZzZXQgKyAoJChzbGlkZSkub3V0ZXJXaWR0aCgpIC8gMikgPiAoXy5zd2lwZUxlZnQgKiAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVkU2xpZGUgPSBzbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXNUcmF2ZXJzZWQgPSBNYXRoLmFicygkKHN3aXBlZFNsaWRlKS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JykgLSBfLmN1cnJlbnRTbGlkZSkgfHwgMTtcblxuICAgICAgICAgICAgcmV0dXJuIHNsaWRlc1RyYXZlcnNlZDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nb1RvID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR29UbyA9IGZ1bmN0aW9uKHNsaWRlLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGluZGV4OiBwYXJzZUludChzbGlkZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZG9udEFuaW1hdGUpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY3JlYXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCEkKF8uJHNsaWRlcikuaGFzQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJykpIHtcblxuICAgICAgICAgICAgJChfLiRzbGlkZXIpLmFkZENsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuXG4gICAgICAgICAgICBfLmJ1aWxkUm93cygpO1xuICAgICAgICAgICAgXy5idWlsZE91dCgpO1xuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICAgICAgXy5zdGFydExvYWQoKTtcbiAgICAgICAgICAgIF8ubG9hZFNsaWRlcigpO1xuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSh0cnVlKTtcbiAgICAgICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjcmVhdGlvbikge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2luaXQnLCBbX10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmluaXRBREEoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdEFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlcy5hZGQoXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hdHRyKCdyb2xlJywgJ2xpc3Rib3gnKTtcblxuICAgICAgICBfLiRzbGlkZXMubm90KF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAgICAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6ICdzbGljay1zbGlkZScgKyBfLmluc3RhbmNlVWlkICsgaSArICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF8uJGRvdHMuYXR0cigncm9sZScsICd0YWJsaXN0JykuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAncm9sZSc6ICdwcmVzZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ25hdmlnYXRpb24nICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpICsgJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCkuYXR0cignYXJpYS1zZWxlY3RlZCcsICd0cnVlJykuZW5kKClcbiAgICAgICAgICAgICAgICAuZmluZCgnYnV0dG9uJykuYXR0cigncm9sZScsICdidXR0b24nKS5lbmQoKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCdkaXYnKS5hdHRyKCdyb2xlJywgJ3Rvb2xiYXInKTtcbiAgICAgICAgfVxuICAgICAgICBfLmFjdGl2YXRlQURBKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0U2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucGF1c2VPbkhvdmVyICkge1xuXG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdzdGFydCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsICQucHJveHkoXy52aXNpYmlsaXR5LCBfKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ub3JpZW50YXRpb25DaGFuZ2UsIF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLnJlc2l6ZSwgXykpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgIC8vRG9udCBzbGlkZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSB0aGUgZm9ybSBmaWVsZHMgYW5kIGFycm93IGtleXMgYXJlIHByZXNzZWRcbiAgICAgICAgaWYoIWV2ZW50LnRhcmdldC50YWdOYW1lLm1hdGNoKCdURVhUQVJFQXxJTlBVVHxTRUxFQ1QnKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAnbmV4dCcgOiAgJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAncHJldmlvdXMnIDogJ25leHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZEltYWdlcyhpbWFnZXNTY29wZSkge1xuXG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtbGF6eScpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBpbWFnZVNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFtfLCBpbWFnZSwgaW1hZ2VTb3VyY2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IE1hdGguY2VpbChyYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VFbmQgPD0gXy5zbGlkZUNvdW50KSByYW5nZUVuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcbiAgICAgICAgbG9hZEltYWdlcyhsb2FkUmFuZ2UpO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoMCwgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZShfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICogLTEpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sb2FkU2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uaW5pdFVJKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ3Byb2dyZXNzaXZlJykge1xuICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubmV4dCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja05leHQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ25leHQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5vcmllbnRhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBhdXNlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGF1c2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG4gICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGxheSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICBfLmZvY3Vzc2VkID0gZmFsc2U7XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucG9zdFNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICFfLnVuc2xpY2tlZCApIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICAgICAgICAgIF8uYW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uaW5pdEFEQSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1ByZXYgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbiggdHJ5Q291bnQgKSB7XG5cbiAgICAgICAgdHJ5Q291bnQgPSB0cnlDb3VudCB8fCAxO1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgICRpbWdzVG9Mb2FkID0gJCggJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyICksXG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIGltYWdlU291cmNlLFxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQ7XG5cbiAgICAgICAgaWYgKCAkaW1nc1RvTG9hZC5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIGltYWdlID0gJGltZ3NUb0xvYWQuZmlyc3QoKTtcbiAgICAgICAgICAgIGltYWdlU291cmNlID0gaW1hZ2UuYXR0cignZGF0YS1sYXp5Jyk7XG4gICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnc3JjJywgaW1hZ2VTb3VyY2UgKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5JylcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZGVkJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG4gICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmICggdHJ5Q291bnQgPCAzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB0cnkgdG8gbG9hZCB0aGUgaW1hZ2UgMyB0aW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICogbGVhdmUgYSBzbGlnaHQgZGVsYXkgc28gd2UgZG9uJ3QgZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqIHNlcnZlcnMgYmxvY2tpbmcgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCggdHJ5Q291bnQgKyAxICk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdhbGxJbWFnZXNMb2FkZWQnLCBbIF8gXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oIGluaXRpYWxpemluZyApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGN1cnJlbnRTbGlkZSwgbGFzdFZpc2libGVJbmRleDtcblxuICAgICAgICBsYXN0VmlzaWJsZUluZGV4ID0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcblxuICAgICAgICAvLyBpbiBub24taW5maW5pdGUgc2xpZGVycywgd2UgZG9uJ3Qgd2FudCB0byBnbyBwYXN0IHRoZVxuICAgICAgICAvLyBsYXN0IHZpc2libGUgaW5kZXguXG4gICAgICAgIGlmKCAhXy5vcHRpb25zLmluZmluaXRlICYmICggXy5jdXJyZW50U2xpZGUgPiBsYXN0VmlzaWJsZUluZGV4ICkpIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gbGFzdFZpc2libGVJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGxlc3Mgc2xpZGVzIHRoYW4gdG8gc2hvdywgZ28gdG8gc3RhcnQuXG4gICAgICAgIGlmICggXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuXG4gICAgICAgIF8uZGVzdHJveSh0cnVlKTtcblxuICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzLCB7IGN1cnJlbnRTbGlkZTogY3VycmVudFNsaWRlIH0pO1xuXG4gICAgICAgIF8uaW5pdCgpO1xuXG4gICAgICAgIGlmKCAhaW5pdGlhbGl6aW5nICkge1xuXG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBjdXJyZW50U2xpZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWdpc3RlckJyZWFrcG9pbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBicmVha3BvaW50LCBjdXJyZW50QnJlYWtwb2ludCwgbCxcbiAgICAgICAgICAgIHJlc3BvbnNpdmVTZXR0aW5ncyA9IF8ub3B0aW9ucy5yZXNwb25zaXZlIHx8IG51bGw7XG5cbiAgICAgICAgaWYgKCAkLnR5cGUocmVzcG9uc2l2ZVNldHRpbmdzKSA9PT0gJ2FycmF5JyAmJiByZXNwb25zaXZlU2V0dGluZ3MubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG5cbiAgICAgICAgICAgIGZvciAoIGJyZWFrcG9pbnQgaW4gcmVzcG9uc2l2ZVNldHRpbmdzICkge1xuXG4gICAgICAgICAgICAgICAgbCA9IF8uYnJlYWtwb2ludHMubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgY3VycmVudEJyZWFrcG9pbnQgPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uYnJlYWtwb2ludDtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zaXZlU2V0dGluZ3MuaGFzT3duUHJvcGVydHkoYnJlYWtwb2ludCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGJyZWFrcG9pbnRzIGFuZCBjdXQgb3V0IGFueSBleGlzdGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmVzIHdpdGggdGhlIHNhbWUgYnJlYWtwb2ludCBudW1iZXIsIHdlIGRvbid0IHdhbnQgZHVwZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5icmVha3BvaW50c1tsXSAmJiBfLmJyZWFrcG9pbnRzW2xdID09PSBjdXJyZW50QnJlYWtwb2ludCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnNwbGljZShsLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50cy5wdXNoKGN1cnJlbnRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbY3VycmVudEJyZWFrcG9pbnRdID0gcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICggXy5vcHRpb25zLm1vYmlsZUZpcnN0ICkgPyBhLWIgOiBiLWE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXMgPVxuICAgICAgICAgICAgXy4kc2xpZGVUcmFja1xuICAgICAgICAgICAgICAgIC5jaGlsZHJlbihfLm9wdGlvbnMuc2xpZGUpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5yZWdpc3RlckJyZWFrcG9pbnRzKCk7XG5cbiAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICBfLnNldHVwSW5maW5pdGUoKTtcbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICBfLmluaXRBcnJvd0V2ZW50cygpO1xuICAgICAgICBfLmJ1aWxkRG90cygpO1xuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uY2xlYW5VcFNsaWRlRXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgXy5wYXVzZWQgPSAhXy5vcHRpb25zLmF1dG9wbGF5O1xuICAgICAgICBfLmF1dG9QbGF5KCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3JlSW5pdCcsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgIT09IF8ud2luZG93V2lkdGgpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChfLndpbmRvd0RlbGF5KTtcbiAgICAgICAgICAgIF8ud2luZG93RGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLndpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgICAgICAgICBpZiggIV8udW5zbGlja2VkICkgeyBfLnNldFBvc2l0aW9uKCk7IH1cbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVtb3ZlU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tSZW1vdmUgPSBmdW5jdGlvbihpbmRleCwgcmVtb3ZlQmVmb3JlLCByZW1vdmVBbGwpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmVtb3ZlQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IDAgOiBfLnNsaWRlQ291bnQgLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAtLWluZGV4IDogaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDwgMSB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiBfLnNsaWRlQ291bnQgLSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmIChyZW1vdmVBbGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oKS5yZW1vdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5lcShpbmRleCkucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0Q1NTID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge30sXG4gICAgICAgICAgICB4LCB5O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IC1wb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgICB4ID0gXy5wb3NpdGlvblByb3AgPT0gJ2xlZnQnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcbiAgICAgICAgeSA9IF8ucG9zaXRpb25Qcm9wID09ICd0b3AnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcblxuICAgICAgICBwb3NpdGlvblByb3BzW18ucG9zaXRpb25Qcm9wXSA9IHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge307XG4gICAgICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICsgeCArICcsICcgKyB5ICsgJyknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJywgJyArIHkgKyAnLCAwcHgpJztcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICgnMHB4ICcgKyBfLm9wdGlvbnMuY2VudGVyUGFkZGluZylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJGxpc3QuaGVpZ2h0KF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IChfLm9wdGlvbnMuY2VudGVyUGFkZGluZyArICcgMHB4JylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8ubGlzdFdpZHRoID0gXy4kbGlzdC53aWR0aCgpO1xuICAgICAgICBfLmxpc3RIZWlnaHQgPSBfLiRsaXN0LmhlaWdodCgpO1xuXG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGggLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2sud2lkdGgoTWF0aC5jZWlsKChfLnNsaWRlV2lkdGggKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aCg1MDAwICogXy5zbGlkZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCk7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmhlaWdodChNYXRoLmNlaWwoKF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykubGVuZ3RoKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVyV2lkdGgodHJ1ZSkgLSBfLiRzbGlkZXMuZmlyc3QoKS53aWR0aCgpO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS53aWR0aChfLnNsaWRlV2lkdGggLSBvZmZzZXQpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRGYWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLnNsaWRlV2lkdGggKiBpbmRleCkgKiAtMTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDIsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5jc3Moe1xuICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMSxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICBfLiRsaXN0LmNzcygnaGVpZ2h0JywgdGFyZ2V0SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRPcHRpb24gPVxuICAgIFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhY2NlcHRzIGFyZ3VtZW50cyBpbiBmb3JtYXQgb2Y6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciBjaGFuZ2luZyBhIHNpbmdsZSBvcHRpb24ncyB2YWx1ZTpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2V0IG9mIHJlc3BvbnNpdmUgb3B0aW9uczpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCAncmVzcG9uc2l2ZScsIFt7fSwgLi4uXSwgcmVmcmVzaCApXG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciB1cGRhdGluZyBtdWx0aXBsZSB2YWx1ZXMgYXQgb25jZSAobm90IHJlc3BvbnNpdmUpXG4gICAgICAgICAqICAgICAuc2xpY2soXCJzZXRPcHRpb25cIiwgeyAnb3B0aW9uJzogdmFsdWUsIC4uLiB9LCByZWZyZXNoIClcbiAgICAgICAgICovXG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBsLCBpdGVtLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoID0gZmFsc2UsIHR5cGU7XG5cbiAgICAgICAgaWYoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdvYmplY3QnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgcmVmcmVzaCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHR5cGUgPSAnbXVsdGlwbGUnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICBpZiAoIGFyZ3VtZW50c1swXSA9PT0gJ3Jlc3BvbnNpdmUnICYmICQudHlwZSggYXJndW1lbnRzWzFdICkgPT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICB0eXBlID0gJ3Jlc3BvbnNpdmUnO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYXJndW1lbnRzWzFdICE9PSAndW5kZWZpbmVkJyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAnc2luZ2xlJztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHR5cGUgPT09ICdzaW5nbGUnICkge1xuXG4gICAgICAgICAgICBfLm9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuXG5cbiAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ211bHRpcGxlJyApIHtcblxuICAgICAgICAgICAgJC5lYWNoKCBvcHRpb24gLCBmdW5jdGlvbiggb3B0LCB2YWwgKSB7XG5cbiAgICAgICAgICAgICAgICBfLm9wdGlvbnNbb3B0XSA9IHZhbDtcblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAncmVzcG9uc2l2ZScgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGl0ZW0gaW4gdmFsdWUgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggJC50eXBlKCBfLm9wdGlvbnMucmVzcG9uc2l2ZSApICE9PSAnYXJyYXknICkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlID0gWyB2YWx1ZVtpdGVtXSBdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBsID0gXy5vcHRpb25zLnJlc3BvbnNpdmUubGVuZ3RoLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSByZXNwb25zaXZlIG9iamVjdCBhbmQgc3BsaWNlIG91dCBkdXBsaWNhdGVzLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSggbCA+PSAwICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnJlc3BvbnNpdmVbbF0uYnJlYWtwb2ludCA9PT0gdmFsdWVbaXRlbV0uYnJlYWtwb2ludCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLnNwbGljZShsLDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGwtLTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUucHVzaCggdmFsdWVbaXRlbV0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHJlZnJlc2ggKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgXy5zZXRIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNldENTUyhfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2V0RmFkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3NldFBvc2l0aW9uJywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UHJvcHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBib2R5U3R5bGUgPSBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG4gICAgICAgIF8ucG9zaXRpb25Qcm9wID0gXy5vcHRpb25zLnZlcnRpY2FsID09PSB0cnVlID8gJ3RvcCcgOiAnbGVmdCc7XG5cbiAgICAgICAgaWYgKF8ucG9zaXRpb25Qcm9wID09PSAndG9wJykge1xuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5XZWJraXRUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5Nb3pUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5tc1RyYW5zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy51c2VDU1MgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmZhZGUgKSB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBfLm9wdGlvbnMuekluZGV4ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnpJbmRleCA8IDMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy56SW5kZXggPSAzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IF8uZGVmYXVsdHMuekluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5PVHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnT1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW8tdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnT1RyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLk1velRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ01velRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1vei10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdNb3pUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS5Nb3pQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS53ZWJraXRUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICd3ZWJraXRUcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy13ZWJraXQtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnd2Via2l0VHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdtc1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1zLXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ21zVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLnRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICYmIF8uYW5pbVR5cGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAndHJhbnNpdGlvbic7XG4gICAgICAgIH1cbiAgICAgICAgXy50cmFuc2Zvcm1zRW5hYmxlZCA9IF8ub3B0aW9ucy51c2VUcmFuc2Zvcm0gJiYgKF8uYW5pbVR5cGUgIT09IG51bGwgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpO1xuICAgIH07XG5cblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRTbGlkZUNsYXNzZXMgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGNlbnRlck9mZnNldCwgYWxsU2xpZGVzLCBpbmRleE9mZnNldCwgcmVtYWluZGVyO1xuXG4gICAgICAgIGFsbFNsaWRlcyA9IF8uJHNsaWRlclxuICAgICAgICAgICAgLmZpbmQoJy5zbGljay1zbGlkZScpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stY3VycmVudCcpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLmVxKGluZGV4KVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jdXJyZW50Jyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY2VudGVyT2Zmc2V0ICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSAxKSAtIGNlbnRlck9mZnNldCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0LCBpbmRleCArIGNlbnRlck9mZnNldCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gY2VudGVyT2Zmc2V0ICsgMSwgaW5kZXhPZmZzZXQgKyBjZW50ZXJPZmZzZXQgKyAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gXy5zbGlkZUNvdW50IC0gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLmVxKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5lcShpbmRleClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkge1xuXG4gICAgICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleCwgaW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFsbFNsaWRlcy5sZW5ndGggPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4IDogaW5kZXg7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgJiYgKF8uc2xpZGVDb3VudCAtIGluZGV4KSA8IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleE9mZnNldCAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gcmVtYWluZGVyKSwgaW5kZXhPZmZzZXQgKyByZW1haW5kZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQsIGluZGV4T2Zmc2V0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcbiAgICAgICAgICAgIF8ubGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKS5maW5kKCdbaWRdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW50ZXJydXB0ID0gZnVuY3Rpb24oIHRvZ2dsZSApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICF0b2dnbGUgKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRvZ2dsZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID1cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5pcygnLnNsaWNrLXNsaWRlJykgP1xuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KSA6XG4gICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnBhcmVudHMoJy5zbGljay1zbGlkZScpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcblxuICAgICAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKGluZGV4KTtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgICAgICAgIF8gPSB0aGlzLCBuYXZUYXJnZXQ7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XG4gICAgICAgIHNsaWRlTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiBfLmdldERvdENvdW50KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0U2xpZGUgPCAwKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50IC0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCArIHRhcmdldFNsaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldFNsaWRlID49IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlIC0gXy5zbGlkZUNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGU7XG4gICAgICAgIH1cblxuICAgICAgICBfLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2JlZm9yZUNoYW5nZScsIFtfLCBfLmN1cnJlbnRTbGlkZSwgYW5pbVNsaWRlXSk7XG5cbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmFzTmF2Rm9yICkge1xuXG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBfLmdldE5hdlRhcmdldCgpO1xuICAgICAgICAgICAgbmF2VGFyZ2V0ID0gbmF2VGFyZ2V0LnNsaWNrKCdnZXRTbGljaycpO1xuXG4gICAgICAgICAgICBpZiAoIG5hdlRhcmdldC5zbGlkZUNvdW50IDw9IG5hdlRhcmdldC5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgICAgICBuYXZUYXJnZXQuc2V0U2xpZGVDbGFzc2VzKF8uY3VycmVudFNsaWRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlT3V0KG9sZFNsaWRlKTtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlKGFuaW1TbGlkZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICAgICAgeERpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAtIF8udG91Y2hPYmplY3QuY3VyWDtcbiAgICAgICAgeURpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSAtIF8udG91Y2hPYmplY3QuY3VyWTtcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgICAgICBzd2lwZUFuZ2xlID0gTWF0aC5yb3VuZChyICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgc3dpcGVBbmdsZSA9IDM2MCAtIE1hdGguYWJzKHN3aXBlQW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDQ1KSAmJiAoc3dpcGVBbmdsZSA+PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMTM1KSAmJiAoc3dpcGVBbmdsZSA8PSAyMjUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMTM1KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG93bic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAndXAnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZUNvdW50LFxuICAgICAgICAgICAgZGlyZWN0aW9uO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuICAgICAgICBfLnNob3VsZENsaWNrID0gKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gMTAgKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3QuY3VyWCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignZWRnZScsIFtfLCBfLnN3aXBlRGlyZWN0aW9uKCkgXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPj0gXy50b3VjaE9iamVjdC5taW5Td2lwZSApIHtcblxuICAgICAgICAgICAgZGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKCBkaXJlY3Rpb24gKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBkaXJlY3Rpb24gIT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBzbGlkZUNvdW50ICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzd2lwZScsIFtfLCBkaXJlY3Rpb24gXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clggKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggXy5jdXJyZW50U2xpZGUgKTtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggOiAxO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0SGVpZ2h0IC8gXy5vcHRpb25zXG4gICAgICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVFbmQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBlZGdlV2FzSGl0ID0gZmFsc2UsXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xuXG4gICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgPyBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgOiBudWxsO1xuXG4gICAgICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJYIC0gXy50b3VjaE9iamVjdC5zdGFydFgsIDIpKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggKiBfLm9wdGlvbnMuZWRnZUZyaWN0aW9uO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrVW5maWx0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJHNsaWRlc0NhY2hlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oZnJvbUJyZWFrcG9pbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCd1bnNsaWNrJywgW18sIGZyb21CcmVha3BvaW50XSk7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXG4gICAgICAgICAgICAhXy5vcHRpb25zLmluZmluaXRlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHNcbiAgICAgICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgICAgIC5lcShNYXRoLmZsb29yKF8uY3VycmVudFNsaWRlIC8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBpZiAoIGRvY3VtZW50W18uaGlkZGVuXSApIHtcblxuICAgICAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4uc2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBsID0gXy5sZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgcmV0O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXztcbiAgICB9O1xuXG59KSk7XG4iLCIhZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuICAvLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxuICB2YXIgRm91bmRhdGlvbiA9IHtcbiAgICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBfcGx1Z2luczoge30sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICAgKi9cbiAgICBfdXVpZHM6IFtdLFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAgICovXG4gICAgcnRsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgICAqL1xuICAgIHBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbiwgbmFtZSkge1xuICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgICB2YXIgY2xhc3NOYW1lID0gbmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKTtcbiAgICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICAgIHZhciBhdHRyTmFtZSA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAgICovXG4gICAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4sIG5hbWUpIHtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICAgIGlmICghcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpKSB7XG4gICAgICAgIHBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLCBwbHVnaW4udXVpZCk7XG4gICAgICB9XG4gICAgICBpZiAoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgIHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAqL1xuICAgICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoJ2luaXQuemYuJyArIHBsdWdpbk5hbWUpO1xuXG4gICAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgKi9cbiAgICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICovXG4gICAgICAudHJpZ2dlcignZGVzdHJveWVkLnpmLicgKyBwbHVnaW5OYW1lKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gcGx1Z2luKSB7XG4gICAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7IC8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAgICovXG4gICAgcmVJbml0OiBmdW5jdGlvbiAocGx1Z2lucykge1xuICAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChpc0pRKSB7XG4gICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uIChwbGdzKSB7XG4gICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtJyArIHAgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgICQoJ1tkYXRhLScgKyBwbHVnaW5zICsgJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgICAqL1xuICAgIEdldFlvRGlnaXRzOiBmdW5jdGlvbiAobGVuZ3RoLCBuYW1lc3BhY2UpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gJy0nICsgbmFtZXNwYWNlIDogJycpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgICAqL1xuICAgIHJlZmxvdzogZnVuY3Rpb24gKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICAgICAgfVxuXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbiAoaSwgbmFtZSkge1xuICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJyArIG5hbWUgKyAnXScpLmFkZEJhY2soJ1tkYXRhLScgKyBuYW1lICsgJ10nKTtcblxuICAgICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIgKyBuYW1lICsgXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICgkZWwuYXR0cignZGF0YS1vcHRpb25zJykpIHtcbiAgICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLnRyaW0oKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24gKCRlbGVtKSB7XG4gICAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICAgIH07XG4gICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgIGVuZDtcblxuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgcmV0dXJuIGVuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICAgIH0sIDEpO1xuICAgICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBGb3VuZGF0aW9uLnV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLFxuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIC8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuICAvLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbiAgLyoqXG4gICAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICAgKi9cbiAgdmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gICAgaWYgKCEkbWV0YS5sZW5ndGgpIHtcbiAgICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICAgIH1cbiAgICBpZiAoJG5vSlMubGVuZ3RoKSB7XG4gICAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7IC8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOyAvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICAgIGlmIChwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgLy9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgLy9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignV2VcXCdyZSBzb3JyeSwgJyArIHR5cGUgKyAnIGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgd2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuICAkLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4gIC8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fCB3aW5kb3dbdnAgKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuICAgIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7XG4gICAgICAgIH0sIG5leHRUaW1lIC0gbm93KTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgICAqL1xuICAgIGlmICghd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgICBub3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9KSgpO1xuICBpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgfVxuXG4gICAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QID8gdGhpcyA6IG9UaGlzLCBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgfVxuICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICAgIHJldHVybiBmQm91bmQ7XG4gICAgfTtcbiAgfVxuICAvLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbiAgZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gICAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgICB2YXIgcmVzdWx0cyA9IGZ1bmNOYW1lUmVnZXguZXhlYyhmbi50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiByZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgICB9IGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwYXJzZVZhbHVlKHN0cikge1xuICAgIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7ZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7ZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIHJldHVybiBzdHI7XG4gIH1cbiAgLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2VcbiAgLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG4gIGZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gIH1cbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIEZvdW5kYXRpb24uQm94ID0ge1xuICAgIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gICAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG4gIH07XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICAgKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAgIHRvcCxcbiAgICAgICAgYm90dG9tLFxuICAgICAgICBsZWZ0LFxuICAgICAgICByaWdodDtcblxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgICBib3R0b20gPSBlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcDtcbiAgICAgIHRvcCA9IGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3A7XG4gICAgICBsZWZ0ID0gZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0O1xuICAgICAgcmlnaHQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoICsgcGFyRGltcy5vZmZzZXQubGVmdDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm90dG9tID0gZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wO1xuICAgICAgdG9wID0gZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wO1xuICAgICAgbGVmdCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0O1xuICAgICAgcmlnaHQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGg7XG4gICAgfVxuXG4gICAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICAgIGlmIChsck9ubHkpIHtcbiAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGJPbmx5KSB7XG4gICAgICByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAgICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gICAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KSB7XG4gICAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgICBpZiAoZWxlbSA9PT0gd2luZG93IHx8IGVsZW0gPT09IGRvY3VtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgICB9XG5cbiAgICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICB3aW5ZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luWSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgICAgfSxcbiAgICAgIHBhcmVudERpbXM6IHtcbiAgICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgICAgd2lkdGg6IHdpblJlY3Qud2lkdGgsXG4gICAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgIHRvcDogd2luWSxcbiAgICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRvcCBhbmQgbGVmdCBpbnRlZ2VyIHBpeGVsIHZhbHVlcyBmb3IgZHluYW1pY2FsbHkgcmVuZGVyZWQgZWxlbWVudHMsXG4gICAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gICAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICAgKi9cbiAgZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gICAgdmFyICRlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCAvIDIgLSAkZWxlRGltcy53aWR0aCAvIDIsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogaXNPdmVyZmxvdyA/IGhPZmZzZXQgOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMixcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0IC8gMiAtICRlbGVEaW1zLmhlaWdodCAvIDJcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0ICsgMSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCArICRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyLFxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgY2FzZSAncmV2ZWFsIGZ1bGwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0LFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LGUsbyxpKXt2YXIgcyxoLG4sdyxkPWYodCk7aWYoZSl7dmFyIHI9ZihlKTtoPWQub2Zmc2V0LnRvcCtkLmhlaWdodDw9ci5oZWlnaHQrci5vZmZzZXQudG9wLHM9ZC5vZmZzZXQudG9wPj1yLm9mZnNldC50b3Asbj1kLm9mZnNldC5sZWZ0Pj1yLm9mZnNldC5sZWZ0LHc9ZC5vZmZzZXQubGVmdCtkLndpZHRoPD1yLndpZHRoK3Iub2Zmc2V0LmxlZnR9ZWxzZSBoPWQub2Zmc2V0LnRvcCtkLmhlaWdodDw9ZC53aW5kb3dEaW1zLmhlaWdodCtkLndpbmRvd0RpbXMub2Zmc2V0LnRvcCxzPWQub2Zmc2V0LnRvcD49ZC53aW5kb3dEaW1zLm9mZnNldC50b3Asbj1kLm9mZnNldC5sZWZ0Pj1kLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsdz1kLm9mZnNldC5sZWZ0K2Qud2lkdGg8PWQud2luZG93RGltcy53aWR0aDt2YXIgbD1baCxzLG4sd107cmV0dXJuIG8/bj09PXc9PSEwOmk/cz09PWg9PSEwOmwuaW5kZXhPZighMSk9PT0tMX1mdW5jdGlvbiBmKHQsZSl7aWYodD10Lmxlbmd0aD90WzBdOnQsdD09PXdpbmRvd3x8dD09PWRvY3VtZW50KXRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO3ZhciBmPXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksbz10LnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksaT1kb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLHM9d2luZG93LnBhZ2VZT2Zmc2V0LGg9d2luZG93LnBhZ2VYT2Zmc2V0O3JldHVybnt3aWR0aDpmLndpZHRoLGhlaWdodDpmLmhlaWdodCxvZmZzZXQ6e3RvcDpmLnRvcCtzLGxlZnQ6Zi5sZWZ0K2h9LHBhcmVudERpbXM6e3dpZHRoOm8ud2lkdGgsaGVpZ2h0Om8uaGVpZ2h0LG9mZnNldDp7dG9wOm8udG9wK3MsbGVmdDpvLmxlZnQraH19LHdpbmRvd0RpbXM6e3dpZHRoOmkud2lkdGgsaGVpZ2h0OmkuaGVpZ2h0LG9mZnNldDp7dG9wOnMsbGVmdDpofX19fWZ1bmN0aW9uIG8odCxlLG8saSxzLGgpe3ZhciBuPWYodCksdz1lP2YoZSk6bnVsbDtzd2l0Y2gobyl7Y2FzZVwidG9wXCI6cmV0dXJue2xlZnQ6Rm91bmRhdGlvbi5ydGwoKT93Lm9mZnNldC5sZWZ0LW4ud2lkdGgrdy53aWR0aDp3Lm9mZnNldC5sZWZ0LHRvcDp3Lm9mZnNldC50b3AtKG4uaGVpZ2h0K2kpfTtjYXNlXCJsZWZ0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdC0obi53aWR0aCtzKSx0b3A6dy5vZmZzZXQudG9wfTtjYXNlXCJyaWdodFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzLHRvcDp3Lm9mZnNldC50b3B9O2Nhc2VcImNlbnRlciB0b3BcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgvMi1uLndpZHRoLzIsdG9wOncub2Zmc2V0LnRvcC0obi5oZWlnaHQraSl9O2Nhc2VcImNlbnRlciBib3R0b21cIjpyZXR1cm57bGVmdDpoP3M6dy5vZmZzZXQubGVmdCt3LndpZHRoLzItbi53aWR0aC8yLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX07Y2FzZVwiY2VudGVyIGxlZnRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LShuLndpZHRoK3MpLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJjZW50ZXIgcmlnaHRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgrcysxLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJjZW50ZXJcIjpyZXR1cm57bGVmdDpuLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQrbi53aW5kb3dEaW1zLndpZHRoLzItbi53aWR0aC8yLHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcCtuLndpbmRvd0RpbXMuaGVpZ2h0LzItbi5oZWlnaHQvMn07Y2FzZVwicmV2ZWFsXCI6cmV0dXJue2xlZnQ6KG4ud2luZG93RGltcy53aWR0aC1uLndpZHRoKS8yLHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcCtpfTtjYXNlXCJyZXZlYWwgZnVsbFwiOnJldHVybntsZWZ0Om4ud2luZG93RGltcy5vZmZzZXQubGVmdCx0b3A6bi53aW5kb3dEaW1zLm9mZnNldC50b3B9O2Nhc2VcImxlZnQgYm90dG9tXCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9O2Nhc2VcInJpZ2h0IGJvdHRvbVwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzLW4ud2lkdGgsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfTtkZWZhdWx0OnJldHVybntsZWZ0OkZvdW5kYXRpb24ucnRsKCk/dy5vZmZzZXQubGVmdC1uLndpZHRoK3cud2lkdGg6dy5vZmZzZXQubGVmdCtzLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX19fUZvdW5kYXRpb24uQm94PXtJbU5vdFRvdWNoaW5nWW91OmUsR2V0RGltZW5zaW9uczpmLEdldE9mZnNldHM6b319KGpRdWVyeSk7IiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICB2YXIga2V5Q29kZXMgPSB7XG4gICAgOTogJ1RBQicsXG4gICAgMTM6ICdFTlRFUicsXG4gICAgMjc6ICdFU0NBUEUnLFxuICAgIDMyOiAnU1BBQ0UnLFxuICAgIDM3OiAnQVJST1dfTEVGVCcsXG4gICAgMzg6ICdBUlJPV19VUCcsXG4gICAgMzk6ICdBUlJPV19SSUdIVCcsXG4gICAgNDA6ICdBUlJPV19ET1dOJ1xuICB9O1xuXG4gIHZhciBjb21tYW5kcyA9IHt9O1xuXG4gIHZhciBLZXlib2FyZCA9IHtcbiAgICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgICAqL1xuICAgIHBhcnNlS2V5OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSAnU0hJRlRfJyArIGtleTtcbiAgICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSAnQ1RSTF8nICsga2V5O1xuICAgICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gJ0FMVF8nICsga2V5O1xuXG4gICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgICByZXR1cm4ga2V5O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAgICovXG4gICAgaGFuZGxlS2V5OiBmdW5jdGlvbiAoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgICAgICBjbWRzLFxuICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgZm47XG5cbiAgICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO2Vsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgICB9XG4gICAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICAgKi9cbiAgICBmaW5kRm9jdXNhYmxlOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgIGlmICghJGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAgICovXG5cbiAgICByZWdpc3RlcjogZnVuY3Rpb24gKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgICAqL1xuICAgIHRyYXBGb2N1czogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGxhc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdUQUInKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICRsYXN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlcyB0aGUgdHJhcHBlZCBmb2N1cyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgICAqL1xuICAgIHJlbGVhc2VGb2N1czogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gICAgfVxuICB9O1xuXG4gIC8qXG4gICAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqL1xuICBmdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgICB2YXIgayA9IHt9O1xuICAgIGZvciAodmFyIGtjIGluIGtjcykge1xuICAgICAga1trY3Nba2NdXSA9IGtjc1trY107XG4gICAgfXJldHVybiBrO1xuICB9XG5cbiAgRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihlKXtmdW5jdGlvbiBuKGUpe3ZhciBuPXt9O2Zvcih2YXIgdCBpbiBlKW5bZVt0XV09ZVt0XTtyZXR1cm4gbn12YXIgdD17OTpcIlRBQlwiLDEzOlwiRU5URVJcIiwyNzpcIkVTQ0FQRVwiLDMyOlwiU1BBQ0VcIiwzNzpcIkFSUk9XX0xFRlRcIiwzODpcIkFSUk9XX1VQXCIsMzk6XCJBUlJPV19SSUdIVFwiLDQwOlwiQVJST1dfRE9XTlwifSxvPXt9LHI9e2tleXM6bih0KSxwYXJzZUtleTpmdW5jdGlvbihlKXt2YXIgbj10W2Uud2hpY2h8fGUua2V5Q29kZV18fFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9VcHBlckNhc2UoKTtyZXR1cm4gbj1uLnJlcGxhY2UoL1xcVysvLFwiXCIpLGUuc2hpZnRLZXkmJihuPVwiU0hJRlRfXCIrbiksZS5jdHJsS2V5JiYobj1cIkNUUkxfXCIrbiksZS5hbHRLZXkmJihuPVwiQUxUX1wiK24pLG49bi5yZXBsYWNlKC9fJC8sXCJcIil9LGhhbmRsZUtleTpmdW5jdGlvbihuLHQscil7dmFyIGEsaSxkLGY9b1t0XSx1PXRoaXMucGFyc2VLZXkobik7aWYoIWYpcmV0dXJuIGNvbnNvbGUud2FybihcIkNvbXBvbmVudCBub3QgZGVmaW5lZCFcIik7aWYoYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgZi5sdHI/ZjpGb3VuZGF0aW9uLnJ0bCgpP2UuZXh0ZW5kKHt9LGYubHRyLGYucnRsKTplLmV4dGVuZCh7fSxmLnJ0bCxmLmx0ciksaT1hW3VdLGQ9cltpXSxkJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBkKXt2YXIgbD1kLmFwcGx5KCk7KHIuaGFuZGxlZHx8XCJmdW5jdGlvblwiPT10eXBlb2Ygci5oYW5kbGVkKSYmci5oYW5kbGVkKGwpfWVsc2Uoci51bmhhbmRsZWR8fFwiZnVuY3Rpb25cIj09dHlwZW9mIHIudW5oYW5kbGVkKSYmci51bmhhbmRsZWQoKX0sZmluZEZvY3VzYWJsZTpmdW5jdGlvbihuKXtyZXR1cm4hIW4mJm4uZmluZChcImFbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV1cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuISghZSh0aGlzKS5pcyhcIjp2aXNpYmxlXCIpfHxlKHRoaXMpLmF0dHIoXCJ0YWJpbmRleFwiKTwwKX0pfSxyZWdpc3RlcjpmdW5jdGlvbihlLG4pe29bZV09bn0sdHJhcEZvY3VzOmZ1bmN0aW9uKGUpe3ZhciBuPUZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZShlKSx0PW4uZXEoMCksbz1uLmVxKC0xKTtlLm9uKFwia2V5ZG93bi56Zi50cmFwZm9jdXNcIixmdW5jdGlvbihlKXtlLnRhcmdldD09PW9bMF0mJlwiVEFCXCI9PT1Gb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGUpPyhlLnByZXZlbnREZWZhdWx0KCksdC5mb2N1cygpKTplLnRhcmdldD09PXRbMF0mJlwiU0hJRlRfVEFCXCI9PT1Gb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGUpJiYoZS5wcmV2ZW50RGVmYXVsdCgpLG8uZm9jdXMoKSl9KX0scmVsZWFzZUZvY3VzOmZ1bmN0aW9uKGUpe2Uub2ZmKFwia2V5ZG93bi56Zi50cmFwZm9jdXNcIil9fTtGb3VuZGF0aW9uLktleWJvYXJkPXJ9KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG4gIHZhciBkZWZhdWx0UXVlcmllcyA9IHtcbiAgICAnZGVmYXVsdCc6ICdvbmx5IHNjcmVlbicsXG4gICAgbGFuZHNjYXBlOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICAgcG9ydHJhaXQ6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAgIHJldGluYTogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xuICB9O1xuXG4gIHZhciBNZWRpYVF1ZXJ5ID0ge1xuICAgIHF1ZXJpZXM6IFtdLFxuXG4gICAgY3VycmVudDogJycsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgICAgaWYgKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgdmFsdWU6ICdvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJyArIG5hbWVkUXVlcmllc1trZXldICsgJyknXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgICAgdGhpcy5fd2F0Y2hlcigpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgICAqL1xuICAgIGF0TGVhc3Q6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjaywgZWl0aGVyICdzbWFsbCBvbmx5JyBvciAnc21hbGwnLiBPbWl0dGluZyAnb25seScgZmFsbHMgYmFjayB0byB1c2luZyBhdExlYXN0KCkgbWV0aG9kLlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICAgKi9cbiAgICBpczogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgICAgaWYgKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgICBpZiAodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgICAqL1xuICAgIF9nZXRDdXJyZW50U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1hdGNoZWQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF93YXRjaGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpLFxuICAgICAgICAgICAgY3VycmVudFNpemUgPSBfdGhpcy5jdXJyZW50O1xuXG4gICAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuXG4gICAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbiAgLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuICAvLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxuICB3aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcblxuICAgIHZhciBzdHlsZU1lZGlhID0gd2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhO1xuXG4gICAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICAgIGlmICghc3R5bGVNZWRpYSkge1xuICAgICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICBzY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgICAgICAgaW5mbyA9IG51bGw7XG5cbiAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgc3R5bGUuaWQgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgICBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgaW5mbyA9ICdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgICAgfTtcbiAgICB9O1xuICB9KCkpO1xuXG4gIC8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbiAgZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICAgIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gICAgfVxuXG4gICAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICAgIGlmICghc3RyKSB7XG4gICAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gICAgfVxuXG4gICAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKHJldCwgcGFyYW0pIHtcbiAgICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJldFtrZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlKXt2YXIgdD17fTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZT90OihlPWUudHJpbSgpLnNsaWNlKDEsLTEpKT90PWUuc3BsaXQoXCImXCIpLnJlZHVjZShmdW5jdGlvbihlLHQpe3ZhciBuPXQucmVwbGFjZSgvXFwrL2csXCIgXCIpLnNwbGl0KFwiPVwiKSxyPW5bMF0saT1uWzFdO3JldHVybiByPWRlY29kZVVSSUNvbXBvbmVudChyKSxpPXZvaWQgMD09PWk/bnVsbDpkZWNvZGVVUklDb21wb25lbnQoaSksZS5oYXNPd25Qcm9wZXJ0eShyKT9BcnJheS5pc0FycmF5KGVbcl0pP2Vbcl0ucHVzaChpKTplW3JdPVtlW3JdLGldOmVbcl09aSxlfSx7fSk6dH12YXIgbj17cXVlcmllczpbXSxjdXJyZW50OlwiXCIsX2luaXQ6ZnVuY3Rpb24oKXt2YXIgbixyPXRoaXMsaT1lKFwiLmZvdW5kYXRpb24tbXFcIikuY3NzKFwiZm9udC1mYW1pbHlcIik7bj10KGkpO2Zvcih2YXIgYSBpbiBuKW4uaGFzT3duUHJvcGVydHkoYSkmJnIucXVlcmllcy5wdXNoKHtuYW1lOmEsdmFsdWU6XCJvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogXCIrblthXStcIilcIn0pO3RoaXMuY3VycmVudD10aGlzLl9nZXRDdXJyZW50U2l6ZSgpLHRoaXMuX3dhdGNoZXIoKX0sYXRMZWFzdDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLmdldChlKTtyZXR1cm4hIXQmJndpbmRvdy5tYXRjaE1lZGlhKHQpLm1hdGNoZXN9LGlzOmZ1bmN0aW9uKGUpe3JldHVybiBlPWUudHJpbSgpLnNwbGl0KFwiIFwiKSxlLmxlbmd0aD4xJiZcIm9ubHlcIj09PWVbMV0/ZVswXT09PXRoaXMuX2dldEN1cnJlbnRTaXplKCk6dGhpcy5hdExlYXN0KGVbMF0pfSxnZXQ6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0IGluIHRoaXMucXVlcmllcylpZih0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkodCkpe3ZhciBuPXRoaXMucXVlcmllc1t0XTtpZihlPT09bi5uYW1lKXJldHVybiBuLnZhbHVlfXJldHVybiBudWxsfSxfZ2V0Q3VycmVudFNpemU6ZnVuY3Rpb24oKXtmb3IodmFyIGUsdD0wO3Q8dGhpcy5xdWVyaWVzLmxlbmd0aDt0Kyspe3ZhciBuPXRoaXMucXVlcmllc1t0XTt3aW5kb3cubWF0Y2hNZWRpYShuLnZhbHVlKS5tYXRjaGVzJiYoZT1uKX1yZXR1cm5cIm9iamVjdFwiPT10eXBlb2YgZT9lLm5hbWU6ZX0sX3dhdGNoZXI6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO2Uod2luZG93KS5vbihcInJlc2l6ZS56Zi5tZWRpYXF1ZXJ5XCIsZnVuY3Rpb24oKXt2YXIgbj10Ll9nZXRDdXJyZW50U2l6ZSgpLHI9dC5jdXJyZW50O24hPT1yJiYodC5jdXJyZW50PW4sZSh3aW5kb3cpLnRyaWdnZXIoXCJjaGFuZ2VkLnpmLm1lZGlhcXVlcnlcIixbbixyXSkpfSl9fTtGb3VuZGF0aW9uLk1lZGlhUXVlcnk9bix3aW5kb3cubWF0Y2hNZWRpYXx8KHdpbmRvdy5tYXRjaE1lZGlhPWZ1bmN0aW9uKCl7dmFyIGU9d2luZG93LnN0eWxlTWVkaWF8fHdpbmRvdy5tZWRpYTtpZighZSl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpLG49ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIilbMF0scj1udWxsO3QudHlwZT1cInRleHQvY3NzXCIsdC5pZD1cIm1hdGNobWVkaWFqcy10ZXN0XCIsbiYmbi5wYXJlbnROb2RlJiZuLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHQsbikscj1cImdldENvbXB1dGVkU3R5bGVcImluIHdpbmRvdyYmd2luZG93LmdldENvbXB1dGVkU3R5bGUodCxudWxsKXx8dC5jdXJyZW50U3R5bGUsZT17bWF0Y2hNZWRpdW06ZnVuY3Rpb24oZSl7dmFyIG49XCJAbWVkaWEgXCIrZStcInsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9XCI7cmV0dXJuIHQuc3R5bGVTaGVldD90LnN0eWxlU2hlZXQuY3NzVGV4dD1uOnQudGV4dENvbnRlbnQ9bixcIjFweFwiPT09ci53aWR0aH19fXJldHVybiBmdW5jdGlvbih0KXtyZXR1cm57bWF0Y2hlczplLm1hdGNoTWVkaXVtKHR8fFwiYWxsXCIpLG1lZGlhOnR8fFwiYWxsXCJ9fX0oKSksRm91bmRhdGlvbi5NZWRpYVF1ZXJ5PW59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogTW90aW9uIG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICAgKi9cblxuICB2YXIgaW5pdENsYXNzZXMgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbiAgdmFyIGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG4gIHZhciBNb3Rpb24gPSB7XG4gICAgYW5pbWF0ZUluOiBmdW5jdGlvbiAoZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgICB9LFxuXG4gICAgYW5pbWF0ZU91dDogZnVuY3Rpb24gKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbikge1xuICAgIHZhciBhbmltLFxuICAgICAgICBwcm9nLFxuICAgICAgICBzdGFydCA9IG51bGw7XG4gICAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICBmbi5hcHBseShlbGVtKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmUodHMpIHtcbiAgICAgIGlmICghc3RhcnQpIHN0YXJ0ID0gdHM7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgICBmbi5hcHBseShlbGVtKTtcblxuICAgICAgaWYgKHByb2cgPCBkdXJhdGlvbikge1xuICAgICAgICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gICAqL1xuICBmdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICAgIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICAgIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICAgIHJlc2V0KCk7XG5cbiAgICBlbGVtZW50LmFkZENsYXNzKGFuaW1hdGlvbikuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gICAgfSk7XG5cbiAgICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKS5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gICAgfSk7XG5cbiAgICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gICAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICAgIHJlc2V0KCk7XG4gICAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhpbml0Q2xhc3MgKyAnICcgKyBhY3RpdmVDbGFzcyArICcgJyArIGFuaW1hdGlvbik7XG4gICAgfVxuICB9XG5cbiAgRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbiAgRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKG4pe2Z1bmN0aW9uIGkobixpLGUpe2Z1bmN0aW9uIHQocyl7cnx8KHI9cyksbz1zLXIsZS5hcHBseShpKSxvPG4/YT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQsaSk6KHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhKSxpLnRyaWdnZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKS50cmlnZ2VySGFuZGxlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pKX12YXIgYSxvLHI9bnVsbDtyZXR1cm4gMD09PW4/KGUuYXBwbHkoaSksdm9pZCBpLnRyaWdnZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKS50cmlnZ2VySGFuZGxlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pKTp2b2lkKGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9ZnVuY3Rpb24gZShpLGUsbyxyKXtmdW5jdGlvbiBzKCl7aXx8ZS5oaWRlKCksdSgpLHImJnIuYXBwbHkoZSl9ZnVuY3Rpb24gdSgpe2VbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uPTAsZS5yZW1vdmVDbGFzcyhkK1wiIFwiK2YrXCIgXCIrbyl9aWYoZT1uKGUpLmVxKDApLGUubGVuZ3RoKXt2YXIgZD1pP3RbMF06dFsxXSxmPWk/YVswXTphWzFdO3UoKSxlLmFkZENsYXNzKG8pLmNzcyhcInRyYW5zaXRpb25cIixcIm5vbmVcIikscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7ZS5hZGRDbGFzcyhkKSxpJiZlLnNob3coKX0pLHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe2VbMF0ub2Zmc2V0V2lkdGgsZS5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJcIikuYWRkQ2xhc3MoZil9KSxlLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZSkscyl9fXZhciB0PVtcIm11aS1lbnRlclwiLFwibXVpLWxlYXZlXCJdLGE9W1wibXVpLWVudGVyLWFjdGl2ZVwiLFwibXVpLWxlYXZlLWFjdGl2ZVwiXSxvPXthbmltYXRlSW46ZnVuY3Rpb24obixpLHQpe2UoITAsbixpLHQpfSxhbmltYXRlT3V0OmZ1bmN0aW9uKG4saSx0KXtlKCExLG4saSx0KX19O0ZvdW5kYXRpb24uTW92ZT1pLEZvdW5kYXRpb24uTW90aW9uPW99KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICB2YXIgTmVzdCA9IHtcbiAgICBGZWF0aGVyOiBmdW5jdGlvbiAobWVudSkge1xuICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICd6Zic7XG5cbiAgICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsgJ3JvbGUnOiAnbWVudWl0ZW0nIH0pLFxuICAgICAgICAgIHN1Yk1lbnVDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudScsXG4gICAgICAgICAgc3ViSXRlbUNsYXNzID0gc3ViTWVudUNsYXNzICsgJy1pdGVtJyxcbiAgICAgICAgICBoYXNTdWJDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudS1wYXJlbnQnO1xuXG4gICAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhoYXNTdWJDbGFzcykuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkc3ViLmFkZENsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRzdWIuYXR0cih7ICdhcmlhLWhpZGRlbic6IHRydWUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgICAkaXRlbS5hZGRDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuO1xuICAgIH0sXG4gICAgQnVybjogZnVuY3Rpb24gKG1lbnUsIHR5cGUpIHtcbiAgICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgc3ViTWVudUNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51JyxcbiAgICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICAgIGhhc1N1YkNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAgIG1lbnUuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgJyArIGhhc1N1YkNsYXNzICsgJyBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmUnKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSk7XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKGUpe3ZhciBhPXtGZWF0aGVyOmZ1bmN0aW9uKGEpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXTpcInpmXCI7YS5hdHRyKFwicm9sZVwiLFwibWVudWJhclwiKTt2YXIgbj1hLmZpbmQoXCJsaVwiKS5hdHRyKHtyb2xlOlwibWVudWl0ZW1cIn0pLGk9XCJpcy1cIit0K1wiLXN1Ym1lbnVcIix1PWkrXCItaXRlbVwiLHM9XCJpcy1cIit0K1wiLXN1Ym1lbnUtcGFyZW50XCI7bi5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9ZSh0aGlzKSxuPWEuY2hpbGRyZW4oXCJ1bFwiKTtuLmxlbmd0aCYmKGEuYWRkQ2xhc3MocykuYXR0cih7XCJhcmlhLWhhc3BvcHVwXCI6ITAsXCJhcmlhLWxhYmVsXCI6YS5jaGlsZHJlbihcImE6Zmlyc3RcIikudGV4dCgpfSksXCJkcmlsbGRvd25cIj09PXQmJmEuYXR0cih7XCJhcmlhLWV4cGFuZGVkXCI6ITF9KSxuLmFkZENsYXNzKFwic3VibWVudSBcIitpKS5hdHRyKHtcImRhdGEtc3VibWVudVwiOlwiXCIscm9sZTpcIm1lbnVcIn0pLFwiZHJpbGxkb3duXCI9PT10JiZuLmF0dHIoe1wiYXJpYS1oaWRkZW5cIjohMH0pKSxhLnBhcmVudChcIltkYXRhLXN1Ym1lbnVdXCIpLmxlbmd0aCYmYS5hZGRDbGFzcyhcImlzLXN1Ym1lbnUtaXRlbSBcIit1KX0pfSxCdXJuOmZ1bmN0aW9uKGUsYSl7dmFyIHQ9XCJpcy1cIithK1wiLXN1Ym1lbnVcIixuPXQrXCItaXRlbVwiLGk9XCJpcy1cIithK1wiLXN1Ym1lbnUtcGFyZW50XCI7ZS5maW5kKFwiPmxpLCAubWVudSwgLm1lbnUgPiBsaVwiKS5yZW1vdmVDbGFzcyh0K1wiIFwiK24rXCIgXCIraStcIiBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVcIikucmVtb3ZlQXR0cihcImRhdGEtc3VibWVudVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJcIil9fTtGb3VuZGF0aW9uLk5lc3Q9YX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLFxuICAgICAgICAvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgICByZW1haW4gPSAtMSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIHRpbWVyO1xuXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVtYWluID0gLTE7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5maW5pdGUpIHtcbiAgICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7IC8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgICB9XG4gICAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9LCByZW1haW4pO1xuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnN0YXJ0LnpmLicgKyBuYW1lU3BhY2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICAgIGVsZW0udHJpZ2dlcigndGltZXJwYXVzZWQuemYuJyArIG5hbWVTcGFjZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAgICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gICAqL1xuICBmdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaW1hZ2VzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IDQgfHwgdGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICB9XG4gICAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgKHNyYy5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICAgIHVubG9hZGVkLS07XG4gICAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBGb3VuZGF0aW9uLlRpbWVyID0gVGltZXI7XG4gIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LGUsaSl7dmFyIGEscyxuPXRoaXMscj1lLmR1cmF0aW9uLG89T2JqZWN0LmtleXModC5kYXRhKCkpWzBdfHxcInRpbWVyXCIsdT0tMTt0aGlzLmlzUGF1c2VkPSExLHRoaXMucmVzdGFydD1mdW5jdGlvbigpe3U9LTEsY2xlYXJUaW1lb3V0KHMpLHRoaXMuc3RhcnQoKX0sdGhpcy5zdGFydD1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITEsY2xlYXJUaW1lb3V0KHMpLHU9dTw9MD9yOnUsdC5kYXRhKFwicGF1c2VkXCIsITEpLGE9RGF0ZS5ub3coKSxzPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmluZmluaXRlJiZuLnJlc3RhcnQoKSxpJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBpJiZpKCl9LHUpLHQudHJpZ2dlcihcInRpbWVyc3RhcnQuemYuXCIrbyl9LHRoaXMucGF1c2U9ZnVuY3Rpb24oKXt0aGlzLmlzUGF1c2VkPSEwLGNsZWFyVGltZW91dChzKSx0LmRhdGEoXCJwYXVzZWRcIiwhMCk7dmFyIGU9RGF0ZS5ub3coKTt1LT1lLWEsdC50cmlnZ2VyKFwidGltZXJwYXVzZWQuemYuXCIrbyl9fWZ1bmN0aW9uIGkoZSxpKXtmdW5jdGlvbiBhKCl7cy0tLDA9PT1zJiZpKCl9dmFyIHM9ZS5sZW5ndGg7MD09PXMmJmkoKSxlLmVhY2goZnVuY3Rpb24oKXtpZih0aGlzLmNvbXBsZXRlfHw0PT09dGhpcy5yZWFkeVN0YXRlfHxcImNvbXBsZXRlXCI9PT10aGlzLnJlYWR5U3RhdGUpYSgpO2Vsc2V7dmFyIGU9dCh0aGlzKS5hdHRyKFwic3JjXCIpO3QodGhpcykuYXR0cihcInNyY1wiLGUrKGUuaW5kZXhPZihcIj9cIik+PTA/XCImXCI6XCI/XCIpKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKSx0KHRoaXMpLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2EoKX0pfX0pfUZvdW5kYXRpb24uVGltZXI9ZSxGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkPWl9KGpRdWVyeSk7IiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uICgkKSB7XG5cblx0JC5zcG90U3dpcGUgPSB7XG5cdFx0dmVyc2lvbjogJzEuMC4wJyxcblx0XHRlbmFibGVkOiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0cHJldmVudERlZmF1bHQ6IGZhbHNlLFxuXHRcdG1vdmVUaHJlc2hvbGQ6IDc1LFxuXHRcdHRpbWVUaHJlc2hvbGQ6IDIwMFxuXHR9O1xuXG5cdHZhciBzdGFydFBvc1gsXG5cdCAgICBzdGFydFBvc1ksXG5cdCAgICBzdGFydFRpbWUsXG5cdCAgICBlbGFwc2VkVGltZSxcblx0ICAgIGlzTW92aW5nID0gZmFsc2U7XG5cblx0ZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcblx0XHQvLyAgYWxlcnQodGhpcyk7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuXHRcdGlzTW92aW5nID0gZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG5cdFx0aWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHRcdGlmIChpc01vdmluZykge1xuXHRcdFx0dmFyIHggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG5cdFx0XHR2YXIgeSA9IGUudG91Y2hlc1swXS5wYWdlWTtcblx0XHRcdHZhciBkeCA9IHN0YXJ0UG9zWCAtIHg7XG5cdFx0XHR2YXIgZHkgPSBzdGFydFBvc1kgLSB5O1xuXHRcdFx0dmFyIGRpcjtcblx0XHRcdGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWU7XG5cdFx0XHRpZiAoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuXHRcdFx0XHRkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuXHRcdFx0fVxuXHRcdFx0Ly8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG5cdFx0XHQvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG5cdFx0XHQvLyB9XG5cdFx0XHRpZiAoZGlyKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0b25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuXHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKCdzd2lwZScgKyBkaXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG5cdFx0aWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuXHRcdFx0c3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuXHRcdFx0c3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuXHRcdFx0aXNNb3ZpbmcgPSB0cnVlO1xuXHRcdFx0c3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHR9XG5cblx0ZnVuY3Rpb24gdGVhcmRvd24oKSB7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcblx0fVxuXG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuXHQkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuXHRcdCQuZXZlbnQuc3BlY2lhbFsnc3dpcGUnICsgdGhpc10gPSB7IHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQodGhpcykub24oJ3N3aXBlJywgJC5ub29wKTtcblx0XHRcdH0gfTtcblx0fSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uICgkKSB7XG5cdCQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuXHRcdFx0JChlbCkuYmluZCgndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxuXHRcdFx0XHQvL29iamVjdCBpcyBub3JtYWxpemVkIHRvIHczYyBzcGVjcyBhbmQgZG9lcyBub3QgcHJvdmlkZSB0aGUgVG91Y2hMaXN0XG5cdFx0XHRcdGhhbmRsZVRvdWNoKGV2ZW50KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHR2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuXHRcdFx0ICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcblx0XHRcdCAgICBldmVudFR5cGVzID0ge1xuXHRcdFx0XHR0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcblx0XHRcdFx0dG91Y2htb3ZlOiAnbW91c2Vtb3ZlJyxcblx0XHRcdFx0dG91Y2hlbmQ6ICdtb3VzZXVwJ1xuXHRcdFx0fSxcblx0XHRcdCAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcblx0XHRcdCAgICBzaW11bGF0ZWRFdmVudDtcblxuXHRcdFx0aWYgKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcblx0XHRcdFx0XHQnYnViYmxlcyc6IHRydWUsXG5cdFx0XHRcdFx0J2NhbmNlbGFibGUnOiB0cnVlLFxuXHRcdFx0XHRcdCdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcblx0XHRcdFx0XHQnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG5cdFx0XHRcdFx0J2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuXHRcdFx0XHRcdCdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCAvKmxlZnQqLywgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG5cdFx0fTtcblx0fTtcbn0oalF1ZXJ5KTtcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5Kipcbi8vKipuZWVkIHRvIHJlY3JlYXRlIGZ1bmN0aW9uYWxpdHkqKlxuLy8qKmFuZCB0cnkgdG8gaW1wcm92ZSBpZiBwb3NzaWJsZSoqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLyogUmVtb3ZpbmcgdGhlIGpRdWVyeSBmdW5jdGlvbiAqKioqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuKGZ1bmN0aW9uKCAkLCB3aW5kb3csIHVuZGVmaW5lZCApIHtcblxuXHR2YXIgJGRvY3VtZW50ID0gJCggZG9jdW1lbnQgKSxcblx0XHQvLyBzdXBwb3J0VG91Y2ggPSAkLm1vYmlsZS5zdXBwb3J0LnRvdWNoLFxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxuXHRcdHRvdWNoU3RvcEV2ZW50ID0gJ3RvdWNoZW5kJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaGVuZFwiIDogXCJtb3VzZXVwXCIsXG5cdFx0dG91Y2hNb3ZlRXZlbnQgPSAndG91Y2htb3ZlJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCI7XG5cblx0Ly8gc2V0dXAgbmV3IGV2ZW50IHNob3J0Y3V0c1xuXHQkLmVhY2goICggXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCBcIiArXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuXG5cdFx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIGZuICkge1xuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdFx0fTtcblxuXHRcdC8vIGpRdWVyeSA8IDEuOFxuXHRcdGlmICggJC5hdHRyRm4gKSB7XG5cdFx0XHQkLmF0dHJGblsgbmFtZSBdID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XG5cdFx0dmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG5cdFx0ZXZlbnQudHlwZSA9IGV2ZW50VHlwZTtcblx0XHRpZiAoIGJ1YmJsZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggZXZlbnQsIHVuZGVmaW5lZCwgb2JqICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xuXHRcdH1cblx0XHRldmVudC50eXBlID0gb3JpZ2luYWxUeXBlO1xuXHR9XG5cblx0Ly8gYWxzbyBoYW5kbGVzIHRhcGhvbGRcblxuXHQvLyBBbHNvIGhhbmRsZXMgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0XG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHtcblxuXHRcdC8vIE1vcmUgdGhhbiB0aGlzIGhvcml6b250YWwgZGlzcGxhY2VtZW50LCBhbmQgd2Ugd2lsbCBzdXBwcmVzcyBzY3JvbGxpbmcuXG5cdFx0c2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZDogMzAsXG5cblx0XHQvLyBNb3JlIHRpbWUgdGhhbiB0aGlzLCBhbmQgaXQgaXNuJ3QgYSBzd2lwZS5cblx0XHRkdXJhdGlvblRocmVzaG9sZDogMTAwMCxcblxuXHRcdC8vIFN3aXBlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbW9yZSB0aGFuIHRoaXMuXG5cdFx0aG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdC8vIFN3aXBlIHZlcnRpY2FsIGRpc3BsYWNlbWVudCBtdXN0IGJlIGxlc3MgdGhhbiB0aGlzLlxuXHRcdHZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Z2V0TG9jYXRpb246IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgd2luUGFnZVggPSB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuXHRcdFx0XHR4ID0gZXZlbnQuY2xpZW50WCxcblx0XHRcdFx0eSA9IGV2ZW50LmNsaWVudFk7XG5cblx0XHRcdGlmICggZXZlbnQucGFnZVkgPT09IDAgJiYgTWF0aC5mbG9vciggeSApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVkgKSB8fFxuXHRcdFx0XHRldmVudC5wYWdlWCA9PT0gMCAmJiBNYXRoLmZsb29yKCB4ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIGlPUzQgY2xpZW50WC9jbGllbnRZIGhhdmUgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHQvLyBpbiBwYWdlWC9wYWdlWS4gV2hpbGUgcGFnZVgvcGFnZS8gaGF2ZSB0aGUgdmFsdWUgMFxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0geSAtIHdpblBhZ2VZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA8ICggZXZlbnQucGFnZVkgLSB3aW5QYWdlWSkgfHwgeCA8ICggZXZlbnQucGFnZVggLSB3aW5QYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIFNvbWUgQW5kcm9pZCBicm93c2VycyBoYXZlIHRvdGFsbHkgYm9ndXMgdmFsdWVzIGZvciBjbGllbnRYL1lcblx0XHRcdFx0Ly8gd2hlbiBzY3JvbGxpbmcvem9vbWluZyBhIHBhZ2UuIERldGVjdGFibGUgc2luY2UgY2xpZW50WC9jbGllbnRZXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcblx0XHRcdFx0eCA9IGV2ZW50LnBhZ2VYIC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSBldmVudC5wYWdlWSAtIHdpblBhZ2VZO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4LFxuXHRcdFx0XHR5OiB5XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXSxcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU3dpcGU6IGZ1bmN0aW9uKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApIHtcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDEgXSAtIHN0b3AuY29vcmRzWyAxIF0gKSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS52ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkICkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcblxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIFwic3dpcGVcIiwgJC5FdmVudCggXCJzd2lwZVwiLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9KSwgdHJ1ZSApO1xuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHQvLyBUaGlzIHNlcnZlcyBhcyBhIGZsYWcgdG8gZW5zdXJlIHRoYXQgYXQgbW9zdCBvbmUgc3dpcGUgZXZlbnQgZXZlbnQgaXNcblx0XHQvLyBpbiB3b3JrIGF0IGFueSBnaXZlbiB0aW1lXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcblxuXHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsXG5cdFx0XHRcdHRoaXNPYmplY3QgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIHRoaXNPYmplY3QgKSxcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xuXG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgZXZlbnRzIGRhdGEgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWRkIHRoZSBzd2lwZSBjb250ZXh0XG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoICFldmVudHMgKSB7XG5cdFx0XHRcdGV2ZW50cyA9IHsgbGVuZ3RoOiAwIH07XG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xuXHRcdFx0fVxuXHRcdFx0ZXZlbnRzLmxlbmd0aCsrO1xuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcblxuXHRcdFx0Y29udGV4dC5zdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBCYWlsIGlmIHdlJ3JlIGFscmVhZHkgd29ya2luZyBvbiBhIHN3aXBlIGV2ZW50XG5cdFx0XHRcdGlmICggJC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IHRydWU7XG5cblx0XHRcdFx0dmFyIHN0b3AsXG5cdFx0XHRcdFx0c3RhcnQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RhcnQoIGV2ZW50ICksXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdFx0XHRlbWl0dGVkID0gZmFsc2U7XG5cblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXJ0IHx8IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHN0b3AgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RvcCggZXZlbnQgKTtcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5oYW5kbGVTd2lwZSggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKTtcblx0XHRcdFx0XHRcdGlmICggZW1pdHRlZCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZ1xuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb250ZXh0LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0XHRcdGNvbnRleHQubW92ZSA9IG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JGRvY3VtZW50Lm9uKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlIClcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHR9O1xuXHRcdFx0JHRoaXMub24oIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdH0sXG5cblx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xuXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcblx0XHRcdFx0Y29udGV4dCA9IGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZGVsZXRlIGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xuXHRcdFx0XHRpZiAoIGV2ZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29udGV4dCApIHtcblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0YXJ0ICkge1xuXHRcdFx0XHRcdCQoIHRoaXMgKS5vZmYoIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5tb3ZlICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RvcCApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdCQuZWFjaCh7XG5cdFx0c3dpcGVsZWZ0OiBcInN3aXBlLmxlZnRcIixcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcblx0fSwgZnVuY3Rpb24oIGV2ZW50LCBzb3VyY2VFdmVudCApIHtcblxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLmJpbmQoIHNvdXJjZUV2ZW50LCAkLm5vb3AgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS51bmJpbmQoIHNvdXJjZUV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59KSggalF1ZXJ5LCB0aGlzICk7XG4qLyIsIiFmdW5jdGlvbihlKXtmdW5jdGlvbiB0KCl7dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsbiksdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIix0KSxyPSExfWZ1bmN0aW9uIG4obil7aWYoZS5zcG90U3dpcGUucHJldmVudERlZmF1bHQmJm4ucHJldmVudERlZmF1bHQoKSxyKXt2YXIgbyxpPW4udG91Y2hlc1swXS5wYWdlWCxjPShuLnRvdWNoZXNbMF0ucGFnZVkscy1pKTtoPShuZXcgRGF0ZSkuZ2V0VGltZSgpLXUsTWF0aC5hYnMoYyk+PWUuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQmJmg8PWUuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQmJihvPWM+MD9cImxlZnRcIjpcInJpZ2h0XCIpLG8mJihuLnByZXZlbnREZWZhdWx0KCksdC5jYWxsKHRoaXMpLGUodGhpcykudHJpZ2dlcihcInN3aXBlXCIsbykudHJpZ2dlcihcInN3aXBlXCIrbykpfX1mdW5jdGlvbiBvKGUpezE9PWUudG91Y2hlcy5sZW5ndGgmJihzPWUudG91Y2hlc1swXS5wYWdlWCxjPWUudG91Y2hlc1swXS5wYWdlWSxyPSEwLHU9KG5ldyBEYXRlKS5nZXRUaW1lKCksdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsbiwhMSksdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIix0LCExKSl9ZnVuY3Rpb24gaSgpe3RoaXMuYWRkRXZlbnRMaXN0ZW5lciYmdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLG8sITEpfWUuc3BvdFN3aXBlPXt2ZXJzaW9uOlwiMS4wLjBcIixlbmFibGVkOlwib250b3VjaHN0YXJ0XCJpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQscHJldmVudERlZmF1bHQ6ITEsbW92ZVRocmVzaG9sZDo3NSx0aW1lVGhyZXNob2xkOjIwMH07dmFyIHMsYyx1LGgscj0hMTtlLmV2ZW50LnNwZWNpYWwuc3dpcGU9e3NldHVwOml9LGUuZWFjaChbXCJsZWZ0XCIsXCJ1cFwiLFwiZG93blwiLFwicmlnaHRcIl0sZnVuY3Rpb24oKXtlLmV2ZW50LnNwZWNpYWxbXCJzd2lwZVwiK3RoaXNdPXtzZXR1cDpmdW5jdGlvbigpe2UodGhpcykub24oXCJzd2lwZVwiLGUubm9vcCl9fX0pfShqUXVlcnkpLCFmdW5jdGlvbihlKXtlLmZuLmFkZFRvdWNoPWZ1bmN0aW9uKCl7dGhpcy5lYWNoKGZ1bmN0aW9uKG4sbyl7ZShvKS5iaW5kKFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWxcIixmdW5jdGlvbigpe3QoZXZlbnQpfSl9KTt2YXIgdD1mdW5jdGlvbihlKXt2YXIgdCxuPWUuY2hhbmdlZFRvdWNoZXMsbz1uWzBdLGk9e3RvdWNoc3RhcnQ6XCJtb3VzZWRvd25cIix0b3VjaG1vdmU6XCJtb3VzZW1vdmVcIix0b3VjaGVuZDpcIm1vdXNldXBcIn0scz1pW2UudHlwZV07XCJNb3VzZUV2ZW50XCJpbiB3aW5kb3cmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50P3Q9bmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHMse2J1YmJsZXM6ITAsY2FuY2VsYWJsZTohMCxzY3JlZW5YOm8uc2NyZWVuWCxzY3JlZW5ZOm8uc2NyZWVuWSxjbGllbnRYOm8uY2xpZW50WCxjbGllbnRZOm8uY2xpZW50WX0pOih0PWRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudFwiKSx0LmluaXRNb3VzZUV2ZW50KHMsITAsITAsd2luZG93LDEsby5zY3JlZW5YLG8uc2NyZWVuWSxvLmNsaWVudFgsby5jbGllbnRZLCExLCExLCExLCExLDAsbnVsbCkpLG8udGFyZ2V0LmRpc3BhdGNoRXZlbnQodCl9fX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBNdXRhdGlvbk9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSgpO1xuXG4gIHZhciB0cmlnZ2VycyA9IGZ1bmN0aW9uIChlbCwgdHlwZSkge1xuICAgIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgJCgnIycgKyBpZClbdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKHR5cGUgKyAnLnpmLnRyaWdnZXInLCBbZWxdKTtcbiAgICB9KTtcbiAgfTtcbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbiAoKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbiAgfSk7XG5cbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4gICQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB2YXIgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gICAgaWYgKGFuaW1hdGlvbiAhPT0gJycpIHtcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAgICQoJyMnICsgaWQpLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG4gIH0pO1xuXG4gIC8qKlxuICAqIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqL1xuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY2hlY2tMaXN0ZW5lcnMoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gICAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgICByZXNpemVMaXN0ZW5lcigpO1xuICAgIHNjcm9sbExpc3RlbmVyKCk7XG4gICAgbXV0YXRlTGlzdGVuZXIoKTtcbiAgICBjbG9zZW1lTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbiAgZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICAgIGlmIChwbHVnaW5OYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh5ZXRpQm94ZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gJ2Nsb3NlbWUuemYuJyArIG5hbWU7XG4gICAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uIChlLCBwbHVnaW5JZCkge1xuICAgICAgICB2YXIgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgICAgdmFyIHBsdWdpbnMgPSAkKCdbZGF0YS0nICsgcGx1Z2luICsgJ10nKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJyArIHBsdWdpbklkICsgJ1wiXScpO1xuXG4gICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICB2YXIgdGltZXIgPSB2b2lkIDAsXG4gICAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgICBpZiAoJG5vZGVzLmxlbmd0aCkge1xuICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKS5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgIGlmICghTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgLy9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7IC8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIHZhciB0aW1lciA9IHZvaWQgMCxcbiAgICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsgLy9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG11dGF0ZUxpc3RlbmVyKGRlYm91bmNlKSB7XG4gICAgdmFyICRub2RlcyA9ICQoJ1tkYXRhLW11dGF0ZV0nKTtcbiAgICBpZiAoJG5vZGVzLmxlbmd0aCAmJiBNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRlIGV2ZW50XG4gICAgICAvL25vIElFIDkgb3IgMTBcbiAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAgIC8vZWxlbWVudCBjYWxsYmFja1xuICAgIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cbiAgICAgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcbiAgICAgICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuICAgICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuICAgICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsIFwibXV0YXRlXCIpO1xuICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBbUEhdXG4gIC8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG4gIEZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbiAgLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4gIC8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG59KGpRdWVyeSk7XG5cbi8vIGZ1bmN0aW9uIGRvbU11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2UpIHtcbi8vICAgLy8gISEhIFRoaXMgaXMgY29taW5nIHNvb24gYW5kIG5lZWRzIG1vcmUgd29yazsgbm90IGFjdGl2ZSAgISEhIC8vXG4vLyAgIHZhciB0aW1lcixcbi8vICAgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1tdXRhdGVdJyk7XG4vLyAgIC8vXG4vLyAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbi8vICAgICAvLyB2YXIgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4vLyAgICAgLy8gICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbi8vICAgICAvLyAgIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgLy8gICAgIGlmIChwcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbi8vICAgICAvLyAgICAgICByZXR1cm4gd2luZG93W3ByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInXTtcbi8vICAgICAvLyAgICAgfVxuLy8gICAgIC8vICAgfVxuLy8gICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgIC8vIH0oKSk7XG4vL1xuLy9cbi8vICAgICAvL2ZvciB0aGUgYm9keSwgd2UgbmVlZCB0byBsaXN0ZW4gZm9yIGFsbCBjaGFuZ2VzIGVmZmVjdGluZyB0aGUgc3R5bGUgYW5kIGNsYXNzIGF0dHJpYnV0ZXNcbi8vICAgICB2YXIgYm9keU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoYm9keU11dGF0aW9uKTtcbi8vICAgICBib2R5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6dHJ1ZSwgYXR0cmlidXRlRmlsdGVyOltcInN0eWxlXCIsIFwiY2xhc3NcIl19KTtcbi8vXG4vL1xuLy8gICAgIC8vYm9keSBjYWxsYmFja1xuLy8gICAgIGZ1bmN0aW9uIGJvZHlNdXRhdGlvbihtdXRhdGUpIHtcbi8vICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBtdXRhdGlvbiBldmVudFxuLy8gICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cbi8vXG4vLyAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyAgICAgICAgIGJvZHlPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4vLyAgICAgICAgICQoJ1tkYXRhLW11dGF0ZV0nKS5hdHRyKCdkYXRhLWV2ZW50cycsXCJtdXRhdGVcIik7XG4vLyAgICAgICB9LCBkZWJvdW5jZSB8fCAxNTApO1xuLy8gICAgIH1cbi8vICAgfVxuLy8gfSIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7bygpLGEoKSxpKCksbigpLHIoKX1mdW5jdGlvbiByKGUpe3ZhciByPXQoXCJbZGF0YS15ZXRpLWJveF1cIiksYT1bXCJkcm9wZG93blwiLFwidG9vbHRpcFwiLFwicmV2ZWFsXCJdO2lmKGUmJihcInN0cmluZ1wiPT10eXBlb2YgZT9hLnB1c2goZSk6XCJvYmplY3RcIj09dHlwZW9mIGUmJlwic3RyaW5nXCI9PXR5cGVvZiBlWzBdP2EuY29uY2F0KGUpOmNvbnNvbGUuZXJyb3IoXCJQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzXCIpKSxyLmxlbmd0aCl7dmFyIGk9YS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuXCJjbG9zZW1lLnpmLlwiK3R9KS5qb2luKFwiIFwiKTt0KHdpbmRvdykub2ZmKGkpLm9uKGksZnVuY3Rpb24oZSxyKXt2YXIgYT1lLm5hbWVzcGFjZS5zcGxpdChcIi5cIilbMF0saT10KFwiW2RhdGEtXCIrYStcIl1cIikubm90KCdbZGF0YS15ZXRpLWJveD1cIicrcisnXCJdJyk7aS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTtlLnRyaWdnZXJIYW5kbGVyKFwiY2xvc2UuemYudHJpZ2dlclwiLFtlXSl9KX0pfX1mdW5jdGlvbiBhKGUpe3ZhciByPXZvaWQgMCxhPXQoXCJbZGF0YS1yZXNpemVdXCIpO2EubGVuZ3RoJiZ0KHdpbmRvdykub2ZmKFwicmVzaXplLnpmLnRyaWdnZXJcIikub24oXCJyZXNpemUuemYudHJpZ2dlclwiLGZ1bmN0aW9uKGkpe3ImJmNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtnfHxhLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwicmVzaXplbWUuemYudHJpZ2dlclwiKX0pLGEuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJyZXNpemVcIil9LGV8fDEwKX0pfWZ1bmN0aW9uIGkoZSl7dmFyIHI9dm9pZCAwLGE9dChcIltkYXRhLXNjcm9sbF1cIik7YS5sZW5ndGgmJnQod2luZG93KS5vZmYoXCJzY3JvbGwuemYudHJpZ2dlclwiKS5vbihcInNjcm9sbC56Zi50cmlnZ2VyXCIsZnVuY3Rpb24oaSl7ciYmY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe2d8fGEuZWFjaChmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlckhhbmRsZXIoXCJzY3JvbGxtZS56Zi50cmlnZ2VyXCIpfSksYS5hdHRyKFwiZGF0YS1ldmVudHNcIixcInNjcm9sbFwiKX0sZXx8MTApfSl9ZnVuY3Rpb24gbihlKXt2YXIgcj10KFwiW2RhdGEtbXV0YXRlXVwiKTtyLmxlbmd0aCYmZyYmci5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIil9KX1mdW5jdGlvbiBvKCl7aWYoIWcpcmV0dXJuITE7dmFyIGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV1cIikscj1mdW5jdGlvbihlKXt2YXIgcj10KGVbMF0udGFyZ2V0KTtzd2l0Y2goZVswXS50eXBlKXtjYXNlXCJhdHRyaWJ1dGVzXCI6XCJzY3JvbGxcIj09PXIuYXR0cihcImRhdGEtZXZlbnRzXCIpJiZcImRhdGEtZXZlbnRzXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJnIudHJpZ2dlckhhbmRsZXIoXCJzY3JvbGxtZS56Zi50cmlnZ2VyXCIsW3Isd2luZG93LnBhZ2VZT2Zmc2V0XSksXCJyZXNpemVcIj09PXIuYXR0cihcImRhdGEtZXZlbnRzXCIpJiZcImRhdGEtZXZlbnRzXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJnIudHJpZ2dlckhhbmRsZXIoXCJyZXNpemVtZS56Zi50cmlnZ2VyXCIsW3JdKSxcInN0eWxlXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJihyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpLHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIsW3IuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKSk7YnJlYWs7Y2FzZVwiY2hpbGRMaXN0XCI6ci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKSxyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiLFtyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7YnJlYWs7ZGVmYXVsdDpyZXR1cm4hMX19O2lmKGUubGVuZ3RoKWZvcih2YXIgYT0wO2E8PWUubGVuZ3RoLTE7YSsrKXt2YXIgaT1uZXcgZyhyKTtpLm9ic2VydmUoZVthXSx7YXR0cmlidXRlczohMCxjaGlsZExpc3Q6ITAsY2hhcmFjdGVyRGF0YTohMSxzdWJ0cmVlOiEwLGF0dHJpYnV0ZUZpbHRlcjpbXCJkYXRhLWV2ZW50c1wiLFwic3R5bGVcIl19KX19dmFyIGc9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9W1wiV2ViS2l0XCIsXCJNb3pcIixcIk9cIixcIk1zXCIsXCJcIl0sZT0wO2U8dC5sZW5ndGg7ZSsrKWlmKHRbZV0rXCJNdXRhdGlvbk9ic2VydmVyXCJpbiB3aW5kb3cpcmV0dXJuIHdpbmRvd1t0W2VdK1wiTXV0YXRpb25PYnNlcnZlclwiXTtyZXR1cm4hMX0oKSxzPWZ1bmN0aW9uKGUscil7ZS5kYXRhKHIpLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3QoXCIjXCIrYSlbXCJjbG9zZVwiPT09cj9cInRyaWdnZXJcIjpcInRyaWdnZXJIYW5kbGVyXCJdKHIrXCIuemYudHJpZ2dlclwiLFtlXSl9KX07dChkb2N1bWVudCkub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS1vcGVuXVwiLGZ1bmN0aW9uKCl7cyh0KHRoaXMpLFwib3BlblwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xpY2suemYudHJpZ2dlclwiLFwiW2RhdGEtY2xvc2VdXCIsZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLmRhdGEoXCJjbG9zZVwiKTtlP3ModCh0aGlzKSxcImNsb3NlXCIpOnQodGhpcykudHJpZ2dlcihcImNsb3NlLnpmLnRyaWdnZXJcIil9KSx0KGRvY3VtZW50KS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZV1cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcInRvZ2dsZVwiKTtlP3ModCh0aGlzKSxcInRvZ2dsZVwiKTp0KHRoaXMpLnRyaWdnZXIoXCJ0b2dnbGUuemYudHJpZ2dlclwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xvc2UuemYudHJpZ2dlclwiLFwiW2RhdGEtY2xvc2FibGVdXCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgcj10KHRoaXMpLmRhdGEoXCJjbG9zYWJsZVwiKTtcIlwiIT09cj9Gb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KHQodGhpcykscixmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlcihcImNsb3NlZC56ZlwiKX0pOnQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoXCJjbG9zZWQuemZcIil9KSx0KGRvY3VtZW50KS5vbihcImZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyXCIsXCJbZGF0YS10b2dnbGUtZm9jdXNdXCIsZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLmRhdGEoXCJ0b2dnbGUtZm9jdXNcIik7dChcIiNcIitlKS50cmlnZ2VySGFuZGxlcihcInRvZ2dsZS56Zi50cmlnZ2VyXCIsW3QodGhpcyldKX0pLHQod2luZG93KS5vbihcImxvYWRcIixmdW5jdGlvbigpe2UoKX0pLEZvdW5kYXRpb24uSUhlYXJZb3U9ZX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBBYmlkZSBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5hYmlkZVxuICAgKi9cblxuICB2YXIgQWJpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgQWJpZGUjaW5pdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFiaWRlKGVsZW1lbnQpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFiaWRlKTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWJpZGUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBYmlkZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBBYmlkZSBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgQWJpZGUgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoQWJpZGUsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIHRoaXMuJGlucHV0cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnKTtcblxuICAgICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEFiaWRlLlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5hYmlkZScpLm9uKCdyZXNldC56Zi5hYmlkZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpczIucmVzZXRGb3JtKCk7XG4gICAgICAgIH0pLm9uKCdzdWJtaXQuemYuYWJpZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMi52YWxpZGF0ZUZvcm0oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52YWxpZGF0ZU9uID09PSAnZmllbGRDaGFuZ2UnKSB7XG4gICAgICAgICAgdGhpcy4kaW5wdXRzLm9mZignY2hhbmdlLnpmLmFiaWRlJykub24oJ2NoYW5nZS56Zi5hYmlkZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfdGhpczIudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxpdmVWYWxpZGF0ZSkge1xuICAgICAgICAgIHRoaXMuJGlucHV0cy5vZmYoJ2lucHV0LnpmLmFiaWRlJykub24oJ2lucHV0LnpmLmFiaWRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF90aGlzMi52YWxpZGF0ZUlucHV0KCQoZS50YXJnZXQpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmFsaWRhdGVPbkJsdXIpIHtcbiAgICAgICAgICB0aGlzLiRpbnB1dHMub2ZmKCdibHVyLnpmLmFiaWRlJykub24oJ2JsdXIuemYuYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3RoaXMyLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgQWJpZGUgdXBvbiBET00gY2hhbmdlXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfcmVmbG93JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVmbG93KCkge1xuICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgZm9ybSBlbGVtZW50IGhhcyB0aGUgcmVxdWlyZWQgYXR0cmlidXRlIGFuZCBpZiBpdCdzIGNoZWNrZWQgb3Igbm90XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZXF1aXJlZENoZWNrJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1aXJlZENoZWNrKCRlbCkge1xuICAgICAgICBpZiAoISRlbC5hdHRyKCdyZXF1aXJlZCcpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICB2YXIgaXNHb29kID0gdHJ1ZTtcblxuICAgICAgICBzd2l0Y2ggKCRlbFswXS50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgICAgaXNHb29kID0gJGVsWzBdLmNoZWNrZWQ7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgICAgIHZhciBvcHQgPSAkZWwuZmluZCgnb3B0aW9uOnNlbGVjdGVkJyk7XG4gICAgICAgICAgICBpZiAoIW9wdC5sZW5ndGggfHwgIW9wdC52YWwoKSkgaXNHb29kID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAoISRlbC52YWwoKSB8fCAhJGVsLnZhbCgpLmxlbmd0aCkgaXNHb29kID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNHb29kO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEJhc2VkIG9uICRlbCwgZ2V0IHRoZSBmaXJzdCBlbGVtZW50IHdpdGggc2VsZWN0b3IgaW4gdGhpcyBvcmRlcjpcbiAgICAgICAqIDEuIFRoZSBlbGVtZW50J3MgZGlyZWN0IHNpYmxpbmcoJ3MpLlxuICAgICAgICogMy4gVGhlIGVsZW1lbnQncyBwYXJlbnQncyBjaGlsZHJlbi5cbiAgICAgICAqXG4gICAgICAgKiBUaGlzIGFsbG93cyBmb3IgbXVsdGlwbGUgZm9ybSBlcnJvcnMgcGVyIGlucHV0LCB0aG91Z2ggaWYgbm9uZSBhcmUgZm91bmQsIG5vIGZvcm0gZXJyb3JzIHdpbGwgYmUgc2hvd24uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIHJlZmVyZW5jZSB0byBmaW5kIHRoZSBmb3JtIGVycm9yIHNlbGVjdG9yLlxuICAgICAgICogQHJldHVybnMge09iamVjdH0galF1ZXJ5IG9iamVjdCB3aXRoIHRoZSBzZWxlY3Rvci5cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZmluZEZvcm1FcnJvcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZEZvcm1FcnJvcigkZWwpIHtcbiAgICAgICAgdmFyICRlcnJvciA9ICRlbC5zaWJsaW5ncyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yU2VsZWN0b3IpO1xuXG4gICAgICAgIGlmICghJGVycm9yLmxlbmd0aCkge1xuICAgICAgICAgICRlcnJvciA9ICRlbC5wYXJlbnQoKS5maW5kKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JTZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJGVycm9yO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGlzIG9yZGVyOlxuICAgICAgICogMi4gVGhlIDxsYWJlbD4gd2l0aCB0aGUgYXR0cmlidXRlIGBbZm9yPVwic29tZUlucHV0SWRcIl1gXG4gICAgICAgKiAzLiBUaGUgYC5jbG9zZXN0KClgIDxsYWJlbD5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBjaGVjayBmb3IgcmVxdWlyZWQgYXR0cmlidXRlXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2ZpbmRMYWJlbCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZExhYmVsKCRlbCkge1xuICAgICAgICB2YXIgaWQgPSAkZWxbMF0uaWQ7XG4gICAgICAgIHZhciAkbGFiZWwgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xhYmVsW2Zvcj1cIicgKyBpZCArICdcIl0nKTtcblxuICAgICAgICBpZiAoISRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJGxhYmVsO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgc2V0IG9mIGxhYmVscyBhc3NvY2lhdGVkIHdpdGggYSBzZXQgb2YgcmFkaW8gZWxzIGluIHRoaXMgb3JkZXJcbiAgICAgICAqIDIuIFRoZSA8bGFiZWw+IHdpdGggdGhlIGF0dHJpYnV0ZSBgW2Zvcj1cInNvbWVJbnB1dElkXCJdYFxuICAgICAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdmaW5kUmFkaW9MYWJlbHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRSYWRpb0xhYmVscygkZWxzKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBsYWJlbHMgPSAkZWxzLm1hcChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICB2YXIgaWQgPSBlbC5pZDtcbiAgICAgICAgICB2YXIgJGxhYmVsID0gX3RoaXMzLiRlbGVtZW50LmZpbmQoJ2xhYmVsW2Zvcj1cIicgKyBpZCArICdcIl0nKTtcblxuICAgICAgICAgIGlmICghJGxhYmVsLmxlbmd0aCkge1xuICAgICAgICAgICAgJGxhYmVsID0gJChlbCkuY2xvc2VzdCgnbGFiZWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICRsYWJlbFswXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuICQobGFiZWxzKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIHRoZSBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyB0byB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgY2xhc3MgdG9cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnYWRkRXJyb3JDbGFzc2VzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFcnJvckNsYXNzZXMoJGVsKSB7XG4gICAgICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgICAgICB2YXIgJGZvcm1FcnJvciA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWwpO1xuXG4gICAgICAgIGlmICgkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICAgJGxhYmVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRmb3JtRXJyb3IubGVuZ3RoKSB7XG4gICAgICAgICAgJGZvcm1FcnJvci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5pbnB1dEVycm9yQ2xhc3MpLmF0dHIoJ2RhdGEtaW52YWxpZCcsICcnKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmUgQ1NTIGVycm9yIGNsYXNzZXMgZXRjIGZyb20gYW4gZW50aXJlIHJhZGlvIGJ1dHRvbiBncm91cFxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwTmFtZSAtIEEgc3RyaW5nIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lIG9mIGEgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAgICAgKlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMoZ3JvdXBOYW1lKSB7XG4gICAgICAgIHZhciAkZWxzID0gdGhpcy4kZWxlbWVudC5maW5kKCc6cmFkaW9bbmFtZT1cIicgKyBncm91cE5hbWUgKyAnXCJdJyk7XG4gICAgICAgIHZhciAkbGFiZWxzID0gdGhpcy5maW5kUmFkaW9MYWJlbHMoJGVscyk7XG4gICAgICAgIHZhciAkZm9ybUVycm9ycyA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWxzKTtcblxuICAgICAgICBpZiAoJGxhYmVscy5sZW5ndGgpIHtcbiAgICAgICAgICAkbGFiZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRmb3JtRXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICRmb3JtRXJyb3JzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5pbnB1dEVycm9yQ2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMgQ1NTIGVycm9yIGNsYXNzIGFzIHNwZWNpZmllZCBieSB0aGUgQWJpZGUgc2V0dGluZ3MgZnJvbSB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHJlbW92ZSB0aGUgY2xhc3MgZnJvbVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW1vdmVFcnJvckNsYXNzZXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUVycm9yQ2xhc3NlcygkZWwpIHtcbiAgICAgICAgLy8gcmFkaW9zIG5lZWQgdG8gY2xlYXIgYWxsIG9mIHRoZSBlbHNcbiAgICAgICAgaWYgKCRlbFswXS50eXBlID09ICdyYWRpbycpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcygkZWwuYXR0cignbmFtZScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgICAgICB2YXIgJGZvcm1FcnJvciA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWwpO1xuXG4gICAgICAgIGlmICgkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICAgJGxhYmVsLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRmb3JtRXJyb3IubGVuZ3RoKSB7XG4gICAgICAgICAgJGZvcm1FcnJvci5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5pbnB1dEVycm9yQ2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdvZXMgdGhyb3VnaCBhIGZvcm0gdG8gZmluZCBpbnB1dHMgYW5kIHByb2NlZWRzIHRvIHZhbGlkYXRlIHRoZW0gaW4gd2F5cyBzcGVjaWZpYyB0byB0aGVpciB0eXBlLiBcbiAgICAgICAqIElnbm9yZXMgaW5wdXRzIHdpdGggZGF0YS1hYmlkZS1pZ25vcmUsIHR5cGU9XCJoaWRkZW5cIiBvciBkaXNhYmxlZCBhdHRyaWJ1dGVzIHNldFxuICAgICAgICogQGZpcmVzIEFiaWRlI2ludmFsaWRcbiAgICAgICAqIEBmaXJlcyBBYmlkZSN2YWxpZFxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHZhbGlkYXRlLCBzaG91bGQgYmUgYW4gSFRNTCBpbnB1dFxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IGdvb2RUb0dvIC0gSWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC5cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAndmFsaWRhdGVJbnB1dCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsaWRhdGVJbnB1dCgkZWwpIHtcbiAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGNsZWFyUmVxdWlyZSA9IHRoaXMucmVxdWlyZWRDaGVjaygkZWwpLFxuICAgICAgICAgICAgdmFsaWRhdGVkID0gZmFsc2UsXG4gICAgICAgICAgICBjdXN0b21WYWxpZGF0b3IgPSB0cnVlLFxuICAgICAgICAgICAgdmFsaWRhdG9yID0gJGVsLmF0dHIoJ2RhdGEtdmFsaWRhdG9yJyksXG4gICAgICAgICAgICBlcXVhbFRvID0gdHJ1ZTtcblxuICAgICAgICAvLyBkb24ndCB2YWxpZGF0ZSBpZ25vcmVkIGlucHV0cyBvciBoaWRkZW4gaW5wdXRzIG9yIGRpc2FibGVkIGlucHV0c1xuICAgICAgICBpZiAoJGVsLmlzKCdbZGF0YS1hYmlkZS1pZ25vcmVdJykgfHwgJGVsLmlzKCdbdHlwZT1cImhpZGRlblwiXScpIHx8ICRlbC5pcygnW2Rpc2FibGVkXScpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKCRlbFswXS50eXBlKSB7XG4gICAgICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICAgICAgdmFsaWRhdGVkID0gdGhpcy52YWxpZGF0ZVJhZGlvKCRlbC5hdHRyKCduYW1lJykpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGNsZWFyUmVxdWlyZTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVUZXh0KCRlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdGhpcy5tYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3IsICRlbC5hdHRyKCdyZXF1aXJlZCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZWwuYXR0cignZGF0YS1lcXVhbHRvJykpIHtcbiAgICAgICAgICBlcXVhbFRvID0gdGhpcy5vcHRpb25zLnZhbGlkYXRvcnMuZXF1YWxUbygkZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdvb2RUb0dvID0gW2NsZWFyUmVxdWlyZSwgdmFsaWRhdGVkLCBjdXN0b21WYWxpZGF0b3IsIGVxdWFsVG9dLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSAoZ29vZFRvR28gPyAndmFsaWQnIDogJ2ludmFsaWQnKSArICcuemYuYWJpZGUnO1xuXG4gICAgICAgIGlmIChnb29kVG9Hbykge1xuICAgICAgICAgIC8vIFJlLXZhbGlkYXRlIGlucHV0cyB0aGF0IGRlcGVuZCBvbiB0aGlzIG9uZSB3aXRoIGVxdWFsdG9cbiAgICAgICAgICB2YXIgZGVwZW5kZW50RWxlbWVudHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWVxdWFsdG89XCInICsgJGVsLmF0dHIoJ2lkJykgKyAnXCJdJyk7XG4gICAgICAgICAgaWYgKGRlcGVuZGVudEVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyIF90aGlzID0gX3RoaXM0O1xuICAgICAgICAgICAgICBkZXBlbmRlbnRFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS52YWwoKSkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW2dvb2RUb0dvID8gJ3JlbW92ZUVycm9yQ2xhc3NlcycgOiAnYWRkRXJyb3JDbGFzc2VzJ10oJGVsKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgaW5wdXQgaXMgZG9uZSBjaGVja2luZyBmb3IgdmFsaWRhdGlvbi4gRXZlbnQgdHJpZ2dlciBpcyBlaXRoZXIgYHZhbGlkLnpmLmFiaWRlYCBvciBgaW52YWxpZC56Zi5hYmlkZWBcbiAgICAgICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGlucHV0LlxuICAgICAgICAgKiBAZXZlbnQgQWJpZGUjdmFsaWRcbiAgICAgICAgICogQGV2ZW50IEFiaWRlI2ludmFsaWRcbiAgICAgICAgICovXG4gICAgICAgICRlbC50cmlnZ2VyKG1lc3NhZ2UsIFskZWxdKTtcblxuICAgICAgICByZXR1cm4gZ29vZFRvR287XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR29lcyB0aHJvdWdoIGEgZm9ybSBhbmQgaWYgdGhlcmUgYXJlIGFueSBpbnZhbGlkIGlucHV0cywgaXQgd2lsbCBkaXNwbGF5IHRoZSBmb3JtIGVycm9yIGVsZW1lbnRcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBub0Vycm9yIC0gdHJ1ZSBpZiBubyBlcnJvcnMgd2VyZSBkZXRlY3RlZC4uLlxuICAgICAgICogQGZpcmVzIEFiaWRlI2Zvcm12YWxpZFxuICAgICAgICogQGZpcmVzIEFiaWRlI2Zvcm1pbnZhbGlkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3ZhbGlkYXRlRm9ybScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsaWRhdGVGb3JtKCkge1xuICAgICAgICB2YXIgYWNjID0gW107XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kaW5wdXRzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGFjYy5wdXNoKF90aGlzLnZhbGlkYXRlSW5wdXQoJCh0aGlzKSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbm9FcnJvciA9IGFjYy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKS5jc3MoJ2Rpc3BsYXknLCBub0Vycm9yID8gJ25vbmUnIDogJ2Jsb2NrJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGZvcm0gaXMgZmluaXNoZWQgdmFsaWRhdGluZy4gRXZlbnQgdHJpZ2dlciBpcyBlaXRoZXIgYGZvcm12YWxpZC56Zi5hYmlkZWAgb3IgYGZvcm1pbnZhbGlkLnpmLmFiaWRlYC5cbiAgICAgICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgZWxlbWVudCBvZiB0aGUgZm9ybS5cbiAgICAgICAgICogQGV2ZW50IEFiaWRlI2Zvcm12YWxpZFxuICAgICAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybWludmFsaWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigobm9FcnJvciA/ICdmb3JtdmFsaWQnIDogJ2Zvcm1pbnZhbGlkJykgKyAnLnpmLmFiaWRlJywgW3RoaXMuJGVsZW1lbnRdKTtcblxuICAgICAgICByZXR1cm4gbm9FcnJvcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3IgYSBub3QgYSB0ZXh0IGlucHV0IGlzIHZhbGlkIGJhc2VkIG9uIHRoZSBwYXR0ZXJuIHNwZWNpZmllZCBpbiB0aGUgYXR0cmlidXRlLiBJZiBubyBtYXRjaGluZyBwYXR0ZXJuIGlzIGZvdW5kLCByZXR1cm5zIHRydWUuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGEgdGV4dCBpbnB1dCBIVE1MIGVsZW1lbnRcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuIC0gc3RyaW5nIHZhbHVlIG9mIG9uZSBvZiB0aGUgUmVnRXggcGF0dGVybnMgaW4gQWJpZGUub3B0aW9ucy5wYXR0ZXJuc1xuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCB0aGUgaW5wdXQgdmFsdWUgbWF0Y2hlcyB0aGUgcGF0dGVybiBzcGVjaWZpZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAndmFsaWRhdGVUZXh0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWxpZGF0ZVRleHQoJGVsLCBwYXR0ZXJuKSB7XG4gICAgICAgIC8vIEEgcGF0dGVybiBjYW4gYmUgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24sIG9yIGl0IHdpbGwgYmUgaW5mZXJlZCBmcm9tIHRoZSBpbnB1dCdzIFwicGF0dGVyblwiIGF0dHJpYnV0ZSwgb3IgaXQncyBcInR5cGVcIiBhdHRyaWJ1dGVcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4gfHwgJGVsLmF0dHIoJ3BhdHRlcm4nKSB8fCAkZWwuYXR0cigndHlwZScpO1xuICAgICAgICB2YXIgaW5wdXRUZXh0ID0gJGVsLnZhbCgpO1xuICAgICAgICB2YXIgdmFsaWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoaW5wdXRUZXh0Lmxlbmd0aCkge1xuICAgICAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudCBpcyBpbiBBYmlkZSdzIGxpc3Qgb2YgcGF0dGVybnMsIHRoZW4gdGVzdCB0aGF0IHJlZ2V4cFxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGF0dGVybnMuaGFzT3duUHJvcGVydHkocGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLnBhdHRlcm5zW3BhdHRlcm5dLnRlc3QoaW5wdXRUZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgdGhlIHBhdHRlcm4gbmFtZSBpc24ndCBhbHNvIHRoZSB0eXBlIGF0dHJpYnV0ZSBvZiB0aGUgZmllbGQsIHRoZW4gdGVzdCBpdCBhcyBhIHJlZ2V4cFxuICAgICAgICAgIGVsc2UgaWYgKHBhdHRlcm4gIT09ICRlbC5hdHRyKCd0eXBlJykpIHtcbiAgICAgICAgICAgICAgdmFsaWQgPSBuZXcgUmVnRXhwKHBhdHRlcm4pLnRlc3QoaW5wdXRUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBbiBlbXB0eSBmaWVsZCBpcyB2YWxpZCBpZiBpdCdzIG5vdCByZXF1aXJlZFxuICAgICAgICBlbHNlIGlmICghJGVsLnByb3AoJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERldGVybWluZXMgd2hldGhlciBvciBhIG5vdCBhIHJhZGlvIGlucHV0IGlzIHZhbGlkIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IGl0IGlzIHJlcXVpcmVkIGFuZCBzZWxlY3RlZC4gQWx0aG91Z2ggdGhlIGZ1bmN0aW9uIHRhcmdldHMgYSBzaW5nbGUgYDxpbnB1dD5gLCBpdCB2YWxpZGF0ZXMgYnkgY2hlY2tpbmcgdGhlIGByZXF1aXJlZGAgYW5kIGBjaGVja2VkYCBwcm9wZXJ0aWVzIG9mIGFsbCByYWRpbyBidXR0b25zIGluIGl0cyBncm91cC5cbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cE5hbWUgLSBBIHN0cmluZyB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZSBvZiBhIHJhZGlvIGJ1dHRvbiBncm91cFxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdCBsZWFzdCBvbmUgcmFkaW8gaW5wdXQgaGFzIGJlZW4gc2VsZWN0ZWQgKGlmIGl0J3MgcmVxdWlyZWQpXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3ZhbGlkYXRlUmFkaW8nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbGlkYXRlUmFkaW8oZ3JvdXBOYW1lKSB7XG4gICAgICAgIC8vIElmIGF0IGxlYXN0IG9uZSByYWRpbyBpbiB0aGUgZ3JvdXAgaGFzIHRoZSBgcmVxdWlyZWRgIGF0dHJpYnV0ZSwgdGhlIGdyb3VwIGlzIGNvbnNpZGVyZWQgcmVxdWlyZWRcbiAgICAgICAgLy8gUGVyIFczQyBzcGVjLCBhbGwgcmFkaW8gYnV0dG9ucyBpbiBhIGdyb3VwIHNob3VsZCBoYXZlIGByZXF1aXJlZGAsIGJ1dCB3ZSdyZSBiZWluZyBuaWNlXG4gICAgICAgIHZhciAkZ3JvdXAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJzpyYWRpb1tuYW1lPVwiJyArIGdyb3VwTmFtZSArICdcIl0nKTtcbiAgICAgICAgdmFyIHZhbGlkID0gZmFsc2UsXG4gICAgICAgICAgICByZXF1aXJlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEZvciB0aGUgZ3JvdXAgdG8gYmUgcmVxdWlyZWQsIGF0IGxlYXN0IG9uZSByYWRpbyBuZWVkcyB0byBiZSByZXF1aXJlZFxuICAgICAgICAkZ3JvdXAuZWFjaChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICAgIGlmICgkKGUpLmF0dHIoJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgICAgIHJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlcXVpcmVkKSB2YWxpZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgIC8vIEZvciB0aGUgZ3JvdXAgdG8gYmUgdmFsaWQsIGF0IGxlYXN0IG9uZSByYWRpbyBuZWVkcyB0byBiZSBjaGVja2VkXG4gICAgICAgICAgJGdyb3VwLmVhY2goZnVuY3Rpb24gKGksIGUpIHtcbiAgICAgICAgICAgIGlmICgkKGUpLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERldGVybWluZXMgaWYgYSBzZWxlY3RlZCBpbnB1dCBwYXNzZXMgYSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbi4gTXVsdGlwbGUgdmFsaWRhdGlvbnMgY2FuIGJlIHVzZWQsIGlmIHBhc3NlZCB0byB0aGUgZWxlbWVudCB3aXRoIGBkYXRhLXZhbGlkYXRvcj1cImZvbyBiYXIgYmF6XCJgIGluIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3RlZC5cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgaW5wdXQgZWxlbWVudC5cbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWxpZGF0b3JzIC0gYSBzdHJpbmcgb2YgZnVuY3Rpb24gbmFtZXMgbWF0Y2hpbmcgZnVuY3Rpb25zIGluIHRoZSBBYmlkZS5vcHRpb25zLnZhbGlkYXRvcnMgb2JqZWN0LlxuICAgICAgICogQHBhcmFtIHtCb29sZWFufSByZXF1aXJlZCAtIHNlbGYgZXhwbGFuYXRvcnk/XG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIHZhbGlkYXRpb25zIHBhc3NlZC5cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnbWF0Y2hWYWxpZGF0aW9uJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBtYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3JzLCByZXF1aXJlZCkge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICByZXF1aXJlZCA9IHJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgIHZhciBjbGVhciA9IHZhbGlkYXRvcnMuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXM1Lm9wdGlvbnMudmFsaWRhdG9yc1t2XSgkZWwsIHJlcXVpcmVkLCAkZWwucGFyZW50KCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsZWFyLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZXNldHMgZm9ybSBpbnB1dHMgYW5kIHN0eWxlc1xuICAgICAgICogQGZpcmVzIEFiaWRlI2Zvcm1yZXNldFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZXNldEZvcm0nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0Rm9ybSgpIHtcbiAgICAgICAgdmFyICRmb3JtID0gdGhpcy4kZWxlbWVudCxcbiAgICAgICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgJCgnLicgKyBvcHRzLmxhYmVsRXJyb3JDbGFzcywgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgICAgICQoJy4nICsgb3B0cy5pbnB1dEVycm9yQ2xhc3MsICRmb3JtKS5ub3QoJ3NtYWxsJykucmVtb3ZlQ2xhc3Mob3B0cy5pbnB1dEVycm9yQ2xhc3MpO1xuICAgICAgICAkKG9wdHMuZm9ybUVycm9yU2VsZWN0b3IgKyAnLicgKyBvcHRzLmZvcm1FcnJvckNsYXNzKS5yZW1vdmVDbGFzcyhvcHRzLmZvcm1FcnJvckNsYXNzKTtcbiAgICAgICAgJGZvcm0uZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgJCgnOmlucHV0JywgJGZvcm0pLm5vdCgnOmJ1dHRvbiwgOnN1Ym1pdCwgOnJlc2V0LCA6aGlkZGVuLCA6cmFkaW8sIDpjaGVja2JveCwgW2RhdGEtYWJpZGUtaWdub3JlXScpLnZhbCgnJykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgICAgICQoJzppbnB1dDpyYWRpbycsICRmb3JtKS5ub3QoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICAgICAkKCc6aW5wdXQ6Y2hlY2tib3gnLCAkZm9ybSkubm90KCdbZGF0YS1hYmlkZS1pZ25vcmVdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGZvcm0gaGFzIGJlZW4gcmVzZXQuXG4gICAgICAgICAqIEBldmVudCBBYmlkZSNmb3JtcmVzZXRcbiAgICAgICAgICovXG4gICAgICAgICRmb3JtLnRyaWdnZXIoJ2Zvcm1yZXNldC56Zi5hYmlkZScsIFskZm9ybV0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIEFiaWRlLlxuICAgICAgICogUmVtb3ZlcyBlcnJvciBzdHlsZXMgYW5kIGNsYXNzZXMgZnJvbSBlbGVtZW50cywgd2l0aG91dCByZXNldHRpbmcgdGhlaXIgdmFsdWVzLlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJykuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuICAgICAgICB0aGlzLiRpbnB1dHMub2ZmKCcuYWJpZGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5yZW1vdmVFcnJvckNsYXNzZXMoJCh0aGlzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQWJpZGU7XG4gIH0oKTtcblxuICAvKipcbiAgICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gICAqL1xuXG5cbiAgQWJpZGUuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgZXZlbnQgdG8gdmFsaWRhdGUgaW5wdXRzLiBDaGVja2JveGVzIGFuZCByYWRpb3MgdmFsaWRhdGUgaW1tZWRpYXRlbHkuXG4gICAgICogUmVtb3ZlIG9yIGNoYW5nZSB0aGlzIHZhbHVlIGZvciBtYW51YWwgdmFsaWRhdGlvbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUgez9zdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2ZpZWxkQ2hhbmdlJ1xuICAgICAqL1xuICAgIHZhbGlkYXRlT246ICdmaWVsZENoYW5nZScsXG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0IGxhYmVscyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnaXMtaW52YWxpZC1sYWJlbCdcbiAgICAgKi9cbiAgICBsYWJlbEVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkLWxhYmVsJyxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIHRvIGJlIGFwcGxpZWQgdG8gaW5wdXRzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdpcy1pbnZhbGlkLWlucHV0J1xuICAgICAqL1xuICAgIGlucHV0RXJyb3JDbGFzczogJ2lzLWludmFsaWQtaW5wdXQnLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3Mgc2VsZWN0b3IgdG8gdXNlIHRvIHRhcmdldCBGb3JtIEVycm9ycyBmb3Igc2hvdy9oaWRlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICcuZm9ybS1lcnJvcidcbiAgICAgKi9cbiAgICBmb3JtRXJyb3JTZWxlY3RvcjogJy5mb3JtLWVycm9yJyxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIGFkZGVkIHRvIEZvcm0gRXJyb3JzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdpcy12aXNpYmxlJ1xuICAgICAqL1xuICAgIGZvcm1FcnJvckNsYXNzOiAnaXMtdmlzaWJsZScsXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdG8gdHJ1ZSB0byB2YWxpZGF0ZSB0ZXh0IGlucHV0cyBvbiBhbnkgdmFsdWUgY2hhbmdlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGxpdmVWYWxpZGF0ZTogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdG8gdHJ1ZSB0byB2YWxpZGF0ZSBpbnB1dHMgb24gYmx1ci5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICB2YWxpZGF0ZU9uQmx1cjogZmFsc2UsXG5cbiAgICBwYXR0ZXJuczoge1xuICAgICAgYWxwaGE6IC9eW2EtekEtWl0rJC8sXG4gICAgICBhbHBoYV9udW1lcmljOiAvXlthLXpBLVowLTldKyQvLFxuICAgICAgaW50ZWdlcjogL15bLStdP1xcZCskLyxcbiAgICAgIG51bWJlcjogL15bLStdP1xcZCooPzpbXFwuXFwsXVxcZCspPyQvLFxuXG4gICAgICAvLyBhbWV4LCB2aXNhLCBkaW5lcnNcbiAgICAgIGNhcmQ6IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLyxcbiAgICAgIGN2djogL14oWzAtOV0pezMsNH0kLyxcblxuICAgICAgLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2Uvc3RhdGVzLW9mLXRoZS10eXBlLWF0dHJpYnV0ZS5odG1sI3ZhbGlkLWUtbWFpbC1hZGRyZXNzXG4gICAgICBlbWFpbDogL15bYS16QS1aMC05LiEjJCUmJyorXFwvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrJC8sXG5cbiAgICAgIHVybDogL14oaHR0cHM/fGZ0cHxmaWxlfHNzaCk6XFwvXFwvKCgoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kLyxcbiAgICAgIC8vIGFiYy5kZVxuICAgICAgZG9tYWluOiAvXihbYS16QS1aMC05XShbYS16QS1aMC05XFwtXXswLDYxfVthLXpBLVowLTldKT9cXC4pK1thLXpBLVpdezIsOH0kLyxcblxuICAgICAgZGF0ZXRpbWU6IC9eKFswLTJdWzAtOV17M30pXFwtKFswLTFdWzAtOV0pXFwtKFswLTNdWzAtOV0pVChbMC01XVswLTldKVxcOihbMC01XVswLTldKVxcOihbMC01XVswLTldKShafChbXFwtXFwrXShbMC0xXVswLTldKVxcOjAwKSkkLyxcbiAgICAgIC8vIFlZWVktTU0tRERcbiAgICAgIGRhdGU6IC8oPzoxOXwyMClbMC05XXsyfS0oPzooPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18MVswLTldfDJbMC05XSl8KD86KD8hMDIpKD86MFsxLTldfDFbMC0yXSktKD86MzApKXwoPzooPzowWzEzNTc4XXwxWzAyXSktMzEpKSQvLFxuICAgICAgLy8gSEg6TU06U1NcbiAgICAgIHRpbWU6IC9eKDBbMC05XXwxWzAtOV18MlswLTNdKSg6WzAtNV1bMC05XSl7Mn0kLyxcbiAgICAgIGRhdGVJU086IC9eXFxkezR9W1xcL1xcLV1cXGR7MSwyfVtcXC9cXC1dXFxkezEsMn0kLyxcbiAgICAgIC8vIE1NL0REL1lZWVlcbiAgICAgIG1vbnRoX2RheV95ZWFyOiAvXigwWzEtOV18MVswMTJdKVstIFxcLy5dKDBbMS05XXxbMTJdWzAtOV18M1swMV0pWy0gXFwvLl1cXGR7NH0kLyxcbiAgICAgIC8vIEREL01NL1lZWVlcbiAgICAgIGRheV9tb250aF95ZWFyOiAvXigwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dKDBbMS05XXwxWzAxMl0pWy0gXFwvLl1cXGR7NH0kLyxcblxuICAgICAgLy8gI0ZGRiBvciAjRkZGRkZGXG4gICAgICBjb2xvcjogL14jPyhbYS1mQS1GMC05XXs2fXxbYS1mQS1GMC05XXszfSkkL1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9ucyB0byBiZSB1c2VkLiBgZXF1YWxUb2AgYmVpbmcgdGhlIG9ubHkgZGVmYXVsdCBpbmNsdWRlZCBmdW5jdGlvbi5cbiAgICAgKiBGdW5jdGlvbnMgc2hvdWxkIHJldHVybiBvbmx5IGEgYm9vbGVhbiBpZiB0aGUgaW5wdXQgaXMgdmFsaWQgb3Igbm90LiBGdW5jdGlvbnMgYXJlIGdpdmVuIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICAqIGVsIDogVGhlIGpRdWVyeSBlbGVtZW50IHRvIHZhbGlkYXRlLlxuICAgICAqIHJlcXVpcmVkIDogQm9vbGVhbiB2YWx1ZSBvZiB0aGUgcmVxdWlyZWQgYXR0cmlidXRlIGJlIHByZXNlbnQgb3Igbm90LlxuICAgICAqIHBhcmVudCA6IFRoZSBkaXJlY3QgcGFyZW50IG9mIHRoZSBpbnB1dC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICovXG4gICAgdmFsaWRhdG9yczoge1xuICAgICAgZXF1YWxUbzogZnVuY3Rpb24gKGVsLCByZXF1aXJlZCwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiAkKCcjJyArIGVsLmF0dHIoJ2RhdGEtZXF1YWx0bycpKS52YWwoKSA9PT0gZWwudmFsKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKEFiaWRlLCAnQWJpZGUnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJvcGRvd24tbWVudVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICAgKi9cblxuICB2YXIgRHJvcGRvd25NZW51ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRHJvcGRvd25NZW51LlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjaW5pdFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEcm9wZG93bk1lbnUoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERyb3Bkb3duTWVudSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyb3Bkb3duTWVudS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRHJvcGRvd25NZW51Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxuICAgICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luLCBhbmQgY2FsbHMgX3ByZXBhcmVNZW51XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKERyb3Bkb3duTWVudSwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgdmFyIHN1YnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKCdmaXJzdC1zdWInKTtcblxuICAgICAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgdGhpcy4kdGFicy5maW5kKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkgfHwgdGhpcy4kZWxlbWVudC5wYXJlbnRzKCcudG9wLWJhci1yaWdodCcpLmlzKCcqJykpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID0gJ3JpZ2h0JztcbiAgICAgICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1sZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtcmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZXZlbnRzKCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnX2lzVmVydGljYWwnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pc1ZlcnRpY2FsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kdGFicy5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8IHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgICAvLyB1c2VkIGZvciBvbkNsaWNrIGFuZCBpbiB0aGUga2V5Ym9hcmQgaGFuZGxlcnNcbiAgICAgICAgdmFyIGhhbmRsZUNsaWNrRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbSA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnLicgKyBwYXJDbGFzcyksXG4gICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKSxcbiAgICAgICAgICAgICAgaGFzQ2xpY2tlZCA9ICRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnLFxuICAgICAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgICBpZiAoaGFzQ2xpY2tlZCkge1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbiAmJiAhaGFzVG91Y2ggfHwgX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJHN1Yik7XG4gICAgICAgICAgICAgICRlbGVtLmFkZCgkZWxlbS5wYXJlbnRzVW50aWwoX3RoaXMuJGVsZW1lbnQsICcuJyArIHBhckNsYXNzKSkuYXR0cignZGF0YS1pcy1jbGljaycsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51IHRvdWNoc3RhcnQuemYuZHJvcGRvd25tZW51JywgaGFuZGxlQ2xpY2tGbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2tJbnNpZGUpIHtcbiAgICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgICAgIGlmICghaGFzU3ViKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcbiAgICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuXG4gICAgICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcbiAgICAgICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5ob3ZlckRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKGhhc1N1YiAmJiBfdGhpcy5vcHRpb25zLmF1dG9jbG9zZSkge1xuICAgICAgICAgICAgICBpZiAoJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScgJiYgX3RoaXMub3B0aW9ucy5jbGlja09wZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2tleWRvd24uemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ1tyb2xlPVwibWVudWl0ZW1cIl0nKSxcbiAgICAgICAgICAgICAgaXNUYWIgPSBfdGhpcy4kdGFicy5pbmRleCgkZWxlbWVudCkgPiAtMSxcbiAgICAgICAgICAgICAgJGVsZW1lbnRzID0gaXNUYWIgPyBfdGhpcy4kdGFicyA6ICRlbGVtZW50LnNpYmxpbmdzKCdsaScpLmFkZCgkZWxlbWVudCksXG4gICAgICAgICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSAtIDEpO1xuICAgICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSArIDEpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISRlbGVtZW50LmlzKCc6bGFzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICAgICRuZXh0RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcmV2U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb3BlblN1YiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkc3ViID0gJGVsZW1lbnQuY2hpbGRyZW4oJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcbiAgICAgICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnbGkgPiBhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNsb3NlU3ViID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9pZiAoJGVsZW1lbnQuaXMoJzpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICB2YXIgY2xvc2UgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICAgICAgY2xvc2UuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoY2xvc2UpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgb3Blbjogb3BlblN1YixcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKF90aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgICAgX3RoaXMuJG1lbnVJdGVtcy5maW5kKCdhOmZpcnN0JykuZm9jdXMoKTsgLy8gZm9jdXMgdG8gZmlyc3QgZWxlbWVudFxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoaXNUYWIpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5faXNWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgICAgIC8vIHZlcnRpY2FsIG1lbnVcbiAgICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBob3Jpem9udGFsIG1lbnVcbiAgICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBuZXh0OiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIG5leHQ6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vdCB0YWJzIC0+IG9uZSBzdWJcbiAgICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7XG4gICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0Ryb3Bkb3duTWVudScsIGZ1bmN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19hZGRCb2R5SGFuZGxlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgICAgICB2YXIgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpLm9uKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkbGluayA9IF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpO1xuICAgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE9wZW5zIGEgZHJvcGRvd24gcGFuZSwgYW5kIGNoZWNrcyBmb3IgY29sbGlzaW9ucyBmaXJzdC5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkc3ViIC0gdWwgZWxlbWVudCB0aGF0IGlzIGEgc3VibWVudSB0byBzaG93XG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3Nob3cnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zaG93KCRzdWIpIHtcbiAgICAgICAgdmFyIGlkeCA9IHRoaXMuJHRhYnMuaW5kZXgodGhpcy4kdGFicy5maWx0ZXIoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgcmV0dXJuICQoZWwpLmZpbmQoJHN1YikubGVuZ3RoID4gMDtcbiAgICAgICAgfSkpO1xuICAgICAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgdGhpcy5faGlkZSgkc2licywgaWR4KTtcbiAgICAgICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuYWRkQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgIHZhciBjbGVhciA9IEZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UoJHN1YiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIGlmICghY2xlYXIpIHtcbiAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAnLXJpZ2h0JyA6ICctbGVmdCcsXG4gICAgICAgICAgICAgICRwYXJlbnRMaSA9ICRzdWIucGFyZW50KCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoJ29wZW5zJyArIG9sZENsYXNzKS5hZGRDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpO1xuICAgICAgICAgIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICBpZiAoIWNsZWFyKSB7XG4gICAgICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoJ29wZW5zLScgKyB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KS5hZGRDbGFzcygnb3BlbnMtaW5uZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICcnKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgICAgICB0aGlzLl9hZGRCb2R5SGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBuZXcgZHJvcGRvd24gcGFuZSBpcyB2aXNpYmxlLlxuICAgICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bm1lbnUnLCBbJHN1Yl0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEhpZGVzIGEgc2luZ2xlLCBjdXJyZW50bHkgb3BlbiBkcm9wZG93biBwYW5lLCBpZiBwYXNzZWQgYSBwYXJhbWV0ZXIsIG90aGVyd2lzZSwgaGlkZXMgZXZlcnl0aGluZy5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBoaWRlXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlICR0YWJzIGNvbGxlY3Rpb24gdG8gaGlkZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2hpZGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oaWRlKCRlbGVtLCBpZHgpIHtcbiAgICAgICAgdmFyICR0b0Nsb3NlO1xuICAgICAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSAkZWxlbTtcbiAgICAgICAgfSBlbHNlIGlmIChpZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gaSA9PT0gaWR4O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0b0Nsb3NlID0gdGhpcy4kZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc29tZXRoaW5nVG9DbG9zZSA9ICR0b0Nsb3NlLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSB8fCAkdG9DbG9zZS5maW5kKCcuaXMtYWN0aXZlJykubGVuZ3RoID4gMDtcblxuICAgICAgICBpZiAoc29tZXRoaW5nVG9DbG9zZSkge1xuICAgICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWFjdGl2ZScpLmFkZCgkdG9DbG9zZSkuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1pcy1jbGljayc6IGZhbHNlXG4gICAgICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAgICAgJHRvQ2xvc2UuZmluZCgndWwuanMtZHJvcGRvd24tYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKHRoaXMuY2hhbmdlZCB8fCAkdG9DbG9zZS5maW5kKCdvcGVucy1pbm5lcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkKCR0b0Nsb3NlKS5yZW1vdmVDbGFzcygnb3BlbnMtaW5uZXIgb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy0nICsgb2xkQ2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9wZW4gbWVudXMgYXJlIGNsb3NlZC5cbiAgICAgICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I2hpZGVcbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGUuemYuZHJvcGRvd25tZW51JywgWyR0b0Nsb3NlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJykucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub2ZmKCcuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERyb3Bkb3duTWVudTtcbiAgfSgpO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAgICovXG5cblxuICBEcm9wZG93bk1lbnUuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogRGlzYWxsb3dzIGhvdmVyIGV2ZW50cyBmcm9tIG9wZW5pbmcgc3VibWVudXNcbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBkaXNhYmxlSG92ZXI6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGEgc3VibWVudSB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIG9uIGEgbW91c2VsZWF2ZSBldmVudCwgaWYgbm90IGNsaWNrZWQgb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBvcGVuaW5nIGEgc3VibWVudSBvbiBob3ZlciBldmVudC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCA1MFxuICAgICAqL1xuICAgIGhvdmVyRGVsYXk6IDUwLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGEgc3VibWVudSB0byBvcGVuL3JlbWFpbiBvcGVuIG9uIHBhcmVudCBjbGljayBldmVudC4gQWxsb3dzIGN1cnNvciB0byBtb3ZlIGF3YXkgZnJvbSBtZW51LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGNsaWNrT3BlbjogZmFsc2UsXG4gICAgLyoqXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgY2xvc2luZyBhIHN1Ym1lbnUgb24gYSBtb3VzZWxlYXZlIGV2ZW50LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDUwMFxuICAgICAqL1xuXG4gICAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgICAvKipcbiAgICAgKiBQb3NpdGlvbiBvZiB0aGUgbWVudSByZWxhdGl2ZSB0byB3aGF0IGRpcmVjdGlvbiB0aGUgc3VibWVudXMgc2hvdWxkIG9wZW4uIEhhbmRsZWQgYnkgSlMuIENhbiBiZSBgJ2xlZnQnYCBvciBgJ3JpZ2h0J2AuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2xlZnQnXG4gICAgICovXG4gICAgYWxpZ25tZW50OiAnbGVmdCcsXG4gICAgLyoqXG4gICAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGNsaWNrcyBvbiBsZWFmIGFuY2hvciBsaW5rcyB0byBjbG9zZSBhbnkgb3BlbiBzdWJtZW51cy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNsb3NlT25DbGlja0luc2lkZTogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHZlcnRpY2FsIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYHZlcnRpY2FsYC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ3ZlcnRpY2FsJ1xuICAgICAqL1xuICAgIHZlcnRpY2FsQ2xhc3M6ICd2ZXJ0aWNhbCcsXG4gICAgLyoqXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2FsaWduLXJpZ2h0J1xuICAgICAqL1xuICAgIHJpZ2h0Q2xhc3M6ICdhbGlnbi1yaWdodCcsXG4gICAgLyoqXG4gICAgICogQm9vbGVhbiB0byBmb3JjZSBvdmVyaWRlIHRoZSBjbGlja2luZyBvZiBsaW5rcyB0byBwZXJmb3JtIGRlZmF1bHQgYWN0aW9uLCBvbiBzZWNvbmQgdG91Y2ggZXZlbnQgZm9yIG1vYmlsZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGZvcmNlRm9sbG93OiB0cnVlXG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gICAqL1xuXG4gIHZhciBPZmZDYW52YXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIE9mZkNhbnZhcyNpbml0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIE9mZkNhbnZhcyhlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgT2ZmQ2FudmFzKTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICAgIHRoaXMuJHRyaWdnZXJzID0gJCgpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT2ZmQ2FudmFzJyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhPZmZDYW52YXMsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy10cmFuc2l0aW9uLScgKyB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbik7XG5cbiAgICAgICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMgPSAkKGRvY3VtZW50KS5maW5kKCdbZGF0YS1vcGVuPVwiJyArIGlkICsgJ1wiXSwgW2RhdGEtY2xvc2U9XCInICsgaWQgKyAnXCJdLCBbZGF0YS10b2dnbGU9XCInICsgaWQgKyAnXCJdJykuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAgICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5ID0gJChvdmVybGF5KTtcbiAgICAgICAgICBpZiAob3ZlcmxheVBvc2l0aW9uID09PSAnaXMtb3ZlcmxheS1maXhlZCcpIHtcbiAgICAgICAgICAgICQoJ2JvZHknKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzXScpWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG9mZi1jYW52YXMgd3JhcHBlciBhbmQgdGhlIGV4aXQgb3ZlcmxheS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2tleWRvd24uemYub2ZmY2FudmFzJzogdGhpcy5faGFuZGxlS2V5Ym9hcmQuYmluZCh0aGlzKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciAkdGFyZ2V0ID0gdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID8gdGhpcy4kb3ZlcmxheSA6ICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKTtcbiAgICAgICAgICAkdGFyZ2V0Lm9uKHsgJ2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zZXRNUUNoZWNrZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlcyB0aGUgcmV2ZWFsaW5nL2hpZGluZyB0aGUgb2ZmLWNhbnZhcyBhdCBicmVha3BvaW50cywgbm90IHRoZSBzYW1lIGFzIG9wZW4uXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JldmVhbCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmV2ZWFsKGlzUmV2ZWFsZWQpIHtcbiAgICAgICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgICAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAkY2xvc2VyLmhpZGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5pc1JldmVhbGVkID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbih7XG4gICAgICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zdG9wU2Nyb2xsaW5nJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gICAgICAvLyBPbmx5IHJlYWxseSB3b3JrcyBmb3IgeSwgbm90IHN1cmUgaG93IHRvIGV4dGVuZCB0byB4IG9yIGlmIHdlIG5lZWQgdG8uXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfcmVjb3JkU2Nyb2xsYWJsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cblxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlIChjb250ZW50IG92ZXJmbG93cyksIHRoZW4uLi5cbiAgICAgICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IDApIHtcbiAgICAgICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIGJvdHRvbSwgc2Nyb2xsIHVwIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgZG93blxuICAgICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgICAgICBlbGVtLmFsbG93RG93biA9IGVsZW0uc2Nyb2xsVG9wIDwgZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodDtcbiAgICAgICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnX3N0b3BTY3JvbGxQcm9wYWdhdGlvbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3N0b3BTY3JvbGxQcm9wYWdhdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuICAgICAgICB2YXIgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgICAgIHZhciBkb3duID0gIXVwO1xuICAgICAgICBlbGVtLmxhc3RZID0gZXZlbnQucGFnZVk7XG5cbiAgICAgICAgaWYgKHVwICYmIGVsZW0uYWxsb3dVcCB8fCBkb3duICYmIGVsZW0uYWxsb3dEb3duKSB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE9wZW5zIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgICAgICogQGZpcmVzIE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnb3BlbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbihldmVudCwgdHJpZ2dlcikge1xuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIgPSB0cmlnZ2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKS50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgYWRkIGNsYXNzIGFuZCBkaXNhYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5maW5kKCdhLCBidXR0b24nKS5lcSgwKS5mb2N1cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnRyYXBGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENsb3NlcyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICAgICAqIEBmaXJlcyBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Nsb3NlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZShjYikge1xuICAgICAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAgICovXG4gICAgICAgIC50cmlnZ2VyKCdjbG9zZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgcmVtb3ZlIGNsYXNzIGFuZCByZS1lbmFibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWxlYXNlRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0b2dnbGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZShldmVudCwgdHJpZ2dlcikge1xuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaGFuZGxlS2V5Ym9hcmQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPZmZDYW52YXMnLCB7XG4gICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzMi5jbG9zZSgpO1xuICAgICAgICAgICAgX3RoaXMyLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgdGhlIG9mZmNhbnZhcyBwbHVnaW4uXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgICAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gT2ZmQ2FudmFzO1xuICB9KCk7XG5cbiAgT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIG92ZXJsYXkgb24gdG9wIG9mIGBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdYC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlL2Rpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBtYWluIGNvbnRlbnQgd2hlbiBhbiBvZmYgY2FudmFzIHBhbmVsIGlzIG9wZW4uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG4gICAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRyYW5zaXRpb24gZm9yIHRoZSBvZmZjYW52YXMgbWVudS4gT3B0aW9ucyBhcmUgJ3B1c2gnLCAnZGV0YWNoZWQnIG9yICdzbGlkZScuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcHVzaFxuICAgICAqL1xuICAgIHRyYW5zaXRpb246ICdwdXNoJyxcblxuICAgIC8qKlxuICAgICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICBmb3JjZVRvOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgcmV2ZWFsT246IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIHVzZWQgdG8gZm9yY2UgYW4gb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuLiBGb3VuZGF0aW9uIGRlZmF1bHRzIGZvciB0aGlzIGFyZSBgcmV2ZWFsLWZvci1sYXJnZWAgJiBgcmV2ZWFsLWZvci1tZWRpdW1gLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHJldmVhbC1mb3ItXG4gICAgICogQHRvZG8gaW1wcm92ZSB0aGUgcmVnZXggdGVzdGluZyBmb3IgdGhpcy5cbiAgICAgKi9cbiAgICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzIG9wdGlvbmFsIGZvY3VzIHRyYXBwaW5nIHdoZW4gb3BlbmluZyBhbiBvZmZjYW52YXMuIFNldHMgdGFiaW5kZXggb2YgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XSB0byAtMSBmb3IgYWNjZXNzaWJpbGl0eSBwdXJwb3Nlcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICB0cmFwRm9jdXM6IGZhbHNlXG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogT3JiaXQgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ub3JiaXRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50b3VjaFxuICAgKi9cblxuICB2YXIgT3JiaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9yYml0IGNhcm91c2VsLlxuICAgICogQGNsYXNzXG4gICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIE9yYml0IENhcm91c2VsLlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICovXG4gICAgZnVuY3Rpb24gT3JiaXQoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE9yYml0KTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT3JiaXQuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPcmJpdCcpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT3JiaXQnLCB7XG4gICAgICAgICdsdHInOiB7XG4gICAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJ1xuICAgICAgICB9LFxuICAgICAgICAncnRsJzoge1xuICAgICAgICAgICdBUlJPV19MRUZUJzogJ25leHQnLFxuICAgICAgICAgICdBUlJPV19SSUdIVCc6ICdwcmV2aW91cydcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IGNyZWF0aW5nIGpRdWVyeSBjb2xsZWN0aW9ucywgc2V0dGluZyBhdHRyaWJ1dGVzLCBhbmQgc3RhcnRpbmcgdGhlIGFuaW1hdGlvbi5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoT3JiaXQsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIC8vIEBUT0RPOiBjb25zaWRlciBkaXNjdXNzaW9uIG9uIFBSICM5Mjc4IGFib3V0IERPTSBwb2xsdXRpb24gYnkgY2hhbmdlU2xpZGVcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcblxuICAgICAgICB0aGlzLiR3cmFwcGVyID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG4gICAgICAgIHRoaXMuJHNsaWRlcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcyk7XG5cbiAgICAgICAgdmFyICRpbWFnZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpLFxuICAgICAgICAgICAgaW5pdEFjdGl2ZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKSxcbiAgICAgICAgICAgIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdvcmJpdCcpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XG4gICAgICAgICAgJ2RhdGEtcmVzaXplJzogaWQsXG4gICAgICAgICAgJ2lkJzogaWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFpbml0QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJHNsaWRlcy5lcSgwKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy51c2VNVUkpIHtcbiAgICAgICAgICB0aGlzLiRzbGlkZXMuYWRkQ2xhc3MoJ25vLW1vdGlvbnVpJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3ByZXBhcmVGb3JPcmJpdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9wcmVwYXJlRm9yT3JiaXQoKTsgLy9oZWhlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgICAgICB0aGlzLl9sb2FkQnVsbGV0cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSAmJiB0aGlzLiRzbGlkZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRoaXMuZ2VvU3luYygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmxlKSB7XG4gICAgICAgICAgLy8gYWxsb3cgd3JhcHBlciB0byBiZSBmb2N1c2FibGUgdG8gZW5hYmxlIGFycm93IG5hdmlnYXRpb25cbiAgICAgICAgICB0aGlzLiR3cmFwcGVyLmF0dHIoJ3RhYmluZGV4JywgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIENyZWF0ZXMgYSBqUXVlcnkgY29sbGVjdGlvbiBvZiBidWxsZXRzLCBpZiB0aGV5IGFyZSBiZWluZyB1c2VkLlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfbG9hZEJ1bGxldHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9sb2FkQnVsbGV0cygpIHtcbiAgICAgICAgdGhpcy4kYnVsbGV0cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuYm94T2ZCdWxsZXRzKS5maW5kKCdidXR0b24nKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIFNldHMgYSBgdGltZXJgIG9iamVjdCBvbiB0aGUgb3JiaXQsIGFuZCBzdGFydHMgdGhlIGNvdW50ZXIgZm9yIHRoZSBuZXh0IHNsaWRlLlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdnZW9TeW5jJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZW9TeW5jKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRpbWVyID0gbmV3IEZvdW5kYXRpb24uVGltZXIodGhpcy4kZWxlbWVudCwge1xuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMudGltZXJEZWxheSxcbiAgICAgICAgICBpbmZpbml0ZTogZmFsc2VcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lci5zdGFydCgpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogU2V0cyB3cmFwcGVyIGFuZCBzbGlkZSBoZWlnaHRzIGZvciB0aGUgb3JiaXQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19wcmVwYXJlRm9yT3JiaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9wcmVwYXJlRm9yT3JiaXQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3NldFdyYXBwZXJIZWlnaHQoKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIENhbHVsYXRlcyB0aGUgaGVpZ2h0IG9mIGVhY2ggc2xpZGUgaW4gdGhlIGNvbGxlY3Rpb24sIGFuZCB1c2VzIHRoZSB0YWxsZXN0IG9uZSBmb3IgdGhlIHdyYXBwZXIgaGVpZ2h0LlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGZpcmUgd2hlbiBjb21wbGV0ZS5cbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc2V0V3JhcHBlckhlaWdodCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFdyYXBwZXJIZWlnaHQoY2IpIHtcbiAgICAgICAgLy9yZXdyaXRlIHRoaXMgdG8gYGZvcmAgbG9vcFxuICAgICAgICB2YXIgbWF4ID0gMCxcbiAgICAgICAgICAgIHRlbXAsXG4gICAgICAgICAgICBjb3VudGVyID0gMCxcbiAgICAgICAgICAgIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRzbGlkZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICQodGhpcykuYXR0cignZGF0YS1zbGlkZScsIGNvdW50ZXIpO1xuXG4gICAgICAgICAgaWYgKF90aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJylbMF0gIT09IF90aGlzLiRzbGlkZXMuZXEoY291bnRlcilbMF0pIHtcbiAgICAgICAgICAgIC8vaWYgbm90IHRoZSBhY3RpdmUgc2xpZGUsIHNldCBjc3MgcG9zaXRpb24gYW5kIGRpc3BsYXkgcHJvcGVydHlcbiAgICAgICAgICAgICQodGhpcykuY3NzKHsgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ2Rpc3BsYXknOiAnbm9uZScgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGNvdW50ZXIgPT09IHRoaXMuJHNsaWRlcy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLiR3cmFwcGVyLmNzcyh7ICdoZWlnaHQnOiBtYXggfSk7IC8vb25seSBjaGFuZ2UgdGhlIHdyYXBwZXIgaGVpZ2h0IHByb3BlcnR5IG9uY2UuXG4gICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICBjYihtYXgpO1xuICAgICAgICAgIH0gLy9maXJlIGNhbGxiYWNrIHdpdGggbWF4IGhlaWdodCBkaW1lbnNpb24uXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIFNldHMgdGhlIG1heC1oZWlnaHQgb2YgZWFjaCBzbGlkZS5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3NldFNsaWRlSGVpZ2h0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0U2xpZGVIZWlnaHQoaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLmNzcygnbWF4LWhlaWdodCcsIGhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgd2l0aGluIHRoZSBlbGVtZW50LlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vKipOb3cgdXNpbmcgY3VzdG9tIGV2ZW50IC0gdGhhbmtzIHRvOioqXG4gICAgICAgIC8vKiogICAgICBZb2hhaSBBcmFyYXQgb2YgVG9yb250byAgICAgICoqXG4gICAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcucmVzaXplbWUuemYudHJpZ2dlcicpLm9uKHtcbiAgICAgICAgICAncmVzaXplbWUuemYudHJpZ2dlcic6IHRoaXMuX3ByZXBhcmVGb3JPcmJpdC5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3dpcGUpIHtcbiAgICAgICAgICAgIHRoaXMuJHNsaWRlcy5vZmYoJ3N3aXBlbGVmdC56Zi5vcmJpdCBzd2lwZXJpZ2h0LnpmLm9yYml0Jykub24oJ3N3aXBlbGVmdC56Zi5vcmJpdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XG4gICAgICAgICAgICB9KS5vbignc3dpcGVyaWdodC56Zi5vcmJpdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QbGF5KSB7XG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMub24oJ2NsaWNrLnpmLm9yYml0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nLCBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSA/IGZhbHNlIDogdHJ1ZSk7XG4gICAgICAgICAgICAgIF90aGlzLnRpbWVyW190aGlzLiRlbGVtZW50LmRhdGEoJ2NsaWNrZWRPbicpID8gJ3BhdXNlJyA6ICdzdGFydCddKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXVzZU9uSG92ZXIpIHtcbiAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5vbignbW91c2VlbnRlci56Zi5vcmJpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50aW1lci5wYXVzZSgpO1xuICAgICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5vcmJpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLiRlbGVtZW50LmRhdGEoJ2NsaWNrZWRPbicpKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy50aW1lci5zdGFydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5uYXZCdXR0b25zKSB7XG4gICAgICAgICAgICB2YXIgJGNvbnRyb2xzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5uZXh0Q2xhc3MgKyAnLCAuJyArIHRoaXMub3B0aW9ucy5wcmV2Q2xhc3MpO1xuICAgICAgICAgICAgJGNvbnRyb2xzLmF0dHIoJ3RhYmluZGV4JywgMClcbiAgICAgICAgICAgIC8vYWxzbyBuZWVkIHRvIGhhbmRsZSBlbnRlci9yZXR1cm4gYW5kIHNwYWNlYmFyIGtleSBwcmVzc2VzXG4gICAgICAgICAgICAub24oJ2NsaWNrLnpmLm9yYml0IHRvdWNoZW5kLnpmLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSgkKHRoaXMpLmhhc0NsYXNzKF90aGlzLm9wdGlvbnMubmV4dENsYXNzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgICAgICAgIHRoaXMuJGJ1bGxldHMub24oJ2NsaWNrLnpmLm9yYml0IHRvdWNoZW5kLnpmLm9yYml0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZiAoL2lzLWFjdGl2ZS9nLnRlc3QodGhpcy5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9IC8vaWYgdGhpcyBpcyBhY3RpdmUsIGtpY2sgb3V0IG9mIGZ1bmN0aW9uLlxuICAgICAgICAgICAgICB2YXIgaWR4ID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpLFxuICAgICAgICAgICAgICAgICAgbHRyID0gaWR4ID4gX3RoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5kYXRhKCdzbGlkZScpLFxuICAgICAgICAgICAgICAgICAgJHNsaWRlID0gX3RoaXMuJHNsaWRlcy5lcShpZHgpO1xuXG4gICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKGx0ciwgJHNsaWRlLCBpZHgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLiR3cmFwcGVyLmFkZCh0aGlzLiRidWxsZXRzKS5vbigna2V5ZG93bi56Zi5vcmJpdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09yYml0Jywge1xuICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIC8vIGlmIGJ1bGxldCBpcyBmb2N1c2VkLCBtYWtlIHN1cmUgZm9jdXMgbW92ZXNcbiAgICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyhfdGhpcy4kYnVsbGV0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuJGJ1bGxldHMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVzZXRzIE9yYml0IHNvIGl0IGNhbiBiZSByZWluaXRpYWxpemVkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19yZXNldCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Jlc2V0KCkge1xuICAgICAgICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgbm8gc2xpZGVzIChmaXJzdCBydW4pXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy4kc2xpZGVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIG9sZCBldmVudHNcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLm9yYml0JykuZmluZCgnKicpLm9mZignLnpmLm9yYml0Jyk7XG5cbiAgICAgICAgICAvLyBSZXN0YXJ0IHRpbWVyIGlmIGF1dG9QbGF5IGlzIGVuYWJsZWRcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QbGF5KSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVyLnJlc3RhcnQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZXNldCBhbGwgc2xpZGRlc1xuICAgICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgJChlbCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1hY3RpdmUgaXMtaW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKS5oaWRlKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTaG93IHRoZSBmaXJzdCBzbGlkZVxuICAgICAgICAgIHRoaXMuJHNsaWRlcy5maXJzdCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5zaG93KCk7XG5cbiAgICAgICAgICAvLyBUcmlnZ2VycyB3aGVuIHRoZSBzbGlkZSBoYXMgZmluaXNoZWQgYW5pbWF0aW5nXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzbGlkZWNoYW5nZS56Zi5vcmJpdCcsIFt0aGlzLiRzbGlkZXMuZmlyc3QoKV0pO1xuXG4gICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IGJ1bGxldCBpZiBidWxsZXRzIGFyZSBwcmVzZW50XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVCdWxsZXRzKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBzbGlkZSB0byBhIG5ldyBvbmUuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTFRSIC0gZmxhZyBpZiB0aGUgc2xpZGUgc2hvdWxkIG1vdmUgbGVmdCB0byByaWdodC5cbiAgICAgICogQHBhcmFtIHtqUXVlcnl9IGNob3NlblNsaWRlIC0gdGhlIGpRdWVyeSBlbGVtZW50IG9mIHRoZSBzbGlkZSB0byBzaG93IG5leHQsIGlmIG9uZSBpcyBzZWxlY3RlZC5cbiAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIHRoZSBpbmRleCBvZiB0aGUgbmV3IHNsaWRlIGluIGl0cyBjb2xsZWN0aW9uLCBpZiBvbmUgY2hvc2VuLlxuICAgICAgKiBAZmlyZXMgT3JiaXQjc2xpZGVjaGFuZ2VcbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjaGFuZ2VTbGlkZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2hhbmdlU2xpZGUoaXNMVFIsIGNob3NlblNsaWRlLCBpZHgpIHtcbiAgICAgICAgaWYgKCF0aGlzLiRzbGlkZXMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gLy8gRG9uJ3QgZnJlYWsgb3V0IGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgY2xlYW51cFxuICAgICAgICB2YXIgJGN1clNsaWRlID0gdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpLmVxKDApO1xuXG4gICAgICAgIGlmICgvbXVpL2cudGVzdCgkY3VyU2xpZGVbMF0uY2xhc3NOYW1lKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSAvL2lmIHRoZSBzbGlkZSBpcyBjdXJyZW50bHkgYW5pbWF0aW5nLCBraWNrIG91dCBvZiB0aGUgZnVuY3Rpb25cblxuICAgICAgICB2YXIgJGZpcnN0U2xpZGUgPSB0aGlzLiRzbGlkZXMuZmlyc3QoKSxcbiAgICAgICAgICAgICRsYXN0U2xpZGUgPSB0aGlzLiRzbGlkZXMubGFzdCgpLFxuICAgICAgICAgICAgZGlySW4gPSBpc0xUUiA/ICdSaWdodCcgOiAnTGVmdCcsXG4gICAgICAgICAgICBkaXJPdXQgPSBpc0xUUiA/ICdMZWZ0JyA6ICdSaWdodCcsXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAkbmV3U2xpZGU7XG5cbiAgICAgICAgaWYgKCFjaG9zZW5TbGlkZSkge1xuICAgICAgICAgIC8vbW9zdCBvZiB0aGUgdGltZSwgdGhpcyB3aWxsIGJlIGF1dG8gcGxheWVkIG9yIGNsaWNrZWQgZnJvbSB0aGUgbmF2QnV0dG9ucy5cbiAgICAgICAgICAkbmV3U2xpZGUgPSBpc0xUUiA/IC8vaWYgd3JhcHBpbmcgZW5hYmxlZCwgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGEgYG5leHRgIG9yIGBwcmV2YCBzaWJsaW5nLCBpZiBub3QsIHNlbGVjdCB0aGUgZmlyc3Qgb3IgbGFzdCBzbGlkZSB0byBmaWxsIGluLiBpZiB3cmFwcGluZyBub3QgZW5hYmxlZCwgYXR0ZW1wdCB0byBzZWxlY3QgYG5leHRgIG9yIGBwcmV2YCwgaWYgdGhlcmUncyBub3RoaW5nIHRoZXJlLCB0aGUgZnVuY3Rpb24gd2lsbCBraWNrIG91dCBvbiBuZXh0IHN0ZXAuIENSQVpZIE5FU1RFRCBURVJOQVJJRVMhISEhIVxuICAgICAgICAgIHRoaXMub3B0aW9ucy5pbmZpbml0ZVdyYXAgPyAkY3VyU2xpZGUubmV4dCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykubGVuZ3RoID8gJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpIDogJGZpcnN0U2xpZGUgOiAkY3VyU2xpZGUubmV4dCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykgOiAvL3BpY2sgbmV4dCBzbGlkZSBpZiBtb3ZpbmcgbGVmdCB0byByaWdodFxuICAgICAgICAgIHRoaXMub3B0aW9ucy5pbmZpbml0ZVdyYXAgPyAkY3VyU2xpZGUucHJldignLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykubGVuZ3RoID8gJGN1clNsaWRlLnByZXYoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpIDogJGxhc3RTbGlkZSA6ICRjdXJTbGlkZS5wcmV2KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKTsgLy9waWNrIHByZXYgc2xpZGUgaWYgbW92aW5nIHJpZ2h0IHRvIGxlZnRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkbmV3U2xpZGUgPSBjaG9zZW5TbGlkZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkbmV3U2xpZGUubGVuZ3RoKSB7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgKiBUcmlnZ2VycyBiZWZvcmUgdGhlIG5leHQgc2xpZGUgc3RhcnRzIGFuaW1hdGluZyBpbiBhbmQgb25seSBpZiBhIG5leHQgc2xpZGUgaGFzIGJlZW4gZm91bmQuXG4gICAgICAgICAgKiBAZXZlbnQgT3JiaXQjYmVmb3Jlc2xpZGVjaGFuZ2VcbiAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignYmVmb3Jlc2xpZGVjaGFuZ2UuemYub3JiaXQnLCBbJGN1clNsaWRlLCAkbmV3U2xpZGVdKTtcblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVsbGV0cykge1xuICAgICAgICAgICAgaWR4ID0gaWR4IHx8IHRoaXMuJHNsaWRlcy5pbmRleCgkbmV3U2xpZGUpOyAvL2dyYWIgaW5kZXggdG8gdXBkYXRlIGJ1bGxldHNcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1bGxldHMoaWR4KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZU1VSSAmJiAhdGhpcy4kZWxlbWVudC5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlSW4oJG5ld1NsaWRlLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5jc3MoeyAncG9zaXRpb24nOiAnYWJzb2x1dGUnLCAndG9wJzogMCB9KSwgdGhpcy5vcHRpb25zWydhbmltSW5Gcm9tJyArIGRpckluXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkbmV3U2xpZGUuY3NzKHsgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ2Rpc3BsYXknOiAnYmxvY2snIH0pLmF0dHIoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCRjdXJTbGlkZS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyksIHRoaXMub3B0aW9uc1snYW5pbU91dFRvJyArIGRpck91dF0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJGN1clNsaWRlLnJlbW92ZUF0dHIoJ2FyaWEtbGl2ZScpO1xuICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhX3RoaXMudGltZXIuaXNQYXVzZWQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50aW1lci5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9kbyBzdHVmZj9cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkY3VyU2xpZGUucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1pbicpLnJlbW92ZUF0dHIoJ2FyaWEtbGl2ZScpLmhpZGUoKTtcbiAgICAgICAgICAgICRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlIGlzLWluJykuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpLnNob3coKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgIXRoaXMudGltZXIuaXNQYXVzZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy50aW1lci5yZXN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICogVHJpZ2dlcnMgd2hlbiB0aGUgc2xpZGUgaGFzIGZpbmlzaGVkIGFuaW1hdGluZyBpbi5cbiAgICAgICAgICAqIEBldmVudCBPcmJpdCNzbGlkZWNoYW5nZVxuICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzbGlkZWNoYW5nZS56Zi5vcmJpdCcsIFskbmV3U2xpZGVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogVXBkYXRlcyB0aGUgYWN0aXZlIHN0YXRlIG9mIHRoZSBidWxsZXRzLCBpZiBkaXNwbGF5ZWQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHNsaWRlLlxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ191cGRhdGVCdWxsZXRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlQnVsbGV0cyhpZHgpIHtcbiAgICAgICAgdmFyICRvbGRCdWxsZXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLmJveE9mQnVsbGV0cykuZmluZCgnLmlzLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKS5ibHVyKCksXG4gICAgICAgICAgICBzcGFuID0gJG9sZEJ1bGxldC5maW5kKCdzcGFuOmxhc3QnKS5kZXRhY2goKSxcbiAgICAgICAgICAgICRuZXdCdWxsZXQgPSB0aGlzLiRidWxsZXRzLmVxKGlkeCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLmFwcGVuZChzcGFuKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIERlc3Ryb3lzIHRoZSBjYXJvdXNlbCBhbmQgaGlkZXMgdGhlIGVsZW1lbnQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYub3JiaXQnKS5maW5kKCcqJykub2ZmKCcuemYub3JiaXQnKS5lbmQoKS5oaWRlKCk7XG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gT3JiaXQ7XG4gIH0oKTtcblxuICBPcmJpdC5kZWZhdWx0cyA9IHtcbiAgICAvKipcbiAgICAqIFRlbGxzIHRoZSBKUyB0byBsb29rIGZvciBhbmQgbG9hZEJ1bGxldHMuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBidWxsZXRzOiB0cnVlLFxuICAgIC8qKlxuICAgICogVGVsbHMgdGhlIEpTIHRvIGFwcGx5IGV2ZW50IGxpc3RlbmVycyB0byBuYXYgYnV0dG9uc1xuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgbmF2QnV0dG9uczogdHJ1ZSxcbiAgICAvKipcbiAgICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ3NsaWRlLWluLXJpZ2h0J1xuICAgICovXG4gICAgYW5pbUluRnJvbVJpZ2h0OiAnc2xpZGUtaW4tcmlnaHQnLFxuICAgIC8qKlxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnc2xpZGUtb3V0LXJpZ2h0J1xuICAgICovXG4gICAgYW5pbU91dFRvUmlnaHQ6ICdzbGlkZS1vdXQtcmlnaHQnLFxuICAgIC8qKlxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnc2xpZGUtaW4tbGVmdCdcbiAgICAqXG4gICAgKi9cbiAgICBhbmltSW5Gcm9tTGVmdDogJ3NsaWRlLWluLWxlZnQnLFxuICAgIC8qKlxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnc2xpZGUtb3V0LWxlZnQnXG4gICAgKi9cbiAgICBhbmltT3V0VG9MZWZ0OiAnc2xpZGUtb3V0LWxlZnQnLFxuICAgIC8qKlxuICAgICogQWxsb3dzIE9yYml0IHRvIGF1dG9tYXRpY2FsbHkgYW5pbWF0ZSBvbiBwYWdlIGxvYWQuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBhdXRvUGxheTogdHJ1ZSxcbiAgICAvKipcbiAgICAqIEFtb3VudCBvZiB0aW1lLCBpbiBtcywgYmV0d2VlbiBzbGlkZSB0cmFuc2l0aW9uc1xuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgKiBAZGVmYXVsdCA1MDAwXG4gICAgKi9cbiAgICB0aW1lckRlbGF5OiA1MDAwLFxuICAgIC8qKlxuICAgICogQWxsb3dzIE9yYml0IHRvIGluZmluaXRlbHkgbG9vcCB0aHJvdWdoIHRoZSBzbGlkZXNcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIGluZmluaXRlV3JhcDogdHJ1ZSxcbiAgICAvKipcbiAgICAqIEFsbG93cyB0aGUgT3JiaXQgc2xpZGVzIHRvIGJpbmQgdG8gc3dpcGUgZXZlbnRzIGZvciBtb2JpbGUsIHJlcXVpcmVzIGFuIGFkZGl0aW9uYWwgdXRpbCBsaWJyYXJ5XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBzd2lwZTogdHJ1ZSxcbiAgICAvKipcbiAgICAqIEFsbG93cyB0aGUgdGltaW5nIGZ1bmN0aW9uIHRvIHBhdXNlIGFuaW1hdGlvbiBvbiBob3Zlci5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAvKipcbiAgICAqIEFsbG93cyBPcmJpdCB0byBiaW5kIGtleWJvYXJkIGV2ZW50cyB0byB0aGUgc2xpZGVyLCB0byBhbmltYXRlIGZyYW1lcyB3aXRoIGFycm93IGtleXNcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIGFjY2Vzc2libGU6IHRydWUsXG4gICAgLyoqXG4gICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBjb250YWluZXIgb2YgT3JiaXRcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ29yYml0LWNvbnRhaW5lcidcbiAgICAqL1xuICAgIGNvbnRhaW5lckNsYXNzOiAnb3JiaXQtY29udGFpbmVyJyxcbiAgICAvKipcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gaW5kaXZpZHVhbCBzbGlkZXMuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdvcmJpdC1zbGlkZSdcbiAgICAqL1xuICAgIHNsaWRlQ2xhc3M6ICdvcmJpdC1zbGlkZScsXG4gICAgLyoqXG4gICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBidWxsZXQgY29udGFpbmVyLiBZb3UncmUgd2VsY29tZS5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ29yYml0LWJ1bGxldHMnXG4gICAgKi9cbiAgICBib3hPZkJ1bGxldHM6ICdvcmJpdC1idWxsZXRzJyxcbiAgICAvKipcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGBuZXh0YCBuYXZpZ2F0aW9uIGJ1dHRvbi5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ29yYml0LW5leHQnXG4gICAgKi9cbiAgICBuZXh0Q2xhc3M6ICdvcmJpdC1uZXh0JyxcbiAgICAvKipcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGBwcmV2aW91c2AgbmF2aWdhdGlvbiBidXR0b24uXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdvcmJpdC1wcmV2aW91cydcbiAgICAqL1xuICAgIHByZXZDbGFzczogJ29yYml0LXByZXZpb3VzJyxcbiAgICAvKipcbiAgICAqIEJvb2xlYW4gdG8gZmxhZyB0aGUganMgdG8gdXNlIG1vdGlvbiB1aSBjbGFzc2VzIG9yIG5vdC4gRGVmYXVsdCB0byB0cnVlIGZvciBiYWNrd2FyZHMgY29tcGF0YWJpbGl0eS5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIHVzZU1VSTogdHJ1ZVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKE9yYml0LCAnT3JiaXQnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICAgKi9cblxuICB2YXIgUmVzcG9uc2l2ZU1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgbWVudS5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSZXNwb25zaXZlTWVudShlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVzcG9uc2l2ZU1lbnUpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbnVsbDtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Jlc3BvbnNpdmVNZW51Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIE1lbnUgYnkgcGFyc2luZyB0aGUgY2xhc3NlcyBmcm9tIHRoZSAnZGF0YS1SZXNwb25zaXZlTWVudScgYXR0cmlidXRlIG9uIHRoZSBlbGVtZW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhSZXNwb25zaXZlTWVudSwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucnVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdmFyIHJ1bGVzVHJlZSA9IHt9O1xuXG4gICAgICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgICAgIHZhciBydWxlcyA9IHRoaXMucnVsZXMuc3BsaXQoJyAnKTtcblxuICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBldmVyeSBydWxlIGZvdW5kXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgdmFyIHJ1bGVTaXplID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVswXSA6ICdzbWFsbCc7XG4gICAgICAgICAgICB2YXIgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgICAgICBpZiAoTWVudVBsdWdpbnNbcnVsZVBsdWdpbl0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcnVsZXNUcmVlW3J1bGVTaXplXSA9IE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucnVsZXMgPSBydWxlc1RyZWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISQuaXNFbXB0eU9iamVjdCh0aGlzLnJ1bGVzKSkge1xuICAgICAgICAgIHRoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGRhdGEtbXV0YXRlIHNpbmNlIGNoaWxkcmVuIG1heSBuZWVkIGl0LlxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJywgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3Jlc3BvbnNpdmUtbWVudScpKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuUmVzcG9uc2l2ZU1lbnUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2NoZWNrTWVkaWFRdWVyaWVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgICAgIHZhciBtYXRjaGVkTXEsXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICAgICAkLmVhY2godGhpcy5ydWxlcywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgICAgICBtYXRjaGVkTXEgPSBrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBObyBtYXRjaD8gTm8gZGljZVxuICAgICAgICBpZiAoIW1hdGNoZWRNcSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4gaW5zdGFuY2VvZiB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHBsdWdpbi1zcGVjaWZpYyBDU1MgY2xhc3Nlc1xuICAgICAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModmFsdWUuY3NzQ2xhc3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIENTUyBjbGFzcyBmb3IgdGhlIG5ldyBwbHVnaW5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luKSB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICAgICAkKHdpbmRvdykub2ZmKCcuemYuUmVzcG9uc2l2ZU1lbnUnKTtcbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBSZXNwb25zaXZlTWVudTtcbiAgfSgpO1xuXG4gIFJlc3BvbnNpdmVNZW51LmRlZmF1bHRzID0ge307XG5cbiAgLy8gVGhlIHBsdWdpbiBtYXRjaGVzIHRoZSBwbHVnaW4gY2xhc3NlcyB3aXRoIHRoZXNlIHBsdWdpbiBpbnN0YW5jZXMuXG4gIHZhciBNZW51UGx1Z2lucyA9IHtcbiAgICBkcm9wZG93bjoge1xuICAgICAgY3NzQ2xhc3M6ICdkcm9wZG93bicsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gICAgfSxcbiAgICBkcmlsbGRvd246IHtcbiAgICAgIGNzc0NsYXNzOiAnZHJpbGxkb3duJyxcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICAgIH0sXG4gICAgYWNjb3JkaW9uOiB7XG4gICAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snYWNjb3JkaW9uLW1lbnUnXSB8fCBudWxsXG4gICAgfVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKFJlc3BvbnNpdmVNZW51LCAnUmVzcG9uc2l2ZU1lbnUnKTtcbn0oalF1ZXJ5KTsiLCIoZnVuY3Rpb24oJCkge1xuICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbiAgJChcIiNqcy1mb3JtXCIpLnN1Ym1pdChmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkZm9ybSA9ICQodGhpcyk7XG4gICAgXG4gICAgJC5wb3N0KCRmb3JtLmF0dHIoXCJhY3Rpb25cIiksICRmb3JtLnNlcmlhbGl6ZSgpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIEhpZGUgdGhlIGZvcm0gYW5kIHNob3cgdGhlIGNvbmZpcm1hdGlvbiBtZXNhZ2UuIFxuICAgICRmb3JtLmhpZGUoKTtcbiAgICAkKFwiI2pzLWNvbmZpcm1hdGlvblwiKS5zaG93KCkuY3NzKFwiaGVpZ2h0XCIsICRmb3JtLmhlaWdodCgpKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgdmFyIHZhbGlkYXRlID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgICBcbiAgfTtcblxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAkKFwiI3Jvb21zXCIpLnNsaWNrKHtcbiAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgc2xpZGVzVG9TY3JvbGw6IDQsXG4gICAgICBuZXh0QXJyb3c6XG4gICAgICAgICc8YnV0dG9uIGNsYXNzPVwic2xpY2stbmV4dC1hcnJvd1wiIGFyaWEtbGFiZWw9XCJOZXh0IHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtcmlnaHRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgICAgcHJldkFycm93OlxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLXByZXZpb3VzLWFycm93XCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzIHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtbGVmdFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBicmVha3BvaW50OiAxMDI0LFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMyxcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgZG90czogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBicmVha3BvaW50OiA2MDAsXG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBZb3UgY2FuIHVuc2xpY2sgYXQgYSBnaXZlbiBicmVha3BvaW50IG5vdyBieSBhZGRpbmc6XG4gICAgICAgIC8vIHNldHRpbmdzOiBcInVuc2xpY2tcIlxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICBdXG4gICAgfSk7XG4gIH0pO1xuICAvKlxuICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgJChcIiNhcnJpdmVEdFwiKS5kYXRlcGlja2VyKCk7XG4gICAgICQoXCIjZGVwYXJ0RHRcIikuZGF0ZXBpY2tlcigpO1xuICAgICB9KTtcblxuICAgICBmdW5jdGlvbiBzdWJtaXRmb3JtKCkge1xuICAgICBpZiAoISQoXCIjYXJyaXZlRHRcIikudmFsKCkgfHwgISQoXCIjZGVwYXJ0RHRcIikudmFsKCkpIHtcbiAgICAgd2luZG93LmFsZXJ0KFwiUGxlYXNlIGVudGVyIGEgU3RhcnQgYW5kIEVuZCBEYXRlIVwiKTtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9XG4gICAgICQoJyNyZXNibG9jaycpLnN1Ym1pdCgpO1xuICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgKi9cbiAgLy8gYXJyaXZlRHRcbiAgLy8gZGVwYXJ0RHRcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgUGlrYWRheSBkYXRlcGlja2Vycy5cbiAgICogQHR5cGUgeyp9XG4gICAqL1xuICAvKlxuICAgIHZhciBjaGVja2luRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycml2ZUR0XCIpLFxuICAgICAgICBjaGVja291dEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXBhcnREdFwiKSxcbiAgICAgICAgY2hlY2tpblBpa2EgPSBwaWthZGF5UmVzcG9uc2l2ZShjaGVja2luRWwsIHtcbiAgICAgICAgICAgIGZvcm1hdDogJ00vREQvWVlZWScsXG4gICAgICAgICAgICBwaWthZGF5T3B0aW9uczoge1xuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBjaGVja291dFBpa2EgPSBwaWthZGF5UmVzcG9uc2l2ZShjaGVja291dEVsLCB7XG4gICAgICAgICAgICBmb3JtYXQ6ICdNL0REL1lZWVknLFxuICAgICAgICAgICAgcGlrYWRheU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiovXG4gIC8vIENoZWNrIGNoZWNrb3V0ZGF0ZVxuICAvKlxuICAgICQoY2hlY2tpbkVsKS5vbignY2hhbmdlLWRhdGUnLCBmdW5jdGlvbiAoZSwgZGF0ZSkge1xuICAgICAgICAvLyBJZiBjaGVjayBvdXQgZGF0ZSBpcyBiZWZvcmUgY2hlY2sgaW4gZGF0ZVxuICAgICAgICBpZiAoZGF0ZS5kYXRlLmlzQWZ0ZXIoY2hlY2tvdXRQaWthLmRhdGUpKSB7XG4gICAgICAgICAgICBjaGVja291dFBpa2Euc2V0RGF0ZShkYXRlLmRhdGUuYWRkKDEsICdkYXknKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIG1pbiBkYXRlIGZvciB0aGUgY2hlY2tvdXQgaW5wdXQuXG4gICAgICAgIGNoZWNrb3V0UGlrYS5waWthZGF5LnNldE1pbkRhdGUoY2hlY2tpblBpa2EuZGF0ZS50b0RhdGUoKSk7XG4gICAgfSk7XG5cbiAgICAkKCcuYm9va2luZy1hY2NvcmRpb24tdGl0bGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGl0bGUgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgYmFyID0gJCgnLmJvb2tpbmctYmFyJyk7XG4gICAgICAgIGJhci5zbGlkZVRvZ2dsZSgnZmFzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJhci50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgaWYgKGJhci5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQ2xvc2UnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQm9vayBOb3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiovXG4gICQoXCIuaGVyby1zbGlja1wiKS5zbGljayh7XG4gICAgbmV4dEFycm93OlxuICAgICAgJzxidXR0b24gY2xhc3M9XCJzbGljay1uZXh0LWFycm93XCIgYXJpYS1sYWJlbD1cIk5leHQgcm9vbXNcIj48c3ZnIGNsYXNzPVwiaWNvblwiPjx1c2UgeGxpbms6aHJlZj1cIiNhbmdsZS1yaWdodFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgcHJldkFycm93OlxuICAgICAgJzxidXR0b24gY2xhc3M9XCJzbGljay1wcmV2aW91cy1hcnJvd1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91cyByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nXG4gIH0pO1xufSkoalF1ZXJ5KTtcbiJdfQ==
