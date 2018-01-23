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
  // Put in a pattern that will limit what people can put into fields for phone numbers.
  Foundation.Abide.defaults.patterns['dashes_only'] = /^[0-9-]*$/;

  $("#js-form").submit(function (e) {
    e.preventDefault();
    var $form = $(this);
    $form.on("formvalid.zf.abide", function (ev, frm) {
      $.post($form.attr("action"), $form.serialize()).then(function () {
        // Hide the form and show the confirmation mesage.
        $form.hide();
        $("#js-confirmation").show().css("height", $form.height());
      });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwic2xpY2suanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm1vdGlvbi5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmFiaWRlLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMiLCJmb3VuZGF0aW9uLm9mZmNhbnZhcy5qcyIsImZvdW5kYXRpb24ub3JiaXQuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbImEiLCJiIiwiYyIsImRvY3VtZW50IiwibGF6eVNpemVzIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJkIiwiZG9jdW1lbnRFbGVtZW50IiwiZSIsIkRhdGUiLCJmIiwiSFRNTFBpY3R1cmVFbGVtZW50IiwiZyIsImgiLCJpIiwiaiIsInNldFRpbWVvdXQiLCJrIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibCIsInJlcXVlc3RJZGxlQ2FsbGJhY2siLCJtIiwibiIsIm8iLCJwIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwicSIsIlJlZ0V4cCIsInRlc3QiLCJyIiwic2V0QXR0cmlidXRlIiwidHJpbSIsInMiLCJyZXBsYWNlIiwidCIsInUiLCJjcmVhdGVFdmVudCIsImluaXRDdXN0b21FdmVudCIsImRpc3BhdGNoRXZlbnQiLCJ2IiwicGljdHVyZWZpbGwiLCJwZiIsInJlZXZhbHVhdGUiLCJlbGVtZW50cyIsInNyYyIsInciLCJnZXRDb21wdXRlZFN0eWxlIiwieCIsIm9mZnNldFdpZHRoIiwibWluU2l6ZSIsIl9sYXp5c2l6ZXNXaWR0aCIsInBhcmVudE5vZGUiLCJ5IiwibGVuZ3RoIiwic2hpZnQiLCJhcHBseSIsImFyZ3VtZW50cyIsInB1c2giLCJoaWRkZW4iLCJfbHNGbHVzaCIsInoiLCJBIiwibm93IiwidGltZW91dCIsIkIiLCJDIiwiRSIsIkYiLCJHIiwiSCIsIkkiLCJKIiwiSyIsIkwiLCJNIiwiTiIsIk8iLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJQIiwiUSIsIlIiLCJTIiwiVCIsInRhcmdldCIsIlUiLCJib2R5Iiwib2Zmc2V0UGFyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwiViIsImxvYWRNb2RlIiwiZXhwYW5kIiwiY2xpZW50SGVpZ2h0IiwiY2xpZW50V2lkdGgiLCJleHBGYWN0b3IiLCJfbGF6eVJhY2UiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYSIsInByZWxvYWRBZnRlckxvYWQiLCJzaXplc0F0dHIiLCJXIiwiWCIsImxvYWRlZENsYXNzIiwibG9hZGluZ0NsYXNzIiwiWiIsIlkiLCIkIiwiY29udGVudFdpbmRvdyIsImxvY2F0aW9uIiwiXyIsInNyY3NldEF0dHIiLCJjdXN0b21NZWRpYSIsImluc2VydEJlZm9yZSIsImNsb25lTm9kZSIsInJlbW92ZUNoaWxkIiwiYWEiLCJkZWZhdWx0UHJldmVudGVkIiwiYXV0b3NpemVzQ2xhc3MiLCJzcmNBdHRyIiwibm9kZU5hbWUiLCJmaXJlc0xvYWQiLCJjbGVhclRpbWVvdXQiLCJjYWxsIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsYXp5Q2xhc3MiLCJjb21wbGV0ZSIsIm5hdHVyYWxXaWR0aCIsInNyY3NldCIsImVycm9yQ2xhc3MiLCJkZXRhaWwiLCJEIiwidXBkYXRlRWxlbSIsImNhIiwicHJlbG9hZENsYXNzIiwiaEZhYyIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJvYnNlcnZlIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsImF0dHJpYnV0ZXMiLCJzZXRJbnRlcnZhbCIsInJlYWR5U3RhdGUiLCJjaGVja0VsZW1zIiwidW52ZWlsIiwiZGF0YUF0dHIiLCJ3aWR0aCIsImluaXQiLCJsYXp5U2l6ZXNDb25maWciLCJsYXp5c2l6ZXNDb25maWciLCJjZmciLCJhdXRvU2l6ZXIiLCJsb2FkZXIiLCJ1UCIsImFDIiwickMiLCJoQyIsImZpcmUiLCJnVyIsInJBRiIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJyZXF1aXJlIiwialF1ZXJ5IiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsImVsZW1lbnQiLCJzZXR0aW5ncyIsImRhdGFTZXR0aW5ncyIsImRlZmF1bHRzIiwiYWNjZXNzaWJpbGl0eSIsImFkYXB0aXZlSGVpZ2h0IiwiYXBwZW5kQXJyb3dzIiwiYXBwZW5kRG90cyIsImFycm93cyIsImFzTmF2Rm9yIiwicHJldkFycm93IiwibmV4dEFycm93IiwiYXV0b3BsYXkiLCJhdXRvcGxheVNwZWVkIiwiY2VudGVyTW9kZSIsImNlbnRlclBhZGRpbmciLCJjc3NFYXNlIiwiY3VzdG9tUGFnaW5nIiwic2xpZGVyIiwidGV4dCIsImRvdHMiLCJkb3RzQ2xhc3MiLCJkcmFnZ2FibGUiLCJlYXNpbmciLCJlZGdlRnJpY3Rpb24iLCJmYWRlIiwiZm9jdXNPblNlbGVjdCIsImluZmluaXRlIiwiaW5pdGlhbFNsaWRlIiwibGF6eUxvYWQiLCJtb2JpbGVGaXJzdCIsInBhdXNlT25Ib3ZlciIsInBhdXNlT25Gb2N1cyIsInBhdXNlT25Eb3RzSG92ZXIiLCJyZXNwb25kVG8iLCJyZXNwb25zaXZlIiwicm93cyIsInJ0bCIsInNsaWRlIiwic2xpZGVzUGVyUm93Iiwic2xpZGVzVG9TaG93Iiwic2xpZGVzVG9TY3JvbGwiLCJzcGVlZCIsInN3aXBlIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiZGlyZWN0aW9uIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImV4dGVuZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd1RpbWVyIiwiZGF0YSIsIm9wdGlvbnMiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJjbGlja0hhbmRsZXIiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImZpbmQiLCJhdHRyIiwiYWRkU2xpZGUiLCJzbGlja0FkZCIsIm1hcmt1cCIsImluZGV4IiwiYWRkQmVmb3JlIiwidW5sb2FkIiwiYXBwZW5kVG8iLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiY2hpbGRyZW4iLCJkZXRhY2giLCJhcHBlbmQiLCJlYWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsInRhcmdldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiYW5pbWF0ZSIsImhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJjYWxsYmFjayIsImFuaW1Qcm9wcyIsImFuaW1TdGFydCIsImR1cmF0aW9uIiwic3RlcCIsIk1hdGgiLCJjZWlsIiwiY3NzIiwiYXBwbHlUcmFuc2l0aW9uIiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJub3QiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJjbGVhckludGVydmFsIiwic2xpZGVUbyIsImJ1aWxkQXJyb3dzIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsInJlbW92ZUF0dHIiLCJhZGQiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImZpcnN0IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsInJvdyIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsInJlZnJlc2giLCJ0cmlnZ2VyIiwiZXZlbnQiLCJkb250QW5pbWF0ZSIsIiR0YXJnZXQiLCJjdXJyZW50VGFyZ2V0IiwiaW5kZXhPZmZzZXQiLCJ1bmV2ZW5PZmZzZXQiLCJpcyIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VzdCIsIm1lc3NhZ2UiLCJjaGVja05hdmlnYWJsZSIsIm5hdmlnYWJsZXMiLCJwcmV2TmF2aWdhYmxlIiwiZ2V0TmF2aWdhYmxlSW5kZXhlcyIsImNsZWFuVXBFdmVudHMiLCJvZmYiLCJpbnRlcnJ1cHQiLCJ2aXNpYmlsaXR5IiwiY2xlYW5VcFNsaWRlRXZlbnRzIiwib3JpZW50YXRpb25DaGFuZ2UiLCJyZXNpemUiLCJjbGVhblVwUm93cyIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInN0b3BQcm9wYWdhdGlvbiIsImRlc3Ryb3kiLCJyZW1vdmUiLCJmYWRlU2xpZGUiLCJzbGlkZUluZGV4Iiwib3BhY2l0eSIsImZhZGVTbGlkZU91dCIsImZpbHRlclNsaWRlcyIsInNsaWNrRmlsdGVyIiwiZmlsdGVyIiwiZm9jdXNIYW5kbGVyIiwib24iLCIkc2YiLCJnZXRDdXJyZW50Iiwic2xpY2tDdXJyZW50U2xpZGUiLCJicmVha1BvaW50IiwiY291bnRlciIsInBhZ2VyUXR5IiwiZ2V0TGVmdCIsInZlcnRpY2FsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJ0YXJnZXRTbGlkZSIsImZsb29yIiwib2Zmc2V0TGVmdCIsIm91dGVyV2lkdGgiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImFicyIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsImVuZCIsImluaXRBcnJvd0V2ZW50cyIsImluaXREb3RFdmVudHMiLCJpbml0U2xpZGVFdmVudHMiLCJhY3Rpb24iLCJpbml0VUkiLCJzaG93IiwidGFnTmFtZSIsIm1hdGNoIiwia2V5Q29kZSIsImxvYWRSYW5nZSIsImNsb25lUmFuZ2UiLCJyYW5nZVN0YXJ0IiwicmFuZ2VFbmQiLCJsb2FkSW1hZ2VzIiwiaW1hZ2VzU2NvcGUiLCJpbWFnZSIsImltYWdlU291cmNlIiwiaW1hZ2VUb0xvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwic2xpY2UiLCJwcm9ncmVzc2l2ZUxhenlMb2FkIiwibmV4dCIsInNsaWNrTmV4dCIsInBhdXNlIiwic2xpY2tQYXVzZSIsInBsYXkiLCJzbGlja1BsYXkiLCJwb3N0U2xpZGUiLCJwcmV2Iiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsInR5cGUiLCJzcGxpY2UiLCJzb3J0Iiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BzIiwic2V0RGltZW5zaW9ucyIsInBhZGRpbmciLCJvZmZzZXQiLCJzZXRGYWRlIiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwidmFsdWUiLCJvcHQiLCJ2YWwiLCJib2R5U3R5bGUiLCJzdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJ1bmRlZmluZWQiLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJpbmZpbml0ZUNvdW50IiwiY2xvbmUiLCJ0b2dnbGUiLCJ0YXJnZXRFbGVtZW50IiwicGFyZW50cyIsInN5bmMiLCJhbmltU2xpZGUiLCJvbGRTbGlkZSIsInNsaWRlTGVmdCIsIm5hdlRhcmdldCIsImhpZGUiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJzd2lwZUFuZ2xlIiwic3RhcnRYIiwiY3VyWCIsInN0YXJ0WSIsImN1clkiLCJhdGFuMiIsInJvdW5kIiwiUEkiLCJzd2lwZUVuZCIsInN3aXBlTGVuZ3RoIiwiZWRnZUhpdCIsIm1pblN3aXBlIiwiaW5kZXhPZiIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInBhZ2VYIiwiY2xpZW50WCIsInBhZ2VZIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsImZuIiwiYXJncyIsInJldCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJ1bnJlZ2lzdGVyUGx1Z2luIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsIl9pbml0IiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJuYW1lc3BhY2UiLCJyYW5kb20iLCJ0b1N0cmluZyIsInJlZmxvdyIsImVsZW0iLCIkZWxlbSIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJtYXAiLCJlbCIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImhlYWQiLCJNZWRpYVF1ZXJ5IiwicGx1Z0NsYXNzIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJnZXRUaW1lIiwidmVuZG9ycyIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJsYXN0VGltZSIsIm5leHRUaW1lIiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJwYXJEaW1zIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJwYXJSZWN0Iiwid2luUmVjdCIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImtleSIsIndoaWNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCIkbGFzdEZvY3VzYWJsZSIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwia2NzIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiaW5mbyIsImlkIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0Iiwib25lIiwiZmluaXNoIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsIkJ1cm4iLCJyb2xlIiwiVGltZXIiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsImR4IiwiZHkiLCJkaXIiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwidGVhcmRvd24iLCJzcGVjaWFsIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiaW5pdE1vdXNlRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJtdXRhdGVMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCJhdHRyaWJ1dGVOYW1lIiwiZWxlbWVudE9ic2VydmVyIiwiY2hhcmFjdGVyRGF0YSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsIkFiaWRlIiwiJGlucHV0cyIsIl9ldmVudHMiLCJfdGhpczIiLCJyZXNldEZvcm0iLCJ2YWxpZGF0ZUZvcm0iLCJ2YWxpZGF0ZU9uIiwidmFsaWRhdGVJbnB1dCIsImxpdmVWYWxpZGF0ZSIsInZhbGlkYXRlT25CbHVyIiwiX3JlZmxvdyIsInJlcXVpcmVkQ2hlY2siLCJpc0dvb2QiLCJjaGVja2VkIiwiZmluZEZvcm1FcnJvciIsIiRlcnJvciIsInNpYmxpbmdzIiwiZm9ybUVycm9yU2VsZWN0b3IiLCJmaW5kTGFiZWwiLCIkbGFiZWwiLCJmaW5kUmFkaW9MYWJlbHMiLCIkZWxzIiwiX3RoaXMzIiwibGFiZWxzIiwiYWRkRXJyb3JDbGFzc2VzIiwiJGZvcm1FcnJvciIsImxhYmVsRXJyb3JDbGFzcyIsImZvcm1FcnJvckNsYXNzIiwiaW5wdXRFcnJvckNsYXNzIiwicmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMiLCJncm91cE5hbWUiLCIkbGFiZWxzIiwiJGZvcm1FcnJvcnMiLCJyZW1vdmVFcnJvckNsYXNzZXMiLCJfdGhpczQiLCJjbGVhclJlcXVpcmUiLCJ2YWxpZGF0ZWQiLCJjdXN0b21WYWxpZGF0b3IiLCJ2YWxpZGF0b3IiLCJlcXVhbFRvIiwidmFsaWRhdGVSYWRpbyIsInZhbGlkYXRlVGV4dCIsIm1hdGNoVmFsaWRhdGlvbiIsInZhbGlkYXRvcnMiLCJnb29kVG9HbyIsImRlcGVuZGVudEVsZW1lbnRzIiwiYWNjIiwibm9FcnJvciIsInBhdHRlcm4iLCJpbnB1dFRleHQiLCJ2YWxpZCIsInBhdHRlcm5zIiwiJGdyb3VwIiwicmVxdWlyZWQiLCJfdGhpczUiLCJjbGVhciIsIiRmb3JtIiwiYWxwaGEiLCJhbHBoYV9udW1lcmljIiwiaW50ZWdlciIsIm51bWJlciIsImNhcmQiLCJjdnYiLCJlbWFpbCIsInVybCIsImRvbWFpbiIsImRhdGV0aW1lIiwiZGF0ZSIsInRpbWUiLCJkYXRlSVNPIiwibW9udGhfZGF5X3llYXIiLCJkYXlfbW9udGhfeWVhciIsImNvbG9yIiwiRHJvcGRvd25NZW51Iiwic3VicyIsIiRtZW51SXRlbXMiLCIkdGFicyIsInZlcnRpY2FsQ2xhc3MiLCJyaWdodENsYXNzIiwiYWxpZ25tZW50IiwiY2hhbmdlZCIsIl9pc1ZlcnRpY2FsIiwiaGFzVG91Y2giLCJvbnRvdWNoc3RhcnQiLCJwYXJDbGFzcyIsImhhbmRsZUNsaWNrRm4iLCJwYXJlbnRzVW50aWwiLCJoYXNTdWIiLCJoYXNDbGlja2VkIiwiY2xvc2VPbkNsaWNrIiwiY2xpY2tPcGVuIiwiZm9yY2VGb2xsb3ciLCJfaGlkZSIsIl9zaG93IiwiY2xvc2VPbkNsaWNrSW5zaWRlIiwiZGlzYWJsZUhvdmVyIiwiaG92ZXJEZWxheSIsImF1dG9jbG9zZSIsImNsb3NpbmdUaW1lIiwiaXNUYWIiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJuZXh0U2libGluZyIsInByZXZTaWJsaW5nIiwib3BlblN1YiIsImNsb3NlU3ViIiwiY2xvc2UiLCJvcGVuIiwiZG93biIsInVwIiwicHJldmlvdXMiLCJfYWRkQm9keUhhbmRsZXIiLCIkYm9keSIsIiRsaW5rIiwiaWR4IiwiJHNpYnMiLCJvbGRDbGFzcyIsIiRwYXJlbnRMaSIsIiR0b0Nsb3NlIiwic29tZXRoaW5nVG9DbG9zZSIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsIiRvdmVybGF5IiwiaXNSZXZlYWxlZCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJfaGFuZGxlS2V5Ym9hcmQiLCJyZXZlYWwiLCIkY2xvc2VyIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvcCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiYXV0b0ZvY3VzIiwiT3JiaXQiLCJfcmVzZXQiLCIkd3JhcHBlciIsImNvbnRhaW5lckNsYXNzIiwic2xpZGVDbGFzcyIsIiRpbWFnZXMiLCJpbml0QWN0aXZlIiwidXNlTVVJIiwiX3ByZXBhcmVGb3JPcmJpdCIsImJ1bGxldHMiLCJfbG9hZEJ1bGxldHMiLCJnZW9TeW5jIiwiYWNjZXNzaWJsZSIsIiRidWxsZXRzIiwiYm94T2ZCdWxsZXRzIiwidGltZXJEZWxheSIsIl9zZXRXcmFwcGVySGVpZ2h0IiwidGVtcCIsIl9zZXRTbGlkZUhlaWdodCIsIm5hdkJ1dHRvbnMiLCIkY29udHJvbHMiLCJuZXh0Q2xhc3MiLCJwcmV2Q2xhc3MiLCIkc2xpZGUiLCJfdXBkYXRlQnVsbGV0cyIsImlzTFRSIiwiY2hvc2VuU2xpZGUiLCIkY3VyU2xpZGUiLCIkZmlyc3RTbGlkZSIsIiRsYXN0U2xpZGUiLCJsYXN0IiwiZGlySW4iLCJkaXJPdXQiLCIkbmV3U2xpZGUiLCJpbmZpbml0ZVdyYXAiLCIkb2xkQnVsbGV0IiwiYmx1ciIsInNwYW4iLCIkbmV3QnVsbGV0IiwiYW5pbUluRnJvbVJpZ2h0IiwiYW5pbU91dFRvUmlnaHQiLCJhbmltSW5Gcm9tTGVmdCIsImFuaW1PdXRUb0xlZnQiLCJSZXNwb25zaXZlTWVudSIsInJ1bGVzIiwiY3VycmVudE1xIiwiY3VycmVudFBsdWdpbiIsInJ1bGVzVHJlZSIsInJ1bGUiLCJydWxlU2l6ZSIsInJ1bGVQbHVnaW4iLCJNZW51UGx1Z2lucyIsImlzRW1wdHlPYmplY3QiLCJfY2hlY2tNZWRpYVF1ZXJpZXMiLCJtYXRjaGVkTXEiLCJjc3NDbGFzcyIsImRyb3Bkb3duIiwiZHJpbGxkb3duIiwiYWNjb3JkaW9uIiwic3VibWl0IiwiZXYiLCJmcm0iLCJwb3N0Iiwic2VyaWFsaXplIiwidGhlbiIsInZhbGlkYXRlIiwicmVhZHkiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RGQ7QUFFRTVMLGtCQUFVO0FBQ1J1Qyx3QkFBYyxDQUROO0FBRVJDLDBCQUFnQixDQUZSO0FBR1JkLG9CQUFVLElBSEY7QUFJUlAsZ0JBQU07QUFKRTtBQUZaLE9BRFUsRUFVVjtBQUNFeUssb0JBQVksR0FEZDtBQUVFNUwsa0JBQVU7QUFDUnVDLHdCQUFjLENBRE47QUFFUkMsMEJBQWdCO0FBRlI7QUFGWixPQVZVLEVBaUJWO0FBQ0VvSixvQkFBWSxHQURkO0FBRUU1TCxrQkFBVTtBQUNSdUMsd0JBQWMsQ0FETjtBQUVSQywwQkFBZ0I7QUFGUjtBQUtaO0FBQ0E7QUFDQTtBQVRBLE9BakJVO0FBVkksS0FBbEI7QUF1Q0QsR0F4Q0Q7QUF5Q0E7Ozs7Ozs7Ozs7Ozs7O0FBZUE7QUFDQTtBQUNBOzs7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQXJHLElBQUUsYUFBRixFQUFpQnNOLEtBQWpCLENBQXVCO0FBQ3JCL0ksZUFDRSxpSUFGbUI7QUFHckJELGVBQ0U7QUFKbUIsR0FBdkI7QUFNRCxDQW5JRCxFQW1JR2IsTUFuSUgiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMy4xXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0ICAvKlxuXHQgICAqIHZhcmlhYmxlc1xuXHQgICAqL1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IHR5cGVcblx0ICB2YXIgY3VycmVudElucHV0ID0gJ2luaXRpYWwnO1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IGludGVudFxuXHQgIHZhciBjdXJyZW50SW50ZW50ID0gbnVsbDtcblxuXHQgIC8vIGNhY2hlIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXHQgIHZhciBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBmb3JtIGlucHV0IHR5cGVzXG5cdCAgdmFyIGZvcm1JbnB1dHMgPSBbJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYSddO1xuXG5cdCAgdmFyIGZ1bmN0aW9uTGlzdCA9IFtdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFsxNiwgLy8gc2hpZnRcblx0ICAxNywgLy8gY29udHJvbFxuXHQgIDE4LCAvLyBhbHRcblx0ICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgIDkzIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIGtleXMgZm9yIHdoaWNoIHdlIGNoYW5nZSBpbnRlbnQgZXZlbiBmb3IgZm9ybSBpbnB1dHNcblx0ICB2YXIgY2hhbmdlSW50ZW50TWFwID0gWzkgLy8gdGFiXG5cdCAgXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAga2V5ZG93bjogJ2tleWJvYXJkJyxcblx0ICAgIGtleXVwOiAna2V5Ym9hcmQnLFxuXHQgICAgbW91c2Vkb3duOiAnbW91c2UnLFxuXHQgICAgbW91c2Vtb3ZlOiAnbW91c2UnLFxuXHQgICAgTVNQb2ludGVyRG93bjogJ3BvaW50ZXInLFxuXHQgICAgTVNQb2ludGVyTW92ZTogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcmRvd246ICdwb2ludGVyJyxcblx0ICAgIHBvaW50ZXJtb3ZlOiAncG9pbnRlcicsXG5cdCAgICB0b3VjaHN0YXJ0OiAndG91Y2gnXG5cdCAgfTtcblxuXHQgIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIGlzIGFjdGl2ZVxuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0aGUgcGFnZSBpcyBiZWluZyBzY3JvbGxlZFxuXHQgIHZhciBpc1Njcm9sbGluZyA9IGZhbHNlO1xuXG5cdCAgLy8gc3RvcmUgY3VycmVudCBtb3VzZSBwb3NpdGlvblxuXHQgIHZhciBtb3VzZVBvcyA9IHtcblx0ICAgIHg6IG51bGwsXG5cdCAgICB5OiBudWxsXG5cdCAgfTtcblxuXHQgIC8vIG1hcCBvZiBJRSAxMCBwb2ludGVyIGV2ZW50c1xuXHQgIHZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cdCAgfTtcblxuXHQgIHZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxuXHQgIHRyeSB7XG5cdCAgICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG5cdCAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHQgICAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG5cdCAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG51bGwsIG9wdHMpO1xuXHQgIH0gY2F0Y2ggKGUpIHt9XG5cblx0ICAvKlxuXHQgICAqIHNldCB1cFxuXHQgICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24gc2V0VXAoKSB7XG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgICBzZXRJbnB1dCgpO1xuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIGV2ZW50c1xuXHQgICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXHQgICAgdmFyIG9wdGlvbnMgPSBzdXBwb3J0c1Bhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAgIC8vIHRvdWNoIGV2ZW50c1xuXHQgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG5cdCAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlciwgb3B0aW9ucyk7XG5cdCAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdG91Y2hCdWZmZXIpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIG1vdXNlIHdoZWVsXG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQsIG9wdGlvbnMpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlSW5wdXQpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHVwZGF0ZUlucHV0ID0gZnVuY3Rpb24gdXBkYXRlSW5wdXQoZXZlbnQpIHtcblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIGV2ZW50S2V5ID0gZXZlbnQud2hpY2g7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUgfHwgY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gZmFsc2U7XG5cdCAgICAgICAgdmFyIG5vdEZvcm1JbnB1dCA9IGFjdGl2ZUVsZW0gJiYgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJiBmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTE7XG5cblx0ICAgICAgICBpZiAobm90Rm9ybUlucHV0IHx8IGNoYW5nZUludGVudE1hcC5pbmRleE9mKGV2ZW50S2V5KSAhPT0gLTEpIHtcblx0ICAgICAgICAgIGFjdGl2ZUlucHV0ID0gdHJ1ZTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBpZiAodmFsdWUgPT09ICd0b3VjaCcgfHxcblx0ICAgICAgICAvLyBpZ25vcmUgbW91c2UgbW9kaWZpZXIga2V5c1xuXHQgICAgICAgIHZhbHVlID09PSAnbW91c2UnIHx8XG5cdCAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgdmFsdWUgPT09ICdrZXlib2FyZCcgJiYgZXZlbnRLZXkgJiYgYWN0aXZlSW5wdXQgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkge1xuXHQgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGFuZCBjYXRjaC1hbGwgdmFyaWFibGVcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgc2V0SW5wdXQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgc2V0SW5wdXQgPSBmdW5jdGlvbiBzZXRJbnB1dCgpIHtcblx0ICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0JywgY3VycmVudElucHV0KTtcblx0ICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvYy5jbGFzc05hbWUgKz0gJyB3aGF0aW5wdXQtdHlwZXMtJyArIGN1cnJlbnRJbnB1dDtcblx0ICAgIH1cblxuXHQgICAgZmlyZUZ1bmN0aW9ucygnaW5wdXQnKTtcblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uIHNldEludGVudChldmVudCkge1xuXHQgICAgLy8gdGVzdCB0byBzZWUgaWYgYG1vdXNlbW92ZWAgaGFwcGVuZWQgcmVsYXRpdmUgdG8gdGhlIHNjcmVlblxuXHQgICAgLy8gdG8gZGV0ZWN0IHNjcm9sbGluZyB2ZXJzdXMgbW91c2Vtb3ZlXG5cdCAgICBpZiAobW91c2VQb3NbJ3gnXSAhPT0gZXZlbnQuc2NyZWVuWCB8fCBtb3VzZVBvc1sneSddICE9PSBldmVudC5zY3JlZW5ZKSB7XG5cdCAgICAgIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAgICAgbW91c2VQb3NbJ3gnXSA9IGV2ZW50LnNjcmVlblg7XG5cdCAgICAgIG1vdXNlUG9zWyd5J10gPSBldmVudC5zY3JlZW5ZO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSB0cnVlO1xuXHQgICAgfVxuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICAvLyBvciBzY3JvbGxpbmcgaXNuJ3QgaGFwcGVuaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nICYmICFpc1Njcm9sbGluZykge1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXG5cdCAgICAgICAgZmlyZUZ1bmN0aW9ucygnaW50ZW50Jyk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gYnVmZmVycyB0b3VjaCBldmVudHMgYmVjYXVzZSB0aGV5IGZyZXF1ZW50bHkgYWxzbyBmaXJlIG1vdXNlIGV2ZW50c1xuXHQgIHZhciB0b3VjaEJ1ZmZlciA9IGZ1bmN0aW9uIHRvdWNoQnVmZmVyKGV2ZW50KSB7XG5cdCAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG5cdCAgICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGlucHV0XG5cdCAgICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgdmFyIGZpcmVGdW5jdGlvbnMgPSBmdW5jdGlvbiBmaXJlRnVuY3Rpb25zKHR5cGUpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmdW5jdGlvbkxpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgaWYgKGZ1bmN0aW9uTGlzdFtpXS50eXBlID09PSB0eXBlKSB7XG5cdCAgICAgICAgZnVuY3Rpb25MaXN0W2ldLmZuLmNhbGwodW5kZWZpbmVkLCBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIHV0aWxpdGllc1xuXHQgICAqL1xuXG5cdCAgdmFyIHBvaW50ZXJUeXBlID0gZnVuY3Rpb24gcG9pbnRlclR5cGUoZXZlbnQpIHtcblx0ICAgIGlmICh0eXBlb2YgZXZlbnQucG9pbnRlclR5cGUgPT09ICdudW1iZXInKSB7XG5cdCAgICAgIHJldHVybiBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICAgIHJldHVybiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ3BlbicgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuXHQgIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbiBkZXRlY3RXaGVlbCgpIHtcblx0ICAgIHZhciB3aGVlbFR5cGUgPSB2b2lkIDA7XG5cblx0ICAgIC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXHQgICAgaWYgKCdvbndoZWVsJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSkge1xuXHQgICAgICB3aGVlbFR5cGUgPSAnd2hlZWwnO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gV2Via2l0IGFuZCBJRSBzdXBwb3J0IGF0IGxlYXN0IFwibW91c2V3aGVlbFwiXG5cdCAgICAgIC8vIG9yIGFzc3VtZSB0aGF0IHJlbWFpbmluZyBicm93c2VycyBhcmUgb2xkZXIgRmlyZWZveFxuXHQgICAgICB3aGVlbFR5cGUgPSBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/ICdtb3VzZXdoZWVsJyA6ICdET01Nb3VzZVNjcm9sbCc7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiB3aGVlbFR5cGU7XG5cdCAgfTtcblxuXHQgIHZhciBvYmpQb3MgPSBmdW5jdGlvbiBvYmpQb3MobWF0Y2gpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmdW5jdGlvbkxpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgaWYgKGZ1bmN0aW9uTGlzdFtpXS5mbiA9PT0gbWF0Y2gpIHtcblx0ICAgICAgICByZXR1cm4gaTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIGluaXRcblx0ICAgKi9cblxuXHQgIC8vIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgLy8gKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICBpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblx0ICAvKlxuXHQgICAqIGFwaVxuXHQgICAqL1xuXG5cdCAgcmV0dXJuIHtcblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdsb29zZSd8J3N0cmljdCdcblx0ICAgIC8vICdzdHJpY3QnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdsb29zZSc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgbW9yZSBjdXJyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbiBhc2sob3B0KSB7XG5cdCAgICAgIHJldHVybiBvcHQgPT09ICdsb29zZScgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0O1xuXHQgICAgfSxcblxuXHQgICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuXHQgICAgdHlwZXM6IGZ1bmN0aW9uIHR5cGVzKCkge1xuXHQgICAgICByZXR1cm4gaW5wdXRUeXBlcztcblx0ICAgIH0sXG5cblx0ICAgIC8vIG92ZXJ3cml0ZXMgaWdub3JlZCBrZXlzIHdpdGggcHJvdmlkZWQgYXJyYXlcblx0ICAgIGlnbm9yZUtleXM6IGZ1bmN0aW9uIGlnbm9yZUtleXMoYXJyKSB7XG5cdCAgICAgIGlnbm9yZU1hcCA9IGFycjtcblx0ICAgIH0sXG5cblx0ICAgIC8vIGF0dGFjaCBmdW5jdGlvbnMgdG8gaW5wdXQgYW5kIGludGVudCBcImV2ZW50c1wiXG5cdCAgICAvLyBmdW5jdDogZnVuY3Rpb24gdG8gZmlyZSBvbiBjaGFuZ2Vcblx0ICAgIC8vIGV2ZW50VHlwZTogJ2lucHV0J3wnaW50ZW50J1xuXHQgICAgcmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gcmVnaXN0ZXJPbkNoYW5nZShmbiwgZXZlbnRUeXBlKSB7XG5cdCAgICAgIGZ1bmN0aW9uTGlzdC5wdXNoKHtcblx0ICAgICAgICBmbjogZm4sXG5cdCAgICAgICAgdHlwZTogZXZlbnRUeXBlIHx8ICdpbnB1dCdcblx0ICAgICAgfSk7XG5cdCAgICB9LFxuXG5cdCAgICB1blJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHVuUmVnaXN0ZXJPbkNoYW5nZShmbikge1xuXHQgICAgICB2YXIgcG9zaXRpb24gPSBvYmpQb3MoZm4pO1xuXG5cdCAgICAgIGlmIChwb3NpdGlvbikge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblx0fSgpO1xuXG4vKioqLyB9XG4vKioqKioqLyBdKVxufSk7XG47IiwiLyohIGxhenlzaXplcyAtIHYzLjAuMCAqL1xuIWZ1bmN0aW9uKGEsYil7dmFyIGM9YihhLGEuZG9jdW1lbnQpO2EubGF6eVNpemVzPWMsXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1jKX0od2luZG93LGZ1bmN0aW9uKGEsYil7XCJ1c2Ugc3RyaWN0XCI7aWYoYi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKXt2YXIgYyxkPWIuZG9jdW1lbnRFbGVtZW50LGU9YS5EYXRlLGY9YS5IVE1MUGljdHVyZUVsZW1lbnQsZz1cImFkZEV2ZW50TGlzdGVuZXJcIixoPVwiZ2V0QXR0cmlidXRlXCIsaT1hW2ddLGo9YS5zZXRUaW1lb3V0LGs9YS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGosbD1hLnJlcXVlc3RJZGxlQ2FsbGJhY2ssbT0vXnBpY3R1cmUkL2ksbj1bXCJsb2FkXCIsXCJlcnJvclwiLFwibGF6eWluY2x1ZGVkXCIsXCJfbGF6eWxvYWRlZFwiXSxvPXt9LHA9QXJyYXkucHJvdG90eXBlLmZvckVhY2gscT1mdW5jdGlvbihhLGIpe3JldHVybiBvW2JdfHwob1tiXT1uZXcgUmVnRXhwKFwiKFxcXFxzfF4pXCIrYitcIihcXFxcc3wkKVwiKSksb1tiXS50ZXN0KGFbaF0oXCJjbGFzc1wiKXx8XCJcIikmJm9bYl19LHI9ZnVuY3Rpb24oYSxiKXtxKGEsYil8fGEuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwoYVtoXShcImNsYXNzXCIpfHxcIlwiKS50cmltKCkrXCIgXCIrYil9LHM9ZnVuY3Rpb24oYSxiKXt2YXIgYzsoYz1xKGEsYikpJiZhLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsKGFbaF0oXCJjbGFzc1wiKXx8XCJcIikucmVwbGFjZShjLFwiIFwiKSl9LHQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWM/ZzpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIjtjJiZ0KGEsYiksbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe2FbZF0oYyxiKX0pfSx1PWZ1bmN0aW9uKGEsYyxkLGUsZil7dmFyIGc9Yi5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO3JldHVybiBnLmluaXRDdXN0b21FdmVudChjLCFlLCFmLGR8fHt9KSxhLmRpc3BhdGNoRXZlbnQoZyksZ30sdj1mdW5jdGlvbihiLGQpe3ZhciBlOyFmJiYoZT1hLnBpY3R1cmVmaWxsfHxjLnBmKT9lKHtyZWV2YWx1YXRlOiEwLGVsZW1lbnRzOltiXX0pOmQmJmQuc3JjJiYoYi5zcmM9ZC5zcmMpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuKGdldENvbXB1dGVkU3R5bGUoYSxudWxsKXx8e30pW2JdfSx4PWZ1bmN0aW9uKGEsYixkKXtmb3IoZD1kfHxhLm9mZnNldFdpZHRoO2Q8Yy5taW5TaXplJiZiJiYhYS5fbGF6eXNpemVzV2lkdGg7KWQ9Yi5vZmZzZXRXaWR0aCxiPWIucGFyZW50Tm9kZTtyZXR1cm4gZH0seT1mdW5jdGlvbigpe3ZhciBhLGMsZD1bXSxlPVtdLGY9ZCxnPWZ1bmN0aW9uKCl7dmFyIGI9Zjtmb3IoZj1kLmxlbmd0aD9lOmQsYT0hMCxjPSExO2IubGVuZ3RoOyliLnNoaWZ0KCkoKTthPSExfSxoPWZ1bmN0aW9uKGQsZSl7YSYmIWU/ZC5hcHBseSh0aGlzLGFyZ3VtZW50cyk6KGYucHVzaChkKSxjfHwoYz0hMCwoYi5oaWRkZW4/ajprKShnKSkpfTtyZXR1cm4gaC5fbHNGbHVzaD1nLGh9KCksej1mdW5jdGlvbihhLGIpe3JldHVybiBiP2Z1bmN0aW9uKCl7eShhKX06ZnVuY3Rpb24oKXt2YXIgYj10aGlzLGM9YXJndW1lbnRzO3koZnVuY3Rpb24oKXthLmFwcGx5KGIsYyl9KX19LEE9ZnVuY3Rpb24oYSl7dmFyIGIsYz0wLGQ9MTI1LGY9NjY2LGc9ZixoPWZ1bmN0aW9uKCl7Yj0hMSxjPWUubm93KCksYSgpfSxpPWw/ZnVuY3Rpb24oKXtsKGgse3RpbWVvdXQ6Z30pLGchPT1mJiYoZz1mKX06eihmdW5jdGlvbigpe2ooaCl9LCEwKTtyZXR1cm4gZnVuY3Rpb24oYSl7dmFyIGY7KGE9YT09PSEwKSYmKGc9NDQpLGJ8fChiPSEwLGY9ZC0oZS5ub3coKS1jKSwwPmYmJihmPTApLGF8fDk+ZiYmbD9pKCk6aihpLGYpKX19LEI9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPTk5LGY9ZnVuY3Rpb24oKXtiPW51bGwsYSgpfSxnPWZ1bmN0aW9uKCl7dmFyIGE9ZS5ub3coKS1jO2Q+YT9qKGcsZC1hKToobHx8ZikoZil9O3JldHVybiBmdW5jdGlvbigpe2M9ZS5ub3coKSxifHwoYj1qKGcsZCkpfX0sQz1mdW5jdGlvbigpe3ZhciBmLGssbCxuLG8seCxDLEUsRixHLEgsSSxKLEssTCxNPS9eaW1nJC9pLE49L15pZnJhbWUkL2ksTz1cIm9uc2Nyb2xsXCJpbiBhJiYhL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxQPTAsUT0wLFI9MCxTPS0xLFQ9ZnVuY3Rpb24oYSl7Ui0tLGEmJmEudGFyZ2V0JiZ0KGEudGFyZ2V0LFQpLCghYXx8MD5SfHwhYS50YXJnZXQpJiYoUj0wKX0sVT1mdW5jdGlvbihhLGMpe3ZhciBlLGY9YSxnPVwiaGlkZGVuXCI9PXcoYi5ib2R5LFwidmlzaWJpbGl0eVwiKXx8XCJoaWRkZW5cIiE9dyhhLFwidmlzaWJpbGl0eVwiKTtmb3IoRi09YyxJKz1jLEctPWMsSCs9YztnJiYoZj1mLm9mZnNldFBhcmVudCkmJmYhPWIuYm9keSYmZiE9ZDspZz0odyhmLFwib3BhY2l0eVwiKXx8MSk+MCxnJiZcInZpc2libGVcIiE9dyhmLFwib3ZlcmZsb3dcIikmJihlPWYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksZz1IPmUubGVmdCYmRzxlLnJpZ2h0JiZJPmUudG9wLTEmJkY8ZS5ib3R0b20rMSk7cmV0dXJuIGd9LFY9ZnVuY3Rpb24oKXt2YXIgYSxlLGcsaSxqLG0sbixwLHE7aWYoKG89Yy5sb2FkTW9kZSkmJjg+UiYmKGE9Zi5sZW5ndGgpKXtlPTAsUysrLG51bGw9PUsmJihcImV4cGFuZFwiaW4gY3x8KGMuZXhwYW5kPWQuY2xpZW50SGVpZ2h0PjUwMCYmZC5jbGllbnRXaWR0aD41MDA/NTAwOjM3MCksSj1jLmV4cGFuZCxLPUoqYy5leHBGYWN0b3IpLEs+USYmMT5SJiZTPjImJm8+MiYmIWIuaGlkZGVuPyhRPUssUz0wKTpRPW8+MSYmUz4xJiY2PlI/SjpQO2Zvcig7YT5lO2UrKylpZihmW2VdJiYhZltlXS5fbGF6eVJhY2UpaWYoTylpZigocD1mW2VdW2hdKFwiZGF0YS1leHBhbmRcIikpJiYobT0xKnApfHwobT1RKSxxIT09bSYmKEM9aW5uZXJXaWR0aCttKkwsRT1pbm5lckhlaWdodCttLG49LTEqbSxxPW0pLGc9ZltlXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwoST1nLmJvdHRvbSk+PW4mJihGPWcudG9wKTw9RSYmKEg9Zy5yaWdodCk+PW4qTCYmKEc9Zy5sZWZ0KTw9QyYmKEl8fEh8fEd8fEYpJiYobCYmMz5SJiYhcCYmKDM+b3x8ND5TKXx8VShmW2VdLG0pKSl7aWYoYmEoZltlXSksaj0hMCxSPjkpYnJlYWt9ZWxzZSFqJiZsJiYhaSYmND5SJiY0PlMmJm8+MiYmKGtbMF18fGMucHJlbG9hZEFmdGVyTG9hZCkmJihrWzBdfHwhcCYmKEl8fEh8fEd8fEZ8fFwiYXV0b1wiIT1mW2VdW2hdKGMuc2l6ZXNBdHRyKSkpJiYoaT1rWzBdfHxmW2VdKTtlbHNlIGJhKGZbZV0pO2kmJiFqJiZiYShpKX19LFc9QShWKSxYPWZ1bmN0aW9uKGEpe3IoYS50YXJnZXQsYy5sb2FkZWRDbGFzcykscyhhLnRhcmdldCxjLmxvYWRpbmdDbGFzcyksdChhLnRhcmdldCxaKX0sWT16KFgpLFo9ZnVuY3Rpb24oYSl7WSh7dGFyZ2V0OmEudGFyZ2V0fSl9LCQ9ZnVuY3Rpb24oYSxiKXt0cnl7YS5jb250ZW50V2luZG93LmxvY2F0aW9uLnJlcGxhY2UoYil9Y2F0Y2goYyl7YS5zcmM9Yn19LF89ZnVuY3Rpb24oYSl7dmFyIGIsZCxlPWFbaF0oYy5zcmNzZXRBdHRyKTsoYj1jLmN1c3RvbU1lZGlhW2FbaF0oXCJkYXRhLW1lZGlhXCIpfHxhW2hdKFwibWVkaWFcIildKSYmYS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLGIpLGUmJmEuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsZSksYiYmKGQ9YS5wYXJlbnROb2RlLGQuaW5zZXJ0QmVmb3JlKGEuY2xvbmVOb2RlKCksYSksZC5yZW1vdmVDaGlsZChhKSl9LGFhPXooZnVuY3Rpb24oYSxiLGQsZSxmKXt2YXIgZyxpLGssbCxvLHE7KG89dShhLFwibGF6eWJlZm9yZXVudmVpbFwiLGIpKS5kZWZhdWx0UHJldmVudGVkfHwoZSYmKGQ/cihhLGMuYXV0b3NpemVzQ2xhc3MpOmEuc2V0QXR0cmlidXRlKFwic2l6ZXNcIixlKSksaT1hW2hdKGMuc3Jjc2V0QXR0ciksZz1hW2hdKGMuc3JjQXR0ciksZiYmKGs9YS5wYXJlbnROb2RlLGw9ayYmbS50ZXN0KGsubm9kZU5hbWV8fFwiXCIpKSxxPWIuZmlyZXNMb2FkfHxcInNyY1wiaW4gYSYmKGl8fGd8fGwpLG89e3RhcmdldDphfSxxJiYodChhLFQsITApLGNsZWFyVGltZW91dChuKSxuPWooVCwyNTAwKSxyKGEsYy5sb2FkaW5nQ2xhc3MpLHQoYSxaLCEwKSksbCYmcC5jYWxsKGsuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzb3VyY2VcIiksXyksaT9hLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGkpOmcmJiFsJiYoTi50ZXN0KGEubm9kZU5hbWUpPyQoYSxnKTphLnNyYz1nKSwoaXx8bCkmJnYoYSx7c3JjOmd9KSksYS5fbGF6eVJhY2UmJmRlbGV0ZSBhLl9sYXp5UmFjZSxzKGEsYy5sYXp5Q2xhc3MpLHkoZnVuY3Rpb24oKXsoIXF8fGEuY29tcGxldGUmJmEubmF0dXJhbFdpZHRoPjEpJiYocT9UKG8pOlItLSxYKG8pKX0sITApfSksYmE9ZnVuY3Rpb24oYSl7dmFyIGIsZD1NLnRlc3QoYS5ub2RlTmFtZSksZT1kJiYoYVtoXShjLnNpemVzQXR0cil8fGFbaF0oXCJzaXplc1wiKSksZj1cImF1dG9cIj09ZTsoIWYmJmx8fCFkfHwhYS5zcmMmJiFhLnNyY3NldHx8YS5jb21wbGV0ZXx8cShhLGMuZXJyb3JDbGFzcykpJiYoYj11KGEsXCJsYXp5dW52ZWlscmVhZFwiKS5kZXRhaWwsZiYmRC51cGRhdGVFbGVtKGEsITAsYS5vZmZzZXRXaWR0aCksYS5fbGF6eVJhY2U9ITAsUisrLGFhKGEsYixmLGUsZCkpfSxjYT1mdW5jdGlvbigpe2lmKCFsKXtpZihlLm5vdygpLXg8OTk5KXJldHVybiB2b2lkIGooY2EsOTk5KTt2YXIgYT1CKGZ1bmN0aW9uKCl7Yy5sb2FkTW9kZT0zLFcoKX0pO2w9ITAsYy5sb2FkTW9kZT0zLFcoKSxpKFwic2Nyb2xsXCIsZnVuY3Rpb24oKXszPT1jLmxvYWRNb2RlJiYoYy5sb2FkTW9kZT0yKSxhKCl9LCEwKX19O3JldHVybntfOmZ1bmN0aW9uKCl7eD1lLm5vdygpLGY9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMubGF6eUNsYXNzKSxrPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmxhenlDbGFzcytcIiBcIitjLnByZWxvYWRDbGFzcyksTD1jLmhGYWMsaShcInNjcm9sbFwiLFcsITApLGkoXCJyZXNpemVcIixXLCEwKSxhLk11dGF0aW9uT2JzZXJ2ZXI/bmV3IE11dGF0aW9uT2JzZXJ2ZXIoVykub2JzZXJ2ZShkLHtjaGlsZExpc3Q6ITAsc3VidHJlZTohMCxhdHRyaWJ1dGVzOiEwfSk6KGRbZ10oXCJET01Ob2RlSW5zZXJ0ZWRcIixXLCEwKSxkW2ddKFwiRE9NQXR0ck1vZGlmaWVkXCIsVywhMCksc2V0SW50ZXJ2YWwoVyw5OTkpKSxpKFwiaGFzaGNoYW5nZVwiLFcsITApLFtcImZvY3VzXCIsXCJtb3VzZW92ZXJcIixcImNsaWNrXCIsXCJsb2FkXCIsXCJ0cmFuc2l0aW9uZW5kXCIsXCJhbmltYXRpb25lbmRcIixcIndlYmtpdEFuaW1hdGlvbkVuZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKGEpe2JbZ10oYSxXLCEwKX0pLC9kJHxeYy8udGVzdChiLnJlYWR5U3RhdGUpP2NhKCk6KGkoXCJsb2FkXCIsY2EpLGJbZ10oXCJET01Db250ZW50TG9hZGVkXCIsVyksaihjYSwyZTQpKSxmLmxlbmd0aD8oVigpLHkuX2xzRmx1c2goKSk6VygpfSxjaGVja0VsZW1zOlcsdW52ZWlsOmJhfX0oKSxEPWZ1bmN0aW9uKCl7dmFyIGEsZD16KGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlLGYsZztpZihhLl9sYXp5c2l6ZXNXaWR0aD1kLGQrPVwicHhcIixhLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZCksbS50ZXN0KGIubm9kZU5hbWV8fFwiXCIpKWZvcihlPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzb3VyY2VcIiksZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyllW2ZdLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZCk7Yy5kZXRhaWwuZGF0YUF0dHJ8fHYoYSxjLmRldGFpbCl9KSxlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZSxmPWEucGFyZW50Tm9kZTtmJiYoYz14KGEsZixjKSxlPXUoYSxcImxhenliZWZvcmVzaXplc1wiLHt3aWR0aDpjLGRhdGFBdHRyOiEhYn0pLGUuZGVmYXVsdFByZXZlbnRlZHx8KGM9ZS5kZXRhaWwud2lkdGgsYyYmYyE9PWEuX2xhenlzaXplc1dpZHRoJiZkKGEsZixlLGMpKSl9LGY9ZnVuY3Rpb24oKXt2YXIgYixjPWEubGVuZ3RoO2lmKGMpZm9yKGI9MDtjPmI7YisrKWUoYVtiXSl9LGc9QihmKTtyZXR1cm57XzpmdW5jdGlvbigpe2E9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMuYXV0b3NpemVzQ2xhc3MpLGkoXCJyZXNpemVcIixnKX0sY2hlY2tFbGVtczpnLHVwZGF0ZUVsZW06ZX19KCksRT1mdW5jdGlvbigpe0UuaXx8KEUuaT0hMCxELl8oKSxDLl8oKSl9O3JldHVybiBmdW5jdGlvbigpe3ZhciBiLGQ9e2xhenlDbGFzczpcImxhenlsb2FkXCIsbG9hZGVkQ2xhc3M6XCJsYXp5bG9hZGVkXCIsbG9hZGluZ0NsYXNzOlwibGF6eWxvYWRpbmdcIixwcmVsb2FkQ2xhc3M6XCJsYXp5cHJlbG9hZFwiLGVycm9yQ2xhc3M6XCJsYXp5ZXJyb3JcIixhdXRvc2l6ZXNDbGFzczpcImxhenlhdXRvc2l6ZXNcIixzcmNBdHRyOlwiZGF0YS1zcmNcIixzcmNzZXRBdHRyOlwiZGF0YS1zcmNzZXRcIixzaXplc0F0dHI6XCJkYXRhLXNpemVzXCIsbWluU2l6ZTo0MCxjdXN0b21NZWRpYTp7fSxpbml0OiEwLGV4cEZhY3RvcjoxLjUsaEZhYzouOCxsb2FkTW9kZToyfTtjPWEubGF6eVNpemVzQ29uZmlnfHxhLmxhenlzaXplc0NvbmZpZ3x8e307Zm9yKGIgaW4gZCliIGluIGN8fChjW2JdPWRbYl0pO2EubGF6eVNpemVzQ29uZmlnPWMsaihmdW5jdGlvbigpe2MuaW5pdCYmRSgpfSl9KCkse2NmZzpjLGF1dG9TaXplcjpELGxvYWRlcjpDLGluaXQ6RSx1UDp2LGFDOnIsckM6cyxoQzpxLGZpcmU6dSxnVzp4LHJBRjp5fX19KTsiLCIvKlxuICAgICBfIF8gICAgICBfICAgICAgIF9cbiBfX198IChfKSBfX198IHwgX18gIChfKV9fX1xuLyBfX3wgfCB8LyBfX3wgfC8gLyAgfCAvIF9ffFxuXFxfXyBcXCB8IHwgKF9ffCAgIDwgXyB8IFxcX18gXFxcbnxfX18vX3xffFxcX19ffF98XFxfKF8pLyB8X19fL1xuICAgICAgICAgICAgICAgICAgIHxfXy9cblxuIFZlcnNpb246IDEuNi4wXG4gIEF1dGhvcjogS2VuIFdoZWVsZXJcbiBXZWJzaXRlOiBodHRwOi8va2Vud2hlZWxlci5naXRodWIuaW9cbiAgICBEb2NzOiBodHRwOi8va2Vud2hlZWxlci5naXRodWIuaW8vc2xpY2tcbiAgICBSZXBvOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrXG4gIElzc3VlczogaHR0cDovL2dpdGh1Yi5jb20va2Vud2hlZWxlci9zbGljay9pc3N1ZXNcblxuICovXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgZGVmaW5lLCBqUXVlcnksIHNldEludGVydmFsLCBjbGVhckludGVydmFsICovXG4oZnVuY3Rpb24oZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG5cbn0oZnVuY3Rpb24oJCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgU2xpY2sgPSB3aW5kb3cuU2xpY2sgfHwge307XG5cbiAgICBTbGljayA9IChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5zdGFuY2VVaWQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIFNsaWNrKGVsZW1lbnQsIHNldHRpbmdzKSB7XG5cbiAgICAgICAgICAgIHZhciBfID0gdGhpcywgZGF0YVNldHRpbmdzO1xuXG4gICAgICAgICAgICBfLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZEFycm93czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcHBlbmREb3RzOiAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmV2QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgY2xhc3M9XCJzbGljay1wcmV2XCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzXCIgdGFiaW5kZXg9XCIwXCIgcm9sZT1cImJ1dHRvblwiPlByZXZpb3VzPC9idXR0b24+JyxcbiAgICAgICAgICAgICAgICBuZXh0QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgY2xhc3M9XCJzbGljay1uZXh0XCIgYXJpYS1sYWJlbD1cIk5leHRcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwiYnV0dG9uXCI+TmV4dDwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6IDMwMDAsXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxuICAgICAgICAgICAgICAgIGNzc0Vhc2U6ICdlYXNlJyxcbiAgICAgICAgICAgICAgICBjdXN0b21QYWdpbmc6IGZ1bmN0aW9uKHNsaWRlciwgaSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiAvPicpLnRleHQoaSArIDEpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cycsXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVhc2luZzogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgZWRnZUZyaWN0aW9uOiAwLjM1LFxuICAgICAgICAgICAgICAgIGZhZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGluaXRpYWxTbGlkZTogMCxcbiAgICAgICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcbiAgICAgICAgICAgICAgICBtb2JpbGVGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Gb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRG90c0hvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXNwb25kVG86ICd3aW5kb3cnLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgcm93czogMSxcbiAgICAgICAgICAgICAgICBydGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlOiAnJyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJSb3c6IDEsXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgIHNwZWVkOiA1MDAsXG4gICAgICAgICAgICAgICAgc3dpcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3VjaE1vdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDUsXG4gICAgICAgICAgICAgICAgdXNlQ1NTOiB0cnVlLFxuICAgICAgICAgICAgICAgIHVzZVRyYW5zZm9ybTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVdpZHRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWxTd2lwaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3YWl0Rm9yQW5pbWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDEwMDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF8uaW5pdGlhbHMgPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkcmFnZ2luZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXV0b1BsYXlUaW1lcjogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50RGlyZWN0aW9uOiAwLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTbGlkZTogMCxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDEsXG4gICAgICAgICAgICAgICAgJGRvdHM6IG51bGwsXG4gICAgICAgICAgICAgICAgbGlzdFdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RIZWlnaHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9hZEluZGV4OiAwLFxuICAgICAgICAgICAgICAgICRuZXh0QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgJHByZXZBcnJvdzogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZUNvdW50OiBudWxsLFxuICAgICAgICAgICAgICAgIHNsaWRlV2lkdGg6IG51bGwsXG4gICAgICAgICAgICAgICAgJHNsaWRlVHJhY2s6IG51bGwsXG4gICAgICAgICAgICAgICAgJHNsaWRlczogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldDogMCxcbiAgICAgICAgICAgICAgICBzd2lwZUxlZnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgJGxpc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdG91Y2hPYmplY3Q6IHt9LFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybXNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1bnNsaWNrZWQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzKTtcblxuICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltUHJvcCA9IG51bGw7XG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRzID0gW107XG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5ncyA9IFtdO1xuICAgICAgICAgICAgXy5jc3NUcmFuc2l0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgXy5mb2N1c3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5oaWRkZW4gPSAnaGlkZGVuJztcbiAgICAgICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIF8ucG9zaXRpb25Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gbnVsbDtcbiAgICAgICAgICAgIF8ucm93Q291bnQgPSAxO1xuICAgICAgICAgICAgXy5zaG91bGRDbGljayA9IHRydWU7XG4gICAgICAgICAgICBfLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9IDA7XG4gICAgICAgICAgICBfLndpbmRvd1RpbWVyID0gbnVsbDtcblxuICAgICAgICAgICAgZGF0YVNldHRpbmdzID0gJChlbGVtZW50KS5kYXRhKCdzbGljaycpIHx8IHt9O1xuXG4gICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5kZWZhdWx0cywgc2V0dGluZ3MsIGRhdGFTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcblxuICAgICAgICAgICAgXy5vcmlnaW5hbFNldHRpbmdzID0gXy5vcHRpb25zO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICdtb3p2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5hdXRvUGxheSA9ICQucHJveHkoXy5hdXRvUGxheSwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIgPSAkLnByb3h5KF8uYXV0b1BsYXlDbGVhciwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5SXRlcmF0b3IgPSAkLnByb3h5KF8uYXV0b1BsYXlJdGVyYXRvciwgXyk7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlID0gJC5wcm94eShfLmNoYW5nZVNsaWRlLCBfKTtcbiAgICAgICAgICAgIF8uY2xpY2tIYW5kbGVyID0gJC5wcm94eShfLmNsaWNrSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNlbGVjdEhhbmRsZXIgPSAkLnByb3h5KF8uc2VsZWN0SGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uID0gJC5wcm94eShfLnNldFBvc2l0aW9uLCBfKTtcbiAgICAgICAgICAgIF8uc3dpcGVIYW5kbGVyID0gJC5wcm94eShfLnN3aXBlSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmRyYWdIYW5kbGVyID0gJC5wcm94eShfLmRyYWdIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8ua2V5SGFuZGxlciA9ICQucHJveHkoXy5rZXlIYW5kbGVyLCBfKTtcblxuICAgICAgICAgICAgXy5pbnN0YW5jZVVpZCA9IGluc3RhbmNlVWlkKys7XG5cbiAgICAgICAgICAgIC8vIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzXG4gICAgICAgICAgICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAobXVzdCBzdGFydCB3aXRoIDwpXG4gICAgICAgICAgICAvLyBFeHRyYWN0ZWQgZnJvbSBqUXVlcnkgdjEuMTEgc291cmNlXG4gICAgICAgICAgICBfLmh0bWxFeHByID0gL14oPzpcXHMqKDxbXFx3XFxXXSs+KVtePl0qKSQvO1xuXG5cbiAgICAgICAgICAgIF8ucmVnaXN0ZXJCcmVha3BvaW50cygpO1xuICAgICAgICAgICAgXy5pbml0KHRydWUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU2xpY2s7XG5cbiAgICB9KCkpO1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFjdGl2YXRlQURBID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1hY3RpdmUnKS5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICdmYWxzZSdcbiAgICAgICAgfSkuZmluZCgnYSwgaW5wdXQsIGJ1dHRvbiwgc2VsZWN0JykuYXR0cih7XG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnMCdcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFkZFNsaWRlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQWRkID0gZnVuY3Rpb24obWFya3VwLCBpbmRleCwgYWRkQmVmb3JlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGFkZEJlZm9yZSA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGluZGV4IDwgMCB8fCAoaW5kZXggPj0gXy5zbGlkZUNvdW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCAmJiBfLiRzbGlkZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhZGRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QmVmb3JlKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QWZ0ZXIoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYWRkQmVmb3JlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLnByZXBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmFwcGVuZChfLiRzbGlkZXMpO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICBfLiRsaXN0LmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0SGVpZ2h0XG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hbmltYXRlU2xpZGUgPSBmdW5jdGlvbih0YXJnZXRMZWZ0LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBhbmltUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAtdGFyZ2V0TGVmdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy50cmFuc2Zvcm1zRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRMZWZ0ID0gLShfLmN1cnJlbnRMZWZ0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJCh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogXy5jdXJyZW50TGVmdFxuICAgICAgICAgICAgICAgIH0pLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBhbmltU3RhcnQ6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBfLm9wdGlvbnMuc3BlZWQsXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogXy5vcHRpb25zLmVhc2luZyxcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogZnVuY3Rpb24obm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBNYXRoLmNlaWwobm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKDBweCwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgJ3B4KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbigpO1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSBNYXRoLmNlaWwodGFyZ2V0TGVmdCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHRhcmdldExlZnQgKyAncHgsIDBweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKDBweCwnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgXy5kaXNhYmxlVHJhbnNpdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXROYXZUYXJnZXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBhc05hdkZvciA9IF8ub3B0aW9ucy5hc05hdkZvcjtcblxuICAgICAgICBpZiAoIGFzTmF2Rm9yICYmIGFzTmF2Rm9yICE9PSBudWxsICkge1xuICAgICAgICAgICAgYXNOYXZGb3IgPSAkKGFzTmF2Rm9yKS5ub3QoXy4kc2xpZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhc05hdkZvcjtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXNOYXZGb3IgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gXy5nZXROYXZUYXJnZXQoKTtcblxuICAgICAgICBpZiAoIGFzTmF2Rm9yICE9PSBudWxsICYmIHR5cGVvZiBhc05hdkZvciA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgICAgICBhc05hdkZvci5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMpLnNsaWNrKCdnZXRTbGljaycpO1xuICAgICAgICAgICAgICAgIGlmKCF0YXJnZXQudW5zbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zbGlkZUhhbmRsZXIoaW5kZXgsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFwcGx5VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNsaWRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHt9O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSBfLnRyYW5zZm9ybVR5cGUgKyAnICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICdvcGFjaXR5ICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcblxuICAgICAgICBpZiAoIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5VGltZXIgPSBzZXRJbnRlcnZhbCggXy5hdXRvUGxheUl0ZXJhdG9yLCBfLm9wdGlvbnMuYXV0b3BsYXlTcGVlZCApO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5Q2xlYXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5SXRlcmF0b3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZVRvID0gXy5jdXJyZW50U2xpZGUgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgaWYgKCAhXy5wYXVzZWQgJiYgIV8uaW50ZXJydXB0ZWQgJiYgIV8uZm9jdXNzZWQgKSB7XG5cbiAgICAgICAgICAgIGlmICggXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggXy5kaXJlY3Rpb24gPT09IDEgJiYgKCBfLmN1cnJlbnRTbGlkZSArIDEgKSA9PT0gKCBfLnNsaWRlQ291bnQgLSAxICkpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBfLmRpcmVjdGlvbiA9PT0gMCApIHtcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZVRvID0gXy5jdXJyZW50U2xpZGUgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBfLmN1cnJlbnRTbGlkZSAtIDEgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggc2xpZGVUbyApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyA9ICQoXy5vcHRpb25zLnByZXZBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cgPSAkKF8ub3B0aW9ucy5uZXh0QXJyb3cpLmFkZENsYXNzKCdzbGljay1hcnJvdycpO1xuXG4gICAgICAgICAgICBpZiggXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcblxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2staGlkZGVuJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXgnKTtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5wcmV2QXJyb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5wcmVwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMubmV4dEFycm93KSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5hZGQoIF8uJG5leHRBcnJvdyApXG5cbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYXJpYS1kaXNhYmxlZCc6ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkRG90cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGksIGRvdDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgICAgICBkb3QgPSAkKCc8dWwgLz4nKS5hZGRDbGFzcyhfLm9wdGlvbnMuZG90c0NsYXNzKTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8PSBfLmdldERvdENvdW50KCk7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGRvdC5hcHBlbmQoJCgnPGxpIC8+JykuYXBwZW5kKF8ub3B0aW9ucy5jdXN0b21QYWdpbmcuY2FsbCh0aGlzLCBfLCBpKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRkb3RzID0gZG90LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmREb3RzKTtcblxuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZE91dCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXMgPVxuICAgICAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKCBfLm9wdGlvbnMuc2xpZGUgKyAnOm5vdCguc2xpY2stY2xvbmVkKScpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudClcbiAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KVxuICAgICAgICAgICAgICAgIC5kYXRhKCdvcmlnaW5hbFN0eWxpbmcnLCAkKGVsZW1lbnQpLmF0dHIoJ3N0eWxlJykgfHwgJycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2sgPSAoXy5zbGlkZUNvdW50ID09PSAwKSA/XG4gICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykuYXBwZW5kVG8oXy4kc2xpZGVyKSA6XG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xuXG4gICAgICAgIF8uJGxpc3QgPSBfLiRzbGlkZVRyYWNrLndyYXAoXG4gICAgICAgICAgICAnPGRpdiBhcmlhLWxpdmU9XCJwb2xpdGVcIiBjbGFzcz1cInNsaWNrLWxpc3RcIi8+JykucGFyZW50KCk7XG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKCdvcGFjaXR5JywgMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubm90KCdbc3JjXScpLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuXG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG5cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5hZGRDbGFzcygnZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBhLCBiLCBjLCBuZXdTbGlkZXMsIG51bU9mU2xpZGVzLCBvcmlnaW5hbFNsaWRlcyxzbGlkZXNQZXJTZWN0aW9uO1xuXG4gICAgICAgIG5ld1NsaWRlcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXIuY2hpbGRyZW4oKTtcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDEpIHtcblxuICAgICAgICAgICAgc2xpZGVzUGVyU2VjdGlvbiA9IF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cgKiBfLm9wdGlvbnMucm93cztcbiAgICAgICAgICAgIG51bU9mU2xpZGVzID0gTWF0aC5jZWlsKFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzLmxlbmd0aCAvIHNsaWRlc1BlclNlY3Rpb25cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGZvcihhID0gMDsgYSA8IG51bU9mU2xpZGVzOyBhKyspe1xuICAgICAgICAgICAgICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGZvcihiID0gMDsgYiA8IF8ub3B0aW9ucy5yb3dzOyBiKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBmb3IoYyA9IDA7IGMgPCBfLm9wdGlvbnMuc2xpZGVzUGVyUm93OyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAoYSAqIHNsaWRlc1BlclNlY3Rpb24gKyAoKGIgKiBfLm9wdGlvbnMuc2xpZGVzUGVyUm93KSArIGMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFNsaWRlcy5nZXQodGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChvcmlnaW5hbFNsaWRlcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2xpZGUuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U2xpZGVzLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kc2xpZGVyLmVtcHR5KCkuYXBwZW5kKG5ld1NsaWRlcyk7XG4gICAgICAgICAgICBfLiRzbGlkZXIuY2hpbGRyZW4oKS5jaGlsZHJlbigpLmNoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgJ3dpZHRoJzooMTAwIC8gXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyAnJScsXG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaydcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrUmVzcG9uc2l2ZSA9IGZ1bmN0aW9uKGluaXRpYWwsIGZvcmNlVXBkYXRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYnJlYWtwb2ludCwgdGFyZ2V0QnJlYWtwb2ludCwgcmVzcG9uZFRvV2lkdGgsIHRyaWdnZXJCcmVha3BvaW50ID0gZmFsc2U7XG4gICAgICAgIHZhciBzbGlkZXJXaWR0aCA9IF8uJHNsaWRlci53aWR0aCgpO1xuICAgICAgICB2YXIgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICBpZiAoXy5yZXNwb25kVG8gPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ucmVzcG9uZFRvID09PSAnc2xpZGVyJykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBzbGlkZXJXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gTWF0aC5taW4od2luZG93V2lkdGgsIHNsaWRlcldpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLnJlc3BvbnNpdmUgJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLmxlbmd0aCAmJlxuICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IG51bGw7XG5cbiAgICAgICAgICAgIGZvciAoYnJlYWtwb2ludCBpbiBfLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludHMuaGFzT3duUHJvcGVydHkoYnJlYWtwb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3JpZ2luYWxTZXR0aW5ncy5tb2JpbGVGaXJzdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA8IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gXy5icmVha3BvaW50c1ticmVha3BvaW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA+IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gXy5icmVha3BvaW50c1ticmVha3BvaW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5hY3RpdmVCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBfLmFjdGl2ZUJyZWFrcG9pbnQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRTZXR0aW5nc1t0YXJnZXRCcmVha3BvaW50XSA9PT0gJ3Vuc2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRTZXR0aW5nc1t0YXJnZXRCcmVha3BvaW50XSA9PT0gJ3Vuc2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnVuc2xpY2sodGFyZ2V0QnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5hY3RpdmVCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucyA9IF8ub3JpZ2luYWxTZXR0aW5ncztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBicmVha3BvaW50cyBkdXJpbmcgYW4gYWN0dWFsIGJyZWFrLiBub3Qgb24gaW5pdGlhbGl6ZS5cbiAgICAgICAgICAgIGlmKCAhaW5pdGlhbCAmJiB0cmlnZ2VyQnJlYWtwb2ludCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2JyZWFrcG9pbnQnLCBbXywgdHJpZ2dlckJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGFuZ2VTbGlkZSA9IGZ1bmN0aW9uKGV2ZW50LCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgICR0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLFxuICAgICAgICAgICAgaW5kZXhPZmZzZXQsIHNsaWRlT2Zmc2V0LCB1bmV2ZW5PZmZzZXQ7XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIGEgbGluaywgcHJldmVudCBkZWZhdWx0IGFjdGlvbi5cbiAgICAgICAgaWYoJHRhcmdldC5pcygnYScpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIG5vdCB0aGUgPGxpPiBlbGVtZW50IChpZTogYSBjaGlsZCksIGZpbmQgdGhlIDxsaT4uXG4gICAgICAgIGlmKCEkdGFyZ2V0LmlzKCdsaScpKSB7XG4gICAgICAgICAgICAkdGFyZ2V0ID0gJHRhcmdldC5jbG9zZXN0KCdsaScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdW5ldmVuT2Zmc2V0ID0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCk7XG4gICAgICAgIGluZGV4T2Zmc2V0ID0gdW5ldmVuT2Zmc2V0ID8gMCA6IChfLnNsaWRlQ291bnQgLSBfLmN1cnJlbnRTbGlkZSkgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLm1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgY2FzZSAncHJldmlvdXMnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBpbmRleE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmRhdGEuaW5kZXggPT09IDAgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGF0YS5pbmRleCB8fCAkdGFyZ2V0LmluZGV4KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmNoZWNrTmF2aWdhYmxlKGluZGV4KSwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmNoaWxkcmVuKCkudHJpZ2dlcignZm9jdXMnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hlY2tOYXZpZ2FibGUgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIG5hdmlnYWJsZXMsIHByZXZOYXZpZ2FibGU7XG5cbiAgICAgICAgbmF2aWdhYmxlcyA9IF8uZ2V0TmF2aWdhYmxlSW5kZXhlcygpO1xuICAgICAgICBwcmV2TmF2aWdhYmxlID0gMDtcbiAgICAgICAgaWYgKGluZGV4ID4gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICBpbmRleCA9IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gbmF2aWdhYmxlcykge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IG5hdmlnYWJsZXNbbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBwcmV2TmF2aWdhYmxlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldk5hdmlnYWJsZSA9IG5hdmlnYWJsZXNbbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyAmJiBfLiRkb3RzICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cylcbiAgICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpXG4gICAgICAgICAgICAgICAgLm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cgJiYgXy4kbmV4dEFycm93Lm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9mZignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKF8udmlzaWJpbGl0eUNoYW5nZSwgXy52aXNpYmlsaXR5KTtcblxuICAgICAgICBfLmNsZWFuVXBTbGlkZUV2ZW50cygpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5vZmYoJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub2ZmKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5vcmllbnRhdGlvbkNoYW5nZSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnJlc2l6ZSk7XG5cbiAgICAgICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vZmYoJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ3JlYWR5LnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFNsaWRlRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICBfLiRsaXN0Lm9mZignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBvcmlnaW5hbFNsaWRlcztcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDEpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVzLmNoaWxkcmVuKCkuY2hpbGRyZW4oKTtcbiAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICBfLiRzbGlkZXIuZW1wdHkoKS5hcHBlbmQob3JpZ2luYWxTbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLnNob3VsZENsaWNrID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKHJlZnJlc2gpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgIF8uY2xlYW5VcEV2ZW50cygpO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLmRldGFjaCgpO1xuXG4gICAgICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5wcmV2QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIF8uJG5leHRBcnJvd1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQgc2xpY2stYXJyb3cgc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gYXJpYS1kaXNhYmxlZCB0YWJpbmRleCcpXG4gICAgICAgICAgICAgICAgLmNzcygnZGlzcGxheScsJycpO1xuXG4gICAgICAgICAgICBpZiAoIF8uaHRtbEV4cHIudGVzdCggXy5vcHRpb25zLm5leHRBcnJvdyApKSB7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChfLiRzbGlkZXMpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stY2VudGVyIHNsaWNrLXZpc2libGUgc2xpY2stY3VycmVudCcpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zbGljay1pbmRleCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdzdHlsZScsICQodGhpcykuZGF0YSgnb3JpZ2luYWxTdHlsaW5nJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJGxpc3QuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5hcHBlbmQoXy4kc2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uY2xlYW5VcFJvd3MoKTtcblxuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJyk7XG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stZG90dGVkJyk7XG5cbiAgICAgICAgXy51bnNsaWNrZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmKCFyZWZyZXNoKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignZGVzdHJveScsIFtfXSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZGlzYWJsZVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gJyc7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGUgPSBmdW5jdGlvbihzbGlkZUluZGV4LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5kaXNhYmxlVHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZhZGVTbGlkZU91dCA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZyk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMlxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5maWx0ZXJTbGlkZXMgPSBTbGljay5wcm90b3R5cGUuc2xpY2tGaWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGZpbHRlciAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXNDYWNoZS5maWx0ZXIoZmlsdGVyKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcblxuICAgICAgICAgICAgXy5yZWluaXQoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZvY3VzSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXJcbiAgICAgICAgICAgIC5vZmYoJ2ZvY3VzLnNsaWNrIGJsdXIuc2xpY2snKVxuICAgICAgICAgICAgLm9uKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJyxcbiAgICAgICAgICAgICAgICAnKjpub3QoLnNsaWNrLWFycm93KScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdmFyICRzZiA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnBhdXNlT25Gb2N1cyApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5mb2N1c3NlZCA9ICRzZi5pcygnOmZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0Q3VycmVudCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0N1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgcmV0dXJuIF8uY3VycmVudFNsaWRlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXREb3RDb3VudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICB2YXIgYnJlYWtQb2ludCA9IDA7XG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgICAgdmFyIHBhZ2VyUXR5ID0gMDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gXy5zbGlkZUNvdW50O1xuICAgICAgICB9IGVsc2UgaWYoIV8ub3B0aW9ucy5hc05hdkZvcikge1xuICAgICAgICAgICAgcGFnZXJRdHkgPSAxICsgTWF0aC5jZWlsKChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgKytwYWdlclF0eTtcbiAgICAgICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYWdlclF0eSAtIDE7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgIHZlcnRpY2FsSGVpZ2h0LFxuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwLFxuICAgICAgICAgICAgdGFyZ2V0U2xpZGU7XG5cbiAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgIHZlcnRpY2FsSGVpZ2h0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKF8uc2xpZGVXaWR0aCAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpICogLTE7XG4gICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAodmVydGljYWxIZWlnaHQgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsID4gXy5zbGlkZUNvdW50ICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogXy5zbGlkZVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpICogXy5zbGlkZVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiBfLnNsaWRlV2lkdGg7XG4gICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiB2ZXJ0aWNhbEhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgJiYgXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIC0gXy5zbGlkZVdpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9ICgoc2xpZGVJbmRleCAqIF8uc2xpZGVXaWR0aCkgKiAtMSkgKyBfLnNsaWRlT2Zmc2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9ICgoc2xpZGVJbmRleCAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xKSArIHZlcnRpY2FsT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFNsaWRlWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAoXy4kc2xpZGVUcmFjay53aWR0aCgpIC0gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAtIHRhcmdldFNsaWRlLndpZHRoKCkpICogLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9ICAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldFNsaWRlWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uJHNsaWRlVHJhY2sud2lkdGgoKSAtIHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgLSB0YXJnZXRTbGlkZS53aWR0aCgpKSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9ICAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ICs9IChfLiRsaXN0LndpZHRoKCkgLSB0YXJnZXRTbGlkZS5vdXRlcldpZHRoKCkpIC8gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRMZWZ0O1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRPcHRpb24gPSBTbGljay5wcm90b3R5cGUuc2xpY2tHZXRPcHRpb24gPSBmdW5jdGlvbihvcHRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIF8ub3B0aW9uc1tvcHRpb25dO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXROYXZpZ2FibGVJbmRleGVzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYnJlYWtQb2ludCA9IDAsXG4gICAgICAgICAgICBjb3VudGVyID0gMCxcbiAgICAgICAgICAgIGluZGV4ZXMgPSBbXSxcbiAgICAgICAgICAgIG1heDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbWF4ID0gXy5zbGlkZUNvdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWtQb2ludCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAqIC0xO1xuICAgICAgICAgICAgY291bnRlciA9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAqIC0xO1xuICAgICAgICAgICAgbWF4ID0gXy5zbGlkZUNvdW50ICogMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgbWF4KSB7XG4gICAgICAgICAgICBpbmRleGVzLnB1c2goYnJlYWtQb2ludCk7XG4gICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgICAgIGNvdW50ZXIgKz0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4ZXM7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldFNsaWNrID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldFNsaWRlQ291bnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZXNUcmF2ZXJzZWQsIHN3aXBlZFNsaWRlLCBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgPyBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSA6IDA7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLXNsaWRlJykuZWFjaChmdW5jdGlvbihpbmRleCwgc2xpZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGUub2Zmc2V0TGVmdCAtIGNlbnRlck9mZnNldCArICgkKHNsaWRlKS5vdXRlcldpZHRoKCkgLyAyKSA+IChfLnN3aXBlTGVmdCAqIC0xKSkge1xuICAgICAgICAgICAgICAgICAgICBzd2lwZWRTbGlkZSA9IHNsaWRlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNsaWRlc1RyYXZlcnNlZCA9IE1hdGguYWJzKCQoc3dpcGVkU2xpZGUpLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSAtIF8uY3VycmVudFNsaWRlKSB8fCAxO1xuXG4gICAgICAgICAgICByZXR1cm4gc2xpZGVzVHJhdmVyc2VkO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdvVG8gPSBTbGljay5wcm90b3R5cGUuc2xpY2tHb1RvID0gZnVuY3Rpb24oc2xpZGUsIGRvbnRBbmltYXRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgaW5kZXg6IHBhcnNlSW50KHNsaWRlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBkb250QW5pbWF0ZSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjcmVhdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoISQoXy4kc2xpZGVyKS5oYXNDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKSkge1xuXG4gICAgICAgICAgICAkKF8uJHNsaWRlcikuYWRkQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJyk7XG5cbiAgICAgICAgICAgIF8uYnVpbGRSb3dzKCk7XG4gICAgICAgICAgICBfLmJ1aWxkT3V0KCk7XG4gICAgICAgICAgICBfLnNldFByb3BzKCk7XG4gICAgICAgICAgICBfLnN0YXJ0TG9hZCgpO1xuICAgICAgICAgICAgXy5sb2FkU2xpZGVyKCk7XG4gICAgICAgICAgICBfLmluaXRpYWxpemVFdmVudHMoKTtcbiAgICAgICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKHRydWUpO1xuICAgICAgICAgICAgXy5mb2N1c0hhbmRsZXIoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNyZWF0aW9uKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignaW5pdCcsIFtfXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uaW5pdEFEQSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG5cbiAgICAgICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0QURBID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgXy4kc2xpZGVzLmFkZChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmF0dHIoJ3JvbGUnLCAnbGlzdGJveCcpO1xuXG4gICAgICAgIF8uJHNsaWRlcy5ub3QoXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykpLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKHtcbiAgICAgICAgICAgICAgICAncm9sZSc6ICdvcHRpb24nLFxuICAgICAgICAgICAgICAgICdhcmlhLWRlc2NyaWJlZGJ5JzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpICsgJydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgXy4kZG90cy5hdHRyKCdyb2xlJywgJ3RhYmxpc3QnKS5maW5kKCdsaScpLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3ByZXNlbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FyaWEtY29udHJvbHMnOiAnbmF2aWdhdGlvbicgKyBfLmluc3RhbmNlVWlkICsgaSArICcnLFxuICAgICAgICAgICAgICAgICAgICAnaWQnOiAnc2xpY2stc2xpZGUnICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlyc3QoKS5hdHRyKCdhcmlhLXNlbGVjdGVkJywgJ3RydWUnKS5lbmQoKVxuICAgICAgICAgICAgICAgIC5maW5kKCdidXR0b24nKS5hdHRyKCdyb2xlJywgJ2J1dHRvbicpLmVuZCgpXG4gICAgICAgICAgICAgICAgLmNsb3Nlc3QoJ2RpdicpLmF0dHIoJ3JvbGUnLCAndG9vbGJhcicpO1xuICAgICAgICB9XG4gICAgICAgIF8uYWN0aXZhdGVBREEoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdEFycm93RXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvd1xuICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdERvdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKS5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4J1xuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRTbGlkZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5wYXVzZU9uSG92ZXIgKSB7XG5cbiAgICAgICAgICAgIF8uJGxpc3Qub24oJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSk7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRpYWxpemVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5pbml0QXJyb3dFdmVudHMoKTtcblxuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcbiAgICAgICAgXy5pbml0U2xpZGVFdmVudHMoKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0J1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdtb3ZlJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2VuZCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub24oJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKF8udmlzaWJpbGl0eUNoYW5nZSwgJC5wcm94eShfLnZpc2liaWxpdHksIF8pKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3Qub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQod2luZG93KS5vbignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsICQucHJveHkoXy5vcmllbnRhdGlvbkNoYW5nZSwgXykpO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ucmVzaXplLCBfKSk7XG5cbiAgICAgICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vbignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3JlYWR5LnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdFVJID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93LnNob3coKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5zaG93KCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUua2V5SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICAgLy9Eb250IHNsaWRlIGlmIHRoZSBjdXJzb3IgaXMgaW5zaWRlIHRoZSBmb3JtIGZpZWxkcyBhbmQgYXJyb3cga2V5cyBhcmUgcHJlc3NlZFxuICAgICAgICBpZighZXZlbnQudGFyZ2V0LnRhZ05hbWUubWF0Y2goJ1RFWFRBUkVBfElOUFVUfFNFTEVDVCcpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSA/ICduZXh0JyA6ICAncHJldmlvdXMnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzkgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSA/ICdwcmV2aW91cycgOiAnbmV4dCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxhenlMb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbG9hZFJhbmdlLCBjbG9uZVJhbmdlLCByYW5nZVN0YXJ0LCByYW5nZUVuZDtcblxuICAgICAgICBmdW5jdGlvbiBsb2FkSW1hZ2VzKGltYWdlc1Njb3BlKSB7XG5cbiAgICAgICAgICAgICQoJ2ltZ1tkYXRhLWxhenldJywgaW1hZ2VzU2NvcGUpLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZSA9ICQodGhpcykuYXR0cignZGF0YS1sYXp5JyksXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyBvcGFjaXR5OiAwIH0sIDEwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NyYycsIGltYWdlU291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZGVkJywgW18sIGltYWdlLCBpbWFnZVNvdXJjZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0ciggJ2RhdGEtbGF6eScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAnc2xpY2stbG9hZGluZycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnc2xpY2stbGF6eWxvYWQtZXJyb3InICk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2xhenlMb2FkRXJyb3InLCBbIF8sIGltYWdlLCBpbWFnZVNvdXJjZSBdKTtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZC5zcmMgPSBpbWFnZVNvdXJjZTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJhbmdlU3RhcnQgPSBfLmN1cnJlbnRTbGlkZSArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gcmFuZ2VTdGFydCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gTWF0aC5tYXgoMCwgXy5jdXJyZW50U2xpZGUgLSAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKSk7XG4gICAgICAgICAgICAgICAgcmFuZ2VFbmQgPSAyICsgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkgKyBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmdlU3RhcnQgPSBfLm9wdGlvbnMuaW5maW5pdGUgPyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgXy5jdXJyZW50U2xpZGUgOiBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgIHJhbmdlRW5kID0gTWF0aC5jZWlsKHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChyYW5nZVN0YXJ0ID4gMCkgcmFuZ2VTdGFydC0tO1xuICAgICAgICAgICAgICAgIGlmIChyYW5nZUVuZCA8PSBfLnNsaWRlQ291bnQpIHJhbmdlRW5kKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJykuc2xpY2UocmFuZ2VTdGFydCwgcmFuZ2VFbmQpO1xuICAgICAgICBsb2FkSW1hZ2VzKGxvYWRSYW5nZSk7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZSgwLCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKiAtMSk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxvYWRTbGlkZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5pbml0VUkoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAncHJvZ3Jlc3NpdmUnKSB7XG4gICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5uZXh0ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrTmV4dCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm9yaWVudGF0aW9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGF1c2UgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQYXVzZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICAgICAgXy5wYXVzZWQgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wbGF5ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIF8ub3B0aW9ucy5hdXRvcGxheSA9IHRydWU7XG4gICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wb3N0U2xpZGUgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiggIV8udW5zbGlja2VkICkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWZ0ZXJDaGFuZ2UnLCBbXywgaW5kZXhdKTtcblxuICAgICAgICAgICAgXy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuICAgICAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5pbml0QURBKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUHJldiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAncHJldmlvdXMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJvZ3Jlc3NpdmVMYXp5TG9hZCA9IGZ1bmN0aW9uKCB0cnlDb3VudCApIHtcblxuICAgICAgICB0cnlDb3VudCA9IHRyeUNvdW50IHx8IDE7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgJGltZ3NUb0xvYWQgPSAkKCAnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIgKSxcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgaW1hZ2VTb3VyY2UsXG4gICAgICAgICAgICBpbWFnZVRvTG9hZDtcblxuICAgICAgICBpZiAoICRpbWdzVG9Mb2FkLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgaW1hZ2UgPSAkaW1nc1RvTG9hZC5maXJzdCgpO1xuICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSBpbWFnZS5hdHRyKCdkYXRhLWxhenknKTtcbiAgICAgICAgICAgIGltYWdlVG9Mb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoICdzcmMnLCBpbWFnZVNvdXJjZSApXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenknKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgICAgICAgICAgICAgIGlmICggXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2xhenlMb2FkZWQnLCBbIF8sIGltYWdlLCBpbWFnZVNvdXJjZSBdKTtcbiAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCB0cnlDb3VudCA8IDMgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHRyeSB0byBsb2FkIHRoZSBpbWFnZSAzIHRpbWVzLFxuICAgICAgICAgICAgICAgICAgICAgKiBsZWF2ZSBhIHNsaWdodCBkZWxheSBzbyB3ZSBkb24ndCBnZXRcbiAgICAgICAgICAgICAgICAgICAgICogc2VydmVycyBibG9ja2luZyB0aGUgcmVxdWVzdC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCB0cnlDb3VudCArIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwICk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0ciggJ2RhdGEtbGF6eScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAnc2xpY2stbG9hZGluZycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnc2xpY2stbGF6eWxvYWQtZXJyb3InICk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2xhenlMb2FkRXJyb3InLCBbIF8sIGltYWdlLCBpbWFnZVNvdXJjZSBdKTtcblxuICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FsbEltYWdlc0xvYWRlZCcsIFsgXyBdKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiggaW5pdGlhbGl6aW5nICkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgY3VycmVudFNsaWRlLCBsYXN0VmlzaWJsZUluZGV4O1xuXG4gICAgICAgIGxhc3RWaXNpYmxlSW5kZXggPSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuXG4gICAgICAgIC8vIGluIG5vbi1pbmZpbml0ZSBzbGlkZXJzLCB3ZSBkb24ndCB3YW50IHRvIGdvIHBhc3QgdGhlXG4gICAgICAgIC8vIGxhc3QgdmlzaWJsZSBpbmRleC5cbiAgICAgICAgaWYoICFfLm9wdGlvbnMuaW5maW5pdGUgJiYgKCBfLmN1cnJlbnRTbGlkZSA+IGxhc3RWaXNpYmxlSW5kZXggKSkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBsYXN0VmlzaWJsZUluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgbGVzcyBzbGlkZXMgdGhhbiB0byBzaG93LCBnbyB0byBzdGFydC5cbiAgICAgICAgaWYgKCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gMDtcblxuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG5cbiAgICAgICAgXy5kZXN0cm95KHRydWUpO1xuXG4gICAgICAgICQuZXh0ZW5kKF8sIF8uaW5pdGlhbHMsIHsgY3VycmVudFNsaWRlOiBjdXJyZW50U2xpZGUgfSk7XG5cbiAgICAgICAgXy5pbml0KCk7XG5cbiAgICAgICAgaWYoICFpbml0aWFsaXppbmcgKSB7XG5cbiAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGN1cnJlbnRTbGlkZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlZ2lzdGVyQnJlYWtwb2ludHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGJyZWFrcG9pbnQsIGN1cnJlbnRCcmVha3BvaW50LCBsLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzID0gXy5vcHRpb25zLnJlc3BvbnNpdmUgfHwgbnVsbDtcblxuICAgICAgICBpZiAoICQudHlwZShyZXNwb25zaXZlU2V0dGluZ3MpID09PSAnYXJyYXknICYmIHJlc3BvbnNpdmVTZXR0aW5ncy5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gXy5vcHRpb25zLnJlc3BvbmRUbyB8fCAnd2luZG93JztcblxuICAgICAgICAgICAgZm9yICggYnJlYWtwb2ludCBpbiByZXNwb25zaXZlU2V0dGluZ3MgKSB7XG5cbiAgICAgICAgICAgICAgICBsID0gXy5icmVha3BvaW50cy5sZW5ndGgtMTtcbiAgICAgICAgICAgICAgICBjdXJyZW50QnJlYWtwb2ludCA9IHJlc3BvbnNpdmVTZXR0aW5nc1ticmVha3BvaW50XS5icmVha3BvaW50O1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNpdmVTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShicmVha3BvaW50KSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYnJlYWtwb2ludHMgYW5kIGN1dCBvdXQgYW55IGV4aXN0aW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG9uZXMgd2l0aCB0aGUgc2FtZSBicmVha3BvaW50IG51bWJlciwgd2UgZG9uJ3Qgd2FudCBkdXBlcy5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGwgPj0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLmJyZWFrcG9pbnRzW2xdICYmIF8uYnJlYWtwb2ludHNbbF0gPT09IGN1cnJlbnRCcmVha3BvaW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc3BsaWNlKGwsMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsLS07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2goY3VycmVudEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tjdXJyZW50QnJlYWtwb2ludF0gPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uc2V0dGluZ3M7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCBfLm9wdGlvbnMubW9iaWxlRmlyc3QgKSA/IGEtYiA6IGItYTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKF8ub3B0aW9ucy5zbGlkZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50ICYmIF8uY3VycmVudFNsaWRlICE9PSAwKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcblxuICAgICAgICBfLnNldFByb3BzKCk7XG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuICAgICAgICBfLmJ1aWxkQXJyb3dzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcbiAgICAgICAgXy5pbml0U2xpZGVFdmVudHMoKTtcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZShmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKHR5cGVvZiBfLmN1cnJlbnRTbGlkZSA9PT0gJ251bWJlcicgPyBfLmN1cnJlbnRTbGlkZSA6IDApO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgXy5mb2N1c0hhbmRsZXIoKTtcblxuICAgICAgICBfLnBhdXNlZCA9ICFfLm9wdGlvbnMuYXV0b3BsYXk7XG4gICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcigncmVJbml0JywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gXy53aW5kb3dXaWR0aCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF8ud2luZG93RGVsYXkpO1xuICAgICAgICAgICAgXy53aW5kb3dEZWxheSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICAgICAgICAgIGlmKCAhXy51bnNsaWNrZWQgKSB7IF8uc2V0UG9zaXRpb24oKTsgfVxuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gMCA6IF8uc2xpZGVDb3VudCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIHgsIHk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuICAgICAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XG5cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJywgJyArIHkgKyAnKSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgICAgIF8ubGlzdEhlaWdodCA9IF8uJGxpc3QuaGVpZ2h0KCk7XG5cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSAmJiBfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uc2xpZGVXaWR0aCAqIGluZGV4KSAqIC0xO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLmNzcyh7XG4gICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAxLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuY3NzKCdoZWlnaHQnLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9XG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWNrU2V0T3B0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFjY2VwdHMgYXJndW1lbnRzIGluIGZvcm1hdCBvZjpcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2luZ2xlIG9wdGlvbidzIHZhbHVlOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggKVxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBmb3IgY2hhbmdpbmcgYSBzZXQgb2YgcmVzcG9uc2l2ZSBvcHRpb25zOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsICdyZXNwb25zaXZlJywgW3t9LCAuLi5dLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIHVwZGF0aW5nIG11bHRpcGxlIHZhbHVlcyBhdCBvbmNlIChub3QgcmVzcG9uc2l2ZSlcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCB7ICdvcHRpb24nOiB2YWx1ZSwgLi4uIH0sIHJlZnJlc2ggKVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGwsIGl0ZW0sIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggPSBmYWxzZSwgdHlwZTtcblxuICAgICAgICBpZiggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ29iamVjdCcgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdHlwZSA9ICdtdWx0aXBsZSc7XG5cbiAgICAgICAgfSBlbHNlIGlmICggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ3N0cmluZycgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHJlZnJlc2ggPSBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIGlmICggYXJndW1lbnRzWzBdID09PSAncmVzcG9uc2l2ZScgJiYgJC50eXBlKCBhcmd1bWVudHNbMV0gKSA9PT0gJ2FycmF5JyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAncmVzcG9uc2l2ZSc7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhcmd1bWVudHNbMV0gIT09ICd1bmRlZmluZWQnICkge1xuXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdzaW5nbGUnO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdHlwZSA9PT0gJ3NpbmdsZScgKSB7XG5cbiAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnbXVsdGlwbGUnICkge1xuXG4gICAgICAgICAgICAkLmVhY2goIG9wdGlvbiAsIGZ1bmN0aW9uKCBvcHQsIHZhbCApIHtcblxuICAgICAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRdID0gdmFsO1xuXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdyZXNwb25zaXZlJyApIHtcblxuICAgICAgICAgICAgZm9yICggaXRlbSBpbiB2YWx1ZSApIHtcblxuICAgICAgICAgICAgICAgIGlmKCAkLnR5cGUoIF8ub3B0aW9ucy5yZXNwb25zaXZlICkgIT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgPSBbIHZhbHVlW2l0ZW1dIF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGwgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGgtMTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIHJlc3BvbnNpdmUgb2JqZWN0IGFuZCBzcGxpY2Ugb3V0IGR1cGxpY2F0ZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucmVzcG9uc2l2ZVtsXS5icmVha3BvaW50ID09PSB2YWx1ZVtpdGVtXS5icmVha3BvaW50ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUuc3BsaWNlKGwsMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5wdXNoKCB2YWx1ZVtpdGVtXSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcmVmcmVzaCApIHtcblxuICAgICAgICAgICAgXy51bmxvYWQoKTtcbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBfLnNldEhlaWdodCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2V0Q1NTKF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zZXRGYWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc2V0UG9zaXRpb24nLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJvZHlTdHlsZSA9IGRvY3VtZW50LmJvZHkuc3R5bGU7XG5cbiAgICAgICAgXy5wb3NpdGlvblByb3AgPSBfLm9wdGlvbnMudmVydGljYWwgPT09IHRydWUgPyAndG9wJyA6ICdsZWZ0JztcblxuICAgICAgICBpZiAoXy5wb3NpdGlvblByb3AgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLldlYmtpdFRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLk1velRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLm1zVHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnVzZUNTUyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZmFkZSApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIF8ub3B0aW9ucy56SW5kZXggPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMuekluZGV4IDwgMyApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IDM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuekluZGV4ID0gXy5kZWZhdWx0cy56SW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUuTW96VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnTW96VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ01velRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLk1velBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLndlYmtpdFRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3dlYmtpdFRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd3ZWJraXRUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUudHJhbnNmb3JtICE9PSB1bmRlZmluZWQgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd0cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gXy5vcHRpb25zLnVzZVRyYW5zZm9ybSAmJiAoXy5hbmltVHlwZSAhPT0gbnVsbCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSk7XG4gICAgfTtcblxuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFNsaWRlQ2xhc3NlcyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0LCBhbGxTbGlkZXMsIGluZGV4T2Zmc2V0LCByZW1haW5kZXI7XG5cbiAgICAgICAgYWxsU2xpZGVzID0gXy4kc2xpZGVyXG4gICAgICAgICAgICAuZmluZCgnLnNsaWNrLXNsaWRlJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWN1cnJlbnQnKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjZW50ZXJPZmZzZXQgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIDEpIC0gY2VudGVyT2Zmc2V0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXggLSBjZW50ZXJPZmZzZXQsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSBjZW50ZXJPZmZzZXQgKyAxLCBpbmRleE9mZnNldCArIGNlbnRlck9mZnNldCArIDIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLmVxKGFsbFNsaWRlcy5sZW5ndGggLSAxIC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSBfLnNsaWRlQ291bnQgLSAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXEoXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgLmVxKGluZGV4KVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4LCBpbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsU2xpZGVzLmxlbmd0aCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUgPyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXggOiBpbmRleDtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAmJiAoXy5zbGlkZUNvdW50IC0gaW5kZXgpIDwgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSByZW1haW5kZXIpLCBpbmRleE9mZnNldCArIHJlbWFpbmRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleE9mZnNldCwgaW5kZXhPZmZzZXQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ29uZGVtYW5kJykge1xuICAgICAgICAgICAgXy5sYXp5TG9hZCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldHVwSW5maW5pdGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBzbGlkZUluZGV4LCBpbmZpbml0ZUNvdW50O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5vcHRpb25zLmNlbnRlck1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUgJiYgXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIHNsaWRlSW5kZXggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBfLnNsaWRlQ291bnQ7IGkgPiAoXy5zbGlkZUNvdW50IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQpOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGkgLSAxO1xuICAgICAgICAgICAgICAgICAgICAkKF8uJHNsaWRlc1tzbGlkZUluZGV4XSkuY2xvbmUodHJ1ZSkuYXR0cignaWQnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4Jywgc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wcmVwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5maW5pdGVDb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAkKF8uJHNsaWRlc1tzbGlkZUluZGV4XSkuY2xvbmUodHJ1ZSkuYXR0cignaWQnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4Jywgc2xpZGVJbmRleCArIF8uc2xpZGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKS5hZGRDbGFzcygnc2xpY2stY2xvbmVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpLmZpbmQoJ1tpZF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2lkJywgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBmdW5jdGlvbiggdG9nZ2xlICkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiggIXRvZ2dsZSApIHtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBfLmludGVycnVwdGVkID0gdG9nZ2xlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZWxlY3RIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPVxuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmlzKCcuc2xpY2stc2xpZGUnKSA/XG4gICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpIDpcbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucGFyZW50cygnLnNsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gcGFyc2VJbnQodGFyZ2V0RWxlbWVudC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JykpO1xuXG4gICAgICAgIGlmICghaW5kZXgpIGluZGV4ID0gMDtcblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoaW5kZXgpO1xuICAgICAgICAgICAgXy5hc05hdkZvcihpbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2xpZGVIYW5kbGVyKGluZGV4KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2xpZGVIYW5kbGVyID0gZnVuY3Rpb24oaW5kZXgsIHN5bmMsIGRvbnRBbmltYXRlKSB7XG5cbiAgICAgICAgdmFyIHRhcmdldFNsaWRlLCBhbmltU2xpZGUsIG9sZFNsaWRlLCBzbGlkZUxlZnQsIHRhcmdldExlZnQgPSBudWxsLFxuICAgICAgICAgICAgXyA9IHRoaXMsIG5hdlRhcmdldDtcblxuICAgICAgICBzeW5jID0gc3luYyB8fCBmYWxzZTtcblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUgJiYgXy5vcHRpb25zLndhaXRGb3JBbmltYXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUgJiYgXy5jdXJyZW50U2xpZGUgPT09IGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5hc05hdkZvcihpbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRTbGlkZSA9IGluZGV4O1xuICAgICAgICB0YXJnZXRMZWZ0ID0gXy5nZXRMZWZ0KHRhcmdldFNsaWRlKTtcbiAgICAgICAgc2xpZGVMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLmN1cnJlbnRMZWZ0ID0gXy5zd2lwZUxlZnQgPT09IG51bGwgPyBzbGlkZUxlZnQgOiBfLnN3aXBlTGVmdDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gZmFsc2UgJiYgKGluZGV4IDwgMCB8fCBpbmRleCA+IF8uZ2V0RG90Q291bnQoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgJiYgKGluZGV4IDwgMCB8fCBpbmRleCA+IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYW5pbWF0ZVNsaWRlKHNsaWRlTGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRTbGlkZSA8IDApIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgLSAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50ICsgdGFyZ2V0U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2xpZGUgPj0gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGUgLSBfLnNsaWRlQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYmVmb3JlQ2hhbmdlJywgW18sIF8uY3VycmVudFNsaWRlLCBhbmltU2xpZGVdKTtcblxuICAgICAgICBvbGRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGFuaW1TbGlkZTtcblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3NlcyhfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXNOYXZGb3IgKSB7XG5cbiAgICAgICAgICAgIG5hdlRhcmdldCA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBuYXZUYXJnZXQuc2xpY2soJ2dldFNsaWNrJyk7XG5cbiAgICAgICAgICAgIGlmICggbmF2VGFyZ2V0LnNsaWRlQ291bnQgPD0gbmF2VGFyZ2V0Lm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgICAgIG5hdlRhcmdldC5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGVPdXQob2xkU2xpZGUpO1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uYW5pbWF0ZVNsaWRlKHRhcmdldExlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3RhcnRMb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93LmhpZGUoKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5oaWRlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVEaXJlY3Rpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgeERpc3QsIHlEaXN0LCByLCBzd2lwZUFuZ2xlLCBfID0gdGhpcztcblxuICAgICAgICB4RGlzdCA9IF8udG91Y2hPYmplY3Quc3RhcnRYIC0gXy50b3VjaE9iamVjdC5jdXJYO1xuICAgICAgICB5RGlzdCA9IF8udG91Y2hPYmplY3Quc3RhcnRZIC0gXy50b3VjaE9iamVjdC5jdXJZO1xuICAgICAgICByID0gTWF0aC5hdGFuMih5RGlzdCwgeERpc3QpO1xuXG4gICAgICAgIHN3aXBlQW5nbGUgPSBNYXRoLnJvdW5kKHIgKiAxODAgLyBNYXRoLlBJKTtcbiAgICAgICAgaWYgKHN3aXBlQW5nbGUgPCAwKSB7XG4gICAgICAgICAgICBzd2lwZUFuZ2xlID0gMzYwIC0gTWF0aC5hYnMoc3dpcGVBbmdsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPD0gNDUpICYmIChzd2lwZUFuZ2xlID49IDApKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDM2MCkgJiYgKHN3aXBlQW5nbGUgPj0gMzE1KSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAxMzUpICYmIChzd2lwZUFuZ2xlIDw9IDIyNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAncmlnaHQnIDogJ2xlZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKChzd2lwZUFuZ2xlID49IDM1KSAmJiAoc3dpcGVBbmdsZSA8PSAxMzUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb3duJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd1cCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJ3ZlcnRpY2FsJztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVFbmQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlQ291bnQsXG4gICAgICAgICAgICBkaXJlY3Rpb247XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG4gICAgICAgIF8uc2hvdWxkQ2xpY2sgPSAoIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiAxMCApID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgICAgIGlmICggXy50b3VjaE9iamVjdC5jdXJYID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdlZGdlJywgW18sIF8uc3dpcGVEaXJlY3Rpb24oKSBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+PSBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlICkge1xuXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBfLnN3aXBlRGlyZWN0aW9uKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoIGRpcmVjdGlvbiApIHtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlQ291bnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jaGVja05hdmlnYWJsZSggXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKSApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgY2FzZSAndXAnOlxuXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlQ291bnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jaGVja05hdmlnYWJsZSggXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKSApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSAtIF8uZ2V0U2xpZGVDb3VudCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDE7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIGRpcmVjdGlvbiAhPSAndmVydGljYWwnICkge1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIHNsaWRlQ291bnQgKTtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3N3aXBlJywgW18sIGRpcmVjdGlvbiBdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmICggXy50b3VjaE9iamVjdC5zdGFydFggIT09IF8udG91Y2hPYmplY3QuY3VyWCApIHtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBfLmN1cnJlbnRTbGlkZSApO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKChfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSB8fCAoJ29udG91Y2hlbmQnIGluIGRvY3VtZW50ICYmIF8ub3B0aW9ucy5zd2lwZSA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gZmFsc2UgJiYgZXZlbnQudHlwZS5pbmRleE9mKCdtb3VzZScpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCA6IDE7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5taW5Td2lwZSA9IF8ubGlzdFdpZHRoIC8gXy5vcHRpb25zXG4gICAgICAgICAgICAudG91Y2hUaHJlc2hvbGQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RIZWlnaHQgLyBfLm9wdGlvbnNcbiAgICAgICAgICAgICAgICAudG91Y2hUaHJlc2hvbGQ7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmRhdGEuYWN0aW9uKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgICAgICBfLnN3aXBlU3RhcnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdtb3ZlJzpcbiAgICAgICAgICAgICAgICBfLnN3aXBlTW92ZShldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZUVuZChldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGVkZ2VXYXNIaXQgPSBmYWxzZSxcbiAgICAgICAgICAgIGN1ckxlZnQsIHN3aXBlRGlyZWN0aW9uLCBzd2lwZUxlbmd0aCwgcG9zaXRpb25PZmZzZXQsIHRvdWNoZXM7XG5cbiAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCA/IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA6IG51bGw7XG5cbiAgICAgICAgaWYgKCFfLmRyYWdnaW5nIHx8IHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1ckxlZnQgPSBfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVggOiBldmVudC5jbGllbnRYO1xuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clkgPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VZIDogZXZlbnQuY2xpZW50WTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoXG4gICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clggLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCwgMikpKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWSAtIF8udG91Y2hPYmplY3Quc3RhcnRZLCAyKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb24gPSBfLnN3aXBlRGlyZWN0aW9uKCk7XG5cbiAgICAgICAgaWYgKHN3aXBlRGlyZWN0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkICYmIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zaXRpb25PZmZzZXQgPSAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAxIDogLTEpICogKF8udG91Y2hPYmplY3QuY3VyWCA+IF8udG91Y2hPYmplY3Quc3RhcnRYID8gMSA6IC0xKTtcbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gXy50b3VjaE9iamVjdC5jdXJZID4gXy50b3VjaE9iamVjdC5zdGFydFkgPyAxIDogLTE7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHN3aXBlTGVuZ3RoID0gXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aDtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKChfLmN1cnJlbnRTbGlkZSA9PT0gMCAmJiBzd2lwZURpcmVjdGlvbiA9PT0gJ3JpZ2h0JykgfHwgKF8uY3VycmVudFNsaWRlID49IF8uZ2V0RG90Q291bnQoKSAmJiBzd2lwZURpcmVjdGlvbiA9PT0gJ2xlZnQnKSkge1xuICAgICAgICAgICAgICAgIHN3aXBlTGVuZ3RoID0gXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCAqIF8ub3B0aW9ucy5lZGdlRnJpY3Rpb247XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgKHN3aXBlTGVuZ3RoICogKF8uJGxpc3QuaGVpZ2h0KCkgLyBfLmxpc3RXaWR0aCkpICogcG9zaXRpb25PZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIHN3aXBlTGVuZ3RoICogcG9zaXRpb25PZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUgfHwgXy5vcHRpb25zLnRvdWNoTW92ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLmFuaW1hdGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRDU1MoXy5zd2lwZUxlZnQpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZVN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0b3VjaGVzO1xuXG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ICE9PSAxIHx8IF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zdGFydFggPSBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5zdGFydFkgPSBfLnRvdWNoT2JqZWN0LmN1clkgPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzLnBhZ2VZIDogZXZlbnQuY2xpZW50WTtcblxuICAgICAgICBfLmRyYWdnaW5nID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudW5maWx0ZXJTbGlkZXMgPSBTbGljay5wcm90b3R5cGUuc2xpY2tVbmZpbHRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy4kc2xpZGVzQ2FjaGUgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXNDYWNoZS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcblxuICAgICAgICAgICAgXy5yZWluaXQoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICAkKCcuc2xpY2stY2xvbmVkJywgXy4kc2xpZGVyKS5yZW1vdmUoKTtcblxuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLiRwcmV2QXJyb3cgJiYgXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5wcmV2QXJyb3cpKSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kbmV4dEFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMubmV4dEFycm93KSkge1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay12aXNpYmxlIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAgICAgLmNzcygnd2lkdGgnLCAnJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuc2xpY2sgPSBmdW5jdGlvbihmcm9tQnJlYWtwb2ludCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3Vuc2xpY2snLCBbXywgZnJvbUJyZWFrcG9pbnRdKTtcbiAgICAgICAgXy5kZXN0cm95KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZUFycm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiZcbiAgICAgICAgICAgIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgJiZcbiAgICAgICAgICAgICFfLm9wdGlvbnMuaW5maW5pdGUgKSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcblxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSAxICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudXBkYXRlRG90cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBfLiRkb3RzXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgLmVxKE1hdGguZmxvb3IoXy5jdXJyZW50U2xpZGUgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnZpc2liaWxpdHkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG5cbiAgICAgICAgICAgIGlmICggZG9jdW1lbnRbXy5oaWRkZW5dICkge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgJC5mbi5zbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBvcHQgPSBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGwgPSBfLmxlbmd0aCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICByZXQ7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBvcHQgPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgX1tpXS5zbGljayA9IG5ldyBTbGljayhfW2ldLCBvcHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldCA9IF9baV0uc2xpY2tbb3B0XS5hcHBseShfW2ldLnNsaWNrLCBhcmdzKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0ICE9ICd1bmRlZmluZWQnKSByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfO1xuICAgIH07XG5cbn0pKTtcbiIsIiFmdW5jdGlvbiAoJCkge1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4gIC8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAvLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG4gIHZhciBGb3VuZGF0aW9uID0ge1xuICAgIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgICAqL1xuICAgIF9wbHVnaW5zOiB7fSxcblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgICAqL1xuICAgIF91dWlkczogW10sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICAgKi9cbiAgICBydGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAgICovXG4gICAgcGx1Z2luOiBmdW5jdGlvbiAocGx1Z2luLCBuYW1lKSB7XG4gICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICAgIHZhciBjbGFzc05hbWUgPSBuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pO1xuICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgICAgdmFyIGF0dHJOYW1lID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICAgKi9cbiAgICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbiwgbmFtZSkge1xuICAgICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgICAgaWYgKCFwbHVnaW4uJGVsZW1lbnQuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHBsdWdpbi51dWlkKTtcbiAgICAgIH1cbiAgICAgIGlmICghcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICovXG4gICAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcignaW5pdC56Zi4nICsgcGx1Z2luTmFtZSk7XG5cbiAgICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAqL1xuICAgIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgKi9cbiAgICAgIC50cmlnZ2VyKCdkZXN0cm95ZWQuemYuJyArIHBsdWdpbk5hbWUpO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBwbHVnaW4pIHtcbiAgICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsgLy9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICAgKi9cbiAgICByZUluaXQ6IGZ1bmN0aW9uIChwbHVnaW5zKSB7XG4gICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzSlEpIHtcbiAgICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24gKHBsZ3MpIHtcbiAgICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS0nICsgcCArICddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtJyArIHBsdWdpbnMgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAgICovXG4gICAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uIChsZW5ndGgsIG5hbWVzcGFjZSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyAnLScgKyBuYW1lc3BhY2UgOiAnJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAgICovXG4gICAgcmVmbG93OiBmdW5jdGlvbiAoZWxlbSwgcGx1Z2lucykge1xuXG4gICAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgICAgfVxuICAgICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgICAgICB9XG5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uIChpLCBuYW1lKSB7XG4gICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nICsgbmFtZSArICddJykuYWRkQmFjaygnW2RhdGEtJyArIG5hbWUgKyAnXScpO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIiArIG5hbWUgKyBcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSkge1xuICAgICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwudHJpbSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbiAoJGVsZW0pIHtcbiAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgICAgfTtcbiAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgZW5kO1xuXG4gICAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVuZCkge1xuICAgICAgICByZXR1cm4gZW5kO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgICAgfSwgMSk7XG4gICAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24udXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsXG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4gIC8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuICAvKipcbiAgICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gICAqL1xuICB2YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgICBpZiAoISRtZXRhLmxlbmd0aCkge1xuICAgICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gICAgfVxuICAgIGlmICgkbm9KUy5sZW5ndGgpIHtcbiAgICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsgLy9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7IC8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgICAgaWYgKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdXZVxcJ3JlIHNvcnJ5LCAnICsgdHlwZSArICcgaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4gICQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbiAgLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAoZnVuY3Rpb24gKCkge1xuICAgIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdykgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8IHdpbmRvd1t2cCArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG4gICAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTtcbiAgICAgICAgfSwgbmV4dFRpbWUgLSBub3cpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAgICovXG4gICAgaWYgKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICAgIG5vdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG4gIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgICAgZk5PUCA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgPyB0aGlzIDogb1RoaXMsIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICB9XG4gICAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgICAgcmV0dXJuIGZCb3VuZDtcbiAgICB9O1xuICB9XG4gIC8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuICBmdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICAgIHZhciByZXN1bHRzID0gZnVuY05hbWVSZWdleC5leGVjKGZuLnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICAgIH0gZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKSB7XG4gICAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuICAvLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuICAvLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbiAgZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgfVxufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgRm91bmRhdGlvbi5Cb3ggPSB7XG4gICAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICAgIEdldE9mZnNldHM6IEdldE9mZnNldHNcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gICAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICAgIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICAgdG9wLFxuICAgICAgICBib3R0b20sXG4gICAgICAgIGxlZnQsXG4gICAgICAgIHJpZ2h0O1xuXG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICAgIGJvdHRvbSA9IGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wO1xuICAgICAgdG9wID0gZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcDtcbiAgICAgIGxlZnQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQ7XG4gICAgICByaWdodCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBib3R0b20gPSBlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3A7XG4gICAgICB0b3AgPSBlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3A7XG4gICAgICBsZWZ0ID0gZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQ7XG4gICAgICByaWdodCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aDtcbiAgICB9XG5cbiAgICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gICAgaWYgKGxyT25seSkge1xuICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0Yk9ubHkpIHtcbiAgICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAgICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0sIHRlc3QpIHtcbiAgICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcblxuICAgIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICAgIH1cblxuICAgIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgd2luUmVjdCA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9LFxuICAgICAgcGFyZW50RGltczoge1xuICAgICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgd2luZG93RGltczoge1xuICAgICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICAgIGxlZnQ6IHdpblhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAgICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAgICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAgICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gICAqL1xuICBmdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgICBjYXNlICd0b3AnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgdG9wJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMixcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgbGVmdCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCAvIDIgLSAkZWxlRGltcy5oZWlnaHQgLyAyXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIgLSAkZWxlRGltcy53aWR0aCAvIDIsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIgLSAkZWxlRGltcy5oZWlnaHQgLyAyXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xlZnQgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArIGhPZmZzZXQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgIH1cbiAgfVxufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQsZSxvLGkpe3ZhciBzLGgsbix3LGQ9Zih0KTtpZihlKXt2YXIgcj1mKGUpO2g9ZC5vZmZzZXQudG9wK2QuaGVpZ2h0PD1yLmhlaWdodCtyLm9mZnNldC50b3Ascz1kLm9mZnNldC50b3A+PXIub2Zmc2V0LnRvcCxuPWQub2Zmc2V0LmxlZnQ+PXIub2Zmc2V0LmxlZnQsdz1kLm9mZnNldC5sZWZ0K2Qud2lkdGg8PXIud2lkdGgrci5vZmZzZXQubGVmdH1lbHNlIGg9ZC5vZmZzZXQudG9wK2QuaGVpZ2h0PD1kLndpbmRvd0RpbXMuaGVpZ2h0K2Qud2luZG93RGltcy5vZmZzZXQudG9wLHM9ZC5vZmZzZXQudG9wPj1kLndpbmRvd0RpbXMub2Zmc2V0LnRvcCxuPWQub2Zmc2V0LmxlZnQ+PWQud2luZG93RGltcy5vZmZzZXQubGVmdCx3PWQub2Zmc2V0LmxlZnQrZC53aWR0aDw9ZC53aW5kb3dEaW1zLndpZHRoO3ZhciBsPVtoLHMsbix3XTtyZXR1cm4gbz9uPT09dz09ITA6aT9zPT09aD09ITA6bC5pbmRleE9mKCExKT09PS0xfWZ1bmN0aW9uIGYodCxlKXtpZih0PXQubGVuZ3RoP3RbMF06dCx0PT09d2luZG93fHx0PT09ZG9jdW1lbnQpdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7dmFyIGY9dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxvPXQucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxpPWRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscz13aW5kb3cucGFnZVlPZmZzZXQsaD13aW5kb3cucGFnZVhPZmZzZXQ7cmV0dXJue3dpZHRoOmYud2lkdGgsaGVpZ2h0OmYuaGVpZ2h0LG9mZnNldDp7dG9wOmYudG9wK3MsbGVmdDpmLmxlZnQraH0scGFyZW50RGltczp7d2lkdGg6by53aWR0aCxoZWlnaHQ6by5oZWlnaHQsb2Zmc2V0Ont0b3A6by50b3ArcyxsZWZ0Om8ubGVmdCtofX0sd2luZG93RGltczp7d2lkdGg6aS53aWR0aCxoZWlnaHQ6aS5oZWlnaHQsb2Zmc2V0Ont0b3A6cyxsZWZ0Omh9fX19ZnVuY3Rpb24gbyh0LGUsbyxpLHMsaCl7dmFyIG49Zih0KSx3PWU/ZihlKTpudWxsO3N3aXRjaChvKXtjYXNlXCJ0b3BcIjpyZXR1cm57bGVmdDpGb3VuZGF0aW9uLnJ0bCgpP3cub2Zmc2V0LmxlZnQtbi53aWR0aCt3LndpZHRoOncub2Zmc2V0LmxlZnQsdG9wOncub2Zmc2V0LnRvcC0obi5oZWlnaHQraSl9O2Nhc2VcImxlZnRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LShuLndpZHRoK3MpLHRvcDp3Lm9mZnNldC50b3B9O2Nhc2VcInJpZ2h0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoK3MsdG9wOncub2Zmc2V0LnRvcH07Y2FzZVwiY2VudGVyIHRvcFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aC8yLW4ud2lkdGgvMix0b3A6dy5vZmZzZXQudG9wLShuLmhlaWdodCtpKX07Y2FzZVwiY2VudGVyIGJvdHRvbVwiOnJldHVybntsZWZ0Omg/czp3Lm9mZnNldC5sZWZ0K3cud2lkdGgvMi1uLndpZHRoLzIsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfTtjYXNlXCJjZW50ZXIgbGVmdFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQtKG4ud2lkdGgrcyksdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodC8yLW4uaGVpZ2h0LzJ9O2Nhc2VcImNlbnRlciByaWdodFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzKzEsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodC8yLW4uaGVpZ2h0LzJ9O2Nhc2VcImNlbnRlclwiOnJldHVybntsZWZ0Om4ud2luZG93RGltcy5vZmZzZXQubGVmdCtuLndpbmRvd0RpbXMud2lkdGgvMi1uLndpZHRoLzIsdG9wOm4ud2luZG93RGltcy5vZmZzZXQudG9wK24ud2luZG93RGltcy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJyZXZlYWxcIjpyZXR1cm57bGVmdDoobi53aW5kb3dEaW1zLndpZHRoLW4ud2lkdGgpLzIsdG9wOm4ud2luZG93RGltcy5vZmZzZXQudG9wK2l9O2Nhc2VcInJldmVhbCBmdWxsXCI6cmV0dXJue2xlZnQ6bi53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcH07Y2FzZVwibGVmdCBib3R0b21cIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX07Y2FzZVwicmlnaHQgYm90dG9tXCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoK3Mtbi53aWR0aCx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9O2RlZmF1bHQ6cmV0dXJue2xlZnQ6Rm91bmRhdGlvbi5ydGwoKT93Lm9mZnNldC5sZWZ0LW4ud2lkdGgrdy53aWR0aDp3Lm9mZnNldC5sZWZ0K3MsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfX19Rm91bmRhdGlvbi5Cb3g9e0ltTm90VG91Y2hpbmdZb3U6ZSxHZXREaW1lbnNpb25zOmYsR2V0T2Zmc2V0czpvfX0oalF1ZXJ5KTsiLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBrZXlDb2RlcyA9IHtcbiAgICA5OiAnVEFCJyxcbiAgICAxMzogJ0VOVEVSJyxcbiAgICAyNzogJ0VTQ0FQRScsXG4gICAgMzI6ICdTUEFDRScsXG4gICAgMzc6ICdBUlJPV19MRUZUJyxcbiAgICAzODogJ0FSUk9XX1VQJyxcbiAgICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgICA0MDogJ0FSUk9XX0RPV04nXG4gIH07XG5cbiAgdmFyIGNvbW1hbmRzID0ge307XG5cbiAgdmFyIEtleWJvYXJkID0ge1xuICAgIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAgICovXG4gICAgcGFyc2VLZXk6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXFcrLywgJycpO1xuXG4gICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9ICdTSElGVF8nICsga2V5O1xuICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9ICdDVFJMXycgKyBrZXk7XG4gICAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSAnQUxUXycgKyBrZXk7XG5cbiAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICAgKi9cbiAgICBoYW5kbGVLZXk6IGZ1bmN0aW9uIChldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgICAgIGNtZHMsXG4gICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICBmbjtcblxuICAgICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7ZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICAgIH1cbiAgICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgICAqL1xuICAgIGZpbmRGb2N1c2FibGU6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgaWYgKCEkZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICAgKi9cblxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbiAoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAgICovXG4gICAgdHJhcEZvY3VzOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICRmaXJzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAgICovXG4gICAgcmVsZWFzZUZvY3VzOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgICB9XG4gIH07XG5cbiAgLypcbiAgICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICovXG4gIGZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICAgIHZhciBrID0ge307XG4gICAgZm9yICh2YXIga2MgaW4ga2NzKSB7XG4gICAgICBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgICB9cmV0dXJuIGs7XG4gIH1cblxuICBGb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG4oZSl7dmFyIG49e307Zm9yKHZhciB0IGluIGUpbltlW3RdXT1lW3RdO3JldHVybiBufXZhciB0PXs5OlwiVEFCXCIsMTM6XCJFTlRFUlwiLDI3OlwiRVNDQVBFXCIsMzI6XCJTUEFDRVwiLDM3OlwiQVJST1dfTEVGVFwiLDM4OlwiQVJST1dfVVBcIiwzOTpcIkFSUk9XX1JJR0hUXCIsNDA6XCJBUlJPV19ET1dOXCJ9LG89e30scj17a2V5czpuKHQpLHBhcnNlS2V5OmZ1bmN0aW9uKGUpe3ZhciBuPXRbZS53aGljaHx8ZS5rZXlDb2RlXXx8U3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKS50b1VwcGVyQ2FzZSgpO3JldHVybiBuPW4ucmVwbGFjZSgvXFxXKy8sXCJcIiksZS5zaGlmdEtleSYmKG49XCJTSElGVF9cIituKSxlLmN0cmxLZXkmJihuPVwiQ1RSTF9cIituKSxlLmFsdEtleSYmKG49XCJBTFRfXCIrbiksbj1uLnJlcGxhY2UoL18kLyxcIlwiKX0saGFuZGxlS2V5OmZ1bmN0aW9uKG4sdCxyKXt2YXIgYSxpLGQsZj1vW3RdLHU9dGhpcy5wYXJzZUtleShuKTtpZighZilyZXR1cm4gY29uc29sZS53YXJuKFwiQ29tcG9uZW50IG5vdCBkZWZpbmVkIVwiKTtpZihhPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBmLmx0cj9mOkZvdW5kYXRpb24ucnRsKCk/ZS5leHRlbmQoe30sZi5sdHIsZi5ydGwpOmUuZXh0ZW5kKHt9LGYucnRsLGYubHRyKSxpPWFbdV0sZD1yW2ldLGQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGQpe3ZhciBsPWQuYXBwbHkoKTsoci5oYW5kbGVkfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiByLmhhbmRsZWQpJiZyLmhhbmRsZWQobCl9ZWxzZShyLnVuaGFuZGxlZHx8XCJmdW5jdGlvblwiPT10eXBlb2Ygci51bmhhbmRsZWQpJiZyLnVuaGFuZGxlZCgpfSxmaW5kRm9jdXNhYmxlOmZ1bmN0aW9uKG4pe3JldHVybiEhbiYmbi5maW5kKFwiYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXVwiKS5maWx0ZXIoZnVuY3Rpb24oKXtyZXR1cm4hKCFlKHRoaXMpLmlzKFwiOnZpc2libGVcIil8fGUodGhpcykuYXR0cihcInRhYmluZGV4XCIpPDApfSl9LHJlZ2lzdGVyOmZ1bmN0aW9uKGUsbil7b1tlXT1ufSx0cmFwRm9jdXM6ZnVuY3Rpb24oZSl7dmFyIG49Rm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKGUpLHQ9bi5lcSgwKSxvPW4uZXEoLTEpO2Uub24oXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiLGZ1bmN0aW9uKGUpe2UudGFyZ2V0PT09b1swXSYmXCJUQUJcIj09PUZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZSk/KGUucHJldmVudERlZmF1bHQoKSx0LmZvY3VzKCkpOmUudGFyZ2V0PT09dFswXSYmXCJTSElGVF9UQUJcIj09PUZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZSkmJihlLnByZXZlbnREZWZhdWx0KCksby5mb2N1cygpKX0pfSxyZWxlYXNlRm9jdXM6ZnVuY3Rpb24oZSl7ZS5vZmYoXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiKX19O0ZvdW5kYXRpb24uS2V5Ym9hcmQ9cn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbiAgdmFyIGRlZmF1bHRRdWVyaWVzID0ge1xuICAgICdkZWZhdWx0JzogJ29ubHkgc2NyZWVuJyxcbiAgICBsYW5kc2NhcGU6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgICBwb3J0cmFpdDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gICAgcmV0aW5hOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG4gIH07XG5cbiAgdmFyIE1lZGlhUXVlcnkgPSB7XG4gICAgcXVlcmllczogW10sXG5cbiAgICBjdXJyZW50OiAnJyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgICBpZiAobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICB2YWx1ZTogJ29ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAnICsgbmFtZWRRdWVyaWVzW2tleV0gKyAnKSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgICB0aGlzLl93YXRjaGVyKCk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAgICovXG4gICAgYXRMZWFzdDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgICAqL1xuICAgIGlzOiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgc2l6ZSA9IHNpemUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoc2l6ZS5sZW5ndGggPiAxICYmIHNpemVbMV0gPT09ICdvbmx5Jykge1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAgICovXG4gICAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbWF0Y2hlZDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3dhdGNoZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBuZXdTaXplID0gX3RoaXMuX2dldEN1cnJlbnRTaXplKCksXG4gICAgICAgICAgICBjdXJyZW50U2l6ZSA9IF90aGlzLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgICAgX3RoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBjdXJyZW50U2l6ZV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuICAvLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4gIC8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG4gIHdpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuXG4gICAgdmFyIHN0eWxlTWVkaWEgPSB3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWE7XG5cbiAgICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gICAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICAgICAgICBpbmZvID0gbnVsbDtcblxuICAgICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICBzdHlsZS5pZCA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICBpbmZvID0gJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdyAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgICBtYXRjaE1lZGl1bTogZnVuY3Rpb24gKG1lZGlhKSB7XG4gICAgICAgICAgdmFyIHRleHQgPSAnQG1lZGlhICcgKyBtZWRpYSArICd7ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfSc7XG5cbiAgICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG1lZGlhKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgICB9O1xuICAgIH07XG4gIH0oKSk7XG5cbiAgLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuICBmdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gICAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgICB9XG5cbiAgICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgICB9XG5cbiAgICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbiAocmV0LCBwYXJhbSkge1xuICAgICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LCB7fSk7XG5cbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUpe3ZhciB0PXt9O3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBlP3Q6KGU9ZS50cmltKCkuc2xpY2UoMSwtMSkpP3Q9ZS5zcGxpdChcIiZcIikucmVkdWNlKGZ1bmN0aW9uKGUsdCl7dmFyIG49dC5yZXBsYWNlKC9cXCsvZyxcIiBcIikuc3BsaXQoXCI9XCIpLHI9blswXSxpPW5bMV07cmV0dXJuIHI9ZGVjb2RlVVJJQ29tcG9uZW50KHIpLGk9dm9pZCAwPT09aT9udWxsOmRlY29kZVVSSUNvbXBvbmVudChpKSxlLmhhc093blByb3BlcnR5KHIpP0FycmF5LmlzQXJyYXkoZVtyXSk/ZVtyXS5wdXNoKGkpOmVbcl09W2Vbcl0saV06ZVtyXT1pLGV9LHt9KTp0fXZhciBuPXtxdWVyaWVzOltdLGN1cnJlbnQ6XCJcIixfaW5pdDpmdW5jdGlvbigpe3ZhciBuLHI9dGhpcyxpPWUoXCIuZm91bmRhdGlvbi1tcVwiKS5jc3MoXCJmb250LWZhbWlseVwiKTtuPXQoaSk7Zm9yKHZhciBhIGluIG4pbi5oYXNPd25Qcm9wZXJ0eShhKSYmci5xdWVyaWVzLnB1c2goe25hbWU6YSx2YWx1ZTpcIm9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiBcIituW2FdK1wiKVwifSk7dGhpcy5jdXJyZW50PXRoaXMuX2dldEN1cnJlbnRTaXplKCksdGhpcy5fd2F0Y2hlcigpfSxhdExlYXN0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuZ2V0KGUpO3JldHVybiEhdCYmd2luZG93Lm1hdGNoTWVkaWEodCkubWF0Y2hlc30saXM6ZnVuY3Rpb24oZSl7cmV0dXJuIGU9ZS50cmltKCkuc3BsaXQoXCIgXCIpLGUubGVuZ3RoPjEmJlwib25seVwiPT09ZVsxXT9lWzBdPT09dGhpcy5fZ2V0Q3VycmVudFNpemUoKTp0aGlzLmF0TGVhc3QoZVswXSl9LGdldDpmdW5jdGlvbihlKXtmb3IodmFyIHQgaW4gdGhpcy5xdWVyaWVzKWlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eSh0KSl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO2lmKGU9PT1uLm5hbWUpcmV0dXJuIG4udmFsdWV9cmV0dXJuIG51bGx9LF9nZXRDdXJyZW50U2l6ZTpmdW5jdGlvbigpe2Zvcih2YXIgZSx0PTA7dDx0aGlzLnF1ZXJpZXMubGVuZ3RoO3QrKyl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO3dpbmRvdy5tYXRjaE1lZGlhKG4udmFsdWUpLm1hdGNoZXMmJihlPW4pfXJldHVyblwib2JqZWN0XCI9PXR5cGVvZiBlP2UubmFtZTplfSxfd2F0Y2hlcjpmdW5jdGlvbigpe3ZhciB0PXRoaXM7ZSh3aW5kb3cpLm9uKFwicmVzaXplLnpmLm1lZGlhcXVlcnlcIixmdW5jdGlvbigpe3ZhciBuPXQuX2dldEN1cnJlbnRTaXplKCkscj10LmN1cnJlbnQ7biE9PXImJih0LmN1cnJlbnQ9bixlKHdpbmRvdykudHJpZ2dlcihcImNoYW5nZWQuemYubWVkaWFxdWVyeVwiLFtuLHJdKSl9KX19O0ZvdW5kYXRpb24uTWVkaWFRdWVyeT1uLHdpbmRvdy5tYXRjaE1lZGlhfHwod2luZG93Lm1hdGNoTWVkaWE9ZnVuY3Rpb24oKXt2YXIgZT13aW5kb3cuc3R5bGVNZWRpYXx8d2luZG93Lm1lZGlhO2lmKCFlKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIiksbj1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXSxyPW51bGw7dC50eXBlPVwidGV4dC9jc3NcIix0LmlkPVwibWF0Y2htZWRpYWpzLXRlc3RcIixuJiZuLnBhcmVudE5vZGUmJm4ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCxuKSxyPVwiZ2V0Q29tcHV0ZWRTdHlsZVwiaW4gd2luZG93JiZ3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0LG51bGwpfHx0LmN1cnJlbnRTdHlsZSxlPXttYXRjaE1lZGl1bTpmdW5jdGlvbihlKXt2YXIgbj1cIkBtZWRpYSBcIitlK1wieyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1cIjtyZXR1cm4gdC5zdHlsZVNoZWV0P3Quc3R5bGVTaGVldC5jc3NUZXh0PW46dC50ZXh0Q29udGVudD1uLFwiMXB4XCI9PT1yLndpZHRofX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybnttYXRjaGVzOmUubWF0Y2hNZWRpdW0odHx8XCJhbGxcIiksbWVkaWE6dHx8XCJhbGxcIn19fSgpKSxGb3VuZGF0aW9uLk1lZGlhUXVlcnk9bn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBNb3Rpb24gbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gICAqL1xuXG4gIHZhciBpbml0Q2xhc3NlcyA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuICB2YXIgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbiAgdmFyIE1vdGlvbiA9IHtcbiAgICBhbmltYXRlSW46IGZ1bmN0aW9uIChlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICAgIH0sXG5cbiAgICBhbmltYXRlT3V0OiBmdW5jdGlvbiAoZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKSB7XG4gICAgdmFyIGFuaW0sXG4gICAgICAgIHByb2csXG4gICAgICAgIHN0YXJ0ID0gbnVsbDtcbiAgICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW92ZSh0cykge1xuICAgICAgaWYgKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgICBpZiAocHJvZyA8IGR1cmF0aW9uKSB7XG4gICAgICAgIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG4gIH1cblxuICAvKipcbiAgICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gICAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICAgIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAgIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gICAgcmVzZXQoKTtcblxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoYW5pbWF0aW9uKS5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgICB9KTtcblxuICAgIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICAgIGVsZW1lbnQuY3NzKCd0cmFuc2l0aW9uJywgJycpLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICAgIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAgIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgICAgcmVzZXQoKTtcbiAgICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGluaXRDbGFzcyArICcgJyArIGFjdGl2ZUNsYXNzICsgJyAnICsgYW5pbWF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBGb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuICBGb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24obil7ZnVuY3Rpb24gaShuLGksZSl7ZnVuY3Rpb24gdChzKXtyfHwocj1zKSxvPXMtcixlLmFwcGx5KGkpLG88bj9hPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCxpKTood2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGEpLGkudHJpZ2dlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pLnRyaWdnZXJIYW5kbGVyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkpfXZhciBhLG8scj1udWxsO3JldHVybiAwPT09bj8oZS5hcHBseShpKSx2b2lkIGkudHJpZ2dlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pLnRyaWdnZXJIYW5kbGVyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkpOnZvaWQoYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQpKX1mdW5jdGlvbiBlKGksZSxvLHIpe2Z1bmN0aW9uIHMoKXtpfHxlLmhpZGUoKSx1KCksciYmci5hcHBseShlKX1mdW5jdGlvbiB1KCl7ZVswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb249MCxlLnJlbW92ZUNsYXNzKGQrXCIgXCIrZitcIiBcIitvKX1pZihlPW4oZSkuZXEoMCksZS5sZW5ndGgpe3ZhciBkPWk/dFswXTp0WzFdLGY9aT9hWzBdOmFbMV07dSgpLGUuYWRkQ2xhc3MobykuY3NzKFwidHJhbnNpdGlvblwiLFwibm9uZVwiKSxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtlLmFkZENsYXNzKGQpLGkmJmUuc2hvdygpfSkscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7ZVswXS5vZmZzZXRXaWR0aCxlLmNzcyhcInRyYW5zaXRpb25cIixcIlwiKS5hZGRDbGFzcyhmKX0pLGUub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlKSxzKX19dmFyIHQ9W1wibXVpLWVudGVyXCIsXCJtdWktbGVhdmVcIl0sYT1bXCJtdWktZW50ZXItYWN0aXZlXCIsXCJtdWktbGVhdmUtYWN0aXZlXCJdLG89e2FuaW1hdGVJbjpmdW5jdGlvbihuLGksdCl7ZSghMCxuLGksdCl9LGFuaW1hdGVPdXQ6ZnVuY3Rpb24obixpLHQpe2UoITEsbixpLHQpfX07Rm91bmRhdGlvbi5Nb3ZlPWksRm91bmRhdGlvbi5Nb3Rpb249b30oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBOZXN0ID0ge1xuICAgIEZlYXRoZXI6IGZ1bmN0aW9uIChtZW51KSB7XG4gICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJ3pmJztcblxuICAgICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeyAncm9sZSc6ICdtZW51aXRlbScgfSksXG4gICAgICAgICAgc3ViTWVudUNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51JyxcbiAgICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICAgIGhhc1N1YkNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgICRpdGVtLmFkZENsYXNzKGhhc1N1YkNsYXNzKS5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRpdGVtLmF0dHIoeyAnYXJpYS1leHBhbmRlZCc6IGZhbHNlIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRzdWIuYWRkQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJHN1Yi5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAgICRpdGVtLmFkZENsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgICBCdXJuOiBmdW5jdGlvbiAobWVudSwgdHlwZSkge1xuICAgICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxuICAgICAgICAgIHN1Ykl0ZW1DbGFzcyA9IHN1Yk1lbnVDbGFzcyArICctaXRlbScsXG4gICAgICAgICAgaGFzU3ViQ2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgbWVudS5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJykucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyAnICsgaGFzU3ViQ2xhc3MgKyAnIGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZScpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KTtcbiAgICB9XG4gIH07XG5cbiAgRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oZSl7dmFyIGE9e0ZlYXRoZXI6ZnVuY3Rpb24oYSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOlwiemZcIjthLmF0dHIoXCJyb2xlXCIsXCJtZW51YmFyXCIpO3ZhciBuPWEuZmluZChcImxpXCIpLmF0dHIoe3JvbGU6XCJtZW51aXRlbVwifSksaT1cImlzLVwiK3QrXCItc3VibWVudVwiLHU9aStcIi1pdGVtXCIscz1cImlzLVwiK3QrXCItc3VibWVudS1wYXJlbnRcIjtuLmVhY2goZnVuY3Rpb24oKXt2YXIgYT1lKHRoaXMpLG49YS5jaGlsZHJlbihcInVsXCIpO24ubGVuZ3RoJiYoYS5hZGRDbGFzcyhzKS5hdHRyKHtcImFyaWEtaGFzcG9wdXBcIjohMCxcImFyaWEtbGFiZWxcIjphLmNoaWxkcmVuKFwiYTpmaXJzdFwiKS50ZXh0KCl9KSxcImRyaWxsZG93blwiPT09dCYmYS5hdHRyKHtcImFyaWEtZXhwYW5kZWRcIjohMX0pLG4uYWRkQ2xhc3MoXCJzdWJtZW51IFwiK2kpLmF0dHIoe1wiZGF0YS1zdWJtZW51XCI6XCJcIixyb2xlOlwibWVudVwifSksXCJkcmlsbGRvd25cIj09PXQmJm4uYXR0cih7XCJhcmlhLWhpZGRlblwiOiEwfSkpLGEucGFyZW50KFwiW2RhdGEtc3VibWVudV1cIikubGVuZ3RoJiZhLmFkZENsYXNzKFwiaXMtc3VibWVudS1pdGVtIFwiK3UpfSl9LEJ1cm46ZnVuY3Rpb24oZSxhKXt2YXIgdD1cImlzLVwiK2ErXCItc3VibWVudVwiLG49dCtcIi1pdGVtXCIsaT1cImlzLVwiK2ErXCItc3VibWVudS1wYXJlbnRcIjtlLmZpbmQoXCI+bGksIC5tZW51LCAubWVudSA+IGxpXCIpLnJlbW92ZUNsYXNzKHQrXCIgXCIrbitcIiBcIitpK1wiIGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZVwiKS5yZW1vdmVBdHRyKFwiZGF0YS1zdWJtZW51XCIpLmNzcyhcImRpc3BsYXlcIixcIlwiKX19O0ZvdW5kYXRpb24uTmVzdD1hfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sXG4gICAgICAgIC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgdGltZXI7XG5cbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZW1haW4gPSAtMTtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pbmZpbml0ZSkge1xuICAgICAgICAgIF90aGlzLnJlc3RhcnQoKTsgLy9yZXJ1biB0aGUgdGltZXIuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJlbWFpbik7XG4gICAgICBlbGVtLnRyaWdnZXIoJ3RpbWVyc3RhcnQuemYuJyArIG5hbWVTcGFjZSk7XG4gICAgfTtcblxuICAgIHRoaXMucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnBhdXNlZC56Zi4nICsgbmFtZVNwYWNlKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICAgKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAgICovXG4gIGZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHVubG9hZGVkID0gaW1hZ2VzLmxlbmd0aDtcblxuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBpbWFnZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gNCB8fCB0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH1cbiAgICAgIC8vIEZvcmNlIGxvYWQgdGhlIGltYWdlXG4gICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBmaXggZm9yIElFLiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9qcXVlcnkvZml4aW5nLWxvYWQtaW4taWUtZm9yLWNhY2hlZC1pbWFnZXMvXG4gICAgICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICAgICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNpbmdsZUltYWdlTG9hZGVkKCkge1xuICAgICAgdW5sb2FkZWQtLTtcbiAgICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbiAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQsZSxpKXt2YXIgYSxzLG49dGhpcyxyPWUuZHVyYXRpb24sbz1PYmplY3Qua2V5cyh0LmRhdGEoKSlbMF18fFwidGltZXJcIix1PS0xO3RoaXMuaXNQYXVzZWQ9ITEsdGhpcy5yZXN0YXJ0PWZ1bmN0aW9uKCl7dT0tMSxjbGVhclRpbWVvdXQocyksdGhpcy5zdGFydCgpfSx0aGlzLnN0YXJ0PWZ1bmN0aW9uKCl7dGhpcy5pc1BhdXNlZD0hMSxjbGVhclRpbWVvdXQocyksdT11PD0wP3I6dSx0LmRhdGEoXCJwYXVzZWRcIiwhMSksYT1EYXRlLm5vdygpLHM9c2V0VGltZW91dChmdW5jdGlvbigpe2UuaW5maW5pdGUmJm4ucmVzdGFydCgpLGkmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGkmJmkoKX0sdSksdC50cmlnZ2VyKFwidGltZXJzdGFydC56Zi5cIitvKX0sdGhpcy5wYXVzZT1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITAsY2xlYXJUaW1lb3V0KHMpLHQuZGF0YShcInBhdXNlZFwiLCEwKTt2YXIgZT1EYXRlLm5vdygpO3UtPWUtYSx0LnRyaWdnZXIoXCJ0aW1lcnBhdXNlZC56Zi5cIitvKX19ZnVuY3Rpb24gaShlLGkpe2Z1bmN0aW9uIGEoKXtzLS0sMD09PXMmJmkoKX12YXIgcz1lLmxlbmd0aDswPT09cyYmaSgpLGUuZWFjaChmdW5jdGlvbigpe2lmKHRoaXMuY29tcGxldGV8fDQ9PT10aGlzLnJlYWR5U3RhdGV8fFwiY29tcGxldGVcIj09PXRoaXMucmVhZHlTdGF0ZSlhKCk7ZWxzZXt2YXIgZT10KHRoaXMpLmF0dHIoXCJzcmNcIik7dCh0aGlzKS5hdHRyKFwic3JjXCIsZSsoZS5pbmRleE9mKFwiP1wiKT49MD9cIiZcIjpcIj9cIikrKG5ldyBEYXRlKS5nZXRUaW1lKCkpLHQodGhpcykub25lKFwibG9hZFwiLGZ1bmN0aW9uKCl7YSgpfSl9fSl9Rm91bmRhdGlvbi5UaW1lcj1lLEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQ9aX0oalF1ZXJ5KTsiLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24gKCQpIHtcblxuXHQkLnNwb3RTd2lwZSA9IHtcblx0XHR2ZXJzaW9uOiAnMS4wLjAnLFxuXHRcdGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHRwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG5cdFx0bW92ZVRocmVzaG9sZDogNzUsXG5cdFx0dGltZVRocmVzaG9sZDogMjAwXG5cdH07XG5cblx0dmFyIHN0YXJ0UG9zWCxcblx0ICAgIHN0YXJ0UG9zWSxcblx0ICAgIHN0YXJ0VGltZSxcblx0ICAgIGVsYXBzZWRUaW1lLFxuXHQgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuXHRmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuXHRcdC8vICBhbGVydCh0aGlzKTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG5cdFx0aXNNb3ZpbmcgPSBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcblx0XHRpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdFx0aWYgKGlzTW92aW5nKSB7XG5cdFx0XHR2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcblx0XHRcdHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuXHRcdFx0dmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcblx0XHRcdHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG5cdFx0XHR2YXIgZGlyO1xuXHRcdFx0ZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcblx0XHRcdGlmIChNYXRoLmFicyhkeCkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG5cdFx0XHRcdGRpciA9IGR4ID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG5cdFx0XHR9XG5cdFx0XHQvLyBlbHNlIGlmKE1hdGguYWJzKGR5KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcblx0XHRcdC8vICAgZGlyID0gZHkgPiAwID8gJ2Rvd24nIDogJ3VwJztcblx0XHRcdC8vIH1cblx0XHRcdGlmIChkaXIpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRvblRvdWNoRW5kLmNhbGwodGhpcyk7XG5cdFx0XHRcdCQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoJ3N3aXBlJyArIGRpcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcblx0XHRpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG5cdFx0XHRzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG5cdFx0XHRpc01vdmluZyA9IHRydWU7XG5cdFx0XHRzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdH1cblxuXHRmdW5jdGlvbiB0ZWFyZG93bigpIHtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuXHR9XG5cblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG5cdCQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG5cdFx0JC5ldmVudC5zcGVjaWFsWydzd2lwZScgKyB0aGlzXSA9IHsgc2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuXHRcdFx0fSB9O1xuXHR9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24gKCQpIHtcblx0JC5mbi5hZGRUb3VjaCA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG5cdFx0XHQkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG5cdFx0XHRcdC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3Rcblx0XHRcdFx0aGFuZGxlVG91Y2goZXZlbnQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG5cdFx0XHQgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuXHRcdFx0ICAgIGV2ZW50VHlwZXMgPSB7XG5cdFx0XHRcdHRvdWNoc3RhcnQ6ICdtb3VzZWRvd24nLFxuXHRcdFx0XHR0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuXHRcdFx0XHR0b3VjaGVuZDogJ21vdXNldXAnXG5cdFx0XHR9LFxuXHRcdFx0ICAgIHR5cGUgPSBldmVudFR5cGVzW2V2ZW50LnR5cGVdLFxuXHRcdFx0ICAgIHNpbXVsYXRlZEV2ZW50O1xuXG5cdFx0XHRpZiAoJ01vdXNlRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQgPSBuZXcgd2luZG93Lk1vdXNlRXZlbnQodHlwZSwge1xuXHRcdFx0XHRcdCdidWJibGVzJzogdHJ1ZSxcblx0XHRcdFx0XHQnY2FuY2VsYWJsZSc6IHRydWUsXG5cdFx0XHRcdFx0J3NjcmVlblgnOiBmaXJzdC5zY3JlZW5YLFxuXHRcdFx0XHRcdCdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcblx0XHRcdFx0XHQnY2xpZW50WCc6IGZpcnN0LmNsaWVudFgsXG5cdFx0XHRcdFx0J2NsaWVudFknOiBmaXJzdC5jbGllbnRZXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuXHRcdFx0XHRzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwIC8qbGVmdCovLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcblx0XHR9O1xuXHR9O1xufShqUXVlcnkpO1xuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovIiwiIWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixuKSx0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHQpLHI9ITF9ZnVuY3Rpb24gbihuKXtpZihlLnNwb3RTd2lwZS5wcmV2ZW50RGVmYXVsdCYmbi5wcmV2ZW50RGVmYXVsdCgpLHIpe3ZhciBvLGk9bi50b3VjaGVzWzBdLnBhZ2VYLGM9KG4udG91Y2hlc1swXS5wYWdlWSxzLWkpO2g9KG5ldyBEYXRlKS5nZXRUaW1lKCktdSxNYXRoLmFicyhjKT49ZS5zcG90U3dpcGUubW92ZVRocmVzaG9sZCYmaDw9ZS5zcG90U3dpcGUudGltZVRocmVzaG9sZCYmKG89Yz4wP1wibGVmdFwiOlwicmlnaHRcIiksbyYmKG4ucHJldmVudERlZmF1bHQoKSx0LmNhbGwodGhpcyksZSh0aGlzKS50cmlnZ2VyKFwic3dpcGVcIixvKS50cmlnZ2VyKFwic3dpcGVcIitvKSl9fWZ1bmN0aW9uIG8oZSl7MT09ZS50b3VjaGVzLmxlbmd0aCYmKHM9ZS50b3VjaGVzWzBdLnBhZ2VYLGM9ZS50b3VjaGVzWzBdLnBhZ2VZLHI9ITAsdT0obmV3IERhdGUpLmdldFRpbWUoKSx0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixuLCExKSx0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHQsITEpKX1mdW5jdGlvbiBpKCl7dGhpcy5hZGRFdmVudExpc3RlbmVyJiZ0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsbywhMSl9ZS5zcG90U3dpcGU9e3ZlcnNpb246XCIxLjAuMFwiLGVuYWJsZWQ6XCJvbnRvdWNoc3RhcnRcImluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxwcmV2ZW50RGVmYXVsdDohMSxtb3ZlVGhyZXNob2xkOjc1LHRpbWVUaHJlc2hvbGQ6MjAwfTt2YXIgcyxjLHUsaCxyPSExO2UuZXZlbnQuc3BlY2lhbC5zd2lwZT17c2V0dXA6aX0sZS5lYWNoKFtcImxlZnRcIixcInVwXCIsXCJkb3duXCIsXCJyaWdodFwiXSxmdW5jdGlvbigpe2UuZXZlbnQuc3BlY2lhbFtcInN3aXBlXCIrdGhpc109e3NldHVwOmZ1bmN0aW9uKCl7ZSh0aGlzKS5vbihcInN3aXBlXCIsZS5ub29wKX19fSl9KGpRdWVyeSksIWZ1bmN0aW9uKGUpe2UuZm4uYWRkVG91Y2g9ZnVuY3Rpb24oKXt0aGlzLmVhY2goZnVuY3Rpb24obixvKXtlKG8pLmJpbmQoXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbFwiLGZ1bmN0aW9uKCl7dChldmVudCl9KX0pO3ZhciB0PWZ1bmN0aW9uKGUpe3ZhciB0LG49ZS5jaGFuZ2VkVG91Y2hlcyxvPW5bMF0saT17dG91Y2hzdGFydDpcIm1vdXNlZG93blwiLHRvdWNobW92ZTpcIm1vdXNlbW92ZVwiLHRvdWNoZW5kOlwibW91c2V1cFwifSxzPWlbZS50eXBlXTtcIk1vdXNlRXZlbnRcImluIHdpbmRvdyYmXCJmdW5jdGlvblwiPT10eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQ/dD1uZXcgd2luZG93Lk1vdXNlRXZlbnQocyx7YnViYmxlczohMCxjYW5jZWxhYmxlOiEwLHNjcmVlblg6by5zY3JlZW5YLHNjcmVlblk6by5zY3JlZW5ZLGNsaWVudFg6by5jbGllbnRYLGNsaWVudFk6by5jbGllbnRZfSk6KHQ9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50XCIpLHQuaW5pdE1vdXNlRXZlbnQocywhMCwhMCx3aW5kb3csMSxvLnNjcmVlblgsby5zY3JlZW5ZLG8uY2xpZW50WCxvLmNsaWVudFksITEsITEsITEsITEsMCxudWxsKSksby50YXJnZXQuZGlzcGF0Y2hFdmVudCh0KX19fShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuICAgICAgICByZXR1cm4gd2luZG93W3ByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KCk7XG5cbiAgdmFyIHRyaWdnZXJzID0gZnVuY3Rpb24gKGVsLCB0eXBlKSB7XG4gICAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGlkKSB7XG4gICAgICAkKCcjJyArIGlkKVt0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10odHlwZSArICcuemYudHJpZ2dlcicsIFtlbF0pO1xuICAgIH0pO1xuICB9O1xuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uICgpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xuICB9KTtcblxuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAvLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gICAgaWYgKGlkKSB7XG4gICAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykudHJpZ2dlcigndG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiAgJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHZhciBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgICBpZiAoYW5pbWF0aW9uICE9PSAnJykge1xuICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICAgJCgnIycgKyBpZCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbiAgfSk7XG5cbiAgLyoqXG4gICogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuICAqIEBmdW5jdGlvblxuICAqIEBwcml2YXRlXG4gICovXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjaGVja0xpc3RlbmVycygpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgICBldmVudHNMaXN0ZW5lcigpO1xuICAgIHJlc2l6ZUxpc3RlbmVyKCk7XG4gICAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgICBtdXRhdGVMaXN0ZW5lcigpO1xuICAgIGNsb3NlbWVMaXN0ZW5lcigpO1xuICB9XG5cbiAgLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuICBmdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICAgIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gICAgaWYgKHBsdWdpbk5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHlldGlCb3hlcy5sZW5ndGgpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiAnY2xvc2VtZS56Zi4nICsgbmFtZTtcbiAgICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24gKGUsIHBsdWdpbklkKSB7XG4gICAgICAgIHZhciBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgICB2YXIgcGx1Z2lucyA9ICQoJ1tkYXRhLScgKyBwbHVnaW4gKyAnXScpLm5vdCgnW2RhdGEteWV0aS1ib3g9XCInICsgcGx1Z2luSWQgKyAnXCJdJyk7XG5cbiAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIHZhciB0aW1lciA9IHZvaWQgMCxcbiAgICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsgLy9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKSB7XG4gICAgdmFyIHRpbWVyID0gdm9pZCAwLFxuICAgICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJykub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIC8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgICAgfSwgZGVib3VuY2UgfHwgMTApOyAvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbXV0YXRlTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICB2YXIgJG5vZGVzID0gJCgnW2RhdGEtbXV0YXRlXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoICYmIE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBtdXRhdGUgZXZlbnRcbiAgICAgIC8vbm8gSUUgOSBvciAxMFxuICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gICAgLy9lbGVtZW50IGNhbGxiYWNrXG4gICAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuICAgICAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuICAgICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLCBcIm11dGF0ZVwiKTtcbiAgICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFtQSF1cbiAgLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbiAgRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuICAvLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbiAgLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXtvKCksYSgpLGkoKSxuKCkscigpfWZ1bmN0aW9uIHIoZSl7dmFyIHI9dChcIltkYXRhLXlldGktYm94XVwiKSxhPVtcImRyb3Bkb3duXCIsXCJ0b29sdGlwXCIsXCJyZXZlYWxcIl07aWYoZSYmKFwic3RyaW5nXCI9PXR5cGVvZiBlP2EucHVzaChlKTpcIm9iamVjdFwiPT10eXBlb2YgZSYmXCJzdHJpbmdcIj09dHlwZW9mIGVbMF0/YS5jb25jYXQoZSk6Y29uc29sZS5lcnJvcihcIlBsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3NcIikpLHIubGVuZ3RoKXt2YXIgaT1hLm1hcChmdW5jdGlvbih0KXtyZXR1cm5cImNsb3NlbWUuemYuXCIrdH0pLmpvaW4oXCIgXCIpO3Qod2luZG93KS5vZmYoaSkub24oaSxmdW5jdGlvbihlLHIpe3ZhciBhPWUubmFtZXNwYWNlLnNwbGl0KFwiLlwiKVswXSxpPXQoXCJbZGF0YS1cIithK1wiXVwiKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJytyKydcIl0nKTtpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO2UudHJpZ2dlckhhbmRsZXIoXCJjbG9zZS56Zi50cmlnZ2VyXCIsW2VdKX0pfSl9fWZ1bmN0aW9uIGEoZSl7dmFyIHI9dm9pZCAwLGE9dChcIltkYXRhLXJlc2l6ZV1cIik7YS5sZW5ndGgmJnQod2luZG93KS5vZmYoXCJyZXNpemUuemYudHJpZ2dlclwiKS5vbihcInJlc2l6ZS56Zi50cmlnZ2VyXCIsZnVuY3Rpb24oaSl7ciYmY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe2d8fGEuZWFjaChmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlckhhbmRsZXIoXCJyZXNpemVtZS56Zi50cmlnZ2VyXCIpfSksYS5hdHRyKFwiZGF0YS1ldmVudHNcIixcInJlc2l6ZVwiKX0sZXx8MTApfSl9ZnVuY3Rpb24gaShlKXt2YXIgcj12b2lkIDAsYT10KFwiW2RhdGEtc2Nyb2xsXVwiKTthLmxlbmd0aCYmdCh3aW5kb3cpLm9mZihcInNjcm9sbC56Zi50cmlnZ2VyXCIpLm9uKFwic2Nyb2xsLnpmLnRyaWdnZXJcIixmdW5jdGlvbihpKXtyJiZjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Z3x8YS5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VySGFuZGxlcihcInNjcm9sbG1lLnpmLnRyaWdnZXJcIil9KSxhLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwic2Nyb2xsXCIpfSxlfHwxMCl9KX1mdW5jdGlvbiBuKGUpe3ZhciByPXQoXCJbZGF0YS1tdXRhdGVdXCIpO3IubGVuZ3RoJiZnJiZyLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiKX0pfWZ1bmN0aW9uIG8oKXtpZighZylyZXR1cm4hMTt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXVwiKSxyPWZ1bmN0aW9uKGUpe3ZhciByPXQoZVswXS50YXJnZXQpO3N3aXRjaChlWzBdLnR5cGUpe2Nhc2VcImF0dHJpYnV0ZXNcIjpcInNjcm9sbFwiPT09ci5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmci50cmlnZ2VySGFuZGxlcihcInNjcm9sbG1lLnpmLnRyaWdnZXJcIixbcix3aW5kb3cucGFnZVlPZmZzZXRdKSxcInJlc2l6ZVwiPT09ci5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmci50cmlnZ2VySGFuZGxlcihcInJlc2l6ZW1lLnpmLnRyaWdnZXJcIixbcl0pLFwic3R5bGVcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmKHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIiksci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIixbci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pKTticmVhaztjYXNlXCJjaGlsZExpc3RcIjpyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpLHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIsW3IuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTticmVhaztkZWZhdWx0OnJldHVybiExfX07aWYoZS5sZW5ndGgpZm9yKHZhciBhPTA7YTw9ZS5sZW5ndGgtMTthKyspe3ZhciBpPW5ldyBnKHIpO2kub2JzZXJ2ZShlW2FdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxjaGFyYWN0ZXJEYXRhOiExLHN1YnRyZWU6ITAsYXR0cmlidXRlRmlsdGVyOltcImRhdGEtZXZlbnRzXCIsXCJzdHlsZVwiXX0pfX12YXIgZz1mdW5jdGlvbigpe2Zvcih2YXIgdD1bXCJXZWJLaXRcIixcIk1velwiLFwiT1wiLFwiTXNcIixcIlwiXSxlPTA7ZTx0Lmxlbmd0aDtlKyspaWYodFtlXStcIk11dGF0aW9uT2JzZXJ2ZXJcImluIHdpbmRvdylyZXR1cm4gd2luZG93W3RbZV0rXCJNdXRhdGlvbk9ic2VydmVyXCJdO3JldHVybiExfSgpLHM9ZnVuY3Rpb24oZSxyKXtlLmRhdGEocikuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oYSl7dChcIiNcIithKVtcImNsb3NlXCI9PT1yP1widHJpZ2dlclwiOlwidHJpZ2dlckhhbmRsZXJcIl0ocitcIi56Zi50cmlnZ2VyXCIsW2VdKX0pfTt0KGRvY3VtZW50KS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLW9wZW5dXCIsZnVuY3Rpb24oKXtzKHQodGhpcyksXCJvcGVuXCIpfSksdChkb2N1bWVudCkub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS1jbG9zZV1cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcImNsb3NlXCIpO2U/cyh0KHRoaXMpLFwiY2xvc2VcIik6dCh0aGlzKS50cmlnZ2VyKFwiY2xvc2UuemYudHJpZ2dlclwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xpY2suemYudHJpZ2dlclwiLFwiW2RhdGEtdG9nZ2xlXVwiLGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKS5kYXRhKFwidG9nZ2xlXCIpO2U/cyh0KHRoaXMpLFwidG9nZ2xlXCIpOnQodGhpcykudHJpZ2dlcihcInRvZ2dsZS56Zi50cmlnZ2VyXCIpfSksdChkb2N1bWVudCkub24oXCJjbG9zZS56Zi50cmlnZ2VyXCIsXCJbZGF0YS1jbG9zYWJsZV1cIixmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciByPXQodGhpcykuZGF0YShcImNsb3NhYmxlXCIpO1wiXCIhPT1yP0ZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodCh0aGlzKSxyLGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VyKFwiY2xvc2VkLnpmXCIpfSk6dCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcihcImNsb3NlZC56ZlwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZS1mb2N1c11cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcInRvZ2dsZS1mb2N1c1wiKTt0KFwiI1wiK2UpLnRyaWdnZXJIYW5kbGVyKFwidG9nZ2xlLnpmLnRyaWdnZXJcIixbdCh0aGlzKV0pfSksdCh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgpfSksRm91bmRhdGlvbi5JSGVhcllvdT1lfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIEFiaWRlIG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLmFiaWRlXG4gICAqL1xuXG4gIHZhciBBYmlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEFiaWRlLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBmaXJlcyBBYmlkZSNpbml0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQWJpZGUoZWxlbWVudCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWJpZGUpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBYmlkZS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FiaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIEFiaWRlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBBYmlkZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhBYmlkZSwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpO1xuXG4gICAgICAgIHRoaXMuX2V2ZW50cygpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgQWJpZGUuXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJykub24oJ3Jlc2V0LnpmLmFiaWRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzMi5yZXNldEZvcm0oKTtcbiAgICAgICAgfSkub24oJ3N1Ym1pdC56Zi5hYmlkZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMyLnZhbGlkYXRlRm9ybSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZhbGlkYXRlT24gPT09ICdmaWVsZENoYW5nZScpIHtcbiAgICAgICAgICB0aGlzLiRpbnB1dHMub2ZmKCdjaGFuZ2UuemYuYWJpZGUnKS5vbignY2hhbmdlLnpmLmFiaWRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF90aGlzMi52YWxpZGF0ZUlucHV0KCQoZS50YXJnZXQpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubGl2ZVZhbGlkYXRlKSB7XG4gICAgICAgICAgdGhpcy4kaW5wdXRzLm9mZignaW5wdXQuemYuYWJpZGUnKS5vbignaW5wdXQuemYuYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3RoaXMyLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52YWxpZGF0ZU9uQmx1cikge1xuICAgICAgICAgIHRoaXMuJGlucHV0cy5vZmYoJ2JsdXIuemYuYWJpZGUnKS5vbignYmx1ci56Zi5hYmlkZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfdGhpczIudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBBYmlkZSB1cG9uIERPTSBjaGFuZ2VcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19yZWZsb3cnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZWZsb3coKSB7XG4gICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSBmb3JtIGVsZW1lbnQgaGFzIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYW5kIGlmIGl0J3MgY2hlY2tlZCBvciBub3RcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBjaGVjayBmb3IgcmVxdWlyZWQgYXR0cmlidXRlXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlcXVpcmVkQ2hlY2snLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlcXVpcmVkQ2hlY2soJGVsKSB7XG4gICAgICAgIGlmICghJGVsLmF0dHIoJ3JlcXVpcmVkJykpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHZhciBpc0dvb2QgPSB0cnVlO1xuXG4gICAgICAgIHN3aXRjaCAoJGVsWzBdLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgICAgICBpc0dvb2QgPSAkZWxbMF0uY2hlY2tlZDtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICAgICAgdmFyIG9wdCA9ICRlbC5maW5kKCdvcHRpb246c2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIGlmICghb3B0Lmxlbmd0aCB8fCAhb3B0LnZhbCgpKSBpc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmICghJGVsLnZhbCgpIHx8ICEkZWwudmFsKCkubGVuZ3RoKSBpc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc0dvb2Q7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQmFzZWQgb24gJGVsLCBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBzZWxlY3RvciBpbiB0aGlzIG9yZGVyOlxuICAgICAgICogMS4gVGhlIGVsZW1lbnQncyBkaXJlY3Qgc2libGluZygncykuXG4gICAgICAgKiAzLiBUaGUgZWxlbWVudCdzIHBhcmVudCdzIGNoaWxkcmVuLlxuICAgICAgICpcbiAgICAgICAqIFRoaXMgYWxsb3dzIGZvciBtdWx0aXBsZSBmb3JtIGVycm9ycyBwZXIgaW5wdXQsIHRob3VnaCBpZiBub25lIGFyZSBmb3VuZCwgbm8gZm9ybSBlcnJvcnMgd2lsbCBiZSBzaG93bi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgcmVmZXJlbmNlIHRvIGZpbmQgdGhlIGZvcm0gZXJyb3Igc2VsZWN0b3IuXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBqUXVlcnkgb2JqZWN0IHdpdGggdGhlIHNlbGVjdG9yLlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdmaW5kRm9ybUVycm9yJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kRm9ybUVycm9yKCRlbCkge1xuICAgICAgICB2YXIgJGVycm9yID0gJGVsLnNpYmxpbmdzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JTZWxlY3Rvcik7XG5cbiAgICAgICAgaWYgKCEkZXJyb3IubGVuZ3RoKSB7XG4gICAgICAgICAgJGVycm9yID0gJGVsLnBhcmVudCgpLmZpbmQodGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBmaXJzdCBlbGVtZW50IGluIHRoaXMgb3JkZXI6XG4gICAgICAgKiAyLiBUaGUgPGxhYmVsPiB3aXRoIHRoZSBhdHRyaWJ1dGUgYFtmb3I9XCJzb21lSW5wdXRJZFwiXWBcbiAgICAgICAqIDMuIFRoZSBgLmNsb3Nlc3QoKWAgPGxhYmVsPlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXR0cmlidXRlIGlzIGNoZWNrZWQgb3IgZW1wdHlcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZmluZExhYmVsJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kTGFiZWwoJGVsKSB7XG4gICAgICAgIHZhciBpZCA9ICRlbFswXS5pZDtcbiAgICAgICAgdmFyICRsYWJlbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGFiZWxbZm9yPVwiJyArIGlkICsgJ1wiXScpO1xuXG4gICAgICAgIGlmICghJGxhYmVsLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiAkZWwuY2xvc2VzdCgnbGFiZWwnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkbGFiZWw7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBzZXQgb2YgbGFiZWxzIGFzc29jaWF0ZWQgd2l0aCBhIHNldCBvZiByYWRpbyBlbHMgaW4gdGhpcyBvcmRlclxuICAgICAgICogMi4gVGhlIDxsYWJlbD4gd2l0aCB0aGUgYXR0cmlidXRlIGBbZm9yPVwic29tZUlucHV0SWRcIl1gXG4gICAgICAgKiAzLiBUaGUgYC5jbG9zZXN0KClgIDxsYWJlbD5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBjaGVjayBmb3IgcmVxdWlyZWQgYXR0cmlidXRlXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2ZpbmRSYWRpb0xhYmVscycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZmluZFJhZGlvTGFiZWxzKCRlbHMpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGxhYmVscyA9ICRlbHMubWFwKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIHZhciBpZCA9IGVsLmlkO1xuICAgICAgICAgIHZhciAkbGFiZWwgPSBfdGhpczMuJGVsZW1lbnQuZmluZCgnbGFiZWxbZm9yPVwiJyArIGlkICsgJ1wiXScpO1xuXG4gICAgICAgICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAkbGFiZWwgPSAkKGVsKS5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gJGxhYmVsWzBdO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gJChsYWJlbHMpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgdGhlIENTUyBlcnJvciBjbGFzcyBhcyBzcGVjaWZpZWQgYnkgdGhlIEFiaWRlIHNldHRpbmdzIHRvIHRoZSBsYWJlbCwgaW5wdXQsIGFuZCB0aGUgZm9ybVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSBjbGFzcyB0b1xuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdhZGRFcnJvckNsYXNzZXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEVycm9yQ2xhc3NlcygkZWwpIHtcbiAgICAgICAgdmFyICRsYWJlbCA9IHRoaXMuZmluZExhYmVsKCRlbCk7XG4gICAgICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICAgICAgaWYgKCRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICAgICAkbGFiZWwuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGZvcm1FcnJvci5sZW5ndGgpIHtcbiAgICAgICAgICAkZm9ybUVycm9yLmFkZENsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWwuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykuYXR0cignZGF0YS1pbnZhbGlkJywgJycpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZSBDU1MgZXJyb3IgY2xhc3NlcyBldGMgZnJvbSBhbiBlbnRpcmUgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXBOYW1lIC0gQSBzdHJpbmcgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWUgb2YgYSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICAgICAqXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbW92ZVJhZGlvRXJyb3JDbGFzc2VzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVSYWRpb0Vycm9yQ2xhc3Nlcyhncm91cE5hbWUpIHtcbiAgICAgICAgdmFyICRlbHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJzpyYWRpb1tuYW1lPVwiJyArIGdyb3VwTmFtZSArICdcIl0nKTtcbiAgICAgICAgdmFyICRsYWJlbHMgPSB0aGlzLmZpbmRSYWRpb0xhYmVscygkZWxzKTtcbiAgICAgICAgdmFyICRmb3JtRXJyb3JzID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbHMpO1xuXG4gICAgICAgIGlmICgkbGFiZWxzLmxlbmd0aCkge1xuICAgICAgICAgICRsYWJlbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGZvcm1FcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgJGZvcm1FcnJvcnMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyBmcm9tIHRoZSBsYWJlbCwgaW5wdXQsIGFuZCB0aGUgZm9ybVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gcmVtb3ZlIHRoZSBjbGFzcyBmcm9tXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbW92ZUVycm9yQ2xhc3NlcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgICAgICAvLyByYWRpb3MgbmVlZCB0byBjbGVhciBhbGwgb2YgdGhlIGVsc1xuICAgICAgICBpZiAoJGVsWzBdLnR5cGUgPT0gJ3JhZGlvJykge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlbW92ZVJhZGlvRXJyb3JDbGFzc2VzKCRlbC5hdHRyKCduYW1lJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRsYWJlbCA9IHRoaXMuZmluZExhYmVsKCRlbCk7XG4gICAgICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICAgICAgaWYgKCRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICAgICAkbGFiZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGZvcm1FcnJvci5sZW5ndGgpIHtcbiAgICAgICAgICAkZm9ybUVycm9yLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR29lcyB0aHJvdWdoIGEgZm9ybSB0byBmaW5kIGlucHV0cyBhbmQgcHJvY2VlZHMgdG8gdmFsaWRhdGUgdGhlbSBpbiB3YXlzIHNwZWNpZmljIHRvIHRoZWlyIHR5cGUuIFxuICAgICAgICogSWdub3JlcyBpbnB1dHMgd2l0aCBkYXRhLWFiaWRlLWlnbm9yZSwgdHlwZT1cImhpZGRlblwiIG9yIGRpc2FibGVkIGF0dHJpYnV0ZXMgc2V0XG4gICAgICAgKiBAZmlyZXMgQWJpZGUjaW52YWxpZFxuICAgICAgICogQGZpcmVzIEFiaWRlI3ZhbGlkXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdmFsaWRhdGUsIHNob3VsZCBiZSBhbiBIVE1MIGlucHV0XG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gZ29vZFRvR28gLSBJZiB0aGUgaW5wdXQgaXMgdmFsaWQgb3Igbm90LlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd2YWxpZGF0ZUlucHV0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWxpZGF0ZUlucHV0KCRlbCkge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICB2YXIgY2xlYXJSZXF1aXJlID0gdGhpcy5yZXF1aXJlZENoZWNrKCRlbCksXG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIGN1c3RvbVZhbGlkYXRvciA9IHRydWUsXG4gICAgICAgICAgICB2YWxpZGF0b3IgPSAkZWwuYXR0cignZGF0YS12YWxpZGF0b3InKSxcbiAgICAgICAgICAgIGVxdWFsVG8gPSB0cnVlO1xuXG4gICAgICAgIC8vIGRvbid0IHZhbGlkYXRlIGlnbm9yZWQgaW5wdXRzIG9yIGhpZGRlbiBpbnB1dHMgb3IgZGlzYWJsZWQgaW5wdXRzXG4gICAgICAgIGlmICgkZWwuaXMoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKSB8fCAkZWwuaXMoJ1t0eXBlPVwiaGlkZGVuXCJdJykgfHwgJGVsLmlzKCdbZGlzYWJsZWRdJykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoJGVsWzBdLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSB0aGlzLnZhbGlkYXRlUmFkaW8oJGVsLmF0dHIoJ25hbWUnKSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGNsZWFyUmVxdWlyZTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICAgICAgdmFsaWRhdGVkID0gY2xlYXJSZXF1aXJlO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsaWRhdGVkID0gdGhpcy52YWxpZGF0ZVRleHQoJGVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgICAgICBjdXN0b21WYWxpZGF0b3IgPSB0aGlzLm1hdGNoVmFsaWRhdGlvbigkZWwsIHZhbGlkYXRvciwgJGVsLmF0dHIoJ3JlcXVpcmVkJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRlbC5hdHRyKCdkYXRhLWVxdWFsdG8nKSkge1xuICAgICAgICAgIGVxdWFsVG8gPSB0aGlzLm9wdGlvbnMudmFsaWRhdG9ycy5lcXVhbFRvKCRlbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ29vZFRvR28gPSBbY2xlYXJSZXF1aXJlLCB2YWxpZGF0ZWQsIGN1c3RvbVZhbGlkYXRvciwgZXF1YWxUb10uaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICAgICAgICB2YXIgbWVzc2FnZSA9IChnb29kVG9HbyA/ICd2YWxpZCcgOiAnaW52YWxpZCcpICsgJy56Zi5hYmlkZSc7XG5cbiAgICAgICAgaWYgKGdvb2RUb0dvKSB7XG4gICAgICAgICAgLy8gUmUtdmFsaWRhdGUgaW5wdXRzIHRoYXQgZGVwZW5kIG9uIHRoaXMgb25lIHdpdGggZXF1YWx0b1xuICAgICAgICAgIHZhciBkZXBlbmRlbnRFbGVtZW50cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZXF1YWx0bz1cIicgKyAkZWwuYXR0cignaWQnKSArICdcIl0nKTtcbiAgICAgICAgICBpZiAoZGVwZW5kZW50RWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgX3RoaXMgPSBfdGhpczQ7XG4gICAgICAgICAgICAgIGRlcGVuZGVudEVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy52YWxpZGF0ZUlucHV0KCQodGhpcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbZ29vZFRvR28gPyAncmVtb3ZlRXJyb3JDbGFzc2VzJyA6ICdhZGRFcnJvckNsYXNzZXMnXSgkZWwpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBpbnB1dCBpcyBkb25lIGNoZWNraW5nIGZvciB2YWxpZGF0aW9uLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgdmFsaWQuemYuYWJpZGVgIG9yIGBpbnZhbGlkLnpmLmFiaWRlYFxuICAgICAgICAgKiBUcmlnZ2VyIGluY2x1ZGVzIHRoZSBET00gZWxlbWVudCBvZiB0aGUgaW5wdXQuXG4gICAgICAgICAqIEBldmVudCBBYmlkZSN2YWxpZFxuICAgICAgICAgKiBAZXZlbnQgQWJpZGUjaW52YWxpZFxuICAgICAgICAgKi9cbiAgICAgICAgJGVsLnRyaWdnZXIobWVzc2FnZSwgWyRlbF0pO1xuXG4gICAgICAgIHJldHVybiBnb29kVG9HbztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIGFuZCBpZiB0aGVyZSBhcmUgYW55IGludmFsaWQgaW5wdXRzLCBpdCB3aWxsIGRpc3BsYXkgdGhlIGZvcm0gZXJyb3IgZWxlbWVudFxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IG5vRXJyb3IgLSB0cnVlIGlmIG5vIGVycm9ycyB3ZXJlIGRldGVjdGVkLi4uXG4gICAgICAgKiBAZmlyZXMgQWJpZGUjZm9ybXZhbGlkXG4gICAgICAgKiBAZmlyZXMgQWJpZGUjZm9ybWludmFsaWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAndmFsaWRhdGVGb3JtJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWxpZGF0ZUZvcm0oKSB7XG4gICAgICAgIHZhciBhY2MgPSBbXTtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRpbnB1dHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgYWNjLnB1c2goX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBub0Vycm9yID0gYWNjLmluZGV4T2YoZmFsc2UpID09PSAtMTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsIG5vRXJyb3IgPyAnbm9uZScgOiAnYmxvY2snKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBpcyBmaW5pc2hlZCB2YWxpZGF0aW5nLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgZm9ybXZhbGlkLnpmLmFiaWRlYCBvciBgZm9ybWludmFsaWQuemYuYWJpZGVgLlxuICAgICAgICAgKiBUcmlnZ2VyIGluY2x1ZGVzIHRoZSBlbGVtZW50IG9mIHRoZSBmb3JtLlxuICAgICAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXZhbGlkXG4gICAgICAgICAqIEBldmVudCBBYmlkZSNmb3JtaW52YWxpZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKChub0Vycm9yID8gJ2Zvcm12YWxpZCcgOiAnZm9ybWludmFsaWQnKSArICcuemYuYWJpZGUnLCBbdGhpcy4kZWxlbWVudF0pO1xuXG4gICAgICAgIHJldHVybiBub0Vycm9yO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERldGVybWluZXMgd2hldGhlciBvciBhIG5vdCBhIHRleHQgaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gdGhlIHBhdHRlcm4gc3BlY2lmaWVkIGluIHRoZSBhdHRyaWJ1dGUuIElmIG5vIG1hdGNoaW5nIHBhdHRlcm4gaXMgZm91bmQsIHJldHVybnMgdHJ1ZS5cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHZhbGlkYXRlLCBzaG91bGQgYmUgYSB0ZXh0IGlucHV0IEhUTUwgZWxlbWVudFxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm4gLSBzdHJpbmcgdmFsdWUgb2Ygb25lIG9mIHRoZSBSZWdFeCBwYXR0ZXJucyBpbiBBYmlkZS5vcHRpb25zLnBhdHRlcm5zXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IHRoZSBpbnB1dCB2YWx1ZSBtYXRjaGVzIHRoZSBwYXR0ZXJuIHNwZWNpZmllZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd2YWxpZGF0ZVRleHQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbGlkYXRlVGV4dCgkZWwsIHBhdHRlcm4pIHtcbiAgICAgICAgLy8gQSBwYXR0ZXJuIGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbiwgb3IgaXQgd2lsbCBiZSBpbmZlcmVkIGZyb20gdGhlIGlucHV0J3MgXCJwYXR0ZXJuXCIgYXR0cmlidXRlLCBvciBpdCdzIFwidHlwZVwiIGF0dHJpYnV0ZVxuICAgICAgICBwYXR0ZXJuID0gcGF0dGVybiB8fCAkZWwuYXR0cigncGF0dGVybicpIHx8ICRlbC5hdHRyKCd0eXBlJyk7XG4gICAgICAgIHZhciBpbnB1dFRleHQgPSAkZWwudmFsKCk7XG4gICAgICAgIHZhciB2YWxpZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChpbnB1dFRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHBhdHRlcm4gYXR0cmlidXRlIG9uIHRoZSBlbGVtZW50IGlzIGluIEFiaWRlJ3MgbGlzdCBvZiBwYXR0ZXJucywgdGhlbiB0ZXN0IHRoYXQgcmVnZXhwXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXR0ZXJucy5oYXNPd25Qcm9wZXJ0eShwYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFsaWQgPSB0aGlzLm9wdGlvbnMucGF0dGVybnNbcGF0dGVybl0udGVzdChpbnB1dFRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB0aGUgcGF0dGVybiBuYW1lIGlzbid0IGFsc28gdGhlIHR5cGUgYXR0cmlidXRlIG9mIHRoZSBmaWVsZCwgdGhlbiB0ZXN0IGl0IGFzIGEgcmVnZXhwXG4gICAgICAgICAgZWxzZSBpZiAocGF0dGVybiAhPT0gJGVsLmF0dHIoJ3R5cGUnKSkge1xuICAgICAgICAgICAgICB2YWxpZCA9IG5ldyBSZWdFeHAocGF0dGVybikudGVzdChpbnB1dFRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFuIGVtcHR5IGZpZWxkIGlzIHZhbGlkIGlmIGl0J3Mgbm90IHJlcXVpcmVkXG4gICAgICAgIGVsc2UgaWYgKCEkZWwucHJvcCgncmVxdWlyZWQnKSkge1xuICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgcmFkaW8gaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXMgcmVxdWlyZWQgYW5kIHNlbGVjdGVkLiBBbHRob3VnaCB0aGUgZnVuY3Rpb24gdGFyZ2V0cyBhIHNpbmdsZSBgPGlucHV0PmAsIGl0IHZhbGlkYXRlcyBieSBjaGVja2luZyB0aGUgYHJlcXVpcmVkYCBhbmQgYGNoZWNrZWRgIHByb3BlcnRpZXMgb2YgYWxsIHJhZGlvIGJ1dHRvbnMgaW4gaXRzIGdyb3VwLlxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwTmFtZSAtIEEgc3RyaW5nIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lIG9mIGEgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0IGxlYXN0IG9uZSByYWRpbyBpbnB1dCBoYXMgYmVlbiBzZWxlY3RlZCAoaWYgaXQncyByZXF1aXJlZClcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAndmFsaWRhdGVSYWRpbycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsaWRhdGVSYWRpbyhncm91cE5hbWUpIHtcbiAgICAgICAgLy8gSWYgYXQgbGVhc3Qgb25lIHJhZGlvIGluIHRoZSBncm91cCBoYXMgdGhlIGByZXF1aXJlZGAgYXR0cmlidXRlLCB0aGUgZ3JvdXAgaXMgY29uc2lkZXJlZCByZXF1aXJlZFxuICAgICAgICAvLyBQZXIgVzNDIHNwZWMsIGFsbCByYWRpbyBidXR0b25zIGluIGEgZ3JvdXAgc2hvdWxkIGhhdmUgYHJlcXVpcmVkYCwgYnV0IHdlJ3JlIGJlaW5nIG5pY2VcbiAgICAgICAgdmFyICRncm91cCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnOnJhZGlvW25hbWU9XCInICsgZ3JvdXBOYW1lICsgJ1wiXScpO1xuICAgICAgICB2YXIgdmFsaWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHJlcXVpcmVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gRm9yIHRoZSBncm91cCB0byBiZSByZXF1aXJlZCwgYXQgbGVhc3Qgb25lIHJhZGlvIG5lZWRzIHRvIGJlIHJlcXVpcmVkXG4gICAgICAgICRncm91cC5lYWNoKGZ1bmN0aW9uIChpLCBlKSB7XG4gICAgICAgICAgaWYgKCQoZSkuYXR0cigncmVxdWlyZWQnKSkge1xuICAgICAgICAgICAgcmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVxdWlyZWQpIHZhbGlkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgLy8gRm9yIHRoZSBncm91cCB0byBiZSB2YWxpZCwgYXQgbGVhc3Qgb25lIHJhZGlvIG5lZWRzIHRvIGJlIGNoZWNrZWRcbiAgICAgICAgICAkZ3JvdXAuZWFjaChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICAgICAgaWYgKCQoZSkucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGV0ZXJtaW5lcyBpZiBhIHNlbGVjdGVkIGlucHV0IHBhc3NlcyBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uLiBNdWx0aXBsZSB2YWxpZGF0aW9ucyBjYW4gYmUgdXNlZCwgaWYgcGFzc2VkIHRvIHRoZSBlbGVtZW50IHdpdGggYGRhdGEtdmFsaWRhdG9yPVwiZm9vIGJhciBiYXpcImAgaW4gYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdGVkLlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBpbnB1dCBlbGVtZW50LlxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbGlkYXRvcnMgLSBhIHN0cmluZyBvZiBmdW5jdGlvbiBuYW1lcyBtYXRjaGluZyBmdW5jdGlvbnMgaW4gdGhlIEFiaWRlLm9wdGlvbnMudmFsaWRhdG9ycyBvYmplY3QuXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlcXVpcmVkIC0gc2VsZiBleHBsYW5hdG9yeT9cbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgdmFsaWRhdGlvbnMgcGFzc2VkLlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdtYXRjaFZhbGlkYXRpb24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1hdGNoVmFsaWRhdGlvbigkZWwsIHZhbGlkYXRvcnMsIHJlcXVpcmVkKSB7XG4gICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgIHJlcXVpcmVkID0gcmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgdmFyIGNsZWFyID0gdmFsaWRhdG9ycy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgIHJldHVybiBfdGhpczUub3B0aW9ucy52YWxpZGF0b3JzW3ZdKCRlbCwgcmVxdWlyZWQsICRlbC5wYXJlbnQoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2xlYXIuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJlc2V0cyBmb3JtIGlucHV0cyBhbmQgc3R5bGVzXG4gICAgICAgKiBAZmlyZXMgQWJpZGUjZm9ybXJlc2V0XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3Jlc2V0Rm9ybScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXRGb3JtKCkge1xuICAgICAgICB2YXIgJGZvcm0gPSB0aGlzLiRlbGVtZW50LFxuICAgICAgICAgICAgb3B0cyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICAkKCcuJyArIG9wdHMubGFiZWxFcnJvckNsYXNzLCAkZm9ybSkubm90KCdzbWFsbCcpLnJlbW92ZUNsYXNzKG9wdHMubGFiZWxFcnJvckNsYXNzKTtcbiAgICAgICAgJCgnLicgKyBvcHRzLmlucHV0RXJyb3JDbGFzcywgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmlucHV0RXJyb3JDbGFzcyk7XG4gICAgICAgICQob3B0cy5mb3JtRXJyb3JTZWxlY3RvciArICcuJyArIG9wdHMuZm9ybUVycm9yQ2xhc3MpLnJlbW92ZUNsYXNzKG9wdHMuZm9ybUVycm9yQ2xhc3MpO1xuICAgICAgICAkZm9ybS5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAkKCc6aW5wdXQnLCAkZm9ybSkubm90KCc6YnV0dG9uLCA6c3VibWl0LCA6cmVzZXQsIDpoaWRkZW4sIDpyYWRpbywgOmNoZWNrYm94LCBbZGF0YS1hYmlkZS1pZ25vcmVdJykudmFsKCcnKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAgICAgJCgnOmlucHV0OnJhZGlvJywgJGZvcm0pLm5vdCgnW2RhdGEtYWJpZGUtaWdub3JlXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSkucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgICAgICQoJzppbnB1dDpjaGVja2JveCcsICRmb3JtKS5ub3QoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBoYXMgYmVlbiByZXNldC5cbiAgICAgICAgICogQGV2ZW50IEFiaWRlI2Zvcm1yZXNldFxuICAgICAgICAgKi9cbiAgICAgICAgJGZvcm0udHJpZ2dlcignZm9ybXJlc2V0LnpmLmFiaWRlJywgWyRmb3JtXSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgQWJpZGUuXG4gICAgICAgKiBSZW1vdmVzIGVycm9yIHN0eWxlcyBhbmQgY2xhc3NlcyBmcm9tIGVsZW1lbnRzLCB3aXRob3V0IHJlc2V0dGluZyB0aGVpciB2YWx1ZXMuXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuYWJpZGUnKS5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXG4gICAgICAgIHRoaXMuJGlucHV0cy5vZmYoJy5hYmlkZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLnJlbW92ZUVycm9yQ2xhc3NlcygkKHRoaXMpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBBYmlkZTtcbiAgfSgpO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAgICovXG5cblxuICBBYmlkZS5kZWZhdWx0cyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBldmVudCB0byB2YWxpZGF0ZSBpbnB1dHMuIENoZWNrYm94ZXMgYW5kIHJhZGlvcyB2YWxpZGF0ZSBpbW1lZGlhdGVseS5cbiAgICAgKiBSZW1vdmUgb3IgY2hhbmdlIHRoaXMgdmFsdWUgZm9yIG1hbnVhbCB2YWxpZGF0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnZmllbGRDaGFuZ2UnXG4gICAgICovXG4gICAgdmFsaWRhdGVPbjogJ2ZpZWxkQ2hhbmdlJyxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIHRvIGJlIGFwcGxpZWQgdG8gaW5wdXQgbGFiZWxzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdpcy1pbnZhbGlkLWxhYmVsJ1xuICAgICAqL1xuICAgIGxhYmVsRXJyb3JDbGFzczogJ2lzLWludmFsaWQtbGFiZWwnLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byBpbnB1dHMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2lzLWludmFsaWQtaW5wdXQnXG4gICAgICovXG4gICAgaW5wdXRFcnJvckNsYXNzOiAnaXMtaW52YWxpZC1pbnB1dCcsXG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyBzZWxlY3RvciB0byB1c2UgdG8gdGFyZ2V0IEZvcm0gRXJyb3JzIGZvciBzaG93L2hpZGUuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJy5mb3JtLWVycm9yJ1xuICAgICAqL1xuICAgIGZvcm1FcnJvclNlbGVjdG9yOiAnLmZvcm0tZXJyb3InLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgYWRkZWQgdG8gRm9ybSBFcnJvcnMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2lzLXZpc2libGUnXG4gICAgICovXG4gICAgZm9ybUVycm9yQ2xhc3M6ICdpcy12aXNpYmxlJyxcblxuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIHRvIHZhbGlkYXRlIHRleHQgaW5wdXRzIG9uIGFueSB2YWx1ZSBjaGFuZ2UuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgbGl2ZVZhbGlkYXRlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIHRvIHZhbGlkYXRlIGlucHV0cyBvbiBibHVyLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHZhbGlkYXRlT25CbHVyOiBmYWxzZSxcblxuICAgIHBhdHRlcm5zOiB7XG4gICAgICBhbHBoYTogL15bYS16QS1aXSskLyxcbiAgICAgIGFscGhhX251bWVyaWM6IC9eW2EtekEtWjAtOV0rJC8sXG4gICAgICBpbnRlZ2VyOiAvXlstK10/XFxkKyQvLFxuICAgICAgbnVtYmVyOiAvXlstK10/XFxkKig/OltcXC5cXCxdXFxkKyk/JC8sXG5cbiAgICAgIC8vIGFtZXgsIHZpc2EsIGRpbmVyc1xuICAgICAgY2FyZDogL14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV1bMC05XSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fCg/OjIxMzF8MTgwMHwzNVxcZHszfSlcXGR7MTF9KSQvLFxuICAgICAgY3Z2OiAvXihbMC05XSl7Myw0fSQvLFxuXG4gICAgICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zdGF0ZXMtb2YtdGhlLXR5cGUtYXR0cmlidXRlLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcbiAgICAgIGVtYWlsOiAvXlthLXpBLVowLTkuISMkJSYnKitcXC89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSskLyxcblxuICAgICAgdXJsOiAvXihodHRwcz98ZnRwfGZpbGV8c3NoKTpcXC9cXC8oKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OikqQCk/KCgoXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pKXwoKChbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/KSg6XFxkKik/KShcXC8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKyhcXC8oKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkqKSopPyk/KFxcPygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8W1xcdUUwMDAtXFx1RjhGRl18XFwvfFxcPykqKT8oXFwjKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxcXC98XFw/KSopPyQvLFxuICAgICAgLy8gYWJjLmRlXG4gICAgICBkb21haW46IC9eKFthLXpBLVowLTldKFthLXpBLVowLTlcXC1dezAsNjF9W2EtekEtWjAtOV0pP1xcLikrW2EtekEtWl17Miw4fSQvLFxuXG4gICAgICBkYXRldGltZTogL14oWzAtMl1bMC05XXszfSlcXC0oWzAtMV1bMC05XSlcXC0oWzAtM11bMC05XSlUKFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pKFp8KFtcXC1cXCtdKFswLTFdWzAtOV0pXFw6MDApKSQvLFxuICAgICAgLy8gWVlZWS1NTS1ERFxuICAgICAgZGF0ZTogLyg/OjE5fDIwKVswLTldezJ9LSg/Oig/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXwxWzAtOV18MlswLTldKXwoPzooPyEwMikoPzowWzEtOV18MVswLTJdKS0oPzozMCkpfCg/Oig/OjBbMTM1NzhdfDFbMDJdKS0zMSkpJC8sXG4gICAgICAvLyBISDpNTTpTU1xuICAgICAgdGltZTogL14oMFswLTldfDFbMC05XXwyWzAtM10pKDpbMC01XVswLTldKXsyfSQvLFxuICAgICAgZGF0ZUlTTzogL15cXGR7NH1bXFwvXFwtXVxcZHsxLDJ9W1xcL1xcLV1cXGR7MSwyfSQvLFxuICAgICAgLy8gTU0vREQvWVlZWVxuICAgICAgbW9udGhfZGF5X3llYXI6IC9eKDBbMS05XXwxWzAxMl0pWy0gXFwvLl0oMFsxLTldfFsxMl1bMC05XXwzWzAxXSlbLSBcXC8uXVxcZHs0fSQvLFxuICAgICAgLy8gREQvTU0vWVlZWVxuICAgICAgZGF5X21vbnRoX3llYXI6IC9eKDBbMS05XXxbMTJdWzAtOV18M1swMV0pWy0gXFwvLl0oMFsxLTldfDFbMDEyXSlbLSBcXC8uXVxcZHs0fSQvLFxuXG4gICAgICAvLyAjRkZGIG9yICNGRkZGRkZcbiAgICAgIGNvbG9yOiAvXiM/KFthLWZBLUYwLTldezZ9fFthLWZBLUYwLTldezN9KSQvXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIHZhbGlkYXRpb24gZnVuY3Rpb25zIHRvIGJlIHVzZWQuIGBlcXVhbFRvYCBiZWluZyB0aGUgb25seSBkZWZhdWx0IGluY2x1ZGVkIGZ1bmN0aW9uLlxuICAgICAqIEZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIG9ubHkgYSBib29sZWFuIGlmIHRoZSBpbnB1dCBpcyB2YWxpZCBvciBub3QuIEZ1bmN0aW9ucyBhcmUgZ2l2ZW4gdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAgICogZWwgOiBUaGUgalF1ZXJ5IGVsZW1lbnQgdG8gdmFsaWRhdGUuXG4gICAgICogcmVxdWlyZWQgOiBCb29sZWFuIHZhbHVlIG9mIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYmUgcHJlc2VudCBvciBub3QuXG4gICAgICogcGFyZW50IDogVGhlIGRpcmVjdCBwYXJlbnQgb2YgdGhlIGlucHV0LlxuICAgICAqIEBvcHRpb25cbiAgICAgKi9cbiAgICB2YWxpZGF0b3JzOiB7XG4gICAgICBlcXVhbFRvOiBmdW5jdGlvbiAoZWwsIHJlcXVpcmVkLCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuICQoJyMnICsgZWwuYXR0cignZGF0YS1lcXVhbHRvJykpLnZhbCgpID09PSBlbC52YWwoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oQWJpZGUsICdBYmlkZScpO1xufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIERyb3Bkb3duTWVudSBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcm9wZG93bi1tZW51XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5uZXN0XG4gICAqL1xuXG4gIHZhciBEcm9wZG93bk1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIERyb3Bkb3duTWVudSNpbml0XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIERyb3Bkb3duTWVudShlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcGRvd25NZW51KTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0Ryb3Bkb3duTWVudScsIHtcbiAgICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICAgJ0FSUk9XX1VQJzogJ3VwJyxcbiAgICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoRHJvcGRvd25NZW51LCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3MoJ2ZpcnN0LXN1YicpO1xuXG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgICAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgICAgICB0aGlzLiR0YWJzLmZpbmQoJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudmVydGljYWxDbGFzcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5vcHRpb25zLnJpZ2h0Q2xhc3MpIHx8IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdyaWdodCcgfHwgRm91bmRhdGlvbi5ydGwoKSB8fCB0aGlzLiRlbGVtZW50LnBhcmVudHMoJy50b3AtYmFyLXJpZ2h0JykuaXMoJyonKSkge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgICAgIHN1YnMuYWRkQ2xhc3MoJ29wZW5zLWxlZnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaXNWZXJ0aWNhbCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2lzVmVydGljYWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiR0YWJzLmNzcygnZGlzcGxheScpID09PSAnYmxvY2snO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGVsZW1lbnRzIHdpdGhpbiB0aGUgbWVudVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgdHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgICAgcGFyQ2xhc3MgPSAnaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnO1xuXG4gICAgICAgIC8vIHVzZWQgZm9yIG9uQ2xpY2sgYW5kIGluIHRoZSBrZXlib2FyZCBoYW5kbGVyc1xuICAgICAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRlbGVtID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICcuJyArIHBhckNsYXNzKSxcbiAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpLFxuICAgICAgICAgICAgICBoYXNDbGlja2VkID0gJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScsXG4gICAgICAgICAgICAgICRzdWIgPSAkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcblxuICAgICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICAgIGlmIChoYXNDbGlja2VkKSB7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgfHwgIV90aGlzLm9wdGlvbnMuY2xpY2tPcGVuICYmICFoYXNUb3VjaCB8fCBfdGhpcy5vcHRpb25zLmZvcmNlRm9sbG93ICYmIGhhc1RvdWNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAgICAgJGVsZW0uYWRkKCRlbGVtLnBhcmVudHNVbnRpbChfdGhpcy4kZWxlbWVudCwgJy4nICsgcGFyQ2xhc3MpKS5hdHRyKCdkYXRhLWlzLWNsaWNrJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tPcGVuIHx8IGhhc1RvdWNoKSB7XG4gICAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBoYW5kbGVDbGlja0ZuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBMZWFmIGVsZW1lbnQgQ2xpY2tzXG4gICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsb3NlT25DbGlja0luc2lkZSkge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKCFoYXNTdWIpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcikge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykpO1xuICAgICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgICAgICBpZiAoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKSB7XG4gICAgICAgICAgICAgIGlmICgkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyAmJiBfdGhpcy5vcHRpb25zLmNsaWNrT3Blbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5jbG9zaW5nVGltZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbigna2V5ZG93bi56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnW3JvbGU9XCJtZW51aXRlbVwiXScpLFxuICAgICAgICAgICAgICBpc1RhYiA9IF90aGlzLiR0YWJzLmluZGV4KCRlbGVtZW50KSA+IC0xLFxuICAgICAgICAgICAgICAkZWxlbWVudHMgPSBpc1RhYiA/IF90aGlzLiR0YWJzIDogJGVsZW1lbnQuc2libGluZ3MoJ2xpJykuYWRkKCRlbGVtZW50KSxcbiAgICAgICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShpIC0gMSk7XG4gICAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShpICsgMSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzpsYXN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgICAgJG5leHRFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByZXZTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICAgICBvcGVuU3ViID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRzdWIgPSAkZWxlbWVudC5jaGlsZHJlbigndWwuaXMtZHJvcGRvd24tc3VibWVudScpO1xuICAgICAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCdsaSA+IGE6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2xvc2VTdWIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvL2lmICgkZWxlbWVudC5pcygnOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgIHZhciBjbG9zZSA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJyk7XG4gICAgICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICBfdGhpcy5faGlkZShjbG9zZSk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICAgICAgICBvcGVuOiBvcGVuU3ViLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoX3RoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgICAgICBfdGhpcy4kbWVudUl0ZW1zLmZpbmQoJ2E6Zmlyc3QnKS5mb2N1cygpOyAvLyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChpc1RhYikge1xuICAgICAgICAgICAgaWYgKF90aGlzLl9pc1ZlcnRpY2FsKCkpIHtcbiAgICAgICAgICAgICAgLy8gdmVydGljYWwgbWVudVxuICAgICAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkge1xuICAgICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGhvcml6b250YWwgbWVudVxuICAgICAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkge1xuICAgICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIG5leHQ6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgbmV4dDogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbm90IHRhYnMgLT4gb25lIHN1YlxuICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcbiAgICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YixcbiAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhbiBldmVudCBoYW5kbGVyIHRvIHRoZSBib2R5IHRvIGNsb3NlIGFueSBkcm9wZG93bnMgb24gYSBjbGljay5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2FkZEJvZHlIYW5kbGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYWRkQm9keUhhbmRsZXIoKSB7XG4gICAgICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jykub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRsaW5rID0gX3RoaXMuJGVsZW1lbnQuZmluZChlLnRhcmdldCk7XG4gICAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3BlbnMgYSBkcm9wZG93biBwYW5lLCBhbmQgY2hlY2tzIGZvciBjb2xsaXNpb25zIGZpcnN0LlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc2hvdycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Nob3coJHN1Yikge1xuICAgICAgICB2YXIgaWR4ID0gdGhpcy4kdGFicy5pbmRleCh0aGlzLiR0YWJzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICByZXR1cm4gJChlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgICAgICB9KSk7XG4gICAgICAgIHZhciAkc2licyA9ICRzdWIucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLnNpYmxpbmdzKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5hZGRDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJykucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgdmFyIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcbiAgICAgICAgICAgICAgJHBhcmVudExpID0gJHN1Yi5wYXJlbnQoJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMnICsgb2xkQ2xhc3MpLmFkZENsYXNzKCdvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCk7XG4gICAgICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgICAgIGlmICghY2xlYXIpIHtcbiAgICAgICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy1pbm5lcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJycpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljaykge1xuICAgICAgICAgIHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG5ldyBkcm9wZG93biBwYW5lIGlzIHZpc2libGUuXG4gICAgICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3dubWVudScsIFskc3ViXSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGlkZXMgYSBzaW5nbGUsIGN1cnJlbnRseSBvcGVuIGRyb3Bkb3duIHBhbmUsIGlmIHBhc3NlZCBhIHBhcmFtZXRlciwgb3RoZXJ3aXNlLCBoaWRlcyBldmVyeXRoaW5nLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIGhpZGVcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBpbmRleCBvZiB0aGUgJHRhYnMgY29sbGVjdGlvbiB0byBoaWRlXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaGlkZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hpZGUoJGVsZW0sIGlkeCkge1xuICAgICAgICB2YXIgJHRvQ2xvc2U7XG4gICAgICAgIGlmICgkZWxlbSAmJiAkZWxlbS5sZW5ndGgpIHtcbiAgICAgICAgICAkdG9DbG9zZSA9ICRlbGVtO1xuICAgICAgICB9IGVsc2UgaWYgKGlkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSB0aGlzLiR0YWJzLm5vdChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBpID09PSBpZHg7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHZhciBzb21ldGhpbmdUb0Nsb3NlID0gJHRvQ2xvc2UuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpIHx8ICR0b0Nsb3NlLmZpbmQoJy5pcy1hY3RpdmUnKS5sZW5ndGggPiAwO1xuXG4gICAgICAgIGlmIChzb21ldGhpbmdUb0Nsb3NlKSB7XG4gICAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLWlzLWNsaWNrJzogZmFsc2VcbiAgICAgICAgICB9KS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5yZW1vdmVDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZiAodGhpcy5jaGFuZ2VkIHx8ICR0b0Nsb3NlLmZpbmQoJ29wZW5zLWlubmVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGQoJHRvQ2xvc2UpLnJlbW92ZUNsYXNzKCdvcGVucy1pbm5lciBvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCkuYWRkQ2xhc3MoJ29wZW5zLScgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb3BlbiBtZW51cyBhcmUgY2xvc2VkLlxuICAgICAgICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjaGlkZVxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bm1lbnUnLCBbJHRvQ2xvc2VdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9mZignLnpmLmRyb3Bkb3dubWVudScpLnJlbW92ZUF0dHIoJ2RhdGEtaXMtY2xpY2snKS5yZW1vdmVDbGFzcygnaXMtcmlnaHQtYXJyb3cgaXMtbGVmdC1hcnJvdyBpcy1kb3duLWFycm93IG9wZW5zLXJpZ2h0IG9wZW5zLWxlZnQgb3BlbnMtaW5uZXInKTtcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRHJvcGRvd25NZW51O1xuICB9KCk7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICAgKi9cblxuXG4gIERyb3Bkb3duTWVudS5kZWZhdWx0cyA9IHtcbiAgICAvKipcbiAgICAgKiBEaXNhbGxvd3MgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyBzdWJtZW51c1xuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gICAgLyoqXG4gICAgICogQWxsb3cgYSBzdWJtZW51IHRvIGF1dG9tYXRpY2FsbHkgY2xvc2Ugb24gYSBtb3VzZWxlYXZlIGV2ZW50LCBpZiBub3QgY2xpY2tlZCBvcGVuLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgYXV0b2Nsb3NlOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IG9wZW5pbmcgYSBzdWJtZW51IG9uIGhvdmVyIGV2ZW50LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDUwXG4gICAgICovXG4gICAgaG92ZXJEZWxheTogNTAsXG4gICAgLyoqXG4gICAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBjbG9zaW5nIGEgc3VibWVudSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGRlZmF1bHQgNTAwXG4gICAgICovXG5cbiAgICBjbG9zaW5nVGltZTogNTAwLFxuICAgIC8qKlxuICAgICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy4gQ2FuIGJlIGAnbGVmdCdgIG9yIGAncmlnaHQnYC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnbGVmdCdcbiAgICAgKi9cbiAgICBhbGlnbm1lbnQ6ICdsZWZ0JyxcbiAgICAvKipcbiAgICAgKiBBbGxvdyBjbGlja3Mgb24gdGhlIGJvZHkgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gICAgLyoqXG4gICAgICogQWxsb3cgY2xpY2tzIG9uIGxlYWYgYW5jaG9yIGxpbmtzIHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY2xvc2VPbkNsaWNrSW5zaWRlOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAndmVydGljYWwnXG4gICAgICovXG4gICAgdmVydGljYWxDbGFzczogJ3ZlcnRpY2FsJyxcbiAgICAvKipcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHJpZ2h0LXNpZGUgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgYWxpZ24tcmlnaHRgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnYWxpZ24tcmlnaHQnXG4gICAgICovXG4gICAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgICAvKipcbiAgICAgKiBCb29sZWFuIHRvIGZvcmNlIG92ZXJpZGUgdGhlIGNsaWNraW5nIG9mIGxpbmtzIHRvIHBlcmZvcm0gZGVmYXVsdCBhY3Rpb24sIG9uIHNlY29uZCB0b3VjaCBldmVudCBmb3IgbW9iaWxlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZm9yY2VGb2xsb3c6IHRydWVcbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93bk1lbnUsICdEcm9wZG93bk1lbnUnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBPZmZDYW52YXMgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAgICovXG5cbiAgdmFyIE9mZkNhbnZhcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gT2ZmQ2FudmFzKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBPZmZDYW52YXMpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xuICAgICAgdGhpcy4kdHJpZ2dlcnMgPSAkKCk7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09mZkNhbnZhcycsIHtcbiAgICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKE9mZkNhbnZhcywgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLXRyYW5zaXRpb24tJyArIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uKTtcblxuICAgICAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgICAgICB0aGlzLiR0cmlnZ2VycyA9ICQoZG9jdW1lbnQpLmZpbmQoJ1tkYXRhLW9wZW49XCInICsgaWQgKyAnXCJdLCBbZGF0YS1jbG9zZT1cIicgKyBpZCArICdcIl0sIFtkYXRhLXRvZ2dsZT1cIicgKyBpZCArICdcIl0nKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJykuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcblxuICAgICAgICAvLyBBZGQgYW4gb3ZlcmxheSBvdmVyIHRoZSBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB2YXIgb3ZlcmxheVBvc2l0aW9uID0gJCh0aGlzLiRlbGVtZW50KS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ2ZpeGVkJyA/ICdpcy1vdmVybGF5LWZpeGVkJyA6ICdpcy1vdmVybGF5LWFic29sdXRlJztcbiAgICAgICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgICAgICAgIGlmIChvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XG4gICAgICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICAgICAna2V5ZG93bi56Zi5vZmZjYW52YXMnOiB0aGlzLl9oYW5kbGVLZXlib2FyZC5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICAgICAgdmFyICR0YXJnZXQgPSB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPyB0aGlzLiRvdmVybGF5IDogJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpO1xuICAgICAgICAgICR0YXJnZXQub24oeyAnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQXBwbGllcyBldmVudCBsaXN0ZW5lciBmb3IgZWxlbWVudHMgdGhhdCB3aWxsIHJldmVhbCBhdCBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3NldE1RQ2hlY2tlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldE1RQ2hlY2tlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uZSgnbG9hZC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNSZXZlYWxlZCAtIHRydWUgaWYgZWxlbWVudCBzaG91bGQgYmUgcmV2ZWFsZWQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmV2ZWFsJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgICAgICB2YXIgJGNsb3NlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtY2xvc2VdJyk7XG4gICAgICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICRjbG9zZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcylcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICRjbG9zZXIuc2hvdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFN0b3BzIHNjcm9sbGluZyBvZiB0aGUgYm9keSB3aGVuIG9mZmNhbnZhcyBpcyBvcGVuIG9uIG1vYmlsZSBTYWZhcmkgYW5kIG90aGVyIHRyb3VibGVzb21lIGJyb3dzZXJzLlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3N0b3BTY3JvbGxpbmcnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgICAgIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19yZWNvcmRTY3JvbGxhYmxlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVjb3JkU2Nyb2xsYWJsZShldmVudCkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgICAgICBpZiAoZWxlbS5zY3JvbGxIZWlnaHQgIT09IGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIHRvcCwgc2Nyb2xsIGRvd24gb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyB1cFxuICAgICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbGVtLmFsbG93VXAgPSBlbGVtLnNjcm9sbFRvcCA+IDA7XG4gICAgICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0O1xuICAgICAgICBlbGVtLmxhc3RZID0gZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc3RvcFNjcm9sbFByb3BhZ2F0aW9uJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG4gICAgICAgIHZhciB1cCA9IGV2ZW50LnBhZ2VZIDwgZWxlbS5sYXN0WTtcbiAgICAgICAgdmFyIGRvd24gPSAhdXA7XG4gICAgICAgIGVsZW0ubGFzdFkgPSBldmVudC5wYWdlWTtcblxuICAgICAgICBpZiAodXAgJiYgZWxlbS5hbGxvd1VwIHx8IGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pIHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvcGVuJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAnYm90dG9tJykge1xuICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpLnRyaWdnZXIoJ29wZW5lZC56Zi5vZmZjYW52YXMnKTtcblxuICAgICAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQodGhpcy4kZWxlbWVudCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgICAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnY2xvc2UnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKGNiKSB7XG4gICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgICAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3RvZ2dsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19oYW5kbGVLZXlib2FyZCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09mZkNhbnZhcycsIHtcbiAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLmNsb3NlKCk7XG4gICAgICAgICAgICBfdGhpczIuJGxhc3RUcmlnZ2VyLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBPZmZDYW52YXM7XG4gIH0oKTtcblxuICBPZmZDYW52YXMuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gb3ZlcmxheSBvbiB0b3Agb2YgYFtkYXRhLW9mZi1jYW52YXMtY29udGVudF1gLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY29udGVudE92ZXJsYXk6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNvbnRlbnRTY3JvbGw6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKi9cbiAgICB0cmFuc2l0aW9uVGltZTogMCxcblxuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBwdXNoXG4gICAgICovXG4gICAgdHJhbnNpdGlvbjogJ3B1c2gnLFxuXG4gICAgLyoqXG4gICAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvciBib3R0b20gb24gb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUgez9zdHJpbmd9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIGZvcmNlVG86IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICByZXZlYWxPbjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcmV2ZWFsLWZvci1cbiAgICAgKiBAdG9kbyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgICAqL1xuICAgIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHRyYXBGb2N1czogZmFsc2VcbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBPcmJpdCBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5vcmJpdFxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRvdWNoXG4gICAqL1xuXG4gIHZhciBPcmJpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb3JiaXQgY2Fyb3VzZWwuXG4gICAgKiBAY2xhc3NcbiAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gT3JiaXQgQ2Fyb3VzZWwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgKi9cbiAgICBmdW5jdGlvbiBPcmJpdChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgT3JiaXQpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPcmJpdC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09yYml0Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPcmJpdCcsIHtcbiAgICAgICAgJ2x0cic6IHtcbiAgICAgICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICAgIH0sXG4gICAgICAgICdydGwnOiB7XG4gICAgICAgICAgJ0FSUk9XX0xFRlQnOiAnbmV4dCcsXG4gICAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ3ByZXZpb3VzJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgY3JlYXRpbmcgalF1ZXJ5IGNvbGxlY3Rpb25zLCBzZXR0aW5nIGF0dHJpYnV0ZXMsIGFuZCBzdGFydGluZyB0aGUgYW5pbWF0aW9uLlxuICAgICogQGZ1bmN0aW9uXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhPcmJpdCwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgLy8gQFRPRE86IGNvbnNpZGVyIGRpc2N1c3Npb24gb24gUFIgIzkyNzggYWJvdXQgRE9NIHBvbGx1dGlvbiBieSBjaGFuZ2VTbGlkZVxuICAgICAgICB0aGlzLl9yZXNldCgpO1xuXG4gICAgICAgIHRoaXMuJHdyYXBwZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcbiAgICAgICAgdGhpcy4kc2xpZGVzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKTtcblxuICAgICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJyksXG4gICAgICAgICAgICBpbml0QWN0aXZlID0gdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpLFxuICAgICAgICAgICAgaWQgPSB0aGlzLiRlbGVtZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ29yYml0Jyk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcbiAgICAgICAgICAnZGF0YS1yZXNpemUnOiBpZCxcbiAgICAgICAgICAnaWQnOiBpZFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWluaXRBY3RpdmUubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kc2xpZGVzLmVxKDApLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnVzZU1VSSkge1xuICAgICAgICAgIHRoaXMuJHNsaWRlcy5hZGRDbGFzcygnbm8tbW90aW9udWknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fcHJlcGFyZUZvck9yYml0LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3ByZXBhcmVGb3JPcmJpdCgpOyAvL2hlaGVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVsbGV0cykge1xuICAgICAgICAgIHRoaXMuX2xvYWRCdWxsZXRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QbGF5ICYmIHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhpcy5nZW9TeW5jKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFjY2Vzc2libGUpIHtcbiAgICAgICAgICAvLyBhbGxvdyB3cmFwcGVyIHRvIGJlIGZvY3VzYWJsZSB0byBlbmFibGUgYXJyb3cgbmF2aWdhdGlvblxuICAgICAgICAgIHRoaXMuJHdyYXBwZXIuYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogQ3JlYXRlcyBhIGpRdWVyeSBjb2xsZWN0aW9uIG9mIGJ1bGxldHMsIGlmIHRoZXkgYXJlIGJlaW5nIHVzZWQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19sb2FkQnVsbGV0cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2xvYWRCdWxsZXRzKCkge1xuICAgICAgICB0aGlzLiRidWxsZXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5ib3hPZkJ1bGxldHMpLmZpbmQoJ2J1dHRvbicpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogU2V0cyBhIGB0aW1lcmAgb2JqZWN0IG9uIHRoZSBvcmJpdCwgYW5kIHN0YXJ0cyB0aGUgY291bnRlciBmb3IgdGhlIG5leHQgc2xpZGUuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2dlb1N5bmMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdlb1N5bmMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgRm91bmRhdGlvbi5UaW1lcih0aGlzLiRlbGVtZW50LCB7XG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy50aW1lckRlbGF5LFxuICAgICAgICAgIGluZmluaXRlOiBmYWxzZVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBTZXRzIHdyYXBwZXIgYW5kIHNsaWRlIGhlaWdodHMgZm9yIHRoZSBvcmJpdC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3ByZXBhcmVGb3JPcmJpdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3ByZXBhcmVGb3JPcmJpdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5fc2V0V3JhcHBlckhlaWdodCgpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogQ2FsdWxhdGVzIHRoZSBoZWlnaHQgb2YgZWFjaCBzbGlkZSBpbiB0aGUgY29sbGVjdGlvbiwgYW5kIHVzZXMgdGhlIHRhbGxlc3Qgb25lIGZvciB0aGUgd3JhcHBlciBoZWlnaHQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSB3aGVuIGNvbXBsZXRlLlxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zZXRXcmFwcGVySGVpZ2h0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0V3JhcHBlckhlaWdodChjYikge1xuICAgICAgICAvL3Jld3JpdGUgdGhpcyB0byBgZm9yYCBsb29wXG4gICAgICAgIHZhciBtYXggPSAwLFxuICAgICAgICAgICAgdGVtcCxcbiAgICAgICAgICAgIGNvdW50ZXIgPSAwLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLXNsaWRlJywgY291bnRlcik7XG5cbiAgICAgICAgICBpZiAoX3RoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKVswXSAhPT0gX3RoaXMuJHNsaWRlcy5lcShjb3VudGVyKVswXSkge1xuICAgICAgICAgICAgLy9pZiBub3QgdGhlIGFjdGl2ZSBzbGlkZSwgc2V0IGNzcyBwb3NpdGlvbiBhbmQgZGlzcGxheSBwcm9wZXJ0eVxuICAgICAgICAgICAgJCh0aGlzKS5jc3MoeyAncG9zaXRpb24nOiAncmVsYXRpdmUnLCAnZGlzcGxheSc6ICdub25lJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICAgICAgY291bnRlcisrO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY291bnRlciA9PT0gdGhpcy4kc2xpZGVzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJHdyYXBwZXIuY3NzKHsgJ2hlaWdodCc6IG1heCB9KTsgLy9vbmx5IGNoYW5nZSB0aGUgd3JhcHBlciBoZWlnaHQgcHJvcGVydHkgb25jZS5cbiAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIGNiKG1heCk7XG4gICAgICAgICAgfSAvL2ZpcmUgY2FsbGJhY2sgd2l0aCBtYXggaGVpZ2h0IGRpbWVuc2lvbi5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogU2V0cyB0aGUgbWF4LWhlaWdodCBvZiBlYWNoIHNsaWRlLlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc2V0U2xpZGVIZWlnaHQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRTbGlkZUhlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICQodGhpcykuY3NzKCdtYXgtaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBiYXNpY2FsbHkgZXZlcnl0aGluZyB3aXRoaW4gdGhlIGVsZW1lbnQuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19ldmVudHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9ldmVudHMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8qKk5vdyB1c2luZyBjdXN0b20gZXZlbnQgLSB0aGFua3MgdG86KipcbiAgICAgICAgLy8qKiAgICAgIFlvaGFpIEFyYXJhdCBvZiBUb3JvbnRvICAgICAgKipcbiAgICAgICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5yZXNpemVtZS56Zi50cmlnZ2VyJykub24oe1xuICAgICAgICAgICdyZXNpemVtZS56Zi50cmlnZ2VyJzogdGhpcy5fcHJlcGFyZUZvck9yYml0LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLiRzbGlkZXMubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zd2lwZSkge1xuICAgICAgICAgICAgdGhpcy4kc2xpZGVzLm9mZignc3dpcGVsZWZ0LnpmLm9yYml0IHN3aXBlcmlnaHQuemYub3JiaXQnKS5vbignc3dpcGVsZWZ0LnpmLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSh0cnVlKTtcbiAgICAgICAgICAgIH0pLm9uKCdzd2lwZXJpZ2h0LnpmLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuJHNsaWRlcy5vbignY2xpY2suemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LmRhdGEoJ2NsaWNrZWRPbicsIF90aGlzLiRlbGVtZW50LmRhdGEoJ2NsaWNrZWRPbicpID8gZmFsc2UgOiB0cnVlKTtcbiAgICAgICAgICAgICAgX3RoaXMudGltZXJbX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykgPyAncGF1c2UnIDogJ3N0YXJ0J10oKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhdXNlT25Ib3Zlcikge1xuICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWVudGVyLnpmLm9yYml0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRpbWVyLnBhdXNlKCk7XG4gICAgICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlLnpmLm9yYml0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzLnRpbWVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5hdkJ1dHRvbnMpIHtcbiAgICAgICAgICAgIHZhciAkY29udHJvbHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLm5leHRDbGFzcyArICcsIC4nICsgdGhpcy5vcHRpb25zLnByZXZDbGFzcyk7XG4gICAgICAgICAgICAkY29udHJvbHMuYXR0cigndGFiaW5kZXgnLCAwKVxuICAgICAgICAgICAgLy9hbHNvIG5lZWQgdG8gaGFuZGxlIGVudGVyL3JldHVybiBhbmQgc3BhY2ViYXIga2V5IHByZXNzZXNcbiAgICAgICAgICAgIC5vbignY2xpY2suemYub3JiaXQgdG91Y2hlbmQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKCQodGhpcykuaGFzQ2xhc3MoX3RoaXMub3B0aW9ucy5uZXh0Q2xhc3MpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVsbGV0cykge1xuICAgICAgICAgICAgdGhpcy4kYnVsbGV0cy5vbignY2xpY2suemYub3JiaXQgdG91Y2hlbmQuemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmICgvaXMtYWN0aXZlL2cudGVzdCh0aGlzLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH0gLy9pZiB0aGlzIGlzIGFjdGl2ZSwga2ljayBvdXQgb2YgZnVuY3Rpb24uXG4gICAgICAgICAgICAgIHZhciBpZHggPSAkKHRoaXMpLmRhdGEoJ3NsaWRlJyksXG4gICAgICAgICAgICAgICAgICBsdHIgPSBpZHggPiBfdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpLmRhdGEoJ3NsaWRlJyksXG4gICAgICAgICAgICAgICAgICAkc2xpZGUgPSBfdGhpcy4kc2xpZGVzLmVxKGlkeCk7XG5cbiAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUobHRyLCAkc2xpZGUsIGlkeCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFjY2Vzc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuJHdyYXBwZXIuYWRkKHRoaXMuJGJ1bGxldHMpLm9uKCdrZXlkb3duLnpmLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT3JiaXQnLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgLy8gaWYgYnVsbGV0IGlzIGZvY3VzZWQsIG1ha2Ugc3VyZSBmb2N1cyBtb3Zlc1xuICAgICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKF90aGlzLiRidWxsZXRzKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kYnVsbGV0cy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZXNldHMgT3JiaXQgc28gaXQgY2FuIGJlIHJlaW5pdGlhbGl6ZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3Jlc2V0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVzZXQoKSB7XG4gICAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBubyBzbGlkZXMgKGZpcnN0IHJ1bilcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLiRzbGlkZXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYub3JiaXQnKS5maW5kKCcqJykub2ZmKCcuemYub3JiaXQnKTtcblxuICAgICAgICAgIC8vIFJlc3RhcnQgdGltZXIgaWYgYXV0b1BsYXkgaXMgZW5hYmxlZFxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlc2V0IGFsbCBzbGlkZGVzXG4gICAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAkKGVsKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWFjdGl2ZSBpcy1pbicpLnJlbW92ZUF0dHIoJ2FyaWEtbGl2ZScpLmhpZGUoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNob3cgdGhlIGZpcnN0IHNsaWRlXG4gICAgICAgICAgdGhpcy4kc2xpZGVzLmZpcnN0KCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLnNob3coKTtcblxuICAgICAgICAgIC8vIFRyaWdnZXJzIHdoZW4gdGhlIHNsaWRlIGhhcyBmaW5pc2hlZCBhbmltYXRpbmdcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3NsaWRlY2hhbmdlLnpmLm9yYml0JywgW3RoaXMuJHNsaWRlcy5maXJzdCgpXSk7XG5cbiAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgYnVsbGV0IGlmIGJ1bGxldHMgYXJlIHByZXNlbnRcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1bGxldHMoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IHNsaWRlIHRvIGEgbmV3IG9uZS5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNMVFIgLSBmbGFnIGlmIHRoZSBzbGlkZSBzaG91bGQgbW92ZSBsZWZ0IHRvIHJpZ2h0LlxuICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gY2hvc2VuU2xpZGUgLSB0aGUgalF1ZXJ5IGVsZW1lbnQgb2YgdGhlIHNsaWRlIHRvIHNob3cgbmV4dCwgaWYgb25lIGlzIHNlbGVjdGVkLlxuICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gdGhlIGluZGV4IG9mIHRoZSBuZXcgc2xpZGUgaW4gaXRzIGNvbGxlY3Rpb24sIGlmIG9uZSBjaG9zZW4uXG4gICAgICAqIEBmaXJlcyBPcmJpdCNzbGlkZWNoYW5nZVxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NoYW5nZVNsaWRlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGFuZ2VTbGlkZShpc0xUUiwgY2hvc2VuU2xpZGUsIGlkeCkge1xuICAgICAgICBpZiAoIXRoaXMuJHNsaWRlcykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAvLyBEb24ndCBmcmVhayBvdXQgaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBjbGVhbnVwXG4gICAgICAgIHZhciAkY3VyU2xpZGUgPSB0aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZXEoMCk7XG5cbiAgICAgICAgaWYgKC9tdWkvZy50ZXN0KCRjdXJTbGlkZVswXS5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IC8vaWYgdGhlIHNsaWRlIGlzIGN1cnJlbnRseSBhbmltYXRpbmcsIGtpY2sgb3V0IG9mIHRoZSBmdW5jdGlvblxuXG4gICAgICAgIHZhciAkZmlyc3RTbGlkZSA9IHRoaXMuJHNsaWRlcy5maXJzdCgpLFxuICAgICAgICAgICAgJGxhc3RTbGlkZSA9IHRoaXMuJHNsaWRlcy5sYXN0KCksXG4gICAgICAgICAgICBkaXJJbiA9IGlzTFRSID8gJ1JpZ2h0JyA6ICdMZWZ0JyxcbiAgICAgICAgICAgIGRpck91dCA9IGlzTFRSID8gJ0xlZnQnIDogJ1JpZ2h0JyxcbiAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICRuZXdTbGlkZTtcblxuICAgICAgICBpZiAoIWNob3NlblNsaWRlKSB7XG4gICAgICAgICAgLy9tb3N0IG9mIHRoZSB0aW1lLCB0aGlzIHdpbGwgYmUgYXV0byBwbGF5ZWQgb3IgY2xpY2tlZCBmcm9tIHRoZSBuYXZCdXR0b25zLlxuICAgICAgICAgICRuZXdTbGlkZSA9IGlzTFRSID8gLy9pZiB3cmFwcGluZyBlbmFibGVkLCBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSBgbmV4dGAgb3IgYHByZXZgIHNpYmxpbmcsIGlmIG5vdCwgc2VsZWN0IHRoZSBmaXJzdCBvciBsYXN0IHNsaWRlIHRvIGZpbGwgaW4uIGlmIHdyYXBwaW5nIG5vdCBlbmFibGVkLCBhdHRlbXB0IHRvIHNlbGVjdCBgbmV4dGAgb3IgYHByZXZgLCBpZiB0aGVyZSdzIG5vdGhpbmcgdGhlcmUsIHRoZSBmdW5jdGlvbiB3aWxsIGtpY2sgb3V0IG9uIG5leHQgc3RlcC4gQ1JBWlkgTkVTVEVEIFRFUk5BUklFUyEhISEhXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmluZmluaXRlV3JhcCA/ICRjdXJTbGlkZS5uZXh0KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKS5sZW5ndGggPyAkY3VyU2xpZGUubmV4dCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykgOiAkZmlyc3RTbGlkZSA6ICRjdXJTbGlkZS5uZXh0KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKSA6IC8vcGljayBuZXh0IHNsaWRlIGlmIG1vdmluZyBsZWZ0IHRvIHJpZ2h0XG4gICAgICAgICAgdGhpcy5vcHRpb25zLmluZmluaXRlV3JhcCA/ICRjdXJTbGlkZS5wcmV2KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKS5sZW5ndGggPyAkY3VyU2xpZGUucHJldignLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykgOiAkbGFzdFNsaWRlIDogJGN1clNsaWRlLnByZXYoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpOyAvL3BpY2sgcHJldiBzbGlkZSBpZiBtb3ZpbmcgcmlnaHQgdG8gbGVmdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRuZXdTbGlkZSA9IGNob3NlblNsaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRuZXdTbGlkZS5sZW5ndGgpIHtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAqIFRyaWdnZXJzIGJlZm9yZSB0aGUgbmV4dCBzbGlkZSBzdGFydHMgYW5pbWF0aW5nIGluIGFuZCBvbmx5IGlmIGEgbmV4dCBzbGlkZSBoYXMgYmVlbiBmb3VuZC5cbiAgICAgICAgICAqIEBldmVudCBPcmJpdCNiZWZvcmVzbGlkZWNoYW5nZVxuICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdiZWZvcmVzbGlkZWNoYW5nZS56Zi5vcmJpdCcsIFskY3VyU2xpZGUsICRuZXdTbGlkZV0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgICBpZHggPSBpZHggfHwgdGhpcy4kc2xpZGVzLmluZGV4KCRuZXdTbGlkZSk7IC8vZ3JhYiBpbmRleCB0byB1cGRhdGUgYnVsbGV0c1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQnVsbGV0cyhpZHgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlTVVJICYmICF0aGlzLiRlbGVtZW50LmlzKCc6aGlkZGVuJykpIHtcbiAgICAgICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVJbigkbmV3U2xpZGUuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLmNzcyh7ICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsICd0b3AnOiAwIH0pLCB0aGlzLm9wdGlvbnNbJ2FuaW1JbkZyb20nICsgZGlySW5dLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICRuZXdTbGlkZS5jc3MoeyAncG9zaXRpb24nOiAncmVsYXRpdmUnLCAnZGlzcGxheSc6ICdibG9jaycgfSkuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJGN1clNsaWRlLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKSwgdGhpcy5vcHRpb25zWydhbmltT3V0VG8nICsgZGlyT3V0XSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkY3VyU2xpZGUucmVtb3ZlQXR0cignYXJpYS1saXZlJyk7XG4gICAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmF1dG9QbGF5ICYmICFfdGhpcy50aW1lci5pc1BhdXNlZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRpbWVyLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvL2RvIHN0dWZmP1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRjdXJTbGlkZS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWluJykucmVtb3ZlQXR0cignYXJpYS1saXZlJykuaGlkZSgpO1xuICAgICAgICAgICAgJG5ld1NsaWRlLmFkZENsYXNzKCdpcy1hY3RpdmUgaXMtaW4nKS5hdHRyKCdhcmlhLWxpdmUnLCAncG9saXRlJykuc2hvdygpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhdGhpcy50aW1lci5pc1BhdXNlZCkge1xuICAgICAgICAgICAgICB0aGlzLnRpbWVyLnJlc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgKiBUcmlnZ2VycyB3aGVuIHRoZSBzbGlkZSBoYXMgZmluaXNoZWQgYW5pbWF0aW5nIGluLlxuICAgICAgICAgICogQGV2ZW50IE9yYml0I3NsaWRlY2hhbmdlXG4gICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3NsaWRlY2hhbmdlLnpmLm9yYml0JywgWyRuZXdTbGlkZV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBVcGRhdGVzIHRoZSBhY3RpdmUgc3RhdGUgb2YgdGhlIGJ1bGxldHMsIGlmIGRpc3BsYXllZC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgc2xpZGUuXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3VwZGF0ZUJ1bGxldHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF91cGRhdGVCdWxsZXRzKGlkeCkge1xuICAgICAgICB2YXIgJG9sZEJ1bGxldCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuYm94T2ZCdWxsZXRzKS5maW5kKCcuaXMtYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpLmJsdXIoKSxcbiAgICAgICAgICAgIHNwYW4gPSAkb2xkQnVsbGV0LmZpbmQoJ3NwYW46bGFzdCcpLmRldGFjaCgpLFxuICAgICAgICAgICAgJG5ld0J1bGxldCA9IHRoaXMuJGJ1bGxldHMuZXEoaWR4KS5hZGRDbGFzcygnaXMtYWN0aXZlJykuYXBwZW5kKHNwYW4pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogRGVzdHJveXMgdGhlIGNhcm91c2VsIGFuZCBoaWRlcyB0aGUgZWxlbWVudC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi5vcmJpdCcpLmZpbmQoJyonKS5vZmYoJy56Zi5vcmJpdCcpLmVuZCgpLmhpZGUoKTtcbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBPcmJpdDtcbiAgfSgpO1xuXG4gIE9yYml0LmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICogVGVsbHMgdGhlIEpTIHRvIGxvb2sgZm9yIGFuZCBsb2FkQnVsbGV0cy5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIGJ1bGxldHM6IHRydWUsXG4gICAgLyoqXG4gICAgKiBUZWxscyB0aGUgSlMgdG8gYXBwbHkgZXZlbnQgbGlzdGVuZXJzIHRvIG5hdiBidXR0b25zXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBuYXZCdXR0b25zOiB0cnVlLFxuICAgIC8qKlxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnc2xpZGUtaW4tcmlnaHQnXG4gICAgKi9cbiAgICBhbmltSW5Gcm9tUmlnaHQ6ICdzbGlkZS1pbi1yaWdodCcsXG4gICAgLyoqXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdzbGlkZS1vdXQtcmlnaHQnXG4gICAgKi9cbiAgICBhbmltT3V0VG9SaWdodDogJ3NsaWRlLW91dC1yaWdodCcsXG4gICAgLyoqXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdzbGlkZS1pbi1sZWZ0J1xuICAgICpcbiAgICAqL1xuICAgIGFuaW1JbkZyb21MZWZ0OiAnc2xpZGUtaW4tbGVmdCcsXG4gICAgLyoqXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdzbGlkZS1vdXQtbGVmdCdcbiAgICAqL1xuICAgIGFuaW1PdXRUb0xlZnQ6ICdzbGlkZS1vdXQtbGVmdCcsXG4gICAgLyoqXG4gICAgKiBBbGxvd3MgT3JiaXQgdG8gYXV0b21hdGljYWxseSBhbmltYXRlIG9uIHBhZ2UgbG9hZC5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIGF1dG9QbGF5OiB0cnVlLFxuICAgIC8qKlxuICAgICogQW1vdW50IG9mIHRpbWUsIGluIG1zLCBiZXR3ZWVuIHNsaWRlIHRyYW5zaXRpb25zXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAqIEBkZWZhdWx0IDUwMDBcbiAgICAqL1xuICAgIHRpbWVyRGVsYXk6IDUwMDAsXG4gICAgLyoqXG4gICAgKiBBbGxvd3MgT3JiaXQgdG8gaW5maW5pdGVseSBsb29wIHRocm91Z2ggdGhlIHNsaWRlc1xuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgaW5maW5pdGVXcmFwOiB0cnVlLFxuICAgIC8qKlxuICAgICogQWxsb3dzIHRoZSBPcmJpdCBzbGlkZXMgdG8gYmluZCB0byBzd2lwZSBldmVudHMgZm9yIG1vYmlsZSwgcmVxdWlyZXMgYW4gYWRkaXRpb25hbCB1dGlsIGxpYnJhcnlcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIHN3aXBlOiB0cnVlLFxuICAgIC8qKlxuICAgICogQWxsb3dzIHRoZSB0aW1pbmcgZnVuY3Rpb24gdG8gcGF1c2UgYW5pbWF0aW9uIG9uIGhvdmVyLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgcGF1c2VPbkhvdmVyOiB0cnVlLFxuICAgIC8qKlxuICAgICogQWxsb3dzIE9yYml0IHRvIGJpbmQga2V5Ym9hcmQgZXZlbnRzIHRvIHRoZSBzbGlkZXIsIHRvIGFuaW1hdGUgZnJhbWVzIHdpdGggYXJyb3cga2V5c1xuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgYWNjZXNzaWJsZTogdHJ1ZSxcbiAgICAvKipcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRhaW5lciBvZiBPcmJpdFxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnb3JiaXQtY29udGFpbmVyJ1xuICAgICovXG4gICAgY29udGFpbmVyQ2xhc3M6ICdvcmJpdC1jb250YWluZXInLFxuICAgIC8qKlxuICAgICogQ2xhc3MgYXBwbGllZCB0byBpbmRpdmlkdWFsIHNsaWRlcy5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ29yYml0LXNsaWRlJ1xuICAgICovXG4gICAgc2xpZGVDbGFzczogJ29yYml0LXNsaWRlJyxcbiAgICAvKipcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGJ1bGxldCBjb250YWluZXIuIFlvdSdyZSB3ZWxjb21lLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnb3JiaXQtYnVsbGV0cydcbiAgICAqL1xuICAgIGJveE9mQnVsbGV0czogJ29yYml0LWJ1bGxldHMnLFxuICAgIC8qKlxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYG5leHRgIG5hdmlnYXRpb24gYnV0dG9uLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnb3JiaXQtbmV4dCdcbiAgICAqL1xuICAgIG5leHRDbGFzczogJ29yYml0LW5leHQnLFxuICAgIC8qKlxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYHByZXZpb3VzYCBuYXZpZ2F0aW9uIGJ1dHRvbi5cbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ29yYml0LXByZXZpb3VzJ1xuICAgICovXG4gICAgcHJldkNsYXNzOiAnb3JiaXQtcHJldmlvdXMnLFxuICAgIC8qKlxuICAgICogQm9vbGVhbiB0byBmbGFnIHRoZSBqcyB0byB1c2UgbW90aW9uIHVpIGNsYXNzZXMgb3Igbm90LiBEZWZhdWx0IHRvIHRydWUgZm9yIGJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgdXNlTVVJOiB0cnVlXG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oT3JiaXQsICdPcmJpdCcpO1xufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIFJlc3BvbnNpdmVNZW51IG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gICAqL1xuXG4gIHZhciBSZXNwb25zaXZlTWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgcmVzcG9uc2l2ZSBtZW51LlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBmaXJlcyBSZXNwb25zaXZlTWVudSNpbml0XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFJlc3BvbnNpdmVNZW51KGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZXNwb25zaXZlTWVudSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgdGhpcy5ydWxlcyA9IHRoaXMuJGVsZW1lbnQuZGF0YSgncmVzcG9uc2l2ZS1tZW51Jyk7XG4gICAgICB0aGlzLmN1cnJlbnRNcSA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBudWxsO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZU1lbnUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgTWVudSBieSBwYXJzaW5nIHRoZSBjbGFzc2VzIGZyb20gdGhlICdkYXRhLVJlc3BvbnNpdmVNZW51JyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKFJlc3BvbnNpdmVNZW51LCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICAvLyBUaGUgZmlyc3QgdGltZSBhbiBJbnRlcmNoYW5nZSBwbHVnaW4gaXMgaW5pdGlhbGl6ZWQsIHRoaXMucnVsZXMgaXMgY29udmVydGVkIGZyb20gYSBzdHJpbmcgb2YgXCJjbGFzc2VzXCIgdG8gYW4gb2JqZWN0IG9mIHJ1bGVzXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB2YXIgcnVsZXNUcmVlID0ge307XG5cbiAgICAgICAgICAvLyBQYXJzZSBydWxlcyBmcm9tIFwiY2xhc3Nlc1wiIHB1bGxlZCBmcm9tIGRhdGEgYXR0cmlidXRlXG4gICAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGV2ZXJ5IHJ1bGUgZm91bmRcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgICAgICB2YXIgcnVsZVNpemUgPSBydWxlLmxlbmd0aCA+IDEgPyBydWxlWzBdIDogJ3NtYWxsJztcbiAgICAgICAgICAgIHZhciBydWxlUGx1Z2luID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVsxXSA6IHJ1bGVbMF07XG5cbiAgICAgICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBydWxlc1RyZWVbcnVsZVNpemVdID0gTWVudVBsdWdpbnNbcnVsZVBsdWdpbl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5ydWxlcyA9IHJ1bGVzVHJlZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICAgICAgdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgZGF0YS1tdXRhdGUgc2luY2UgY2hpbGRyZW4gbWF5IG5lZWQgaXQuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnLCB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJykgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmVzcG9uc2l2ZS1tZW51JykpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIE1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19ldmVudHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9ldmVudHMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5SZXNwb25zaXZlTWVudScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgICAvLyB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgc2NyZWVuIHdpZHRoIGFnYWluc3QgYXZhaWxhYmxlIG1lZGlhIHF1ZXJpZXMuIElmIHRoZSBtZWRpYSBxdWVyeSBoYXMgY2hhbmdlZCwgYW5kIHRoZSBwbHVnaW4gbmVlZGVkIGhhcyBjaGFuZ2VkLCB0aGUgcGx1Z2lucyB3aWxsIHN3YXAgb3V0LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfY2hlY2tNZWRpYVF1ZXJpZXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9jaGVja01lZGlhUXVlcmllcygpIHtcbiAgICAgICAgdmFyIG1hdGNoZWRNcSxcbiAgICAgICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSBhbmQgZmluZCB0aGUgbGFzdCBtYXRjaGluZyBydWxlXG4gICAgICAgICQuZWFjaCh0aGlzLnJ1bGVzLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KGtleSkpIHtcbiAgICAgICAgICAgIG1hdGNoZWRNcSA9IGtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vIG1hdGNoPyBObyBkaWNlXG4gICAgICAgIGlmICghbWF0Y2hlZE1xKSByZXR1cm47XG5cbiAgICAgICAgLy8gUGx1Z2luIGFscmVhZHkgaW5pdGlhbGl6ZWQ/IFdlIGdvb2RcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbiBpbnN0YW5jZW9mIHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4pIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgZXhpc3RpbmcgcGx1Z2luLXNwZWNpZmljIENTUyBjbGFzc2VzXG4gICAgICAgICQuZWFjaChNZW51UGx1Z2lucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh2YWx1ZS5jc3NDbGFzcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5jc3NDbGFzcyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBuZXcgcGx1Z2luXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG5ldyB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKHRoaXMuJGVsZW1lbnQsIHt9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyB0aGUgaW5zdGFuY2Ugb2YgdGhlIGN1cnJlbnQgcGx1Z2luIG9uIHRoaXMgZWxlbWVudCwgYXMgd2VsbCBhcyB0aGUgd2luZG93IHJlc2l6ZSBoYW5kbGVyIHRoYXQgc3dpdGNoZXMgdGhlIHBsdWdpbnMgb3V0LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgICAgICQod2luZG93KS5vZmYoJy56Zi5SZXNwb25zaXZlTWVudScpO1xuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFJlc3BvbnNpdmVNZW51O1xuICB9KCk7XG5cbiAgUmVzcG9uc2l2ZU1lbnUuZGVmYXVsdHMgPSB7fTtcblxuICAvLyBUaGUgcGx1Z2luIG1hdGNoZXMgdGhlIHBsdWdpbiBjbGFzc2VzIHdpdGggdGhlc2UgcGx1Z2luIGluc3RhbmNlcy5cbiAgdmFyIE1lbnVQbHVnaW5zID0ge1xuICAgIGRyb3Bkb3duOiB7XG4gICAgICBjc3NDbGFzczogJ2Ryb3Bkb3duJyxcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJvcGRvd24tbWVudSddIHx8IG51bGxcbiAgICB9LFxuICAgIGRyaWxsZG93bjoge1xuICAgICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydkcmlsbGRvd24nXSB8fCBudWxsXG4gICAgfSxcbiAgICBhY2NvcmRpb246IHtcbiAgICAgIGNzc0NsYXNzOiAnYWNjb3JkaW9uLW1lbnUnLFxuICAgICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydhY2NvcmRpb24tbWVudSddIHx8IG51bGxcbiAgICB9XG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZU1lbnUsICdSZXNwb25zaXZlTWVudScpO1xufShqUXVlcnkpOyIsIihmdW5jdGlvbigkKSB7XG4gICQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcbiAgLy8gUHV0IGluIGEgcGF0dGVybiB0aGF0IHdpbGwgbGltaXQgd2hhdCBwZW9wbGUgY2FuIHB1dCBpbnRvIGZpZWxkcyBmb3IgcGhvbmUgbnVtYmVycy5cbiAgRm91bmRhdGlvbi5BYmlkZS5kZWZhdWx0cy5wYXR0ZXJuc1snZGFzaGVzX29ubHknXSA9IC9eWzAtOS1dKiQvO1xuICBcbiAgJChcIiNqcy1mb3JtXCIpLnN1Ym1pdChmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkZm9ybSA9ICQodGhpcyk7XG4gICAgJGZvcm0ub24oXCJmb3JtdmFsaWQuemYuYWJpZGVcIiwgZnVuY3Rpb24oZXYsIGZybSkge1xuICAgICAgJC5wb3N0KCRmb3JtLmF0dHIoXCJhY3Rpb25cIiksICRmb3JtLnNlcmlhbGl6ZSgpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBIaWRlIHRoZSBmb3JtIGFuZCBzaG93IHRoZSBjb25maXJtYXRpb24gbWVzYWdlLlxuICAgICAgICAkZm9ybS5oaWRlKCk7XG4gICAgICAgICQoXCIjanMtY29uZmlybWF0aW9uXCIpXG4gICAgICAgICAgLnNob3coKVxuICAgICAgICAgIC5jc3MoXCJoZWlnaHRcIiwgJGZvcm0uaGVpZ2h0KCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHZhciB2YWxpZGF0ZSA9IGZ1bmN0aW9uKCRmb3JtKSB7fTtcblxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAkKFwiI3Jvb21zXCIpLnNsaWNrKHtcbiAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgc2xpZGVzVG9TY3JvbGw6IDQsXG4gICAgICBuZXh0QXJyb3c6XG4gICAgICAgICc8YnV0dG9uIGNsYXNzPVwic2xpY2stbmV4dC1hcnJvd1wiIGFyaWEtbGFiZWw9XCJOZXh0IHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtcmlnaHRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgICAgcHJldkFycm93OlxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLXByZXZpb3VzLWFycm93XCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzIHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtbGVmdFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBicmVha3BvaW50OiAxMDI0LFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMyxcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgZG90czogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBicmVha3BvaW50OiA2MDAsXG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBZb3UgY2FuIHVuc2xpY2sgYXQgYSBnaXZlbiBicmVha3BvaW50IG5vdyBieSBhZGRpbmc6XG4gICAgICAgIC8vIHNldHRpbmdzOiBcInVuc2xpY2tcIlxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICBdXG4gICAgfSk7XG4gIH0pO1xuICAvKlxuICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgJChcIiNhcnJpdmVEdFwiKS5kYXRlcGlja2VyKCk7XG4gICAgICQoXCIjZGVwYXJ0RHRcIikuZGF0ZXBpY2tlcigpO1xuICAgICB9KTtcblxuICAgICBmdW5jdGlvbiBzdWJtaXRmb3JtKCkge1xuICAgICBpZiAoISQoXCIjYXJyaXZlRHRcIikudmFsKCkgfHwgISQoXCIjZGVwYXJ0RHRcIikudmFsKCkpIHtcbiAgICAgd2luZG93LmFsZXJ0KFwiUGxlYXNlIGVudGVyIGEgU3RhcnQgYW5kIEVuZCBEYXRlIVwiKTtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9XG4gICAgICQoJyNyZXNibG9jaycpLnN1Ym1pdCgpO1xuICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgKi9cbiAgLy8gYXJyaXZlRHRcbiAgLy8gZGVwYXJ0RHRcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgUGlrYWRheSBkYXRlcGlja2Vycy5cbiAgICogQHR5cGUgeyp9XG4gICAqL1xuICAvKlxuICAgIHZhciBjaGVja2luRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycml2ZUR0XCIpLFxuICAgICAgICBjaGVja291dEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXBhcnREdFwiKSxcbiAgICAgICAgY2hlY2tpblBpa2EgPSBwaWthZGF5UmVzcG9uc2l2ZShjaGVja2luRWwsIHtcbiAgICAgICAgICAgIGZvcm1hdDogJ00vREQvWVlZWScsXG4gICAgICAgICAgICBwaWthZGF5T3B0aW9uczoge1xuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBjaGVja291dFBpa2EgPSBwaWthZGF5UmVzcG9uc2l2ZShjaGVja291dEVsLCB7XG4gICAgICAgICAgICBmb3JtYXQ6ICdNL0REL1lZWVknLFxuICAgICAgICAgICAgcGlrYWRheU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiovXG4gIC8vIENoZWNrIGNoZWNrb3V0ZGF0ZVxuICAvKlxuICAgICQoY2hlY2tpbkVsKS5vbignY2hhbmdlLWRhdGUnLCBmdW5jdGlvbiAoZSwgZGF0ZSkge1xuICAgICAgICAvLyBJZiBjaGVjayBvdXQgZGF0ZSBpcyBiZWZvcmUgY2hlY2sgaW4gZGF0ZVxuICAgICAgICBpZiAoZGF0ZS5kYXRlLmlzQWZ0ZXIoY2hlY2tvdXRQaWthLmRhdGUpKSB7XG4gICAgICAgICAgICBjaGVja291dFBpa2Euc2V0RGF0ZShkYXRlLmRhdGUuYWRkKDEsICdkYXknKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIG1pbiBkYXRlIGZvciB0aGUgY2hlY2tvdXQgaW5wdXQuXG4gICAgICAgIGNoZWNrb3V0UGlrYS5waWthZGF5LnNldE1pbkRhdGUoY2hlY2tpblBpa2EuZGF0ZS50b0RhdGUoKSk7XG4gICAgfSk7XG5cbiAgICAkKCcuYm9va2luZy1hY2NvcmRpb24tdGl0bGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGl0bGUgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgYmFyID0gJCgnLmJvb2tpbmctYmFyJyk7XG4gICAgICAgIGJhci5zbGlkZVRvZ2dsZSgnZmFzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJhci50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgaWYgKGJhci5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQ2xvc2UnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQm9vayBOb3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiovXG4gICQoXCIuaGVyby1zbGlja1wiKS5zbGljayh7XG4gICAgbmV4dEFycm93OlxuICAgICAgJzxidXR0b24gY2xhc3M9XCJzbGljay1uZXh0LWFycm93XCIgYXJpYS1sYWJlbD1cIk5leHQgcm9vbXNcIj48c3ZnIGNsYXNzPVwiaWNvblwiPjx1c2UgeGxpbms6aHJlZj1cIiNhbmdsZS1yaWdodFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgcHJldkFycm93OlxuICAgICAgJzxidXR0b24gY2xhc3M9XCJzbGljay1wcmV2aW91cy1hcnJvd1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91cyByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nXG4gIH0pO1xufSkoalF1ZXJ5KTtcbiJdfQ==
