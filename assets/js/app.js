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

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function (factory) {
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
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function customPaging(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
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
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
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

            _.$dots.find('li').first().addClass('slick-active');
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

        _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
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

        if (_.options.rows > 0) {

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

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
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
    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,
            originalSlides;

        if (_.options.rows > 0) {
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

        _.$slider.off('focus.slick blur.slick').on('focus.slick blur.slick', '*', function (event) {

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
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
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
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                coef = -1;

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2;
                    }
                }
                verticalOffset = verticalHeight * _.options.slidesToShow * coef;
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

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
        } else if (_.options.centerMode === true && _.options.infinite === true) {
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
        var _ = this,
            numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
            tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
            return val >= 0 && val < _.slideCount;
        });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                    var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex;
                    if ($('#' + ariaButtonControl).length) {
                        $(this).attr({
                            'aria-describedby': ariaButtonControl
                        });
                    }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': i + 1 + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });
            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            if (_.options.focusOnChange) {
                _.$slides.eq(i).attr({ 'tabindex': '0' });
            } else {
                _.$slides.eq(i).removeAttr('tabindex');
            }
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

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }
    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

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
        $(_.setPosition);
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
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image.animate({ opacity: 0 }, 100, function () {

                        if (imageSrcSet) {
                            image.attr('srcset', imageSrcSet);

                            if (imageSizes) {
                                image.attr('sizes', imageSizes);
                            }
                        }

                        image.attr('src', imageSource).animate({ opacity: 1 }, 200, function () {
                            image.removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');
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

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

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

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
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
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                if (imageSrcSet) {
                    image.attr('srcset', imageSrcSet);

                    if (imageSizes) {
                        image.attr('sizes', imageSizes);
                    }
                }

                image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');

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

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

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

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                    _.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
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

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
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
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
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

            _.slideHandler(index, false, true);
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
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
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
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
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

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
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
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

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
            touches,
            verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
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

            _.$dots.find('li').removeClass('slick-active').end();

            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');
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
'use strict';

(function ($) {
    $(document).foundation();

    $(document).ready(function () {
        $('#rooms').slick({
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
    $('.hero-slick').slick({
        nextArrow: '<button class="slick-next-arrow" aria-label="Next rooms"><svg class="icon"><use xlink:href="#angle-right"></use></svg></button>',
        prevArrow: '<button class="slick-previous-arrow" aria-label="Previous rooms"><svg class="icon"><use xlink:href="#angle-left"></use></svg></button>'
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwic2xpY2suanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm1vdGlvbi5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmRyb3Bkb3duTWVudS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJhIiwiYiIsImMiLCJkb2N1bWVudCIsImxhenlTaXplcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3aW5kb3ciLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiZCIsImRvY3VtZW50RWxlbWVudCIsImUiLCJEYXRlIiwiZiIsIkhUTUxQaWN0dXJlRWxlbWVudCIsImciLCJoIiwiaSIsImoiLCJzZXRUaW1lb3V0IiwiayIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImwiLCJyZXF1ZXN0SWRsZUNhbGxiYWNrIiwibSIsIm4iLCJvIiwicCIsIkFycmF5IiwicHJvdG90eXBlIiwiZm9yRWFjaCIsInEiLCJSZWdFeHAiLCJ0ZXN0IiwiciIsInNldEF0dHJpYnV0ZSIsInRyaW0iLCJzIiwicmVwbGFjZSIsInQiLCJ1IiwiY3JlYXRlRXZlbnQiLCJpbml0Q3VzdG9tRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwidiIsInBpY3R1cmVmaWxsIiwicGYiLCJyZWV2YWx1YXRlIiwiZWxlbWVudHMiLCJzcmMiLCJ3IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsIngiLCJvZmZzZXRXaWR0aCIsIm1pblNpemUiLCJfbGF6eXNpemVzV2lkdGgiLCJwYXJlbnROb2RlIiwieSIsImxlbmd0aCIsInNoaWZ0IiwiYXBwbHkiLCJhcmd1bWVudHMiLCJwdXNoIiwiaGlkZGVuIiwiX2xzRmx1c2giLCJ6IiwiQSIsIm5vdyIsInRpbWVvdXQiLCJCIiwiQyIsIkUiLCJGIiwiRyIsIkgiLCJJIiwiSiIsIksiLCJMIiwiTSIsIk4iLCJPIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiUCIsIlEiLCJSIiwiUyIsIlQiLCJ0YXJnZXQiLCJVIiwiYm9keSIsIm9mZnNldFBhcmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsIlYiLCJsb2FkTW9kZSIsImV4cGFuZCIsImNsaWVudEhlaWdodCIsImNsaWVudFdpZHRoIiwiZXhwRmFjdG9yIiwiX2xhenlSYWNlIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYmEiLCJwcmVsb2FkQWZ0ZXJMb2FkIiwic2l6ZXNBdHRyIiwiVyIsIlgiLCJsb2FkZWRDbGFzcyIsImxvYWRpbmdDbGFzcyIsIloiLCJZIiwiJCIsImNvbnRlbnRXaW5kb3ciLCJsb2NhdGlvbiIsIl8iLCJzcmNzZXRBdHRyIiwiY3VzdG9tTWVkaWEiLCJpbnNlcnRCZWZvcmUiLCJjbG9uZU5vZGUiLCJyZW1vdmVDaGlsZCIsImFhIiwiZGVmYXVsdFByZXZlbnRlZCIsImF1dG9zaXplc0NsYXNzIiwic3JjQXR0ciIsIm5vZGVOYW1lIiwiZmlyZXNMb2FkIiwiY2xlYXJUaW1lb3V0IiwiY2FsbCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGF6eUNsYXNzIiwiY29tcGxldGUiLCJuYXR1cmFsV2lkdGgiLCJzcmNzZXQiLCJlcnJvckNsYXNzIiwiZGV0YWlsIiwiRCIsInVwZGF0ZUVsZW0iLCJjYSIsInByZWxvYWRDbGFzcyIsImhGYWMiLCJNdXRhdGlvbk9ic2VydmVyIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJhdHRyaWJ1dGVzIiwic2V0SW50ZXJ2YWwiLCJyZWFkeVN0YXRlIiwiY2hlY2tFbGVtcyIsInVudmVpbCIsImRhdGFBdHRyIiwid2lkdGgiLCJpbml0IiwibGF6eVNpemVzQ29uZmlnIiwibGF6eXNpemVzQ29uZmlnIiwiY2ZnIiwiYXV0b1NpemVyIiwibG9hZGVyIiwidVAiLCJhQyIsInJDIiwiaEMiLCJmaXJlIiwiZ1ciLCJyQUYiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwicmVxdWlyZSIsImpRdWVyeSIsIlNsaWNrIiwiaW5zdGFuY2VVaWQiLCJlbGVtZW50Iiwic2V0dGluZ3MiLCJkYXRhU2V0dGluZ3MiLCJkZWZhdWx0cyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsInRleHQiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWFzaW5nIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJmb2N1c09uQ2hhbmdlIiwiaW5maW5pdGUiLCJpbml0aWFsU2xpZGUiLCJsYXp5TG9hZCIsIm1vYmlsZUZpcnN0IiwicGF1c2VPbkhvdmVyIiwicGF1c2VPbkZvY3VzIiwicGF1c2VPbkRvdHNIb3ZlciIsInJlc3BvbmRUbyIsInJlc3BvbnNpdmUiLCJyb3dzIiwicnRsIiwic2xpZGUiLCJzbGlkZXNQZXJSb3ciLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsInNwZWVkIiwic3dpcGUiLCJzd2lwZVRvU2xpZGUiLCJ0b3VjaE1vdmUiLCJ0b3VjaFRocmVzaG9sZCIsInVzZUNTUyIsInVzZVRyYW5zZm9ybSIsInZhcmlhYmxlV2lkdGgiLCJ2ZXJ0aWNhbCIsInZlcnRpY2FsU3dpcGluZyIsIndhaXRGb3JBbmltYXRlIiwiekluZGV4IiwiaW5pdGlhbHMiLCJhbmltYXRpbmciLCJkcmFnZ2luZyIsImF1dG9QbGF5VGltZXIiLCJjdXJyZW50RGlyZWN0aW9uIiwiY3VycmVudExlZnQiLCJjdXJyZW50U2xpZGUiLCJkaXJlY3Rpb24iLCIkZG90cyIsImxpc3RXaWR0aCIsImxpc3RIZWlnaHQiLCJsb2FkSW5kZXgiLCIkbmV4dEFycm93IiwiJHByZXZBcnJvdyIsInNjcm9sbGluZyIsInNsaWRlQ291bnQiLCJzbGlkZVdpZHRoIiwiJHNsaWRlVHJhY2siLCIkc2xpZGVzIiwic2xpZGluZyIsInNsaWRlT2Zmc2V0Iiwic3dpcGVMZWZ0Iiwic3dpcGluZyIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImV4dGVuZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd1RpbWVyIiwiZGF0YSIsIm9wdGlvbnMiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJjbGlja0hhbmRsZXIiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImZpbmQiLCJhdHRyIiwiYWRkU2xpZGUiLCJzbGlja0FkZCIsIm1hcmt1cCIsImluZGV4IiwiYWRkQmVmb3JlIiwidW5sb2FkIiwiYXBwZW5kVG8iLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiY2hpbGRyZW4iLCJkZXRhY2giLCJhcHBlbmQiLCJlYWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsInRhcmdldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiYW5pbWF0ZSIsImhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJjYWxsYmFjayIsImFuaW1Qcm9wcyIsImFuaW1TdGFydCIsImR1cmF0aW9uIiwic3RlcCIsIk1hdGgiLCJjZWlsIiwiY3NzIiwiYXBwbHlUcmFuc2l0aW9uIiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJub3QiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJjbGVhckludGVydmFsIiwic2xpZGVUbyIsImJ1aWxkQXJyb3dzIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsInJlbW92ZUF0dHIiLCJhZGQiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImZpcnN0IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsInJvdyIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsInJlZnJlc2giLCJ0cmlnZ2VyIiwiZXZlbnQiLCJkb250QW5pbWF0ZSIsIiR0YXJnZXQiLCJjdXJyZW50VGFyZ2V0IiwiaW5kZXhPZmZzZXQiLCJ1bmV2ZW5PZmZzZXQiLCJpcyIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VzdCIsIm1lc3NhZ2UiLCJjaGVja05hdmlnYWJsZSIsIm5hdmlnYWJsZXMiLCJwcmV2TmF2aWdhYmxlIiwiZ2V0TmF2aWdhYmxlSW5kZXhlcyIsImNsZWFuVXBFdmVudHMiLCJvZmYiLCJpbnRlcnJ1cHQiLCJ2aXNpYmlsaXR5IiwiY2xlYW5VcFNsaWRlRXZlbnRzIiwib3JpZW50YXRpb25DaGFuZ2UiLCJyZXNpemUiLCJjbGVhblVwUm93cyIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInN0b3BQcm9wYWdhdGlvbiIsImRlc3Ryb3kiLCJyZW1vdmUiLCJmYWRlU2xpZGUiLCJzbGlkZUluZGV4Iiwib3BhY2l0eSIsImZhZGVTbGlkZU91dCIsImZpbHRlclNsaWRlcyIsInNsaWNrRmlsdGVyIiwiZmlsdGVyIiwiZm9jdXNIYW5kbGVyIiwib24iLCIkc2YiLCJnZXRDdXJyZW50Iiwic2xpY2tDdXJyZW50U2xpZGUiLCJicmVha1BvaW50IiwiY291bnRlciIsInBhZ2VyUXR5IiwiZ2V0TGVmdCIsInZlcnRpY2FsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJ0YXJnZXRTbGlkZSIsImNvZWYiLCJmbG9vciIsIm9mZnNldExlZnQiLCJvdXRlcldpZHRoIiwiZ2V0T3B0aW9uIiwic2xpY2tHZXRPcHRpb24iLCJvcHRpb24iLCJpbmRleGVzIiwibWF4IiwiZ2V0U2xpY2siLCJnZXRTbGlkZUNvdW50Iiwic2xpZGVzVHJhdmVyc2VkIiwic3dpcGVkU2xpZGUiLCJjZW50ZXJPZmZzZXQiLCJhYnMiLCJnb1RvIiwic2xpY2tHb1RvIiwicGFyc2VJbnQiLCJjcmVhdGlvbiIsImhhc0NsYXNzIiwic2V0UHJvcHMiLCJzdGFydExvYWQiLCJsb2FkU2xpZGVyIiwiaW5pdGlhbGl6ZUV2ZW50cyIsInVwZGF0ZUFycm93cyIsImluaXRBREEiLCJudW1Eb3RHcm91cHMiLCJ0YWJDb250cm9sSW5kZXhlcyIsInZhbCIsInNsaWRlQ29udHJvbEluZGV4IiwiaW5kZXhPZiIsImFyaWFCdXR0b25Db250cm9sIiwibWFwcGVkU2xpZGVJbmRleCIsImVuZCIsImluaXRBcnJvd0V2ZW50cyIsImluaXREb3RFdmVudHMiLCJpbml0U2xpZGVFdmVudHMiLCJhY3Rpb24iLCJpbml0VUkiLCJzaG93IiwidGFnTmFtZSIsIm1hdGNoIiwia2V5Q29kZSIsImxvYWRSYW5nZSIsImNsb25lUmFuZ2UiLCJyYW5nZVN0YXJ0IiwicmFuZ2VFbmQiLCJsb2FkSW1hZ2VzIiwiaW1hZ2VzU2NvcGUiLCJpbWFnZSIsImltYWdlU291cmNlIiwiaW1hZ2VTcmNTZXQiLCJpbWFnZVNpemVzIiwiaW1hZ2VUb0xvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwic2xpY2UiLCJwcmV2U2xpZGUiLCJuZXh0U2xpZGUiLCJwcm9ncmVzc2l2ZUxhenlMb2FkIiwibmV4dCIsInNsaWNrTmV4dCIsInBhdXNlIiwic2xpY2tQYXVzZSIsInBsYXkiLCJzbGlja1BsYXkiLCJwb3N0U2xpZGUiLCIkY3VycmVudFNsaWRlIiwiZm9jdXMiLCJwcmV2Iiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsInR5cGUiLCJzcGxpY2UiLCJzb3J0Iiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BzIiwic2V0RGltZW5zaW9ucyIsInBhZGRpbmciLCJvZmZzZXQiLCJzZXRGYWRlIiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwidmFsdWUiLCJvcHQiLCJib2R5U3R5bGUiLCJzdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJ1bmRlZmluZWQiLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJldmVuQ29lZiIsImluZmluaXRlQ291bnQiLCJjbG9uZSIsInRvZ2dsZSIsInRhcmdldEVsZW1lbnQiLCJwYXJlbnRzIiwic3luYyIsImFuaW1TbGlkZSIsIm9sZFNsaWRlIiwic2xpZGVMZWZ0IiwibmF2VGFyZ2V0IiwiaGlkZSIsInN3aXBlRGlyZWN0aW9uIiwieERpc3QiLCJ5RGlzdCIsInN3aXBlQW5nbGUiLCJzdGFydFgiLCJjdXJYIiwic3RhcnRZIiwiY3VyWSIsImF0YW4yIiwicm91bmQiLCJQSSIsInN3aXBlRW5kIiwic3dpcGVMZW5ndGgiLCJlZGdlSGl0IiwibWluU3dpcGUiLCJmaW5nZXJDb3VudCIsIm9yaWdpbmFsRXZlbnQiLCJ0b3VjaGVzIiwic3dpcGVTdGFydCIsInN3aXBlTW92ZSIsImVkZ2VXYXNIaXQiLCJjdXJMZWZ0IiwicG9zaXRpb25PZmZzZXQiLCJ2ZXJ0aWNhbFN3aXBlTGVuZ3RoIiwicGFnZVgiLCJjbGllbnRYIiwicGFnZVkiLCJjbGllbnRZIiwic3FydCIsInBvdyIsInVuZmlsdGVyU2xpZGVzIiwic2xpY2tVbmZpbHRlciIsImZyb21CcmVha3BvaW50IiwiZm4iLCJhcmdzIiwicmV0IiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsInVucmVnaXN0ZXJQbHVnaW4iLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiX2luaXQiLCJfdGhpcyIsImZucyIsInBsZ3MiLCJmb3VuZGF0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm5hbWVzcGFjZSIsInJhbmRvbSIsInRvU3RyaW5nIiwicmVmbG93IiwiZWxlbSIsIiRlbGVtIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsIm1hcCIsImVsIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwidHJpZ2dlckhhbmRsZXIiLCJ1dGlsIiwidGhyb3R0bGUiLCJmdW5jIiwiZGVsYXkiLCJ0aW1lciIsImNvbnRleHQiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiaGVhZCIsIk1lZGlhUXVlcnkiLCJwbHVnQ2xhc3MiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsImdldFRpbWUiLCJ2ZW5kb3JzIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImxhc3RUaW1lIiwibmV4dFRpbWUiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwiQm94IiwiSW1Ob3RUb3VjaGluZ1lvdSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwibHJPbmx5IiwidGJPbmx5IiwiZWxlRGltcyIsInBhckRpbXMiLCJ3aW5kb3dEaW1zIiwiYWxsRGlycyIsIkVycm9yIiwicmVjdCIsInBhclJlY3QiLCJ3aW5SZWN0Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJrZXlDb2RlcyIsImNvbW1hbmRzIiwiS2V5Ym9hcmQiLCJnZXRLZXlDb2RlcyIsInBhcnNlS2V5Iiwia2V5Iiwid2hpY2giLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ0b1VwcGVyQ2FzZSIsInNoaWZ0S2V5IiwiY3RybEtleSIsImFsdEtleSIsImhhbmRsZUtleSIsImNvbXBvbmVudCIsImZ1bmN0aW9ucyIsImNvbW1hbmRMaXN0IiwiY21kcyIsImNvbW1hbmQiLCJsdHIiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZWQiLCJ1bmhhbmRsZWQiLCJmaW5kRm9jdXNhYmxlIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwidHJhcEZvY3VzIiwiJGZvY3VzYWJsZSIsIiRmaXJzdEZvY3VzYWJsZSIsIiRsYXN0Rm9jdXNhYmxlIiwicmVsZWFzZUZvY3VzIiwia2NzIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiaW5mbyIsImlkIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0Iiwib25lIiwiZmluaXNoIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsIkJ1cm4iLCJyb2xlIiwiVGltZXIiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsImR4IiwiZHkiLCJkaXIiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwidGVhcmRvd24iLCJzcGVjaWFsIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiaW5pdE1vdXNlRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJtdXRhdGVMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCJhdHRyaWJ1dGVOYW1lIiwiZWxlbWVudE9ic2VydmVyIiwiY2hhcmFjdGVyRGF0YSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsIkRyb3Bkb3duTWVudSIsInN1YnMiLCIkbWVudUl0ZW1zIiwiJHRhYnMiLCJ2ZXJ0aWNhbENsYXNzIiwicmlnaHRDbGFzcyIsImFsaWdubWVudCIsImNoYW5nZWQiLCJfZXZlbnRzIiwiX2lzVmVydGljYWwiLCJoYXNUb3VjaCIsIm9udG91Y2hzdGFydCIsInBhckNsYXNzIiwiaGFuZGxlQ2xpY2tGbiIsInBhcmVudHNVbnRpbCIsImhhc1N1YiIsImhhc0NsaWNrZWQiLCJjbG9zZU9uQ2xpY2siLCJjbGlja09wZW4iLCJmb3JjZUZvbGxvdyIsIl9oaWRlIiwiX3Nob3ciLCJjbG9zZU9uQ2xpY2tJbnNpZGUiLCJkaXNhYmxlSG92ZXIiLCJob3ZlckRlbGF5IiwiYXV0b2Nsb3NlIiwiY2xvc2luZ1RpbWUiLCJpc1RhYiIsIiRlbGVtZW50cyIsInNpYmxpbmdzIiwiJHByZXZFbGVtZW50IiwiJG5leHRFbGVtZW50IiwibmV4dFNpYmxpbmciLCJwcmV2U2libGluZyIsIm9wZW5TdWIiLCJjbG9zZVN1YiIsImNsb3NlIiwib3BlbiIsImRvd24iLCJ1cCIsInByZXZpb3VzIiwiX2FkZEJvZHlIYW5kbGVyIiwiJGJvZHkiLCIkbGluayIsImlkeCIsIiRzaWJzIiwiY2xlYXIiLCJvbGRDbGFzcyIsIiRwYXJlbnRMaSIsIiR0b0Nsb3NlIiwic29tZXRoaW5nVG9DbG9zZSIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsIiRvdmVybGF5IiwiaXNSZXZlYWxlZCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJfaGFuZGxlS2V5Ym9hcmQiLCJyZXZlYWwiLCIkY2xvc2VyIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvcCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiYXV0b0ZvY3VzIiwiX3RoaXMyIiwiUmVzcG9uc2l2ZU1lbnUiLCJydWxlcyIsImN1cnJlbnRNcSIsImN1cnJlbnRQbHVnaW4iLCJydWxlc1RyZWUiLCJydWxlIiwicnVsZVNpemUiLCJydWxlUGx1Z2luIiwiTWVudVBsdWdpbnMiLCJpc0VtcHR5T2JqZWN0IiwiX2NoZWNrTWVkaWFRdWVyaWVzIiwibWF0Y2hlZE1xIiwiY3NzQ2xhc3MiLCJkcm9wZG93biIsImRyaWxsZG93biIsImFjY29yZGlvbiIsInJlYWR5Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUVuQkQsbUJBQVc7QUFGUSxLQUF2QjtBQUlILENBN0dELEVBNkdHYixNQTdHSCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NC4zLjFcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHQgIC8qXG5cdCAgICogdmFyaWFibGVzXG5cdCAgICovXG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFsnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJ107XG5cblx0ICB2YXIgZnVuY3Rpb25MaXN0ID0gW107XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gWzE2LCAvLyBzaGlmdFxuXHQgIDE3LCAvLyBjb250cm9sXG5cdCAgMTgsIC8vIGFsdFxuXHQgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgOTMgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIC8vIGxpc3Qgb2Yga2V5cyBmb3Igd2hpY2ggd2UgY2hhbmdlIGludGVudCBldmVuIGZvciBmb3JtIGlucHV0c1xuXHQgIHZhciBjaGFuZ2VJbnRlbnRNYXAgPSBbOSAvLyB0YWJcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICBrZXlkb3duOiAna2V5Ym9hcmQnLFxuXHQgICAga2V5dXA6ICdrZXlib2FyZCcsXG5cdCAgICBtb3VzZWRvd246ICdtb3VzZScsXG5cdCAgICBtb3VzZW1vdmU6ICdtb3VzZScsXG5cdCAgICBNU1BvaW50ZXJEb3duOiAncG9pbnRlcicsXG5cdCAgICBNU1BvaW50ZXJNb3ZlOiAncG9pbnRlcicsXG5cdCAgICBwb2ludGVyZG93bjogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcm1vdmU6ICdwb2ludGVyJyxcblx0ICAgIHRvdWNoc3RhcnQ6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgaXMgYWN0aXZlXG5cdCAgdmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRoZSBwYWdlIGlzIGJlaW5nIHNjcm9sbGVkXG5cdCAgdmFyIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAvLyBzdG9yZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXG5cdCAgdmFyIG1vdXNlUG9zID0ge1xuXHQgICAgeDogbnVsbCxcblx0ICAgIHk6IG51bGxcblx0ICB9O1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgdmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG5cdCAgdHJ5IHtcblx0ICAgIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcblx0ICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdCAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcblx0ICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG5cdCAgfSBjYXRjaCAoZSkge31cblxuXHQgIC8qXG5cdCAgICogc2V0IHVwXG5cdCAgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbiBzZXRVcCgpIHtcblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICAgIHNldElucHV0KCk7XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogZXZlbnRzXG5cdCAgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCkge1xuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cdCAgICB2YXIgb3B0aW9ucyA9IHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2U7XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRvdWNoQnVmZmVyLCBvcHRpb25zKTtcblx0ICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCwgb3B0aW9ucyk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbiB1cGRhdGVJbnB1dChldmVudCkge1xuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudElucHV0ICE9PSB2YWx1ZSB8fCBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIHZhciBhY3RpdmVFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0ICAgICAgICB2YXIgYWN0aXZlSW5wdXQgPSBmYWxzZTtcblx0ICAgICAgICB2YXIgbm90Rm9ybUlucHV0ID0gYWN0aXZlRWxlbSAmJiBhY3RpdmVFbGVtLm5vZGVOYW1lICYmIGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMTtcblxuXHQgICAgICAgIGlmIChub3RGb3JtSW5wdXQgfHwgY2hhbmdlSW50ZW50TWFwLmluZGV4T2YoZXZlbnRLZXkpICE9PSAtMSkge1xuXHQgICAgICAgICAgYWN0aXZlSW5wdXQgPSB0cnVlO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmICh2YWx1ZSA9PT0gJ3RvdWNoJyB8fFxuXHQgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgdmFsdWUgPT09ICdtb3VzZScgfHxcblx0ICAgICAgICAvLyBkb24ndCBzd2l0Y2ggaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhIGZvcm0gaW5wdXRcblx0ICAgICAgICB2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBldmVudEtleSAmJiBhY3RpdmVJbnB1dCAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xKSB7XG5cdCAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgYW5kIGNhdGNoLWFsbCB2YXJpYWJsZVxuXHQgICAgICAgICAgY3VycmVudElucHV0ID0gY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgICBzZXRJbnB1dCgpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIHRoZSBkb2MgYW5kIGBpbnB1dFR5cGVzYCBhcnJheSB3aXRoIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uIHNldElucHV0KCkge1xuXHQgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudElucHV0KTtcblxuXHQgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkge1xuXHQgICAgICBpbnB1dFR5cGVzLnB1c2goY3VycmVudElucHV0KTtcblx0ICAgICAgZG9jLmNsYXNzTmFtZSArPSAnIHdoYXRpbnB1dC10eXBlcy0nICsgY3VycmVudElucHV0O1xuXHQgICAgfVxuXG5cdCAgICBmaXJlRnVuY3Rpb25zKCdpbnB1dCcpO1xuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIGlucHV0IGludGVudCBmb3IgYG1vdXNlbW92ZWAgYW5kIGBwb2ludGVybW92ZWBcblx0ICB2YXIgc2V0SW50ZW50ID0gZnVuY3Rpb24gc2V0SW50ZW50KGV2ZW50KSB7XG5cdCAgICAvLyB0ZXN0IHRvIHNlZSBpZiBgbW91c2Vtb3ZlYCBoYXBwZW5lZCByZWxhdGl2ZSB0byB0aGUgc2NyZWVuXG5cdCAgICAvLyB0byBkZXRlY3Qgc2Nyb2xsaW5nIHZlcnN1cyBtb3VzZW1vdmVcblx0ICAgIGlmIChtb3VzZVBvc1sneCddICE9PSBldmVudC5zY3JlZW5YIHx8IG1vdXNlUG9zWyd5J10gIT09IGV2ZW50LnNjcmVlblkpIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgICAgICBtb3VzZVBvc1sneCddID0gZXZlbnQuc2NyZWVuWDtcblx0ICAgICAgbW91c2VQb3NbJ3knXSA9IGV2ZW50LnNjcmVlblk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBpc1Njcm9sbGluZyA9IHRydWU7XG5cdCAgICB9XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIC8vIG9yIHNjcm9sbGluZyBpc24ndCBoYXBwZW5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcgJiYgIWlzU2Nyb2xsaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudEludGVudCk7XG5cblx0ICAgICAgICBmaXJlRnVuY3Rpb25zKCdpbnRlbnQnKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBidWZmZXJzIHRvdWNoIGV2ZW50cyBiZWNhdXNlIHRoZXkgZnJlcXVlbnRseSBhbHNvIGZpcmUgbW91c2UgZXZlbnRzXG5cdCAgdmFyIHRvdWNoQnVmZmVyID0gZnVuY3Rpb24gdG91Y2hCdWZmZXIoZXZlbnQpIHtcblx0ICAgIGlmIChldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcblx0ICAgICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgICAgdXBkYXRlSW5wdXQoZXZlbnQpO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICB2YXIgZmlyZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uIGZpcmVGdW5jdGlvbnModHlwZSkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLnR5cGUgPT09IHR5cGUpIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3RbaV0uZm4uY2FsbCh1bmRlZmluZWQsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogdXRpbGl0aWVzXG5cdCAgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbiBwb2ludGVyVHlwZShldmVudCkge1xuXHQgICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgICAgcmV0dXJuIGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJyA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy93aGVlbFxuXHQgIHZhciBkZXRlY3RXaGVlbCA9IGZ1bmN0aW9uIGRldGVjdFdoZWVsKCkge1xuXHQgICAgdmFyIHdoZWVsVHlwZSA9IHZvaWQgMDtcblxuXHQgICAgLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cdCAgICBpZiAoJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSB7XG5cdCAgICAgIHdoZWVsVHlwZSA9ICd3aGVlbCc7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgLy8gb3IgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgICAgIHdoZWVsVHlwZSA9IGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID8gJ21vdXNld2hlZWwnIDogJ0RPTU1vdXNlU2Nyb2xsJztcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIHdoZWVsVHlwZTtcblx0ICB9O1xuXG5cdCAgdmFyIG9ialBvcyA9IGZ1bmN0aW9uIG9ialBvcyhtYXRjaCkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLmZuID09PSBtYXRjaCkge1xuXHQgICAgICAgIHJldHVybiBpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogaW5pdFxuXHQgICAqL1xuXG5cdCAgLy8gZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAvLyAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgIGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXHQgIC8qXG5cdCAgICogYXBpXG5cdCAgICovXG5cblx0ICByZXR1cm4ge1xuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uIGFzayhvcHQpIHtcblx0ICAgICAgcmV0dXJuIG9wdCA9PT0gJ2xvb3NlJyA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7XG5cdCAgICB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24gdHlwZXMoKSB7XG5cdCAgICAgIHJldHVybiBpbnB1dFR5cGVzO1xuXHQgICAgfSxcblxuXHQgICAgLy8gb3ZlcndyaXRlcyBpZ25vcmVkIGtleXMgd2l0aCBwcm92aWRlZCBhcnJheVxuXHQgICAgaWdub3JlS2V5czogZnVuY3Rpb24gaWdub3JlS2V5cyhhcnIpIHtcblx0ICAgICAgaWdub3JlTWFwID0gYXJyO1xuXHQgICAgfSxcblxuXHQgICAgLy8gYXR0YWNoIGZ1bmN0aW9ucyB0byBpbnB1dCBhbmQgaW50ZW50IFwiZXZlbnRzXCJcblx0ICAgIC8vIGZ1bmN0OiBmdW5jdGlvbiB0byBmaXJlIG9uIGNoYW5nZVxuXHQgICAgLy8gZXZlbnRUeXBlOiAnaW5wdXQnfCdpbnRlbnQnXG5cdCAgICByZWdpc3Rlck9uQ2hhbmdlOiBmdW5jdGlvbiByZWdpc3Rlck9uQ2hhbmdlKGZuLCBldmVudFR5cGUpIHtcblx0ICAgICAgZnVuY3Rpb25MaXN0LnB1c2goe1xuXHQgICAgICAgIGZuOiBmbixcblx0ICAgICAgICB0eXBlOiBldmVudFR5cGUgfHwgJ2lucHV0J1xuXHQgICAgICB9KTtcblx0ICAgIH0sXG5cblx0ICAgIHVuUmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gdW5SZWdpc3Rlck9uQ2hhbmdlKGZuKSB7XG5cdCAgICAgIHZhciBwb3NpdGlvbiA9IG9ialBvcyhmbik7XG5cblx0ICAgICAgaWYgKHBvc2l0aW9uKSB7XG5cdCAgICAgICAgZnVuY3Rpb25MaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXHR9KCk7XG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIvKiEgbGF6eXNpemVzIC0gdjMuMC4wICovXG4hZnVuY3Rpb24oYSxiKXt2YXIgYz1iKGEsYS5kb2N1bWVudCk7YS5sYXp5U2l6ZXM9YyxcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWMpfSh3aW5kb3csZnVuY3Rpb24oYSxiKXtcInVzZSBzdHJpY3RcIjtpZihiLmdldEVsZW1lbnRzQnlDbGFzc05hbWUpe3ZhciBjLGQ9Yi5kb2N1bWVudEVsZW1lbnQsZT1hLkRhdGUsZj1hLkhUTUxQaWN0dXJlRWxlbWVudCxnPVwiYWRkRXZlbnRMaXN0ZW5lclwiLGg9XCJnZXRBdHRyaWJ1dGVcIixpPWFbZ10saj1hLnNldFRpbWVvdXQsaz1hLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8aixsPWEucmVxdWVzdElkbGVDYWxsYmFjayxtPS9ecGljdHVyZSQvaSxuPVtcImxvYWRcIixcImVycm9yXCIsXCJsYXp5aW5jbHVkZWRcIixcIl9sYXp5bG9hZGVkXCJdLG89e30scD1BcnJheS5wcm90b3R5cGUuZm9yRWFjaCxxPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG9bYl18fChvW2JdPW5ldyBSZWdFeHAoXCIoXFxcXHN8XilcIitiK1wiKFxcXFxzfCQpXCIpKSxvW2JdLnRlc3QoYVtoXShcImNsYXNzXCIpfHxcIlwiKSYmb1tiXX0scj1mdW5jdGlvbihhLGIpe3EoYSxiKXx8YS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLChhW2hdKFwiY2xhc3NcIil8fFwiXCIpLnRyaW0oKStcIiBcIitiKX0scz1mdW5jdGlvbihhLGIpe3ZhciBjOyhjPXEoYSxiKSkmJmEuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwoYVtoXShcImNsYXNzXCIpfHxcIlwiKS5yZXBsYWNlKGMsXCIgXCIpKX0sdD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9Yz9nOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiO2MmJnQoYSxiKSxuLmZvckVhY2goZnVuY3Rpb24oYyl7YVtkXShjLGIpfSl9LHU9ZnVuY3Rpb24oYSxjLGQsZSxmKXt2YXIgZz1iLmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7cmV0dXJuIGcuaW5pdEN1c3RvbUV2ZW50KGMsIWUsIWYsZHx8e30pLGEuZGlzcGF0Y2hFdmVudChnKSxnfSx2PWZ1bmN0aW9uKGIsZCl7dmFyIGU7IWYmJihlPWEucGljdHVyZWZpbGx8fGMucGYpP2Uoe3JlZXZhbHVhdGU6ITAsZWxlbWVudHM6W2JdfSk6ZCYmZC5zcmMmJihiLnNyYz1kLnNyYyl9LHc9ZnVuY3Rpb24oYSxiKXtyZXR1cm4oZ2V0Q29tcHV0ZWRTdHlsZShhLG51bGwpfHx7fSlbYl19LHg9ZnVuY3Rpb24oYSxiLGQpe2ZvcihkPWR8fGEub2Zmc2V0V2lkdGg7ZDxjLm1pblNpemUmJmImJiFhLl9sYXp5c2l6ZXNXaWR0aDspZD1iLm9mZnNldFdpZHRoLGI9Yi5wYXJlbnROb2RlO3JldHVybiBkfSx5PWZ1bmN0aW9uKCl7dmFyIGEsYyxkPVtdLGU9W10sZj1kLGc9ZnVuY3Rpb24oKXt2YXIgYj1mO2ZvcihmPWQubGVuZ3RoP2U6ZCxhPSEwLGM9ITE7Yi5sZW5ndGg7KWIuc2hpZnQoKSgpO2E9ITF9LGg9ZnVuY3Rpb24oZCxlKXthJiYhZT9kLmFwcGx5KHRoaXMsYXJndW1lbnRzKTooZi5wdXNoKGQpLGN8fChjPSEwLChiLmhpZGRlbj9qOmspKGcpKSl9O3JldHVybiBoLl9sc0ZsdXNoPWcsaH0oKSx6PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/ZnVuY3Rpb24oKXt5KGEpfTpmdW5jdGlvbigpe3ZhciBiPXRoaXMsYz1hcmd1bWVudHM7eShmdW5jdGlvbigpe2EuYXBwbHkoYixjKX0pfX0sQT1mdW5jdGlvbihhKXt2YXIgYixjPTAsZD0xMjUsZj02NjYsZz1mLGg9ZnVuY3Rpb24oKXtiPSExLGM9ZS5ub3coKSxhKCl9LGk9bD9mdW5jdGlvbigpe2woaCx7dGltZW91dDpnfSksZyE9PWYmJihnPWYpfTp6KGZ1bmN0aW9uKCl7aihoKX0sITApO3JldHVybiBmdW5jdGlvbihhKXt2YXIgZjsoYT1hPT09ITApJiYoZz00NCksYnx8KGI9ITAsZj1kLShlLm5vdygpLWMpLDA+ZiYmKGY9MCksYXx8OT5mJiZsP2koKTpqKGksZikpfX0sQj1mdW5jdGlvbihhKXt2YXIgYixjLGQ9OTksZj1mdW5jdGlvbigpe2I9bnVsbCxhKCl9LGc9ZnVuY3Rpb24oKXt2YXIgYT1lLm5vdygpLWM7ZD5hP2ooZyxkLWEpOihsfHxmKShmKX07cmV0dXJuIGZ1bmN0aW9uKCl7Yz1lLm5vdygpLGJ8fChiPWooZyxkKSl9fSxDPWZ1bmN0aW9uKCl7dmFyIGYsayxsLG4sbyx4LEMsRSxGLEcsSCxJLEosSyxMLE09L15pbWckL2ksTj0vXmlmcmFtZSQvaSxPPVwib25zY3JvbGxcImluIGEmJiEvZ2xlYm90Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLFA9MCxRPTAsUj0wLFM9LTEsVD1mdW5jdGlvbihhKXtSLS0sYSYmYS50YXJnZXQmJnQoYS50YXJnZXQsVCksKCFhfHwwPlJ8fCFhLnRhcmdldCkmJihSPTApfSxVPWZ1bmN0aW9uKGEsYyl7dmFyIGUsZj1hLGc9XCJoaWRkZW5cIj09dyhiLmJvZHksXCJ2aXNpYmlsaXR5XCIpfHxcImhpZGRlblwiIT13KGEsXCJ2aXNpYmlsaXR5XCIpO2ZvcihGLT1jLEkrPWMsRy09YyxIKz1jO2cmJihmPWYub2Zmc2V0UGFyZW50KSYmZiE9Yi5ib2R5JiZmIT1kOylnPSh3KGYsXCJvcGFjaXR5XCIpfHwxKT4wLGcmJlwidmlzaWJsZVwiIT13KGYsXCJvdmVyZmxvd1wiKSYmKGU9Zi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxnPUg+ZS5sZWZ0JiZHPGUucmlnaHQmJkk+ZS50b3AtMSYmRjxlLmJvdHRvbSsxKTtyZXR1cm4gZ30sVj1mdW5jdGlvbigpe3ZhciBhLGUsZyxpLGosbSxuLHAscTtpZigobz1jLmxvYWRNb2RlKSYmOD5SJiYoYT1mLmxlbmd0aCkpe2U9MCxTKyssbnVsbD09SyYmKFwiZXhwYW5kXCJpbiBjfHwoYy5leHBhbmQ9ZC5jbGllbnRIZWlnaHQ+NTAwJiZkLmNsaWVudFdpZHRoPjUwMD81MDA6MzcwKSxKPWMuZXhwYW5kLEs9SipjLmV4cEZhY3RvciksSz5RJiYxPlImJlM+MiYmbz4yJiYhYi5oaWRkZW4/KFE9SyxTPTApOlE9bz4xJiZTPjEmJjY+Uj9KOlA7Zm9yKDthPmU7ZSsrKWlmKGZbZV0mJiFmW2VdLl9sYXp5UmFjZSlpZihPKWlmKChwPWZbZV1baF0oXCJkYXRhLWV4cGFuZFwiKSkmJihtPTEqcCl8fChtPVEpLHEhPT1tJiYoQz1pbm5lcldpZHRoK20qTCxFPWlubmVySGVpZ2h0K20sbj0tMSptLHE9bSksZz1mW2VdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLChJPWcuYm90dG9tKT49biYmKEY9Zy50b3ApPD1FJiYoSD1nLnJpZ2h0KT49bipMJiYoRz1nLmxlZnQpPD1DJiYoSXx8SHx8R3x8RikmJihsJiYzPlImJiFwJiYoMz5vfHw0PlMpfHxVKGZbZV0sbSkpKXtpZihiYShmW2VdKSxqPSEwLFI+OSlicmVha31lbHNlIWomJmwmJiFpJiY0PlImJjQ+UyYmbz4yJiYoa1swXXx8Yy5wcmVsb2FkQWZ0ZXJMb2FkKSYmKGtbMF18fCFwJiYoSXx8SHx8R3x8Rnx8XCJhdXRvXCIhPWZbZV1baF0oYy5zaXplc0F0dHIpKSkmJihpPWtbMF18fGZbZV0pO2Vsc2UgYmEoZltlXSk7aSYmIWomJmJhKGkpfX0sVz1BKFYpLFg9ZnVuY3Rpb24oYSl7cihhLnRhcmdldCxjLmxvYWRlZENsYXNzKSxzKGEudGFyZ2V0LGMubG9hZGluZ0NsYXNzKSx0KGEudGFyZ2V0LFopfSxZPXooWCksWj1mdW5jdGlvbihhKXtZKHt0YXJnZXQ6YS50YXJnZXR9KX0sJD1mdW5jdGlvbihhLGIpe3RyeXthLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShiKX1jYXRjaChjKXthLnNyYz1ifX0sXz1mdW5jdGlvbihhKXt2YXIgYixkLGU9YVtoXShjLnNyY3NldEF0dHIpOyhiPWMuY3VzdG9tTWVkaWFbYVtoXShcImRhdGEtbWVkaWFcIil8fGFbaF0oXCJtZWRpYVwiKV0pJiZhLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsYiksZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixlKSxiJiYoZD1hLnBhcmVudE5vZGUsZC5pbnNlcnRCZWZvcmUoYS5jbG9uZU5vZGUoKSxhKSxkLnJlbW92ZUNoaWxkKGEpKX0sYWE9eihmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnLGksayxsLG8scTsobz11KGEsXCJsYXp5YmVmb3JldW52ZWlsXCIsYikpLmRlZmF1bHRQcmV2ZW50ZWR8fChlJiYoZD9yKGEsYy5hdXRvc2l6ZXNDbGFzcyk6YS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGUpKSxpPWFbaF0oYy5zcmNzZXRBdHRyKSxnPWFbaF0oYy5zcmNBdHRyKSxmJiYoaz1hLnBhcmVudE5vZGUsbD1rJiZtLnRlc3Qoay5ub2RlTmFtZXx8XCJcIikpLHE9Yi5maXJlc0xvYWR8fFwic3JjXCJpbiBhJiYoaXx8Z3x8bCksbz17dGFyZ2V0OmF9LHEmJih0KGEsVCwhMCksY2xlYXJUaW1lb3V0KG4pLG49aihULDI1MDApLHIoYSxjLmxvYWRpbmdDbGFzcyksdChhLFosITApKSxsJiZwLmNhbGwoay5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNvdXJjZVwiKSxfKSxpP2Euc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsaSk6ZyYmIWwmJihOLnRlc3QoYS5ub2RlTmFtZSk/JChhLGcpOmEuc3JjPWcpLChpfHxsKSYmdihhLHtzcmM6Z30pKSxhLl9sYXp5UmFjZSYmZGVsZXRlIGEuX2xhenlSYWNlLHMoYSxjLmxhenlDbGFzcykseShmdW5jdGlvbigpeyghcXx8YS5jb21wbGV0ZSYmYS5uYXR1cmFsV2lkdGg+MSkmJihxP1Qobyk6Ui0tLFgobykpfSwhMCl9KSxiYT1mdW5jdGlvbihhKXt2YXIgYixkPU0udGVzdChhLm5vZGVOYW1lKSxlPWQmJihhW2hdKGMuc2l6ZXNBdHRyKXx8YVtoXShcInNpemVzXCIpKSxmPVwiYXV0b1wiPT1lOyghZiYmbHx8IWR8fCFhLnNyYyYmIWEuc3Jjc2V0fHxhLmNvbXBsZXRlfHxxKGEsYy5lcnJvckNsYXNzKSkmJihiPXUoYSxcImxhenl1bnZlaWxyZWFkXCIpLmRldGFpbCxmJiZELnVwZGF0ZUVsZW0oYSwhMCxhLm9mZnNldFdpZHRoKSxhLl9sYXp5UmFjZT0hMCxSKyssYWEoYSxiLGYsZSxkKSl9LGNhPWZ1bmN0aW9uKCl7aWYoIWwpe2lmKGUubm93KCkteDw5OTkpcmV0dXJuIHZvaWQgaihjYSw5OTkpO3ZhciBhPUIoZnVuY3Rpb24oKXtjLmxvYWRNb2RlPTMsVygpfSk7bD0hMCxjLmxvYWRNb2RlPTMsVygpLGkoXCJzY3JvbGxcIixmdW5jdGlvbigpezM9PWMubG9hZE1vZGUmJihjLmxvYWRNb2RlPTIpLGEoKX0sITApfX07cmV0dXJue186ZnVuY3Rpb24oKXt4PWUubm93KCksZj1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5sYXp5Q2xhc3MpLGs9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMubGF6eUNsYXNzK1wiIFwiK2MucHJlbG9hZENsYXNzKSxMPWMuaEZhYyxpKFwic2Nyb2xsXCIsVywhMCksaShcInJlc2l6ZVwiLFcsITApLGEuTXV0YXRpb25PYnNlcnZlcj9uZXcgTXV0YXRpb25PYnNlcnZlcihXKS5vYnNlcnZlKGQse2NoaWxkTGlzdDohMCxzdWJ0cmVlOiEwLGF0dHJpYnV0ZXM6ITB9KTooZFtnXShcIkRPTU5vZGVJbnNlcnRlZFwiLFcsITApLGRbZ10oXCJET01BdHRyTW9kaWZpZWRcIixXLCEwKSxzZXRJbnRlcnZhbChXLDk5OSkpLGkoXCJoYXNoY2hhbmdlXCIsVywhMCksW1wiZm9jdXNcIixcIm1vdXNlb3ZlclwiLFwiY2xpY2tcIixcImxvYWRcIixcInRyYW5zaXRpb25lbmRcIixcImFuaW1hdGlvbmVuZFwiLFwid2Via2l0QW5pbWF0aW9uRW5kXCJdLmZvckVhY2goZnVuY3Rpb24oYSl7YltnXShhLFcsITApfSksL2QkfF5jLy50ZXN0KGIucmVhZHlTdGF0ZSk/Y2EoKTooaShcImxvYWRcIixjYSksYltnXShcIkRPTUNvbnRlbnRMb2FkZWRcIixXKSxqKGNhLDJlNCkpLGYubGVuZ3RoPyhWKCkseS5fbHNGbHVzaCgpKTpXKCl9LGNoZWNrRWxlbXM6Vyx1bnZlaWw6YmF9fSgpLEQ9ZnVuY3Rpb24oKXt2YXIgYSxkPXooZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGUsZixnO2lmKGEuX2xhenlzaXplc1dpZHRoPWQsZCs9XCJweFwiLGEuc2V0QXR0cmlidXRlKFwic2l6ZXNcIixkKSxtLnRlc3QoYi5ub2RlTmFtZXx8XCJcIikpZm9yKGU9Yi5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNvdXJjZVwiKSxmPTAsZz1lLmxlbmd0aDtnPmY7ZisrKWVbZl0uc2V0QXR0cmlidXRlKFwic2l6ZXNcIixkKTtjLmRldGFpbC5kYXRhQXR0cnx8dihhLGMuZGV0YWlsKX0pLGU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBlLGY9YS5wYXJlbnROb2RlO2YmJihjPXgoYSxmLGMpLGU9dShhLFwibGF6eWJlZm9yZXNpemVzXCIse3dpZHRoOmMsZGF0YUF0dHI6ISFifSksZS5kZWZhdWx0UHJldmVudGVkfHwoYz1lLmRldGFpbC53aWR0aCxjJiZjIT09YS5fbGF6eXNpemVzV2lkdGgmJmQoYSxmLGUsYykpKX0sZj1mdW5jdGlvbigpe3ZhciBiLGM9YS5sZW5ndGg7aWYoYylmb3IoYj0wO2M+YjtiKyspZShhW2JdKX0sZz1CKGYpO3JldHVybntfOmZ1bmN0aW9uKCl7YT1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5hdXRvc2l6ZXNDbGFzcyksaShcInJlc2l6ZVwiLGcpfSxjaGVja0VsZW1zOmcsdXBkYXRlRWxlbTplfX0oKSxFPWZ1bmN0aW9uKCl7RS5pfHwoRS5pPSEwLEQuXygpLEMuXygpKX07cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGIsZD17bGF6eUNsYXNzOlwibGF6eWxvYWRcIixsb2FkZWRDbGFzczpcImxhenlsb2FkZWRcIixsb2FkaW5nQ2xhc3M6XCJsYXp5bG9hZGluZ1wiLHByZWxvYWRDbGFzczpcImxhenlwcmVsb2FkXCIsZXJyb3JDbGFzczpcImxhenllcnJvclwiLGF1dG9zaXplc0NsYXNzOlwibGF6eWF1dG9zaXplc1wiLHNyY0F0dHI6XCJkYXRhLXNyY1wiLHNyY3NldEF0dHI6XCJkYXRhLXNyY3NldFwiLHNpemVzQXR0cjpcImRhdGEtc2l6ZXNcIixtaW5TaXplOjQwLGN1c3RvbU1lZGlhOnt9LGluaXQ6ITAsZXhwRmFjdG9yOjEuNSxoRmFjOi44LGxvYWRNb2RlOjJ9O2M9YS5sYXp5U2l6ZXNDb25maWd8fGEubGF6eXNpemVzQ29uZmlnfHx7fTtmb3IoYiBpbiBkKWIgaW4gY3x8KGNbYl09ZFtiXSk7YS5sYXp5U2l6ZXNDb25maWc9YyxqKGZ1bmN0aW9uKCl7Yy5pbml0JiZFKCl9KX0oKSx7Y2ZnOmMsYXV0b1NpemVyOkQsbG9hZGVyOkMsaW5pdDpFLHVQOnYsYUM6cixyQzpzLGhDOnEsZmlyZTp1LGdXOngsckFGOnl9fX0pOyIsIi8qXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xuIF9fX3wgKF8pIF9fX3wgfCBfXyAgKF8pX19fXG4vIF9ffCB8IHwvIF9ffCB8LyAvICB8IC8gX198XG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxufF9fXy9ffF98XFxfX198X3xcXF8oXykvIHxfX18vXG4gICAgICAgICAgICAgICAgICAgfF9fL1xuXG4gVmVyc2lvbjogMS44LjFcbiAgQXV0aG9yOiBLZW4gV2hlZWxlclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xuICAgIERvY3M6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pby9zbGlja1xuICAgIFJlcG86IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2tcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cbjsoZnVuY3Rpb24oZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG5cbn0oZnVuY3Rpb24oJCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgU2xpY2sgPSB3aW5kb3cuU2xpY2sgfHwge307XG5cbiAgICBTbGljayA9IChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5zdGFuY2VVaWQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIFNsaWNrKGVsZW1lbnQsIHNldHRpbmdzKSB7XG5cbiAgICAgICAgICAgIHZhciBfID0gdGhpcywgZGF0YVNldHRpbmdzO1xuXG4gICAgICAgICAgICBfLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZEFycm93czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcHBlbmREb3RzOiAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmV2QXJyb3c6ICc8YnV0dG9uIGNsYXNzPVwic2xpY2stcHJldlwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiIHR5cGU9XCJidXR0b25cIj5QcmV2aW91czwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLW5leHRcIiBhcmlhLWxhYmVsPVwiTmV4dFwiIHR5cGU9XCJidXR0b25cIj5OZXh0PC9idXR0b24+JyxcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogMzAwMCxcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNTBweCcsXG4gICAgICAgICAgICAgICAgY3NzRWFzZTogJ2Vhc2UnLFxuICAgICAgICAgICAgICAgIGN1c3RvbVBhZ2luZzogZnVuY3Rpb24oc2xpZGVyLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiAvPicpLnRleHQoaSArIDEpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cycsXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVhc2luZzogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgZWRnZUZyaWN0aW9uOiAwLjM1LFxuICAgICAgICAgICAgICAgIGZhZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZvY3VzT25DaGFuZ2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGluaXRpYWxTbGlkZTogMCxcbiAgICAgICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcbiAgICAgICAgICAgICAgICBtb2JpbGVGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Gb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRG90c0hvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXNwb25kVG86ICd3aW5kb3cnLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgcm93czogMSxcbiAgICAgICAgICAgICAgICBydGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlOiAnJyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJSb3c6IDEsXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgIHNwZWVkOiA1MDAsXG4gICAgICAgICAgICAgICAgc3dpcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3VjaE1vdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDUsXG4gICAgICAgICAgICAgICAgdXNlQ1NTOiB0cnVlLFxuICAgICAgICAgICAgICAgIHVzZVRyYW5zZm9ybTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVdpZHRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWxTd2lwaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3YWl0Rm9yQW5pbWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDEwMDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF8uaW5pdGlhbHMgPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkcmFnZ2luZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXV0b1BsYXlUaW1lcjogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50RGlyZWN0aW9uOiAwLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTbGlkZTogMCxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDEsXG4gICAgICAgICAgICAgICAgJGRvdHM6IG51bGwsXG4gICAgICAgICAgICAgICAgbGlzdFdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RIZWlnaHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9hZEluZGV4OiAwLFxuICAgICAgICAgICAgICAgICRuZXh0QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgJHByZXZBcnJvdzogbnVsbCxcbiAgICAgICAgICAgICAgICBzY3JvbGxpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlQ291bnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICAkc2xpZGVUcmFjazogbnVsbCxcbiAgICAgICAgICAgICAgICAkc2xpZGVzOiBudWxsLFxuICAgICAgICAgICAgICAgIHNsaWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgIHN3aXBlTGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBzd2lwaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAkbGlzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0b3VjaE9iamVjdDoge30sXG4gICAgICAgICAgICAgICAgdHJhbnNmb3Jtc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHVuc2xpY2tlZDogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKF8sIF8uaW5pdGlhbHMpO1xuXG4gICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMgPSBbXTtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzID0gW107XG4gICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBfLmZvY3Vzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBfLmhpZGRlbiA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgXy5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgXy5wb3NpdGlvblByb3AgPSBudWxsO1xuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBudWxsO1xuICAgICAgICAgICAgXy5yb3dDb3VudCA9IDE7XG4gICAgICAgICAgICBfLnNob3VsZENsaWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIF8uJHNsaWRlciA9ICQoZWxlbWVudCk7XG4gICAgICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IG51bGw7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAndmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICBfLndpbmRvd1dpZHRoID0gMDtcbiAgICAgICAgICAgIF8ud2luZG93VGltZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBkYXRhU2V0dGluZ3MgPSAkKGVsZW1lbnQpLmRhdGEoJ3NsaWNrJykgfHwge307XG5cbiAgICAgICAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLmRlZmF1bHRzLCBzZXR0aW5ncywgZGF0YVNldHRpbmdzKTtcblxuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuXG4gICAgICAgICAgICBfLm9yaWdpbmFsU2V0dGluZ3MgPSBfLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ21vekhpZGRlbic7XG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ21venZpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ3dlYmtpdEhpZGRlbic7XG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3dlYmtpdHZpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmF1dG9QbGF5ID0gJC5wcm94eShfLmF1dG9QbGF5LCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhciA9ICQucHJveHkoXy5hdXRvUGxheUNsZWFyLCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlJdGVyYXRvciA9ICQucHJveHkoXy5hdXRvUGxheUl0ZXJhdG9yLCBfKTtcbiAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUgPSAkLnByb3h5KF8uY2hhbmdlU2xpZGUsIF8pO1xuICAgICAgICAgICAgXy5jbGlja0hhbmRsZXIgPSAkLnByb3h5KF8uY2xpY2tIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uc2VsZWN0SGFuZGxlciA9ICQucHJveHkoXy5zZWxlY3RIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uc2V0UG9zaXRpb24gPSAkLnByb3h5KF8uc2V0UG9zaXRpb24sIF8pO1xuICAgICAgICAgICAgXy5zd2lwZUhhbmRsZXIgPSAkLnByb3h5KF8uc3dpcGVIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uZHJhZ0hhbmRsZXIgPSAkLnByb3h5KF8uZHJhZ0hhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5rZXlIYW5kbGVyID0gJC5wcm94eShfLmtleUhhbmRsZXIsIF8pO1xuXG4gICAgICAgICAgICBfLmluc3RhbmNlVWlkID0gaW5zdGFuY2VVaWQrKztcblxuICAgICAgICAgICAgLy8gQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3NcbiAgICAgICAgICAgIC8vIFN0cmljdCBIVE1MIHJlY29nbml0aW9uIChtdXN0IHN0YXJ0IHdpdGggPClcbiAgICAgICAgICAgIC8vIEV4dHJhY3RlZCBmcm9tIGpRdWVyeSB2MS4xMSBzb3VyY2VcbiAgICAgICAgICAgIF8uaHRtbEV4cHIgPSAvXig/OlxccyooPFtcXHdcXFddKz4pW14+XSopJC87XG5cblxuICAgICAgICAgICAgXy5yZWdpc3RlckJyZWFrcG9pbnRzKCk7XG4gICAgICAgICAgICBfLmluaXQodHJ1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTbGljaztcblxuICAgIH0oKSk7XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWN0aXZhdGVBREEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWFjdGl2ZScpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ1xuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICcwJ1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWRkU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tBZGQgPSBmdW5jdGlvbihtYXJrdXAsIGluZGV4LCBhZGRCZWZvcmUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgYWRkQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwIHx8IChpbmRleCA+PSBfLnNsaWRlQ291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwICYmIF8uJHNsaWRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFkZEJlZm9yZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRCZWZvcmUoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRBZnRlcihfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZGRCZWZvcmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZUhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHRcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVTbGlkZSA9IGZ1bmN0aW9uKHRhcmdldExlZnQsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIGFuaW1Qcm9wcyA9IHt9LFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudExlZnQgPSAtKF8uY3VycmVudExlZnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiBfLmN1cnJlbnRMZWZ0XG4gICAgICAgICAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiBfLm9wdGlvbnMuZWFzaW5nLFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbihub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IE1hdGguY2VpbChub3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoMHB4LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoMHB4LCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE5hdlRhcmdldCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gXy5vcHRpb25zLmFzTmF2Rm9yO1xuXG4gICAgICAgIGlmICggYXNOYXZGb3IgJiYgYXNOYXZGb3IgIT09IG51bGwgKSB7XG4gICAgICAgICAgICBhc05hdkZvciA9ICQoYXNOYXZGb3IpLm5vdChfLiRzbGlkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFzTmF2Rm9yO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hc05hdkZvciA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLmdldE5hdlRhcmdldCgpO1xuXG4gICAgICAgIGlmICggYXNOYXZGb3IgIT09IG51bGwgJiYgdHlwZW9mIGFzTmF2Rm9yID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICAgIGFzTmF2Rm9yLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuc2xpY2soJ2dldFNsaWNrJyk7XG4gICAgICAgICAgICAgICAgaWYoIXRhcmdldC51bnNsaWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNsaWRlSGFuZGxlcihpbmRleCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXBwbHlUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9IF8udHJhbnNmb3JtVHlwZSArICcgJyArIF8ub3B0aW9ucy5zcGVlZCArICdtcyAnICsgXy5vcHRpb25zLmNzc0Vhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gJ29wYWNpdHkgJyArIF8ub3B0aW9ucy5zcGVlZCArICdtcyAnICsgXy5vcHRpb25zLmNzc0Vhc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZSkuY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgICAgIGlmICggXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlUaW1lciA9IHNldEludGVydmFsKCBfLmF1dG9QbGF5SXRlcmF0b3IsIF8ub3B0aW9ucy5hdXRvcGxheVNwZWVkICk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlDbGVhciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5hdXRvUGxheVRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlJdGVyYXRvciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlVG8gPSBfLmN1cnJlbnRTbGlkZSArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICBpZiAoICFfLnBhdXNlZCAmJiAhXy5pbnRlcnJ1cHRlZCAmJiAhXy5mb2N1c3NlZCApIHtcblxuICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBfLmRpcmVjdGlvbiA9PT0gMSAmJiAoIF8uY3VycmVudFNsaWRlICsgMSApID09PSAoIF8uc2xpZGVDb3VudCAtIDEgKSkge1xuICAgICAgICAgICAgICAgICAgICBfLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIF8uZGlyZWN0aW9uID09PSAwICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlVG8gPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIF8uY3VycmVudFNsaWRlIC0gMSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBzbGlkZVRvICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZEFycm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93ID0gJChfLm9wdGlvbnMucHJldkFycm93KS5hZGRDbGFzcygnc2xpY2stYXJyb3cnKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XG5cbiAgICAgICAgICAgIGlmKCBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCcpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2staGlkZGVuJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXgnKTtcblxuICAgICAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnByZXBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5uZXh0QXJyb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LmFkZCggXy4kbmV4dEFycm93IClcblxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcmlhLWRpc2FibGVkJzogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGREb3RzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgZG90O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stZG90dGVkJyk7XG5cbiAgICAgICAgICAgIGRvdCA9ICQoJzx1bCAvPicpLmFkZENsYXNzKF8ub3B0aW9ucy5kb3RzQ2xhc3MpO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IF8uZ2V0RG90Q291bnQoKTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZG90LmFwcGVuZCgkKCc8bGkgLz4nKS5hcHBlbmQoXy5vcHRpb25zLmN1c3RvbVBhZ2luZy5jYWxsKHRoaXMsIF8sIGkpKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJGRvdHMgPSBkb3QuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZERvdHMpO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZE91dCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXMgPVxuICAgICAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKCBfLm9wdGlvbnMuc2xpZGUgKyAnOm5vdCguc2xpY2stY2xvbmVkKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudClcbiAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KVxuICAgICAgICAgICAgICAgIC5kYXRhKCdvcmlnaW5hbFN0eWxpbmcnLCAkKGVsZW1lbnQpLmF0dHIoJ3N0eWxlJykgfHwgJycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2sgPSAoXy5zbGlkZUNvdW50ID09PSAwKSA/XG4gICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykuYXBwZW5kVG8oXy4kc2xpZGVyKSA6XG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xuXG4gICAgICAgIF8uJGxpc3QgPSBfLiRzbGlkZVRyYWNrLndyYXAoXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInNsaWNrLWxpc3RcIi8+JykucGFyZW50KCk7XG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKCdvcGFjaXR5JywgMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubm90KCdbc3JjXScpLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuXG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG5cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5hZGRDbGFzcygnZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBhLCBiLCBjLCBuZXdTbGlkZXMsIG51bU9mU2xpZGVzLCBvcmlnaW5hbFNsaWRlcyxzbGlkZXNQZXJTZWN0aW9uO1xuXG4gICAgICAgIG5ld1NsaWRlcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXIuY2hpbGRyZW4oKTtcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDApIHtcblxuICAgICAgICAgICAgc2xpZGVzUGVyU2VjdGlvbiA9IF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cgKiBfLm9wdGlvbnMucm93cztcbiAgICAgICAgICAgIG51bU9mU2xpZGVzID0gTWF0aC5jZWlsKFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzLmxlbmd0aCAvIHNsaWRlc1BlclNlY3Rpb25cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGZvcihhID0gMDsgYSA8IG51bU9mU2xpZGVzOyBhKyspe1xuICAgICAgICAgICAgICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGZvcihiID0gMDsgYiA8IF8ub3B0aW9ucy5yb3dzOyBiKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBmb3IoYyA9IDA7IGMgPCBfLm9wdGlvbnMuc2xpZGVzUGVyUm93OyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAoYSAqIHNsaWRlc1BlclNlY3Rpb24gKyAoKGIgKiBfLm9wdGlvbnMuc2xpZGVzUGVyUm93KSArIGMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFNsaWRlcy5nZXQodGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChvcmlnaW5hbFNsaWRlcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2xpZGUuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U2xpZGVzLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kc2xpZGVyLmVtcHR5KCkuYXBwZW5kKG5ld1NsaWRlcyk7XG4gICAgICAgICAgICBfLiRzbGlkZXIuY2hpbGRyZW4oKS5jaGlsZHJlbigpLmNoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgJ3dpZHRoJzooMTAwIC8gXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyAnJScsXG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaydcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrUmVzcG9uc2l2ZSA9IGZ1bmN0aW9uKGluaXRpYWwsIGZvcmNlVXBkYXRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYnJlYWtwb2ludCwgdGFyZ2V0QnJlYWtwb2ludCwgcmVzcG9uZFRvV2lkdGgsIHRyaWdnZXJCcmVha3BvaW50ID0gZmFsc2U7XG4gICAgICAgIHZhciBzbGlkZXJXaWR0aCA9IF8uJHNsaWRlci53aWR0aCgpO1xuICAgICAgICB2YXIgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICBpZiAoXy5yZXNwb25kVG8gPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ucmVzcG9uZFRvID09PSAnc2xpZGVyJykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBzbGlkZXJXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gTWF0aC5taW4od2luZG93V2lkdGgsIHNsaWRlcldpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLnJlc3BvbnNpdmUgJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLmxlbmd0aCAmJlxuICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IG51bGw7XG5cbiAgICAgICAgICAgIGZvciAoYnJlYWtwb2ludCBpbiBfLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludHMuaGFzT3duUHJvcGVydHkoYnJlYWtwb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3JpZ2luYWxTZXR0aW5ncy5tb2JpbGVGaXJzdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA8IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gXy5icmVha3BvaW50c1ticmVha3BvaW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA+IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gXy5icmVha3BvaW50c1ticmVha3BvaW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5hY3RpdmVCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBfLmFjdGl2ZUJyZWFrcG9pbnQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRTZXR0aW5nc1t0YXJnZXRCcmVha3BvaW50XSA9PT0gJ3Vuc2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRTZXR0aW5nc1t0YXJnZXRCcmVha3BvaW50XSA9PT0gJ3Vuc2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnVuc2xpY2sodGFyZ2V0QnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5hY3RpdmVCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucyA9IF8ub3JpZ2luYWxTZXR0aW5ncztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBicmVha3BvaW50cyBkdXJpbmcgYW4gYWN0dWFsIGJyZWFrLiBub3Qgb24gaW5pdGlhbGl6ZS5cbiAgICAgICAgICAgIGlmKCAhaW5pdGlhbCAmJiB0cmlnZ2VyQnJlYWtwb2ludCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2JyZWFrcG9pbnQnLCBbXywgdHJpZ2dlckJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGFuZ2VTbGlkZSA9IGZ1bmN0aW9uKGV2ZW50LCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgICR0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLFxuICAgICAgICAgICAgaW5kZXhPZmZzZXQsIHNsaWRlT2Zmc2V0LCB1bmV2ZW5PZmZzZXQ7XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIGEgbGluaywgcHJldmVudCBkZWZhdWx0IGFjdGlvbi5cbiAgICAgICAgaWYoJHRhcmdldC5pcygnYScpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIG5vdCB0aGUgPGxpPiBlbGVtZW50IChpZTogYSBjaGlsZCksIGZpbmQgdGhlIDxsaT4uXG4gICAgICAgIGlmKCEkdGFyZ2V0LmlzKCdsaScpKSB7XG4gICAgICAgICAgICAkdGFyZ2V0ID0gJHRhcmdldC5jbG9zZXN0KCdsaScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdW5ldmVuT2Zmc2V0ID0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCk7XG4gICAgICAgIGluZGV4T2Zmc2V0ID0gdW5ldmVuT2Zmc2V0ID8gMCA6IChfLnNsaWRlQ291bnQgLSBfLmN1cnJlbnRTbGlkZSkgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLm1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgY2FzZSAncHJldmlvdXMnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBpbmRleE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmRhdGEuaW5kZXggPT09IDAgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGF0YS5pbmRleCB8fCAkdGFyZ2V0LmluZGV4KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmNoZWNrTmF2aWdhYmxlKGluZGV4KSwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmNoaWxkcmVuKCkudHJpZ2dlcignZm9jdXMnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hlY2tOYXZpZ2FibGUgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIG5hdmlnYWJsZXMsIHByZXZOYXZpZ2FibGU7XG5cbiAgICAgICAgbmF2aWdhYmxlcyA9IF8uZ2V0TmF2aWdhYmxlSW5kZXhlcygpO1xuICAgICAgICBwcmV2TmF2aWdhYmxlID0gMDtcbiAgICAgICAgaWYgKGluZGV4ID4gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICBpbmRleCA9IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gbmF2aWdhYmxlcykge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IG5hdmlnYWJsZXNbbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBwcmV2TmF2aWdhYmxlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldk5hdmlnYWJsZSA9IG5hdmlnYWJsZXNbbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyAmJiBfLiRkb3RzICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cylcbiAgICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpXG4gICAgICAgICAgICAgICAgLm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRkb3RzLm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cgJiYgXy4kbmV4dEFycm93Lm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5vZmYoJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9mZignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKF8udmlzaWJpbGl0eUNoYW5nZSwgXy52aXNpYmlsaXR5KTtcblxuICAgICAgICBfLmNsZWFuVXBTbGlkZUV2ZW50cygpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5vZmYoJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub2ZmKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5vcmllbnRhdGlvbkNoYW5nZSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnJlc2l6ZSk7XG5cbiAgICAgICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vZmYoJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwU2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSk7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIG9yaWdpbmFsU2xpZGVzO1xuXG4gICAgICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMCkge1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXMuY2hpbGRyZW4oKS5jaGlsZHJlbigpO1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChvcmlnaW5hbFNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uc2hvdWxkQ2xpY2sgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24ocmVmcmVzaCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG5cbiAgICAgICAgXy5jbGVhblVwRXZlbnRzKCk7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikuZGV0YWNoKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5wcmV2QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIF8uJG5leHRBcnJvd1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQgc2xpY2stYXJyb3cgc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gYXJpYS1kaXNhYmxlZCB0YWJpbmRleCcpXG4gICAgICAgICAgICAgICAgLmNzcygnZGlzcGxheScsJycpO1xuXG4gICAgICAgICAgICBpZiAoIF8uaHRtbEV4cHIudGVzdCggXy5vcHRpb25zLm5leHRBcnJvdyApKSB7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay12aXNpYmxlIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29yaWdpbmFsU3R5bGluZycpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRsaXN0LmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYXBwZW5kKF8uJHNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBfLmNsZWFuVXBSb3dzKCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZXInKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgIF8udW5zbGlja2VkID0gdHJ1ZTtcblxuICAgICAgICBpZighcmVmcmVzaCkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2Rlc3Ryb3knLCBbX10pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRpc2FibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICcnO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlID0gZnVuY3Rpb24oc2xpZGVJbmRleCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGVPdXQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJylcbiAgICAgICAgICAgIC5vbignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycsICcqJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB2YXIgJHNmID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucGF1c2VPbkZvY3VzICkge1xuICAgICAgICAgICAgICAgICAgICBfLmZvY3Vzc2VkID0gJHNmLmlzKCc6Zm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQ3VycmVudFNsaWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5jdXJyZW50U2xpZGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldERvdENvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciBicmVha1BvaW50ID0gMDtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgcGFnZXJRdHkgPSAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYWdlclF0eSA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIGlmKCFfLm9wdGlvbnMuYXNOYXZGb3IpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gMSArIE1hdGguY2VpbCgoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFnZXJRdHkgLSAxO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRhcmdldExlZnQsXG4gICAgICAgICAgICB2ZXJ0aWNhbEhlaWdodCxcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIHRhcmdldFNsaWRlLFxuICAgICAgICAgICAgY29lZjtcblxuICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgdmVydGljYWxIZWlnaHQgPSBfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoXy5zbGlkZVdpZHRoICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgICAgICBjb2VmID0gLTFcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IHRydWUgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZWYgPSAtMS41O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZWYgPSAtMlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKHZlcnRpY2FsSGVpZ2h0ICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiBjb2VmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsID4gXy5zbGlkZUNvdW50ICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogXy5zbGlkZVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpICogXy5zbGlkZVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiBfLnNsaWRlV2lkdGg7XG4gICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiB2ZXJ0aWNhbEhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdykpIC8gMikgLSAoKF8uc2xpZGVXaWR0aCAqIF8uc2xpZGVDb3VudCkgLyAyKTtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgLSBfLnNsaWRlV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogXy5zbGlkZVdpZHRoKSAqIC0xKSArIF8uc2xpZGVPZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogdmVydGljYWxIZWlnaHQpICogLTEpICsgdmVydGljYWxPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdGFyZ2V0U2xpZGVbMF0gPyB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0ICogLTEgOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAoXy4kc2xpZGVUcmFjay53aWR0aCgpIC0gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAtIHRhcmdldFNsaWRlLndpZHRoKCkpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gIDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdGFyZ2V0U2xpZGVbMF0gPyB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0ICogLTEgOiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgKz0gKF8uJGxpc3Qud2lkdGgoKSAtIHRhcmdldFNsaWRlLm91dGVyV2lkdGgoKSkgLyAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldExlZnQ7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICByZXR1cm4gXy5vcHRpb25zW29wdGlvbl07XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE5hdmlnYWJsZUluZGV4ZXMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBicmVha1BvaW50ID0gMCxcbiAgICAgICAgICAgIGNvdW50ZXIgPSAwLFxuICAgICAgICAgICAgaW5kZXhlcyA9IFtdLFxuICAgICAgICAgICAgbWF4O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVha1BvaW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBjb3VudGVyID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQgKiAyO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChicmVha1BvaW50KTtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXhlcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpZGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlc1RyYXZlcnNlZCwgc3dpcGVkU2xpZGUsIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIDogMDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stc2xpZGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZS5vZmZzZXRMZWZ0IC0gY2VudGVyT2Zmc2V0ICsgKCQoc2xpZGUpLm91dGVyV2lkdGgoKSAvIDIpID4gKF8uc3dpcGVMZWZ0ICogLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZFNsaWRlID0gc2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkID0gTWF0aC5hYnMoJChzd2lwZWRTbGlkZSkuYXR0cignZGF0YS1zbGljay1pbmRleCcpIC0gXy5jdXJyZW50U2xpZGUpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRvbnRBbmltYXRlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNyZWF0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICghJChfLiRzbGlkZXIpLmhhc0NsYXNzKCdzbGljay1pbml0aWFsaXplZCcpKSB7XG5cbiAgICAgICAgICAgICQoXy4kc2xpZGVyKS5hZGRDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgICAgICAgICAgXy5idWlsZFJvd3MoKTtcbiAgICAgICAgICAgIF8uYnVpbGRPdXQoKTtcbiAgICAgICAgICAgIF8uc2V0UHJvcHMoKTtcbiAgICAgICAgICAgIF8uc3RhcnRMb2FkKCk7XG4gICAgICAgICAgICBfLmxvYWRTbGlkZXIoKTtcbiAgICAgICAgICAgIF8uaW5pdGlhbGl6ZUV2ZW50cygpO1xuICAgICAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcbiAgICAgICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUodHJ1ZSk7XG4gICAgICAgICAgICBfLmZvY3VzSGFuZGxlcigpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3JlYXRpb24pIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdpbml0JywgW19dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5pbml0QURBKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcblxuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBREEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgICAgIG51bURvdEdyb3VwcyA9IE1hdGguY2VpbChfLnNsaWRlQ291bnQgLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSxcbiAgICAgICAgICAgICAgICB0YWJDb250cm9sSW5kZXhlcyA9IF8uZ2V0TmF2aWdhYmxlSW5kZXhlcygpLmZpbHRlcihmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWwgPj0gMCkgJiYgKHZhbCA8IF8uc2xpZGVDb3VudCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmFkZChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgXy4kc2xpZGVzLm5vdChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNsaWRlQ29udHJvbEluZGV4ID0gdGFiQ29udHJvbEluZGV4ZXMuaW5kZXhPZihpKTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpLFxuICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAtMVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlQ29udHJvbEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgIHZhciBhcmlhQnV0dG9uQ29udHJvbCA9ICdzbGljay1zbGlkZS1jb250cm9sJyArIF8uaW5zdGFuY2VVaWQgKyBzbGlkZUNvbnRyb2xJbmRleFxuICAgICAgICAgICAgICAgICAgIGlmICgkKCcjJyArIGFyaWFCdXR0b25Db250cm9sKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZGVzY3JpYmVkYnknOiBhcmlhQnV0dG9uQ29udHJvbFxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpLmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNsaWRlSW5kZXggPSB0YWJDb250cm9sSW5kZXhlc1tpXTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3ByZXNlbnRhdGlvbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnYnV0dG9uJykuZmlyc3QoKS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlLWNvbnRyb2wnICsgXy5pbnN0YW5jZVVpZCArIGksXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBtYXBwZWRTbGlkZUluZGV4LFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1sYWJlbCc6IChpICsgMSkgKyAnIG9mICcgKyBudW1Eb3RHcm91cHMsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KS5lcShfLmN1cnJlbnRTbGlkZSkuZmluZCgnYnV0dG9uJykuYXR0cih7XG4gICAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJzAnXG4gICAgICAgICAgICB9KS5lbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9Xy5jdXJyZW50U2xpZGUsIG1heD1pK18ub3B0aW9ucy5zbGlkZXNUb1Nob3c7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPbkNoYW5nZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKGkpLmF0dHIoeyd0YWJpbmRleCc6ICcwJ30pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoaSkucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLmFjdGl2YXRlQURBKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdERvdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKS5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4J1xuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGRvdHMub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0U2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucGF1c2VPbkhvdmVyICkge1xuXG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdzdGFydCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsICQucHJveHkoXy52aXNpYmlsaXR5LCBfKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ub3JpZW50YXRpb25DaGFuZ2UsIF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLnJlc2l6ZSwgXykpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgIC8vRG9udCBzbGlkZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSB0aGUgZm9ybSBmaWVsZHMgYW5kIGFycm93IGtleXMgYXJlIHByZXNzZWRcbiAgICAgICAgaWYoIWV2ZW50LnRhcmdldC50YWdOYW1lLm1hdGNoKCdURVhUQVJFQXxJTlBVVHxTRUxFQ1QnKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAnbmV4dCcgOiAgJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAncHJldmlvdXMnIDogJ25leHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZEltYWdlcyhpbWFnZXNTY29wZSkge1xuXG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtbGF6eScpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVNyY1NldCA9ICQodGhpcykuYXR0cignZGF0YS1zcmNzZXQnKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTaXplcyAgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc2l6ZXMnKSB8fCBfLiRzbGlkZXIuYXR0cignZGF0YS1zaXplcycpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlU3JjU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Jjc2V0JywgaW1hZ2VTcmNTZXQgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VTaXplcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc2l6ZXMnLCBpbWFnZVNpemVzICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgaW1hZ2VTb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5IGRhdGEtc3Jjc2V0IGRhdGEtc2l6ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFtfLCBpbWFnZSwgaW1hZ2VTb3VyY2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IE1hdGguY2VpbChyYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VFbmQgPD0gXy5zbGlkZUNvdW50KSByYW5nZUVuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAnYW50aWNpcGF0ZWQnKSB7XG4gICAgICAgICAgICB2YXIgcHJldlNsaWRlID0gcmFuZ2VTdGFydCAtIDEsXG4gICAgICAgICAgICAgICAgbmV4dFNsaWRlID0gcmFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgJHNsaWRlcyA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcmV2U2xpZGUgPCAwKSBwcmV2U2xpZGUgPSBfLnNsaWRlQ291bnQgLSAxO1xuICAgICAgICAgICAgICAgIGxvYWRSYW5nZSA9IGxvYWRSYW5nZS5hZGQoJHNsaWRlcy5lcShwcmV2U2xpZGUpKTtcbiAgICAgICAgICAgICAgICBsb2FkUmFuZ2UgPSBsb2FkUmFuZ2UuYWRkKCRzbGlkZXMuZXEobmV4dFNsaWRlKSk7XG4gICAgICAgICAgICAgICAgcHJldlNsaWRlLS07XG4gICAgICAgICAgICAgICAgbmV4dFNsaWRlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkSW1hZ2VzKGxvYWRSYW5nZSk7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZSgwLCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKiAtMSk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxvYWRTbGlkZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5pbml0VUkoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAncHJvZ3Jlc3NpdmUnKSB7XG4gICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5uZXh0ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrTmV4dCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm9yaWVudGF0aW9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGF1c2UgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQYXVzZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICAgICAgXy5wYXVzZWQgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wbGF5ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIF8ub3B0aW9ucy5hdXRvcGxheSA9IHRydWU7XG4gICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wb3N0U2xpZGUgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiggIV8udW5zbGlja2VkICkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWZ0ZXJDaGFuZ2UnLCBbXywgaW5kZXhdKTtcblxuICAgICAgICAgICAgXy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmluaXRBREEoKTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGN1cnJlbnRTbGlkZSA9ICQoXy4kc2xpZGVzLmdldChfLmN1cnJlbnRTbGlkZSkpO1xuICAgICAgICAgICAgICAgICAgICAkY3VycmVudFNsaWRlLmF0dHIoJ3RhYmluZGV4JywgMCkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUHJldiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAncHJldmlvdXMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJvZ3Jlc3NpdmVMYXp5TG9hZCA9IGZ1bmN0aW9uKCB0cnlDb3VudCApIHtcblxuICAgICAgICB0cnlDb3VudCA9IHRyeUNvdW50IHx8IDE7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgJGltZ3NUb0xvYWQgPSAkKCAnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIgKSxcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgaW1hZ2VTb3VyY2UsXG4gICAgICAgICAgICBpbWFnZVNyY1NldCxcbiAgICAgICAgICAgIGltYWdlU2l6ZXMsXG4gICAgICAgICAgICBpbWFnZVRvTG9hZDtcblxuICAgICAgICBpZiAoICRpbWdzVG9Mb2FkLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgaW1hZ2UgPSAkaW1nc1RvTG9hZC5maXJzdCgpO1xuICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSBpbWFnZS5hdHRyKCdkYXRhLWxhenknKTtcbiAgICAgICAgICAgIGltYWdlU3JjU2V0ID0gaW1hZ2UuYXR0cignZGF0YS1zcmNzZXQnKTtcbiAgICAgICAgICAgIGltYWdlU2l6ZXMgID0gaW1hZ2UuYXR0cignZGF0YS1zaXplcycpIHx8IF8uJHNsaWRlci5hdHRyKCdkYXRhLXNpemVzJyk7XG4gICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpbWFnZVNyY1NldCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NyY3NldCcsIGltYWdlU3JjU2V0ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlU2l6ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NpemVzJywgaW1hZ2VTaXplcyApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoICdzcmMnLCBpbWFnZVNvdXJjZSApXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenkgZGF0YS1zcmNzZXQgZGF0YS1zaXplcycpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIHRyeUNvdW50IDwgMyApIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdHJ5IHRvIGxvYWQgdGhlIGltYWdlIDMgdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAqIGxlYXZlIGEgc2xpZ2h0IGRlbGF5IHNvIHdlIGRvbid0IGdldFxuICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2ZXJzIGJsb2NraW5nIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoIHRyeUNvdW50ICsgMSApO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDAgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCAnZGF0YS1sYXp5JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdzbGljay1sb2FkaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdzbGljay1sYXp5bG9hZC1lcnJvcicgKTtcblxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRFcnJvcicsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5zcmMgPSBpbWFnZVNvdXJjZTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWxsSW1hZ2VzTG9hZGVkJywgWyBfIF0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCBpbml0aWFsaXppbmcgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBjdXJyZW50U2xpZGUsIGxhc3RWaXNpYmxlSW5kZXg7XG5cbiAgICAgICAgbGFzdFZpc2libGVJbmRleCA9IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG5cbiAgICAgICAgLy8gaW4gbm9uLWluZmluaXRlIHNsaWRlcnMsIHdlIGRvbid0IHdhbnQgdG8gZ28gcGFzdCB0aGVcbiAgICAgICAgLy8gbGFzdCB2aXNpYmxlIGluZGV4LlxuICAgICAgICBpZiggIV8ub3B0aW9ucy5pbmZpbml0ZSAmJiAoIF8uY3VycmVudFNsaWRlID4gbGFzdFZpc2libGVJbmRleCApKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGxhc3RWaXNpYmxlSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBsZXNzIHNsaWRlcyB0aGFuIHRvIHNob3csIGdvIHRvIHN0YXJ0LlxuICAgICAgICBpZiAoIF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcblxuICAgICAgICBfLmRlc3Ryb3kodHJ1ZSk7XG5cbiAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscywgeyBjdXJyZW50U2xpZGU6IGN1cnJlbnRTbGlkZSB9KTtcblxuICAgICAgICBfLmluaXQoKTtcblxuICAgICAgICBpZiggIWluaXRpYWxpemluZyApIHtcblxuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogY3VycmVudFNsaWRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVnaXN0ZXJCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYnJlYWtwb2ludCwgY3VycmVudEJyZWFrcG9pbnQsIGwsXG4gICAgICAgICAgICByZXNwb25zaXZlU2V0dGluZ3MgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZSB8fCBudWxsO1xuXG4gICAgICAgIGlmICggJC50eXBlKHJlc3BvbnNpdmVTZXR0aW5ncykgPT09ICdhcnJheScgJiYgcmVzcG9uc2l2ZVNldHRpbmdzLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBfLm9wdGlvbnMucmVzcG9uZFRvIHx8ICd3aW5kb3cnO1xuXG4gICAgICAgICAgICBmb3IgKCBicmVha3BvaW50IGluIHJlc3BvbnNpdmVTZXR0aW5ncyApIHtcblxuICAgICAgICAgICAgICAgIGwgPSBfLmJyZWFrcG9pbnRzLmxlbmd0aC0xO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNpdmVTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShicmVha3BvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50QnJlYWtwb2ludCA9IHJlc3BvbnNpdmVTZXR0aW5nc1ticmVha3BvaW50XS5icmVha3BvaW50O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYnJlYWtwb2ludHMgYW5kIGN1dCBvdXQgYW55IGV4aXN0aW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG9uZXMgd2l0aCB0aGUgc2FtZSBicmVha3BvaW50IG51bWJlciwgd2UgZG9uJ3Qgd2FudCBkdXBlcy5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGwgPj0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLmJyZWFrcG9pbnRzW2xdICYmIF8uYnJlYWtwb2ludHNbbF0gPT09IGN1cnJlbnRCcmVha3BvaW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc3BsaWNlKGwsMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsLS07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2goY3VycmVudEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tjdXJyZW50QnJlYWtwb2ludF0gPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uc2V0dGluZ3M7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCBfLm9wdGlvbnMubW9iaWxlRmlyc3QgKSA/IGEtYiA6IGItYTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKF8ub3B0aW9ucy5zbGlkZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50ICYmIF8uY3VycmVudFNsaWRlICE9PSAwKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcblxuICAgICAgICBfLnNldFByb3BzKCk7XG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuICAgICAgICBfLmJ1aWxkQXJyb3dzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcbiAgICAgICAgXy5pbml0U2xpZGVFdmVudHMoKTtcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZShmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKHR5cGVvZiBfLmN1cnJlbnRTbGlkZSA9PT0gJ251bWJlcicgPyBfLmN1cnJlbnRTbGlkZSA6IDApO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgXy5mb2N1c0hhbmRsZXIoKTtcblxuICAgICAgICBfLnBhdXNlZCA9ICFfLm9wdGlvbnMuYXV0b3BsYXk7XG4gICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcigncmVJbml0JywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gXy53aW5kb3dXaWR0aCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF8ud2luZG93RGVsYXkpO1xuICAgICAgICAgICAgXy53aW5kb3dEZWxheSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICAgICAgICAgIGlmKCAhXy51bnNsaWNrZWQgKSB7IF8uc2V0UG9zaXRpb24oKTsgfVxuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gMCA6IF8uc2xpZGVDb3VudCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIHgsIHk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuICAgICAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XG5cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJywgJyArIHkgKyAnKSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgICAgIF8ubGlzdEhlaWdodCA9IF8uJGxpc3QuaGVpZ2h0KCk7XG5cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSAmJiBfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uc2xpZGVXaWR0aCAqIGluZGV4KSAqIC0xO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLmNzcyh7XG4gICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAxLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuY3NzKCdoZWlnaHQnLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9XG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWNrU2V0T3B0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFjY2VwdHMgYXJndW1lbnRzIGluIGZvcm1hdCBvZjpcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2luZ2xlIG9wdGlvbidzIHZhbHVlOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggKVxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBmb3IgY2hhbmdpbmcgYSBzZXQgb2YgcmVzcG9uc2l2ZSBvcHRpb25zOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsICdyZXNwb25zaXZlJywgW3t9LCAuLi5dLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIHVwZGF0aW5nIG11bHRpcGxlIHZhbHVlcyBhdCBvbmNlIChub3QgcmVzcG9uc2l2ZSlcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCB7ICdvcHRpb24nOiB2YWx1ZSwgLi4uIH0sIHJlZnJlc2ggKVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGwsIGl0ZW0sIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggPSBmYWxzZSwgdHlwZTtcblxuICAgICAgICBpZiggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ29iamVjdCcgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdHlwZSA9ICdtdWx0aXBsZSc7XG5cbiAgICAgICAgfSBlbHNlIGlmICggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ3N0cmluZycgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHJlZnJlc2ggPSBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIGlmICggYXJndW1lbnRzWzBdID09PSAncmVzcG9uc2l2ZScgJiYgJC50eXBlKCBhcmd1bWVudHNbMV0gKSA9PT0gJ2FycmF5JyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAncmVzcG9uc2l2ZSc7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhcmd1bWVudHNbMV0gIT09ICd1bmRlZmluZWQnICkge1xuXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdzaW5nbGUnO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdHlwZSA9PT0gJ3NpbmdsZScgKSB7XG5cbiAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnbXVsdGlwbGUnICkge1xuXG4gICAgICAgICAgICAkLmVhY2goIG9wdGlvbiAsIGZ1bmN0aW9uKCBvcHQsIHZhbCApIHtcblxuICAgICAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRdID0gdmFsO1xuXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdyZXNwb25zaXZlJyApIHtcblxuICAgICAgICAgICAgZm9yICggaXRlbSBpbiB2YWx1ZSApIHtcblxuICAgICAgICAgICAgICAgIGlmKCAkLnR5cGUoIF8ub3B0aW9ucy5yZXNwb25zaXZlICkgIT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgPSBbIHZhbHVlW2l0ZW1dIF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGwgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGgtMTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIHJlc3BvbnNpdmUgb2JqZWN0IGFuZCBzcGxpY2Ugb3V0IGR1cGxpY2F0ZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucmVzcG9uc2l2ZVtsXS5icmVha3BvaW50ID09PSB2YWx1ZVtpdGVtXS5icmVha3BvaW50ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUuc3BsaWNlKGwsMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5wdXNoKCB2YWx1ZVtpdGVtXSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcmVmcmVzaCApIHtcblxuICAgICAgICAgICAgXy51bmxvYWQoKTtcbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBfLnNldEhlaWdodCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2V0Q1NTKF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zZXRGYWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc2V0UG9zaXRpb24nLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJvZHlTdHlsZSA9IGRvY3VtZW50LmJvZHkuc3R5bGU7XG5cbiAgICAgICAgXy5wb3NpdGlvblByb3AgPSBfLm9wdGlvbnMudmVydGljYWwgPT09IHRydWUgPyAndG9wJyA6ICdsZWZ0JztcblxuICAgICAgICBpZiAoXy5wb3NpdGlvblByb3AgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLldlYmtpdFRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLk1velRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLm1zVHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnVzZUNTUyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZmFkZSApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIF8ub3B0aW9ucy56SW5kZXggPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMuekluZGV4IDwgMyApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IDM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuekluZGV4ID0gXy5kZWZhdWx0cy56SW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUuTW96VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnTW96VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ01velRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLk1velBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLndlYmtpdFRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3dlYmtpdFRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd3ZWJraXRUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUudHJhbnNmb3JtICE9PSB1bmRlZmluZWQgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd0cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gXy5vcHRpb25zLnVzZVRyYW5zZm9ybSAmJiAoXy5hbmltVHlwZSAhPT0gbnVsbCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSk7XG4gICAgfTtcblxuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFNsaWRlQ2xhc3NlcyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0LCBhbGxTbGlkZXMsIGluZGV4T2Zmc2V0LCByZW1haW5kZXI7XG5cbiAgICAgICAgYWxsU2xpZGVzID0gXy4kc2xpZGVyXG4gICAgICAgICAgICAuZmluZCgnLnNsaWNrLXNsaWRlJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWN1cnJlbnQnKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgdmFyIGV2ZW5Db2VmID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAlIDIgPT09IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjZW50ZXJPZmZzZXQgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIDEpIC0gY2VudGVyT2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0ICsgZXZlbkNvZWYsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSBjZW50ZXJPZmZzZXQgKyAxICsgZXZlbkNvZWYsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXEoYWxsU2xpZGVzLmxlbmd0aCAtIDEgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IF8uc2xpZGVDb3VudCAtIDEpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykpIHtcblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXgsIGluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbGxTbGlkZXMubGVuZ3RoIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmVtYWluZGVyID0gXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSA/IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleCA6IGluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIHJlbWFpbmRlciksIGluZGV4T2Zmc2V0ICsgcmVtYWluZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0LCBpbmRleE9mZnNldCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAnb25kZW1hbmQnIHx8IF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ2FudGljaXBhdGVkJykge1xuICAgICAgICAgICAgXy5sYXp5TG9hZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQgICsgXy5zbGlkZUNvdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICQoXy4kc2xpZGVzW3NsaWRlSW5kZXhdKS5jbG9uZSh0cnVlKS5hdHRyKCdpZCcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBzbGlkZUluZGV4ICsgXy5zbGlkZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykuZmluZCgnW2lkXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignaWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmludGVycnVwdCA9IGZ1bmN0aW9uKCB0b2dnbGUgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmKCAhdG9nZ2xlICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0b2dnbGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNlbGVjdEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuaXMoJy5zbGljay1zbGlkZScpID9cbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkgOlxuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKCcuc2xpY2stc2xpZGUnKTtcblxuICAgICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh0YXJnZXRFbGVtZW50LmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSk7XG5cbiAgICAgICAgaWYgKCFpbmRleCkgaW5kZXggPSAwO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgICAgICAgIF8gPSB0aGlzLCBuYXZUYXJnZXQ7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFzTmF2Rm9yKGluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFNsaWRlID0gaW5kZXg7XG4gICAgICAgIHRhcmdldExlZnQgPSBfLmdldExlZnQodGFyZ2V0U2xpZGUpO1xuICAgICAgICBzbGlkZUxlZnQgPSBfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8uY3VycmVudExlZnQgPSBfLnN3aXBlTGVmdCA9PT0gbnVsbCA/IHNsaWRlTGVmdCA6IF8uc3dpcGVMZWZ0O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gXy5nZXREb3RDb3VudCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYW5pbWF0ZVNsaWRlKHNsaWRlTGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRTbGlkZSA8IDApIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgLSAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50ICsgdGFyZ2V0U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2xpZGUgPj0gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGUgLSBfLnNsaWRlQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYmVmb3JlQ2hhbmdlJywgW18sIF8uY3VycmVudFNsaWRlLCBhbmltU2xpZGVdKTtcblxuICAgICAgICBvbGRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGFuaW1TbGlkZTtcblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3NlcyhfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXNOYXZGb3IgKSB7XG5cbiAgICAgICAgICAgIG5hdlRhcmdldCA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBuYXZUYXJnZXQuc2xpY2soJ2dldFNsaWNrJyk7XG5cbiAgICAgICAgICAgIGlmICggbmF2VGFyZ2V0LnNsaWRlQ291bnQgPD0gbmF2VGFyZ2V0Lm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgICAgIG5hdlRhcmdldC5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGVPdXQob2xkU2xpZGUpO1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUodGFyZ2V0TGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zdGFydExvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cuaGlkZSgpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5oaWRlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciB4RGlzdCwgeURpc3QsIHIsIHN3aXBlQW5nbGUsIF8gPSB0aGlzO1xuXG4gICAgICAgIHhEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFggLSBfLnRvdWNoT2JqZWN0LmN1clg7XG4gICAgICAgIHlEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFkgLSBfLnRvdWNoT2JqZWN0LmN1clk7XG4gICAgICAgIHIgPSBNYXRoLmF0YW4yKHlEaXN0LCB4RGlzdCk7XG5cbiAgICAgICAgc3dpcGVBbmdsZSA9IE1hdGgucm91bmQociAqIDE4MCAvIE1hdGguUEkpO1xuICAgICAgICBpZiAoc3dpcGVBbmdsZSA8IDApIHtcbiAgICAgICAgICAgIHN3aXBlQW5nbGUgPSAzNjAgLSBNYXRoLmFicyhzd2lwZUFuZ2xlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSA0NSkgJiYgKHN3aXBlQW5nbGUgPj0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPD0gMzYwKSAmJiAoc3dpcGVBbmdsZSA+PSAzMTUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlID49IDEzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMjI1KSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdyaWdodCcgOiAnbGVmdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMzUpICYmIChzd2lwZUFuZ2xlIDw9IDEzNSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Rvd24nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3VwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAndmVydGljYWwnO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVDb3VudCxcbiAgICAgICAgICAgIGRpcmVjdGlvbjtcblxuICAgICAgICBfLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIF8uc3dpcGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChfLnNjcm9sbGluZykge1xuICAgICAgICAgICAgXy5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgXy5zaG91bGRDbGljayA9ICggXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+IDEwICkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmN1clggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlICkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2VkZ2UnLCBbXywgXy5zd2lwZURpcmVjdGlvbigpIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID49IF8udG91Y2hPYmplY3QubWluU3dpcGUgKSB7XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICAgICAgc3dpdGNoICggZGlyZWN0aW9uICkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSAtIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiggZGlyZWN0aW9uICE9ICd2ZXJ0aWNhbCcgKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggc2xpZGVDb3VudCApO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc3dpcGUnLCBbXywgZGlyZWN0aW9uIF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAhPT0gXy50b3VjaE9iamVjdC5jdXJYICkge1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIF8uY3VycmVudFNsaWRlICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoKF8ub3B0aW9ucy5zd2lwZSA9PT0gZmFsc2UpIHx8ICgnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQgJiYgXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSBmYWxzZSAmJiBldmVudC50eXBlLmluZGV4T2YoJ21vdXNlJykgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ID0gZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoIDogMTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0V2lkdGggLyBfLm9wdGlvbnNcbiAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5taW5Td2lwZSA9IF8ubGlzdEhlaWdodCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5hY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVTdGFydChldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ21vdmUnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVNb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICBfLnN3aXBlRW5kKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgZWRnZVdhc0hpdCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VyTGVmdCwgc3dpcGVEaXJlY3Rpb24sIHN3aXBlTGVuZ3RoLCBwb3NpdGlvbk9mZnNldCwgdG91Y2hlcywgdmVydGljYWxTd2lwZUxlbmd0aDtcblxuICAgICAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkID8gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzIDogbnVsbDtcblxuICAgICAgICBpZiAoIV8uZHJhZ2dpbmcgfHwgXy5zY3JvbGxpbmcgfHwgdG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VyTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWCAtIF8udG91Y2hPYmplY3Quc3RhcnRYLCAyKSkpO1xuXG4gICAgICAgIHZlcnRpY2FsU3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWSAtIF8udG91Y2hPYmplY3Quc3RhcnRZLCAyKSkpO1xuXG4gICAgICAgIGlmICghXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyAmJiAhXy5zd2lwaW5nICYmIHZlcnRpY2FsU3dpcGVMZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBfLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IHZlcnRpY2FsU3dpcGVMZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZURpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkICYmIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBfLnN3aXBpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggKiBfLm9wdGlvbnMuZWRnZUZyaWN0aW9uO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrVW5maWx0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJHNsaWRlc0NhY2hlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oZnJvbUJyZWFrcG9pbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCd1bnNsaWNrJywgW18sIGZyb21CcmVha3BvaW50XSk7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXG4gICAgICAgICAgICAhXy5vcHRpb25zLmluZmluaXRlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmVuZCgpO1xuXG4gICAgICAgICAgICBfLiRkb3RzXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgICAuZXEoTWF0aC5mbG9vcihfLmN1cnJlbnRTbGlkZSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnZpc2liaWxpdHkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG5cbiAgICAgICAgICAgIGlmICggZG9jdW1lbnRbXy5oaWRkZW5dICkge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgJC5mbi5zbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBvcHQgPSBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGwgPSBfLmxlbmd0aCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICByZXQ7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBvcHQgPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgX1tpXS5zbGljayA9IG5ldyBTbGljayhfW2ldLCBvcHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldCA9IF9baV0uc2xpY2tbb3B0XS5hcHBseShfW2ldLnNsaWNrLCBhcmdzKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0ICE9ICd1bmRlZmluZWQnKSByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfO1xuICAgIH07XG5cbn0pKTtcbiIsIiFmdW5jdGlvbiAoJCkge1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4gIC8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAvLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG4gIHZhciBGb3VuZGF0aW9uID0ge1xuICAgIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgICAqL1xuICAgIF9wbHVnaW5zOiB7fSxcblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgICAqL1xuICAgIF91dWlkczogW10sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICAgKi9cbiAgICBydGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAgICovXG4gICAgcGx1Z2luOiBmdW5jdGlvbiAocGx1Z2luLCBuYW1lKSB7XG4gICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICAgIHZhciBjbGFzc05hbWUgPSBuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pO1xuICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgICAgdmFyIGF0dHJOYW1lID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICAgKi9cbiAgICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbiwgbmFtZSkge1xuICAgICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgICAgaWYgKCFwbHVnaW4uJGVsZW1lbnQuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHBsdWdpbi51dWlkKTtcbiAgICAgIH1cbiAgICAgIGlmICghcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICovXG4gICAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcignaW5pdC56Zi4nICsgcGx1Z2luTmFtZSk7XG5cbiAgICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAqL1xuICAgIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgKi9cbiAgICAgIC50cmlnZ2VyKCdkZXN0cm95ZWQuemYuJyArIHBsdWdpbk5hbWUpO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBwbHVnaW4pIHtcbiAgICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsgLy9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICAgKi9cbiAgICByZUluaXQ6IGZ1bmN0aW9uIChwbHVnaW5zKSB7XG4gICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzSlEpIHtcbiAgICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24gKHBsZ3MpIHtcbiAgICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS0nICsgcCArICddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtJyArIHBsdWdpbnMgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAgICovXG4gICAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uIChsZW5ndGgsIG5hbWVzcGFjZSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyAnLScgKyBuYW1lc3BhY2UgOiAnJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAgICovXG4gICAgcmVmbG93OiBmdW5jdGlvbiAoZWxlbSwgcGx1Z2lucykge1xuXG4gICAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgICAgfVxuICAgICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgICAgICB9XG5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uIChpLCBuYW1lKSB7XG4gICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nICsgbmFtZSArICddJykuYWRkQmFjaygnW2RhdGEtJyArIG5hbWUgKyAnXScpO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIiArIG5hbWUgKyBcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSkge1xuICAgICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwudHJpbSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbiAoJGVsZW0pIHtcbiAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgICAgfTtcbiAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgZW5kO1xuXG4gICAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVuZCkge1xuICAgICAgICByZXR1cm4gZW5kO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgICAgfSwgMSk7XG4gICAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24udXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsXG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4gIC8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuICAvKipcbiAgICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gICAqL1xuICB2YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgICBpZiAoISRtZXRhLmxlbmd0aCkge1xuICAgICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gICAgfVxuICAgIGlmICgkbm9KUy5sZW5ndGgpIHtcbiAgICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsgLy9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7IC8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgICAgaWYgKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdXZVxcJ3JlIHNvcnJ5LCAnICsgdHlwZSArICcgaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4gICQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbiAgLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAoZnVuY3Rpb24gKCkge1xuICAgIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdykgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8IHdpbmRvd1t2cCArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG4gICAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTtcbiAgICAgICAgfSwgbmV4dFRpbWUgLSBub3cpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAgICovXG4gICAgaWYgKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICAgIG5vdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG4gIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgICAgZk5PUCA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgPyB0aGlzIDogb1RoaXMsIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICB9XG4gICAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgICAgcmV0dXJuIGZCb3VuZDtcbiAgICB9O1xuICB9XG4gIC8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuICBmdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICAgIHZhciByZXN1bHRzID0gZnVuY05hbWVSZWdleC5leGVjKGZuLnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICAgIH0gZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKSB7XG4gICAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuICAvLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuICAvLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbiAgZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgfVxufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgRm91bmRhdGlvbi5Cb3ggPSB7XG4gICAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICAgIEdldE9mZnNldHM6IEdldE9mZnNldHNcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gICAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICAgIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICAgdG9wLFxuICAgICAgICBib3R0b20sXG4gICAgICAgIGxlZnQsXG4gICAgICAgIHJpZ2h0O1xuXG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICAgIGJvdHRvbSA9IGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wO1xuICAgICAgdG9wID0gZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcDtcbiAgICAgIGxlZnQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQ7XG4gICAgICByaWdodCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBib3R0b20gPSBlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3A7XG4gICAgICB0b3AgPSBlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3A7XG4gICAgICBsZWZ0ID0gZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQ7XG4gICAgICByaWdodCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aDtcbiAgICB9XG5cbiAgICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gICAgaWYgKGxyT25seSkge1xuICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0Yk9ubHkpIHtcbiAgICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAgICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0sIHRlc3QpIHtcbiAgICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcblxuICAgIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICAgIH1cblxuICAgIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgd2luUmVjdCA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9LFxuICAgICAgcGFyZW50RGltczoge1xuICAgICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgd2luZG93RGltczoge1xuICAgICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICAgIGxlZnQ6IHdpblhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAgICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAgICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAgICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gICAqL1xuICBmdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgICBjYXNlICd0b3AnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgdG9wJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMixcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgbGVmdCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCAvIDIgLSAkZWxlRGltcy5oZWlnaHQgLyAyXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIgLSAkZWxlRGltcy53aWR0aCAvIDIsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIgLSAkZWxlRGltcy5oZWlnaHQgLyAyXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xlZnQgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArIGhPZmZzZXQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgIH1cbiAgfVxufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQsZSxvLGkpe3ZhciBzLGgsbix3LGQ9Zih0KTtpZihlKXt2YXIgcj1mKGUpO2g9ZC5vZmZzZXQudG9wK2QuaGVpZ2h0PD1yLmhlaWdodCtyLm9mZnNldC50b3Ascz1kLm9mZnNldC50b3A+PXIub2Zmc2V0LnRvcCxuPWQub2Zmc2V0LmxlZnQ+PXIub2Zmc2V0LmxlZnQsdz1kLm9mZnNldC5sZWZ0K2Qud2lkdGg8PXIud2lkdGgrci5vZmZzZXQubGVmdH1lbHNlIGg9ZC5vZmZzZXQudG9wK2QuaGVpZ2h0PD1kLndpbmRvd0RpbXMuaGVpZ2h0K2Qud2luZG93RGltcy5vZmZzZXQudG9wLHM9ZC5vZmZzZXQudG9wPj1kLndpbmRvd0RpbXMub2Zmc2V0LnRvcCxuPWQub2Zmc2V0LmxlZnQ+PWQud2luZG93RGltcy5vZmZzZXQubGVmdCx3PWQub2Zmc2V0LmxlZnQrZC53aWR0aDw9ZC53aW5kb3dEaW1zLndpZHRoO3ZhciBsPVtoLHMsbix3XTtyZXR1cm4gbz9uPT09dz09ITA6aT9zPT09aD09ITA6bC5pbmRleE9mKCExKT09PS0xfWZ1bmN0aW9uIGYodCxlKXtpZih0PXQubGVuZ3RoP3RbMF06dCx0PT09d2luZG93fHx0PT09ZG9jdW1lbnQpdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7dmFyIGY9dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxvPXQucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxpPWRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscz13aW5kb3cucGFnZVlPZmZzZXQsaD13aW5kb3cucGFnZVhPZmZzZXQ7cmV0dXJue3dpZHRoOmYud2lkdGgsaGVpZ2h0OmYuaGVpZ2h0LG9mZnNldDp7dG9wOmYudG9wK3MsbGVmdDpmLmxlZnQraH0scGFyZW50RGltczp7d2lkdGg6by53aWR0aCxoZWlnaHQ6by5oZWlnaHQsb2Zmc2V0Ont0b3A6by50b3ArcyxsZWZ0Om8ubGVmdCtofX0sd2luZG93RGltczp7d2lkdGg6aS53aWR0aCxoZWlnaHQ6aS5oZWlnaHQsb2Zmc2V0Ont0b3A6cyxsZWZ0Omh9fX19ZnVuY3Rpb24gbyh0LGUsbyxpLHMsaCl7dmFyIG49Zih0KSx3PWU/ZihlKTpudWxsO3N3aXRjaChvKXtjYXNlXCJ0b3BcIjpyZXR1cm57bGVmdDpGb3VuZGF0aW9uLnJ0bCgpP3cub2Zmc2V0LmxlZnQtbi53aWR0aCt3LndpZHRoOncub2Zmc2V0LmxlZnQsdG9wOncub2Zmc2V0LnRvcC0obi5oZWlnaHQraSl9O2Nhc2VcImxlZnRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LShuLndpZHRoK3MpLHRvcDp3Lm9mZnNldC50b3B9O2Nhc2VcInJpZ2h0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoK3MsdG9wOncub2Zmc2V0LnRvcH07Y2FzZVwiY2VudGVyIHRvcFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aC8yLW4ud2lkdGgvMix0b3A6dy5vZmZzZXQudG9wLShuLmhlaWdodCtpKX07Y2FzZVwiY2VudGVyIGJvdHRvbVwiOnJldHVybntsZWZ0Omg/czp3Lm9mZnNldC5sZWZ0K3cud2lkdGgvMi1uLndpZHRoLzIsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfTtjYXNlXCJjZW50ZXIgbGVmdFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQtKG4ud2lkdGgrcyksdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodC8yLW4uaGVpZ2h0LzJ9O2Nhc2VcImNlbnRlciByaWdodFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzKzEsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodC8yLW4uaGVpZ2h0LzJ9O2Nhc2VcImNlbnRlclwiOnJldHVybntsZWZ0Om4ud2luZG93RGltcy5vZmZzZXQubGVmdCtuLndpbmRvd0RpbXMud2lkdGgvMi1uLndpZHRoLzIsdG9wOm4ud2luZG93RGltcy5vZmZzZXQudG9wK24ud2luZG93RGltcy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJyZXZlYWxcIjpyZXR1cm57bGVmdDoobi53aW5kb3dEaW1zLndpZHRoLW4ud2lkdGgpLzIsdG9wOm4ud2luZG93RGltcy5vZmZzZXQudG9wK2l9O2Nhc2VcInJldmVhbCBmdWxsXCI6cmV0dXJue2xlZnQ6bi53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcH07Y2FzZVwibGVmdCBib3R0b21cIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX07Y2FzZVwicmlnaHQgYm90dG9tXCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoK3Mtbi53aWR0aCx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9O2RlZmF1bHQ6cmV0dXJue2xlZnQ6Rm91bmRhdGlvbi5ydGwoKT93Lm9mZnNldC5sZWZ0LW4ud2lkdGgrdy53aWR0aDp3Lm9mZnNldC5sZWZ0K3MsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfX19Rm91bmRhdGlvbi5Cb3g9e0ltTm90VG91Y2hpbmdZb3U6ZSxHZXREaW1lbnNpb25zOmYsR2V0T2Zmc2V0czpvfX0oalF1ZXJ5KTsiLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBrZXlDb2RlcyA9IHtcbiAgICA5OiAnVEFCJyxcbiAgICAxMzogJ0VOVEVSJyxcbiAgICAyNzogJ0VTQ0FQRScsXG4gICAgMzI6ICdTUEFDRScsXG4gICAgMzc6ICdBUlJPV19MRUZUJyxcbiAgICAzODogJ0FSUk9XX1VQJyxcbiAgICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgICA0MDogJ0FSUk9XX0RPV04nXG4gIH07XG5cbiAgdmFyIGNvbW1hbmRzID0ge307XG5cbiAgdmFyIEtleWJvYXJkID0ge1xuICAgIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAgICovXG4gICAgcGFyc2VLZXk6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXFcrLywgJycpO1xuXG4gICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9ICdTSElGVF8nICsga2V5O1xuICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9ICdDVFJMXycgKyBrZXk7XG4gICAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSAnQUxUXycgKyBrZXk7XG5cbiAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICAgKi9cbiAgICBoYW5kbGVLZXk6IGZ1bmN0aW9uIChldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgICAgIGNtZHMsXG4gICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICBmbjtcblxuICAgICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7ZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICAgIH1cbiAgICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgICAqL1xuICAgIGZpbmRGb2N1c2FibGU6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgaWYgKCEkZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICAgKi9cblxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbiAoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAgICovXG4gICAgdHJhcEZvY3VzOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICRmaXJzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAgICovXG4gICAgcmVsZWFzZUZvY3VzOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgICB9XG4gIH07XG5cbiAgLypcbiAgICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICovXG4gIGZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICAgIHZhciBrID0ge307XG4gICAgZm9yICh2YXIga2MgaW4ga2NzKSB7XG4gICAgICBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgICB9cmV0dXJuIGs7XG4gIH1cblxuICBGb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG4oZSl7dmFyIG49e307Zm9yKHZhciB0IGluIGUpbltlW3RdXT1lW3RdO3JldHVybiBufXZhciB0PXs5OlwiVEFCXCIsMTM6XCJFTlRFUlwiLDI3OlwiRVNDQVBFXCIsMzI6XCJTUEFDRVwiLDM3OlwiQVJST1dfTEVGVFwiLDM4OlwiQVJST1dfVVBcIiwzOTpcIkFSUk9XX1JJR0hUXCIsNDA6XCJBUlJPV19ET1dOXCJ9LG89e30scj17a2V5czpuKHQpLHBhcnNlS2V5OmZ1bmN0aW9uKGUpe3ZhciBuPXRbZS53aGljaHx8ZS5rZXlDb2RlXXx8U3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKS50b1VwcGVyQ2FzZSgpO3JldHVybiBuPW4ucmVwbGFjZSgvXFxXKy8sXCJcIiksZS5zaGlmdEtleSYmKG49XCJTSElGVF9cIituKSxlLmN0cmxLZXkmJihuPVwiQ1RSTF9cIituKSxlLmFsdEtleSYmKG49XCJBTFRfXCIrbiksbj1uLnJlcGxhY2UoL18kLyxcIlwiKX0saGFuZGxlS2V5OmZ1bmN0aW9uKG4sdCxyKXt2YXIgYSxpLGQsZj1vW3RdLHU9dGhpcy5wYXJzZUtleShuKTtpZighZilyZXR1cm4gY29uc29sZS53YXJuKFwiQ29tcG9uZW50IG5vdCBkZWZpbmVkIVwiKTtpZihhPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBmLmx0cj9mOkZvdW5kYXRpb24ucnRsKCk/ZS5leHRlbmQoe30sZi5sdHIsZi5ydGwpOmUuZXh0ZW5kKHt9LGYucnRsLGYubHRyKSxpPWFbdV0sZD1yW2ldLGQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGQpe3ZhciBsPWQuYXBwbHkoKTsoci5oYW5kbGVkfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiByLmhhbmRsZWQpJiZyLmhhbmRsZWQobCl9ZWxzZShyLnVuaGFuZGxlZHx8XCJmdW5jdGlvblwiPT10eXBlb2Ygci51bmhhbmRsZWQpJiZyLnVuaGFuZGxlZCgpfSxmaW5kRm9jdXNhYmxlOmZ1bmN0aW9uKG4pe3JldHVybiEhbiYmbi5maW5kKFwiYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXVwiKS5maWx0ZXIoZnVuY3Rpb24oKXtyZXR1cm4hKCFlKHRoaXMpLmlzKFwiOnZpc2libGVcIil8fGUodGhpcykuYXR0cihcInRhYmluZGV4XCIpPDApfSl9LHJlZ2lzdGVyOmZ1bmN0aW9uKGUsbil7b1tlXT1ufSx0cmFwRm9jdXM6ZnVuY3Rpb24oZSl7dmFyIG49Rm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKGUpLHQ9bi5lcSgwKSxvPW4uZXEoLTEpO2Uub24oXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiLGZ1bmN0aW9uKGUpe2UudGFyZ2V0PT09b1swXSYmXCJUQUJcIj09PUZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZSk/KGUucHJldmVudERlZmF1bHQoKSx0LmZvY3VzKCkpOmUudGFyZ2V0PT09dFswXSYmXCJTSElGVF9UQUJcIj09PUZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZSkmJihlLnByZXZlbnREZWZhdWx0KCksby5mb2N1cygpKX0pfSxyZWxlYXNlRm9jdXM6ZnVuY3Rpb24oZSl7ZS5vZmYoXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiKX19O0ZvdW5kYXRpb24uS2V5Ym9hcmQ9cn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbiAgdmFyIGRlZmF1bHRRdWVyaWVzID0ge1xuICAgICdkZWZhdWx0JzogJ29ubHkgc2NyZWVuJyxcbiAgICBsYW5kc2NhcGU6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgICBwb3J0cmFpdDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gICAgcmV0aW5hOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG4gIH07XG5cbiAgdmFyIE1lZGlhUXVlcnkgPSB7XG4gICAgcXVlcmllczogW10sXG5cbiAgICBjdXJyZW50OiAnJyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgICBpZiAobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICB2YWx1ZTogJ29ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAnICsgbmFtZWRRdWVyaWVzW2tleV0gKyAnKSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgICB0aGlzLl93YXRjaGVyKCk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAgICovXG4gICAgYXRMZWFzdDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgICAqL1xuICAgIGlzOiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgc2l6ZSA9IHNpemUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoc2l6ZS5sZW5ndGggPiAxICYmIHNpemVbMV0gPT09ICdvbmx5Jykge1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAgICovXG4gICAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbWF0Y2hlZDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3dhdGNoZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBuZXdTaXplID0gX3RoaXMuX2dldEN1cnJlbnRTaXplKCksXG4gICAgICAgICAgICBjdXJyZW50U2l6ZSA9IF90aGlzLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgICAgX3RoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBjdXJyZW50U2l6ZV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuICAvLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4gIC8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG4gIHdpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuXG4gICAgdmFyIHN0eWxlTWVkaWEgPSB3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWE7XG5cbiAgICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gICAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICAgICAgICBpbmZvID0gbnVsbDtcblxuICAgICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICBzdHlsZS5pZCA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICBpbmZvID0gJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdyAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgICBtYXRjaE1lZGl1bTogZnVuY3Rpb24gKG1lZGlhKSB7XG4gICAgICAgICAgdmFyIHRleHQgPSAnQG1lZGlhICcgKyBtZWRpYSArICd7ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfSc7XG5cbiAgICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG1lZGlhKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgICB9O1xuICAgIH07XG4gIH0oKSk7XG5cbiAgLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuICBmdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gICAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgICB9XG5cbiAgICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgICB9XG5cbiAgICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbiAocmV0LCBwYXJhbSkge1xuICAgICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LCB7fSk7XG5cbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUpe3ZhciB0PXt9O3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBlP3Q6KGU9ZS50cmltKCkuc2xpY2UoMSwtMSkpP3Q9ZS5zcGxpdChcIiZcIikucmVkdWNlKGZ1bmN0aW9uKGUsdCl7dmFyIG49dC5yZXBsYWNlKC9cXCsvZyxcIiBcIikuc3BsaXQoXCI9XCIpLHI9blswXSxpPW5bMV07cmV0dXJuIHI9ZGVjb2RlVVJJQ29tcG9uZW50KHIpLGk9dm9pZCAwPT09aT9udWxsOmRlY29kZVVSSUNvbXBvbmVudChpKSxlLmhhc093blByb3BlcnR5KHIpP0FycmF5LmlzQXJyYXkoZVtyXSk/ZVtyXS5wdXNoKGkpOmVbcl09W2Vbcl0saV06ZVtyXT1pLGV9LHt9KTp0fXZhciBuPXtxdWVyaWVzOltdLGN1cnJlbnQ6XCJcIixfaW5pdDpmdW5jdGlvbigpe3ZhciBuLHI9dGhpcyxpPWUoXCIuZm91bmRhdGlvbi1tcVwiKS5jc3MoXCJmb250LWZhbWlseVwiKTtuPXQoaSk7Zm9yKHZhciBhIGluIG4pbi5oYXNPd25Qcm9wZXJ0eShhKSYmci5xdWVyaWVzLnB1c2goe25hbWU6YSx2YWx1ZTpcIm9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiBcIituW2FdK1wiKVwifSk7dGhpcy5jdXJyZW50PXRoaXMuX2dldEN1cnJlbnRTaXplKCksdGhpcy5fd2F0Y2hlcigpfSxhdExlYXN0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuZ2V0KGUpO3JldHVybiEhdCYmd2luZG93Lm1hdGNoTWVkaWEodCkubWF0Y2hlc30saXM6ZnVuY3Rpb24oZSl7cmV0dXJuIGU9ZS50cmltKCkuc3BsaXQoXCIgXCIpLGUubGVuZ3RoPjEmJlwib25seVwiPT09ZVsxXT9lWzBdPT09dGhpcy5fZ2V0Q3VycmVudFNpemUoKTp0aGlzLmF0TGVhc3QoZVswXSl9LGdldDpmdW5jdGlvbihlKXtmb3IodmFyIHQgaW4gdGhpcy5xdWVyaWVzKWlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eSh0KSl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO2lmKGU9PT1uLm5hbWUpcmV0dXJuIG4udmFsdWV9cmV0dXJuIG51bGx9LF9nZXRDdXJyZW50U2l6ZTpmdW5jdGlvbigpe2Zvcih2YXIgZSx0PTA7dDx0aGlzLnF1ZXJpZXMubGVuZ3RoO3QrKyl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO3dpbmRvdy5tYXRjaE1lZGlhKG4udmFsdWUpLm1hdGNoZXMmJihlPW4pfXJldHVyblwib2JqZWN0XCI9PXR5cGVvZiBlP2UubmFtZTplfSxfd2F0Y2hlcjpmdW5jdGlvbigpe3ZhciB0PXRoaXM7ZSh3aW5kb3cpLm9uKFwicmVzaXplLnpmLm1lZGlhcXVlcnlcIixmdW5jdGlvbigpe3ZhciBuPXQuX2dldEN1cnJlbnRTaXplKCkscj10LmN1cnJlbnQ7biE9PXImJih0LmN1cnJlbnQ9bixlKHdpbmRvdykudHJpZ2dlcihcImNoYW5nZWQuemYubWVkaWFxdWVyeVwiLFtuLHJdKSl9KX19O0ZvdW5kYXRpb24uTWVkaWFRdWVyeT1uLHdpbmRvdy5tYXRjaE1lZGlhfHwod2luZG93Lm1hdGNoTWVkaWE9ZnVuY3Rpb24oKXt2YXIgZT13aW5kb3cuc3R5bGVNZWRpYXx8d2luZG93Lm1lZGlhO2lmKCFlKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIiksbj1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXSxyPW51bGw7dC50eXBlPVwidGV4dC9jc3NcIix0LmlkPVwibWF0Y2htZWRpYWpzLXRlc3RcIixuJiZuLnBhcmVudE5vZGUmJm4ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCxuKSxyPVwiZ2V0Q29tcHV0ZWRTdHlsZVwiaW4gd2luZG93JiZ3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0LG51bGwpfHx0LmN1cnJlbnRTdHlsZSxlPXttYXRjaE1lZGl1bTpmdW5jdGlvbihlKXt2YXIgbj1cIkBtZWRpYSBcIitlK1wieyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1cIjtyZXR1cm4gdC5zdHlsZVNoZWV0P3Quc3R5bGVTaGVldC5jc3NUZXh0PW46dC50ZXh0Q29udGVudD1uLFwiMXB4XCI9PT1yLndpZHRofX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybnttYXRjaGVzOmUubWF0Y2hNZWRpdW0odHx8XCJhbGxcIiksbWVkaWE6dHx8XCJhbGxcIn19fSgpKSxGb3VuZGF0aW9uLk1lZGlhUXVlcnk9bn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBNb3Rpb24gbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gICAqL1xuXG4gIHZhciBpbml0Q2xhc3NlcyA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuICB2YXIgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbiAgdmFyIE1vdGlvbiA9IHtcbiAgICBhbmltYXRlSW46IGZ1bmN0aW9uIChlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICAgIH0sXG5cbiAgICBhbmltYXRlT3V0OiBmdW5jdGlvbiAoZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKSB7XG4gICAgdmFyIGFuaW0sXG4gICAgICAgIHByb2csXG4gICAgICAgIHN0YXJ0ID0gbnVsbDtcbiAgICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW92ZSh0cykge1xuICAgICAgaWYgKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgICBpZiAocHJvZyA8IGR1cmF0aW9uKSB7XG4gICAgICAgIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG4gIH1cblxuICAvKipcbiAgICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gICAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICAgIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAgIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gICAgcmVzZXQoKTtcblxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoYW5pbWF0aW9uKS5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgICB9KTtcblxuICAgIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICAgIGVsZW1lbnQuY3NzKCd0cmFuc2l0aW9uJywgJycpLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICAgIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAgIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgICAgcmVzZXQoKTtcbiAgICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGluaXRDbGFzcyArICcgJyArIGFjdGl2ZUNsYXNzICsgJyAnICsgYW5pbWF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBGb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuICBGb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24obil7ZnVuY3Rpb24gaShuLGksZSl7ZnVuY3Rpb24gdChzKXtyfHwocj1zKSxvPXMtcixlLmFwcGx5KGkpLG88bj9hPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCxpKTood2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGEpLGkudHJpZ2dlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pLnRyaWdnZXJIYW5kbGVyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkpfXZhciBhLG8scj1udWxsO3JldHVybiAwPT09bj8oZS5hcHBseShpKSx2b2lkIGkudHJpZ2dlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pLnRyaWdnZXJIYW5kbGVyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkpOnZvaWQoYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQpKX1mdW5jdGlvbiBlKGksZSxvLHIpe2Z1bmN0aW9uIHMoKXtpfHxlLmhpZGUoKSx1KCksciYmci5hcHBseShlKX1mdW5jdGlvbiB1KCl7ZVswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb249MCxlLnJlbW92ZUNsYXNzKGQrXCIgXCIrZitcIiBcIitvKX1pZihlPW4oZSkuZXEoMCksZS5sZW5ndGgpe3ZhciBkPWk/dFswXTp0WzFdLGY9aT9hWzBdOmFbMV07dSgpLGUuYWRkQ2xhc3MobykuY3NzKFwidHJhbnNpdGlvblwiLFwibm9uZVwiKSxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtlLmFkZENsYXNzKGQpLGkmJmUuc2hvdygpfSkscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7ZVswXS5vZmZzZXRXaWR0aCxlLmNzcyhcInRyYW5zaXRpb25cIixcIlwiKS5hZGRDbGFzcyhmKX0pLGUub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlKSxzKX19dmFyIHQ9W1wibXVpLWVudGVyXCIsXCJtdWktbGVhdmVcIl0sYT1bXCJtdWktZW50ZXItYWN0aXZlXCIsXCJtdWktbGVhdmUtYWN0aXZlXCJdLG89e2FuaW1hdGVJbjpmdW5jdGlvbihuLGksdCl7ZSghMCxuLGksdCl9LGFuaW1hdGVPdXQ6ZnVuY3Rpb24obixpLHQpe2UoITEsbixpLHQpfX07Rm91bmRhdGlvbi5Nb3ZlPWksRm91bmRhdGlvbi5Nb3Rpb249b30oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBOZXN0ID0ge1xuICAgIEZlYXRoZXI6IGZ1bmN0aW9uIChtZW51KSB7XG4gICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJ3pmJztcblxuICAgICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeyAncm9sZSc6ICdtZW51aXRlbScgfSksXG4gICAgICAgICAgc3ViTWVudUNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51JyxcbiAgICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICAgIGhhc1N1YkNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgICRpdGVtLmFkZENsYXNzKGhhc1N1YkNsYXNzKS5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRpdGVtLmF0dHIoeyAnYXJpYS1leHBhbmRlZCc6IGZhbHNlIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRzdWIuYWRkQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJHN1Yi5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAgICRpdGVtLmFkZENsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgICBCdXJuOiBmdW5jdGlvbiAobWVudSwgdHlwZSkge1xuICAgICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxuICAgICAgICAgIHN1Ykl0ZW1DbGFzcyA9IHN1Yk1lbnVDbGFzcyArICctaXRlbScsXG4gICAgICAgICAgaGFzU3ViQ2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgbWVudS5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJykucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyAnICsgaGFzU3ViQ2xhc3MgKyAnIGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZScpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KTtcbiAgICB9XG4gIH07XG5cbiAgRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oZSl7dmFyIGE9e0ZlYXRoZXI6ZnVuY3Rpb24oYSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOlwiemZcIjthLmF0dHIoXCJyb2xlXCIsXCJtZW51YmFyXCIpO3ZhciBuPWEuZmluZChcImxpXCIpLmF0dHIoe3JvbGU6XCJtZW51aXRlbVwifSksaT1cImlzLVwiK3QrXCItc3VibWVudVwiLHU9aStcIi1pdGVtXCIscz1cImlzLVwiK3QrXCItc3VibWVudS1wYXJlbnRcIjtuLmVhY2goZnVuY3Rpb24oKXt2YXIgYT1lKHRoaXMpLG49YS5jaGlsZHJlbihcInVsXCIpO24ubGVuZ3RoJiYoYS5hZGRDbGFzcyhzKS5hdHRyKHtcImFyaWEtaGFzcG9wdXBcIjohMCxcImFyaWEtbGFiZWxcIjphLmNoaWxkcmVuKFwiYTpmaXJzdFwiKS50ZXh0KCl9KSxcImRyaWxsZG93blwiPT09dCYmYS5hdHRyKHtcImFyaWEtZXhwYW5kZWRcIjohMX0pLG4uYWRkQ2xhc3MoXCJzdWJtZW51IFwiK2kpLmF0dHIoe1wiZGF0YS1zdWJtZW51XCI6XCJcIixyb2xlOlwibWVudVwifSksXCJkcmlsbGRvd25cIj09PXQmJm4uYXR0cih7XCJhcmlhLWhpZGRlblwiOiEwfSkpLGEucGFyZW50KFwiW2RhdGEtc3VibWVudV1cIikubGVuZ3RoJiZhLmFkZENsYXNzKFwiaXMtc3VibWVudS1pdGVtIFwiK3UpfSl9LEJ1cm46ZnVuY3Rpb24oZSxhKXt2YXIgdD1cImlzLVwiK2ErXCItc3VibWVudVwiLG49dCtcIi1pdGVtXCIsaT1cImlzLVwiK2ErXCItc3VibWVudS1wYXJlbnRcIjtlLmZpbmQoXCI+bGksIC5tZW51LCAubWVudSA+IGxpXCIpLnJlbW92ZUNsYXNzKHQrXCIgXCIrbitcIiBcIitpK1wiIGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZVwiKS5yZW1vdmVBdHRyKFwiZGF0YS1zdWJtZW51XCIpLmNzcyhcImRpc3BsYXlcIixcIlwiKX19O0ZvdW5kYXRpb24uTmVzdD1hfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sXG4gICAgICAgIC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgdGltZXI7XG5cbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZW1haW4gPSAtMTtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pbmZpbml0ZSkge1xuICAgICAgICAgIF90aGlzLnJlc3RhcnQoKTsgLy9yZXJ1biB0aGUgdGltZXIuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJlbWFpbik7XG4gICAgICBlbGVtLnRyaWdnZXIoJ3RpbWVyc3RhcnQuemYuJyArIG5hbWVTcGFjZSk7XG4gICAgfTtcblxuICAgIHRoaXMucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnBhdXNlZC56Zi4nICsgbmFtZVNwYWNlKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICAgKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAgICovXG4gIGZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHVubG9hZGVkID0gaW1hZ2VzLmxlbmd0aDtcblxuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBpbWFnZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gNCB8fCB0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH1cbiAgICAgIC8vIEZvcmNlIGxvYWQgdGhlIGltYWdlXG4gICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBmaXggZm9yIElFLiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9qcXVlcnkvZml4aW5nLWxvYWQtaW4taWUtZm9yLWNhY2hlZC1pbWFnZXMvXG4gICAgICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICAgICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNpbmdsZUltYWdlTG9hZGVkKCkge1xuICAgICAgdW5sb2FkZWQtLTtcbiAgICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbiAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQsZSxpKXt2YXIgYSxzLG49dGhpcyxyPWUuZHVyYXRpb24sbz1PYmplY3Qua2V5cyh0LmRhdGEoKSlbMF18fFwidGltZXJcIix1PS0xO3RoaXMuaXNQYXVzZWQ9ITEsdGhpcy5yZXN0YXJ0PWZ1bmN0aW9uKCl7dT0tMSxjbGVhclRpbWVvdXQocyksdGhpcy5zdGFydCgpfSx0aGlzLnN0YXJ0PWZ1bmN0aW9uKCl7dGhpcy5pc1BhdXNlZD0hMSxjbGVhclRpbWVvdXQocyksdT11PD0wP3I6dSx0LmRhdGEoXCJwYXVzZWRcIiwhMSksYT1EYXRlLm5vdygpLHM9c2V0VGltZW91dChmdW5jdGlvbigpe2UuaW5maW5pdGUmJm4ucmVzdGFydCgpLGkmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGkmJmkoKX0sdSksdC50cmlnZ2VyKFwidGltZXJzdGFydC56Zi5cIitvKX0sdGhpcy5wYXVzZT1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITAsY2xlYXJUaW1lb3V0KHMpLHQuZGF0YShcInBhdXNlZFwiLCEwKTt2YXIgZT1EYXRlLm5vdygpO3UtPWUtYSx0LnRyaWdnZXIoXCJ0aW1lcnBhdXNlZC56Zi5cIitvKX19ZnVuY3Rpb24gaShlLGkpe2Z1bmN0aW9uIGEoKXtzLS0sMD09PXMmJmkoKX12YXIgcz1lLmxlbmd0aDswPT09cyYmaSgpLGUuZWFjaChmdW5jdGlvbigpe2lmKHRoaXMuY29tcGxldGV8fDQ9PT10aGlzLnJlYWR5U3RhdGV8fFwiY29tcGxldGVcIj09PXRoaXMucmVhZHlTdGF0ZSlhKCk7ZWxzZXt2YXIgZT10KHRoaXMpLmF0dHIoXCJzcmNcIik7dCh0aGlzKS5hdHRyKFwic3JjXCIsZSsoZS5pbmRleE9mKFwiP1wiKT49MD9cIiZcIjpcIj9cIikrKG5ldyBEYXRlKS5nZXRUaW1lKCkpLHQodGhpcykub25lKFwibG9hZFwiLGZ1bmN0aW9uKCl7YSgpfSl9fSl9Rm91bmRhdGlvbi5UaW1lcj1lLEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQ9aX0oalF1ZXJ5KTsiLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24gKCQpIHtcblxuXHQkLnNwb3RTd2lwZSA9IHtcblx0XHR2ZXJzaW9uOiAnMS4wLjAnLFxuXHRcdGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHRwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG5cdFx0bW92ZVRocmVzaG9sZDogNzUsXG5cdFx0dGltZVRocmVzaG9sZDogMjAwXG5cdH07XG5cblx0dmFyIHN0YXJ0UG9zWCxcblx0ICAgIHN0YXJ0UG9zWSxcblx0ICAgIHN0YXJ0VGltZSxcblx0ICAgIGVsYXBzZWRUaW1lLFxuXHQgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuXHRmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuXHRcdC8vICBhbGVydCh0aGlzKTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG5cdFx0aXNNb3ZpbmcgPSBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcblx0XHRpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdFx0aWYgKGlzTW92aW5nKSB7XG5cdFx0XHR2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcblx0XHRcdHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuXHRcdFx0dmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcblx0XHRcdHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG5cdFx0XHR2YXIgZGlyO1xuXHRcdFx0ZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcblx0XHRcdGlmIChNYXRoLmFicyhkeCkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG5cdFx0XHRcdGRpciA9IGR4ID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG5cdFx0XHR9XG5cdFx0XHQvLyBlbHNlIGlmKE1hdGguYWJzKGR5KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcblx0XHRcdC8vICAgZGlyID0gZHkgPiAwID8gJ2Rvd24nIDogJ3VwJztcblx0XHRcdC8vIH1cblx0XHRcdGlmIChkaXIpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRvblRvdWNoRW5kLmNhbGwodGhpcyk7XG5cdFx0XHRcdCQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoJ3N3aXBlJyArIGRpcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcblx0XHRpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG5cdFx0XHRzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG5cdFx0XHRpc01vdmluZyA9IHRydWU7XG5cdFx0XHRzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdH1cblxuXHRmdW5jdGlvbiB0ZWFyZG93bigpIHtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuXHR9XG5cblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG5cdCQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG5cdFx0JC5ldmVudC5zcGVjaWFsWydzd2lwZScgKyB0aGlzXSA9IHsgc2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuXHRcdFx0fSB9O1xuXHR9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24gKCQpIHtcblx0JC5mbi5hZGRUb3VjaCA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG5cdFx0XHQkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG5cdFx0XHRcdC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3Rcblx0XHRcdFx0aGFuZGxlVG91Y2goZXZlbnQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG5cdFx0XHQgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuXHRcdFx0ICAgIGV2ZW50VHlwZXMgPSB7XG5cdFx0XHRcdHRvdWNoc3RhcnQ6ICdtb3VzZWRvd24nLFxuXHRcdFx0XHR0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuXHRcdFx0XHR0b3VjaGVuZDogJ21vdXNldXAnXG5cdFx0XHR9LFxuXHRcdFx0ICAgIHR5cGUgPSBldmVudFR5cGVzW2V2ZW50LnR5cGVdLFxuXHRcdFx0ICAgIHNpbXVsYXRlZEV2ZW50O1xuXG5cdFx0XHRpZiAoJ01vdXNlRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQgPSBuZXcgd2luZG93Lk1vdXNlRXZlbnQodHlwZSwge1xuXHRcdFx0XHRcdCdidWJibGVzJzogdHJ1ZSxcblx0XHRcdFx0XHQnY2FuY2VsYWJsZSc6IHRydWUsXG5cdFx0XHRcdFx0J3NjcmVlblgnOiBmaXJzdC5zY3JlZW5YLFxuXHRcdFx0XHRcdCdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcblx0XHRcdFx0XHQnY2xpZW50WCc6IGZpcnN0LmNsaWVudFgsXG5cdFx0XHRcdFx0J2NsaWVudFknOiBmaXJzdC5jbGllbnRZXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuXHRcdFx0XHRzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwIC8qbGVmdCovLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcblx0XHR9O1xuXHR9O1xufShqUXVlcnkpO1xuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovIiwiIWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixuKSx0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHQpLHI9ITF9ZnVuY3Rpb24gbihuKXtpZihlLnNwb3RTd2lwZS5wcmV2ZW50RGVmYXVsdCYmbi5wcmV2ZW50RGVmYXVsdCgpLHIpe3ZhciBvLGk9bi50b3VjaGVzWzBdLnBhZ2VYLGM9KG4udG91Y2hlc1swXS5wYWdlWSxzLWkpO2g9KG5ldyBEYXRlKS5nZXRUaW1lKCktdSxNYXRoLmFicyhjKT49ZS5zcG90U3dpcGUubW92ZVRocmVzaG9sZCYmaDw9ZS5zcG90U3dpcGUudGltZVRocmVzaG9sZCYmKG89Yz4wP1wibGVmdFwiOlwicmlnaHRcIiksbyYmKG4ucHJldmVudERlZmF1bHQoKSx0LmNhbGwodGhpcyksZSh0aGlzKS50cmlnZ2VyKFwic3dpcGVcIixvKS50cmlnZ2VyKFwic3dpcGVcIitvKSl9fWZ1bmN0aW9uIG8oZSl7MT09ZS50b3VjaGVzLmxlbmd0aCYmKHM9ZS50b3VjaGVzWzBdLnBhZ2VYLGM9ZS50b3VjaGVzWzBdLnBhZ2VZLHI9ITAsdT0obmV3IERhdGUpLmdldFRpbWUoKSx0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixuLCExKSx0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHQsITEpKX1mdW5jdGlvbiBpKCl7dGhpcy5hZGRFdmVudExpc3RlbmVyJiZ0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsbywhMSl9ZS5zcG90U3dpcGU9e3ZlcnNpb246XCIxLjAuMFwiLGVuYWJsZWQ6XCJvbnRvdWNoc3RhcnRcImluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxwcmV2ZW50RGVmYXVsdDohMSxtb3ZlVGhyZXNob2xkOjc1LHRpbWVUaHJlc2hvbGQ6MjAwfTt2YXIgcyxjLHUsaCxyPSExO2UuZXZlbnQuc3BlY2lhbC5zd2lwZT17c2V0dXA6aX0sZS5lYWNoKFtcImxlZnRcIixcInVwXCIsXCJkb3duXCIsXCJyaWdodFwiXSxmdW5jdGlvbigpe2UuZXZlbnQuc3BlY2lhbFtcInN3aXBlXCIrdGhpc109e3NldHVwOmZ1bmN0aW9uKCl7ZSh0aGlzKS5vbihcInN3aXBlXCIsZS5ub29wKX19fSl9KGpRdWVyeSksIWZ1bmN0aW9uKGUpe2UuZm4uYWRkVG91Y2g9ZnVuY3Rpb24oKXt0aGlzLmVhY2goZnVuY3Rpb24obixvKXtlKG8pLmJpbmQoXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbFwiLGZ1bmN0aW9uKCl7dChldmVudCl9KX0pO3ZhciB0PWZ1bmN0aW9uKGUpe3ZhciB0LG49ZS5jaGFuZ2VkVG91Y2hlcyxvPW5bMF0saT17dG91Y2hzdGFydDpcIm1vdXNlZG93blwiLHRvdWNobW92ZTpcIm1vdXNlbW92ZVwiLHRvdWNoZW5kOlwibW91c2V1cFwifSxzPWlbZS50eXBlXTtcIk1vdXNlRXZlbnRcImluIHdpbmRvdyYmXCJmdW5jdGlvblwiPT10eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQ/dD1uZXcgd2luZG93Lk1vdXNlRXZlbnQocyx7YnViYmxlczohMCxjYW5jZWxhYmxlOiEwLHNjcmVlblg6by5zY3JlZW5YLHNjcmVlblk6by5zY3JlZW5ZLGNsaWVudFg6by5jbGllbnRYLGNsaWVudFk6by5jbGllbnRZfSk6KHQ9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50XCIpLHQuaW5pdE1vdXNlRXZlbnQocywhMCwhMCx3aW5kb3csMSxvLnNjcmVlblgsby5zY3JlZW5ZLG8uY2xpZW50WCxvLmNsaWVudFksITEsITEsITEsITEsMCxudWxsKSksby50YXJnZXQuZGlzcGF0Y2hFdmVudCh0KX19fShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuICAgICAgICByZXR1cm4gd2luZG93W3ByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KCk7XG5cbiAgdmFyIHRyaWdnZXJzID0gZnVuY3Rpb24gKGVsLCB0eXBlKSB7XG4gICAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGlkKSB7XG4gICAgICAkKCcjJyArIGlkKVt0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10odHlwZSArICcuemYudHJpZ2dlcicsIFtlbF0pO1xuICAgIH0pO1xuICB9O1xuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uICgpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xuICB9KTtcblxuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAvLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gICAgaWYgKGlkKSB7XG4gICAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykudHJpZ2dlcigndG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiAgJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHZhciBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgICBpZiAoYW5pbWF0aW9uICE9PSAnJykge1xuICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICAgJCgnIycgKyBpZCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbiAgfSk7XG5cbiAgLyoqXG4gICogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuICAqIEBmdW5jdGlvblxuICAqIEBwcml2YXRlXG4gICovXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjaGVja0xpc3RlbmVycygpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgICBldmVudHNMaXN0ZW5lcigpO1xuICAgIHJlc2l6ZUxpc3RlbmVyKCk7XG4gICAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgICBtdXRhdGVMaXN0ZW5lcigpO1xuICAgIGNsb3NlbWVMaXN0ZW5lcigpO1xuICB9XG5cbiAgLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuICBmdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICAgIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gICAgaWYgKHBsdWdpbk5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHlldGlCb3hlcy5sZW5ndGgpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiAnY2xvc2VtZS56Zi4nICsgbmFtZTtcbiAgICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24gKGUsIHBsdWdpbklkKSB7XG4gICAgICAgIHZhciBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgICB2YXIgcGx1Z2lucyA9ICQoJ1tkYXRhLScgKyBwbHVnaW4gKyAnXScpLm5vdCgnW2RhdGEteWV0aS1ib3g9XCInICsgcGx1Z2luSWQgKyAnXCJdJyk7XG5cbiAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIHZhciB0aW1lciA9IHZvaWQgMCxcbiAgICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsgLy9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKSB7XG4gICAgdmFyIHRpbWVyID0gdm9pZCAwLFxuICAgICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJykub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIC8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgICAgfSwgZGVib3VuY2UgfHwgMTApOyAvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbXV0YXRlTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICB2YXIgJG5vZGVzID0gJCgnW2RhdGEtbXV0YXRlXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoICYmIE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBtdXRhdGUgZXZlbnRcbiAgICAgIC8vbm8gSUUgOSBvciAxMFxuICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gICAgLy9lbGVtZW50IGNhbGxiYWNrXG4gICAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuICAgICAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuICAgICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLCBcIm11dGF0ZVwiKTtcbiAgICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFtQSF1cbiAgLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbiAgRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuICAvLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbiAgLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXtvKCksYSgpLGkoKSxuKCkscigpfWZ1bmN0aW9uIHIoZSl7dmFyIHI9dChcIltkYXRhLXlldGktYm94XVwiKSxhPVtcImRyb3Bkb3duXCIsXCJ0b29sdGlwXCIsXCJyZXZlYWxcIl07aWYoZSYmKFwic3RyaW5nXCI9PXR5cGVvZiBlP2EucHVzaChlKTpcIm9iamVjdFwiPT10eXBlb2YgZSYmXCJzdHJpbmdcIj09dHlwZW9mIGVbMF0/YS5jb25jYXQoZSk6Y29uc29sZS5lcnJvcihcIlBsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3NcIikpLHIubGVuZ3RoKXt2YXIgaT1hLm1hcChmdW5jdGlvbih0KXtyZXR1cm5cImNsb3NlbWUuemYuXCIrdH0pLmpvaW4oXCIgXCIpO3Qod2luZG93KS5vZmYoaSkub24oaSxmdW5jdGlvbihlLHIpe3ZhciBhPWUubmFtZXNwYWNlLnNwbGl0KFwiLlwiKVswXSxpPXQoXCJbZGF0YS1cIithK1wiXVwiKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJytyKydcIl0nKTtpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO2UudHJpZ2dlckhhbmRsZXIoXCJjbG9zZS56Zi50cmlnZ2VyXCIsW2VdKX0pfSl9fWZ1bmN0aW9uIGEoZSl7dmFyIHI9dm9pZCAwLGE9dChcIltkYXRhLXJlc2l6ZV1cIik7YS5sZW5ndGgmJnQod2luZG93KS5vZmYoXCJyZXNpemUuemYudHJpZ2dlclwiKS5vbihcInJlc2l6ZS56Zi50cmlnZ2VyXCIsZnVuY3Rpb24oaSl7ciYmY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe2d8fGEuZWFjaChmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlckhhbmRsZXIoXCJyZXNpemVtZS56Zi50cmlnZ2VyXCIpfSksYS5hdHRyKFwiZGF0YS1ldmVudHNcIixcInJlc2l6ZVwiKX0sZXx8MTApfSl9ZnVuY3Rpb24gaShlKXt2YXIgcj12b2lkIDAsYT10KFwiW2RhdGEtc2Nyb2xsXVwiKTthLmxlbmd0aCYmdCh3aW5kb3cpLm9mZihcInNjcm9sbC56Zi50cmlnZ2VyXCIpLm9uKFwic2Nyb2xsLnpmLnRyaWdnZXJcIixmdW5jdGlvbihpKXtyJiZjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Z3x8YS5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VySGFuZGxlcihcInNjcm9sbG1lLnpmLnRyaWdnZXJcIil9KSxhLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwic2Nyb2xsXCIpfSxlfHwxMCl9KX1mdW5jdGlvbiBuKGUpe3ZhciByPXQoXCJbZGF0YS1tdXRhdGVdXCIpO3IubGVuZ3RoJiZnJiZyLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiKX0pfWZ1bmN0aW9uIG8oKXtpZighZylyZXR1cm4hMTt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXVwiKSxyPWZ1bmN0aW9uKGUpe3ZhciByPXQoZVswXS50YXJnZXQpO3N3aXRjaChlWzBdLnR5cGUpe2Nhc2VcImF0dHJpYnV0ZXNcIjpcInNjcm9sbFwiPT09ci5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmci50cmlnZ2VySGFuZGxlcihcInNjcm9sbG1lLnpmLnRyaWdnZXJcIixbcix3aW5kb3cucGFnZVlPZmZzZXRdKSxcInJlc2l6ZVwiPT09ci5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmci50cmlnZ2VySGFuZGxlcihcInJlc2l6ZW1lLnpmLnRyaWdnZXJcIixbcl0pLFwic3R5bGVcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmKHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIiksci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIixbci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pKTticmVhaztjYXNlXCJjaGlsZExpc3RcIjpyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpLHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIsW3IuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTticmVhaztkZWZhdWx0OnJldHVybiExfX07aWYoZS5sZW5ndGgpZm9yKHZhciBhPTA7YTw9ZS5sZW5ndGgtMTthKyspe3ZhciBpPW5ldyBnKHIpO2kub2JzZXJ2ZShlW2FdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxjaGFyYWN0ZXJEYXRhOiExLHN1YnRyZWU6ITAsYXR0cmlidXRlRmlsdGVyOltcImRhdGEtZXZlbnRzXCIsXCJzdHlsZVwiXX0pfX12YXIgZz1mdW5jdGlvbigpe2Zvcih2YXIgdD1bXCJXZWJLaXRcIixcIk1velwiLFwiT1wiLFwiTXNcIixcIlwiXSxlPTA7ZTx0Lmxlbmd0aDtlKyspaWYodFtlXStcIk11dGF0aW9uT2JzZXJ2ZXJcImluIHdpbmRvdylyZXR1cm4gd2luZG93W3RbZV0rXCJNdXRhdGlvbk9ic2VydmVyXCJdO3JldHVybiExfSgpLHM9ZnVuY3Rpb24oZSxyKXtlLmRhdGEocikuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oYSl7dChcIiNcIithKVtcImNsb3NlXCI9PT1yP1widHJpZ2dlclwiOlwidHJpZ2dlckhhbmRsZXJcIl0ocitcIi56Zi50cmlnZ2VyXCIsW2VdKX0pfTt0KGRvY3VtZW50KS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLW9wZW5dXCIsZnVuY3Rpb24oKXtzKHQodGhpcyksXCJvcGVuXCIpfSksdChkb2N1bWVudCkub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS1jbG9zZV1cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcImNsb3NlXCIpO2U/cyh0KHRoaXMpLFwiY2xvc2VcIik6dCh0aGlzKS50cmlnZ2VyKFwiY2xvc2UuemYudHJpZ2dlclwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xpY2suemYudHJpZ2dlclwiLFwiW2RhdGEtdG9nZ2xlXVwiLGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKS5kYXRhKFwidG9nZ2xlXCIpO2U/cyh0KHRoaXMpLFwidG9nZ2xlXCIpOnQodGhpcykudHJpZ2dlcihcInRvZ2dsZS56Zi50cmlnZ2VyXCIpfSksdChkb2N1bWVudCkub24oXCJjbG9zZS56Zi50cmlnZ2VyXCIsXCJbZGF0YS1jbG9zYWJsZV1cIixmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciByPXQodGhpcykuZGF0YShcImNsb3NhYmxlXCIpO1wiXCIhPT1yP0ZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodCh0aGlzKSxyLGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VyKFwiY2xvc2VkLnpmXCIpfSk6dCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcihcImNsb3NlZC56ZlwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZS1mb2N1c11cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcInRvZ2dsZS1mb2N1c1wiKTt0KFwiI1wiK2UpLnRyaWdnZXJIYW5kbGVyKFwidG9nZ2xlLnpmLnRyaWdnZXJcIixbdCh0aGlzKV0pfSksdCh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgpfSksRm91bmRhdGlvbi5JSGVhcllvdT1lfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIERyb3Bkb3duTWVudSBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcm9wZG93bi1tZW51XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5uZXN0XG4gICAqL1xuXG4gIHZhciBEcm9wZG93bk1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIERyb3Bkb3duTWVudSNpbml0XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIERyb3Bkb3duTWVudShlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcGRvd25NZW51KTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0Ryb3Bkb3duTWVudScsIHtcbiAgICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICAgJ0FSUk9XX1VQJzogJ3VwJyxcbiAgICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoRHJvcGRvd25NZW51LCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3MoJ2ZpcnN0LXN1YicpO1xuXG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgICAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgICAgICB0aGlzLiR0YWJzLmZpbmQoJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudmVydGljYWxDbGFzcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5vcHRpb25zLnJpZ2h0Q2xhc3MpIHx8IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdyaWdodCcgfHwgRm91bmRhdGlvbi5ydGwoKSB8fCB0aGlzLiRlbGVtZW50LnBhcmVudHMoJy50b3AtYmFyLXJpZ2h0JykuaXMoJyonKSkge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgICAgIHN1YnMuYWRkQ2xhc3MoJ29wZW5zLWxlZnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaXNWZXJ0aWNhbCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2lzVmVydGljYWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiR0YWJzLmNzcygnZGlzcGxheScpID09PSAnYmxvY2snO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGVsZW1lbnRzIHdpdGhpbiB0aGUgbWVudVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgdHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgICAgcGFyQ2xhc3MgPSAnaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnO1xuXG4gICAgICAgIC8vIHVzZWQgZm9yIG9uQ2xpY2sgYW5kIGluIHRoZSBrZXlib2FyZCBoYW5kbGVyc1xuICAgICAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRlbGVtID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICcuJyArIHBhckNsYXNzKSxcbiAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpLFxuICAgICAgICAgICAgICBoYXNDbGlja2VkID0gJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScsXG4gICAgICAgICAgICAgICRzdWIgPSAkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcblxuICAgICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICAgIGlmIChoYXNDbGlja2VkKSB7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgfHwgIV90aGlzLm9wdGlvbnMuY2xpY2tPcGVuICYmICFoYXNUb3VjaCB8fCBfdGhpcy5vcHRpb25zLmZvcmNlRm9sbG93ICYmIGhhc1RvdWNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAgICAgJGVsZW0uYWRkKCRlbGVtLnBhcmVudHNVbnRpbChfdGhpcy4kZWxlbWVudCwgJy4nICsgcGFyQ2xhc3MpKS5hdHRyKCdkYXRhLWlzLWNsaWNrJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tPcGVuIHx8IGhhc1RvdWNoKSB7XG4gICAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBoYW5kbGVDbGlja0ZuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBMZWFmIGVsZW1lbnQgQ2xpY2tzXG4gICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsb3NlT25DbGlja0luc2lkZSkge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKCFoYXNTdWIpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcikge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykpO1xuICAgICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgICAgICBpZiAoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKSB7XG4gICAgICAgICAgICAgIGlmICgkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyAmJiBfdGhpcy5vcHRpb25zLmNsaWNrT3Blbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5jbG9zaW5nVGltZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbigna2V5ZG93bi56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnW3JvbGU9XCJtZW51aXRlbVwiXScpLFxuICAgICAgICAgICAgICBpc1RhYiA9IF90aGlzLiR0YWJzLmluZGV4KCRlbGVtZW50KSA+IC0xLFxuICAgICAgICAgICAgICAkZWxlbWVudHMgPSBpc1RhYiA/IF90aGlzLiR0YWJzIDogJGVsZW1lbnQuc2libGluZ3MoJ2xpJykuYWRkKCRlbGVtZW50KSxcbiAgICAgICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShpIC0gMSk7XG4gICAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShpICsgMSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzpsYXN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgICAgJG5leHRFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByZXZTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICAgICBvcGVuU3ViID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRzdWIgPSAkZWxlbWVudC5jaGlsZHJlbigndWwuaXMtZHJvcGRvd24tc3VibWVudScpO1xuICAgICAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCdsaSA+IGE6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2xvc2VTdWIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvL2lmICgkZWxlbWVudC5pcygnOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgIHZhciBjbG9zZSA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJyk7XG4gICAgICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICBfdGhpcy5faGlkZShjbG9zZSk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICAgICAgICBvcGVuOiBvcGVuU3ViLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoX3RoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgICAgICBfdGhpcy4kbWVudUl0ZW1zLmZpbmQoJ2E6Zmlyc3QnKS5mb2N1cygpOyAvLyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChpc1RhYikge1xuICAgICAgICAgICAgaWYgKF90aGlzLl9pc1ZlcnRpY2FsKCkpIHtcbiAgICAgICAgICAgICAgLy8gdmVydGljYWwgbWVudVxuICAgICAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkge1xuICAgICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGhvcml6b250YWwgbWVudVxuICAgICAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkge1xuICAgICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIG5leHQ6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgbmV4dDogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbm90IHRhYnMgLT4gb25lIHN1YlxuICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcbiAgICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YixcbiAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhbiBldmVudCBoYW5kbGVyIHRvIHRoZSBib2R5IHRvIGNsb3NlIGFueSBkcm9wZG93bnMgb24gYSBjbGljay5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2FkZEJvZHlIYW5kbGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYWRkQm9keUhhbmRsZXIoKSB7XG4gICAgICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jykub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRsaW5rID0gX3RoaXMuJGVsZW1lbnQuZmluZChlLnRhcmdldCk7XG4gICAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3BlbnMgYSBkcm9wZG93biBwYW5lLCBhbmQgY2hlY2tzIGZvciBjb2xsaXNpb25zIGZpcnN0LlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc2hvdycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Nob3coJHN1Yikge1xuICAgICAgICB2YXIgaWR4ID0gdGhpcy4kdGFicy5pbmRleCh0aGlzLiR0YWJzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICByZXR1cm4gJChlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgICAgICB9KSk7XG4gICAgICAgIHZhciAkc2licyA9ICRzdWIucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLnNpYmxpbmdzKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5hZGRDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJykucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgdmFyIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcbiAgICAgICAgICAgICAgJHBhcmVudExpID0gJHN1Yi5wYXJlbnQoJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMnICsgb2xkQ2xhc3MpLmFkZENsYXNzKCdvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCk7XG4gICAgICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgICAgIGlmICghY2xlYXIpIHtcbiAgICAgICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy1pbm5lcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJycpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljaykge1xuICAgICAgICAgIHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG5ldyBkcm9wZG93biBwYW5lIGlzIHZpc2libGUuXG4gICAgICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3dubWVudScsIFskc3ViXSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGlkZXMgYSBzaW5nbGUsIGN1cnJlbnRseSBvcGVuIGRyb3Bkb3duIHBhbmUsIGlmIHBhc3NlZCBhIHBhcmFtZXRlciwgb3RoZXJ3aXNlLCBoaWRlcyBldmVyeXRoaW5nLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIGhpZGVcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBpbmRleCBvZiB0aGUgJHRhYnMgY29sbGVjdGlvbiB0byBoaWRlXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaGlkZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hpZGUoJGVsZW0sIGlkeCkge1xuICAgICAgICB2YXIgJHRvQ2xvc2U7XG4gICAgICAgIGlmICgkZWxlbSAmJiAkZWxlbS5sZW5ndGgpIHtcbiAgICAgICAgICAkdG9DbG9zZSA9ICRlbGVtO1xuICAgICAgICB9IGVsc2UgaWYgKGlkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSB0aGlzLiR0YWJzLm5vdChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBpID09PSBpZHg7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHZhciBzb21ldGhpbmdUb0Nsb3NlID0gJHRvQ2xvc2UuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpIHx8ICR0b0Nsb3NlLmZpbmQoJy5pcy1hY3RpdmUnKS5sZW5ndGggPiAwO1xuXG4gICAgICAgIGlmIChzb21ldGhpbmdUb0Nsb3NlKSB7XG4gICAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLWlzLWNsaWNrJzogZmFsc2VcbiAgICAgICAgICB9KS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5yZW1vdmVDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZiAodGhpcy5jaGFuZ2VkIHx8ICR0b0Nsb3NlLmZpbmQoJ29wZW5zLWlubmVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGQoJHRvQ2xvc2UpLnJlbW92ZUNsYXNzKCdvcGVucy1pbm5lciBvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCkuYWRkQ2xhc3MoJ29wZW5zLScgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb3BlbiBtZW51cyBhcmUgY2xvc2VkLlxuICAgICAgICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjaGlkZVxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bm1lbnUnLCBbJHRvQ2xvc2VdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9mZignLnpmLmRyb3Bkb3dubWVudScpLnJlbW92ZUF0dHIoJ2RhdGEtaXMtY2xpY2snKS5yZW1vdmVDbGFzcygnaXMtcmlnaHQtYXJyb3cgaXMtbGVmdC1hcnJvdyBpcy1kb3duLWFycm93IG9wZW5zLXJpZ2h0IG9wZW5zLWxlZnQgb3BlbnMtaW5uZXInKTtcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRHJvcGRvd25NZW51O1xuICB9KCk7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICAgKi9cblxuXG4gIERyb3Bkb3duTWVudS5kZWZhdWx0cyA9IHtcbiAgICAvKipcbiAgICAgKiBEaXNhbGxvd3MgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyBzdWJtZW51c1xuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gICAgLyoqXG4gICAgICogQWxsb3cgYSBzdWJtZW51IHRvIGF1dG9tYXRpY2FsbHkgY2xvc2Ugb24gYSBtb3VzZWxlYXZlIGV2ZW50LCBpZiBub3QgY2xpY2tlZCBvcGVuLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgYXV0b2Nsb3NlOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IG9wZW5pbmcgYSBzdWJtZW51IG9uIGhvdmVyIGV2ZW50LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDUwXG4gICAgICovXG4gICAgaG92ZXJEZWxheTogNTAsXG4gICAgLyoqXG4gICAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBjbG9zaW5nIGEgc3VibWVudSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGRlZmF1bHQgNTAwXG4gICAgICovXG5cbiAgICBjbG9zaW5nVGltZTogNTAwLFxuICAgIC8qKlxuICAgICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy4gQ2FuIGJlIGAnbGVmdCdgIG9yIGAncmlnaHQnYC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnbGVmdCdcbiAgICAgKi9cbiAgICBhbGlnbm1lbnQ6ICdsZWZ0JyxcbiAgICAvKipcbiAgICAgKiBBbGxvdyBjbGlja3Mgb24gdGhlIGJvZHkgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gICAgLyoqXG4gICAgICogQWxsb3cgY2xpY2tzIG9uIGxlYWYgYW5jaG9yIGxpbmtzIHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY2xvc2VPbkNsaWNrSW5zaWRlOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAndmVydGljYWwnXG4gICAgICovXG4gICAgdmVydGljYWxDbGFzczogJ3ZlcnRpY2FsJyxcbiAgICAvKipcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHJpZ2h0LXNpZGUgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgYWxpZ24tcmlnaHRgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnYWxpZ24tcmlnaHQnXG4gICAgICovXG4gICAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgICAvKipcbiAgICAgKiBCb29sZWFuIHRvIGZvcmNlIG92ZXJpZGUgdGhlIGNsaWNraW5nIG9mIGxpbmtzIHRvIHBlcmZvcm0gZGVmYXVsdCBhY3Rpb24sIG9uIHNlY29uZCB0b3VjaCBldmVudCBmb3IgbW9iaWxlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZm9yY2VGb2xsb3c6IHRydWVcbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93bk1lbnUsICdEcm9wZG93bk1lbnUnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBPZmZDYW52YXMgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAgICovXG5cbiAgdmFyIE9mZkNhbnZhcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gT2ZmQ2FudmFzKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBPZmZDYW52YXMpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xuICAgICAgdGhpcy4kdHJpZ2dlcnMgPSAkKCk7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09mZkNhbnZhcycsIHtcbiAgICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKE9mZkNhbnZhcywgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLXRyYW5zaXRpb24tJyArIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uKTtcblxuICAgICAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgICAgICB0aGlzLiR0cmlnZ2VycyA9ICQoZG9jdW1lbnQpLmZpbmQoJ1tkYXRhLW9wZW49XCInICsgaWQgKyAnXCJdLCBbZGF0YS1jbG9zZT1cIicgKyBpZCArICdcIl0sIFtkYXRhLXRvZ2dsZT1cIicgKyBpZCArICdcIl0nKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJykuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcblxuICAgICAgICAvLyBBZGQgYW4gb3ZlcmxheSBvdmVyIHRoZSBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB2YXIgb3ZlcmxheVBvc2l0aW9uID0gJCh0aGlzLiRlbGVtZW50KS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ2ZpeGVkJyA/ICdpcy1vdmVybGF5LWZpeGVkJyA6ICdpcy1vdmVybGF5LWFic29sdXRlJztcbiAgICAgICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgICAgICAgIGlmIChvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XG4gICAgICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICAgICAna2V5ZG93bi56Zi5vZmZjYW52YXMnOiB0aGlzLl9oYW5kbGVLZXlib2FyZC5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICAgICAgdmFyICR0YXJnZXQgPSB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPyB0aGlzLiRvdmVybGF5IDogJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpO1xuICAgICAgICAgICR0YXJnZXQub24oeyAnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQXBwbGllcyBldmVudCBsaXN0ZW5lciBmb3IgZWxlbWVudHMgdGhhdCB3aWxsIHJldmVhbCBhdCBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3NldE1RQ2hlY2tlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldE1RQ2hlY2tlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uZSgnbG9hZC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNSZXZlYWxlZCAtIHRydWUgaWYgZWxlbWVudCBzaG91bGQgYmUgcmV2ZWFsZWQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmV2ZWFsJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgICAgICB2YXIgJGNsb3NlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtY2xvc2VdJyk7XG4gICAgICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICRjbG9zZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcylcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICRjbG9zZXIuc2hvdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFN0b3BzIHNjcm9sbGluZyBvZiB0aGUgYm9keSB3aGVuIG9mZmNhbnZhcyBpcyBvcGVuIG9uIG1vYmlsZSBTYWZhcmkgYW5kIG90aGVyIHRyb3VibGVzb21lIGJyb3dzZXJzLlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3N0b3BTY3JvbGxpbmcnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgICAgIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19yZWNvcmRTY3JvbGxhYmxlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVjb3JkU2Nyb2xsYWJsZShldmVudCkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgICAgICBpZiAoZWxlbS5zY3JvbGxIZWlnaHQgIT09IGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIHRvcCwgc2Nyb2xsIGRvd24gb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyB1cFxuICAgICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbGVtLmFsbG93VXAgPSBlbGVtLnNjcm9sbFRvcCA+IDA7XG4gICAgICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0O1xuICAgICAgICBlbGVtLmxhc3RZID0gZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc3RvcFNjcm9sbFByb3BhZ2F0aW9uJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG4gICAgICAgIHZhciB1cCA9IGV2ZW50LnBhZ2VZIDwgZWxlbS5sYXN0WTtcbiAgICAgICAgdmFyIGRvd24gPSAhdXA7XG4gICAgICAgIGVsZW0ubGFzdFkgPSBldmVudC5wYWdlWTtcblxuICAgICAgICBpZiAodXAgJiYgZWxlbS5hbGxvd1VwIHx8IGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pIHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvcGVuJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAnYm90dG9tJykge1xuICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpLnRyaWdnZXIoJ29wZW5lZC56Zi5vZmZjYW52YXMnKTtcblxuICAgICAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQodGhpcy4kZWxlbWVudCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgICAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnY2xvc2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKGNiKSB7XG4gICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgICAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3RvZ2dsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19oYW5kbGVLZXlib2FyZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09mZkNhbnZhcycsIHtcbiAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLmNsb3NlKCk7XG4gICAgICAgICAgICBfdGhpczIuJGxhc3RUcmlnZ2VyLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBPZmZDYW52YXM7XG4gIH0oKTtcblxuICBPZmZDYW52YXMuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gb3ZlcmxheSBvbiB0b3Agb2YgYFtkYXRhLW9mZi1jYW52YXMtY29udGVudF1gLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY29udGVudE92ZXJsYXk6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNvbnRlbnRTY3JvbGw6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKi9cbiAgICB0cmFuc2l0aW9uVGltZTogMCxcblxuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBwdXNoXG4gICAgICovXG4gICAgdHJhbnNpdGlvbjogJ3B1c2gnLFxuXG4gICAgLyoqXG4gICAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvciBib3R0b20gb24gb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUgez9zdHJpbmd9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIGZvcmNlVG86IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICByZXZlYWxPbjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcmV2ZWFsLWZvci1cbiAgICAgKiBAdG9kbyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgICAqL1xuICAgIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHRyYXBGb2N1czogZmFsc2VcbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICAgKi9cblxuICB2YXIgUmVzcG9uc2l2ZU1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgbWVudS5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSZXNwb25zaXZlTWVudShlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVzcG9uc2l2ZU1lbnUpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbnVsbDtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Jlc3BvbnNpdmVNZW51Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIE1lbnUgYnkgcGFyc2luZyB0aGUgY2xhc3NlcyBmcm9tIHRoZSAnZGF0YS1SZXNwb25zaXZlTWVudScgYXR0cmlidXRlIG9uIHRoZSBlbGVtZW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhSZXNwb25zaXZlTWVudSwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucnVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdmFyIHJ1bGVzVHJlZSA9IHt9O1xuXG4gICAgICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgICAgIHZhciBydWxlcyA9IHRoaXMucnVsZXMuc3BsaXQoJyAnKTtcblxuICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBldmVyeSBydWxlIGZvdW5kXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgdmFyIHJ1bGVTaXplID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVswXSA6ICdzbWFsbCc7XG4gICAgICAgICAgICB2YXIgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgICAgICBpZiAoTWVudVBsdWdpbnNbcnVsZVBsdWdpbl0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcnVsZXNUcmVlW3J1bGVTaXplXSA9IE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucnVsZXMgPSBydWxlc1RyZWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISQuaXNFbXB0eU9iamVjdCh0aGlzLnJ1bGVzKSkge1xuICAgICAgICAgIHRoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGRhdGEtbXV0YXRlIHNpbmNlIGNoaWxkcmVuIG1heSBuZWVkIGl0LlxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJywgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3Jlc3BvbnNpdmUtbWVudScpKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuUmVzcG9uc2l2ZU1lbnUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2NoZWNrTWVkaWFRdWVyaWVzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgICAgIHZhciBtYXRjaGVkTXEsXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICAgICAkLmVhY2godGhpcy5ydWxlcywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgICAgICBtYXRjaGVkTXEgPSBrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBObyBtYXRjaD8gTm8gZGljZVxuICAgICAgICBpZiAoIW1hdGNoZWRNcSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4gaW5zdGFuY2VvZiB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHBsdWdpbi1zcGVjaWZpYyBDU1MgY2xhc3Nlc1xuICAgICAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModmFsdWUuY3NzQ2xhc3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIENTUyBjbGFzcyBmb3IgdGhlIG5ldyBwbHVnaW5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luKSB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICAgICAkKHdpbmRvdykub2ZmKCcuemYuUmVzcG9uc2l2ZU1lbnUnKTtcbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBSZXNwb25zaXZlTWVudTtcbiAgfSgpO1xuXG4gIFJlc3BvbnNpdmVNZW51LmRlZmF1bHRzID0ge307XG5cbiAgLy8gVGhlIHBsdWdpbiBtYXRjaGVzIHRoZSBwbHVnaW4gY2xhc3NlcyB3aXRoIHRoZXNlIHBsdWdpbiBpbnN0YW5jZXMuXG4gIHZhciBNZW51UGx1Z2lucyA9IHtcbiAgICBkcm9wZG93bjoge1xuICAgICAgY3NzQ2xhc3M6ICdkcm9wZG93bicsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gICAgfSxcbiAgICBkcmlsbGRvd246IHtcbiAgICAgIGNzc0NsYXNzOiAnZHJpbGxkb3duJyxcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICAgIH0sXG4gICAgYWNjb3JkaW9uOiB7XG4gICAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snYWNjb3JkaW9uLW1lbnUnXSB8fCBudWxsXG4gICAgfVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKFJlc3BvbnNpdmVNZW51LCAnUmVzcG9uc2l2ZU1lbnUnKTtcbn0oalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKCQpIHtcbiAgICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNyb29tcycpLnNsaWNrKHtcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDQsXG4gICAgICAgICAgICBuZXh0QXJyb3c6ICc8YnV0dG9uIGNsYXNzPVwic2xpY2stbmV4dC1hcnJvd1wiIGFyaWEtbGFiZWw9XCJOZXh0IHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtcmlnaHRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgICAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLXByZXZpb3VzLWFycm93XCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzIHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtbGVmdFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiAxMDI0LFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNjAwLFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA0ODAsXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFlvdSBjYW4gdW5zbGljayBhdCBhIGdpdmVuIGJyZWFrcG9pbnQgbm93IGJ5IGFkZGluZzpcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5nczogXCJ1bnNsaWNrXCJcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8qXG4gICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAkKFwiI2Fycml2ZUR0XCIpLmRhdGVwaWNrZXIoKTtcbiAgICAgJChcIiNkZXBhcnREdFwiKS5kYXRlcGlja2VyKCk7XG4gICAgIH0pO1xuXG4gICAgIGZ1bmN0aW9uIHN1Ym1pdGZvcm0oKSB7XG4gICAgIGlmICghJChcIiNhcnJpdmVEdFwiKS52YWwoKSB8fCAhJChcIiNkZXBhcnREdFwiKS52YWwoKSkge1xuICAgICB3aW5kb3cuYWxlcnQoXCJQbGVhc2UgZW50ZXIgYSBTdGFydCBhbmQgRW5kIERhdGUhXCIpO1xuICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgJCgnI3Jlc2Jsb2NrJykuc3VibWl0KCk7XG4gICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgICAqL1xuICAgIC8vIGFycml2ZUR0XG4gICAgLy8gZGVwYXJ0RHRcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIFBpa2FkYXkgZGF0ZXBpY2tlcnMuXG4gICAgICogQHR5cGUgeyp9XG4gICAgICovXG4gICAgLypcbiAgICB2YXIgY2hlY2tpbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJpdmVEdFwiKSxcbiAgICAgICAgY2hlY2tvdXRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVwYXJ0RHRcIiksXG4gICAgICAgIGNoZWNraW5QaWthID0gcGlrYWRheVJlc3BvbnNpdmUoY2hlY2tpbkVsLCB7XG4gICAgICAgICAgICBmb3JtYXQ6ICdNL0REL1lZWVknLFxuICAgICAgICAgICAgcGlrYWRheU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgY2hlY2tvdXRQaWthID0gcGlrYWRheVJlc3BvbnNpdmUoY2hlY2tvdXRFbCwge1xuICAgICAgICAgICAgZm9ybWF0OiAnTS9ERC9ZWVlZJyxcbiAgICAgICAgICAgIHBpa2FkYXlPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4qL1xuLy8gQ2hlY2sgY2hlY2tvdXRkYXRlXG4gIC8qXG4gICAgJChjaGVja2luRWwpLm9uKCdjaGFuZ2UtZGF0ZScsIGZ1bmN0aW9uIChlLCBkYXRlKSB7XG4gICAgICAgIC8vIElmIGNoZWNrIG91dCBkYXRlIGlzIGJlZm9yZSBjaGVjayBpbiBkYXRlXG4gICAgICAgIGlmIChkYXRlLmRhdGUuaXNBZnRlcihjaGVja291dFBpa2EuZGF0ZSkpIHtcbiAgICAgICAgICAgIGNoZWNrb3V0UGlrYS5zZXREYXRlKGRhdGUuZGF0ZS5hZGQoMSwgJ2RheScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgbWluIGRhdGUgZm9yIHRoZSBjaGVja291dCBpbnB1dC5cbiAgICAgICAgY2hlY2tvdXRQaWthLnBpa2FkYXkuc2V0TWluRGF0ZShjaGVja2luUGlrYS5kYXRlLnRvRGF0ZSgpKTtcbiAgICB9KTtcblxuICAgICQoJy5ib29raW5nLWFjY29yZGlvbi10aXRsZScpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB0aXRsZSA9ICQodGhpcyk7XG4gICAgICAgIHZhciBiYXIgPSAkKCcuYm9va2luZy1iYXInKTtcbiAgICAgICAgYmFyLnNsaWRlVG9nZ2xlKCdmYXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYmFyLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICBpZiAoYmFyLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0KCdDbG9zZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0KCdCb29rIE5vdycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuKi9cbiAgICAkKCcuaGVyby1zbGljaycpLnNsaWNrKHtcbiAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLW5leHQtYXJyb3dcIiBhcmlhLWxhYmVsPVwiTmV4dCByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLXJpZ2h0XCI+PC91c2U+PC9zdmc+PC9idXR0b24+JyxcbiAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLXByZXZpb3VzLWFycm93XCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzIHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtbGVmdFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgfSk7XG59KShqUXVlcnkpO1xuIl19
