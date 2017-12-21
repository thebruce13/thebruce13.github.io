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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwic2xpY2suanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm1vdGlvbi5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmRyb3Bkb3duTWVudS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJhIiwiYiIsImMiLCJkb2N1bWVudCIsImxhenlTaXplcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3aW5kb3ciLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiZCIsImRvY3VtZW50RWxlbWVudCIsImUiLCJEYXRlIiwiZiIsIkhUTUxQaWN0dXJlRWxlbWVudCIsImciLCJoIiwiaSIsImoiLCJzZXRUaW1lb3V0IiwiayIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImwiLCJyZXF1ZXN0SWRsZUNhbGxiYWNrIiwibSIsIm4iLCJvIiwicCIsIkFycmF5IiwicHJvdG90eXBlIiwiZm9yRWFjaCIsInEiLCJSZWdFeHAiLCJ0ZXN0IiwiciIsInNldEF0dHJpYnV0ZSIsInRyaW0iLCJzIiwicmVwbGFjZSIsInQiLCJ1IiwiY3JlYXRlRXZlbnQiLCJpbml0Q3VzdG9tRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwidiIsInBpY3R1cmVmaWxsIiwicGYiLCJyZWV2YWx1YXRlIiwiZWxlbWVudHMiLCJzcmMiLCJ3IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsIngiLCJvZmZzZXRXaWR0aCIsIm1pblNpemUiLCJfbGF6eXNpemVzV2lkdGgiLCJwYXJlbnROb2RlIiwieSIsImxlbmd0aCIsInNoaWZ0IiwiYXBwbHkiLCJhcmd1bWVudHMiLCJwdXNoIiwiaGlkZGVuIiwiX2xzRmx1c2giLCJ6IiwiQSIsIm5vdyIsInRpbWVvdXQiLCJCIiwiQyIsIkUiLCJGIiwiRyIsIkgiLCJJIiwiSiIsIksiLCJMIiwiTSIsIk4iLCJPIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiUCIsIlEiLCJSIiwiUyIsIlQiLCJ0YXJnZXQiLCJVIiwiYm9keSIsIm9mZnNldFBhcmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsIlYiLCJsb2FkTW9kZSIsImV4cGFuZCIsImNsaWVudEhlaWdodCIsImNsaWVudFdpZHRoIiwiZXhwRmFjdG9yIiwiX2xhenlSYWNlIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYmEiLCJwcmVsb2FkQWZ0ZXJMb2FkIiwic2l6ZXNBdHRyIiwiVyIsIlgiLCJsb2FkZWRDbGFzcyIsImxvYWRpbmdDbGFzcyIsIloiLCJZIiwiJCIsImNvbnRlbnRXaW5kb3ciLCJsb2NhdGlvbiIsIl8iLCJzcmNzZXRBdHRyIiwiY3VzdG9tTWVkaWEiLCJpbnNlcnRCZWZvcmUiLCJjbG9uZU5vZGUiLCJyZW1vdmVDaGlsZCIsImFhIiwiZGVmYXVsdFByZXZlbnRlZCIsImF1dG9zaXplc0NsYXNzIiwic3JjQXR0ciIsIm5vZGVOYW1lIiwiZmlyZXNMb2FkIiwiY2xlYXJUaW1lb3V0IiwiY2FsbCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGF6eUNsYXNzIiwiY29tcGxldGUiLCJuYXR1cmFsV2lkdGgiLCJzcmNzZXQiLCJlcnJvckNsYXNzIiwiZGV0YWlsIiwiRCIsInVwZGF0ZUVsZW0iLCJjYSIsInByZWxvYWRDbGFzcyIsImhGYWMiLCJNdXRhdGlvbk9ic2VydmVyIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJhdHRyaWJ1dGVzIiwic2V0SW50ZXJ2YWwiLCJyZWFkeVN0YXRlIiwiY2hlY2tFbGVtcyIsInVudmVpbCIsImRhdGFBdHRyIiwid2lkdGgiLCJpbml0IiwibGF6eVNpemVzQ29uZmlnIiwibGF6eXNpemVzQ29uZmlnIiwiY2ZnIiwiYXV0b1NpemVyIiwibG9hZGVyIiwidVAiLCJhQyIsInJDIiwiaEMiLCJmaXJlIiwiZ1ciLCJyQUYiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwicmVxdWlyZSIsImpRdWVyeSIsIlNsaWNrIiwiaW5zdGFuY2VVaWQiLCJlbGVtZW50Iiwic2V0dGluZ3MiLCJkYXRhU2V0dGluZ3MiLCJkZWZhdWx0cyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsInRleHQiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWFzaW5nIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJpbmZpbml0ZSIsImluaXRpYWxTbGlkZSIsImxhenlMb2FkIiwibW9iaWxlRmlyc3QiLCJwYXVzZU9uSG92ZXIiLCJwYXVzZU9uRm9jdXMiLCJwYXVzZU9uRG90c0hvdmVyIiwicmVzcG9uZFRvIiwicmVzcG9uc2l2ZSIsInJvd3MiLCJydGwiLCJzbGlkZSIsInNsaWRlc1BlclJvdyIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwic3BlZWQiLCJzd2lwZSIsInN3aXBlVG9TbGlkZSIsInRvdWNoTW92ZSIsInRvdWNoVGhyZXNob2xkIiwidXNlQ1NTIiwidXNlVHJhbnNmb3JtIiwidmFyaWFibGVXaWR0aCIsInZlcnRpY2FsIiwidmVydGljYWxTd2lwaW5nIiwid2FpdEZvckFuaW1hdGUiLCJ6SW5kZXgiLCJpbml0aWFscyIsImFuaW1hdGluZyIsImRyYWdnaW5nIiwiYXV0b1BsYXlUaW1lciIsImN1cnJlbnREaXJlY3Rpb24iLCJjdXJyZW50TGVmdCIsImN1cnJlbnRTbGlkZSIsImRpcmVjdGlvbiIsIiRkb3RzIiwibGlzdFdpZHRoIiwibGlzdEhlaWdodCIsImxvYWRJbmRleCIsIiRuZXh0QXJyb3ciLCIkcHJldkFycm93Iiwic2xpZGVDb3VudCIsInNsaWRlV2lkdGgiLCIkc2xpZGVUcmFjayIsIiRzbGlkZXMiLCJzbGlkaW5nIiwic2xpZGVPZmZzZXQiLCJzd2lwZUxlZnQiLCIkbGlzdCIsInRvdWNoT2JqZWN0IiwidHJhbnNmb3Jtc0VuYWJsZWQiLCJ1bnNsaWNrZWQiLCJleHRlbmQiLCJhY3RpdmVCcmVha3BvaW50IiwiYW5pbVR5cGUiLCJhbmltUHJvcCIsImJyZWFrcG9pbnRzIiwiYnJlYWtwb2ludFNldHRpbmdzIiwiY3NzVHJhbnNpdGlvbnMiLCJmb2N1c3NlZCIsImludGVycnVwdGVkIiwicGF1c2VkIiwicG9zaXRpb25Qcm9wIiwicm93Q291bnQiLCJzaG91bGRDbGljayIsIiRzbGlkZXIiLCIkc2xpZGVzQ2FjaGUiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNpdGlvblR5cGUiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwid2luZG93V2lkdGgiLCJ3aW5kb3dUaW1lciIsImRhdGEiLCJvcHRpb25zIiwib3JpZ2luYWxTZXR0aW5ncyIsIm1vekhpZGRlbiIsIndlYmtpdEhpZGRlbiIsImF1dG9QbGF5IiwicHJveHkiLCJhdXRvUGxheUNsZWFyIiwiYXV0b1BsYXlJdGVyYXRvciIsImNoYW5nZVNsaWRlIiwiY2xpY2tIYW5kbGVyIiwic2VsZWN0SGFuZGxlciIsInNldFBvc2l0aW9uIiwic3dpcGVIYW5kbGVyIiwiZHJhZ0hhbmRsZXIiLCJrZXlIYW5kbGVyIiwiaHRtbEV4cHIiLCJyZWdpc3RlckJyZWFrcG9pbnRzIiwiYWN0aXZhdGVBREEiLCJmaW5kIiwiYXR0ciIsImFkZFNsaWRlIiwic2xpY2tBZGQiLCJtYXJrdXAiLCJpbmRleCIsImFkZEJlZm9yZSIsInVubG9hZCIsImFwcGVuZFRvIiwiZXEiLCJpbnNlcnRBZnRlciIsInByZXBlbmRUbyIsImNoaWxkcmVuIiwiZGV0YWNoIiwiYXBwZW5kIiwiZWFjaCIsInJlaW5pdCIsImFuaW1hdGVIZWlnaHQiLCJ0YXJnZXRIZWlnaHQiLCJvdXRlckhlaWdodCIsImFuaW1hdGUiLCJoZWlnaHQiLCJhbmltYXRlU2xpZGUiLCJ0YXJnZXRMZWZ0IiwiY2FsbGJhY2siLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJkdXJhdGlvbiIsInN0ZXAiLCJNYXRoIiwiY2VpbCIsImNzcyIsImFwcGx5VHJhbnNpdGlvbiIsImRpc2FibGVUcmFuc2l0aW9uIiwiZ2V0TmF2VGFyZ2V0Iiwibm90Iiwic2xpY2siLCJzbGlkZUhhbmRsZXIiLCJ0cmFuc2l0aW9uIiwiY2xlYXJJbnRlcnZhbCIsInNsaWRlVG8iLCJidWlsZEFycm93cyIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJyZW1vdmVBdHRyIiwiYWRkIiwiYnVpbGREb3RzIiwiZG90IiwiZ2V0RG90Q291bnQiLCJmaXJzdCIsImJ1aWxkT3V0Iiwid3JhcEFsbCIsInBhcmVudCIsIndyYXAiLCJzZXR1cEluZmluaXRlIiwidXBkYXRlRG90cyIsInNldFNsaWRlQ2xhc3NlcyIsImJ1aWxkUm93cyIsIm5ld1NsaWRlcyIsIm51bU9mU2xpZGVzIiwib3JpZ2luYWxTbGlkZXMiLCJzbGlkZXNQZXJTZWN0aW9uIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJyb3ciLCJnZXQiLCJhcHBlbmRDaGlsZCIsImVtcHR5IiwiY2hlY2tSZXNwb25zaXZlIiwiaW5pdGlhbCIsImZvcmNlVXBkYXRlIiwiYnJlYWtwb2ludCIsInRhcmdldEJyZWFrcG9pbnQiLCJyZXNwb25kVG9XaWR0aCIsInRyaWdnZXJCcmVha3BvaW50Iiwic2xpZGVyV2lkdGgiLCJtaW4iLCJoYXNPd25Qcm9wZXJ0eSIsInVuc2xpY2siLCJyZWZyZXNoIiwidHJpZ2dlciIsImV2ZW50IiwiZG9udEFuaW1hdGUiLCIkdGFyZ2V0IiwiY3VycmVudFRhcmdldCIsImluZGV4T2Zmc2V0IiwidW5ldmVuT2Zmc2V0IiwiaXMiLCJwcmV2ZW50RGVmYXVsdCIsImNsb3Nlc3QiLCJtZXNzYWdlIiwiY2hlY2tOYXZpZ2FibGUiLCJuYXZpZ2FibGVzIiwicHJldk5hdmlnYWJsZSIsImdldE5hdmlnYWJsZUluZGV4ZXMiLCJjbGVhblVwRXZlbnRzIiwib2ZmIiwiaW50ZXJydXB0IiwidmlzaWJpbGl0eSIsImNsZWFuVXBTbGlkZUV2ZW50cyIsIm9yaWVudGF0aW9uQ2hhbmdlIiwicmVzaXplIiwiY2xlYW5VcFJvd3MiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJzdG9wUHJvcGFnYXRpb24iLCJkZXN0cm95IiwicmVtb3ZlIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZpbHRlciIsImZvY3VzSGFuZGxlciIsIm9uIiwiJHNmIiwiZ2V0Q3VycmVudCIsInNsaWNrQ3VycmVudFNsaWRlIiwiYnJlYWtQb2ludCIsImNvdW50ZXIiLCJwYWdlclF0eSIsImdldExlZnQiLCJ2ZXJ0aWNhbEhlaWdodCIsInZlcnRpY2FsT2Zmc2V0IiwidGFyZ2V0U2xpZGUiLCJmbG9vciIsIm9mZnNldExlZnQiLCJvdXRlcldpZHRoIiwiZ2V0T3B0aW9uIiwic2xpY2tHZXRPcHRpb24iLCJvcHRpb24iLCJpbmRleGVzIiwibWF4IiwiZ2V0U2xpY2siLCJnZXRTbGlkZUNvdW50Iiwic2xpZGVzVHJhdmVyc2VkIiwic3dpcGVkU2xpZGUiLCJjZW50ZXJPZmZzZXQiLCJhYnMiLCJnb1RvIiwic2xpY2tHb1RvIiwicGFyc2VJbnQiLCJjcmVhdGlvbiIsImhhc0NsYXNzIiwic2V0UHJvcHMiLCJzdGFydExvYWQiLCJsb2FkU2xpZGVyIiwiaW5pdGlhbGl6ZUV2ZW50cyIsInVwZGF0ZUFycm93cyIsImluaXRBREEiLCJlbmQiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwic2hvdyIsInRhZ05hbWUiLCJtYXRjaCIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2UiLCJpbWFnZVNvdXJjZSIsImltYWdlVG9Mb2FkIiwib25sb2FkIiwib25lcnJvciIsInNsaWNlIiwicHJvZ3Jlc3NpdmVMYXp5TG9hZCIsIm5leHQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwicHJldiIsInNsaWNrUHJldiIsInRyeUNvdW50IiwiJGltZ3NUb0xvYWQiLCJpbml0aWFsaXppbmciLCJsYXN0VmlzaWJsZUluZGV4IiwiY3VycmVudEJyZWFrcG9pbnQiLCJyZXNwb25zaXZlU2V0dGluZ3MiLCJ0eXBlIiwic3BsaWNlIiwic29ydCIsIndpbmRvd0RlbGF5IiwicmVtb3ZlU2xpZGUiLCJzbGlja1JlbW92ZSIsInJlbW92ZUJlZm9yZSIsInJlbW92ZUFsbCIsInNldENTUyIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wcyIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwib2Zmc2V0Iiwic2V0RmFkZSIsInNldEhlaWdodCIsInNldE9wdGlvbiIsInNsaWNrU2V0T3B0aW9uIiwiaXRlbSIsInZhbHVlIiwib3B0IiwidmFsIiwiYm9keVN0eWxlIiwic3R5bGUiLCJXZWJraXRUcmFuc2l0aW9uIiwidW5kZWZpbmVkIiwiTW96VHJhbnNpdGlvbiIsIm1zVHJhbnNpdGlvbiIsIk9UcmFuc2Zvcm0iLCJwZXJzcGVjdGl2ZVByb3BlcnR5Iiwid2Via2l0UGVyc3BlY3RpdmUiLCJNb3pUcmFuc2Zvcm0iLCJNb3pQZXJzcGVjdGl2ZSIsIndlYmtpdFRyYW5zZm9ybSIsIm1zVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYWxsU2xpZGVzIiwicmVtYWluZGVyIiwiaW5maW5pdGVDb3VudCIsImNsb25lIiwidG9nZ2xlIiwidGFyZ2V0RWxlbWVudCIsInBhcmVudHMiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJoaWRlIiwic3dpcGVEaXJlY3Rpb24iLCJ4RGlzdCIsInlEaXN0Iiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImluZGV4T2YiLCJmaW5nZXJDb3VudCIsIm9yaWdpbmFsRXZlbnQiLCJ0b3VjaGVzIiwic3dpcGVTdGFydCIsInN3aXBlTW92ZSIsImVkZ2VXYXNIaXQiLCJjdXJMZWZ0IiwicG9zaXRpb25PZmZzZXQiLCJwYWdlWCIsImNsaWVudFgiLCJwYWdlWSIsImNsaWVudFkiLCJzcXJ0IiwicG93IiwidW5maWx0ZXJTbGlkZXMiLCJzbGlja1VuZmlsdGVyIiwiZnJvbUJyZWFrcG9pbnQiLCJmbiIsImFyZ3MiLCJyZXQiLCJGT1VOREFUSU9OX1ZFUlNJT04iLCJGb3VuZGF0aW9uIiwidmVyc2lvbiIsIl9wbHVnaW5zIiwiX3V1aWRzIiwicGx1Z2luIiwibmFtZSIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ0b0xvd2VyQ2FzZSIsInV1aWQiLCJHZXRZb0RpZ2l0cyIsIiRlbGVtZW50IiwidW5yZWdpc3RlclBsdWdpbiIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJfaW5pdCIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvdW5kYXRpb24iLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibmFtZXNwYWNlIiwicmFuZG9tIiwidG9TdHJpbmciLCJyZWZsb3ciLCJlbGVtIiwiJGVsZW0iLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwibWFwIiwiZWwiLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJoZWFkIiwiTWVkaWFRdWVyeSIsInBsdWdDbGFzcyIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwiZ2V0VGltZSIsInZlbmRvcnMiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwibGFzdFRpbWUiLCJuZXh0VGltZSIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJCb3giLCJJbU5vdFRvdWNoaW5nWW91IiwiR2V0RGltZW5zaW9ucyIsIkdldE9mZnNldHMiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwicGFyRGltcyIsIndpbmRvd0RpbXMiLCJhbGxEaXJzIiwiRXJyb3IiLCJyZWN0IiwicGFyUmVjdCIsIndpblJlY3QiLCJ3aW5ZIiwicGFnZVlPZmZzZXQiLCJ3aW5YIiwicGFnZVhPZmZzZXQiLCJwYXJlbnREaW1zIiwiYW5jaG9yIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJrZXkiLCJ3aGljaCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJyZWdpc3RlciIsImNvbXBvbmVudE5hbWUiLCJ0cmFwRm9jdXMiLCIkZm9jdXNhYmxlIiwiJGZpcnN0Rm9jdXNhYmxlIiwiJGxhc3RGb2N1c2FibGUiLCJmb2N1cyIsInJlbGVhc2VGb2N1cyIsImtjcyIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwiYXRMZWFzdCIsInNpemUiLCJxdWVyeSIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwibWF0Y2hlZCIsIm5ld1NpemUiLCJjdXJyZW50U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImluZm8iLCJpZCIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwic3R5bGVTaGVldCIsImNzc1RleHQiLCJ0ZXh0Q29udGVudCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicGFyYW0iLCJwYXJ0cyIsImRlY29kZVVSSUNvbXBvbmVudCIsImlzQXJyYXkiLCJpbml0Q2xhc3NlcyIsImFjdGl2ZUNsYXNzZXMiLCJNb3Rpb24iLCJhbmltYXRlSW4iLCJhbmltYXRpb24iLCJjYiIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiYW5pbSIsInByb2ciLCJtb3ZlIiwidHMiLCJpc0luIiwiaW5pdENsYXNzIiwiYWN0aXZlQ2xhc3MiLCJyZXNldCIsIm9uZSIsImZpbmlzaCIsInRyYW5zaXRpb25EdXJhdGlvbiIsIk5lc3QiLCJGZWF0aGVyIiwibWVudSIsIml0ZW1zIiwic3ViTWVudUNsYXNzIiwic3ViSXRlbUNsYXNzIiwiaGFzU3ViQ2xhc3MiLCIkaXRlbSIsIiRzdWIiLCJCdXJuIiwicm9sZSIsIlRpbWVyIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0Iiwib25JbWFnZXNMb2FkZWQiLCJpbWFnZXMiLCJ1bmxvYWRlZCIsInNpbmdsZUltYWdlTG9hZGVkIiwic3BvdFN3aXBlIiwiZW5hYmxlZCIsIm1vdmVUaHJlc2hvbGQiLCJ0aW1lVGhyZXNob2xkIiwic3RhcnRQb3NYIiwic3RhcnRQb3NZIiwic3RhcnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJpc01vdmluZyIsIm9uVG91Y2hFbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25Ub3VjaE1vdmUiLCJkeCIsImR5IiwiZGlyIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInRlYXJkb3duIiwic3BlY2lhbCIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImV2ZW50VHlwZXMiLCJ0b3VjaHN0YXJ0IiwidG91Y2htb3ZlIiwidG91Y2hlbmQiLCJzaW11bGF0ZWRFdmVudCIsIk1vdXNlRXZlbnQiLCJzY3JlZW5YIiwic2NyZWVuWSIsImluaXRNb3VzZUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwibXV0YXRlTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiYXR0cmlidXRlTmFtZSIsImVsZW1lbnRPYnNlcnZlciIsImNoYXJhY3RlckRhdGEiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJJSGVhcllvdSIsIl9jcmVhdGVDbGFzcyIsImRlZmluZVByb3BlcnRpZXMiLCJwcm9wcyIsImRlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJkZWZpbmVQcm9wZXJ0eSIsIkNvbnN0cnVjdG9yIiwicHJvdG9Qcm9wcyIsInN0YXRpY1Byb3BzIiwiX2NsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJEcm9wZG93bk1lbnUiLCJzdWJzIiwiJG1lbnVJdGVtcyIsIiR0YWJzIiwidmVydGljYWxDbGFzcyIsInJpZ2h0Q2xhc3MiLCJhbGlnbm1lbnQiLCJjaGFuZ2VkIiwiX2V2ZW50cyIsIl9pc1ZlcnRpY2FsIiwiaGFzVG91Y2giLCJvbnRvdWNoc3RhcnQiLCJwYXJDbGFzcyIsImhhbmRsZUNsaWNrRm4iLCJwYXJlbnRzVW50aWwiLCJoYXNTdWIiLCJoYXNDbGlja2VkIiwiY2xvc2VPbkNsaWNrIiwiY2xpY2tPcGVuIiwiZm9yY2VGb2xsb3ciLCJfaGlkZSIsIl9zaG93IiwiY2xvc2VPbkNsaWNrSW5zaWRlIiwiZGlzYWJsZUhvdmVyIiwiaG92ZXJEZWxheSIsImF1dG9jbG9zZSIsImNsb3NpbmdUaW1lIiwiaXNUYWIiLCIkZWxlbWVudHMiLCJzaWJsaW5ncyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIm5leHRTaWJsaW5nIiwicHJldlNpYmxpbmciLCJvcGVuU3ViIiwiY2xvc2VTdWIiLCJjbG9zZSIsIm9wZW4iLCJkb3duIiwidXAiLCJwcmV2aW91cyIsIl9hZGRCb2R5SGFuZGxlciIsIiRib2R5IiwiJGxpbmsiLCJpZHgiLCIkc2licyIsImNsZWFyIiwib2xkQ2xhc3MiLCIkcGFyZW50TGkiLCIkdG9DbG9zZSIsInNvbWV0aGluZ1RvQ2xvc2UiLCJPZmZDYW52YXMiLCIkbGFzdFRyaWdnZXIiLCIkdHJpZ2dlcnMiLCJjb250ZW50T3ZlcmxheSIsIm92ZXJsYXkiLCJvdmVybGF5UG9zaXRpb24iLCIkb3ZlcmxheSIsImlzUmV2ZWFsZWQiLCJyZXZlYWxDbGFzcyIsInJldmVhbE9uIiwiX3NldE1RQ2hlY2tlciIsInRyYW5zaXRpb25UaW1lIiwiX2hhbmRsZUtleWJvYXJkIiwicmV2ZWFsIiwiJGNsb3NlciIsIl9zdG9wU2Nyb2xsaW5nIiwiX3JlY29yZFNjcm9sbGFibGUiLCJzY3JvbGxIZWlnaHQiLCJzY3JvbGxUb3AiLCJhbGxvd1VwIiwiYWxsb3dEb3duIiwibGFzdFkiLCJfc3RvcFNjcm9sbFByb3BhZ2F0aW9uIiwiZm9yY2VUbyIsInNjcm9sbFRvIiwiY29udGVudFNjcm9sbCIsImF1dG9Gb2N1cyIsIl90aGlzMiIsIlJlc3BvbnNpdmVNZW51IiwicnVsZXMiLCJjdXJyZW50TXEiLCJjdXJyZW50UGx1Z2luIiwicnVsZXNUcmVlIiwicnVsZSIsInJ1bGVTaXplIiwicnVsZVBsdWdpbiIsIk1lbnVQbHVnaW5zIiwiaXNFbXB0eU9iamVjdCIsIl9jaGVja01lZGlhUXVlcmllcyIsIm1hdGNoZWRNcSIsImNzc0NsYXNzIiwiZHJvcGRvd24iLCJkcmlsbGRvd24iLCJhY2NvcmRpb24iLCJyZWFkeSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Ozs7Ozs7Ozs7Ozs7QUF5QkVyRyxNQUFFLGFBQUYsRUFBaUJzTixLQUFqQixDQUF1QjtBQUNuQi9JLG1CQUFXLGlJQURRO0FBRW5CRCxtQkFBVztBQUZRLEtBQXZCO0FBSUgsQ0E3R0QsRUE2R0diLE1BN0dIIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY0LjMuMVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdCAgLypcblx0ICAgKiB2YXJpYWJsZXNcblx0ICAgKi9cblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IG51bGw7XG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gWydpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnXTtcblxuXHQgIHZhciBmdW5jdGlvbkxpc3QgPSBbXTtcblxuXHQgIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuXHQgIC8vIGNhbiBiZSBzYWZlbHkgaWdub3JlZCB0byBwcmV2ZW50IGZhbHNlIGtleWJvYXJkIGRldGVjdGlvblxuXHQgIHZhciBpZ25vcmVNYXAgPSBbMTYsIC8vIHNoaWZ0XG5cdCAgMTcsIC8vIGNvbnRyb2xcblx0ICAxOCwgLy8gYWx0XG5cdCAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICA5MyAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbGlzdCBvZiBrZXlzIGZvciB3aGljaCB3ZSBjaGFuZ2UgaW50ZW50IGV2ZW4gZm9yIGZvcm0gaW5wdXRzXG5cdCAgdmFyIGNoYW5nZUludGVudE1hcCA9IFs5IC8vIHRhYlxuXHQgIF07XG5cblx0ICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dE1hcCA9IHtcblx0ICAgIGtleWRvd246ICdrZXlib2FyZCcsXG5cdCAgICBrZXl1cDogJ2tleWJvYXJkJyxcblx0ICAgIG1vdXNlZG93bjogJ21vdXNlJyxcblx0ICAgIG1vdXNlbW92ZTogJ21vdXNlJyxcblx0ICAgIE1TUG9pbnRlckRvd246ICdwb2ludGVyJyxcblx0ICAgIE1TUG9pbnRlck1vdmU6ICdwb2ludGVyJyxcblx0ICAgIHBvaW50ZXJkb3duOiAncG9pbnRlcicsXG5cdCAgICBwb2ludGVybW92ZTogJ3BvaW50ZXInLFxuXHQgICAgdG91Y2hzdGFydDogJ3RvdWNoJ1xuXHQgIH07XG5cblx0ICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dFR5cGVzID0gW107XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRvdWNoIGJ1ZmZlciBpcyBhY3RpdmVcblx0ICB2YXIgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdGhlIHBhZ2UgaXMgYmVpbmcgc2Nyb2xsZWRcblx0ICB2YXIgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgIC8vIHN0b3JlIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cblx0ICB2YXIgbW91c2VQb3MgPSB7XG5cdCAgICB4OiBudWxsLFxuXHQgICAgeTogbnVsbFxuXHQgIH07XG5cblx0ICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXHQgIH07XG5cblx0ICB2YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cblx0ICB0cnkge1xuXHQgICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuXHQgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0ICAgICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuXHQgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcblx0ICB9IGNhdGNoIChlKSB7fVxuXG5cdCAgLypcblx0ICAgKiBzZXQgdXBcblx0ICAgKi9cblxuXHQgIHZhciBzZXRVcCA9IGZ1bmN0aW9uIHNldFVwKCkge1xuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiBldmVudHNcblx0ICAgKi9cblxuXHQgIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKSB7XG5cdCAgICAvLyBgcG9pbnRlcm1vdmVgLCBgTVNQb2ludGVyTW92ZWAsIGBtb3VzZW1vdmVgIGFuZCBtb3VzZSB3aGVlbCBldmVudCBiaW5kaW5nXG5cdCAgICAvLyBjYW4gb25seSBkZW1vbnN0cmF0ZSBwb3RlbnRpYWwsIGJ1dCBub3QgYWN0dWFsLCBpbnRlcmFjdGlvblxuXHQgICAgLy8gYW5kIGFyZSB0cmVhdGVkIHNlcGFyYXRlbHlcblx0ICAgIHZhciBvcHRpb25zID0gc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZTtcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hCdWZmZXIsIG9wdGlvbnMpO1xuXHQgICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoQnVmZmVyKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50LCBvcHRpb25zKTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZUlucHV0KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciB1cGRhdGVJbnB1dCA9IGZ1bmN0aW9uIHVwZGF0ZUlucHV0KGV2ZW50KSB7XG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8IGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICAgIHZhciBhY3RpdmVJbnB1dCA9IGZhbHNlO1xuXHQgICAgICAgIHZhciBub3RGb3JtSW5wdXQgPSBhY3RpdmVFbGVtICYmIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiYgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xO1xuXG5cdCAgICAgICAgaWYgKG5vdEZvcm1JbnB1dCB8fCBjaGFuZ2VJbnRlbnRNYXAuaW5kZXhPZihldmVudEtleSkgIT09IC0xKSB7XG5cdCAgICAgICAgICBhY3RpdmVJbnB1dCA9IHRydWU7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKHZhbHVlID09PSAndG91Y2gnIHx8XG5cdCAgICAgICAgLy8gaWdub3JlIG1vdXNlIG1vZGlmaWVyIGtleXNcblx0ICAgICAgICB2YWx1ZSA9PT0gJ21vdXNlJyB8fFxuXHQgICAgICAgIC8vIGRvbid0IHN3aXRjaCBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIGEgZm9ybSBpbnB1dFxuXHQgICAgICAgIHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGV2ZW50S2V5ICYmIGFjdGl2ZUlucHV0ICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTEpIHtcblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24gc2V0SW5wdXQoKSB7XG5cdCAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cdCAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW5wdXQpO1xuXG5cdCAgICBpZiAoaW5wdXRUeXBlcy5pbmRleE9mKGN1cnJlbnRJbnB1dCkgPT09IC0xKSB7XG5cdCAgICAgIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuXHQgICAgICBkb2MuY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cblx0ICAgIGZpcmVGdW5jdGlvbnMoJ2lucHV0Jyk7XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbiBzZXRJbnRlbnQoZXZlbnQpIHtcblx0ICAgIC8vIHRlc3QgdG8gc2VlIGlmIGBtb3VzZW1vdmVgIGhhcHBlbmVkIHJlbGF0aXZlIHRvIHRoZSBzY3JlZW5cblx0ICAgIC8vIHRvIGRldGVjdCBzY3JvbGxpbmcgdmVyc3VzIG1vdXNlbW92ZVxuXHQgICAgaWYgKG1vdXNlUG9zWyd4J10gIT09IGV2ZW50LnNjcmVlblggfHwgbW91c2VQb3NbJ3knXSAhPT0gZXZlbnQuc2NyZWVuWSkge1xuXHQgICAgICBpc1Njcm9sbGluZyA9IGZhbHNlO1xuXG5cdCAgICAgIG1vdXNlUG9zWyd4J10gPSBldmVudC5zY3JlZW5YO1xuXHQgICAgICBtb3VzZVBvc1sneSddID0gZXZlbnQuc2NyZWVuWTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGlzU2Nyb2xsaW5nID0gdHJ1ZTtcblx0ICAgIH1cblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgLy8gb3Igc2Nyb2xsaW5nIGlzbid0IGhhcHBlbmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZyAmJiAhaXNTY3JvbGxpbmcpIHtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBkb2Muc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW50ZW50KTtcblxuXHQgICAgICAgIGZpcmVGdW5jdGlvbnMoJ2ludGVudCcpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbiB0b3VjaEJ1ZmZlcihldmVudCkge1xuXHQgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgICAgIC8vIHNldCB0aGUgY3VycmVudCBpbnB1dFxuXHQgICAgICB1cGRhdGVJbnB1dChldmVudCk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIHZhciBmaXJlRnVuY3Rpb25zID0gZnVuY3Rpb24gZmlyZUZ1bmN0aW9ucyh0eXBlKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZnVuY3Rpb25MaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgIGlmIChmdW5jdGlvbkxpc3RbaV0udHlwZSA9PT0gdHlwZSkge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdFtpXS5mbi5jYWxsKHVuZGVmaW5lZCwgY3VycmVudEludGVudCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiB1dGlsaXRpZXNcblx0ICAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uIHBvaW50ZXJUeXBlKGV2ZW50KSB7XG5cdCAgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgICByZXR1cm4gZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24gZGV0ZWN0V2hlZWwoKSB7XG5cdCAgICB2YXIgd2hlZWxUeXBlID0gdm9pZCAwO1xuXG5cdCAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblx0ICAgIGlmICgnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpIHtcblx0ICAgICAgd2hlZWxUeXBlID0gJ3doZWVsJztcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAvLyBvciBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICAgICAgd2hlZWxUeXBlID0gZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgPyAnbW91c2V3aGVlbCcgOiAnRE9NTW91c2VTY3JvbGwnO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gd2hlZWxUeXBlO1xuXHQgIH07XG5cblx0ICB2YXIgb2JqUG9zID0gZnVuY3Rpb24gb2JqUG9zKG1hdGNoKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZnVuY3Rpb25MaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgIGlmIChmdW5jdGlvbkxpc3RbaV0uZm4gPT09IG1hdGNoKSB7XG5cdCAgICAgICAgcmV0dXJuIGk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcblx0ICAgKiBpbml0XG5cdCAgICovXG5cblx0ICAvLyBkb24ndCBzdGFydCBzY3JpcHQgdW5sZXNzIGJyb3dzZXIgY3V0cyB0aGUgbXVzdGFyZFxuXHQgIC8vIChhbHNvIHBhc3NlcyBpZiBwb2x5ZmlsbHMgYXJlIHVzZWQpXG5cdCAgaWYgKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0ICAgIHNldFVwKCk7XG5cdCAgfVxuXG5cdCAgLypcblx0ICAgKiBhcGlcblx0ICAgKi9cblxuXHQgIHJldHVybiB7XG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnbG9vc2UnfCdzdHJpY3QnXG5cdCAgICAvLyAnc3RyaWN0JyAoZGVmYXVsdCk6IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGBkYXRhLXdoYXRpbnB1dGAgYXR0cmlidXRlXG5cdCAgICAvLyAnbG9vc2UnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIG1vcmUgY3VycmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24gYXNrKG9wdCkge1xuXHQgICAgICByZXR1cm4gb3B0ID09PSAnbG9vc2UnID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDtcblx0ICAgIH0sXG5cblx0ICAgIC8vIHJldHVybnMgYXJyYXk6IGFsbCB0aGUgZGV0ZWN0ZWQgaW5wdXQgdHlwZXNcblx0ICAgIHR5cGVzOiBmdW5jdGlvbiB0eXBlcygpIHtcblx0ICAgICAgcmV0dXJuIGlucHV0VHlwZXM7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBvdmVyd3JpdGVzIGlnbm9yZWQga2V5cyB3aXRoIHByb3ZpZGVkIGFycmF5XG5cdCAgICBpZ25vcmVLZXlzOiBmdW5jdGlvbiBpZ25vcmVLZXlzKGFycikge1xuXHQgICAgICBpZ25vcmVNYXAgPSBhcnI7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBhdHRhY2ggZnVuY3Rpb25zIHRvIGlucHV0IGFuZCBpbnRlbnQgXCJldmVudHNcIlxuXHQgICAgLy8gZnVuY3Q6IGZ1bmN0aW9uIHRvIGZpcmUgb24gY2hhbmdlXG5cdCAgICAvLyBldmVudFR5cGU6ICdpbnB1dCd8J2ludGVudCdcblx0ICAgIHJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHJlZ2lzdGVyT25DaGFuZ2UoZm4sIGV2ZW50VHlwZSkge1xuXHQgICAgICBmdW5jdGlvbkxpc3QucHVzaCh7XG5cdCAgICAgICAgZm46IGZuLFxuXHQgICAgICAgIHR5cGU6IGV2ZW50VHlwZSB8fCAnaW5wdXQnXG5cdCAgICAgIH0pO1xuXHQgICAgfSxcblxuXHQgICAgdW5SZWdpc3Rlck9uQ2hhbmdlOiBmdW5jdGlvbiB1blJlZ2lzdGVyT25DaGFuZ2UoZm4pIHtcblx0ICAgICAgdmFyIHBvc2l0aW9uID0gb2JqUG9zKGZuKTtcblxuXHQgICAgICBpZiAocG9zaXRpb24pIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cdH0oKTtcblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIi8qISBsYXp5c2l6ZXMgLSB2My4wLjAgKi9cbiFmdW5jdGlvbihhLGIpe3ZhciBjPWIoYSxhLmRvY3VtZW50KTthLmxhenlTaXplcz1jLFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9Yyl9KHdpbmRvdyxmdW5jdGlvbihhLGIpe1widXNlIHN0cmljdFwiO2lmKGIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7dmFyIGMsZD1iLmRvY3VtZW50RWxlbWVudCxlPWEuRGF0ZSxmPWEuSFRNTFBpY3R1cmVFbGVtZW50LGc9XCJhZGRFdmVudExpc3RlbmVyXCIsaD1cImdldEF0dHJpYnV0ZVwiLGk9YVtnXSxqPWEuc2V0VGltZW91dCxrPWEucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxqLGw9YS5yZXF1ZXN0SWRsZUNhbGxiYWNrLG09L15waWN0dXJlJC9pLG49W1wibG9hZFwiLFwiZXJyb3JcIixcImxhenlpbmNsdWRlZFwiLFwiX2xhenlsb2FkZWRcIl0sbz17fSxwPUFycmF5LnByb3RvdHlwZS5mb3JFYWNoLHE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gb1tiXXx8KG9bYl09bmV3IFJlZ0V4cChcIihcXFxcc3xeKVwiK2IrXCIoXFxcXHN8JClcIikpLG9bYl0udGVzdChhW2hdKFwiY2xhc3NcIil8fFwiXCIpJiZvW2JdfSxyPWZ1bmN0aW9uKGEsYil7cShhLGIpfHxhLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsKGFbaF0oXCJjbGFzc1wiKXx8XCJcIikudHJpbSgpK1wiIFwiK2IpfSxzPWZ1bmN0aW9uKGEsYil7dmFyIGM7KGM9cShhLGIpKSYmYS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLChhW2hdKFwiY2xhc3NcIil8fFwiXCIpLnJlcGxhY2UoYyxcIiBcIikpfSx0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jP2c6XCJyZW1vdmVFdmVudExpc3RlbmVyXCI7YyYmdChhLGIpLG4uZm9yRWFjaChmdW5jdGlvbihjKXthW2RdKGMsYil9KX0sdT1mdW5jdGlvbihhLGMsZCxlLGYpe3ZhciBnPWIuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtyZXR1cm4gZy5pbml0Q3VzdG9tRXZlbnQoYywhZSwhZixkfHx7fSksYS5kaXNwYXRjaEV2ZW50KGcpLGd9LHY9ZnVuY3Rpb24oYixkKXt2YXIgZTshZiYmKGU9YS5waWN0dXJlZmlsbHx8Yy5wZik/ZSh7cmVldmFsdWF0ZTohMCxlbGVtZW50czpbYl19KTpkJiZkLnNyYyYmKGIuc3JjPWQuc3JjKX0sdz1mdW5jdGlvbihhLGIpe3JldHVybihnZXRDb21wdXRlZFN0eWxlKGEsbnVsbCl8fHt9KVtiXX0seD1mdW5jdGlvbihhLGIsZCl7Zm9yKGQ9ZHx8YS5vZmZzZXRXaWR0aDtkPGMubWluU2l6ZSYmYiYmIWEuX2xhenlzaXplc1dpZHRoOylkPWIub2Zmc2V0V2lkdGgsYj1iLnBhcmVudE5vZGU7cmV0dXJuIGR9LHk9ZnVuY3Rpb24oKXt2YXIgYSxjLGQ9W10sZT1bXSxmPWQsZz1mdW5jdGlvbigpe3ZhciBiPWY7Zm9yKGY9ZC5sZW5ndGg/ZTpkLGE9ITAsYz0hMTtiLmxlbmd0aDspYi5zaGlmdCgpKCk7YT0hMX0saD1mdW5jdGlvbihkLGUpe2EmJiFlP2QuYXBwbHkodGhpcyxhcmd1bWVudHMpOihmLnB1c2goZCksY3x8KGM9ITAsKGIuaGlkZGVuP2o6aykoZykpKX07cmV0dXJuIGguX2xzRmx1c2g9ZyxofSgpLHo9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9mdW5jdGlvbigpe3koYSl9OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxjPWFyZ3VtZW50czt5KGZ1bmN0aW9uKCl7YS5hcHBseShiLGMpfSl9fSxBPWZ1bmN0aW9uKGEpe3ZhciBiLGM9MCxkPTEyNSxmPTY2NixnPWYsaD1mdW5jdGlvbigpe2I9ITEsYz1lLm5vdygpLGEoKX0saT1sP2Z1bmN0aW9uKCl7bChoLHt0aW1lb3V0Omd9KSxnIT09ZiYmKGc9Zil9OnooZnVuY3Rpb24oKXtqKGgpfSwhMCk7cmV0dXJuIGZ1bmN0aW9uKGEpe3ZhciBmOyhhPWE9PT0hMCkmJihnPTQ0KSxifHwoYj0hMCxmPWQtKGUubm93KCktYyksMD5mJiYoZj0wKSxhfHw5PmYmJmw/aSgpOmooaSxmKSl9fSxCPWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD05OSxmPWZ1bmN0aW9uKCl7Yj1udWxsLGEoKX0sZz1mdW5jdGlvbigpe3ZhciBhPWUubm93KCktYztkPmE/aihnLGQtYSk6KGx8fGYpKGYpfTtyZXR1cm4gZnVuY3Rpb24oKXtjPWUubm93KCksYnx8KGI9aihnLGQpKX19LEM9ZnVuY3Rpb24oKXt2YXIgZixrLGwsbixvLHgsQyxFLEYsRyxILEksSixLLEwsTT0vXmltZyQvaSxOPS9eaWZyYW1lJC9pLE89XCJvbnNjcm9sbFwiaW4gYSYmIS9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksUD0wLFE9MCxSPTAsUz0tMSxUPWZ1bmN0aW9uKGEpe1ItLSxhJiZhLnRhcmdldCYmdChhLnRhcmdldCxUKSwoIWF8fDA+Unx8IWEudGFyZ2V0KSYmKFI9MCl9LFU9ZnVuY3Rpb24oYSxjKXt2YXIgZSxmPWEsZz1cImhpZGRlblwiPT13KGIuYm9keSxcInZpc2liaWxpdHlcIil8fFwiaGlkZGVuXCIhPXcoYSxcInZpc2liaWxpdHlcIik7Zm9yKEYtPWMsSSs9YyxHLT1jLEgrPWM7ZyYmKGY9Zi5vZmZzZXRQYXJlbnQpJiZmIT1iLmJvZHkmJmYhPWQ7KWc9KHcoZixcIm9wYWNpdHlcIil8fDEpPjAsZyYmXCJ2aXNpYmxlXCIhPXcoZixcIm92ZXJmbG93XCIpJiYoZT1mLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLGc9SD5lLmxlZnQmJkc8ZS5yaWdodCYmST5lLnRvcC0xJiZGPGUuYm90dG9tKzEpO3JldHVybiBnfSxWPWZ1bmN0aW9uKCl7dmFyIGEsZSxnLGksaixtLG4scCxxO2lmKChvPWMubG9hZE1vZGUpJiY4PlImJihhPWYubGVuZ3RoKSl7ZT0wLFMrKyxudWxsPT1LJiYoXCJleHBhbmRcImluIGN8fChjLmV4cGFuZD1kLmNsaWVudEhlaWdodD41MDAmJmQuY2xpZW50V2lkdGg+NTAwPzUwMDozNzApLEo9Yy5leHBhbmQsSz1KKmMuZXhwRmFjdG9yKSxLPlEmJjE+UiYmUz4yJiZvPjImJiFiLmhpZGRlbj8oUT1LLFM9MCk6UT1vPjEmJlM+MSYmNj5SP0o6UDtmb3IoO2E+ZTtlKyspaWYoZltlXSYmIWZbZV0uX2xhenlSYWNlKWlmKE8paWYoKHA9ZltlXVtoXShcImRhdGEtZXhwYW5kXCIpKSYmKG09MSpwKXx8KG09USkscSE9PW0mJihDPWlubmVyV2lkdGgrbSpMLEU9aW5uZXJIZWlnaHQrbSxuPS0xKm0scT1tKSxnPWZbZV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksKEk9Zy5ib3R0b20pPj1uJiYoRj1nLnRvcCk8PUUmJihIPWcucmlnaHQpPj1uKkwmJihHPWcubGVmdCk8PUMmJihJfHxIfHxHfHxGKSYmKGwmJjM+UiYmIXAmJigzPm98fDQ+Uyl8fFUoZltlXSxtKSkpe2lmKGJhKGZbZV0pLGo9ITAsUj45KWJyZWFrfWVsc2UhaiYmbCYmIWkmJjQ+UiYmND5TJiZvPjImJihrWzBdfHxjLnByZWxvYWRBZnRlckxvYWQpJiYoa1swXXx8IXAmJihJfHxIfHxHfHxGfHxcImF1dG9cIiE9ZltlXVtoXShjLnNpemVzQXR0cikpKSYmKGk9a1swXXx8ZltlXSk7ZWxzZSBiYShmW2VdKTtpJiYhaiYmYmEoaSl9fSxXPUEoViksWD1mdW5jdGlvbihhKXtyKGEudGFyZ2V0LGMubG9hZGVkQ2xhc3MpLHMoYS50YXJnZXQsYy5sb2FkaW5nQ2xhc3MpLHQoYS50YXJnZXQsWil9LFk9eihYKSxaPWZ1bmN0aW9uKGEpe1koe3RhcmdldDphLnRhcmdldH0pfSwkPWZ1bmN0aW9uKGEsYil7dHJ5e2EuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGIpfWNhdGNoKGMpe2Euc3JjPWJ9fSxfPWZ1bmN0aW9uKGEpe3ZhciBiLGQsZT1hW2hdKGMuc3Jjc2V0QXR0cik7KGI9Yy5jdXN0b21NZWRpYVthW2hdKFwiZGF0YS1tZWRpYVwiKXx8YVtoXShcIm1lZGlhXCIpXSkmJmEuc2V0QXR0cmlidXRlKFwibWVkaWFcIixiKSxlJiZhLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGUpLGImJihkPWEucGFyZW50Tm9kZSxkLmluc2VydEJlZm9yZShhLmNsb25lTm9kZSgpLGEpLGQucmVtb3ZlQ2hpbGQoYSkpfSxhYT16KGZ1bmN0aW9uKGEsYixkLGUsZil7dmFyIGcsaSxrLGwsbyxxOyhvPXUoYSxcImxhenliZWZvcmV1bnZlaWxcIixiKSkuZGVmYXVsdFByZXZlbnRlZHx8KGUmJihkP3IoYSxjLmF1dG9zaXplc0NsYXNzKTphLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZSkpLGk9YVtoXShjLnNyY3NldEF0dHIpLGc9YVtoXShjLnNyY0F0dHIpLGYmJihrPWEucGFyZW50Tm9kZSxsPWsmJm0udGVzdChrLm5vZGVOYW1lfHxcIlwiKSkscT1iLmZpcmVzTG9hZHx8XCJzcmNcImluIGEmJihpfHxnfHxsKSxvPXt0YXJnZXQ6YX0scSYmKHQoYSxULCEwKSxjbGVhclRpbWVvdXQobiksbj1qKFQsMjUwMCkscihhLGMubG9hZGluZ0NsYXNzKSx0KGEsWiwhMCkpLGwmJnAuY2FsbChrLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic291cmNlXCIpLF8pLGk/YS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixpKTpnJiYhbCYmKE4udGVzdChhLm5vZGVOYW1lKT8kKGEsZyk6YS5zcmM9ZyksKGl8fGwpJiZ2KGEse3NyYzpnfSkpLGEuX2xhenlSYWNlJiZkZWxldGUgYS5fbGF6eVJhY2UscyhhLGMubGF6eUNsYXNzKSx5KGZ1bmN0aW9uKCl7KCFxfHxhLmNvbXBsZXRlJiZhLm5hdHVyYWxXaWR0aD4xKSYmKHE/VChvKTpSLS0sWChvKSl9LCEwKX0pLGJhPWZ1bmN0aW9uKGEpe3ZhciBiLGQ9TS50ZXN0KGEubm9kZU5hbWUpLGU9ZCYmKGFbaF0oYy5zaXplc0F0dHIpfHxhW2hdKFwic2l6ZXNcIikpLGY9XCJhdXRvXCI9PWU7KCFmJiZsfHwhZHx8IWEuc3JjJiYhYS5zcmNzZXR8fGEuY29tcGxldGV8fHEoYSxjLmVycm9yQ2xhc3MpKSYmKGI9dShhLFwibGF6eXVudmVpbHJlYWRcIikuZGV0YWlsLGYmJkQudXBkYXRlRWxlbShhLCEwLGEub2Zmc2V0V2lkdGgpLGEuX2xhenlSYWNlPSEwLFIrKyxhYShhLGIsZixlLGQpKX0sY2E9ZnVuY3Rpb24oKXtpZighbCl7aWYoZS5ub3coKS14PDk5OSlyZXR1cm4gdm9pZCBqKGNhLDk5OSk7dmFyIGE9QihmdW5jdGlvbigpe2MubG9hZE1vZGU9MyxXKCl9KTtsPSEwLGMubG9hZE1vZGU9MyxXKCksaShcInNjcm9sbFwiLGZ1bmN0aW9uKCl7Mz09Yy5sb2FkTW9kZSYmKGMubG9hZE1vZGU9MiksYSgpfSwhMCl9fTtyZXR1cm57XzpmdW5jdGlvbigpe3g9ZS5ub3coKSxmPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmxhenlDbGFzcyksaz1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5sYXp5Q2xhc3MrXCIgXCIrYy5wcmVsb2FkQ2xhc3MpLEw9Yy5oRmFjLGkoXCJzY3JvbGxcIixXLCEwKSxpKFwicmVzaXplXCIsVywhMCksYS5NdXRhdGlvbk9ic2VydmVyP25ldyBNdXRhdGlvbk9ic2VydmVyKFcpLm9ic2VydmUoZCx7Y2hpbGRMaXN0OiEwLHN1YnRyZWU6ITAsYXR0cmlidXRlczohMH0pOihkW2ddKFwiRE9NTm9kZUluc2VydGVkXCIsVywhMCksZFtnXShcIkRPTUF0dHJNb2RpZmllZFwiLFcsITApLHNldEludGVydmFsKFcsOTk5KSksaShcImhhc2hjaGFuZ2VcIixXLCEwKSxbXCJmb2N1c1wiLFwibW91c2VvdmVyXCIsXCJjbGlja1wiLFwibG9hZFwiLFwidHJhbnNpdGlvbmVuZFwiLFwiYW5pbWF0aW9uZW5kXCIsXCJ3ZWJraXRBbmltYXRpb25FbmRcIl0uZm9yRWFjaChmdW5jdGlvbihhKXtiW2ddKGEsVywhMCl9KSwvZCR8XmMvLnRlc3QoYi5yZWFkeVN0YXRlKT9jYSgpOihpKFwibG9hZFwiLGNhKSxiW2ddKFwiRE9NQ29udGVudExvYWRlZFwiLFcpLGooY2EsMmU0KSksZi5sZW5ndGg/KFYoKSx5Ll9sc0ZsdXNoKCkpOlcoKX0sY2hlY2tFbGVtczpXLHVudmVpbDpiYX19KCksRD1mdW5jdGlvbigpe3ZhciBhLGQ9eihmdW5jdGlvbihhLGIsYyxkKXt2YXIgZSxmLGc7aWYoYS5fbGF6eXNpemVzV2lkdGg9ZCxkKz1cInB4XCIsYS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGQpLG0udGVzdChiLm5vZGVOYW1lfHxcIlwiKSlmb3IoZT1iLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic291cmNlXCIpLGY9MCxnPWUubGVuZ3RoO2c+ZjtmKyspZVtmXS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGQpO2MuZGV0YWlsLmRhdGFBdHRyfHx2KGEsYy5kZXRhaWwpfSksZT1mdW5jdGlvbihhLGIsYyl7dmFyIGUsZj1hLnBhcmVudE5vZGU7ZiYmKGM9eChhLGYsYyksZT11KGEsXCJsYXp5YmVmb3Jlc2l6ZXNcIix7d2lkdGg6YyxkYXRhQXR0cjohIWJ9KSxlLmRlZmF1bHRQcmV2ZW50ZWR8fChjPWUuZGV0YWlsLndpZHRoLGMmJmMhPT1hLl9sYXp5c2l6ZXNXaWR0aCYmZChhLGYsZSxjKSkpfSxmPWZ1bmN0aW9uKCl7dmFyIGIsYz1hLmxlbmd0aDtpZihjKWZvcihiPTA7Yz5iO2IrKyllKGFbYl0pfSxnPUIoZik7cmV0dXJue186ZnVuY3Rpb24oKXthPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmF1dG9zaXplc0NsYXNzKSxpKFwicmVzaXplXCIsZyl9LGNoZWNrRWxlbXM6Zyx1cGRhdGVFbGVtOmV9fSgpLEU9ZnVuY3Rpb24oKXtFLml8fChFLmk9ITAsRC5fKCksQy5fKCkpfTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYixkPXtsYXp5Q2xhc3M6XCJsYXp5bG9hZFwiLGxvYWRlZENsYXNzOlwibGF6eWxvYWRlZFwiLGxvYWRpbmdDbGFzczpcImxhenlsb2FkaW5nXCIscHJlbG9hZENsYXNzOlwibGF6eXByZWxvYWRcIixlcnJvckNsYXNzOlwibGF6eWVycm9yXCIsYXV0b3NpemVzQ2xhc3M6XCJsYXp5YXV0b3NpemVzXCIsc3JjQXR0cjpcImRhdGEtc3JjXCIsc3Jjc2V0QXR0cjpcImRhdGEtc3Jjc2V0XCIsc2l6ZXNBdHRyOlwiZGF0YS1zaXplc1wiLG1pblNpemU6NDAsY3VzdG9tTWVkaWE6e30saW5pdDohMCxleHBGYWN0b3I6MS41LGhGYWM6LjgsbG9hZE1vZGU6Mn07Yz1hLmxhenlTaXplc0NvbmZpZ3x8YS5sYXp5c2l6ZXNDb25maWd8fHt9O2ZvcihiIGluIGQpYiBpbiBjfHwoY1tiXT1kW2JdKTthLmxhenlTaXplc0NvbmZpZz1jLGooZnVuY3Rpb24oKXtjLmluaXQmJkUoKX0pfSgpLHtjZmc6YyxhdXRvU2l6ZXI6RCxsb2FkZXI6Qyxpbml0OkUsdVA6dixhQzpyLHJDOnMsaEM6cSxmaXJlOnUsZ1c6eCxyQUY6eX19fSk7IiwiLypcbiAgICAgXyBfICAgICAgXyAgICAgICBfXG4gX19ffCAoXykgX19ffCB8IF9fICAoXylfX19cbi8gX198IHwgfC8gX198IHwvIC8gIHwgLyBfX3xcblxcX18gXFwgfCB8IChfX3wgICA8IF8gfCBcXF9fIFxcXG58X19fL198X3xcXF9fX3xffFxcXyhfKS8gfF9fXy9cbiAgICAgICAgICAgICAgICAgICB8X18vXG5cbiBWZXJzaW9uOiAxLjYuMFxuICBBdXRob3I6IEtlbiBXaGVlbGVyXG4gV2Vic2l0ZTogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvXG4gICAgRG9jczogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvL3NsaWNrXG4gICAgUmVwbzogaHR0cDovL2dpdGh1Yi5jb20va2Vud2hlZWxlci9zbGlja1xuICBJc3N1ZXM6IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2svaXNzdWVzXG5cbiAqL1xuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIGRlZmluZSwgalF1ZXJ5LCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCAqL1xuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxuXG59KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xuXG4gICAgU2xpY2sgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlVWlkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xuXG4gICAgICAgICAgICB2YXIgXyA9IHRoaXMsIGRhdGFTZXR0aW5ncztcblxuICAgICAgICAgICAgXy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NpYmlsaXR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgYXBwZW5kRG90czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stcHJldlwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiIHRhYmluZGV4PVwiMFwiIHJvbGU9XCJidXR0b25cIj5QcmV2aW91czwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stbmV4dFwiIGFyaWEtbGFiZWw9XCJOZXh0XCIgdGFiaW5kZXg9XCIwXCIgcm9sZT1cImJ1dHRvblwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICBjc3NFYXNlOiAnZWFzZScsXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgLz4nKS50ZXh0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzcG9uZFRvOiAnd2luZG93JyxcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvd3M6IDEsXG4gICAgICAgICAgICAgICAgcnRsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZTogJycsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgICBzcGVlZDogNTAwLFxuICAgICAgICAgICAgICAgIHN3aXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvdWNoVGhyZXNob2xkOiA1LFxuICAgICAgICAgICAgICAgIHVzZUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VUcmFuc2Zvcm06IHRydWUsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsU3dpcGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2FpdEZvckFuaW1hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZVdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICRsaXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdW5zbGlja2VkOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8uYW5pbVByb3AgPSBudWxsO1xuICAgICAgICAgICAgXy5icmVha3BvaW50cyA9IFtdO1xuICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3MgPSBbXTtcbiAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaGlkZGVuID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IG51bGw7XG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IG51bGw7XG4gICAgICAgICAgICBfLnJvd0NvdW50ID0gMTtcbiAgICAgICAgICAgIF8uc2hvdWxkQ2xpY2sgPSB0cnVlO1xuICAgICAgICAgICAgXy4kc2xpZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAwO1xuICAgICAgICAgICAgXy53aW5kb3dUaW1lciA9IG51bGw7XG5cbiAgICAgICAgICAgIGRhdGFTZXR0aW5ncyA9ICQoZWxlbWVudCkuZGF0YSgnc2xpY2snKSB8fCB7fTtcblxuICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8uZGVmYXVsdHMsIHNldHRpbmdzLCBkYXRhU2V0dGluZ3MpO1xuXG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG5cbiAgICAgICAgICAgIF8ub3JpZ2luYWxTZXR0aW5ncyA9IF8ub3B0aW9ucztcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnbW96SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbW96dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnd2Via2l0SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnd2Via2l0dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYXV0b1BsYXkgPSAkLnByb3h5KF8uYXV0b1BsYXksIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUNsZWFyID0gJC5wcm94eShfLmF1dG9QbGF5Q2xlYXIsIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUl0ZXJhdG9yID0gJC5wcm94eShfLmF1dG9QbGF5SXRlcmF0b3IsIF8pO1xuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSA9ICQucHJveHkoXy5jaGFuZ2VTbGlkZSwgXyk7XG4gICAgICAgICAgICBfLmNsaWNrSGFuZGxlciA9ICQucHJveHkoXy5jbGlja0hhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZWxlY3RIYW5kbGVyID0gJC5wcm94eShfLnNlbGVjdEhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZXRQb3NpdGlvbiA9ICQucHJveHkoXy5zZXRQb3NpdGlvbiwgXyk7XG4gICAgICAgICAgICBfLnN3aXBlSGFuZGxlciA9ICQucHJveHkoXy5zd2lwZUhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5kcmFnSGFuZGxlciA9ICQucHJveHkoXy5kcmFnSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmtleUhhbmRsZXIgPSAkLnByb3h5KF8ua2V5SGFuZGxlciwgXyk7XG5cbiAgICAgICAgICAgIF8uaW5zdGFuY2VVaWQgPSBpbnN0YW5jZVVpZCsrO1xuXG4gICAgICAgICAgICAvLyBBIHNpbXBsZSB3YXkgdG8gY2hlY2sgZm9yIEhUTUwgc3RyaW5nc1xuICAgICAgICAgICAgLy8gU3RyaWN0IEhUTUwgcmVjb2duaXRpb24gKG11c3Qgc3RhcnQgd2l0aCA8KVxuICAgICAgICAgICAgLy8gRXh0cmFjdGVkIGZyb20galF1ZXJ5IHYxLjExIHNvdXJjZVxuICAgICAgICAgICAgXy5odG1sRXhwciA9IC9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKikkLztcblxuXG4gICAgICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIF8uaW5pdCh0cnVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFNsaWNrO1xuXG4gICAgfSgpKTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hY3RpdmF0ZUFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stYWN0aXZlJykuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAnZmFsc2UnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJzAnXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hZGRTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0FkZCA9IGZ1bmN0aW9uKG1hcmt1cCwgaW5kZXgsIGFkZEJlZm9yZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBhZGRCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IDAgfHwgKGluZGV4ID49IF8uc2xpZGVDb3VudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgJiYgXy4kc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEJlZm9yZShfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEFmdGVyKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFkZEJlZm9yZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5wcmVwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hbmltYXRlSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEgJiYgXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgICAgICAgXy4kbGlzdC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodFxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZVNsaWRlID0gZnVuY3Rpb24odGFyZ2V0TGVmdCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgYW5pbVByb3BzID0ge30sXG4gICAgICAgICAgICBfID0gdGhpcztcblxuICAgICAgICBfLmFuaW1hdGVIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gLXRhcmdldExlZnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50TGVmdCA9IC0oXy5jdXJyZW50TGVmdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoe1xuICAgICAgICAgICAgICAgICAgICBhbmltU3RhcnQ6IF8uY3VycmVudExlZnRcbiAgICAgICAgICAgICAgICB9KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogXy5vcHRpb25zLnNwZWVkLFxuICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IF8ub3B0aW9ucy5lYXNpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uKG5vdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gTWF0aC5jZWlsKG5vdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgwcHgsJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gTWF0aC5jZWlsKHRhcmdldExlZnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgwcHgsJyArIHRhcmdldExlZnQgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2VGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3I7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAmJiBhc05hdkZvciAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gJChhc05hdkZvcikubm90KF8uJHNsaWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXNOYXZGb3I7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBhc05hdkZvciA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAhPT0gbnVsbCAmJiB0eXBlb2YgYXNOYXZGb3IgPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgYXNOYXZGb3IuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzKS5zbGljaygnZ2V0U2xpY2snKTtcbiAgICAgICAgICAgICAgICBpZighdGFyZ2V0LnVuc2xpY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc2xpZGVIYW5kbGVyKGluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hcHBseVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgaWYgKCBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheVRpbWVyID0gc2V0SW50ZXJ2YWwoIF8uYXV0b1BsYXlJdGVyYXRvciwgXy5vcHRpb25zLmF1dG9wbGF5U3BlZWQgKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUNsZWFyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmF1dG9QbGF5VGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUl0ZXJhdG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIGlmICggIV8ucGF1c2VkICYmICFfLmludGVycnVwdGVkICYmICFfLmZvY3Vzc2VkICkge1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8uZGlyZWN0aW9uID09PSAxICYmICggXy5jdXJyZW50U2xpZGUgKyAxICkgPT09ICggXy5zbGlkZUNvdW50IC0gMSApKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmICggXy5kaXJlY3Rpb24gPT09IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggXy5jdXJyZW50U2xpZGUgLSAxID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIHNsaWRlVG8gKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgPSAkKF8ub3B0aW9ucy5wcmV2QXJyb3cpLmFkZENsYXNzKCdzbGljay1hcnJvdycpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ID0gJChfLm9wdGlvbnMubmV4dEFycm93KS5hZGRDbGFzcygnc2xpY2stYXJyb3cnKTtcblxuICAgICAgICAgICAgaWYoIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucHJlcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkKCBfLiRuZXh0QXJyb3cgKVxuXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBkb3Q7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1kb3R0ZWQnKTtcblxuICAgICAgICAgICAgZG90ID0gJCgnPHVsIC8+JykuYWRkQ2xhc3MoXy5vcHRpb25zLmRvdHNDbGFzcyk7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QuYXBwZW5kKCQoJzxsaSAvPicpLmFwcGVuZChfLm9wdGlvbnMuY3VzdG9tUGFnaW5nLmNhbGwodGhpcywgXywgaSkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kZG90cyA9IGRvdC5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kRG90cyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuZmluZCgnbGknKS5maXJzdCgpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRPdXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVzID1cbiAgICAgICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgICAgIC5jaGlsZHJlbiggXy5vcHRpb25zLnNsaWRlICsgJzpub3QoLnNsaWNrLWNsb25lZCknKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcblxuICAgICAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleClcbiAgICAgICAgICAgICAgICAuZGF0YSgnb3JpZ2luYWxTdHlsaW5nJywgJChlbGVtZW50KS5hdHRyKCdzdHlsZScpIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrID0gKF8uc2xpZGVDb3VudCA9PT0gMCkgP1xuICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLmFwcGVuZFRvKF8uJHNsaWRlcikgOlxuICAgICAgICAgICAgXy4kc2xpZGVzLndyYXBBbGwoJzxkaXYgY2xhc3M9XCJzbGljay10cmFja1wiLz4nKS5wYXJlbnQoKTtcblxuICAgICAgICBfLiRsaXN0ID0gXy4kc2xpZGVUcmFjay53cmFwKFxuICAgICAgICAgICAgJzxkaXYgYXJpYS1saXZlPVwicG9saXRlXCIgY2xhc3M9XCJzbGljay1saXN0XCIvPicpLnBhcmVudCgpO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLm5vdCgnW3NyY10nKS5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLmJ1aWxkRG90cygpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuXG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXModHlwZW9mIF8uY3VycmVudFNsaWRlID09PSAnbnVtYmVyJyA/IF8uY3VycmVudFNsaWRlIDogMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3QuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYSwgYiwgYywgbmV3U2xpZGVzLCBudW1PZlNsaWRlcywgb3JpZ2luYWxTbGlkZXMsc2xpZGVzUGVyU2VjdGlvbjtcblxuICAgICAgICBuZXdTbGlkZXMgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG5cbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChuZXdTbGlkZXMpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmNoaWxkcmVuKCkuY2hpbGRyZW4oKS5jaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICd3aWR0aCc6KDEwMCAvIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgJyUnLFxuICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja1Jlc3BvbnNpdmUgPSBmdW5jdGlvbihpbml0aWFsLCBmb3JjZVVwZGF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrcG9pbnQsIHRhcmdldEJyZWFrcG9pbnQsIHJlc3BvbmRUb1dpZHRoLCB0cmlnZ2VyQnJlYWtwb2ludCA9IGZhbHNlO1xuICAgICAgICB2YXIgc2xpZGVyV2lkdGggPSBfLiRzbGlkZXIud2lkdGgoKTtcbiAgICAgICAgdmFyIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgaWYgKF8ucmVzcG9uZFRvID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSB3aW5kb3dXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCBzbGlkZXJXaWR0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5yZXNwb25zaXZlICYmXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGggJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50IHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljayh0YXJnZXRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSBfLm9yaWdpbmFsU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgYnJlYWtwb2ludHMgZHVyaW5nIGFuIGFjdHVhbCBicmVhay4gbm90IG9uIGluaXRpYWxpemUuXG4gICAgICAgICAgICBpZiggIWluaXRpYWwgJiYgdHJpZ2dlckJyZWFrcG9pbnQgIT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdicmVha3BvaW50JywgW18sIHRyaWdnZXJCcmVha3BvaW50XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIGluZGV4T2Zmc2V0LCBzbGlkZU9mZnNldCwgdW5ldmVuT2Zmc2V0O1xuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBhIGxpbmssIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uXG4gICAgICAgIGlmKCR0YXJnZXQuaXMoJ2EnKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBub3QgdGhlIDxsaT4gZWxlbWVudCAoaWU6IGEgY2hpbGQpLCBmaW5kIHRoZSA8bGk+LlxuICAgICAgICBpZighJHRhcmdldC5pcygnbGknKSkge1xuICAgICAgICAgICAgJHRhcmdldCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuZXZlbk9mZnNldCA9IChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApO1xuICAgICAgICBpbmRleE9mZnNldCA9IHVuZXZlbk9mZnNldCA/IDAgOiAoXy5zbGlkZUNvdW50IC0gXy5jdXJyZW50U2xpZGUpICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ByZXZpb3VzJzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIGluZGV4T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgKyBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBldmVudC5kYXRhLmluZGV4ID09PSAwID8gMCA6XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXggfHwgJHRhcmdldC5pbmRleCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jaGVja05hdmlnYWJsZShpbmRleCksIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5jaGlsZHJlbigpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrTmF2aWdhYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBuYXZpZ2FibGVzLCBwcmV2TmF2aWdhYmxlO1xuXG4gICAgICAgIG5hdmlnYWJsZXMgPSBfLmdldE5hdmlnYWJsZUluZGV4ZXMoKTtcbiAgICAgICAgcHJldk5hdmlnYWJsZSA9IDA7XG4gICAgICAgIGlmIChpbmRleCA+IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgaW5kZXggPSBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG5hdmlnYWJsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBuYXZpZ2FibGVzW25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcHJldk5hdmlnYWJsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZOYXZpZ2FibGUgPSBuYXZpZ2FibGVzW25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgJiYgXy4kZG90cyAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXG4gICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hlbmQuc2xpY2sgbW91c2V1cC5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eSk7XG5cbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3Qub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9mZignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ub3JpZW50YXRpb25DaGFuZ2UpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub2ZmKCdkcmFnc3RhcnQnLCBfLnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBTbGlkZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRsaXN0Lm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgb3JpZ2luYWxTbGlkZXM7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlcy5jaGlsZHJlbigpLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmVtcHR5KCkuYXBwZW5kKG9yaWdpbmFsU2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihyZWZyZXNoKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcblxuICAgICAgICBfLmNsZWFuVXBFdmVudHMoKTtcblxuICAgICAgICAkKCcuc2xpY2stY2xvbmVkJywgXy4kc2xpZGVyKS5kZXRhY2goKTtcblxuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKCBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCBzbGljay1hcnJvdyBzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywnJyk7XG5cbiAgICAgICAgICAgIGlmICggXy5odG1sRXhwci50ZXN0KCBfLm9wdGlvbnMucHJldkFycm93ICkpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5uZXh0QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay12aXNpYmxlIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29yaWdpbmFsU3R5bGluZycpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRsaXN0LmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYXBwZW5kKF8uJHNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBfLmNsZWFuVXBSb3dzKCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZXInKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgIF8udW5zbGlja2VkID0gdHJ1ZTtcblxuICAgICAgICBpZighcmVmcmVzaCkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2Rlc3Ryb3knLCBbX10pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRpc2FibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICcnO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlID0gZnVuY3Rpb24oc2xpZGVJbmRleCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGVPdXQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJylcbiAgICAgICAgICAgIC5vbignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycsXG4gICAgICAgICAgICAgICAgJyo6bm90KC5zbGljay1hcnJvdyknLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHZhciAkc2YgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYoIF8ub3B0aW9ucy5wYXVzZU9uRm9jdXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9jdXNzZWQgPSAkc2YuaXMoJzpmb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCAwKTtcblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldEN1cnJlbnQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tDdXJyZW50U2xpZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLmN1cnJlbnRTbGlkZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0RG90Q291bnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAwO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIHZhciBwYWdlclF0eSA9IDA7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYWdlclF0eSA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIGlmKCFfLm9wdGlvbnMuYXNOYXZGb3IpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gMSArIE1hdGguY2VpbCgoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFnZXJRdHkgLSAxO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRhcmdldExlZnQsXG4gICAgICAgICAgICB2ZXJ0aWNhbEhlaWdodCxcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIHRhcmdldFNsaWRlO1xuXG4gICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICB2ZXJ0aWNhbEhlaWdodCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IChfLnNsaWRlV2lkdGggKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKHZlcnRpY2FsSGVpZ2h0ICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA+IF8uc2xpZGVDb3VudCAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogXy5zbGlkZVdpZHRoO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogdmVydGljYWxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSAtIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiBfLnNsaWRlV2lkdGgpICogLTEpICsgXy5zbGlkZU9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uJHNsaWRlVHJhY2sud2lkdGgoKSAtIHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgLSB0YXJnZXRTbGlkZS53aWR0aCgpKSAqIC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIGNvdW50ZXIgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IG1heCkge1xuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xuICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGljayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGlkZUNvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkLCBzd2lwZWRTbGlkZSwgY2VudGVyT2Zmc2V0O1xuXG4gICAgICAgIGNlbnRlck9mZnNldCA9IF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlID8gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgOiAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1zbGlkZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHNsaWRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlLm9mZnNldExlZnQgLSBjZW50ZXJPZmZzZXQgKyAoJChzbGlkZSkub3V0ZXJXaWR0aCgpIC8gMikgPiAoXy5zd2lwZUxlZnQgKiAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVkU2xpZGUgPSBzbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXNUcmF2ZXJzZWQgPSBNYXRoLmFicygkKHN3aXBlZFNsaWRlKS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JykgLSBfLmN1cnJlbnRTbGlkZSkgfHwgMTtcblxuICAgICAgICAgICAgcmV0dXJuIHNsaWRlc1RyYXZlcnNlZDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nb1RvID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR29UbyA9IGZ1bmN0aW9uKHNsaWRlLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGluZGV4OiBwYXJzZUludChzbGlkZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZG9udEFuaW1hdGUpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY3JlYXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCEkKF8uJHNsaWRlcikuaGFzQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJykpIHtcblxuICAgICAgICAgICAgJChfLiRzbGlkZXIpLmFkZENsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuXG4gICAgICAgICAgICBfLmJ1aWxkUm93cygpO1xuICAgICAgICAgICAgXy5idWlsZE91dCgpO1xuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICAgICAgXy5zdGFydExvYWQoKTtcbiAgICAgICAgICAgIF8ubG9hZFNsaWRlcigpO1xuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSh0cnVlKTtcbiAgICAgICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjcmVhdGlvbikge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2luaXQnLCBbX10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmluaXRBREEoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdEFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlcy5hZGQoXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hdHRyKCdyb2xlJywgJ2xpc3Rib3gnKTtcblxuICAgICAgICBfLiRzbGlkZXMubm90KF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAgICAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6ICdzbGljay1zbGlkZScgKyBfLmluc3RhbmNlVWlkICsgaSArICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF8uJGRvdHMuYXR0cigncm9sZScsICd0YWJsaXN0JykuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAncm9sZSc6ICdwcmVzZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ25hdmlnYXRpb24nICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpICsgJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCkuYXR0cignYXJpYS1zZWxlY3RlZCcsICd0cnVlJykuZW5kKClcbiAgICAgICAgICAgICAgICAuZmluZCgnYnV0dG9uJykuYXR0cigncm9sZScsICdidXR0b24nKS5lbmQoKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCdkaXYnKS5hdHRyKCdyb2xlJywgJ3Rvb2xiYXInKTtcbiAgICAgICAgfVxuICAgICAgICBfLmFjdGl2YXRlQURBKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0U2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucGF1c2VPbkhvdmVyICkge1xuXG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdzdGFydCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsICQucHJveHkoXy52aXNpYmlsaXR5LCBfKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ub3JpZW50YXRpb25DaGFuZ2UsIF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLnJlc2l6ZSwgXykpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgIC8vRG9udCBzbGlkZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSB0aGUgZm9ybSBmaWVsZHMgYW5kIGFycm93IGtleXMgYXJlIHByZXNzZWRcbiAgICAgICAgaWYoIWV2ZW50LnRhcmdldC50YWdOYW1lLm1hdGNoKCdURVhUQVJFQXxJTlBVVHxTRUxFQ1QnKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAnbmV4dCcgOiAgJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAncHJldmlvdXMnIDogJ25leHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZEltYWdlcyhpbWFnZXNTY29wZSkge1xuXG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtbGF6eScpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBpbWFnZVNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFtfLCBpbWFnZSwgaW1hZ2VTb3VyY2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IE1hdGguY2VpbChyYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VFbmQgPD0gXy5zbGlkZUNvdW50KSByYW5nZUVuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcbiAgICAgICAgbG9hZEltYWdlcyhsb2FkUmFuZ2UpO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoMCwgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZShfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICogLTEpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sb2FkU2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uaW5pdFVJKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ3Byb2dyZXNzaXZlJykge1xuICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubmV4dCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja05leHQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ25leHQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5vcmllbnRhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBhdXNlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGF1c2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG4gICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGxheSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICBfLmZvY3Vzc2VkID0gZmFsc2U7XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucG9zdFNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICFfLnVuc2xpY2tlZCApIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICAgICAgICAgIF8uYW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uaW5pdEFEQSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1ByZXYgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbiggdHJ5Q291bnQgKSB7XG5cbiAgICAgICAgdHJ5Q291bnQgPSB0cnlDb3VudCB8fCAxO1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgICRpbWdzVG9Mb2FkID0gJCggJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyICksXG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIGltYWdlU291cmNlLFxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQ7XG5cbiAgICAgICAgaWYgKCAkaW1nc1RvTG9hZC5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIGltYWdlID0gJGltZ3NUb0xvYWQuZmlyc3QoKTtcbiAgICAgICAgICAgIGltYWdlU291cmNlID0gaW1hZ2UuYXR0cignZGF0YS1sYXp5Jyk7XG4gICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnc3JjJywgaW1hZ2VTb3VyY2UgKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5JylcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZGVkJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG4gICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmICggdHJ5Q291bnQgPCAzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB0cnkgdG8gbG9hZCB0aGUgaW1hZ2UgMyB0aW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICogbGVhdmUgYSBzbGlnaHQgZGVsYXkgc28gd2UgZG9uJ3QgZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqIHNlcnZlcnMgYmxvY2tpbmcgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCggdHJ5Q291bnQgKyAxICk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdhbGxJbWFnZXNMb2FkZWQnLCBbIF8gXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oIGluaXRpYWxpemluZyApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGN1cnJlbnRTbGlkZSwgbGFzdFZpc2libGVJbmRleDtcblxuICAgICAgICBsYXN0VmlzaWJsZUluZGV4ID0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcblxuICAgICAgICAvLyBpbiBub24taW5maW5pdGUgc2xpZGVycywgd2UgZG9uJ3Qgd2FudCB0byBnbyBwYXN0IHRoZVxuICAgICAgICAvLyBsYXN0IHZpc2libGUgaW5kZXguXG4gICAgICAgIGlmKCAhXy5vcHRpb25zLmluZmluaXRlICYmICggXy5jdXJyZW50U2xpZGUgPiBsYXN0VmlzaWJsZUluZGV4ICkpIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gbGFzdFZpc2libGVJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGxlc3Mgc2xpZGVzIHRoYW4gdG8gc2hvdywgZ28gdG8gc3RhcnQuXG4gICAgICAgIGlmICggXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuXG4gICAgICAgIF8uZGVzdHJveSh0cnVlKTtcblxuICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzLCB7IGN1cnJlbnRTbGlkZTogY3VycmVudFNsaWRlIH0pO1xuXG4gICAgICAgIF8uaW5pdCgpO1xuXG4gICAgICAgIGlmKCAhaW5pdGlhbGl6aW5nICkge1xuXG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBjdXJyZW50U2xpZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWdpc3RlckJyZWFrcG9pbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBicmVha3BvaW50LCBjdXJyZW50QnJlYWtwb2ludCwgbCxcbiAgICAgICAgICAgIHJlc3BvbnNpdmVTZXR0aW5ncyA9IF8ub3B0aW9ucy5yZXNwb25zaXZlIHx8IG51bGw7XG5cbiAgICAgICAgaWYgKCAkLnR5cGUocmVzcG9uc2l2ZVNldHRpbmdzKSA9PT0gJ2FycmF5JyAmJiByZXNwb25zaXZlU2V0dGluZ3MubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG5cbiAgICAgICAgICAgIGZvciAoIGJyZWFrcG9pbnQgaW4gcmVzcG9uc2l2ZVNldHRpbmdzICkge1xuXG4gICAgICAgICAgICAgICAgbCA9IF8uYnJlYWtwb2ludHMubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgY3VycmVudEJyZWFrcG9pbnQgPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uYnJlYWtwb2ludDtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zaXZlU2V0dGluZ3MuaGFzT3duUHJvcGVydHkoYnJlYWtwb2ludCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGJyZWFrcG9pbnRzIGFuZCBjdXQgb3V0IGFueSBleGlzdGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmVzIHdpdGggdGhlIHNhbWUgYnJlYWtwb2ludCBudW1iZXIsIHdlIGRvbid0IHdhbnQgZHVwZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5icmVha3BvaW50c1tsXSAmJiBfLmJyZWFrcG9pbnRzW2xdID09PSBjdXJyZW50QnJlYWtwb2ludCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnNwbGljZShsLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50cy5wdXNoKGN1cnJlbnRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbY3VycmVudEJyZWFrcG9pbnRdID0gcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICggXy5vcHRpb25zLm1vYmlsZUZpcnN0ICkgPyBhLWIgOiBiLWE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXMgPVxuICAgICAgICAgICAgXy4kc2xpZGVUcmFja1xuICAgICAgICAgICAgICAgIC5jaGlsZHJlbihfLm9wdGlvbnMuc2xpZGUpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5yZWdpc3RlckJyZWFrcG9pbnRzKCk7XG5cbiAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICBfLnNldHVwSW5maW5pdGUoKTtcbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICBfLmluaXRBcnJvd0V2ZW50cygpO1xuICAgICAgICBfLmJ1aWxkRG90cygpO1xuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uY2xlYW5VcFNsaWRlRXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgXy5wYXVzZWQgPSAhXy5vcHRpb25zLmF1dG9wbGF5O1xuICAgICAgICBfLmF1dG9QbGF5KCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3JlSW5pdCcsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgIT09IF8ud2luZG93V2lkdGgpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChfLndpbmRvd0RlbGF5KTtcbiAgICAgICAgICAgIF8ud2luZG93RGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLndpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgICAgICAgICBpZiggIV8udW5zbGlja2VkICkgeyBfLnNldFBvc2l0aW9uKCk7IH1cbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVtb3ZlU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tSZW1vdmUgPSBmdW5jdGlvbihpbmRleCwgcmVtb3ZlQmVmb3JlLCByZW1vdmVBbGwpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmVtb3ZlQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IDAgOiBfLnNsaWRlQ291bnQgLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAtLWluZGV4IDogaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDwgMSB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiBfLnNsaWRlQ291bnQgLSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmIChyZW1vdmVBbGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oKS5yZW1vdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5lcShpbmRleCkucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0Q1NTID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge30sXG4gICAgICAgICAgICB4LCB5O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IC1wb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgICB4ID0gXy5wb3NpdGlvblByb3AgPT0gJ2xlZnQnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcbiAgICAgICAgeSA9IF8ucG9zaXRpb25Qcm9wID09ICd0b3AnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcblxuICAgICAgICBwb3NpdGlvblByb3BzW18ucG9zaXRpb25Qcm9wXSA9IHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge307XG4gICAgICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICsgeCArICcsICcgKyB5ICsgJyknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJywgJyArIHkgKyAnLCAwcHgpJztcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICgnMHB4ICcgKyBfLm9wdGlvbnMuY2VudGVyUGFkZGluZylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJGxpc3QuaGVpZ2h0KF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IChfLm9wdGlvbnMuY2VudGVyUGFkZGluZyArICcgMHB4JylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8ubGlzdFdpZHRoID0gXy4kbGlzdC53aWR0aCgpO1xuICAgICAgICBfLmxpc3RIZWlnaHQgPSBfLiRsaXN0LmhlaWdodCgpO1xuXG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGggLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2sud2lkdGgoTWF0aC5jZWlsKChfLnNsaWRlV2lkdGggKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aCg1MDAwICogXy5zbGlkZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCk7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmhlaWdodChNYXRoLmNlaWwoKF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykubGVuZ3RoKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVyV2lkdGgodHJ1ZSkgLSBfLiRzbGlkZXMuZmlyc3QoKS53aWR0aCgpO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS53aWR0aChfLnNsaWRlV2lkdGggLSBvZmZzZXQpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRGYWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLnNsaWRlV2lkdGggKiBpbmRleCkgKiAtMTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDIsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5jc3Moe1xuICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMSxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICBfLiRsaXN0LmNzcygnaGVpZ2h0JywgdGFyZ2V0SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRPcHRpb24gPVxuICAgIFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhY2NlcHRzIGFyZ3VtZW50cyBpbiBmb3JtYXQgb2Y6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciBjaGFuZ2luZyBhIHNpbmdsZSBvcHRpb24ncyB2YWx1ZTpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2V0IG9mIHJlc3BvbnNpdmUgb3B0aW9uczpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCAncmVzcG9uc2l2ZScsIFt7fSwgLi4uXSwgcmVmcmVzaCApXG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciB1cGRhdGluZyBtdWx0aXBsZSB2YWx1ZXMgYXQgb25jZSAobm90IHJlc3BvbnNpdmUpXG4gICAgICAgICAqICAgICAuc2xpY2soXCJzZXRPcHRpb25cIiwgeyAnb3B0aW9uJzogdmFsdWUsIC4uLiB9LCByZWZyZXNoIClcbiAgICAgICAgICovXG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBsLCBpdGVtLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoID0gZmFsc2UsIHR5cGU7XG5cbiAgICAgICAgaWYoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdvYmplY3QnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgcmVmcmVzaCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHR5cGUgPSAnbXVsdGlwbGUnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICBpZiAoIGFyZ3VtZW50c1swXSA9PT0gJ3Jlc3BvbnNpdmUnICYmICQudHlwZSggYXJndW1lbnRzWzFdICkgPT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICB0eXBlID0gJ3Jlc3BvbnNpdmUnO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYXJndW1lbnRzWzFdICE9PSAndW5kZWZpbmVkJyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAnc2luZ2xlJztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHR5cGUgPT09ICdzaW5nbGUnICkge1xuXG4gICAgICAgICAgICBfLm9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuXG5cbiAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ211bHRpcGxlJyApIHtcblxuICAgICAgICAgICAgJC5lYWNoKCBvcHRpb24gLCBmdW5jdGlvbiggb3B0LCB2YWwgKSB7XG5cbiAgICAgICAgICAgICAgICBfLm9wdGlvbnNbb3B0XSA9IHZhbDtcblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAncmVzcG9uc2l2ZScgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGl0ZW0gaW4gdmFsdWUgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggJC50eXBlKCBfLm9wdGlvbnMucmVzcG9uc2l2ZSApICE9PSAnYXJyYXknICkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlID0gWyB2YWx1ZVtpdGVtXSBdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBsID0gXy5vcHRpb25zLnJlc3BvbnNpdmUubGVuZ3RoLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSByZXNwb25zaXZlIG9iamVjdCBhbmQgc3BsaWNlIG91dCBkdXBsaWNhdGVzLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSggbCA+PSAwICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnJlc3BvbnNpdmVbbF0uYnJlYWtwb2ludCA9PT0gdmFsdWVbaXRlbV0uYnJlYWtwb2ludCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLnNwbGljZShsLDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGwtLTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUucHVzaCggdmFsdWVbaXRlbV0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHJlZnJlc2ggKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgXy5zZXRIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNldENTUyhfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2V0RmFkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3NldFBvc2l0aW9uJywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UHJvcHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBib2R5U3R5bGUgPSBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG4gICAgICAgIF8ucG9zaXRpb25Qcm9wID0gXy5vcHRpb25zLnZlcnRpY2FsID09PSB0cnVlID8gJ3RvcCcgOiAnbGVmdCc7XG5cbiAgICAgICAgaWYgKF8ucG9zaXRpb25Qcm9wID09PSAndG9wJykge1xuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5XZWJraXRUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5Nb3pUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5tc1RyYW5zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy51c2VDU1MgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmZhZGUgKSB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBfLm9wdGlvbnMuekluZGV4ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnpJbmRleCA8IDMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy56SW5kZXggPSAzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IF8uZGVmYXVsdHMuekluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5PVHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnT1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW8tdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnT1RyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLk1velRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ01velRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1vei10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdNb3pUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS5Nb3pQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS53ZWJraXRUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICd3ZWJraXRUcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy13ZWJraXQtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnd2Via2l0VHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdtc1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1zLXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ21zVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLnRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICYmIF8uYW5pbVR5cGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAndHJhbnNpdGlvbic7XG4gICAgICAgIH1cbiAgICAgICAgXy50cmFuc2Zvcm1zRW5hYmxlZCA9IF8ub3B0aW9ucy51c2VUcmFuc2Zvcm0gJiYgKF8uYW5pbVR5cGUgIT09IG51bGwgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpO1xuICAgIH07XG5cblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRTbGlkZUNsYXNzZXMgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGNlbnRlck9mZnNldCwgYWxsU2xpZGVzLCBpbmRleE9mZnNldCwgcmVtYWluZGVyO1xuXG4gICAgICAgIGFsbFNsaWRlcyA9IF8uJHNsaWRlclxuICAgICAgICAgICAgLmZpbmQoJy5zbGljay1zbGlkZScpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stY3VycmVudCcpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLmVxKGluZGV4KVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jdXJyZW50Jyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY2VudGVyT2Zmc2V0ICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSAxKSAtIGNlbnRlck9mZnNldCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0LCBpbmRleCArIGNlbnRlck9mZnNldCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gY2VudGVyT2Zmc2V0ICsgMSwgaW5kZXhPZmZzZXQgKyBjZW50ZXJPZmZzZXQgKyAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gXy5zbGlkZUNvdW50IC0gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLmVxKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5lcShpbmRleClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkge1xuXG4gICAgICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleCwgaW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFsbFNsaWRlcy5sZW5ndGggPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4IDogaW5kZXg7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgJiYgKF8uc2xpZGVDb3VudCAtIGluZGV4KSA8IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleE9mZnNldCAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gcmVtYWluZGVyKSwgaW5kZXhPZmZzZXQgKyByZW1haW5kZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQsIGluZGV4T2Zmc2V0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcbiAgICAgICAgICAgIF8ubGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKS5maW5kKCdbaWRdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW50ZXJydXB0ID0gZnVuY3Rpb24oIHRvZ2dsZSApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICF0b2dnbGUgKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRvZ2dsZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID1cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5pcygnLnNsaWNrLXNsaWRlJykgP1xuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KSA6XG4gICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnBhcmVudHMoJy5zbGljay1zbGlkZScpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcblxuICAgICAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKGluZGV4KTtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgICAgICAgIF8gPSB0aGlzLCBuYXZUYXJnZXQ7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XG4gICAgICAgIHNsaWRlTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiBfLmdldERvdENvdW50KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0U2xpZGUgPCAwKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50IC0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCArIHRhcmdldFNsaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldFNsaWRlID49IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlIC0gXy5zbGlkZUNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGU7XG4gICAgICAgIH1cblxuICAgICAgICBfLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2JlZm9yZUNoYW5nZScsIFtfLCBfLmN1cnJlbnRTbGlkZSwgYW5pbVNsaWRlXSk7XG5cbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmFzTmF2Rm9yICkge1xuXG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBfLmdldE5hdlRhcmdldCgpO1xuICAgICAgICAgICAgbmF2VGFyZ2V0ID0gbmF2VGFyZ2V0LnNsaWNrKCdnZXRTbGljaycpO1xuXG4gICAgICAgICAgICBpZiAoIG5hdlRhcmdldC5zbGlkZUNvdW50IDw9IG5hdlRhcmdldC5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgICAgICBuYXZUYXJnZXQuc2V0U2xpZGVDbGFzc2VzKF8uY3VycmVudFNsaWRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlT3V0KG9sZFNsaWRlKTtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlKGFuaW1TbGlkZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICAgICAgeERpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAtIF8udG91Y2hPYmplY3QuY3VyWDtcbiAgICAgICAgeURpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSAtIF8udG91Y2hPYmplY3QuY3VyWTtcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgICAgICBzd2lwZUFuZ2xlID0gTWF0aC5yb3VuZChyICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgc3dpcGVBbmdsZSA9IDM2MCAtIE1hdGguYWJzKHN3aXBlQW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDQ1KSAmJiAoc3dpcGVBbmdsZSA+PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMTM1KSAmJiAoc3dpcGVBbmdsZSA8PSAyMjUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMTM1KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG93bic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAndXAnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZUNvdW50LFxuICAgICAgICAgICAgZGlyZWN0aW9uO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuICAgICAgICBfLnNob3VsZENsaWNrID0gKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gMTAgKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3QuY3VyWCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignZWRnZScsIFtfLCBfLnN3aXBlRGlyZWN0aW9uKCkgXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPj0gXy50b3VjaE9iamVjdC5taW5Td2lwZSApIHtcblxuICAgICAgICAgICAgZGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKCBkaXJlY3Rpb24gKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBkaXJlY3Rpb24gIT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBzbGlkZUNvdW50ICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzd2lwZScsIFtfLCBkaXJlY3Rpb24gXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clggKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggXy5jdXJyZW50U2xpZGUgKTtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggOiAxO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0SGVpZ2h0IC8gXy5vcHRpb25zXG4gICAgICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVFbmQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBlZGdlV2FzSGl0ID0gZmFsc2UsXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xuXG4gICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgPyBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgOiBudWxsO1xuXG4gICAgICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJYIC0gXy50b3VjaE9iamVjdC5zdGFydFgsIDIpKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggKiBfLm9wdGlvbnMuZWRnZUZyaWN0aW9uO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrVW5maWx0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJHNsaWRlc0NhY2hlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oZnJvbUJyZWFrcG9pbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCd1bnNsaWNrJywgW18sIGZyb21CcmVha3BvaW50XSk7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXG4gICAgICAgICAgICAhXy5vcHRpb25zLmluZmluaXRlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHNcbiAgICAgICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgICAgIC5lcShNYXRoLmZsb29yKF8uY3VycmVudFNsaWRlIC8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBpZiAoIGRvY3VtZW50W18uaGlkZGVuXSApIHtcblxuICAgICAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4uc2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBsID0gXy5sZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgcmV0O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXztcbiAgICB9O1xuXG59KSk7XG4iLCIhZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuICAvLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxuICB2YXIgRm91bmRhdGlvbiA9IHtcbiAgICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBfcGx1Z2luczoge30sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICAgKi9cbiAgICBfdXVpZHM6IFtdLFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAgICovXG4gICAgcnRsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgICAqL1xuICAgIHBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbiwgbmFtZSkge1xuICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgICB2YXIgY2xhc3NOYW1lID0gbmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKTtcbiAgICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICAgIHZhciBhdHRyTmFtZSA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAgICovXG4gICAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4sIG5hbWUpIHtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICAgIGlmICghcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpKSB7XG4gICAgICAgIHBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLCBwbHVnaW4udXVpZCk7XG4gICAgICB9XG4gICAgICBpZiAoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgIHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAqL1xuICAgICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoJ2luaXQuemYuJyArIHBsdWdpbk5hbWUpO1xuXG4gICAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgKi9cbiAgICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICovXG4gICAgICAudHJpZ2dlcignZGVzdHJveWVkLnpmLicgKyBwbHVnaW5OYW1lKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gcGx1Z2luKSB7XG4gICAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7IC8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAgICovXG4gICAgcmVJbml0OiBmdW5jdGlvbiAocGx1Z2lucykge1xuICAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChpc0pRKSB7XG4gICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uIChwbGdzKSB7XG4gICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtJyArIHAgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgICQoJ1tkYXRhLScgKyBwbHVnaW5zICsgJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgICAqL1xuICAgIEdldFlvRGlnaXRzOiBmdW5jdGlvbiAobGVuZ3RoLCBuYW1lc3BhY2UpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gJy0nICsgbmFtZXNwYWNlIDogJycpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgICAqL1xuICAgIHJlZmxvdzogZnVuY3Rpb24gKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICAgICAgfVxuXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbiAoaSwgbmFtZSkge1xuICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJyArIG5hbWUgKyAnXScpLmFkZEJhY2soJ1tkYXRhLScgKyBuYW1lICsgJ10nKTtcblxuICAgICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIgKyBuYW1lICsgXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICgkZWwuYXR0cignZGF0YS1vcHRpb25zJykpIHtcbiAgICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLnRyaW0oKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24gKCRlbGVtKSB7XG4gICAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICAgIH07XG4gICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgIGVuZDtcblxuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgcmV0dXJuIGVuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICAgIH0sIDEpO1xuICAgICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBGb3VuZGF0aW9uLnV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLFxuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIC8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuICAvLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbiAgLyoqXG4gICAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICAgKi9cbiAgdmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gICAgaWYgKCEkbWV0YS5sZW5ndGgpIHtcbiAgICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICAgIH1cbiAgICBpZiAoJG5vSlMubGVuZ3RoKSB7XG4gICAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7IC8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOyAvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICAgIGlmIChwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgLy9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgLy9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignV2VcXCdyZSBzb3JyeSwgJyArIHR5cGUgKyAnIGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgd2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuICAkLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4gIC8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fCB3aW5kb3dbdnAgKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuICAgIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7XG4gICAgICAgIH0sIG5leHRUaW1lIC0gbm93KTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgICAqL1xuICAgIGlmICghd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgICBub3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9KSgpO1xuICBpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgfVxuXG4gICAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QID8gdGhpcyA6IG9UaGlzLCBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgfVxuICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICAgIHJldHVybiBmQm91bmQ7XG4gICAgfTtcbiAgfVxuICAvLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbiAgZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gICAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgICB2YXIgcmVzdWx0cyA9IGZ1bmNOYW1lUmVnZXguZXhlYyhmbi50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiByZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgICB9IGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwYXJzZVZhbHVlKHN0cikge1xuICAgIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7ZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7ZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIHJldHVybiBzdHI7XG4gIH1cbiAgLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2VcbiAgLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG4gIGZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gIH1cbn0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIEZvdW5kYXRpb24uQm94ID0ge1xuICAgIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gICAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG4gIH07XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICAgKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAgIHRvcCxcbiAgICAgICAgYm90dG9tLFxuICAgICAgICBsZWZ0LFxuICAgICAgICByaWdodDtcblxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgICBib3R0b20gPSBlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcDtcbiAgICAgIHRvcCA9IGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3A7XG4gICAgICBsZWZ0ID0gZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0O1xuICAgICAgcmlnaHQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoICsgcGFyRGltcy5vZmZzZXQubGVmdDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm90dG9tID0gZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wO1xuICAgICAgdG9wID0gZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wO1xuICAgICAgbGVmdCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0O1xuICAgICAgcmlnaHQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGg7XG4gICAgfVxuXG4gICAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICAgIGlmIChsck9ubHkpIHtcbiAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGJPbmx5KSB7XG4gICAgICByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAgICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gICAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KSB7XG4gICAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgICBpZiAoZWxlbSA9PT0gd2luZG93IHx8IGVsZW0gPT09IGRvY3VtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgICB9XG5cbiAgICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICB3aW5ZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luWSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgICAgfSxcbiAgICAgIHBhcmVudERpbXM6IHtcbiAgICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgICAgd2lkdGg6IHdpblJlY3Qud2lkdGgsXG4gICAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgIHRvcDogd2luWSxcbiAgICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRvcCBhbmQgbGVmdCBpbnRlZ2VyIHBpeGVsIHZhbHVlcyBmb3IgZHluYW1pY2FsbHkgcmVuZGVyZWQgZWxlbWVudHMsXG4gICAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gICAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICAgKi9cbiAgZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gICAgdmFyICRlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCAvIDIgLSAkZWxlRGltcy53aWR0aCAvIDIsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogaXNPdmVyZmxvdyA/IGhPZmZzZXQgOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMixcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0IC8gMiAtICRlbGVEaW1zLmhlaWdodCAvIDJcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0ICsgMSxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCArICRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyLFxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMlxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgY2FzZSAncmV2ZWFsIGZ1bGwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3BcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0LFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LGUsbyxpKXt2YXIgcyxoLG4sdyxkPWYodCk7aWYoZSl7dmFyIHI9ZihlKTtoPWQub2Zmc2V0LnRvcCtkLmhlaWdodDw9ci5oZWlnaHQrci5vZmZzZXQudG9wLHM9ZC5vZmZzZXQudG9wPj1yLm9mZnNldC50b3Asbj1kLm9mZnNldC5sZWZ0Pj1yLm9mZnNldC5sZWZ0LHc9ZC5vZmZzZXQubGVmdCtkLndpZHRoPD1yLndpZHRoK3Iub2Zmc2V0LmxlZnR9ZWxzZSBoPWQub2Zmc2V0LnRvcCtkLmhlaWdodDw9ZC53aW5kb3dEaW1zLmhlaWdodCtkLndpbmRvd0RpbXMub2Zmc2V0LnRvcCxzPWQub2Zmc2V0LnRvcD49ZC53aW5kb3dEaW1zLm9mZnNldC50b3Asbj1kLm9mZnNldC5sZWZ0Pj1kLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsdz1kLm9mZnNldC5sZWZ0K2Qud2lkdGg8PWQud2luZG93RGltcy53aWR0aDt2YXIgbD1baCxzLG4sd107cmV0dXJuIG8/bj09PXc9PSEwOmk/cz09PWg9PSEwOmwuaW5kZXhPZighMSk9PT0tMX1mdW5jdGlvbiBmKHQsZSl7aWYodD10Lmxlbmd0aD90WzBdOnQsdD09PXdpbmRvd3x8dD09PWRvY3VtZW50KXRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO3ZhciBmPXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksbz10LnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksaT1kb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLHM9d2luZG93LnBhZ2VZT2Zmc2V0LGg9d2luZG93LnBhZ2VYT2Zmc2V0O3JldHVybnt3aWR0aDpmLndpZHRoLGhlaWdodDpmLmhlaWdodCxvZmZzZXQ6e3RvcDpmLnRvcCtzLGxlZnQ6Zi5sZWZ0K2h9LHBhcmVudERpbXM6e3dpZHRoOm8ud2lkdGgsaGVpZ2h0Om8uaGVpZ2h0LG9mZnNldDp7dG9wOm8udG9wK3MsbGVmdDpvLmxlZnQraH19LHdpbmRvd0RpbXM6e3dpZHRoOmkud2lkdGgsaGVpZ2h0OmkuaGVpZ2h0LG9mZnNldDp7dG9wOnMsbGVmdDpofX19fWZ1bmN0aW9uIG8odCxlLG8saSxzLGgpe3ZhciBuPWYodCksdz1lP2YoZSk6bnVsbDtzd2l0Y2gobyl7Y2FzZVwidG9wXCI6cmV0dXJue2xlZnQ6Rm91bmRhdGlvbi5ydGwoKT93Lm9mZnNldC5sZWZ0LW4ud2lkdGgrdy53aWR0aDp3Lm9mZnNldC5sZWZ0LHRvcDp3Lm9mZnNldC50b3AtKG4uaGVpZ2h0K2kpfTtjYXNlXCJsZWZ0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdC0obi53aWR0aCtzKSx0b3A6dy5vZmZzZXQudG9wfTtjYXNlXCJyaWdodFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzLHRvcDp3Lm9mZnNldC50b3B9O2Nhc2VcImNlbnRlciB0b3BcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgvMi1uLndpZHRoLzIsdG9wOncub2Zmc2V0LnRvcC0obi5oZWlnaHQraSl9O2Nhc2VcImNlbnRlciBib3R0b21cIjpyZXR1cm57bGVmdDpoP3M6dy5vZmZzZXQubGVmdCt3LndpZHRoLzItbi53aWR0aC8yLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX07Y2FzZVwiY2VudGVyIGxlZnRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0LShuLndpZHRoK3MpLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJjZW50ZXIgcmlnaHRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgrcysxLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQvMi1uLmhlaWdodC8yfTtjYXNlXCJjZW50ZXJcIjpyZXR1cm57bGVmdDpuLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQrbi53aW5kb3dEaW1zLndpZHRoLzItbi53aWR0aC8yLHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcCtuLndpbmRvd0RpbXMuaGVpZ2h0LzItbi5oZWlnaHQvMn07Y2FzZVwicmV2ZWFsXCI6cmV0dXJue2xlZnQ6KG4ud2luZG93RGltcy53aWR0aC1uLndpZHRoKS8yLHRvcDpuLndpbmRvd0RpbXMub2Zmc2V0LnRvcCtpfTtjYXNlXCJyZXZlYWwgZnVsbFwiOnJldHVybntsZWZ0Om4ud2luZG93RGltcy5vZmZzZXQubGVmdCx0b3A6bi53aW5kb3dEaW1zLm9mZnNldC50b3B9O2Nhc2VcImxlZnQgYm90dG9tXCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9O2Nhc2VcInJpZ2h0IGJvdHRvbVwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQrdy53aWR0aCtzLW4ud2lkdGgsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfTtkZWZhdWx0OnJldHVybntsZWZ0OkZvdW5kYXRpb24ucnRsKCk/dy5vZmZzZXQubGVmdC1uLndpZHRoK3cud2lkdGg6dy5vZmZzZXQubGVmdCtzLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX19fUZvdW5kYXRpb24uQm94PXtJbU5vdFRvdWNoaW5nWW91OmUsR2V0RGltZW5zaW9uczpmLEdldE9mZnNldHM6b319KGpRdWVyeSk7IiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICB2YXIga2V5Q29kZXMgPSB7XG4gICAgOTogJ1RBQicsXG4gICAgMTM6ICdFTlRFUicsXG4gICAgMjc6ICdFU0NBUEUnLFxuICAgIDMyOiAnU1BBQ0UnLFxuICAgIDM3OiAnQVJST1dfTEVGVCcsXG4gICAgMzg6ICdBUlJPV19VUCcsXG4gICAgMzk6ICdBUlJPV19SSUdIVCcsXG4gICAgNDA6ICdBUlJPV19ET1dOJ1xuICB9O1xuXG4gIHZhciBjb21tYW5kcyA9IHt9O1xuXG4gIHZhciBLZXlib2FyZCA9IHtcbiAgICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgICAqL1xuICAgIHBhcnNlS2V5OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSAnU0hJRlRfJyArIGtleTtcbiAgICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSAnQ1RSTF8nICsga2V5O1xuICAgICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gJ0FMVF8nICsga2V5O1xuXG4gICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgICByZXR1cm4ga2V5O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAgICovXG4gICAgaGFuZGxlS2V5OiBmdW5jdGlvbiAoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgICAgICBjbWRzLFxuICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgZm47XG5cbiAgICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO2Vsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgICB9XG4gICAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICAgKi9cbiAgICBmaW5kRm9jdXNhYmxlOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgIGlmICghJGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAgICovXG5cbiAgICByZWdpc3RlcjogZnVuY3Rpb24gKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgICAqL1xuICAgIHRyYXBGb2N1czogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGxhc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdUQUInKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICRsYXN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlcyB0aGUgdHJhcHBlZCBmb2N1cyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgICAqL1xuICAgIHJlbGVhc2VGb2N1czogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gICAgfVxuICB9O1xuXG4gIC8qXG4gICAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqL1xuICBmdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgICB2YXIgayA9IHt9O1xuICAgIGZvciAodmFyIGtjIGluIGtjcykge1xuICAgICAga1trY3Nba2NdXSA9IGtjc1trY107XG4gICAgfXJldHVybiBrO1xuICB9XG5cbiAgRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihlKXtmdW5jdGlvbiBuKGUpe3ZhciBuPXt9O2Zvcih2YXIgdCBpbiBlKW5bZVt0XV09ZVt0XTtyZXR1cm4gbn12YXIgdD17OTpcIlRBQlwiLDEzOlwiRU5URVJcIiwyNzpcIkVTQ0FQRVwiLDMyOlwiU1BBQ0VcIiwzNzpcIkFSUk9XX0xFRlRcIiwzODpcIkFSUk9XX1VQXCIsMzk6XCJBUlJPV19SSUdIVFwiLDQwOlwiQVJST1dfRE9XTlwifSxvPXt9LHI9e2tleXM6bih0KSxwYXJzZUtleTpmdW5jdGlvbihlKXt2YXIgbj10W2Uud2hpY2h8fGUua2V5Q29kZV18fFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9VcHBlckNhc2UoKTtyZXR1cm4gbj1uLnJlcGxhY2UoL1xcVysvLFwiXCIpLGUuc2hpZnRLZXkmJihuPVwiU0hJRlRfXCIrbiksZS5jdHJsS2V5JiYobj1cIkNUUkxfXCIrbiksZS5hbHRLZXkmJihuPVwiQUxUX1wiK24pLG49bi5yZXBsYWNlKC9fJC8sXCJcIil9LGhhbmRsZUtleTpmdW5jdGlvbihuLHQscil7dmFyIGEsaSxkLGY9b1t0XSx1PXRoaXMucGFyc2VLZXkobik7aWYoIWYpcmV0dXJuIGNvbnNvbGUud2FybihcIkNvbXBvbmVudCBub3QgZGVmaW5lZCFcIik7aWYoYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgZi5sdHI/ZjpGb3VuZGF0aW9uLnJ0bCgpP2UuZXh0ZW5kKHt9LGYubHRyLGYucnRsKTplLmV4dGVuZCh7fSxmLnJ0bCxmLmx0ciksaT1hW3VdLGQ9cltpXSxkJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBkKXt2YXIgbD1kLmFwcGx5KCk7KHIuaGFuZGxlZHx8XCJmdW5jdGlvblwiPT10eXBlb2Ygci5oYW5kbGVkKSYmci5oYW5kbGVkKGwpfWVsc2Uoci51bmhhbmRsZWR8fFwiZnVuY3Rpb25cIj09dHlwZW9mIHIudW5oYW5kbGVkKSYmci51bmhhbmRsZWQoKX0sZmluZEZvY3VzYWJsZTpmdW5jdGlvbihuKXtyZXR1cm4hIW4mJm4uZmluZChcImFbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV1cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuISghZSh0aGlzKS5pcyhcIjp2aXNpYmxlXCIpfHxlKHRoaXMpLmF0dHIoXCJ0YWJpbmRleFwiKTwwKX0pfSxyZWdpc3RlcjpmdW5jdGlvbihlLG4pe29bZV09bn0sdHJhcEZvY3VzOmZ1bmN0aW9uKGUpe3ZhciBuPUZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZShlKSx0PW4uZXEoMCksbz1uLmVxKC0xKTtlLm9uKFwia2V5ZG93bi56Zi50cmFwZm9jdXNcIixmdW5jdGlvbihlKXtlLnRhcmdldD09PW9bMF0mJlwiVEFCXCI9PT1Gb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGUpPyhlLnByZXZlbnREZWZhdWx0KCksdC5mb2N1cygpKTplLnRhcmdldD09PXRbMF0mJlwiU0hJRlRfVEFCXCI9PT1Gb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGUpJiYoZS5wcmV2ZW50RGVmYXVsdCgpLG8uZm9jdXMoKSl9KX0scmVsZWFzZUZvY3VzOmZ1bmN0aW9uKGUpe2Uub2ZmKFwia2V5ZG93bi56Zi50cmFwZm9jdXNcIil9fTtGb3VuZGF0aW9uLktleWJvYXJkPXJ9KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG4gIHZhciBkZWZhdWx0UXVlcmllcyA9IHtcbiAgICAnZGVmYXVsdCc6ICdvbmx5IHNjcmVlbicsXG4gICAgbGFuZHNjYXBlOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICAgcG9ydHJhaXQ6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAgIHJldGluYTogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xuICB9O1xuXG4gIHZhciBNZWRpYVF1ZXJ5ID0ge1xuICAgIHF1ZXJpZXM6IFtdLFxuXG4gICAgY3VycmVudDogJycsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgICAgaWYgKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgdmFsdWU6ICdvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJyArIG5hbWVkUXVlcmllc1trZXldICsgJyknXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgICAgdGhpcy5fd2F0Y2hlcigpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgICAqL1xuICAgIGF0TGVhc3Q6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjaywgZWl0aGVyICdzbWFsbCBvbmx5JyBvciAnc21hbGwnLiBPbWl0dGluZyAnb25seScgZmFsbHMgYmFjayB0byB1c2luZyBhdExlYXN0KCkgbWV0aG9kLlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICAgKi9cbiAgICBpczogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgICAgaWYgKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgICBpZiAodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgICAqL1xuICAgIF9nZXRDdXJyZW50U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1hdGNoZWQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF93YXRjaGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpLFxuICAgICAgICAgICAgY3VycmVudFNpemUgPSBfdGhpcy5jdXJyZW50O1xuXG4gICAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuXG4gICAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbiAgLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuICAvLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxuICB3aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcblxuICAgIHZhciBzdHlsZU1lZGlhID0gd2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhO1xuXG4gICAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICAgIGlmICghc3R5bGVNZWRpYSkge1xuICAgICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICBzY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgICAgICAgaW5mbyA9IG51bGw7XG5cbiAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgc3R5bGUuaWQgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgICBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgaW5mbyA9ICdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgICAgfTtcbiAgICB9O1xuICB9KCkpO1xuXG4gIC8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbiAgZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICAgIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gICAgfVxuXG4gICAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICAgIGlmICghc3RyKSB7XG4gICAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gICAgfVxuXG4gICAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKHJldCwgcGFyYW0pIHtcbiAgICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJldFtrZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlKXt2YXIgdD17fTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZT90OihlPWUudHJpbSgpLnNsaWNlKDEsLTEpKT90PWUuc3BsaXQoXCImXCIpLnJlZHVjZShmdW5jdGlvbihlLHQpe3ZhciBuPXQucmVwbGFjZSgvXFwrL2csXCIgXCIpLnNwbGl0KFwiPVwiKSxyPW5bMF0saT1uWzFdO3JldHVybiByPWRlY29kZVVSSUNvbXBvbmVudChyKSxpPXZvaWQgMD09PWk/bnVsbDpkZWNvZGVVUklDb21wb25lbnQoaSksZS5oYXNPd25Qcm9wZXJ0eShyKT9BcnJheS5pc0FycmF5KGVbcl0pP2Vbcl0ucHVzaChpKTplW3JdPVtlW3JdLGldOmVbcl09aSxlfSx7fSk6dH12YXIgbj17cXVlcmllczpbXSxjdXJyZW50OlwiXCIsX2luaXQ6ZnVuY3Rpb24oKXt2YXIgbixyPXRoaXMsaT1lKFwiLmZvdW5kYXRpb24tbXFcIikuY3NzKFwiZm9udC1mYW1pbHlcIik7bj10KGkpO2Zvcih2YXIgYSBpbiBuKW4uaGFzT3duUHJvcGVydHkoYSkmJnIucXVlcmllcy5wdXNoKHtuYW1lOmEsdmFsdWU6XCJvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogXCIrblthXStcIilcIn0pO3RoaXMuY3VycmVudD10aGlzLl9nZXRDdXJyZW50U2l6ZSgpLHRoaXMuX3dhdGNoZXIoKX0sYXRMZWFzdDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLmdldChlKTtyZXR1cm4hIXQmJndpbmRvdy5tYXRjaE1lZGlhKHQpLm1hdGNoZXN9LGlzOmZ1bmN0aW9uKGUpe3JldHVybiBlPWUudHJpbSgpLnNwbGl0KFwiIFwiKSxlLmxlbmd0aD4xJiZcIm9ubHlcIj09PWVbMV0/ZVswXT09PXRoaXMuX2dldEN1cnJlbnRTaXplKCk6dGhpcy5hdExlYXN0KGVbMF0pfSxnZXQ6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0IGluIHRoaXMucXVlcmllcylpZih0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkodCkpe3ZhciBuPXRoaXMucXVlcmllc1t0XTtpZihlPT09bi5uYW1lKXJldHVybiBuLnZhbHVlfXJldHVybiBudWxsfSxfZ2V0Q3VycmVudFNpemU6ZnVuY3Rpb24oKXtmb3IodmFyIGUsdD0wO3Q8dGhpcy5xdWVyaWVzLmxlbmd0aDt0Kyspe3ZhciBuPXRoaXMucXVlcmllc1t0XTt3aW5kb3cubWF0Y2hNZWRpYShuLnZhbHVlKS5tYXRjaGVzJiYoZT1uKX1yZXR1cm5cIm9iamVjdFwiPT10eXBlb2YgZT9lLm5hbWU6ZX0sX3dhdGNoZXI6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO2Uod2luZG93KS5vbihcInJlc2l6ZS56Zi5tZWRpYXF1ZXJ5XCIsZnVuY3Rpb24oKXt2YXIgbj10Ll9nZXRDdXJyZW50U2l6ZSgpLHI9dC5jdXJyZW50O24hPT1yJiYodC5jdXJyZW50PW4sZSh3aW5kb3cpLnRyaWdnZXIoXCJjaGFuZ2VkLnpmLm1lZGlhcXVlcnlcIixbbixyXSkpfSl9fTtGb3VuZGF0aW9uLk1lZGlhUXVlcnk9bix3aW5kb3cubWF0Y2hNZWRpYXx8KHdpbmRvdy5tYXRjaE1lZGlhPWZ1bmN0aW9uKCl7dmFyIGU9d2luZG93LnN0eWxlTWVkaWF8fHdpbmRvdy5tZWRpYTtpZighZSl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpLG49ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIilbMF0scj1udWxsO3QudHlwZT1cInRleHQvY3NzXCIsdC5pZD1cIm1hdGNobWVkaWFqcy10ZXN0XCIsbiYmbi5wYXJlbnROb2RlJiZuLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHQsbikscj1cImdldENvbXB1dGVkU3R5bGVcImluIHdpbmRvdyYmd2luZG93LmdldENvbXB1dGVkU3R5bGUodCxudWxsKXx8dC5jdXJyZW50U3R5bGUsZT17bWF0Y2hNZWRpdW06ZnVuY3Rpb24oZSl7dmFyIG49XCJAbWVkaWEgXCIrZStcInsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9XCI7cmV0dXJuIHQuc3R5bGVTaGVldD90LnN0eWxlU2hlZXQuY3NzVGV4dD1uOnQudGV4dENvbnRlbnQ9bixcIjFweFwiPT09ci53aWR0aH19fXJldHVybiBmdW5jdGlvbih0KXtyZXR1cm57bWF0Y2hlczplLm1hdGNoTWVkaXVtKHR8fFwiYWxsXCIpLG1lZGlhOnR8fFwiYWxsXCJ9fX0oKSksRm91bmRhdGlvbi5NZWRpYVF1ZXJ5PW59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogTW90aW9uIG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICAgKi9cblxuICB2YXIgaW5pdENsYXNzZXMgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbiAgdmFyIGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG4gIHZhciBNb3Rpb24gPSB7XG4gICAgYW5pbWF0ZUluOiBmdW5jdGlvbiAoZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgICB9LFxuXG4gICAgYW5pbWF0ZU91dDogZnVuY3Rpb24gKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbikge1xuICAgIHZhciBhbmltLFxuICAgICAgICBwcm9nLFxuICAgICAgICBzdGFydCA9IG51bGw7XG4gICAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICBmbi5hcHBseShlbGVtKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmUodHMpIHtcbiAgICAgIGlmICghc3RhcnQpIHN0YXJ0ID0gdHM7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgICBmbi5hcHBseShlbGVtKTtcblxuICAgICAgaWYgKHByb2cgPCBkdXJhdGlvbikge1xuICAgICAgICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gICAqL1xuICBmdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICAgIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICAgIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICAgIHJlc2V0KCk7XG5cbiAgICBlbGVtZW50LmFkZENsYXNzKGFuaW1hdGlvbikuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gICAgfSk7XG5cbiAgICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKS5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gICAgfSk7XG5cbiAgICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gICAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICAgIHJlc2V0KCk7XG4gICAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhpbml0Q2xhc3MgKyAnICcgKyBhY3RpdmVDbGFzcyArICcgJyArIGFuaW1hdGlvbik7XG4gICAgfVxuICB9XG5cbiAgRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbiAgRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKG4pe2Z1bmN0aW9uIGkobixpLGUpe2Z1bmN0aW9uIHQocyl7cnx8KHI9cyksbz1zLXIsZS5hcHBseShpKSxvPG4/YT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQsaSk6KHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhKSxpLnRyaWdnZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKS50cmlnZ2VySGFuZGxlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pKX12YXIgYSxvLHI9bnVsbDtyZXR1cm4gMD09PW4/KGUuYXBwbHkoaSksdm9pZCBpLnRyaWdnZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKS50cmlnZ2VySGFuZGxlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbaV0pKTp2b2lkKGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9ZnVuY3Rpb24gZShpLGUsbyxyKXtmdW5jdGlvbiBzKCl7aXx8ZS5oaWRlKCksdSgpLHImJnIuYXBwbHkoZSl9ZnVuY3Rpb24gdSgpe2VbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uPTAsZS5yZW1vdmVDbGFzcyhkK1wiIFwiK2YrXCIgXCIrbyl9aWYoZT1uKGUpLmVxKDApLGUubGVuZ3RoKXt2YXIgZD1pP3RbMF06dFsxXSxmPWk/YVswXTphWzFdO3UoKSxlLmFkZENsYXNzKG8pLmNzcyhcInRyYW5zaXRpb25cIixcIm5vbmVcIikscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7ZS5hZGRDbGFzcyhkKSxpJiZlLnNob3coKX0pLHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe2VbMF0ub2Zmc2V0V2lkdGgsZS5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJcIikuYWRkQ2xhc3MoZil9KSxlLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZSkscyl9fXZhciB0PVtcIm11aS1lbnRlclwiLFwibXVpLWxlYXZlXCJdLGE9W1wibXVpLWVudGVyLWFjdGl2ZVwiLFwibXVpLWxlYXZlLWFjdGl2ZVwiXSxvPXthbmltYXRlSW46ZnVuY3Rpb24obixpLHQpe2UoITAsbixpLHQpfSxhbmltYXRlT3V0OmZ1bmN0aW9uKG4saSx0KXtlKCExLG4saSx0KX19O0ZvdW5kYXRpb24uTW92ZT1pLEZvdW5kYXRpb24uTW90aW9uPW99KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICB2YXIgTmVzdCA9IHtcbiAgICBGZWF0aGVyOiBmdW5jdGlvbiAobWVudSkge1xuICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICd6Zic7XG5cbiAgICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsgJ3JvbGUnOiAnbWVudWl0ZW0nIH0pLFxuICAgICAgICAgIHN1Yk1lbnVDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudScsXG4gICAgICAgICAgc3ViSXRlbUNsYXNzID0gc3ViTWVudUNsYXNzICsgJy1pdGVtJyxcbiAgICAgICAgICBoYXNTdWJDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudS1wYXJlbnQnO1xuXG4gICAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhoYXNTdWJDbGFzcykuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkc3ViLmFkZENsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRzdWIuYXR0cih7ICdhcmlhLWhpZGRlbic6IHRydWUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgICAkaXRlbS5hZGRDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuO1xuICAgIH0sXG4gICAgQnVybjogZnVuY3Rpb24gKG1lbnUsIHR5cGUpIHtcbiAgICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgc3ViTWVudUNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51JyxcbiAgICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICAgIGhhc1N1YkNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAgIG1lbnUuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgJyArIGhhc1N1YkNsYXNzICsgJyBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmUnKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSk7XG4gICAgfVxuICB9O1xuXG4gIEZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKGUpe3ZhciBhPXtGZWF0aGVyOmZ1bmN0aW9uKGEpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXTpcInpmXCI7YS5hdHRyKFwicm9sZVwiLFwibWVudWJhclwiKTt2YXIgbj1hLmZpbmQoXCJsaVwiKS5hdHRyKHtyb2xlOlwibWVudWl0ZW1cIn0pLGk9XCJpcy1cIit0K1wiLXN1Ym1lbnVcIix1PWkrXCItaXRlbVwiLHM9XCJpcy1cIit0K1wiLXN1Ym1lbnUtcGFyZW50XCI7bi5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9ZSh0aGlzKSxuPWEuY2hpbGRyZW4oXCJ1bFwiKTtuLmxlbmd0aCYmKGEuYWRkQ2xhc3MocykuYXR0cih7XCJhcmlhLWhhc3BvcHVwXCI6ITAsXCJhcmlhLWxhYmVsXCI6YS5jaGlsZHJlbihcImE6Zmlyc3RcIikudGV4dCgpfSksXCJkcmlsbGRvd25cIj09PXQmJmEuYXR0cih7XCJhcmlhLWV4cGFuZGVkXCI6ITF9KSxuLmFkZENsYXNzKFwic3VibWVudSBcIitpKS5hdHRyKHtcImRhdGEtc3VibWVudVwiOlwiXCIscm9sZTpcIm1lbnVcIn0pLFwiZHJpbGxkb3duXCI9PT10JiZuLmF0dHIoe1wiYXJpYS1oaWRkZW5cIjohMH0pKSxhLnBhcmVudChcIltkYXRhLXN1Ym1lbnVdXCIpLmxlbmd0aCYmYS5hZGRDbGFzcyhcImlzLXN1Ym1lbnUtaXRlbSBcIit1KX0pfSxCdXJuOmZ1bmN0aW9uKGUsYSl7dmFyIHQ9XCJpcy1cIithK1wiLXN1Ym1lbnVcIixuPXQrXCItaXRlbVwiLGk9XCJpcy1cIithK1wiLXN1Ym1lbnUtcGFyZW50XCI7ZS5maW5kKFwiPmxpLCAubWVudSwgLm1lbnUgPiBsaVwiKS5yZW1vdmVDbGFzcyh0K1wiIFwiK24rXCIgXCIraStcIiBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVcIikucmVtb3ZlQXR0cihcImRhdGEtc3VibWVudVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJcIil9fTtGb3VuZGF0aW9uLk5lc3Q9YX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLFxuICAgICAgICAvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgICByZW1haW4gPSAtMSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIHRpbWVyO1xuXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVtYWluID0gLTE7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5maW5pdGUpIHtcbiAgICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7IC8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgICB9XG4gICAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9LCByZW1haW4pO1xuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnN0YXJ0LnpmLicgKyBuYW1lU3BhY2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICAgIGVsZW0udHJpZ2dlcigndGltZXJwYXVzZWQuemYuJyArIG5hbWVTcGFjZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAgICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gICAqL1xuICBmdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaW1hZ2VzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IDQgfHwgdGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICB9XG4gICAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgKHNyYy5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICAgIHVubG9hZGVkLS07XG4gICAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBGb3VuZGF0aW9uLlRpbWVyID0gVGltZXI7XG4gIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LGUsaSl7dmFyIGEscyxuPXRoaXMscj1lLmR1cmF0aW9uLG89T2JqZWN0LmtleXModC5kYXRhKCkpWzBdfHxcInRpbWVyXCIsdT0tMTt0aGlzLmlzUGF1c2VkPSExLHRoaXMucmVzdGFydD1mdW5jdGlvbigpe3U9LTEsY2xlYXJUaW1lb3V0KHMpLHRoaXMuc3RhcnQoKX0sdGhpcy5zdGFydD1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITEsY2xlYXJUaW1lb3V0KHMpLHU9dTw9MD9yOnUsdC5kYXRhKFwicGF1c2VkXCIsITEpLGE9RGF0ZS5ub3coKSxzPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmluZmluaXRlJiZuLnJlc3RhcnQoKSxpJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBpJiZpKCl9LHUpLHQudHJpZ2dlcihcInRpbWVyc3RhcnQuemYuXCIrbyl9LHRoaXMucGF1c2U9ZnVuY3Rpb24oKXt0aGlzLmlzUGF1c2VkPSEwLGNsZWFyVGltZW91dChzKSx0LmRhdGEoXCJwYXVzZWRcIiwhMCk7dmFyIGU9RGF0ZS5ub3coKTt1LT1lLWEsdC50cmlnZ2VyKFwidGltZXJwYXVzZWQuemYuXCIrbyl9fWZ1bmN0aW9uIGkoZSxpKXtmdW5jdGlvbiBhKCl7cy0tLDA9PT1zJiZpKCl9dmFyIHM9ZS5sZW5ndGg7MD09PXMmJmkoKSxlLmVhY2goZnVuY3Rpb24oKXtpZih0aGlzLmNvbXBsZXRlfHw0PT09dGhpcy5yZWFkeVN0YXRlfHxcImNvbXBsZXRlXCI9PT10aGlzLnJlYWR5U3RhdGUpYSgpO2Vsc2V7dmFyIGU9dCh0aGlzKS5hdHRyKFwic3JjXCIpO3QodGhpcykuYXR0cihcInNyY1wiLGUrKGUuaW5kZXhPZihcIj9cIik+PTA/XCImXCI6XCI/XCIpKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKSx0KHRoaXMpLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2EoKX0pfX0pfUZvdW5kYXRpb24uVGltZXI9ZSxGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkPWl9KGpRdWVyeSk7IiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uICgkKSB7XG5cblx0JC5zcG90U3dpcGUgPSB7XG5cdFx0dmVyc2lvbjogJzEuMC4wJyxcblx0XHRlbmFibGVkOiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0cHJldmVudERlZmF1bHQ6IGZhbHNlLFxuXHRcdG1vdmVUaHJlc2hvbGQ6IDc1LFxuXHRcdHRpbWVUaHJlc2hvbGQ6IDIwMFxuXHR9O1xuXG5cdHZhciBzdGFydFBvc1gsXG5cdCAgICBzdGFydFBvc1ksXG5cdCAgICBzdGFydFRpbWUsXG5cdCAgICBlbGFwc2VkVGltZSxcblx0ICAgIGlzTW92aW5nID0gZmFsc2U7XG5cblx0ZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcblx0XHQvLyAgYWxlcnQodGhpcyk7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuXHRcdGlzTW92aW5nID0gZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG5cdFx0aWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHRcdGlmIChpc01vdmluZykge1xuXHRcdFx0dmFyIHggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG5cdFx0XHR2YXIgeSA9IGUudG91Y2hlc1swXS5wYWdlWTtcblx0XHRcdHZhciBkeCA9IHN0YXJ0UG9zWCAtIHg7XG5cdFx0XHR2YXIgZHkgPSBzdGFydFBvc1kgLSB5O1xuXHRcdFx0dmFyIGRpcjtcblx0XHRcdGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWU7XG5cdFx0XHRpZiAoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuXHRcdFx0XHRkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuXHRcdFx0fVxuXHRcdFx0Ly8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG5cdFx0XHQvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG5cdFx0XHQvLyB9XG5cdFx0XHRpZiAoZGlyKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0b25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuXHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKCdzd2lwZScgKyBkaXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG5cdFx0aWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuXHRcdFx0c3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuXHRcdFx0c3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuXHRcdFx0aXNNb3ZpbmcgPSB0cnVlO1xuXHRcdFx0c3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHR9XG5cblx0ZnVuY3Rpb24gdGVhcmRvd24oKSB7XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcblx0fVxuXG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuXHQkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuXHRcdCQuZXZlbnQuc3BlY2lhbFsnc3dpcGUnICsgdGhpc10gPSB7IHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQodGhpcykub24oJ3N3aXBlJywgJC5ub29wKTtcblx0XHRcdH0gfTtcblx0fSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uICgkKSB7XG5cdCQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuXHRcdFx0JChlbCkuYmluZCgndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxuXHRcdFx0XHQvL29iamVjdCBpcyBub3JtYWxpemVkIHRvIHczYyBzcGVjcyBhbmQgZG9lcyBub3QgcHJvdmlkZSB0aGUgVG91Y2hMaXN0XG5cdFx0XHRcdGhhbmRsZVRvdWNoKGV2ZW50KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHR2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuXHRcdFx0ICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcblx0XHRcdCAgICBldmVudFR5cGVzID0ge1xuXHRcdFx0XHR0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcblx0XHRcdFx0dG91Y2htb3ZlOiAnbW91c2Vtb3ZlJyxcblx0XHRcdFx0dG91Y2hlbmQ6ICdtb3VzZXVwJ1xuXHRcdFx0fSxcblx0XHRcdCAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcblx0XHRcdCAgICBzaW11bGF0ZWRFdmVudDtcblxuXHRcdFx0aWYgKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcblx0XHRcdFx0XHQnYnViYmxlcyc6IHRydWUsXG5cdFx0XHRcdFx0J2NhbmNlbGFibGUnOiB0cnVlLFxuXHRcdFx0XHRcdCdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcblx0XHRcdFx0XHQnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG5cdFx0XHRcdFx0J2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuXHRcdFx0XHRcdCdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcblx0XHRcdFx0c2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCAvKmxlZnQqLywgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG5cdFx0fTtcblx0fTtcbn0oalF1ZXJ5KTtcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5Kipcbi8vKipuZWVkIHRvIHJlY3JlYXRlIGZ1bmN0aW9uYWxpdHkqKlxuLy8qKmFuZCB0cnkgdG8gaW1wcm92ZSBpZiBwb3NzaWJsZSoqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLyogUmVtb3ZpbmcgdGhlIGpRdWVyeSBmdW5jdGlvbiAqKioqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuKGZ1bmN0aW9uKCAkLCB3aW5kb3csIHVuZGVmaW5lZCApIHtcblxuXHR2YXIgJGRvY3VtZW50ID0gJCggZG9jdW1lbnQgKSxcblx0XHQvLyBzdXBwb3J0VG91Y2ggPSAkLm1vYmlsZS5zdXBwb3J0LnRvdWNoLFxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxuXHRcdHRvdWNoU3RvcEV2ZW50ID0gJ3RvdWNoZW5kJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaGVuZFwiIDogXCJtb3VzZXVwXCIsXG5cdFx0dG91Y2hNb3ZlRXZlbnQgPSAndG91Y2htb3ZlJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCI7XG5cblx0Ly8gc2V0dXAgbmV3IGV2ZW50IHNob3J0Y3V0c1xuXHQkLmVhY2goICggXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCBcIiArXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuXG5cdFx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIGZuICkge1xuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdFx0fTtcblxuXHRcdC8vIGpRdWVyeSA8IDEuOFxuXHRcdGlmICggJC5hdHRyRm4gKSB7XG5cdFx0XHQkLmF0dHJGblsgbmFtZSBdID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XG5cdFx0dmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG5cdFx0ZXZlbnQudHlwZSA9IGV2ZW50VHlwZTtcblx0XHRpZiAoIGJ1YmJsZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggZXZlbnQsIHVuZGVmaW5lZCwgb2JqICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xuXHRcdH1cblx0XHRldmVudC50eXBlID0gb3JpZ2luYWxUeXBlO1xuXHR9XG5cblx0Ly8gYWxzbyBoYW5kbGVzIHRhcGhvbGRcblxuXHQvLyBBbHNvIGhhbmRsZXMgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0XG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHtcblxuXHRcdC8vIE1vcmUgdGhhbiB0aGlzIGhvcml6b250YWwgZGlzcGxhY2VtZW50LCBhbmQgd2Ugd2lsbCBzdXBwcmVzcyBzY3JvbGxpbmcuXG5cdFx0c2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZDogMzAsXG5cblx0XHQvLyBNb3JlIHRpbWUgdGhhbiB0aGlzLCBhbmQgaXQgaXNuJ3QgYSBzd2lwZS5cblx0XHRkdXJhdGlvblRocmVzaG9sZDogMTAwMCxcblxuXHRcdC8vIFN3aXBlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbW9yZSB0aGFuIHRoaXMuXG5cdFx0aG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdC8vIFN3aXBlIHZlcnRpY2FsIGRpc3BsYWNlbWVudCBtdXN0IGJlIGxlc3MgdGhhbiB0aGlzLlxuXHRcdHZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Z2V0TG9jYXRpb246IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgd2luUGFnZVggPSB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuXHRcdFx0XHR4ID0gZXZlbnQuY2xpZW50WCxcblx0XHRcdFx0eSA9IGV2ZW50LmNsaWVudFk7XG5cblx0XHRcdGlmICggZXZlbnQucGFnZVkgPT09IDAgJiYgTWF0aC5mbG9vciggeSApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVkgKSB8fFxuXHRcdFx0XHRldmVudC5wYWdlWCA9PT0gMCAmJiBNYXRoLmZsb29yKCB4ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIGlPUzQgY2xpZW50WC9jbGllbnRZIGhhdmUgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHQvLyBpbiBwYWdlWC9wYWdlWS4gV2hpbGUgcGFnZVgvcGFnZS8gaGF2ZSB0aGUgdmFsdWUgMFxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0geSAtIHdpblBhZ2VZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA8ICggZXZlbnQucGFnZVkgLSB3aW5QYWdlWSkgfHwgeCA8ICggZXZlbnQucGFnZVggLSB3aW5QYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIFNvbWUgQW5kcm9pZCBicm93c2VycyBoYXZlIHRvdGFsbHkgYm9ndXMgdmFsdWVzIGZvciBjbGllbnRYL1lcblx0XHRcdFx0Ly8gd2hlbiBzY3JvbGxpbmcvem9vbWluZyBhIHBhZ2UuIERldGVjdGFibGUgc2luY2UgY2xpZW50WC9jbGllbnRZXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcblx0XHRcdFx0eCA9IGV2ZW50LnBhZ2VYIC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSBldmVudC5wYWdlWSAtIHdpblBhZ2VZO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4LFxuXHRcdFx0XHR5OiB5XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXSxcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU3dpcGU6IGZ1bmN0aW9uKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApIHtcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDEgXSAtIHN0b3AuY29vcmRzWyAxIF0gKSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS52ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkICkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcblxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIFwic3dpcGVcIiwgJC5FdmVudCggXCJzd2lwZVwiLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9KSwgdHJ1ZSApO1xuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHQvLyBUaGlzIHNlcnZlcyBhcyBhIGZsYWcgdG8gZW5zdXJlIHRoYXQgYXQgbW9zdCBvbmUgc3dpcGUgZXZlbnQgZXZlbnQgaXNcblx0XHQvLyBpbiB3b3JrIGF0IGFueSBnaXZlbiB0aW1lXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcblxuXHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsXG5cdFx0XHRcdHRoaXNPYmplY3QgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIHRoaXNPYmplY3QgKSxcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xuXG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgZXZlbnRzIGRhdGEgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWRkIHRoZSBzd2lwZSBjb250ZXh0XG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoICFldmVudHMgKSB7XG5cdFx0XHRcdGV2ZW50cyA9IHsgbGVuZ3RoOiAwIH07XG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xuXHRcdFx0fVxuXHRcdFx0ZXZlbnRzLmxlbmd0aCsrO1xuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcblxuXHRcdFx0Y29udGV4dC5zdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBCYWlsIGlmIHdlJ3JlIGFscmVhZHkgd29ya2luZyBvbiBhIHN3aXBlIGV2ZW50XG5cdFx0XHRcdGlmICggJC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IHRydWU7XG5cblx0XHRcdFx0dmFyIHN0b3AsXG5cdFx0XHRcdFx0c3RhcnQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RhcnQoIGV2ZW50ICksXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdFx0XHRlbWl0dGVkID0gZmFsc2U7XG5cblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXJ0IHx8IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHN0b3AgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RvcCggZXZlbnQgKTtcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5oYW5kbGVTd2lwZSggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKTtcblx0XHRcdFx0XHRcdGlmICggZW1pdHRlZCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZ1xuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb250ZXh0LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0XHRcdGNvbnRleHQubW92ZSA9IG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JGRvY3VtZW50Lm9uKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlIClcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHR9O1xuXHRcdFx0JHRoaXMub24oIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdH0sXG5cblx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xuXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcblx0XHRcdFx0Y29udGV4dCA9IGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZGVsZXRlIGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xuXHRcdFx0XHRpZiAoIGV2ZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29udGV4dCApIHtcblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0YXJ0ICkge1xuXHRcdFx0XHRcdCQoIHRoaXMgKS5vZmYoIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5tb3ZlICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RvcCApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdCQuZWFjaCh7XG5cdFx0c3dpcGVsZWZ0OiBcInN3aXBlLmxlZnRcIixcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcblx0fSwgZnVuY3Rpb24oIGV2ZW50LCBzb3VyY2VFdmVudCApIHtcblxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLmJpbmQoIHNvdXJjZUV2ZW50LCAkLm5vb3AgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS51bmJpbmQoIHNvdXJjZUV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59KSggalF1ZXJ5LCB0aGlzICk7XG4qLyIsIiFmdW5jdGlvbihlKXtmdW5jdGlvbiB0KCl7dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsbiksdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIix0KSxyPSExfWZ1bmN0aW9uIG4obil7aWYoZS5zcG90U3dpcGUucHJldmVudERlZmF1bHQmJm4ucHJldmVudERlZmF1bHQoKSxyKXt2YXIgbyxpPW4udG91Y2hlc1swXS5wYWdlWCxjPShuLnRvdWNoZXNbMF0ucGFnZVkscy1pKTtoPShuZXcgRGF0ZSkuZ2V0VGltZSgpLXUsTWF0aC5hYnMoYyk+PWUuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQmJmg8PWUuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQmJihvPWM+MD9cImxlZnRcIjpcInJpZ2h0XCIpLG8mJihuLnByZXZlbnREZWZhdWx0KCksdC5jYWxsKHRoaXMpLGUodGhpcykudHJpZ2dlcihcInN3aXBlXCIsbykudHJpZ2dlcihcInN3aXBlXCIrbykpfX1mdW5jdGlvbiBvKGUpezE9PWUudG91Y2hlcy5sZW5ndGgmJihzPWUudG91Y2hlc1swXS5wYWdlWCxjPWUudG91Y2hlc1swXS5wYWdlWSxyPSEwLHU9KG5ldyBEYXRlKS5nZXRUaW1lKCksdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsbiwhMSksdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIix0LCExKSl9ZnVuY3Rpb24gaSgpe3RoaXMuYWRkRXZlbnRMaXN0ZW5lciYmdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLG8sITEpfWUuc3BvdFN3aXBlPXt2ZXJzaW9uOlwiMS4wLjBcIixlbmFibGVkOlwib250b3VjaHN0YXJ0XCJpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQscHJldmVudERlZmF1bHQ6ITEsbW92ZVRocmVzaG9sZDo3NSx0aW1lVGhyZXNob2xkOjIwMH07dmFyIHMsYyx1LGgscj0hMTtlLmV2ZW50LnNwZWNpYWwuc3dpcGU9e3NldHVwOml9LGUuZWFjaChbXCJsZWZ0XCIsXCJ1cFwiLFwiZG93blwiLFwicmlnaHRcIl0sZnVuY3Rpb24oKXtlLmV2ZW50LnNwZWNpYWxbXCJzd2lwZVwiK3RoaXNdPXtzZXR1cDpmdW5jdGlvbigpe2UodGhpcykub24oXCJzd2lwZVwiLGUubm9vcCl9fX0pfShqUXVlcnkpLCFmdW5jdGlvbihlKXtlLmZuLmFkZFRvdWNoPWZ1bmN0aW9uKCl7dGhpcy5lYWNoKGZ1bmN0aW9uKG4sbyl7ZShvKS5iaW5kKFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWxcIixmdW5jdGlvbigpe3QoZXZlbnQpfSl9KTt2YXIgdD1mdW5jdGlvbihlKXt2YXIgdCxuPWUuY2hhbmdlZFRvdWNoZXMsbz1uWzBdLGk9e3RvdWNoc3RhcnQ6XCJtb3VzZWRvd25cIix0b3VjaG1vdmU6XCJtb3VzZW1vdmVcIix0b3VjaGVuZDpcIm1vdXNldXBcIn0scz1pW2UudHlwZV07XCJNb3VzZUV2ZW50XCJpbiB3aW5kb3cmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50P3Q9bmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHMse2J1YmJsZXM6ITAsY2FuY2VsYWJsZTohMCxzY3JlZW5YOm8uc2NyZWVuWCxzY3JlZW5ZOm8uc2NyZWVuWSxjbGllbnRYOm8uY2xpZW50WCxjbGllbnRZOm8uY2xpZW50WX0pOih0PWRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudFwiKSx0LmluaXRNb3VzZUV2ZW50KHMsITAsITAsd2luZG93LDEsby5zY3JlZW5YLG8uc2NyZWVuWSxvLmNsaWVudFgsby5jbGllbnRZLCExLCExLCExLCExLDAsbnVsbCkpLG8udGFyZ2V0LmRpc3BhdGNoRXZlbnQodCl9fX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIHZhciBNdXRhdGlvbk9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSgpO1xuXG4gIHZhciB0cmlnZ2VycyA9IGZ1bmN0aW9uIChlbCwgdHlwZSkge1xuICAgIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgJCgnIycgKyBpZClbdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKHR5cGUgKyAnLnpmLnRyaWdnZXInLCBbZWxdKTtcbiAgICB9KTtcbiAgfTtcbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbiAoKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbiAgfSk7XG5cbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4gICQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB2YXIgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gICAgaWYgKGFuaW1hdGlvbiAhPT0gJycpIHtcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAgICQoJyMnICsgaWQpLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG4gIH0pO1xuXG4gIC8qKlxuICAqIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqL1xuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY2hlY2tMaXN0ZW5lcnMoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gICAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgICByZXNpemVMaXN0ZW5lcigpO1xuICAgIHNjcm9sbExpc3RlbmVyKCk7XG4gICAgbXV0YXRlTGlzdGVuZXIoKTtcbiAgICBjbG9zZW1lTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbiAgZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICAgIGlmIChwbHVnaW5OYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh5ZXRpQm94ZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gJ2Nsb3NlbWUuemYuJyArIG5hbWU7XG4gICAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uIChlLCBwbHVnaW5JZCkge1xuICAgICAgICB2YXIgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgICAgdmFyIHBsdWdpbnMgPSAkKCdbZGF0YS0nICsgcGx1Z2luICsgJ10nKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJyArIHBsdWdpbklkICsgJ1wiXScpO1xuXG4gICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICB2YXIgdGltZXIgPSB2b2lkIDAsXG4gICAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgICBpZiAoJG5vZGVzLmxlbmd0aCkge1xuICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKS5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgIGlmICghTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgLy9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7IC8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIHZhciB0aW1lciA9IHZvaWQgMCxcbiAgICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsgLy9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG11dGF0ZUxpc3RlbmVyKGRlYm91bmNlKSB7XG4gICAgdmFyICRub2RlcyA9ICQoJ1tkYXRhLW11dGF0ZV0nKTtcbiAgICBpZiAoJG5vZGVzLmxlbmd0aCAmJiBNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRlIGV2ZW50XG4gICAgICAvL25vIElFIDkgb3IgMTBcbiAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAgIC8vZWxlbWVudCBjYWxsYmFja1xuICAgIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cbiAgICAgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcbiAgICAgICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuICAgICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuICAgICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsIFwibXV0YXRlXCIpO1xuICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBbUEhdXG4gIC8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG4gIEZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbiAgLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4gIC8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG59KGpRdWVyeSk7XG5cbi8vIGZ1bmN0aW9uIGRvbU11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2UpIHtcbi8vICAgLy8gISEhIFRoaXMgaXMgY29taW5nIHNvb24gYW5kIG5lZWRzIG1vcmUgd29yazsgbm90IGFjdGl2ZSAgISEhIC8vXG4vLyAgIHZhciB0aW1lcixcbi8vICAgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1tdXRhdGVdJyk7XG4vLyAgIC8vXG4vLyAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbi8vICAgICAvLyB2YXIgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4vLyAgICAgLy8gICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbi8vICAgICAvLyAgIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgLy8gICAgIGlmIChwcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbi8vICAgICAvLyAgICAgICByZXR1cm4gd2luZG93W3ByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInXTtcbi8vICAgICAvLyAgICAgfVxuLy8gICAgIC8vICAgfVxuLy8gICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgIC8vIH0oKSk7XG4vL1xuLy9cbi8vICAgICAvL2ZvciB0aGUgYm9keSwgd2UgbmVlZCB0byBsaXN0ZW4gZm9yIGFsbCBjaGFuZ2VzIGVmZmVjdGluZyB0aGUgc3R5bGUgYW5kIGNsYXNzIGF0dHJpYnV0ZXNcbi8vICAgICB2YXIgYm9keU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoYm9keU11dGF0aW9uKTtcbi8vICAgICBib2R5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6dHJ1ZSwgYXR0cmlidXRlRmlsdGVyOltcInN0eWxlXCIsIFwiY2xhc3NcIl19KTtcbi8vXG4vL1xuLy8gICAgIC8vYm9keSBjYWxsYmFja1xuLy8gICAgIGZ1bmN0aW9uIGJvZHlNdXRhdGlvbihtdXRhdGUpIHtcbi8vICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBtdXRhdGlvbiBldmVudFxuLy8gICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cbi8vXG4vLyAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyAgICAgICAgIGJvZHlPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4vLyAgICAgICAgICQoJ1tkYXRhLW11dGF0ZV0nKS5hdHRyKCdkYXRhLWV2ZW50cycsXCJtdXRhdGVcIik7XG4vLyAgICAgICB9LCBkZWJvdW5jZSB8fCAxNTApO1xuLy8gICAgIH1cbi8vICAgfVxuLy8gfSIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7bygpLGEoKSxpKCksbigpLHIoKX1mdW5jdGlvbiByKGUpe3ZhciByPXQoXCJbZGF0YS15ZXRpLWJveF1cIiksYT1bXCJkcm9wZG93blwiLFwidG9vbHRpcFwiLFwicmV2ZWFsXCJdO2lmKGUmJihcInN0cmluZ1wiPT10eXBlb2YgZT9hLnB1c2goZSk6XCJvYmplY3RcIj09dHlwZW9mIGUmJlwic3RyaW5nXCI9PXR5cGVvZiBlWzBdP2EuY29uY2F0KGUpOmNvbnNvbGUuZXJyb3IoXCJQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzXCIpKSxyLmxlbmd0aCl7dmFyIGk9YS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuXCJjbG9zZW1lLnpmLlwiK3R9KS5qb2luKFwiIFwiKTt0KHdpbmRvdykub2ZmKGkpLm9uKGksZnVuY3Rpb24oZSxyKXt2YXIgYT1lLm5hbWVzcGFjZS5zcGxpdChcIi5cIilbMF0saT10KFwiW2RhdGEtXCIrYStcIl1cIikubm90KCdbZGF0YS15ZXRpLWJveD1cIicrcisnXCJdJyk7aS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTtlLnRyaWdnZXJIYW5kbGVyKFwiY2xvc2UuemYudHJpZ2dlclwiLFtlXSl9KX0pfX1mdW5jdGlvbiBhKGUpe3ZhciByPXZvaWQgMCxhPXQoXCJbZGF0YS1yZXNpemVdXCIpO2EubGVuZ3RoJiZ0KHdpbmRvdykub2ZmKFwicmVzaXplLnpmLnRyaWdnZXJcIikub24oXCJyZXNpemUuemYudHJpZ2dlclwiLGZ1bmN0aW9uKGkpe3ImJmNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtnfHxhLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwicmVzaXplbWUuemYudHJpZ2dlclwiKX0pLGEuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJyZXNpemVcIil9LGV8fDEwKX0pfWZ1bmN0aW9uIGkoZSl7dmFyIHI9dm9pZCAwLGE9dChcIltkYXRhLXNjcm9sbF1cIik7YS5sZW5ndGgmJnQod2luZG93KS5vZmYoXCJzY3JvbGwuemYudHJpZ2dlclwiKS5vbihcInNjcm9sbC56Zi50cmlnZ2VyXCIsZnVuY3Rpb24oaSl7ciYmY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe2d8fGEuZWFjaChmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlckhhbmRsZXIoXCJzY3JvbGxtZS56Zi50cmlnZ2VyXCIpfSksYS5hdHRyKFwiZGF0YS1ldmVudHNcIixcInNjcm9sbFwiKX0sZXx8MTApfSl9ZnVuY3Rpb24gbihlKXt2YXIgcj10KFwiW2RhdGEtbXV0YXRlXVwiKTtyLmxlbmd0aCYmZyYmci5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIil9KX1mdW5jdGlvbiBvKCl7aWYoIWcpcmV0dXJuITE7dmFyIGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV1cIikscj1mdW5jdGlvbihlKXt2YXIgcj10KGVbMF0udGFyZ2V0KTtzd2l0Y2goZVswXS50eXBlKXtjYXNlXCJhdHRyaWJ1dGVzXCI6XCJzY3JvbGxcIj09PXIuYXR0cihcImRhdGEtZXZlbnRzXCIpJiZcImRhdGEtZXZlbnRzXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJnIudHJpZ2dlckhhbmRsZXIoXCJzY3JvbGxtZS56Zi50cmlnZ2VyXCIsW3Isd2luZG93LnBhZ2VZT2Zmc2V0XSksXCJyZXNpemVcIj09PXIuYXR0cihcImRhdGEtZXZlbnRzXCIpJiZcImRhdGEtZXZlbnRzXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJnIudHJpZ2dlckhhbmRsZXIoXCJyZXNpemVtZS56Zi50cmlnZ2VyXCIsW3JdKSxcInN0eWxlXCI9PT1lWzBdLmF0dHJpYnV0ZU5hbWUmJihyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpLHIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIsW3IuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKSk7YnJlYWs7Y2FzZVwiY2hpbGRMaXN0XCI6ci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKSxyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiLFtyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7YnJlYWs7ZGVmYXVsdDpyZXR1cm4hMX19O2lmKGUubGVuZ3RoKWZvcih2YXIgYT0wO2E8PWUubGVuZ3RoLTE7YSsrKXt2YXIgaT1uZXcgZyhyKTtpLm9ic2VydmUoZVthXSx7YXR0cmlidXRlczohMCxjaGlsZExpc3Q6ITAsY2hhcmFjdGVyRGF0YTohMSxzdWJ0cmVlOiEwLGF0dHJpYnV0ZUZpbHRlcjpbXCJkYXRhLWV2ZW50c1wiLFwic3R5bGVcIl19KX19dmFyIGc9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9W1wiV2ViS2l0XCIsXCJNb3pcIixcIk9cIixcIk1zXCIsXCJcIl0sZT0wO2U8dC5sZW5ndGg7ZSsrKWlmKHRbZV0rXCJNdXRhdGlvbk9ic2VydmVyXCJpbiB3aW5kb3cpcmV0dXJuIHdpbmRvd1t0W2VdK1wiTXV0YXRpb25PYnNlcnZlclwiXTtyZXR1cm4hMX0oKSxzPWZ1bmN0aW9uKGUscil7ZS5kYXRhKHIpLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3QoXCIjXCIrYSlbXCJjbG9zZVwiPT09cj9cInRyaWdnZXJcIjpcInRyaWdnZXJIYW5kbGVyXCJdKHIrXCIuemYudHJpZ2dlclwiLFtlXSl9KX07dChkb2N1bWVudCkub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS1vcGVuXVwiLGZ1bmN0aW9uKCl7cyh0KHRoaXMpLFwib3BlblwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xpY2suemYudHJpZ2dlclwiLFwiW2RhdGEtY2xvc2VdXCIsZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLmRhdGEoXCJjbG9zZVwiKTtlP3ModCh0aGlzKSxcImNsb3NlXCIpOnQodGhpcykudHJpZ2dlcihcImNsb3NlLnpmLnRyaWdnZXJcIil9KSx0KGRvY3VtZW50KS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZV1cIixmdW5jdGlvbigpe3ZhciBlPXQodGhpcykuZGF0YShcInRvZ2dsZVwiKTtlP3ModCh0aGlzKSxcInRvZ2dsZVwiKTp0KHRoaXMpLnRyaWdnZXIoXCJ0b2dnbGUuemYudHJpZ2dlclwiKX0pLHQoZG9jdW1lbnQpLm9uKFwiY2xvc2UuemYudHJpZ2dlclwiLFwiW2RhdGEtY2xvc2FibGVdXCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgcj10KHRoaXMpLmRhdGEoXCJjbG9zYWJsZVwiKTtcIlwiIT09cj9Gb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KHQodGhpcykscixmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlcihcImNsb3NlZC56ZlwiKX0pOnQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoXCJjbG9zZWQuemZcIil9KSx0KGRvY3VtZW50KS5vbihcImZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyXCIsXCJbZGF0YS10b2dnbGUtZm9jdXNdXCIsZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLmRhdGEoXCJ0b2dnbGUtZm9jdXNcIik7dChcIiNcIitlKS50cmlnZ2VySGFuZGxlcihcInRvZ2dsZS56Zi50cmlnZ2VyXCIsW3QodGhpcyldKX0pLHQod2luZG93KS5vbihcImxvYWRcIixmdW5jdGlvbigpe2UoKX0pLEZvdW5kYXRpb24uSUhlYXJZb3U9ZX0oalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIC8qKlxuICAgKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJvcGRvd24tbWVudVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICAgKi9cblxuICB2YXIgRHJvcGRvd25NZW51ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRHJvcGRvd25NZW51LlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjaW5pdFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEcm9wZG93bk1lbnUoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERyb3Bkb3duTWVudSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyb3Bkb3duTWVudS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRHJvcGRvd25NZW51Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxuICAgICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luLCBhbmQgY2FsbHMgX3ByZXBhcmVNZW51XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKERyb3Bkb3duTWVudSwgW3tcbiAgICAgIGtleTogJ19pbml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgdmFyIHN1YnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKCdmaXJzdC1zdWInKTtcblxuICAgICAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgdGhpcy4kdGFicy5maW5kKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkgfHwgdGhpcy4kZWxlbWVudC5wYXJlbnRzKCcudG9wLWJhci1yaWdodCcpLmlzKCcqJykpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID0gJ3JpZ2h0JztcbiAgICAgICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1sZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtcmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZXZlbnRzKCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnX2lzVmVydGljYWwnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pc1ZlcnRpY2FsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kdGFicy5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8IHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgICAvLyB1c2VkIGZvciBvbkNsaWNrIGFuZCBpbiB0aGUga2V5Ym9hcmQgaGFuZGxlcnNcbiAgICAgICAgdmFyIGhhbmRsZUNsaWNrRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbSA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnLicgKyBwYXJDbGFzcyksXG4gICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKSxcbiAgICAgICAgICAgICAgaGFzQ2xpY2tlZCA9ICRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnLFxuICAgICAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgICBpZiAoaGFzQ2xpY2tlZCkge1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbiAmJiAhaGFzVG91Y2ggfHwgX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJHN1Yik7XG4gICAgICAgICAgICAgICRlbGVtLmFkZCgkZWxlbS5wYXJlbnRzVW50aWwoX3RoaXMuJGVsZW1lbnQsICcuJyArIHBhckNsYXNzKSkuYXR0cignZGF0YS1pcy1jbGljaycsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51IHRvdWNoc3RhcnQuemYuZHJvcGRvd25tZW51JywgaGFuZGxlQ2xpY2tGbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2tJbnNpZGUpIHtcbiAgICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgICAgIGlmICghaGFzU3ViKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcbiAgICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuXG4gICAgICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcbiAgICAgICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5ob3ZlckRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKGhhc1N1YiAmJiBfdGhpcy5vcHRpb25zLmF1dG9jbG9zZSkge1xuICAgICAgICAgICAgICBpZiAoJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScgJiYgX3RoaXMub3B0aW9ucy5jbGlja09wZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2tleWRvd24uemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ1tyb2xlPVwibWVudWl0ZW1cIl0nKSxcbiAgICAgICAgICAgICAgaXNUYWIgPSBfdGhpcy4kdGFicy5pbmRleCgkZWxlbWVudCkgPiAtMSxcbiAgICAgICAgICAgICAgJGVsZW1lbnRzID0gaXNUYWIgPyBfdGhpcy4kdGFicyA6ICRlbGVtZW50LnNpYmxpbmdzKCdsaScpLmFkZCgkZWxlbWVudCksXG4gICAgICAgICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSAtIDEpO1xuICAgICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSArIDEpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISRlbGVtZW50LmlzKCc6bGFzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICAgICRuZXh0RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcmV2U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb3BlblN1YiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkc3ViID0gJGVsZW1lbnQuY2hpbGRyZW4oJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcbiAgICAgICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnbGkgPiBhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNsb3NlU3ViID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9pZiAoJGVsZW1lbnQuaXMoJzpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICB2YXIgY2xvc2UgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICAgICAgY2xvc2UuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoY2xvc2UpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgb3Blbjogb3BlblN1YixcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKF90aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgICAgX3RoaXMuJG1lbnVJdGVtcy5maW5kKCdhOmZpcnN0JykuZm9jdXMoKTsgLy8gZm9jdXMgdG8gZmlyc3QgZWxlbWVudFxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoaXNUYWIpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5faXNWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgICAgIC8vIHZlcnRpY2FsIG1lbnVcbiAgICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBob3Jpem9udGFsIG1lbnVcbiAgICAgICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBuZXh0OiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgIG5leHQ6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vdCB0YWJzIC0+IG9uZSBzdWJcbiAgICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7XG4gICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0Ryb3Bkb3duTWVudScsIGZ1bmN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19hZGRCb2R5SGFuZGxlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgICAgICB2YXIgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpLm9uKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkbGluayA9IF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpO1xuICAgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE9wZW5zIGEgZHJvcGRvd24gcGFuZSwgYW5kIGNoZWNrcyBmb3IgY29sbGlzaW9ucyBmaXJzdC5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkc3ViIC0gdWwgZWxlbWVudCB0aGF0IGlzIGEgc3VibWVudSB0byBzaG93XG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3Nob3cnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zaG93KCRzdWIpIHtcbiAgICAgICAgdmFyIGlkeCA9IHRoaXMuJHRhYnMuaW5kZXgodGhpcy4kdGFicy5maWx0ZXIoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgcmV0dXJuICQoZWwpLmZpbmQoJHN1YikubGVuZ3RoID4gMDtcbiAgICAgICAgfSkpO1xuICAgICAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgdGhpcy5faGlkZSgkc2licywgaWR4KTtcbiAgICAgICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuYWRkQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgIHZhciBjbGVhciA9IEZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UoJHN1YiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIGlmICghY2xlYXIpIHtcbiAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAnLXJpZ2h0JyA6ICctbGVmdCcsXG4gICAgICAgICAgICAgICRwYXJlbnRMaSA9ICRzdWIucGFyZW50KCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoJ29wZW5zJyArIG9sZENsYXNzKS5hZGRDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpO1xuICAgICAgICAgIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICBpZiAoIWNsZWFyKSB7XG4gICAgICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoJ29wZW5zLScgKyB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KS5hZGRDbGFzcygnb3BlbnMtaW5uZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICcnKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgICAgICB0aGlzLl9hZGRCb2R5SGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBuZXcgZHJvcGRvd24gcGFuZSBpcyB2aXNpYmxlLlxuICAgICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bm1lbnUnLCBbJHN1Yl0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEhpZGVzIGEgc2luZ2xlLCBjdXJyZW50bHkgb3BlbiBkcm9wZG93biBwYW5lLCBpZiBwYXNzZWQgYSBwYXJhbWV0ZXIsIG90aGVyd2lzZSwgaGlkZXMgZXZlcnl0aGluZy5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBoaWRlXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlICR0YWJzIGNvbGxlY3Rpb24gdG8gaGlkZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2hpZGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oaWRlKCRlbGVtLCBpZHgpIHtcbiAgICAgICAgdmFyICR0b0Nsb3NlO1xuICAgICAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAgICAgJHRvQ2xvc2UgPSAkZWxlbTtcbiAgICAgICAgfSBlbHNlIGlmIChpZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gaSA9PT0gaWR4O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0b0Nsb3NlID0gdGhpcy4kZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc29tZXRoaW5nVG9DbG9zZSA9ICR0b0Nsb3NlLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSB8fCAkdG9DbG9zZS5maW5kKCcuaXMtYWN0aXZlJykubGVuZ3RoID4gMDtcblxuICAgICAgICBpZiAoc29tZXRoaW5nVG9DbG9zZSkge1xuICAgICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWFjdGl2ZScpLmFkZCgkdG9DbG9zZSkuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1pcy1jbGljayc6IGZhbHNlXG4gICAgICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAgICAgJHRvQ2xvc2UuZmluZCgndWwuanMtZHJvcGRvd24tYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKHRoaXMuY2hhbmdlZCB8fCAkdG9DbG9zZS5maW5kKCdvcGVucy1pbm5lcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkKCR0b0Nsb3NlKS5yZW1vdmVDbGFzcygnb3BlbnMtaW5uZXIgb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy0nICsgb2xkQ2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9wZW4gbWVudXMgYXJlIGNsb3NlZC5cbiAgICAgICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I2hpZGVcbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGUuemYuZHJvcGRvd25tZW51JywgWyR0b0Nsb3NlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJykucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub2ZmKCcuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERyb3Bkb3duTWVudTtcbiAgfSgpO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAgICovXG5cblxuICBEcm9wZG93bk1lbnUuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogRGlzYWxsb3dzIGhvdmVyIGV2ZW50cyBmcm9tIG9wZW5pbmcgc3VibWVudXNcbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBkaXNhYmxlSG92ZXI6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGEgc3VibWVudSB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIG9uIGEgbW91c2VsZWF2ZSBldmVudCwgaWYgbm90IGNsaWNrZWQgb3Blbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBvcGVuaW5nIGEgc3VibWVudSBvbiBob3ZlciBldmVudC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCA1MFxuICAgICAqL1xuICAgIGhvdmVyRGVsYXk6IDUwLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGEgc3VibWVudSB0byBvcGVuL3JlbWFpbiBvcGVuIG9uIHBhcmVudCBjbGljayBldmVudC4gQWxsb3dzIGN1cnNvciB0byBtb3ZlIGF3YXkgZnJvbSBtZW51LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGNsaWNrT3BlbjogZmFsc2UsXG4gICAgLyoqXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgY2xvc2luZyBhIHN1Ym1lbnUgb24gYSBtb3VzZWxlYXZlIGV2ZW50LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDUwMFxuICAgICAqL1xuXG4gICAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgICAvKipcbiAgICAgKiBQb3NpdGlvbiBvZiB0aGUgbWVudSByZWxhdGl2ZSB0byB3aGF0IGRpcmVjdGlvbiB0aGUgc3VibWVudXMgc2hvdWxkIG9wZW4uIEhhbmRsZWQgYnkgSlMuIENhbiBiZSBgJ2xlZnQnYCBvciBgJ3JpZ2h0J2AuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2xlZnQnXG4gICAgICovXG4gICAgYWxpZ25tZW50OiAnbGVmdCcsXG4gICAgLyoqXG4gICAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGNsaWNrcyBvbiBsZWFmIGFuY2hvciBsaW5rcyB0byBjbG9zZSBhbnkgb3BlbiBzdWJtZW51cy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNsb3NlT25DbGlja0luc2lkZTogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHZlcnRpY2FsIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYHZlcnRpY2FsYC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ3ZlcnRpY2FsJ1xuICAgICAqL1xuICAgIHZlcnRpY2FsQ2xhc3M6ICd2ZXJ0aWNhbCcsXG4gICAgLyoqXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2FsaWduLXJpZ2h0J1xuICAgICAqL1xuICAgIHJpZ2h0Q2xhc3M6ICdhbGlnbi1yaWdodCcsXG4gICAgLyoqXG4gICAgICogQm9vbGVhbiB0byBmb3JjZSBvdmVyaWRlIHRoZSBjbGlja2luZyBvZiBsaW5rcyB0byBwZXJmb3JtIGRlZmF1bHQgYWN0aW9uLCBvbiBzZWNvbmQgdG91Y2ggZXZlbnQgZm9yIG1vYmlsZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGZvcmNlRm9sbG93OiB0cnVlXG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gICAqL1xuXG4gIHZhciBPZmZDYW52YXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIE9mZkNhbnZhcyNpbml0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIE9mZkNhbnZhcyhlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgT2ZmQ2FudmFzKTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICAgIHRoaXMuJHRyaWdnZXJzID0gJCgpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT2ZmQ2FudmFzJyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhPZmZDYW52YXMsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy10cmFuc2l0aW9uLScgKyB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbik7XG5cbiAgICAgICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMgPSAkKGRvY3VtZW50KS5maW5kKCdbZGF0YS1vcGVuPVwiJyArIGlkICsgJ1wiXSwgW2RhdGEtY2xvc2U9XCInICsgaWQgKyAnXCJdLCBbZGF0YS10b2dnbGU9XCInICsgaWQgKyAnXCJdJykuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAgICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5ID0gJChvdmVybGF5KTtcbiAgICAgICAgICBpZiAob3ZlcmxheVBvc2l0aW9uID09PSAnaXMtb3ZlcmxheS1maXhlZCcpIHtcbiAgICAgICAgICAgICQoJ2JvZHknKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzXScpWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG9mZi1jYW52YXMgd3JhcHBlciBhbmQgdGhlIGV4aXQgb3ZlcmxheS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2tleWRvd24uemYub2ZmY2FudmFzJzogdGhpcy5faGFuZGxlS2V5Ym9hcmQuYmluZCh0aGlzKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciAkdGFyZ2V0ID0gdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID8gdGhpcy4kb3ZlcmxheSA6ICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKTtcbiAgICAgICAgICAkdGFyZ2V0Lm9uKHsgJ2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zZXRNUUNoZWNrZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlcyB0aGUgcmV2ZWFsaW5nL2hpZGluZyB0aGUgb2ZmLWNhbnZhcyBhdCBicmVha3BvaW50cywgbm90IHRoZSBzYW1lIGFzIG9wZW4uXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JldmVhbCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmV2ZWFsKGlzUmV2ZWFsZWQpIHtcbiAgICAgICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgICAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAkY2xvc2VyLmhpZGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5pc1JldmVhbGVkID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbih7XG4gICAgICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zdG9wU2Nyb2xsaW5nJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gICAgICAvLyBPbmx5IHJlYWxseSB3b3JrcyBmb3IgeSwgbm90IHN1cmUgaG93IHRvIGV4dGVuZCB0byB4IG9yIGlmIHdlIG5lZWQgdG8uXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfcmVjb3JkU2Nyb2xsYWJsZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cblxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlIChjb250ZW50IG92ZXJmbG93cyksIHRoZW4uLi5cbiAgICAgICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IDApIHtcbiAgICAgICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIGJvdHRvbSwgc2Nyb2xsIHVwIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgZG93blxuICAgICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgICAgICBlbGVtLmFsbG93RG93biA9IGVsZW0uc2Nyb2xsVG9wIDwgZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodDtcbiAgICAgICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnX3N0b3BTY3JvbGxQcm9wYWdhdGlvbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3N0b3BTY3JvbGxQcm9wYWdhdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuICAgICAgICB2YXIgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgICAgIHZhciBkb3duID0gIXVwO1xuICAgICAgICBlbGVtLmxhc3RZID0gZXZlbnQucGFnZVk7XG5cbiAgICAgICAgaWYgKHVwICYmIGVsZW0uYWxsb3dVcCB8fCBkb3duICYmIGVsZW0uYWxsb3dEb3duKSB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE9wZW5zIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgICAgICogQGZpcmVzIE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnb3BlbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbihldmVudCwgdHJpZ2dlcikge1xuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIgPSB0cmlnZ2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKS50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgYWRkIGNsYXNzIGFuZCBkaXNhYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5maW5kKCdhLCBidXR0b24nKS5lcSgwKS5mb2N1cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnRyYXBGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENsb3NlcyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICAgICAqIEBmaXJlcyBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Nsb3NlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZShjYikge1xuICAgICAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAgICovXG4gICAgICAgIC50cmlnZ2VyKCdjbG9zZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAgICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgcmVtb3ZlIGNsYXNzIGFuZCByZS1lbmFibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWxlYXNlRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0b2dnbGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZShldmVudCwgdHJpZ2dlcikge1xuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfaGFuZGxlS2V5Ym9hcmQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPZmZDYW52YXMnLCB7XG4gICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzMi5jbG9zZSgpO1xuICAgICAgICAgICAgX3RoaXMyLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgdGhlIG9mZmNhbnZhcyBwbHVnaW4uXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgICAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gT2ZmQ2FudmFzO1xuICB9KCk7XG5cbiAgT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIG92ZXJsYXkgb24gdG9wIG9mIGBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdYC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlL2Rpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBtYWluIGNvbnRlbnQgd2hlbiBhbiBvZmYgY2FudmFzIHBhbmVsIGlzIG9wZW4uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG4gICAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRyYW5zaXRpb24gZm9yIHRoZSBvZmZjYW52YXMgbWVudS4gT3B0aW9ucyBhcmUgJ3B1c2gnLCAnZGV0YWNoZWQnIG9yICdzbGlkZScuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcHVzaFxuICAgICAqL1xuICAgIHRyYW5zaXRpb246ICdwdXNoJyxcblxuICAgIC8qKlxuICAgICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICBmb3JjZVRvOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgcmV2ZWFsT246IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIHVzZWQgdG8gZm9yY2UgYW4gb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuLiBGb3VuZGF0aW9uIGRlZmF1bHRzIGZvciB0aGlzIGFyZSBgcmV2ZWFsLWZvci1sYXJnZWAgJiBgcmV2ZWFsLWZvci1tZWRpdW1gLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHJldmVhbC1mb3ItXG4gICAgICogQHRvZG8gaW1wcm92ZSB0aGUgcmVnZXggdGVzdGluZyBmb3IgdGhpcy5cbiAgICAgKi9cbiAgICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzIG9wdGlvbmFsIGZvY3VzIHRyYXBwaW5nIHdoZW4gb3BlbmluZyBhbiBvZmZjYW52YXMuIFNldHMgdGFiaW5kZXggb2YgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XSB0byAtMSBmb3IgYWNjZXNzaWJpbGl0eSBwdXJwb3Nlcy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICB0cmFwRm9jdXM6IGZhbHNlXG4gIH07XG5cbiAgLy8gV2luZG93IGV4cG9ydHNcbiAgRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogUmVzcG9uc2l2ZU1lbnUgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAgICovXG5cbiAgdmFyIFJlc3BvbnNpdmVNZW51ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIFJlc3BvbnNpdmVNZW51I2luaXRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gUmVzcG9uc2l2ZU1lbnUoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3BvbnNpdmVNZW51KTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICB0aGlzLnJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdyZXNwb25zaXZlLW1lbnUnKTtcbiAgICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG51bGw7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXNwb25zaXZlTWVudScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBNZW51IGJ5IHBhcnNpbmcgdGhlIGNsYXNzZXMgZnJvbSB0aGUgJ2RhdGEtUmVzcG9uc2l2ZU1lbnUnIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoUmVzcG9uc2l2ZU1lbnUsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIC8vIFRoZSBmaXJzdCB0aW1lIGFuIEludGVyY2hhbmdlIHBsdWdpbiBpcyBpbml0aWFsaXplZCwgdGhpcy5ydWxlcyBpcyBjb252ZXJ0ZWQgZnJvbSBhIHN0cmluZyBvZiBcImNsYXNzZXNcIiB0byBhbiBvYmplY3Qgb2YgcnVsZXNcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJ1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHZhciBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgICAgIC8vIFBhcnNlIHJ1bGVzIGZyb20gXCJjbGFzc2VzXCIgcHVsbGVkIGZyb20gZGF0YSBhdHRyaWJ1dGVcbiAgICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLnJ1bGVzLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBydWxlID0gcnVsZXNbaV0uc3BsaXQoJy0nKTtcbiAgICAgICAgICAgIHZhciBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICAgICAgdmFyIHJ1bGVQbHVnaW4gPSBydWxlLmxlbmd0aCA+IDEgPyBydWxlWzFdIDogcnVsZVswXTtcblxuICAgICAgICAgICAgaWYgKE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEkLmlzRW1wdHlPYmplY3QodGhpcy5ydWxlcykpIHtcbiAgICAgICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCBkYXRhLW11dGF0ZSBzaW5jZSBjaGlsZHJlbiBtYXkgbmVlZCBpdC5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdyZXNwb25zaXZlLW1lbnUnKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciB0aGUgTWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vICQod2luZG93KS5vbigncmVzaXplLnpmLlJlc3BvbnNpdmVNZW51JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENoZWNrcyB0aGUgY3VycmVudCBzY3JlZW4gd2lkdGggYWdhaW5zdCBhdmFpbGFibGUgbWVkaWEgcXVlcmllcy4gSWYgdGhlIG1lZGlhIHF1ZXJ5IGhhcyBjaGFuZ2VkLCBhbmQgdGhlIHBsdWdpbiBuZWVkZWQgaGFzIGNoYW5nZWQsIHRoZSBwbHVnaW5zIHdpbGwgc3dhcCBvdXQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19jaGVja01lZGlhUXVlcmllcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NoZWNrTWVkaWFRdWVyaWVzKCkge1xuICAgICAgICB2YXIgbWF0Y2hlZE1xLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlIGFuZCBmaW5kIHRoZSBsYXN0IG1hdGNoaW5nIHJ1bGVcbiAgICAgICAgJC5lYWNoKHRoaXMucnVsZXMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3Qoa2V5KSkge1xuICAgICAgICAgICAgbWF0Y2hlZE1xID0ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm8gbWF0Y2g/IE5vIGRpY2VcbiAgICAgICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgICAgICAvLyBQbHVnaW4gYWxyZWFkeSBpbml0aWFsaXplZD8gV2UgZ29vZFxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luIGluc3RhbmNlb2YgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbikgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAgICAgJC5lYWNoKE1lbnVQbHVnaW5zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBDU1MgY2xhc3MgZm9yIHRoZSBuZXcgcGx1Z2luXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIG5ldyBwbHVnaW5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbikgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICAgICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVNZW51Jyk7XG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVzcG9uc2l2ZU1lbnU7XG4gIH0oKTtcblxuICBSZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4gIC8vIFRoZSBwbHVnaW4gbWF0Y2hlcyB0aGUgcGx1Z2luIGNsYXNzZXMgd2l0aCB0aGVzZSBwbHVnaW4gaW5zdGFuY2VzLlxuICB2YXIgTWVudVBsdWdpbnMgPSB7XG4gICAgZHJvcGRvd246IHtcbiAgICAgIGNzc0NsYXNzOiAnZHJvcGRvd24nLFxuICAgICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydkcm9wZG93bi1tZW51J10gfHwgbnVsbFxuICAgIH0sXG4gICAgZHJpbGxkb3duOiB7XG4gICAgICBjc3NDbGFzczogJ2RyaWxsZG93bicsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2RyaWxsZG93biddIHx8IG51bGxcbiAgICB9LFxuICAgIGFjY29yZGlvbjoge1xuICAgICAgY3NzQ2xhc3M6ICdhY2NvcmRpb24tbWVudScsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICAgIH1cbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihSZXNwb25zaXZlTWVudSwgJ1Jlc3BvbnNpdmVNZW51Jyk7XG59KGpRdWVyeSk7IiwiKGZ1bmN0aW9uICgkKSB7XG4gICAgJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjcm9vbXMnKS5zbGljayh7XG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNCxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiA0LFxuICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLW5leHQtYXJyb3dcIiBhcmlhLWxhYmVsPVwiTmV4dCByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLXJpZ2h0XCI+PC91c2U+PC9zdmc+PC9idXR0b24+JyxcbiAgICAgICAgICAgIHByZXZBcnJvdzogJzxidXR0b24gY2xhc3M9XCJzbGljay1wcmV2aW91cy1hcnJvd1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91cyByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogMTAyNCxcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDYwMCxcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBZb3UgY2FuIHVuc2xpY2sgYXQgYSBnaXZlbiBicmVha3BvaW50IG5vdyBieSBhZGRpbmc6XG4gICAgICAgICAgICAgICAgLy8gc2V0dGluZ3M6IFwidW5zbGlja1wiXG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBhIHNldHRpbmdzIG9iamVjdFxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAvKlxuICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgJChcIiNhcnJpdmVEdFwiKS5kYXRlcGlja2VyKCk7XG4gICAgICQoXCIjZGVwYXJ0RHRcIikuZGF0ZXBpY2tlcigpO1xuICAgICB9KTtcblxuICAgICBmdW5jdGlvbiBzdWJtaXRmb3JtKCkge1xuICAgICBpZiAoISQoXCIjYXJyaXZlRHRcIikudmFsKCkgfHwgISQoXCIjZGVwYXJ0RHRcIikudmFsKCkpIHtcbiAgICAgd2luZG93LmFsZXJ0KFwiUGxlYXNlIGVudGVyIGEgU3RhcnQgYW5kIEVuZCBEYXRlIVwiKTtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9XG4gICAgICQoJyNyZXNibG9jaycpLnN1Ym1pdCgpO1xuICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgKi9cbiAgICAvLyBhcnJpdmVEdFxuICAgIC8vIGRlcGFydER0XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBQaWthZGF5IGRhdGVwaWNrZXJzLlxuICAgICAqIEB0eXBlIHsqfVxuICAgICAqL1xuICAgIC8qXG4gICAgdmFyIGNoZWNraW5FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyaXZlRHRcIiksXG4gICAgICAgIGNoZWNrb3V0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlcGFydER0XCIpLFxuICAgICAgICBjaGVja2luUGlrYSA9IHBpa2FkYXlSZXNwb25zaXZlKGNoZWNraW5FbCwge1xuICAgICAgICAgICAgZm9ybWF0OiAnTS9ERC9ZWVlZJyxcbiAgICAgICAgICAgIHBpa2FkYXlPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIGNoZWNrb3V0UGlrYSA9IHBpa2FkYXlSZXNwb25zaXZlKGNoZWNrb3V0RWwsIHtcbiAgICAgICAgICAgIGZvcm1hdDogJ00vREQvWVlZWScsXG4gICAgICAgICAgICBwaWthZGF5T3B0aW9uczoge1xuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuKi9cbi8vIENoZWNrIGNoZWNrb3V0ZGF0ZVxuICAvKlxuICAgICQoY2hlY2tpbkVsKS5vbignY2hhbmdlLWRhdGUnLCBmdW5jdGlvbiAoZSwgZGF0ZSkge1xuICAgICAgICAvLyBJZiBjaGVjayBvdXQgZGF0ZSBpcyBiZWZvcmUgY2hlY2sgaW4gZGF0ZVxuICAgICAgICBpZiAoZGF0ZS5kYXRlLmlzQWZ0ZXIoY2hlY2tvdXRQaWthLmRhdGUpKSB7XG4gICAgICAgICAgICBjaGVja291dFBpa2Euc2V0RGF0ZShkYXRlLmRhdGUuYWRkKDEsICdkYXknKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIG1pbiBkYXRlIGZvciB0aGUgY2hlY2tvdXQgaW5wdXQuXG4gICAgICAgIGNoZWNrb3V0UGlrYS5waWthZGF5LnNldE1pbkRhdGUoY2hlY2tpblBpa2EuZGF0ZS50b0RhdGUoKSk7XG4gICAgfSk7XG5cbiAgICAkKCcuYm9va2luZy1hY2NvcmRpb24tdGl0bGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGl0bGUgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgYmFyID0gJCgnLmJvb2tpbmctYmFyJyk7XG4gICAgICAgIGJhci5zbGlkZVRvZ2dsZSgnZmFzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJhci50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgaWYgKGJhci5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQ2xvc2UnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dCgnQm9vayBOb3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiovXG4gICAgJCgnLmhlcm8tc2xpY2snKS5zbGljayh7XG4gICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gY2xhc3M9XCJzbGljay1uZXh0LWFycm93XCIgYXJpYS1sYWJlbD1cIk5leHQgcm9vbXNcIj48c3ZnIGNsYXNzPVwiaWNvblwiPjx1c2UgeGxpbms6aHJlZj1cIiNhbmdsZS1yaWdodFwiPjwvdXNlPjwvc3ZnPjwvYnV0dG9uPicsXG4gICAgICAgIHByZXZBcnJvdzogJzxidXR0b24gY2xhc3M9XCJzbGljay1wcmV2aW91cy1hcnJvd1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91cyByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgIH0pO1xufSkoalF1ZXJ5KTtcbiJdfQ==
