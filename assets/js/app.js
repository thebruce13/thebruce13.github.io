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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwic2xpY2suanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm1vdGlvbi5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmFiaWRlLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMiLCJmb3VuZGF0aW9uLm9mZmNhbnZhcy5qcyIsImZvdW5kYXRpb24ub3JiaXQuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbImEiLCJiIiwiYyIsImRvY3VtZW50IiwibGF6eVNpemVzIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJkIiwiZG9jdW1lbnRFbGVtZW50IiwiZSIsIkRhdGUiLCJmIiwiSFRNTFBpY3R1cmVFbGVtZW50IiwiZyIsImgiLCJpIiwiaiIsInNldFRpbWVvdXQiLCJrIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibCIsInJlcXVlc3RJZGxlQ2FsbGJhY2siLCJtIiwibiIsIm8iLCJwIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwicSIsIlJlZ0V4cCIsInRlc3QiLCJyIiwic2V0QXR0cmlidXRlIiwidHJpbSIsInMiLCJyZXBsYWNlIiwidCIsInUiLCJjcmVhdGVFdmVudCIsImluaXRDdXN0b21FdmVudCIsImRpc3BhdGNoRXZlbnQiLCJ2IiwicGljdHVyZWZpbGwiLCJwZiIsInJlZXZhbHVhdGUiLCJlbGVtZW50cyIsInNyYyIsInciLCJnZXRDb21wdXRlZFN0eWxlIiwieCIsIm9mZnNldFdpZHRoIiwibWluU2l6ZSIsIl9sYXp5c2l6ZXNXaWR0aCIsInBhcmVudE5vZGUiLCJ5IiwibGVuZ3RoIiwic2hpZnQiLCJhcHBseSIsImFyZ3VtZW50cyIsInB1c2giLCJoaWRkZW4iLCJfbHNGbHVzaCIsInoiLCJBIiwibm93IiwidGltZW91dCIsIkIiLCJDIiwiRSIsIkYiLCJHIiwiSCIsIkkiLCJKIiwiSyIsIkwiLCJNIiwiTiIsIk8iLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJQIiwiUSIsIlIiLCJTIiwiVCIsInRhcmdldCIsIlUiLCJib2R5Iiwib2Zmc2V0UGFyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwiViIsImxvYWRNb2RlIiwiZXhwYW5kIiwiY2xpZW50SGVpZ2h0IiwiY2xpZW50V2lkdGgiLCJleHBGYWN0b3IiLCJfbGF6eVJhY2UiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYSIsInByZWxvYWRBZnRlckxvYWQiLCJzaXplc0F0dHIiLCJXIiwiWCIsImxvYWRlZENsYXNzIiwibG9hZGluZ0NsYXNzIiwiWiIsIlkiLCIkIiwiY29udGVudFdpbmRvdyIsImxvY2F0aW9uIiwiXyIsInNyY3NldEF0dHIiLCJjdXN0b21NZWRpYSIsImluc2VydEJlZm9yZSIsImNsb25lTm9kZSIsInJlbW92ZUNoaWxkIiwiYWEiLCJkZWZhdWx0UHJldmVudGVkIiwiYXV0b3NpemVzQ2xhc3MiLCJzcmNBdHRyIiwibm9kZU5hbWUiLCJmaXJlc0xvYWQiLCJjbGVhclRpbWVvdXQiLCJjYWxsIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsYXp5Q2xhc3MiLCJjb21wbGV0ZSIsIm5hdHVyYWxXaWR0aCIsInNyY3NldCIsImVycm9yQ2xhc3MiLCJkZXRhaWwiLCJEIiwidXBkYXRlRWxlbSIsImNhIiwicHJlbG9hZENsYXNzIiwiaEZhYyIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJvYnNlcnZlIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsImF0dHJpYnV0ZXMiLCJzZXRJbnRlcnZhbCIsInJlYWR5U3RhdGUiLCJjaGVja0VsZW1zIiwidW52ZWlsIiwiZGF0YUF0dHIiLCJ3aWR0aCIsImluaXQiLCJsYXp5U2l6ZXNDb25maWciLCJsYXp5c2l6ZXNDb25maWciLCJjZmciLCJhdXRvU2l6ZXIiLCJsb2FkZXIiLCJ1UCIsImFDIiwickMiLCJoQyIsImZpcmUiLCJnVyIsInJBRiIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJyZXF1aXJlIiwialF1ZXJ5IiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsImVsZW1lbnQiLCJzZXR0aW5ncyIsImRhdGFTZXR0aW5ncyIsImRlZmF1bHRzIiwiYWNjZXNzaWJpbGl0eSIsImFkYXB0aXZlSGVpZ2h0IiwiYXBwZW5kQXJyb3dzIiwiYXBwZW5kRG90cyIsImFycm93cyIsImFzTmF2Rm9yIiwicHJldkFycm93IiwibmV4dEFycm93IiwiYXV0b3BsYXkiLCJhdXRvcGxheVNwZWVkIiwiY2VudGVyTW9kZSIsImNlbnRlclBhZGRpbmciLCJjc3NFYXNlIiwiY3VzdG9tUGFnaW5nIiwic2xpZGVyIiwidGV4dCIsImRvdHMiLCJkb3RzQ2xhc3MiLCJkcmFnZ2FibGUiLCJlYXNpbmciLCJlZGdlRnJpY3Rpb24iLCJmYWRlIiwiZm9jdXNPblNlbGVjdCIsImluZmluaXRlIiwiaW5pdGlhbFNsaWRlIiwibGF6eUxvYWQiLCJtb2JpbGVGaXJzdCIsInBhdXNlT25Ib3ZlciIsInBhdXNlT25Gb2N1cyIsInBhdXNlT25Eb3RzSG92ZXIiLCJyZXNwb25kVG8iLCJyZXNwb25zaXZlIiwicm93cyIsInJ0bCIsInNsaWRlIiwic2xpZGVzUGVyUm93Iiwic2xpZGVzVG9TaG93Iiwic2xpZGVzVG9TY3JvbGwiLCJzcGVlZCIsInN3aXBlIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiZGlyZWN0aW9uIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImV4dGVuZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd1RpbWVyIiwiZGF0YSIsIm9wdGlvbnMiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJjbGlja0hhbmRsZXIiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImZpbmQiLCJhdHRyIiwiYWRkU2xpZGUiLCJzbGlja0FkZCIsIm1hcmt1cCIsImluZGV4IiwiYWRkQmVmb3JlIiwidW5sb2FkIiwiYXBwZW5kVG8iLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiY2hpbGRyZW4iLCJkZXRhY2giLCJhcHBlbmQiLCJlYWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsInRhcmdldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiYW5pbWF0ZSIsImhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJjYWxsYmFjayIsImFuaW1Qcm9wcyIsImFuaW1TdGFydCIsImR1cmF0aW9uIiwic3RlcCIsIk1hdGgiLCJjZWlsIiwiY3NzIiwiYXBwbHlUcmFuc2l0aW9uIiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJub3QiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJjbGVhckludGVydmFsIiwic2xpZGVUbyIsImJ1aWxkQXJyb3dzIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsInJlbW92ZUF0dHIiLCJhZGQiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImZpcnN0IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsInJvdyIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsInJlZnJlc2giLCJ0cmlnZ2VyIiwiZXZlbnQiLCJkb250QW5pbWF0ZSIsIiR0YXJnZXQiLCJjdXJyZW50VGFyZ2V0IiwiaW5kZXhPZmZzZXQiLCJ1bmV2ZW5PZmZzZXQiLCJpcyIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VzdCIsIm1lc3NhZ2UiLCJjaGVja05hdmlnYWJsZSIsIm5hdmlnYWJsZXMiLCJwcmV2TmF2aWdhYmxlIiwiZ2V0TmF2aWdhYmxlSW5kZXhlcyIsImNsZWFuVXBFdmVudHMiLCJvZmYiLCJpbnRlcnJ1cHQiLCJ2aXNpYmlsaXR5IiwiY2xlYW5VcFNsaWRlRXZlbnRzIiwib3JpZW50YXRpb25DaGFuZ2UiLCJyZXNpemUiLCJjbGVhblVwUm93cyIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInN0b3BQcm9wYWdhdGlvbiIsImRlc3Ryb3kiLCJyZW1vdmUiLCJmYWRlU2xpZGUiLCJzbGlkZUluZGV4Iiwib3BhY2l0eSIsImZhZGVTbGlkZU91dCIsImZpbHRlclNsaWRlcyIsInNsaWNrRmlsdGVyIiwiZmlsdGVyIiwiZm9jdXNIYW5kbGVyIiwib24iLCIkc2YiLCJnZXRDdXJyZW50Iiwic2xpY2tDdXJyZW50U2xpZGUiLCJicmVha1BvaW50IiwiY291bnRlciIsInBhZ2VyUXR5IiwiZ2V0TGVmdCIsInZlcnRpY2FsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJ0YXJnZXRTbGlkZSIsImZsb29yIiwib2Zmc2V0TGVmdCIsIm91dGVyV2lkdGgiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImFicyIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsImVuZCIsImluaXRBcnJvd0V2ZW50cyIsImluaXREb3RFdmVudHMiLCJpbml0U2xpZGVFdmVudHMiLCJhY3Rpb24iLCJpbml0VUkiLCJzaG93IiwidGFnTmFtZSIsIm1hdGNoIiwia2V5Q29kZSIsImxvYWRSYW5nZSIsImNsb25lUmFuZ2UiLCJyYW5nZVN0YXJ0IiwicmFuZ2VFbmQiLCJsb2FkSW1hZ2VzIiwiaW1hZ2VzU2NvcGUiLCJpbWFnZSIsImltYWdlU291cmNlIiwiaW1hZ2VUb0xvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwic2xpY2UiLCJwcm9ncmVzc2l2ZUxhenlMb2FkIiwibmV4dCIsInNsaWNrTmV4dCIsInBhdXNlIiwic2xpY2tQYXVzZSIsInBsYXkiLCJzbGlja1BsYXkiLCJwb3N0U2xpZGUiLCJwcmV2Iiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsInR5cGUiLCJzcGxpY2UiLCJzb3J0Iiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BzIiwic2V0RGltZW5zaW9ucyIsInBhZGRpbmciLCJvZmZzZXQiLCJzZXRGYWRlIiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwidmFsdWUiLCJvcHQiLCJ2YWwiLCJib2R5U3R5bGUiLCJzdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJ1bmRlZmluZWQiLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJpbmZpbml0ZUNvdW50IiwiY2xvbmUiLCJ0b2dnbGUiLCJ0YXJnZXRFbGVtZW50IiwicGFyZW50cyIsInN5bmMiLCJhbmltU2xpZGUiLCJvbGRTbGlkZSIsInNsaWRlTGVmdCIsIm5hdlRhcmdldCIsImhpZGUiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJzd2lwZUFuZ2xlIiwic3RhcnRYIiwiY3VyWCIsInN0YXJ0WSIsImN1clkiLCJhdGFuMiIsInJvdW5kIiwiUEkiLCJzd2lwZUVuZCIsInN3aXBlTGVuZ3RoIiwiZWRnZUhpdCIsIm1pblN3aXBlIiwiaW5kZXhPZiIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInBhZ2VYIiwiY2xpZW50WCIsInBhZ2VZIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsImZuIiwiYXJncyIsInJldCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJ1bnJlZ2lzdGVyUGx1Z2luIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsIl9pbml0IiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJuYW1lc3BhY2UiLCJyYW5kb20iLCJ0b1N0cmluZyIsInJlZmxvdyIsImVsZW0iLCIkZWxlbSIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJtYXAiLCJlbCIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImhlYWQiLCJNZWRpYVF1ZXJ5IiwicGx1Z0NsYXNzIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJnZXRUaW1lIiwidmVuZG9ycyIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJsYXN0VGltZSIsIm5leHRUaW1lIiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJwYXJEaW1zIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJwYXJSZWN0Iiwid2luUmVjdCIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImtleSIsIndoaWNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCIkbGFzdEZvY3VzYWJsZSIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwia2NzIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiaW5mbyIsImlkIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0Iiwib25lIiwiZmluaXNoIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsIkJ1cm4iLCJyb2xlIiwiVGltZXIiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsImR4IiwiZHkiLCJkaXIiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwidGVhcmRvd24iLCJzcGVjaWFsIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiaW5pdE1vdXNlRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJtdXRhdGVMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCJhdHRyaWJ1dGVOYW1lIiwiZWxlbWVudE9ic2VydmVyIiwiY2hhcmFjdGVyRGF0YSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsIkFiaWRlIiwiJGlucHV0cyIsIl9ldmVudHMiLCJfdGhpczIiLCJyZXNldEZvcm0iLCJ2YWxpZGF0ZUZvcm0iLCJ2YWxpZGF0ZU9uIiwidmFsaWRhdGVJbnB1dCIsImxpdmVWYWxpZGF0ZSIsInZhbGlkYXRlT25CbHVyIiwiX3JlZmxvdyIsInJlcXVpcmVkQ2hlY2siLCJpc0dvb2QiLCJjaGVja2VkIiwiZmluZEZvcm1FcnJvciIsIiRlcnJvciIsInNpYmxpbmdzIiwiZm9ybUVycm9yU2VsZWN0b3IiLCJmaW5kTGFiZWwiLCIkbGFiZWwiLCJmaW5kUmFkaW9MYWJlbHMiLCIkZWxzIiwiX3RoaXMzIiwibGFiZWxzIiwiYWRkRXJyb3JDbGFzc2VzIiwiJGZvcm1FcnJvciIsImxhYmVsRXJyb3JDbGFzcyIsImZvcm1FcnJvckNsYXNzIiwiaW5wdXRFcnJvckNsYXNzIiwicmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMiLCJncm91cE5hbWUiLCIkbGFiZWxzIiwiJGZvcm1FcnJvcnMiLCJyZW1vdmVFcnJvckNsYXNzZXMiLCJfdGhpczQiLCJjbGVhclJlcXVpcmUiLCJ2YWxpZGF0ZWQiLCJjdXN0b21WYWxpZGF0b3IiLCJ2YWxpZGF0b3IiLCJlcXVhbFRvIiwidmFsaWRhdGVSYWRpbyIsInZhbGlkYXRlVGV4dCIsIm1hdGNoVmFsaWRhdGlvbiIsInZhbGlkYXRvcnMiLCJnb29kVG9HbyIsImRlcGVuZGVudEVsZW1lbnRzIiwiYWNjIiwibm9FcnJvciIsInBhdHRlcm4iLCJpbnB1dFRleHQiLCJ2YWxpZCIsInBhdHRlcm5zIiwiJGdyb3VwIiwicmVxdWlyZWQiLCJfdGhpczUiLCJjbGVhciIsIiRmb3JtIiwiYWxwaGEiLCJhbHBoYV9udW1lcmljIiwiaW50ZWdlciIsIm51bWJlciIsImNhcmQiLCJjdnYiLCJlbWFpbCIsInVybCIsImRvbWFpbiIsImRhdGV0aW1lIiwiZGF0ZSIsInRpbWUiLCJkYXRlSVNPIiwibW9udGhfZGF5X3llYXIiLCJkYXlfbW9udGhfeWVhciIsImNvbG9yIiwiRHJvcGRvd25NZW51Iiwic3VicyIsIiRtZW51SXRlbXMiLCIkdGFicyIsInZlcnRpY2FsQ2xhc3MiLCJyaWdodENsYXNzIiwiYWxpZ25tZW50IiwiY2hhbmdlZCIsIl9pc1ZlcnRpY2FsIiwiaGFzVG91Y2giLCJvbnRvdWNoc3RhcnQiLCJwYXJDbGFzcyIsImhhbmRsZUNsaWNrRm4iLCJwYXJlbnRzVW50aWwiLCJoYXNTdWIiLCJoYXNDbGlja2VkIiwiY2xvc2VPbkNsaWNrIiwiY2xpY2tPcGVuIiwiZm9yY2VGb2xsb3ciLCJfaGlkZSIsIl9zaG93IiwiY2xvc2VPbkNsaWNrSW5zaWRlIiwiZGlzYWJsZUhvdmVyIiwiaG92ZXJEZWxheSIsImF1dG9jbG9zZSIsImNsb3NpbmdUaW1lIiwiaXNUYWIiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJuZXh0U2libGluZyIsInByZXZTaWJsaW5nIiwib3BlblN1YiIsImNsb3NlU3ViIiwiY2xvc2UiLCJvcGVuIiwiZG93biIsInVwIiwicHJldmlvdXMiLCJfYWRkQm9keUhhbmRsZXIiLCIkYm9keSIsIiRsaW5rIiwiaWR4IiwiJHNpYnMiLCJvbGRDbGFzcyIsIiRwYXJlbnRMaSIsIiR0b0Nsb3NlIiwic29tZXRoaW5nVG9DbG9zZSIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsIiRvdmVybGF5IiwiaXNSZXZlYWxlZCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJfaGFuZGxlS2V5Ym9hcmQiLCJyZXZlYWwiLCIkY2xvc2VyIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvcCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiYXV0b0ZvY3VzIiwiT3JiaXQiLCJfcmVzZXQiLCIkd3JhcHBlciIsImNvbnRhaW5lckNsYXNzIiwic2xpZGVDbGFzcyIsIiRpbWFnZXMiLCJpbml0QWN0aXZlIiwidXNlTVVJIiwiX3ByZXBhcmVGb3JPcmJpdCIsImJ1bGxldHMiLCJfbG9hZEJ1bGxldHMiLCJnZW9TeW5jIiwiYWNjZXNzaWJsZSIsIiRidWxsZXRzIiwiYm94T2ZCdWxsZXRzIiwidGltZXJEZWxheSIsIl9zZXRXcmFwcGVySGVpZ2h0IiwidGVtcCIsIl9zZXRTbGlkZUhlaWdodCIsIm5hdkJ1dHRvbnMiLCIkY29udHJvbHMiLCJuZXh0Q2xhc3MiLCJwcmV2Q2xhc3MiLCIkc2xpZGUiLCJfdXBkYXRlQnVsbGV0cyIsImlzTFRSIiwiY2hvc2VuU2xpZGUiLCIkY3VyU2xpZGUiLCIkZmlyc3RTbGlkZSIsIiRsYXN0U2xpZGUiLCJsYXN0IiwiZGlySW4iLCJkaXJPdXQiLCIkbmV3U2xpZGUiLCJpbmZpbml0ZVdyYXAiLCIkb2xkQnVsbGV0IiwiYmx1ciIsInNwYW4iLCIkbmV3QnVsbGV0IiwiYW5pbUluRnJvbVJpZ2h0IiwiYW5pbU91dFRvUmlnaHQiLCJhbmltSW5Gcm9tTGVmdCIsImFuaW1PdXRUb0xlZnQiLCJSZXNwb25zaXZlTWVudSIsInJ1bGVzIiwiY3VycmVudE1xIiwiY3VycmVudFBsdWdpbiIsInJ1bGVzVHJlZSIsInJ1bGUiLCJydWxlU2l6ZSIsInJ1bGVQbHVnaW4iLCJNZW51UGx1Z2lucyIsImlzRW1wdHlPYmplY3QiLCJfY2hlY2tNZWRpYVF1ZXJpZXMiLCJtYXRjaGVkTXEiLCJjc3NDbGFzcyIsImRyb3Bkb3duIiwiZHJpbGxkb3duIiwiYWNjb3JkaW9uIiwic3VibWl0IiwiZXYiLCJmcm0iLCJwb3N0Iiwic2VyaWFsaXplIiwidGhlbiIsInZhbGlkYXRlIiwicmVhZHkiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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TTtBQUpFO0FBRlosT0FEVSxFQVVWO0FBQ0V5SyxvQkFBWSxHQURkO0FBRUU1TCxrQkFBVTtBQUNSdUMsd0JBQWMsQ0FETjtBQUVSQywwQkFBZ0I7QUFGUjtBQUZaLE9BVlUsRUFpQlY7QUFDRW9KLG9CQUFZLEdBRGQ7QUFFRTVMLGtCQUFVO0FBQ1J1Qyx3QkFBYyxDQUROO0FBRVJDLDBCQUFnQjtBQUZSO0FBS1o7QUFDQTtBQUNBO0FBVEEsT0FqQlU7QUFWSSxLQUFsQjtBQXVDRCxHQXhDRDtBQXlDQTs7Ozs7Ozs7Ozs7Ozs7QUFlQTtBQUNBO0FBQ0E7Ozs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBckcsSUFBRSxhQUFGLEVBQWlCc04sS0FBakIsQ0FBdUI7QUFDckIvSSxlQUNFLGlJQUZtQjtBQUdyQkQsZUFDRTtBQUptQixHQUF2QjtBQU1ELENBaklELEVBaUlHYixNQWpJSCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NC4zLjFcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHQgIC8qXG5cdCAgICogdmFyaWFibGVzXG5cdCAgICovXG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFsnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJ107XG5cblx0ICB2YXIgZnVuY3Rpb25MaXN0ID0gW107XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gWzE2LCAvLyBzaGlmdFxuXHQgIDE3LCAvLyBjb250cm9sXG5cdCAgMTgsIC8vIGFsdFxuXHQgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgOTMgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIC8vIGxpc3Qgb2Yga2V5cyBmb3Igd2hpY2ggd2UgY2hhbmdlIGludGVudCBldmVuIGZvciBmb3JtIGlucHV0c1xuXHQgIHZhciBjaGFuZ2VJbnRlbnRNYXAgPSBbOSAvLyB0YWJcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICBrZXlkb3duOiAna2V5Ym9hcmQnLFxuXHQgICAga2V5dXA6ICdrZXlib2FyZCcsXG5cdCAgICBtb3VzZWRvd246ICdtb3VzZScsXG5cdCAgICBtb3VzZW1vdmU6ICdtb3VzZScsXG5cdCAgICBNU1BvaW50ZXJEb3duOiAncG9pbnRlcicsXG5cdCAgICBNU1BvaW50ZXJNb3ZlOiAncG9pbnRlcicsXG5cdCAgICBwb2ludGVyZG93bjogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcm1vdmU6ICdwb2ludGVyJyxcblx0ICAgIHRvdWNoc3RhcnQ6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgaXMgYWN0aXZlXG5cdCAgdmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRoZSBwYWdlIGlzIGJlaW5nIHNjcm9sbGVkXG5cdCAgdmFyIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAvLyBzdG9yZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXG5cdCAgdmFyIG1vdXNlUG9zID0ge1xuXHQgICAgeDogbnVsbCxcblx0ICAgIHk6IG51bGxcblx0ICB9O1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgdmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG5cdCAgdHJ5IHtcblx0ICAgIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcblx0ICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdCAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcblx0ICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG5cdCAgfSBjYXRjaCAoZSkge31cblxuXHQgIC8qXG5cdCAgICogc2V0IHVwXG5cdCAgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbiBzZXRVcCgpIHtcblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICAgIHNldElucHV0KCk7XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogZXZlbnRzXG5cdCAgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCkge1xuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cdCAgICB2YXIgb3B0aW9ucyA9IHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2U7XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRvdWNoQnVmZmVyLCBvcHRpb25zKTtcblx0ICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCwgb3B0aW9ucyk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbiB1cGRhdGVJbnB1dChldmVudCkge1xuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudElucHV0ICE9PSB2YWx1ZSB8fCBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIHZhciBhY3RpdmVFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0ICAgICAgICB2YXIgYWN0aXZlSW5wdXQgPSBmYWxzZTtcblx0ICAgICAgICB2YXIgbm90Rm9ybUlucHV0ID0gYWN0aXZlRWxlbSAmJiBhY3RpdmVFbGVtLm5vZGVOYW1lICYmIGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMTtcblxuXHQgICAgICAgIGlmIChub3RGb3JtSW5wdXQgfHwgY2hhbmdlSW50ZW50TWFwLmluZGV4T2YoZXZlbnRLZXkpICE9PSAtMSkge1xuXHQgICAgICAgICAgYWN0aXZlSW5wdXQgPSB0cnVlO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmICh2YWx1ZSA9PT0gJ3RvdWNoJyB8fFxuXHQgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgdmFsdWUgPT09ICdtb3VzZScgfHxcblx0ICAgICAgICAvLyBkb24ndCBzd2l0Y2ggaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhIGZvcm0gaW5wdXRcblx0ICAgICAgICB2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBldmVudEtleSAmJiBhY3RpdmVJbnB1dCAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xKSB7XG5cdCAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgYW5kIGNhdGNoLWFsbCB2YXJpYWJsZVxuXHQgICAgICAgICAgY3VycmVudElucHV0ID0gY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgICBzZXRJbnB1dCgpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIHRoZSBkb2MgYW5kIGBpbnB1dFR5cGVzYCBhcnJheSB3aXRoIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uIHNldElucHV0KCkge1xuXHQgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudElucHV0KTtcblxuXHQgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkge1xuXHQgICAgICBpbnB1dFR5cGVzLnB1c2goY3VycmVudElucHV0KTtcblx0ICAgICAgZG9jLmNsYXNzTmFtZSArPSAnIHdoYXRpbnB1dC10eXBlcy0nICsgY3VycmVudElucHV0O1xuXHQgICAgfVxuXG5cdCAgICBmaXJlRnVuY3Rpb25zKCdpbnB1dCcpO1xuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIGlucHV0IGludGVudCBmb3IgYG1vdXNlbW92ZWAgYW5kIGBwb2ludGVybW92ZWBcblx0ICB2YXIgc2V0SW50ZW50ID0gZnVuY3Rpb24gc2V0SW50ZW50KGV2ZW50KSB7XG5cdCAgICAvLyB0ZXN0IHRvIHNlZSBpZiBgbW91c2Vtb3ZlYCBoYXBwZW5lZCByZWxhdGl2ZSB0byB0aGUgc2NyZWVuXG5cdCAgICAvLyB0byBkZXRlY3Qgc2Nyb2xsaW5nIHZlcnN1cyBtb3VzZW1vdmVcblx0ICAgIGlmIChtb3VzZVBvc1sneCddICE9PSBldmVudC5zY3JlZW5YIHx8IG1vdXNlUG9zWyd5J10gIT09IGV2ZW50LnNjcmVlblkpIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgICAgICBtb3VzZVBvc1sneCddID0gZXZlbnQuc2NyZWVuWDtcblx0ICAgICAgbW91c2VQb3NbJ3knXSA9IGV2ZW50LnNjcmVlblk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBpc1Njcm9sbGluZyA9IHRydWU7XG5cdCAgICB9XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIC8vIG9yIHNjcm9sbGluZyBpc24ndCBoYXBwZW5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcgJiYgIWlzU2Nyb2xsaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudEludGVudCk7XG5cblx0ICAgICAgICBmaXJlRnVuY3Rpb25zKCdpbnRlbnQnKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBidWZmZXJzIHRvdWNoIGV2ZW50cyBiZWNhdXNlIHRoZXkgZnJlcXVlbnRseSBhbHNvIGZpcmUgbW91c2UgZXZlbnRzXG5cdCAgdmFyIHRvdWNoQnVmZmVyID0gZnVuY3Rpb24gdG91Y2hCdWZmZXIoZXZlbnQpIHtcblx0ICAgIGlmIChldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcblx0ICAgICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgICAgdXBkYXRlSW5wdXQoZXZlbnQpO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICB2YXIgZmlyZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uIGZpcmVGdW5jdGlvbnModHlwZSkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLnR5cGUgPT09IHR5cGUpIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3RbaV0uZm4uY2FsbCh1bmRlZmluZWQsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogdXRpbGl0aWVzXG5cdCAgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbiBwb2ludGVyVHlwZShldmVudCkge1xuXHQgICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgICAgcmV0dXJuIGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJyA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy93aGVlbFxuXHQgIHZhciBkZXRlY3RXaGVlbCA9IGZ1bmN0aW9uIGRldGVjdFdoZWVsKCkge1xuXHQgICAgdmFyIHdoZWVsVHlwZSA9IHZvaWQgMDtcblxuXHQgICAgLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cdCAgICBpZiAoJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSB7XG5cdCAgICAgIHdoZWVsVHlwZSA9ICd3aGVlbCc7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgLy8gb3IgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgICAgIHdoZWVsVHlwZSA9IGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID8gJ21vdXNld2hlZWwnIDogJ0RPTU1vdXNlU2Nyb2xsJztcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIHdoZWVsVHlwZTtcblx0ICB9O1xuXG5cdCAgdmFyIG9ialBvcyA9IGZ1bmN0aW9uIG9ialBvcyhtYXRjaCkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLmZuID09PSBtYXRjaCkge1xuXHQgICAgICAgIHJldHVybiBpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8qXG5cdCAgICogaW5pdFxuXHQgICAqL1xuXG5cdCAgLy8gZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAvLyAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgIGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXHQgIC8qXG5cdCAgICogYXBpXG5cdCAgICovXG5cblx0ICByZXR1cm4ge1xuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uIGFzayhvcHQpIHtcblx0ICAgICAgcmV0dXJuIG9wdCA9PT0gJ2xvb3NlJyA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7XG5cdCAgICB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24gdHlwZXMoKSB7XG5cdCAgICAgIHJldHVybiBpbnB1dFR5cGVzO1xuXHQgICAgfSxcblxuXHQgICAgLy8gb3ZlcndyaXRlcyBpZ25vcmVkIGtleXMgd2l0aCBwcm92aWRlZCBhcnJheVxuXHQgICAgaWdub3JlS2V5czogZnVuY3Rpb24gaWdub3JlS2V5cyhhcnIpIHtcblx0ICAgICAgaWdub3JlTWFwID0gYXJyO1xuXHQgICAgfSxcblxuXHQgICAgLy8gYXR0YWNoIGZ1bmN0aW9ucyB0byBpbnB1dCBhbmQgaW50ZW50IFwiZXZlbnRzXCJcblx0ICAgIC8vIGZ1bmN0OiBmdW5jdGlvbiB0byBmaXJlIG9uIGNoYW5nZVxuXHQgICAgLy8gZXZlbnRUeXBlOiAnaW5wdXQnfCdpbnRlbnQnXG5cdCAgICByZWdpc3Rlck9uQ2hhbmdlOiBmdW5jdGlvbiByZWdpc3Rlck9uQ2hhbmdlKGZuLCBldmVudFR5cGUpIHtcblx0ICAgICAgZnVuY3Rpb25MaXN0LnB1c2goe1xuXHQgICAgICAgIGZuOiBmbixcblx0ICAgICAgICB0eXBlOiBldmVudFR5cGUgfHwgJ2lucHV0J1xuXHQgICAgICB9KTtcblx0ICAgIH0sXG5cblx0ICAgIHVuUmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gdW5SZWdpc3Rlck9uQ2hhbmdlKGZuKSB7XG5cdCAgICAgIHZhciBwb3NpdGlvbiA9IG9ialBvcyhmbik7XG5cblx0ICAgICAgaWYgKHBvc2l0aW9uKSB7XG5cdCAgICAgICAgZnVuY3Rpb25MaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXHR9KCk7XG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIvKiEgbGF6eXNpemVzIC0gdjMuMC4wICovXG4hZnVuY3Rpb24oYSxiKXt2YXIgYz1iKGEsYS5kb2N1bWVudCk7YS5sYXp5U2l6ZXM9YyxcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWMpfSh3aW5kb3csZnVuY3Rpb24oYSxiKXtcInVzZSBzdHJpY3RcIjtpZihiLmdldEVsZW1lbnRzQnlDbGFzc05hbWUpe3ZhciBjLGQ9Yi5kb2N1bWVudEVsZW1lbnQsZT1hLkRhdGUsZj1hLkhUTUxQaWN0dXJlRWxlbWVudCxnPVwiYWRkRXZlbnRMaXN0ZW5lclwiLGg9XCJnZXRBdHRyaWJ1dGVcIixpPWFbZ10saj1hLnNldFRpbWVvdXQsaz1hLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8aixsPWEucmVxdWVzdElkbGVDYWxsYmFjayxtPS9ecGljdHVyZSQvaSxuPVtcImxvYWRcIixcImVycm9yXCIsXCJsYXp5aW5jbHVkZWRcIixcIl9sYXp5bG9hZGVkXCJdLG89e30scD1BcnJheS5wcm90b3R5cGUuZm9yRWFjaCxxPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG9bYl18fChvW2JdPW5ldyBSZWdFeHAoXCIoXFxcXHN8XilcIitiK1wiKFxcXFxzfCQpXCIpKSxvW2JdLnRlc3QoYVtoXShcImNsYXNzXCIpfHxcIlwiKSYmb1tiXX0scj1mdW5jdGlvbihhLGIpe3EoYSxiKXx8YS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLChhW2hdKFwiY2xhc3NcIil8fFwiXCIpLnRyaW0oKStcIiBcIitiKX0scz1mdW5jdGlvbihhLGIpe3ZhciBjOyhjPXEoYSxiKSkmJmEuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwoYVtoXShcImNsYXNzXCIpfHxcIlwiKS5yZXBsYWNlKGMsXCIgXCIpKX0sdD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9Yz9nOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiO2MmJnQoYSxiKSxuLmZvckVhY2goZnVuY3Rpb24oYyl7YVtkXShjLGIpfSl9LHU9ZnVuY3Rpb24oYSxjLGQsZSxmKXt2YXIgZz1iLmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7cmV0dXJuIGcuaW5pdEN1c3RvbUV2ZW50KGMsIWUsIWYsZHx8e30pLGEuZGlzcGF0Y2hFdmVudChnKSxnfSx2PWZ1bmN0aW9uKGIsZCl7dmFyIGU7IWYmJihlPWEucGljdHVyZWZpbGx8fGMucGYpP2Uoe3JlZXZhbHVhdGU6ITAsZWxlbWVudHM6W2JdfSk6ZCYmZC5zcmMmJihiLnNyYz1kLnNyYyl9LHc9ZnVuY3Rpb24oYSxiKXtyZXR1cm4oZ2V0Q29tcHV0ZWRTdHlsZShhLG51bGwpfHx7fSlbYl19LHg9ZnVuY3Rpb24oYSxiLGQpe2ZvcihkPWR8fGEub2Zmc2V0V2lkdGg7ZDxjLm1pblNpemUmJmImJiFhLl9sYXp5c2l6ZXNXaWR0aDspZD1iLm9mZnNldFdpZHRoLGI9Yi5wYXJlbnROb2RlO3JldHVybiBkfSx5PWZ1bmN0aW9uKCl7dmFyIGEsYyxkPVtdLGU9W10sZj1kLGc9ZnVuY3Rpb24oKXt2YXIgYj1mO2ZvcihmPWQubGVuZ3RoP2U6ZCxhPSEwLGM9ITE7Yi5sZW5ndGg7KWIuc2hpZnQoKSgpO2E9ITF9LGg9ZnVuY3Rpb24oZCxlKXthJiYhZT9kLmFwcGx5KHRoaXMsYXJndW1lbnRzKTooZi5wdXNoKGQpLGN8fChjPSEwLChiLmhpZGRlbj9qOmspKGcpKSl9O3JldHVybiBoLl9sc0ZsdXNoPWcsaH0oKSx6PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/ZnVuY3Rpb24oKXt5KGEpfTpmdW5jdGlvbigpe3ZhciBiPXRoaXMsYz1hcmd1bWVudHM7eShmdW5jdGlvbigpe2EuYXBwbHkoYixjKX0pfX0sQT1mdW5jdGlvbihhKXt2YXIgYixjPTAsZD0xMjUsZj02NjYsZz1mLGg9ZnVuY3Rpb24oKXtiPSExLGM9ZS5ub3coKSxhKCl9LGk9bD9mdW5jdGlvbigpe2woaCx7dGltZW91dDpnfSksZyE9PWYmJihnPWYpfTp6KGZ1bmN0aW9uKCl7aihoKX0sITApO3JldHVybiBmdW5jdGlvbihhKXt2YXIgZjsoYT1hPT09ITApJiYoZz00NCksYnx8KGI9ITAsZj1kLShlLm5vdygpLWMpLDA+ZiYmKGY9MCksYXx8OT5mJiZsP2koKTpqKGksZikpfX0sQj1mdW5jdGlvbihhKXt2YXIgYixjLGQ9OTksZj1mdW5jdGlvbigpe2I9bnVsbCxhKCl9LGc9ZnVuY3Rpb24oKXt2YXIgYT1lLm5vdygpLWM7ZD5hP2ooZyxkLWEpOihsfHxmKShmKX07cmV0dXJuIGZ1bmN0aW9uKCl7Yz1lLm5vdygpLGJ8fChiPWooZyxkKSl9fSxDPWZ1bmN0aW9uKCl7dmFyIGYsayxsLG4sbyx4LEMsRSxGLEcsSCxJLEosSyxMLE09L15pbWckL2ksTj0vXmlmcmFtZSQvaSxPPVwib25zY3JvbGxcImluIGEmJiEvZ2xlYm90Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLFA9MCxRPTAsUj0wLFM9LTEsVD1mdW5jdGlvbihhKXtSLS0sYSYmYS50YXJnZXQmJnQoYS50YXJnZXQsVCksKCFhfHwwPlJ8fCFhLnRhcmdldCkmJihSPTApfSxVPWZ1bmN0aW9uKGEsYyl7dmFyIGUsZj1hLGc9XCJoaWRkZW5cIj09dyhiLmJvZHksXCJ2aXNpYmlsaXR5XCIpfHxcImhpZGRlblwiIT13KGEsXCJ2aXNpYmlsaXR5XCIpO2ZvcihGLT1jLEkrPWMsRy09YyxIKz1jO2cmJihmPWYub2Zmc2V0UGFyZW50KSYmZiE9Yi5ib2R5JiZmIT1kOylnPSh3KGYsXCJvcGFjaXR5XCIpfHwxKT4wLGcmJlwidmlzaWJsZVwiIT13KGYsXCJvdmVyZmxvd1wiKSYmKGU9Zi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxnPUg+ZS5sZWZ0JiZHPGUucmlnaHQmJkk+ZS50b3AtMSYmRjxlLmJvdHRvbSsxKTtyZXR1cm4gZ30sVj1mdW5jdGlvbigpe3ZhciBhLGUsZyxpLGosbSxuLHAscTtpZigobz1jLmxvYWRNb2RlKSYmOD5SJiYoYT1mLmxlbmd0aCkpe2U9MCxTKyssbnVsbD09SyYmKFwiZXhwYW5kXCJpbiBjfHwoYy5leHBhbmQ9ZC5jbGllbnRIZWlnaHQ+NTAwJiZkLmNsaWVudFdpZHRoPjUwMD81MDA6MzcwKSxKPWMuZXhwYW5kLEs9SipjLmV4cEZhY3RvciksSz5RJiYxPlImJlM+MiYmbz4yJiYhYi5oaWRkZW4/KFE9SyxTPTApOlE9bz4xJiZTPjEmJjY+Uj9KOlA7Zm9yKDthPmU7ZSsrKWlmKGZbZV0mJiFmW2VdLl9sYXp5UmFjZSlpZihPKWlmKChwPWZbZV1baF0oXCJkYXRhLWV4cGFuZFwiKSkmJihtPTEqcCl8fChtPVEpLHEhPT1tJiYoQz1pbm5lcldpZHRoK20qTCxFPWlubmVySGVpZ2h0K20sbj0tMSptLHE9bSksZz1mW2VdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLChJPWcuYm90dG9tKT49biYmKEY9Zy50b3ApPD1FJiYoSD1nLnJpZ2h0KT49bipMJiYoRz1nLmxlZnQpPD1DJiYoSXx8SHx8R3x8RikmJihsJiYzPlImJiFwJiYoMz5vfHw0PlMpfHxVKGZbZV0sbSkpKXtpZihiYShmW2VdKSxqPSEwLFI+OSlicmVha31lbHNlIWomJmwmJiFpJiY0PlImJjQ+UyYmbz4yJiYoa1swXXx8Yy5wcmVsb2FkQWZ0ZXJMb2FkKSYmKGtbMF18fCFwJiYoSXx8SHx8R3x8Rnx8XCJhdXRvXCIhPWZbZV1baF0oYy5zaXplc0F0dHIpKSkmJihpPWtbMF18fGZbZV0pO2Vsc2UgYmEoZltlXSk7aSYmIWomJmJhKGkpfX0sVz1BKFYpLFg9ZnVuY3Rpb24oYSl7cihhLnRhcmdldCxjLmxvYWRlZENsYXNzKSxzKGEudGFyZ2V0LGMubG9hZGluZ0NsYXNzKSx0KGEudGFyZ2V0LFopfSxZPXooWCksWj1mdW5jdGlvbihhKXtZKHt0YXJnZXQ6YS50YXJnZXR9KX0sJD1mdW5jdGlvbihhLGIpe3RyeXthLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShiKX1jYXRjaChjKXthLnNyYz1ifX0sXz1mdW5jdGlvbihhKXt2YXIgYixkLGU9YVtoXShjLnNyY3NldEF0dHIpOyhiPWMuY3VzdG9tTWVkaWFbYVtoXShcImRhdGEtbWVkaWFcIil8fGFbaF0oXCJtZWRpYVwiKV0pJiZhLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsYiksZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixlKSxiJiYoZD1hLnBhcmVudE5vZGUsZC5pbnNlcnRCZWZvcmUoYS5jbG9uZU5vZGUoKSxhKSxkLnJlbW92ZUNoaWxkKGEpKX0sYWE9eihmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnLGksayxsLG8scTsobz11KGEsXCJsYXp5YmVmb3JldW52ZWlsXCIsYikpLmRlZmF1bHRQcmV2ZW50ZWR8fChlJiYoZD9yKGEsYy5hdXRvc2l6ZXNDbGFzcyk6YS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLGUpKSxpPWFbaF0oYy5zcmNzZXRBdHRyKSxnPWFbaF0oYy5zcmNBdHRyKSxmJiYoaz1hLnBhcmVudE5vZGUsbD1rJiZtLnRlc3Qoay5ub2RlTmFtZXx8XCJcIikpLHE9Yi5maXJlc0xvYWR8fFwic3JjXCJpbiBhJiYoaXx8Z3x8bCksbz17dGFyZ2V0OmF9LHEmJih0KGEsVCwhMCksY2xlYXJUaW1lb3V0KG4pLG49aihULDI1MDApLHIoYSxjLmxvYWRpbmdDbGFzcyksdChhLFosITApKSxsJiZwLmNhbGwoay5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNvdXJjZVwiKSxfKSxpP2Euc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsaSk6ZyYmIWwmJihOLnRlc3QoYS5ub2RlTmFtZSk/JChhLGcpOmEuc3JjPWcpLChpfHxsKSYmdihhLHtzcmM6Z30pKSxhLl9sYXp5UmFjZSYmZGVsZXRlIGEuX2xhenlSYWNlLHMoYSxjLmxhenlDbGFzcykseShmdW5jdGlvbigpeyghcXx8YS5jb21wbGV0ZSYmYS5uYXR1cmFsV2lkdGg+MSkmJihxP1Qobyk6Ui0tLFgobykpfSwhMCl9KSxiYT1mdW5jdGlvbihhKXt2YXIgYixkPU0udGVzdChhLm5vZGVOYW1lKSxlPWQmJihhW2hdKGMuc2l6ZXNBdHRyKXx8YVtoXShcInNpemVzXCIpKSxmPVwiYXV0b1wiPT1lOyghZiYmbHx8IWR8fCFhLnNyYyYmIWEuc3Jjc2V0fHxhLmNvbXBsZXRlfHxxKGEsYy5lcnJvckNsYXNzKSkmJihiPXUoYSxcImxhenl1bnZlaWxyZWFkXCIpLmRldGFpbCxmJiZELnVwZGF0ZUVsZW0oYSwhMCxhLm9mZnNldFdpZHRoKSxhLl9sYXp5UmFjZT0hMCxSKyssYWEoYSxiLGYsZSxkKSl9LGNhPWZ1bmN0aW9uKCl7aWYoIWwpe2lmKGUubm93KCkteDw5OTkpcmV0dXJuIHZvaWQgaihjYSw5OTkpO3ZhciBhPUIoZnVuY3Rpb24oKXtjLmxvYWRNb2RlPTMsVygpfSk7bD0hMCxjLmxvYWRNb2RlPTMsVygpLGkoXCJzY3JvbGxcIixmdW5jdGlvbigpezM9PWMubG9hZE1vZGUmJihjLmxvYWRNb2RlPTIpLGEoKX0sITApfX07cmV0dXJue186ZnVuY3Rpb24oKXt4PWUubm93KCksZj1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5sYXp5Q2xhc3MpLGs9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMubGF6eUNsYXNzK1wiIFwiK2MucHJlbG9hZENsYXNzKSxMPWMuaEZhYyxpKFwic2Nyb2xsXCIsVywhMCksaShcInJlc2l6ZVwiLFcsITApLGEuTXV0YXRpb25PYnNlcnZlcj9uZXcgTXV0YXRpb25PYnNlcnZlcihXKS5vYnNlcnZlKGQse2NoaWxkTGlzdDohMCxzdWJ0cmVlOiEwLGF0dHJpYnV0ZXM6ITB9KTooZFtnXShcIkRPTU5vZGVJbnNlcnRlZFwiLFcsITApLGRbZ10oXCJET01BdHRyTW9kaWZpZWRcIixXLCEwKSxzZXRJbnRlcnZhbChXLDk5OSkpLGkoXCJoYXNoY2hhbmdlXCIsVywhMCksW1wiZm9jdXNcIixcIm1vdXNlb3ZlclwiLFwiY2xpY2tcIixcImxvYWRcIixcInRyYW5zaXRpb25lbmRcIixcImFuaW1hdGlvbmVuZFwiLFwid2Via2l0QW5pbWF0aW9uRW5kXCJdLmZvckVhY2goZnVuY3Rpb24oYSl7YltnXShhLFcsITApfSksL2QkfF5jLy50ZXN0KGIucmVhZHlTdGF0ZSk/Y2EoKTooaShcImxvYWRcIixjYSksYltnXShcIkRPTUNvbnRlbnRMb2FkZWRcIixXKSxqKGNhLDJlNCkpLGYubGVuZ3RoPyhWKCkseS5fbHNGbHVzaCgpKTpXKCl9LGNoZWNrRWxlbXM6Vyx1bnZlaWw6YmF9fSgpLEQ9ZnVuY3Rpb24oKXt2YXIgYSxkPXooZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGUsZixnO2lmKGEuX2xhenlzaXplc1dpZHRoPWQsZCs9XCJweFwiLGEuc2V0QXR0cmlidXRlKFwic2l6ZXNcIixkKSxtLnRlc3QoYi5ub2RlTmFtZXx8XCJcIikpZm9yKGU9Yi5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNvdXJjZVwiKSxmPTAsZz1lLmxlbmd0aDtnPmY7ZisrKWVbZl0uc2V0QXR0cmlidXRlKFwic2l6ZXNcIixkKTtjLmRldGFpbC5kYXRhQXR0cnx8dihhLGMuZGV0YWlsKX0pLGU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBlLGY9YS5wYXJlbnROb2RlO2YmJihjPXgoYSxmLGMpLGU9dShhLFwibGF6eWJlZm9yZXNpemVzXCIse3dpZHRoOmMsZGF0YUF0dHI6ISFifSksZS5kZWZhdWx0UHJldmVudGVkfHwoYz1lLmRldGFpbC53aWR0aCxjJiZjIT09YS5fbGF6eXNpemVzV2lkdGgmJmQoYSxmLGUsYykpKX0sZj1mdW5jdGlvbigpe3ZhciBiLGM9YS5sZW5ndGg7aWYoYylmb3IoYj0wO2M+YjtiKyspZShhW2JdKX0sZz1CKGYpO3JldHVybntfOmZ1bmN0aW9uKCl7YT1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYy5hdXRvc2l6ZXNDbGFzcyksaShcInJlc2l6ZVwiLGcpfSxjaGVja0VsZW1zOmcsdXBkYXRlRWxlbTplfX0oKSxFPWZ1bmN0aW9uKCl7RS5pfHwoRS5pPSEwLEQuXygpLEMuXygpKX07cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGIsZD17bGF6eUNsYXNzOlwibGF6eWxvYWRcIixsb2FkZWRDbGFzczpcImxhenlsb2FkZWRcIixsb2FkaW5nQ2xhc3M6XCJsYXp5bG9hZGluZ1wiLHByZWxvYWRDbGFzczpcImxhenlwcmVsb2FkXCIsZXJyb3JDbGFzczpcImxhenllcnJvclwiLGF1dG9zaXplc0NsYXNzOlwibGF6eWF1dG9zaXplc1wiLHNyY0F0dHI6XCJkYXRhLXNyY1wiLHNyY3NldEF0dHI6XCJkYXRhLXNyY3NldFwiLHNpemVzQXR0cjpcImRhdGEtc2l6ZXNcIixtaW5TaXplOjQwLGN1c3RvbU1lZGlhOnt9LGluaXQ6ITAsZXhwRmFjdG9yOjEuNSxoRmFjOi44LGxvYWRNb2RlOjJ9O2M9YS5sYXp5U2l6ZXNDb25maWd8fGEubGF6eXNpemVzQ29uZmlnfHx7fTtmb3IoYiBpbiBkKWIgaW4gY3x8KGNbYl09ZFtiXSk7YS5sYXp5U2l6ZXNDb25maWc9YyxqKGZ1bmN0aW9uKCl7Yy5pbml0JiZFKCl9KX0oKSx7Y2ZnOmMsYXV0b1NpemVyOkQsbG9hZGVyOkMsaW5pdDpFLHVQOnYsYUM6cixyQzpzLGhDOnEsZmlyZTp1LGdXOngsckFGOnl9fX0pOyIsIi8qXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xuIF9fX3wgKF8pIF9fX3wgfCBfXyAgKF8pX19fXG4vIF9ffCB8IHwvIF9ffCB8LyAvICB8IC8gX198XG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxufF9fXy9ffF98XFxfX198X3xcXF8oXykvIHxfX18vXG4gICAgICAgICAgICAgICAgICAgfF9fL1xuXG4gVmVyc2lvbjogMS42LjBcbiAgQXV0aG9yOiBLZW4gV2hlZWxlclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xuICAgIERvY3M6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pby9zbGlja1xuICAgIFJlcG86IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2tcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cblxufShmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBTbGljayA9IHdpbmRvdy5TbGljayB8fCB7fTtcblxuICAgIFNsaWNrID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnN0YW5jZVVpZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gU2xpY2soZWxlbWVudCwgc2V0dGluZ3MpIHtcblxuICAgICAgICAgICAgdmFyIF8gPSB0aGlzLCBkYXRhU2V0dGluZ3M7XG5cbiAgICAgICAgICAgIF8uZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kQXJyb3dzOiAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGFwcGVuZERvdHM6ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFzTmF2Rm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIHByZXZBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLXByZXZcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwiYnV0dG9uXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLW5leHRcIiBhcmlhLWxhYmVsPVwiTmV4dFwiIHRhYmluZGV4PVwiMFwiIHJvbGU9XCJidXR0b25cIj5OZXh0PC9idXR0b24+JyxcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogMzAwMCxcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNTBweCcsXG4gICAgICAgICAgICAgICAgY3NzRWFzZTogJ2Vhc2UnLFxuICAgICAgICAgICAgICAgIGN1c3RvbVBhZ2luZzogZnVuY3Rpb24oc2xpZGVyLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgcm9sZT1cImJ1dHRvblwiIHRhYmluZGV4PVwiMFwiIC8+JykudGV4dChpICsgMSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkb3RzQ2xhc3M6ICdzbGljay1kb3RzJyxcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZWFzaW5nOiAnbGluZWFyJyxcbiAgICAgICAgICAgICAgICBlZGdlRnJpY3Rpb246IDAuMzUsXG4gICAgICAgICAgICAgICAgZmFkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5pdGlhbFNsaWRlOiAwLFxuICAgICAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxuICAgICAgICAgICAgICAgIG1vYmlsZUZpcnN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uSG92ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Eb3RzSG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc3BvbmRUbzogJ3dpbmRvdycsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICByb3dzOiAxLFxuICAgICAgICAgICAgICAgIHJ0bDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGU6ICcnLFxuICAgICAgICAgICAgICAgIHNsaWRlc1BlclJvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgICAgc3BlZWQ6IDUwMCxcbiAgICAgICAgICAgICAgICBzd2lwZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzd2lwZVRvU2xpZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvdWNoTW92ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0b3VjaFRocmVzaG9sZDogNSxcbiAgICAgICAgICAgICAgICB1c2VDU1M6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlVHJhbnNmb3JtOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlV2lkdGg6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbFN3aXBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdhaXRGb3JBbmltYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHpJbmRleDogMTAwMFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgXy5pbml0aWFscyA9IHtcbiAgICAgICAgICAgICAgICBhbmltYXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRyYWdnaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvUGxheVRpbWVyOiBudWxsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnREaXJlY3Rpb246IDAsXG4gICAgICAgICAgICAgICAgY3VycmVudExlZnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudFNsaWRlOiAwLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMSxcbiAgICAgICAgICAgICAgICAkZG90czogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0V2lkdGg6IG51bGwsXG4gICAgICAgICAgICAgICAgbGlzdEhlaWdodDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb2FkSW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgJG5leHRBcnJvdzogbnVsbCxcbiAgICAgICAgICAgICAgICAkcHJldkFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgIHNsaWRlQ291bnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICAkc2xpZGVUcmFjazogbnVsbCxcbiAgICAgICAgICAgICAgICAkc2xpZGVzOiBudWxsLFxuICAgICAgICAgICAgICAgIHNsaWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgIHN3aXBlTGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICAkbGlzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0b3VjaE9iamVjdDoge30sXG4gICAgICAgICAgICAgICAgdHJhbnNmb3Jtc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHVuc2xpY2tlZDogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKF8sIF8uaW5pdGlhbHMpO1xuXG4gICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMgPSBbXTtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzID0gW107XG4gICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBfLmZvY3Vzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBfLmhpZGRlbiA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgXy5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgXy5wb3NpdGlvblByb3AgPSBudWxsO1xuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBudWxsO1xuICAgICAgICAgICAgXy5yb3dDb3VudCA9IDE7XG4gICAgICAgICAgICBfLnNob3VsZENsaWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIF8uJHNsaWRlciA9ICQoZWxlbWVudCk7XG4gICAgICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IG51bGw7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAndmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICBfLndpbmRvd1dpZHRoID0gMDtcbiAgICAgICAgICAgIF8ud2luZG93VGltZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBkYXRhU2V0dGluZ3MgPSAkKGVsZW1lbnQpLmRhdGEoJ3NsaWNrJykgfHwge307XG5cbiAgICAgICAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLmRlZmF1bHRzLCBzZXR0aW5ncywgZGF0YVNldHRpbmdzKTtcblxuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuXG4gICAgICAgICAgICBfLm9yaWdpbmFsU2V0dGluZ3MgPSBfLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ21vekhpZGRlbic7XG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ21venZpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ3dlYmtpdEhpZGRlbic7XG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3dlYmtpdHZpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmF1dG9QbGF5ID0gJC5wcm94eShfLmF1dG9QbGF5LCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhciA9ICQucHJveHkoXy5hdXRvUGxheUNsZWFyLCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlJdGVyYXRvciA9ICQucHJveHkoXy5hdXRvUGxheUl0ZXJhdG9yLCBfKTtcbiAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUgPSAkLnByb3h5KF8uY2hhbmdlU2xpZGUsIF8pO1xuICAgICAgICAgICAgXy5jbGlja0hhbmRsZXIgPSAkLnByb3h5KF8uY2xpY2tIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uc2VsZWN0SGFuZGxlciA9ICQucHJveHkoXy5zZWxlY3RIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uc2V0UG9zaXRpb24gPSAkLnByb3h5KF8uc2V0UG9zaXRpb24sIF8pO1xuICAgICAgICAgICAgXy5zd2lwZUhhbmRsZXIgPSAkLnByb3h5KF8uc3dpcGVIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uZHJhZ0hhbmRsZXIgPSAkLnByb3h5KF8uZHJhZ0hhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5rZXlIYW5kbGVyID0gJC5wcm94eShfLmtleUhhbmRsZXIsIF8pO1xuXG4gICAgICAgICAgICBfLmluc3RhbmNlVWlkID0gaW5zdGFuY2VVaWQrKztcblxuICAgICAgICAgICAgLy8gQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3NcbiAgICAgICAgICAgIC8vIFN0cmljdCBIVE1MIHJlY29nbml0aW9uIChtdXN0IHN0YXJ0IHdpdGggPClcbiAgICAgICAgICAgIC8vIEV4dHJhY3RlZCBmcm9tIGpRdWVyeSB2MS4xMSBzb3VyY2VcbiAgICAgICAgICAgIF8uaHRtbEV4cHIgPSAvXig/OlxccyooPFtcXHdcXFddKz4pW14+XSopJC87XG5cblxuICAgICAgICAgICAgXy5yZWdpc3RlckJyZWFrcG9pbnRzKCk7XG4gICAgICAgICAgICBfLmluaXQodHJ1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTbGljaztcblxuICAgIH0oKSk7XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWN0aXZhdGVBREEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWFjdGl2ZScpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ1xuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICcwJ1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWRkU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tBZGQgPSBmdW5jdGlvbihtYXJrdXAsIGluZGV4LCBhZGRCZWZvcmUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgYWRkQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwIHx8IChpbmRleCA+PSBfLnNsaWRlQ291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwICYmIF8uJHNsaWRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFkZEJlZm9yZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRCZWZvcmUoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRBZnRlcihfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZGRCZWZvcmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZUhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHRcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVTbGlkZSA9IGZ1bmN0aW9uKHRhcmdldExlZnQsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIGFuaW1Qcm9wcyA9IHt9LFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudExlZnQgPSAtKF8uY3VycmVudExlZnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiBfLmN1cnJlbnRMZWZ0XG4gICAgICAgICAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiBfLm9wdGlvbnMuZWFzaW5nLFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbihub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IE1hdGguY2VpbChub3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoMHB4LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoMHB4LCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE5hdlRhcmdldCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gXy5vcHRpb25zLmFzTmF2Rm9yO1xuXG4gICAgICAgIGlmICggYXNOYXZGb3IgJiYgYXNOYXZGb3IgIT09IG51bGwgKSB7XG4gICAgICAgICAgICBhc05hdkZvciA9ICQoYXNOYXZGb3IpLm5vdChfLiRzbGlkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFzTmF2Rm9yO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hc05hdkZvciA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLmdldE5hdlRhcmdldCgpO1xuXG4gICAgICAgIGlmICggYXNOYXZGb3IgIT09IG51bGwgJiYgdHlwZW9mIGFzTmF2Rm9yID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICAgIGFzTmF2Rm9yLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuc2xpY2soJ2dldFNsaWNrJyk7XG4gICAgICAgICAgICAgICAgaWYoIXRhcmdldC51bnNsaWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNsaWRlSGFuZGxlcihpbmRleCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXBwbHlUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9IF8udHJhbnNmb3JtVHlwZSArICcgJyArIF8ub3B0aW9ucy5zcGVlZCArICdtcyAnICsgXy5vcHRpb25zLmNzc0Vhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gJ29wYWNpdHkgJyArIF8ub3B0aW9ucy5zcGVlZCArICdtcyAnICsgXy5vcHRpb25zLmNzc0Vhc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZSkuY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgICAgIGlmICggXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlUaW1lciA9IHNldEludGVydmFsKCBfLmF1dG9QbGF5SXRlcmF0b3IsIF8ub3B0aW9ucy5hdXRvcGxheVNwZWVkICk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlDbGVhciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5hdXRvUGxheVRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlJdGVyYXRvciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlVG8gPSBfLmN1cnJlbnRTbGlkZSArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICBpZiAoICFfLnBhdXNlZCAmJiAhXy5pbnRlcnJ1cHRlZCAmJiAhXy5mb2N1c3NlZCApIHtcblxuICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBfLmRpcmVjdGlvbiA9PT0gMSAmJiAoIF8uY3VycmVudFNsaWRlICsgMSApID09PSAoIF8uc2xpZGVDb3VudCAtIDEgKSkge1xuICAgICAgICAgICAgICAgICAgICBfLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIF8uZGlyZWN0aW9uID09PSAwICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlVG8gPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIF8uY3VycmVudFNsaWRlIC0gMSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBzbGlkZVRvICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZEFycm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93ID0gJChfLm9wdGlvbnMucHJldkFycm93KS5hZGRDbGFzcygnc2xpY2stYXJyb3cnKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XG5cbiAgICAgICAgICAgIGlmKCBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCcpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2staGlkZGVuJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXgnKTtcblxuICAgICAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnByZXBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5uZXh0QXJyb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LmFkZCggXy4kbmV4dEFycm93IClcblxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcmlhLWRpc2FibGVkJzogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGREb3RzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgZG90O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stZG90dGVkJyk7XG5cbiAgICAgICAgICAgIGRvdCA9ICQoJzx1bCAvPicpLmFkZENsYXNzKF8ub3B0aW9ucy5kb3RzQ2xhc3MpO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IF8uZ2V0RG90Q291bnQoKTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZG90LmFwcGVuZCgkKCc8bGkgLz4nKS5hcHBlbmQoXy5vcHRpb25zLmN1c3RvbVBhZ2luZy5jYWxsKHRoaXMsIF8sIGkpKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJGRvdHMgPSBkb3QuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZERvdHMpO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkT3V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9XG4gICAgICAgICAgICBfLiRzbGlkZXJcbiAgICAgICAgICAgICAgICAuY2hpbGRyZW4oIF8ub3B0aW9ucy5zbGlkZSArICc6bm90KC5zbGljay1jbG9uZWQpJylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KVxuICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpXG4gICAgICAgICAgICAgICAgLmRhdGEoJ29yaWdpbmFsU3R5bGluZycsICQoZWxlbWVudCkuYXR0cignc3R5bGUnKSB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stc2xpZGVyJyk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjayA9IChfLnNsaWRlQ291bnQgPT09IDApID9cbiAgICAgICAgICAgICQoJzxkaXYgY2xhc3M9XCJzbGljay10cmFja1wiLz4nKS5hcHBlbmRUbyhfLiRzbGlkZXIpIDpcbiAgICAgICAgICAgIF8uJHNsaWRlcy53cmFwQWxsKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykucGFyZW50KCk7XG5cbiAgICAgICAgXy4kbGlzdCA9IF8uJHNsaWRlVHJhY2sud3JhcChcbiAgICAgICAgICAgICc8ZGl2IGFyaWEtbGl2ZT1cInBvbGl0ZVwiIGNsYXNzPVwic2xpY2stbGlzdFwiLz4nKS5wYXJlbnQoKTtcbiAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoJ29wYWNpdHknLCAwKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgfHwgXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyKS5ub3QoJ1tzcmNdJykuYWRkQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgICAgICBfLnNldHVwSW5maW5pdGUoKTtcblxuICAgICAgICBfLmJ1aWxkQXJyb3dzKCk7XG5cbiAgICAgICAgXy5idWlsZERvdHMoKTtcblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcblxuXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKHR5cGVvZiBfLmN1cnJlbnRTbGlkZSA9PT0gJ251bWJlcicgPyBfLmN1cnJlbnRTbGlkZSA6IDApO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0LmFkZENsYXNzKCdkcmFnZ2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZFJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGEsIGIsIGMsIG5ld1NsaWRlcywgbnVtT2ZTbGlkZXMsIG9yaWdpbmFsU2xpZGVzLHNsaWRlc1BlclNlY3Rpb247XG5cbiAgICAgICAgbmV3U2xpZGVzID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlci5jaGlsZHJlbigpO1xuXG4gICAgICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMSkge1xuXG4gICAgICAgICAgICBzbGlkZXNQZXJTZWN0aW9uID0gXy5vcHRpb25zLnNsaWRlc1BlclJvdyAqIF8ub3B0aW9ucy5yb3dzO1xuICAgICAgICAgICAgbnVtT2ZTbGlkZXMgPSBNYXRoLmNlaWwoXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMubGVuZ3RoIC8gc2xpZGVzUGVyU2VjdGlvblxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZm9yKGEgPSAwOyBhIDwgbnVtT2ZTbGlkZXM7IGErKyl7XG4gICAgICAgICAgICAgICAgdmFyIHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZm9yKGIgPSAwOyBiIDwgXy5vcHRpb25zLnJvd3M7IGIrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcihjID0gMDsgYyA8IF8ub3B0aW9ucy5zbGlkZXNQZXJSb3c7IGMrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IChhICogc2xpZGVzUGVyU2VjdGlvbiArICgoYiAqIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgYykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsU2xpZGVzLmdldCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKG9yaWdpbmFsU2xpZGVzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzbGlkZS5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTbGlkZXMuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRzbGlkZXIuZW1wdHkoKS5hcHBlbmQobmV3U2xpZGVzKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5jaGlsZHJlbigpLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAnd2lkdGgnOigxMDAgLyBfLm9wdGlvbnMuc2xpZGVzUGVyUm93KSArICclJyxcbiAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hlY2tSZXNwb25zaXZlID0gZnVuY3Rpb24oaW5pdGlhbCwgZm9yY2VVcGRhdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBicmVha3BvaW50LCB0YXJnZXRCcmVha3BvaW50LCByZXNwb25kVG9XaWR0aCwgdHJpZ2dlckJyZWFrcG9pbnQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHNsaWRlcldpZHRoID0gXy4kc2xpZGVyLndpZHRoKCk7XG4gICAgICAgIHZhciB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS53aWR0aCgpO1xuXG4gICAgICAgIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gd2luZG93V2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdzbGlkZXInKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHNsaWRlcldpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ucmVzcG9uZFRvID09PSAnbWluJykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCwgc2xpZGVyV2lkdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucmVzcG9uc2l2ZSAmJlxuICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUubGVuZ3RoICYmXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZSAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yIChicmVha3BvaW50IGluIF8uYnJlYWtwb2ludHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50cy5oYXNPd25Qcm9wZXJ0eShicmVha3BvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcmlnaW5hbFNldHRpbmdzLm1vYmlsZUZpcnN0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbmRUb1dpZHRoIDwgXy5icmVha3BvaW50c1ticmVha3BvaW50XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbmRUb1dpZHRoID4gXy5icmVha3BvaW50c1ticmVha3BvaW50XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldEJyZWFrcG9pbnQgIT09IF8uYWN0aXZlQnJlYWtwb2ludCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludFNldHRpbmdzW3RhcmdldEJyZWFrcG9pbnRdID09PSAndW5zbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnVuc2xpY2sodGFyZ2V0QnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLm9yaWdpbmFsU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludFNldHRpbmdzW3RhcmdldEJyZWFrcG9pbnRdID09PSAndW5zbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljayh0YXJnZXRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLm9yaWdpbmFsU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gXy5vcmlnaW5hbFNldHRpbmdzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyIGJyZWFrcG9pbnRzIGR1cmluZyBhbiBhY3R1YWwgYnJlYWsuIG5vdCBvbiBpbml0aWFsaXplLlxuICAgICAgICAgICAgaWYoICFpbml0aWFsICYmIHRyaWdnZXJCcmVha3BvaW50ICE9PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYnJlYWtwb2ludCcsIFtfLCB0cmlnZ2VyQnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoYW5nZVNsaWRlID0gZnVuY3Rpb24oZXZlbnQsIGRvbnRBbmltYXRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgJHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCksXG4gICAgICAgICAgICBpbmRleE9mZnNldCwgc2xpZGVPZmZzZXQsIHVuZXZlbk9mZnNldDtcblxuICAgICAgICAvLyBJZiB0YXJnZXQgaXMgYSBsaW5rLCBwcmV2ZW50IGRlZmF1bHQgYWN0aW9uLlxuICAgICAgICBpZigkdGFyZ2V0LmlzKCdhJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0YXJnZXQgaXMgbm90IHRoZSA8bGk+IGVsZW1lbnQgKGllOiBhIGNoaWxkKSwgZmluZCB0aGUgPGxpPi5cbiAgICAgICAgaWYoISR0YXJnZXQuaXMoJ2xpJykpIHtcbiAgICAgICAgICAgICR0YXJnZXQgPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG4gICAgICAgIH1cblxuICAgICAgICB1bmV2ZW5PZmZzZXQgPSAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKTtcbiAgICAgICAgaW5kZXhPZmZzZXQgPSB1bmV2ZW5PZmZzZXQgPyAwIDogKF8uc2xpZGVDb3VudCAtIF8uY3VycmVudFNsaWRlKSAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmRhdGEubWVzc2FnZSkge1xuXG4gICAgICAgICAgICBjYXNlICdwcmV2aW91cyc6XG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQgPSBpbmRleE9mZnNldCA9PT0gMCA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSBpbmRleE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSAtIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQgPSBpbmRleE9mZnNldCA9PT0gMCA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IGluZGV4T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdpbmRleCc6XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZXZlbnQuZGF0YS5pbmRleCA9PT0gMCA/IDAgOlxuICAgICAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4IHx8ICR0YXJnZXQuaW5kZXgoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY2hlY2tOYXZpZ2FibGUoaW5kZXgpLCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgICR0YXJnZXQuY2hpbGRyZW4oKS50cmlnZ2VyKCdmb2N1cycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja05hdmlnYWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbmF2aWdhYmxlcywgcHJldk5hdmlnYWJsZTtcblxuICAgICAgICBuYXZpZ2FibGVzID0gXy5nZXROYXZpZ2FibGVJbmRleGVzKCk7XG4gICAgICAgIHByZXZOYXZpZ2FibGUgPSAwO1xuICAgICAgICBpZiAoaW5kZXggPiBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICAgIGluZGV4ID0gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBuYXZpZ2FibGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgbmF2aWdhYmxlc1tuXSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHByZXZOYXZpZ2FibGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2TmF2aWdhYmxlID0gbmF2aWdhYmxlc1tuXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzICYmIF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgLm9mZignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci5vZmYoJ2ZvY3VzLnNsaWNrIGJsdXIuc2xpY2snKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2htb3ZlLnNsaWNrIG1vdXNlbW92ZS5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vZmYoXy52aXNpYmlsaXR5Q2hhbmdlLCBfLnZpc2liaWxpdHkpO1xuXG4gICAgICAgIF8uY2xlYW5VcFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vZmYoJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQod2luZG93KS5vZmYoJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLm9yaWVudGF0aW9uQ2hhbmdlKTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ucmVzaXplKTtcblxuICAgICAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9mZignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZigncmVhZHkuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwU2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSk7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIG9yaWdpbmFsU2xpZGVzO1xuXG4gICAgICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMSkge1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXMuY2hpbGRyZW4oKS5jaGlsZHJlbigpO1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChvcmlnaW5hbFNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uc2hvdWxkQ2xpY2sgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24ocmVmcmVzaCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG5cbiAgICAgICAgXy5jbGVhblVwRXZlbnRzKCk7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikuZGV0YWNoKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICggXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvd1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQgc2xpY2stYXJyb3cgc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gYXJpYS1kaXNhYmxlZCB0YWJpbmRleCcpXG4gICAgICAgICAgICAgICAgLmNzcygnZGlzcGxheScsJycpO1xuXG4gICAgICAgICAgICBpZiAoIF8uaHRtbEV4cHIudGVzdCggXy5vcHRpb25zLnByZXZBcnJvdyApKSB7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLiRuZXh0QXJyb3cgJiYgXy4kbmV4dEFycm93Lmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCBzbGljay1hcnJvdyBzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywnJyk7XG5cbiAgICAgICAgICAgIGlmICggXy5odG1sRXhwci50ZXN0KCBfLm9wdGlvbnMubmV4dEFycm93ICkpIHtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKF8uJHNsaWRlcykge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXNsaWNrLWluZGV4JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3N0eWxlJywgJCh0aGlzKS5kYXRhKCdvcmlnaW5hbFN0eWxpbmcnKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kbGlzdC5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLmFwcGVuZChfLiRzbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5jbGVhblVwUm93cygpO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGVyJyk7XG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1kb3R0ZWQnKTtcblxuICAgICAgICBfLnVuc2xpY2tlZCA9IHRydWU7XG5cbiAgICAgICAgaWYoIXJlZnJlc2gpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdkZXN0cm95JywgW19dKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5kaXNhYmxlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNsaWRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHt9O1xuXG4gICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnJztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZSkuY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZhZGVTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlT3V0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMlxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0ZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsdGVyICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmZpbHRlcihmaWx0ZXIpLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZm9jdXNIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpXG4gICAgICAgICAgICAub24oJ2ZvY3VzLnNsaWNrIGJsdXIuc2xpY2snLFxuICAgICAgICAgICAgICAgICcqOm5vdCguc2xpY2stYXJyb3cpJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB2YXIgJHNmID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucGF1c2VPbkZvY3VzICkge1xuICAgICAgICAgICAgICAgICAgICBfLmZvY3Vzc2VkID0gJHNmLmlzKCc6Zm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQ3VycmVudFNsaWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5jdXJyZW50U2xpZGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldERvdENvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciBicmVha1BvaW50ID0gMDtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgcGFnZXJRdHkgPSAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgKytwYWdlclF0eTtcbiAgICAgICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcGFnZXJRdHkgPSBfLnNsaWRlQ291bnQ7XG4gICAgICAgIH0gZWxzZSBpZighXy5vcHRpb25zLmFzTmF2Rm9yKSB7XG4gICAgICAgICAgICBwYWdlclF0eSA9IDEgKyBNYXRoLmNlaWwoKF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhZ2VyUXR5IC0gMTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgdmVydGljYWxIZWlnaHQsXG4gICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9IDAsXG4gICAgICAgICAgICB0YXJnZXRTbGlkZTtcblxuICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgdmVydGljYWxIZWlnaHQgPSBfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoXy5zbGlkZVdpZHRoICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICh2ZXJ0aWNhbEhlaWdodCAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPiBfLnNsaWRlQ291bnQgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIHZlcnRpY2FsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgLSBfLnNsaWRlV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogXy5zbGlkZVdpZHRoKSAqIC0xKSArIF8uc2xpZGVPZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogdmVydGljYWxIZWlnaHQpICogLTEpICsgdmVydGljYWxPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdGFyZ2V0U2xpZGVbMF0gPyB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0ICogLTEgOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAoXy4kc2xpZGVUcmFjay53aWR0aCgpIC0gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAtIHRhcmdldFNsaWRlLndpZHRoKCkpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gIDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdGFyZ2V0U2xpZGVbMF0gPyB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0ICogLTEgOiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgKz0gKF8uJGxpc3Qud2lkdGgoKSAtIHRhcmdldFNsaWRlLm91dGVyV2lkdGgoKSkgLyAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldExlZnQ7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICByZXR1cm4gXy5vcHRpb25zW29wdGlvbl07XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE5hdmlnYWJsZUluZGV4ZXMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBicmVha1BvaW50ID0gMCxcbiAgICAgICAgICAgIGNvdW50ZXIgPSAwLFxuICAgICAgICAgICAgaW5kZXhlcyA9IFtdLFxuICAgICAgICAgICAgbWF4O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVha1BvaW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBjb3VudGVyID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQgKiAyO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChicmVha1BvaW50KTtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXhlcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpZGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlc1RyYXZlcnNlZCwgc3dpcGVkU2xpZGUsIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIDogMDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stc2xpZGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZS5vZmZzZXRMZWZ0IC0gY2VudGVyT2Zmc2V0ICsgKCQoc2xpZGUpLm91dGVyV2lkdGgoKSAvIDIpID4gKF8uc3dpcGVMZWZ0ICogLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZFNsaWRlID0gc2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkID0gTWF0aC5hYnMoJChzd2lwZWRTbGlkZSkuYXR0cignZGF0YS1zbGljay1pbmRleCcpIC0gXy5jdXJyZW50U2xpZGUpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRvbnRBbmltYXRlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNyZWF0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICghJChfLiRzbGlkZXIpLmhhc0NsYXNzKCdzbGljay1pbml0aWFsaXplZCcpKSB7XG5cbiAgICAgICAgICAgICQoXy4kc2xpZGVyKS5hZGRDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgICAgICAgICAgXy5idWlsZFJvd3MoKTtcbiAgICAgICAgICAgIF8uYnVpbGRPdXQoKTtcbiAgICAgICAgICAgIF8uc2V0UHJvcHMoKTtcbiAgICAgICAgICAgIF8uc3RhcnRMb2FkKCk7XG4gICAgICAgICAgICBfLmxvYWRTbGlkZXIoKTtcbiAgICAgICAgICAgIF8uaW5pdGlhbGl6ZUV2ZW50cygpO1xuICAgICAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcbiAgICAgICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUodHJ1ZSk7XG4gICAgICAgICAgICBfLmZvY3VzSGFuZGxlcigpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3JlYXRpb24pIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdpbml0JywgW19dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5pbml0QURBKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcblxuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBREEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICBfLiRzbGlkZXMuYWRkKF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpKS5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgfSkuZmluZCgnYSwgaW5wdXQsIGJ1dHRvbiwgc2VsZWN0JykuYXR0cih7XG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXR0cigncm9sZScsICdsaXN0Ym94Jyk7XG5cbiAgICAgICAgXy4kc2xpZGVzLm5vdChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoe1xuICAgICAgICAgICAgICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgICAgICAgICAgICAgJ2FyaWEtZGVzY3JpYmVkYnknOiAnc2xpY2stc2xpZGUnICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChfLiRkb3RzICE9PSBudWxsKSB7XG4gICAgICAgICAgICBfLiRkb3RzLmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpLmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgJ3JvbGUnOiAncHJlc2VudGF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnLFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1jb250cm9scyc6ICduYXZpZ2F0aW9uJyArIF8uaW5zdGFuY2VVaWQgKyBpICsgJycsXG4gICAgICAgICAgICAgICAgICAgICdpZCc6ICdzbGljay1zbGlkZScgKyBfLmluc3RhbmNlVWlkICsgaSArICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maXJzdCgpLmF0dHIoJ2FyaWEtc2VsZWN0ZWQnLCAndHJ1ZScpLmVuZCgpXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2J1dHRvbicpLmF0dHIoJ3JvbGUnLCAnYnV0dG9uJykuZW5kKClcbiAgICAgICAgICAgICAgICAuY2xvc2VzdCgnZGl2JykuYXR0cigncm9sZScsICd0b29sYmFyJyk7XG4gICAgICAgIH1cbiAgICAgICAgXy5hY3RpdmF0ZUFEQSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0QXJyb3dFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAncHJldmlvdXMnXG4gICAgICAgICAgICAgICB9LCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvd1xuICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ25leHQnXG4gICAgICAgICAgICAgICB9LCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0RG90RXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpLm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnXG4gICAgICAgICAgICB9LCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5vcHRpb25zLnBhdXNlT25Eb3RzSG92ZXIgPT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cylcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdFNsaWRlRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLnBhdXNlT25Ib3ZlciApIHtcblxuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKTtcbiAgICAgICAgICAgIF8uJGxpc3Qub24oJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmluaXRBcnJvd0V2ZW50cygpO1xuXG4gICAgICAgIF8uaW5pdERvdEV2ZW50cygpO1xuICAgICAgICBfLmluaXRTbGlkZUV2ZW50cygpO1xuXG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2htb3ZlLnNsaWNrIG1vdXNlbW92ZS5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ21vdmUnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hlbmQuc2xpY2sgbW91c2V1cC5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2VuZCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG5cbiAgICAgICAgXy4kbGlzdC5vbignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oXy52aXNpYmlsaXR5Q2hhbmdlLCAkLnByb3h5KF8udmlzaWJpbGl0eSwgXykpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLm9yaWVudGF0aW9uQ2hhbmdlLCBfKSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsICQucHJveHkoXy5yZXNpemUsIF8pKTtcblxuICAgICAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9uKCdkcmFnc3RhcnQnLCBfLnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuICAgICAgICAkKGRvY3VtZW50KS5vbigncmVhZHkuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0VUkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cuc2hvdygpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5zaG93KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5rZXlIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgICAvL0RvbnQgc2xpZGUgaWYgdGhlIGN1cnNvciBpcyBpbnNpZGUgdGhlIGZvcm0gZmllbGRzIGFuZCBhcnJvdyBrZXlzIGFyZSBwcmVzc2VkXG4gICAgICAgIGlmKCFldmVudC50YXJnZXQudGFnTmFtZS5tYXRjaCgnVEVYVEFSRUF8SU5QVVR8U0VMRUNUJykpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzNyAmJiBfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBfLm9wdGlvbnMucnRsID09PSB0cnVlID8gJ25leHQnIDogICdwcmV2aW91cydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSAmJiBfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBfLm9wdGlvbnMucnRsID09PSB0cnVlID8gJ3ByZXZpb3VzJyA6ICduZXh0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBsb2FkUmFuZ2UsIGNsb25lUmFuZ2UsIHJhbmdlU3RhcnQsIHJhbmdlRW5kO1xuXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRJbWFnZXMoaW1hZ2VzU2NvcGUpIHtcblxuICAgICAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBpbWFnZXNTY29wZSkuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGltYWdlU291cmNlID0gJCh0aGlzKS5hdHRyKCdkYXRhLWxhenknKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7IG9wYWNpdHk6IDAgfSwgMTAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgaW1hZ2VTb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2xhenlMb2FkZWQnLCBbXywgaW1hZ2UsIGltYWdlU291cmNlXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCAnZGF0YS1sYXp5JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdzbGljay1sb2FkaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdzbGljay1sYXp5bG9hZC1lcnJvcicgKTtcblxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRFcnJvcicsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IF8uY3VycmVudFNsaWRlICsgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSk7XG4gICAgICAgICAgICAgICAgcmFuZ2VFbmQgPSByYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhbmdlU3RhcnQgPSBNYXRoLm1heCgwLCBfLmN1cnJlbnRTbGlkZSAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IDIgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKSArIF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFuZ2VTdGFydCA9IF8ub3B0aW9ucy5pbmZpbml0ZSA/IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBfLmN1cnJlbnRTbGlkZSA6IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgcmFuZ2VFbmQgPSBNYXRoLmNlaWwocmFuZ2VTdGFydCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlU3RhcnQgPiAwKSByYW5nZVN0YXJ0LS07XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlRW5kIDw9IF8uc2xpZGVDb3VudCkgcmFuZ2VFbmQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XG4gICAgICAgIGxvYWRJbWFnZXMobG9hZFJhbmdlKTtcblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKDAsIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA9PT0gMCkge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAqIC0xKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubG9hZFNsaWRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jc3Moe1xuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgICAgICBfLmluaXRVSSgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdwcm9ncmVzc2l2ZScpIHtcbiAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm5leHQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tOZXh0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUub3JpZW50YXRpb25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wYXVzZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BhdXNlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBsYXkgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQbGF5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgXy5vcHRpb25zLmF1dG9wbGF5ID0gdHJ1ZTtcbiAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgXy5mb2N1c3NlZCA9IGZhbHNlO1xuICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBvc3RTbGlkZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmKCAhXy51bnNsaWNrZWQgKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdhZnRlckNoYW5nZScsIFtfLCBpbmRleF0pO1xuXG4gICAgICAgICAgICBfLmFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmluaXRBREEoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByZXYgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQcmV2ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcm9ncmVzc2l2ZUxhenlMb2FkID0gZnVuY3Rpb24oIHRyeUNvdW50ICkge1xuXG4gICAgICAgIHRyeUNvdW50ID0gdHJ5Q291bnQgfHwgMTtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkaW1nc1RvTG9hZCA9ICQoICdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlciApLFxuICAgICAgICAgICAgaW1hZ2UsXG4gICAgICAgICAgICBpbWFnZVNvdXJjZSxcbiAgICAgICAgICAgIGltYWdlVG9Mb2FkO1xuXG4gICAgICAgIGlmICggJGltZ3NUb0xvYWQubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBpbWFnZSA9ICRpbWdzVG9Mb2FkLmZpcnN0KCk7XG4gICAgICAgICAgICBpbWFnZVNvdXJjZSA9IGltYWdlLmF0dHIoJ2RhdGEtbGF6eScpO1xuICAgICAgICAgICAgaW1hZ2VUb0xvYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAuYXR0ciggJ3NyYycsIGltYWdlU291cmNlIClcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIHRyeUNvdW50IDwgMyApIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdHJ5IHRvIGxvYWQgdGhlIGltYWdlIDMgdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAqIGxlYXZlIGEgc2xpZ2h0IGRlbGF5IHNvIHdlIGRvbid0IGdldFxuICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2ZXJzIGJsb2NraW5nIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoIHRyeUNvdW50ICsgMSApO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDAgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCAnZGF0YS1sYXp5JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdzbGljay1sb2FkaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdzbGljay1sYXp5bG9hZC1lcnJvcicgKTtcblxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRFcnJvcicsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5zcmMgPSBpbWFnZVNvdXJjZTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWxsSW1hZ2VzTG9hZGVkJywgWyBfIF0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCBpbml0aWFsaXppbmcgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBjdXJyZW50U2xpZGUsIGxhc3RWaXNpYmxlSW5kZXg7XG5cbiAgICAgICAgbGFzdFZpc2libGVJbmRleCA9IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG5cbiAgICAgICAgLy8gaW4gbm9uLWluZmluaXRlIHNsaWRlcnMsIHdlIGRvbid0IHdhbnQgdG8gZ28gcGFzdCB0aGVcbiAgICAgICAgLy8gbGFzdCB2aXNpYmxlIGluZGV4LlxuICAgICAgICBpZiggIV8ub3B0aW9ucy5pbmZpbml0ZSAmJiAoIF8uY3VycmVudFNsaWRlID4gbGFzdFZpc2libGVJbmRleCApKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGxhc3RWaXNpYmxlSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBsZXNzIHNsaWRlcyB0aGFuIHRvIHNob3csIGdvIHRvIHN0YXJ0LlxuICAgICAgICBpZiAoIF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcblxuICAgICAgICBfLmRlc3Ryb3kodHJ1ZSk7XG5cbiAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscywgeyBjdXJyZW50U2xpZGU6IGN1cnJlbnRTbGlkZSB9KTtcblxuICAgICAgICBfLmluaXQoKTtcblxuICAgICAgICBpZiggIWluaXRpYWxpemluZyApIHtcblxuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogY3VycmVudFNsaWRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVnaXN0ZXJCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYnJlYWtwb2ludCwgY3VycmVudEJyZWFrcG9pbnQsIGwsXG4gICAgICAgICAgICByZXNwb25zaXZlU2V0dGluZ3MgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZSB8fCBudWxsO1xuXG4gICAgICAgIGlmICggJC50eXBlKHJlc3BvbnNpdmVTZXR0aW5ncykgPT09ICdhcnJheScgJiYgcmVzcG9uc2l2ZVNldHRpbmdzLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBfLm9wdGlvbnMucmVzcG9uZFRvIHx8ICd3aW5kb3cnO1xuXG4gICAgICAgICAgICBmb3IgKCBicmVha3BvaW50IGluIHJlc3BvbnNpdmVTZXR0aW5ncyApIHtcblxuICAgICAgICAgICAgICAgIGwgPSBfLmJyZWFrcG9pbnRzLmxlbmd0aC0xO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRCcmVha3BvaW50ID0gcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLmJyZWFrcG9pbnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBicmVha3BvaW50cyBhbmQgY3V0IG91dCBhbnkgZXhpc3RpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gb25lcyB3aXRoIHRoZSBzYW1lIGJyZWFrcG9pbnQgbnVtYmVyLCB3ZSBkb24ndCB3YW50IGR1cGVzLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSggbCA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIF8uYnJlYWtwb2ludHNbbF0gJiYgXy5icmVha3BvaW50c1tsXSA9PT0gY3VycmVudEJyZWFrcG9pbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50cy5zcGxpY2UobCwxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGwtLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMucHVzaChjdXJyZW50QnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW2N1cnJlbnRCcmVha3BvaW50XSA9IHJlc3BvbnNpdmVTZXR0aW5nc1ticmVha3BvaW50XS5zZXR0aW5ncztcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoIF8ub3B0aW9ucy5tb2JpbGVGaXJzdCApID8gYS1iIDogYi1hO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWluaXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVzID1cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2tcbiAgICAgICAgICAgICAgICAuY2hpbGRyZW4oXy5vcHRpb25zLnNsaWRlKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcblxuICAgICAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgJiYgXy5jdXJyZW50U2xpZGUgIT09IDApIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5jdXJyZW50U2xpZGUgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIF8ucmVnaXN0ZXJCcmVha3BvaW50cygpO1xuXG4gICAgICAgIF8uc2V0UHJvcHMoKTtcbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcbiAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcbiAgICAgICAgXy5pbml0QXJyb3dFdmVudHMoKTtcbiAgICAgICAgXy5idWlsZERvdHMoKTtcbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIF8uaW5pdERvdEV2ZW50cygpO1xuICAgICAgICBfLmNsZWFuVXBTbGlkZUV2ZW50cygpO1xuICAgICAgICBfLmluaXRTbGlkZUV2ZW50cygpO1xuXG4gICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXModHlwZW9mIF8uY3VycmVudFNsaWRlID09PSAnbnVtYmVyJyA/IF8uY3VycmVudFNsaWRlIDogMCk7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICBfLmZvY3VzSGFuZGxlcigpO1xuXG4gICAgICAgIF8ucGF1c2VkID0gIV8ub3B0aW9ucy5hdXRvcGxheTtcbiAgICAgICAgXy5hdXRvUGxheSgpO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdyZUluaXQnLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCQod2luZG93KS53aWR0aCgpICE9PSBfLndpbmRvd1dpZHRoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoXy53aW5kb3dEZWxheSk7XG4gICAgICAgICAgICBfLndpbmRvd0RlbGF5ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgICAgICAgICAgaWYoICFfLnVuc2xpY2tlZCApIHsgXy5zZXRQb3NpdGlvbigpOyB9XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlbW92ZVNsaWRlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgsIHJlbW92ZUJlZm9yZSwgcmVtb3ZlQWxsKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHJlbW92ZUJlZm9yZSA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAwIDogXy5zbGlkZUNvdW50IC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gLS1pbmRleCA6IGluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8IDEgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gXy5zbGlkZUNvdW50IC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgICBpZiAocmVtb3ZlQWxsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZXEoaW5kZXgpLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmFwcGVuZChfLiRzbGlkZXMpO1xuXG4gICAgICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldENTUyA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgcG9zaXRpb25Qcm9wcyA9IHt9LFxuICAgICAgICAgICAgeCwgeTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcG9zaXRpb24gPSAtcG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgeCA9IF8ucG9zaXRpb25Qcm9wID09ICdsZWZ0JyA/IE1hdGguY2VpbChwb3NpdGlvbikgKyAncHgnIDogJzBweCc7XG4gICAgICAgIHkgPSBfLnBvc2l0aW9uUHJvcCA9PSAndG9wJyA/IE1hdGguY2VpbChwb3NpdGlvbikgKyAncHgnIDogJzBweCc7XG5cbiAgICAgICAgcG9zaXRpb25Qcm9wc1tfLnBvc2l0aW9uUHJvcF0gPSBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoXy50cmFuc2Zvcm1zRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb25Qcm9wcyA9IHt9O1xuICAgICAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArIHggKyAnLCAnICsgeSArICcpJztcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgeCArICcsICcgKyB5ICsgJywgMHB4KSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0RGltZW5zaW9ucyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kbGlzdC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAoJzBweCAnICsgXy5vcHRpb25zLmNlbnRlclBhZGRpbmcpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRsaXN0LmhlaWdodChfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kbGlzdC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAoXy5vcHRpb25zLmNlbnRlclBhZGRpbmcgKyAnIDBweCcpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLmxpc3RXaWR0aCA9IF8uJGxpc3Qud2lkdGgoKTtcbiAgICAgICAgXy5saXN0SGVpZ2h0ID0gXy4kbGlzdC5oZWlnaHQoKTtcblxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlICYmIF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoIC8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKE1hdGguY2VpbCgoXy5zbGlkZVdpZHRoICogXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykubGVuZ3RoKSkpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2sud2lkdGgoNTAwMCAqIF8uc2xpZGVDb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGgpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5oZWlnaHQoTWF0aC5jZWlsKChfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKSAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSBfLiRzbGlkZXMuZmlyc3QoKS5vdXRlcldpZHRoKHRydWUpIC0gXy4kc2xpZGVzLmZpcnN0KCkud2lkdGgoKTtcbiAgICAgICAgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSBmYWxzZSkgXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykud2lkdGgoXy5zbGlkZVdpZHRoIC0gb2Zmc2V0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0RmFkZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRhcmdldExlZnQ7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoXy5zbGlkZVdpZHRoICogaW5kZXgpICogLTE7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDIsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkuY3NzKHtcbiAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDEsXG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEgJiYgXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgICAgICAgXy4kbGlzdC5jc3MoJ2hlaWdodCcsIHRhcmdldEhlaWdodCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0T3B0aW9uID1cbiAgICBTbGljay5wcm90b3R5cGUuc2xpY2tTZXRPcHRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogYWNjZXB0cyBhcmd1bWVudHMgaW4gZm9ybWF0IG9mOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBmb3IgY2hhbmdpbmcgYSBzaW5nbGUgb3B0aW9uJ3MgdmFsdWU6XG4gICAgICAgICAqICAgICAuc2xpY2soXCJzZXRPcHRpb25cIiwgb3B0aW9uLCB2YWx1ZSwgcmVmcmVzaCApXG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciBjaGFuZ2luZyBhIHNldCBvZiByZXNwb25zaXZlIG9wdGlvbnM6XG4gICAgICAgICAqICAgICAuc2xpY2soXCJzZXRPcHRpb25cIiwgJ3Jlc3BvbnNpdmUnLCBbe30sIC4uLl0sIHJlZnJlc2ggKVxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBmb3IgdXBkYXRpbmcgbXVsdGlwbGUgdmFsdWVzIGF0IG9uY2UgKG5vdCByZXNwb25zaXZlKVxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsIHsgJ29wdGlvbic6IHZhbHVlLCAuLi4gfSwgcmVmcmVzaCApXG4gICAgICAgICAqL1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgbCwgaXRlbSwgb3B0aW9uLCB2YWx1ZSwgcmVmcmVzaCA9IGZhbHNlLCB0eXBlO1xuXG4gICAgICAgIGlmKCAkLnR5cGUoIGFyZ3VtZW50c1swXSApID09PSAnb2JqZWN0JyApIHtcblxuICAgICAgICAgICAgb3B0aW9uID0gIGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHJlZnJlc2ggPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB0eXBlID0gJ211bHRpcGxlJztcblxuICAgICAgICB9IGVsc2UgaWYgKCAkLnR5cGUoIGFyZ3VtZW50c1swXSApID09PSAnc3RyaW5nJyApIHtcblxuICAgICAgICAgICAgb3B0aW9uID0gIGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHZhbHVlID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgcmVmcmVzaCA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgICAgICAgaWYgKCBhcmd1bWVudHNbMF0gPT09ICdyZXNwb25zaXZlJyAmJiAkLnR5cGUoIGFyZ3VtZW50c1sxXSApID09PSAnYXJyYXknICkge1xuXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdyZXNwb25zaXZlJztcblxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIGFyZ3VtZW50c1sxXSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cbiAgICAgICAgICAgICAgICB0eXBlID0gJ3NpbmdsZSc7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0eXBlID09PSAnc2luZ2xlJyApIHtcblxuICAgICAgICAgICAgXy5vcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcblxuXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdtdWx0aXBsZScgKSB7XG5cbiAgICAgICAgICAgICQuZWFjaCggb3B0aW9uICwgZnVuY3Rpb24oIG9wdCwgdmFsICkge1xuXG4gICAgICAgICAgICAgICAgXy5vcHRpb25zW29wdF0gPSB2YWw7XG5cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ3Jlc3BvbnNpdmUnICkge1xuXG4gICAgICAgICAgICBmb3IgKCBpdGVtIGluIHZhbHVlICkge1xuXG4gICAgICAgICAgICAgICAgaWYoICQudHlwZSggXy5vcHRpb25zLnJlc3BvbnNpdmUgKSAhPT0gJ2FycmF5JyApIHtcblxuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZSA9IFsgdmFsdWVbaXRlbV0gXTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbCA9IF8ub3B0aW9ucy5yZXNwb25zaXZlLmxlbmd0aC0xO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgcmVzcG9uc2l2ZSBvYmplY3QgYW5kIHNwbGljZSBvdXQgZHVwbGljYXRlcy5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGwgPj0gMCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIF8ub3B0aW9ucy5yZXNwb25zaXZlW2xdLmJyZWFrcG9pbnQgPT09IHZhbHVlW2l0ZW1dLmJyZWFrcG9pbnQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5zcGxpY2UobCwxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsLS07XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLnB1c2goIHZhbHVlW2l0ZW1dICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCByZWZyZXNoICkge1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuICAgICAgICAgICAgXy5yZWluaXQoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIF8uc2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zZXRDU1MoXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnNldEZhZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzZXRQb3NpdGlvbicsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYm9keVN0eWxlID0gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gdHJ1ZSA/ICd0b3AnIDogJ2xlZnQnO1xuXG4gICAgICAgIGlmIChfLnBvc2l0aW9uUHJvcCA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5U3R5bGUuV2Via2l0VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUuTW96VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUubXNUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudXNlQ1NTID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jc3NUcmFuc2l0aW9ucyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5mYWRlICkge1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgXy5vcHRpb25zLnpJbmRleCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICAgICAgaWYoIF8ub3B0aW9ucy56SW5kZXggPCAzICkge1xuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuekluZGV4ID0gMztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8ub3B0aW9ucy56SW5kZXggPSBfLmRlZmF1bHRzLnpJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5U3R5bGUuT1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ09UcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy1vLXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ09UcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5Nb3pUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdNb3pUcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy1tb3otdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnTW96VHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUuTW96UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUud2Via2l0VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnd2Via2l0VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctd2Via2l0LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ3dlYmtpdFRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnbXNUcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy1tcy10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdtc1RyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS50cmFuc2Zvcm0gIT09IHVuZGVmaW5lZCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJ3RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ3RyYW5zaXRpb24nO1xuICAgICAgICB9XG4gICAgICAgIF8udHJhbnNmb3Jtc0VuYWJsZWQgPSBfLm9wdGlvbnMudXNlVHJhbnNmb3JtICYmIChfLmFuaW1UeXBlICE9PSBudWxsICYmIF8uYW5pbVR5cGUgIT09IGZhbHNlKTtcbiAgICB9O1xuXG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0U2xpZGVDbGFzc2VzID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQsIGFsbFNsaWRlcywgaW5kZXhPZmZzZXQsIHJlbWFpbmRlcjtcblxuICAgICAgICBhbGxTbGlkZXMgPSBfLiRzbGlkZXJcbiAgICAgICAgICAgIC5maW5kKCcuc2xpY2stc2xpZGUnKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUgc2xpY2stY2VudGVyIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgIC5lcShpbmRleClcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY3VycmVudCcpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IGNlbnRlck9mZnNldCAmJiBpbmRleCA8PSAoXy5zbGlkZUNvdW50IC0gMSkgLSBjZW50ZXJPZmZzZXQpIHtcblxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleCAtIGNlbnRlck9mZnNldCwgaW5kZXggKyBjZW50ZXJPZmZzZXQgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleE9mZnNldCAtIGNlbnRlck9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXEoYWxsU2xpZGVzLmxlbmd0aCAtIDEgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IF8uc2xpZGVDb3VudCAtIDEpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykpIHtcblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXgsIGluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbGxTbGlkZXMubGVuZ3RoIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmVtYWluZGVyID0gXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSA/IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleCA6IGluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIHJlbWFpbmRlciksIGluZGV4T2Zmc2V0ICsgcmVtYWluZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0LCBpbmRleE9mZnNldCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAnb25kZW1hbmQnKSB7XG4gICAgICAgICAgICBfLmxhenlMb2FkKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0dXBJbmZpbml0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGksIHNsaWRlSW5kZXgsIGluZmluaXRlQ291bnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLm9wdGlvbnMuY2VudGVyTW9kZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgc2xpZGVJbmRleCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IF8uc2xpZGVDb3VudDsgaSA+IChfLnNsaWRlQ291bnQgLVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCk7IGkgLT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICQoXy4kc2xpZGVzW3NsaWRlSW5kZXhdKS5jbG9uZSh0cnVlKS5hdHRyKCdpZCcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnByZXBlbmRUbyhfLiRzbGlkZVRyYWNrKS5hZGRDbGFzcygnc2xpY2stY2xvbmVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbmZpbml0ZUNvdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICQoXy4kc2xpZGVzW3NsaWRlSW5kZXhdKS5jbG9uZSh0cnVlKS5hdHRyKCdpZCcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBzbGlkZUluZGV4ICsgXy5zbGlkZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykuZmluZCgnW2lkXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignaWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmludGVycnVwdCA9IGZ1bmN0aW9uKCB0b2dnbGUgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmKCAhdG9nZ2xlICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0b2dnbGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNlbGVjdEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuaXMoJy5zbGljay1zbGlkZScpID9cbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkgOlxuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKCcuc2xpY2stc2xpZGUnKTtcblxuICAgICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh0YXJnZXRFbGVtZW50LmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSk7XG5cbiAgICAgICAgaWYgKCFpbmRleCkgaW5kZXggPSAwO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLnNldFNsaWRlQ2xhc3NlcyhpbmRleCk7XG4gICAgICAgICAgICBfLmFzTmF2Rm9yKGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy5zbGlkZUhhbmRsZXIoaW5kZXgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zbGlkZUhhbmRsZXIgPSBmdW5jdGlvbihpbmRleCwgc3luYywgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgdGFyZ2V0U2xpZGUsIGFuaW1TbGlkZSwgb2xkU2xpZGUsIHNsaWRlTGVmdCwgdGFyZ2V0TGVmdCA9IG51bGwsXG4gICAgICAgICAgICBfID0gdGhpcywgbmF2VGFyZ2V0O1xuXG4gICAgICAgIHN5bmMgPSBzeW5jIHx8IGZhbHNlO1xuXG4gICAgICAgIGlmIChfLmFuaW1hdGluZyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMud2FpdEZvckFuaW1hdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSAmJiBfLmN1cnJlbnRTbGlkZSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFzTmF2Rm9yKGluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFNsaWRlID0gaW5kZXg7XG4gICAgICAgIHRhcmdldExlZnQgPSBfLmdldExlZnQodGFyZ2V0U2xpZGUpO1xuICAgICAgICBzbGlkZUxlZnQgPSBfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8uY3VycmVudExlZnQgPSBfLnN3aXBlTGVmdCA9PT0gbnVsbCA/IHNsaWRlTGVmdCA6IF8uc3dpcGVMZWZ0O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gXy5nZXREb3RDb3VudCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYW5pbWF0ZVNsaWRlKHNsaWRlTGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gKF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldFNsaWRlIDwgMCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCAtIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgKyB0YXJnZXRTbGlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXRTbGlkZSA+PSBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZSAtIF8uc2xpZGVDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdiZWZvcmVDaGFuZ2UnLCBbXywgXy5jdXJyZW50U2xpZGUsIGFuaW1TbGlkZV0pO1xuXG4gICAgICAgIG9sZFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgICAgIF8uY3VycmVudFNsaWRlID0gYW5pbVNsaWRlO1xuXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hc05hdkZvciApIHtcblxuICAgICAgICAgICAgbmF2VGFyZ2V0ID0gXy5nZXROYXZUYXJnZXQoKTtcbiAgICAgICAgICAgIG5hdlRhcmdldCA9IG5hdlRhcmdldC5zbGljaygnZ2V0U2xpY2snKTtcblxuICAgICAgICAgICAgaWYgKCBuYXZUYXJnZXQuc2xpZGVDb3VudCA8PSBuYXZUYXJnZXQub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICAgICAgbmF2VGFyZ2V0LnNldFNsaWRlQ2xhc3NlcyhfLmN1cnJlbnRTbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBfLmZhZGVTbGlkZU91dChvbGRTbGlkZSk7XG5cbiAgICAgICAgICAgICAgICBfLmZhZGVTbGlkZShhbmltU2xpZGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfLmFuaW1hdGVIZWlnaHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUodGFyZ2V0TGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zdGFydExvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cuaGlkZSgpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5oaWRlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciB4RGlzdCwgeURpc3QsIHIsIHN3aXBlQW5nbGUsIF8gPSB0aGlzO1xuXG4gICAgICAgIHhEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFggLSBfLnRvdWNoT2JqZWN0LmN1clg7XG4gICAgICAgIHlEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFkgLSBfLnRvdWNoT2JqZWN0LmN1clk7XG4gICAgICAgIHIgPSBNYXRoLmF0YW4yKHlEaXN0LCB4RGlzdCk7XG5cbiAgICAgICAgc3dpcGVBbmdsZSA9IE1hdGgucm91bmQociAqIDE4MCAvIE1hdGguUEkpO1xuICAgICAgICBpZiAoc3dpcGVBbmdsZSA8IDApIHtcbiAgICAgICAgICAgIHN3aXBlQW5nbGUgPSAzNjAgLSBNYXRoLmFicyhzd2lwZUFuZ2xlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSA0NSkgJiYgKHN3aXBlQW5nbGUgPj0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPD0gMzYwKSAmJiAoc3dpcGVBbmdsZSA+PSAzMTUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlID49IDEzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMjI1KSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdyaWdodCcgOiAnbGVmdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMzUpICYmIChzd2lwZUFuZ2xlIDw9IDEzNSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Rvd24nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3VwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAndmVydGljYWwnO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVDb3VudCxcbiAgICAgICAgICAgIGRpcmVjdGlvbjtcblxuICAgICAgICBfLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgXy5zaG91bGRDbGljayA9ICggXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+IDEwICkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmN1clggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlICkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2VkZ2UnLCBbXywgXy5zd2lwZURpcmVjdGlvbigpIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID49IF8udG91Y2hPYmplY3QubWluU3dpcGUgKSB7XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICAgICAgc3dpdGNoICggZGlyZWN0aW9uICkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSAtIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiggZGlyZWN0aW9uICE9ICd2ZXJ0aWNhbCcgKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggc2xpZGVDb3VudCApO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc3dpcGUnLCBbXywgZGlyZWN0aW9uIF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAhPT0gXy50b3VjaE9iamVjdC5jdXJYICkge1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIF8uY3VycmVudFNsaWRlICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoKF8ub3B0aW9ucy5zd2lwZSA9PT0gZmFsc2UpIHx8ICgnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQgJiYgXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSBmYWxzZSAmJiBldmVudC50eXBlLmluZGV4T2YoJ21vdXNlJykgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ID0gZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoIDogMTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0V2lkdGggLyBfLm9wdGlvbnNcbiAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5taW5Td2lwZSA9IF8ubGlzdEhlaWdodCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5hY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVTdGFydChldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ21vdmUnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVNb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICBfLnN3aXBlRW5kKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgZWRnZVdhc0hpdCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VyTGVmdCwgc3dpcGVEaXJlY3Rpb24sIHN3aXBlTGVuZ3RoLCBwb3NpdGlvbk9mZnNldCwgdG91Y2hlcztcblxuICAgICAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkID8gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzIDogbnVsbDtcblxuICAgICAgICBpZiAoIV8uZHJhZ2dpbmcgfHwgdG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VyTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWCAtIF8udG91Y2hPYmplY3Quc3RhcnRYLCAyKSkpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoXG4gICAgICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJZIC0gXy50b3VjaE9iamVjdC5zdGFydFksIDIpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZURpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICBpZiAoc3dpcGVEaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+IDQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBwb3NpdGlvbk9mZnNldCA9IChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/IDEgOiAtMSkgKiAoXy50b3VjaE9iamVjdC5jdXJYID4gXy50b3VjaE9iamVjdC5zdGFydFggPyAxIDogLTEpO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcG9zaXRpb25PZmZzZXQgPSBfLnRvdWNoT2JqZWN0LmN1clkgPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WSA/IDEgOiAtMTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgc3dpcGVMZW5ndGggPSBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoKF8uY3VycmVudFNsaWRlID09PSAwICYmIHN3aXBlRGlyZWN0aW9uID09PSAncmlnaHQnKSB8fCAoXy5jdXJyZW50U2xpZGUgPj0gXy5nZXREb3RDb3VudCgpICYmIHN3aXBlRGlyZWN0aW9uID09PSAnbGVmdCcpKSB7XG4gICAgICAgICAgICAgICAgc3dpcGVMZW5ndGggPSBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoICogXy5vcHRpb25zLmVkZ2VGcmljdGlvbjtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIHN3aXBlTGVuZ3RoICogcG9zaXRpb25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyAoc3dpcGVMZW5ndGggKiAoXy4kbGlzdC5oZWlnaHQoKSAvIF8ubGlzdFdpZHRoKSkgKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMudG91Y2hNb3ZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldENTUyhfLnN3aXBlTGVmdCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRvdWNoZXM7XG5cbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgIT09IDEgfHwgXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF07XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA9IF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVggOiBldmVudC5jbGllbnRYO1xuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WSA9IF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1VuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLiRzbGlkZXNDYWNoZSAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudW5sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuXG4gICAgICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJHByZXZBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLiRuZXh0QXJyb3cgJiYgXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5uZXh0QXJyb3cpKSB7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLXZpc2libGUgc2xpY2stY3VycmVudCcpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAgICAgICAuY3NzKCd3aWR0aCcsICcnKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudW5zbGljayA9IGZ1bmN0aW9uKGZyb21CcmVha3BvaW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcigndW5zbGljaycsIFtfLCBmcm9tQnJlYWtwb2ludF0pO1xuICAgICAgICBfLmRlc3Ryb3koKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudXBkYXRlQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0O1xuXG4gICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAmJlxuICAgICAgICAgICAgIV8ub3B0aW9ucy5pbmZpbml0ZSApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIGlmIChfLmN1cnJlbnRTbGlkZSA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIDEgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVEb3RzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLiRkb3RzICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8uJGRvdHNcbiAgICAgICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgICAgICBfLiRkb3RzXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgICAuZXEoTWF0aC5mbG9vcihfLmN1cnJlbnRTbGlkZSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcblxuICAgICAgICAgICAgaWYgKCBkb2N1bWVudFtfLmhpZGRlbl0gKSB7XG5cbiAgICAgICAgICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAkLmZuLnNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIG9wdCA9IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgICAgbCA9IF8ubGVuZ3RoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHJldDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIG9wdCA9PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICBfW2ldLnNsaWNrID0gbmV3IFNsaWNrKF9baV0sIG9wdCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0ID0gX1tpXS5zbGlja1tvcHRdLmFwcGx5KF9baV0uc2xpY2ssIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXQgIT0gJ3VuZGVmaW5lZCcpIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF87XG4gICAgfTtcblxufSkpO1xuIiwiIWZ1bmN0aW9uICgkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEZPVU5EQVRJT05fVkVSU0lPTiA9ICc2LjMuMSc7XG5cbiAgLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gIC8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbiAgdmFyIEZvdW5kYXRpb24gPSB7XG4gICAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAgICovXG4gICAgX3BsdWdpbnM6IHt9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAgICovXG4gICAgX3V1aWRzOiBbXSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgICAqL1xuICAgIHJ0bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICAgKi9cbiAgICBwbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4sIG5hbWUpIHtcbiAgICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAgICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgICAgdmFyIGNsYXNzTmFtZSA9IG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbik7XG4gICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXG4gICAgICB2YXIgYXR0ck5hbWUgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cbiAgICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgICAqL1xuICAgIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiAocGx1Z2luLCBuYW1lKSB7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgICBpZiAoIXBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKSkge1xuICAgICAgICBwbHVnaW4uJGVsZW1lbnQuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSwgcGx1Z2luLnV1aWQpO1xuICAgICAgfVxuICAgICAgaWYgKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICBwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nLCBwbHVnaW4pO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgKi9cbiAgICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKCdpbml0LnpmLicgKyBwbHVnaW5OYW1lKTtcblxuICAgICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAgICovXG4gICAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG5cbiAgICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAqL1xuICAgICAgLnRyaWdnZXIoJ2Rlc3Ryb3llZC56Zi4nICsgcGx1Z2luTmFtZSk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHBsdWdpbikge1xuICAgICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOyAvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgICAqL1xuICAgIHJlSW5pdDogZnVuY3Rpb24gKHBsdWdpbnMpIHtcbiAgICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNKUSkge1xuICAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbiAocGxncykge1xuICAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLScgKyBwICsgJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICAkKCdbZGF0YS0nICsgcGx1Z2lucyArICddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICAgKi9cbiAgICBHZXRZb0RpZ2l0czogZnVuY3Rpb24gKGxlbmd0aCwgbmFtZXNwYWNlKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/ICctJyArIG5hbWVzcGFjZSA6ICcnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICAgKi9cbiAgICByZWZsb3c6IGZ1bmN0aW9uIChlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgICB9XG4gICAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgIH1cblxuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24gKGksIG5hbWUpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScgKyBuYW1lICsgJ10nKS5hZGRCYWNrKCdbZGF0YS0nICsgbmFtZSArICddJyk7XG5cbiAgICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiICsgbmFtZSArIFwiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKSB7XG4gICAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC50cmltKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICAgIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uICgkZWxlbSkge1xuICAgICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgICB9O1xuICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICBlbmQ7XG5cbiAgICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZW5kKSB7XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgICB9LCAxKTtcbiAgICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgRm91bmRhdGlvbi51dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgICAqL1xuICAgIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcyxcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICAvLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbiAgLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4gIC8qKlxuICAgKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAgICovXG4gIHZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICAgJG1ldGEgPSAkKCdtZXRhLmZvdW5kYXRpb24tbXEnKSxcbiAgICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICAgIGlmICghJG1ldGEubGVuZ3RoKSB7XG4gICAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgICB9XG4gICAgaWYgKCRub0pTLmxlbmd0aCkge1xuICAgICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgLy9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOyAvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsgLy9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgICBpZiAocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIC8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIC8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1dlXFwncmUgc29ycnksICcgKyB0eXBlICsgJyBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHdpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiAgJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuICAvLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KSB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgd2luZG93W3ZwICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiAgICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KSB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpO1xuICAgICAgICB9LCBuZXh0VGltZSAtIG5vdyk7XG4gICAgICB9O1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICAgKi9cbiAgICBpZiAoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdykge1xuICAgICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgICAgbm93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSkoKTtcbiAgaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGFBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgICBmTk9QID0gZnVuY3Rpb24gKCkge30sXG4gICAgICAgICAgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCA/IHRoaXMgOiBvVGhpcywgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIH1cbiAgICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgICByZXR1cm4gZkJvdW5kO1xuICAgIH07XG4gIH1cbiAgLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG4gIGZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICAgIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgICAgdmFyIHJlc3VsdHMgPSBmdW5jTmFtZVJlZ2V4LmV4ZWMoZm4udG9TdHJpbmcoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gICAgfSBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpIHtcbiAgICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO2Vsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO2Vsc2UgaWYgKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgICByZXR1cm4gc3RyO1xuICB9XG4gIC8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4gIC8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuICBmdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBGb3VuZGF0aW9uLkJveCA9IHtcbiAgICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICAgIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gICAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0c1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHtCb29sZWFufSBsck9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayBsZWZ0IGFuZCByaWdodCB2YWx1ZXMgb25seS5cbiAgICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAgICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIGNvbGxpc2lvbiBmcmVlLCBmYWxzZSBpZiBhIGNvbGxpc2lvbiBpbiBhbnkgZGlyZWN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gICAgdmFyIGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgICB0b3AsXG4gICAgICAgIGJvdHRvbSxcbiAgICAgICAgbGVmdCxcbiAgICAgICAgcmlnaHQ7XG5cbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgICAgYm90dG9tID0gZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3A7XG4gICAgICB0b3AgPSBlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wO1xuICAgICAgbGVmdCA9IGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdDtcbiAgICAgIHJpZ2h0ID0gZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdHRvbSA9IGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgKyBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcDtcbiAgICAgIHRvcCA9IGVsZURpbXMub2Zmc2V0LnRvcCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcDtcbiAgICAgIGxlZnQgPSBlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdDtcbiAgICAgIHJpZ2h0ID0gZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gZWxlRGltcy53aW5kb3dEaW1zLndpZHRoO1xuICAgIH1cblxuICAgIHZhciBhbGxEaXJzID0gW2JvdHRvbSwgdG9wLCBsZWZ0LCByaWdodF07XG5cbiAgICBpZiAobHJPbmx5KSB7XG4gICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRiT25seSkge1xuICAgICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbiAgfTtcblxuICAvKipcbiAgICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge2pRdWVyeSB8fCBIVE1MfSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBvciBET00gZWxlbWVudCBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkaW1lbnNpb25zLiBDYW4gYmUgYW55IGVsZW1lbnQgb3RoZXIgdGhhdCBkb2N1bWVudCBvciB3aW5kb3cuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICAgKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCkge1xuICAgIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gICAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7XG4gICAgfVxuXG4gICAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICBwYXJSZWN0ID0gZWxlbS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgICAgd2luWCA9IHdpbmRvdy5wYWdlWE9mZnNldDtcblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpblhcbiAgICAgIH0sXG4gICAgICBwYXJlbnREaW1zOiB7XG4gICAgICAgIHdpZHRoOiBwYXJSZWN0LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICB0b3A6IHBhclJlY3QudG9wICsgd2luWSxcbiAgICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB3aW5kb3dEaW1zOiB7XG4gICAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHdpblJlY3QuaGVpZ2h0LFxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICB0b3A6IHdpblksXG4gICAgICAgICAgbGVmdDogd2luWFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICAgKiBzdWNoIGFzOiBUb29sdGlwLCBSZXZlYWwsIGFuZCBEcm9wZG93blxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICAgKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICAgKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAgICovXG4gIGZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICAgIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAgICRhbmNob3JEaW1zID0gYW5jaG9yID8gR2V0RGltZW5zaW9ucyhhbmNob3IpIDogbnVsbDtcblxuICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlciBib3R0b20nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCAvIDIgLSAkZWxlRGltcy53aWR0aCAvIDIsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCAvIDIgLSAkZWxlRGltcy5oZWlnaHQgLyAyXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2VudGVyIHJpZ2h0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0IC8gMiAtICRlbGVEaW1zLmhlaWdodCAvIDJcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMixcbiAgICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArICRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMiAtICRlbGVEaW1zLmhlaWdodCAvIDJcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gJGVsZURpbXMud2lkdGgpIC8gMixcbiAgICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0IC0gJGVsZURpbXMud2lkdGgsXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGVmdDogRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCxcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICAgIH07XG4gICAgfVxuICB9XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUodCxlLG8saSl7dmFyIHMsaCxuLHcsZD1mKHQpO2lmKGUpe3ZhciByPWYoZSk7aD1kLm9mZnNldC50b3ArZC5oZWlnaHQ8PXIuaGVpZ2h0K3Iub2Zmc2V0LnRvcCxzPWQub2Zmc2V0LnRvcD49ci5vZmZzZXQudG9wLG49ZC5vZmZzZXQubGVmdD49ci5vZmZzZXQubGVmdCx3PWQub2Zmc2V0LmxlZnQrZC53aWR0aDw9ci53aWR0aCtyLm9mZnNldC5sZWZ0fWVsc2UgaD1kLm9mZnNldC50b3ArZC5oZWlnaHQ8PWQud2luZG93RGltcy5oZWlnaHQrZC53aW5kb3dEaW1zLm9mZnNldC50b3Ascz1kLm9mZnNldC50b3A+PWQud2luZG93RGltcy5vZmZzZXQudG9wLG49ZC5vZmZzZXQubGVmdD49ZC53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LHc9ZC5vZmZzZXQubGVmdCtkLndpZHRoPD1kLndpbmRvd0RpbXMud2lkdGg7dmFyIGw9W2gscyxuLHddO3JldHVybiBvP249PT13PT0hMDppP3M9PT1oPT0hMDpsLmluZGV4T2YoITEpPT09LTF9ZnVuY3Rpb24gZih0LGUpe2lmKHQ9dC5sZW5ndGg/dFswXTp0LHQ9PT13aW5kb3d8fHQ9PT1kb2N1bWVudCl0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTt2YXIgZj10LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLG89dC5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLGk9ZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxzPXdpbmRvdy5wYWdlWU9mZnNldCxoPXdpbmRvdy5wYWdlWE9mZnNldDtyZXR1cm57d2lkdGg6Zi53aWR0aCxoZWlnaHQ6Zi5oZWlnaHQsb2Zmc2V0Ont0b3A6Zi50b3ArcyxsZWZ0OmYubGVmdCtofSxwYXJlbnREaW1zOnt3aWR0aDpvLndpZHRoLGhlaWdodDpvLmhlaWdodCxvZmZzZXQ6e3RvcDpvLnRvcCtzLGxlZnQ6by5sZWZ0K2h9fSx3aW5kb3dEaW1zOnt3aWR0aDppLndpZHRoLGhlaWdodDppLmhlaWdodCxvZmZzZXQ6e3RvcDpzLGxlZnQ6aH19fX1mdW5jdGlvbiBvKHQsZSxvLGkscyxoKXt2YXIgbj1mKHQpLHc9ZT9mKGUpOm51bGw7c3dpdGNoKG8pe2Nhc2VcInRvcFwiOnJldHVybntsZWZ0OkZvdW5kYXRpb24ucnRsKCk/dy5vZmZzZXQubGVmdC1uLndpZHRoK3cud2lkdGg6dy5vZmZzZXQubGVmdCx0b3A6dy5vZmZzZXQudG9wLShuLmhlaWdodCtpKX07Y2FzZVwibGVmdFwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQtKG4ud2lkdGgrcyksdG9wOncub2Zmc2V0LnRvcH07Y2FzZVwicmlnaHRcIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgrcyx0b3A6dy5vZmZzZXQudG9wfTtjYXNlXCJjZW50ZXIgdG9wXCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoLzItbi53aWR0aC8yLHRvcDp3Lm9mZnNldC50b3AtKG4uaGVpZ2h0K2kpfTtjYXNlXCJjZW50ZXIgYm90dG9tXCI6cmV0dXJue2xlZnQ6aD9zOncub2Zmc2V0LmxlZnQrdy53aWR0aC8yLW4ud2lkdGgvMix0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9O2Nhc2VcImNlbnRlciBsZWZ0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdC0obi53aWR0aCtzKSx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0LzItbi5oZWlnaHQvMn07Y2FzZVwiY2VudGVyIHJpZ2h0XCI6cmV0dXJue2xlZnQ6dy5vZmZzZXQubGVmdCt3LndpZHRoK3MrMSx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0LzItbi5oZWlnaHQvMn07Y2FzZVwiY2VudGVyXCI6cmV0dXJue2xlZnQ6bi53aW5kb3dEaW1zLm9mZnNldC5sZWZ0K24ud2luZG93RGltcy53aWR0aC8yLW4ud2lkdGgvMix0b3A6bi53aW5kb3dEaW1zLm9mZnNldC50b3Arbi53aW5kb3dEaW1zLmhlaWdodC8yLW4uaGVpZ2h0LzJ9O2Nhc2VcInJldmVhbFwiOnJldHVybntsZWZ0OihuLndpbmRvd0RpbXMud2lkdGgtbi53aWR0aCkvMix0b3A6bi53aW5kb3dEaW1zLm9mZnNldC50b3AraX07Y2FzZVwicmV2ZWFsIGZ1bGxcIjpyZXR1cm57bGVmdDpuLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsdG9wOm4ud2luZG93RGltcy5vZmZzZXQudG9wfTtjYXNlXCJsZWZ0IGJvdHRvbVwiOnJldHVybntsZWZ0Oncub2Zmc2V0LmxlZnQsdG9wOncub2Zmc2V0LnRvcCt3LmhlaWdodCtpfTtjYXNlXCJyaWdodCBib3R0b21cIjpyZXR1cm57bGVmdDp3Lm9mZnNldC5sZWZ0K3cud2lkdGgrcy1uLndpZHRoLHRvcDp3Lm9mZnNldC50b3Ardy5oZWlnaHQraX07ZGVmYXVsdDpyZXR1cm57bGVmdDpGb3VuZGF0aW9uLnJ0bCgpP3cub2Zmc2V0LmxlZnQtbi53aWR0aCt3LndpZHRoOncub2Zmc2V0LmxlZnQrcyx0b3A6dy5vZmZzZXQudG9wK3cuaGVpZ2h0K2l9fX1Gb3VuZGF0aW9uLkJveD17SW1Ob3RUb3VjaGluZ1lvdTplLEdldERpbWVuc2lvbnM6ZixHZXRPZmZzZXRzOm99fShqUXVlcnkpOyIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgdmFyIGtleUNvZGVzID0ge1xuICAgIDk6ICdUQUInLFxuICAgIDEzOiAnRU5URVInLFxuICAgIDI3OiAnRVNDQVBFJyxcbiAgICAzMjogJ1NQQUNFJyxcbiAgICAzNzogJ0FSUk9XX0xFRlQnLFxuICAgIDM4OiAnQVJST1dfVVAnLFxuICAgIDM5OiAnQVJST1dfUklHSFQnLFxuICAgIDQwOiAnQVJST1dfRE9XTidcbiAgfTtcblxuICB2YXIgY29tbWFuZHMgPSB7fTtcblxuICB2YXIgS2V5Ym9hcmQgPSB7XG4gICAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICAgKi9cbiAgICBwYXJzZUtleTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgICAgLy8gUmVtb3ZlIHVuLXByaW50YWJsZSBjaGFyYWN0ZXJzLCBlLmcuIGZvciBgZnJvbUNoYXJDb2RlYCBjYWxscyBmb3IgQ1RSTCBvbmx5IGV2ZW50c1xuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gJ1NISUZUXycgKyBrZXk7XG4gICAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gJ0NUUkxfJyArIGtleTtcbiAgICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9ICdBTFRfJyArIGtleTtcblxuICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9fJC8sICcnKTtcblxuICAgICAgcmV0dXJuIGtleTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgICAqL1xuICAgIGhhbmRsZUtleTogZnVuY3Rpb24gKGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgICAgdmFyIGNvbW1hbmRMaXN0ID0gY29tbWFuZHNbY29tcG9uZW50XSxcbiAgICAgICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICAgICAgY21kcyxcbiAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgIGZuO1xuXG4gICAgICBpZiAoIWNvbW1hbmRMaXN0KSByZXR1cm4gY29uc29sZS53YXJuKCdDb21wb25lbnQgbm90IGRlZmluZWQhJyk7XG5cbiAgICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgICAgfVxuICAgICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy5oYW5kbGVkKHJldHVyblZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZ1bmN0aW9ucy51bmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy51bmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICAgKiBAcmV0dXJuIHtqUXVlcnl9ICRmb2N1c2FibGUgLSBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiBgJGVsZW1lbnRgXG4gICAgICovXG4gICAgZmluZEZvY3VzYWJsZTogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICBpZiAoISRlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gLy9vbmx5IGhhdmUgdmlzaWJsZSBlbGVtZW50cyBhbmQgdGhvc2UgdGhhdCBoYXZlIGEgdGFiaW5kZXggZ3JlYXRlciBvciBlcXVhbCAwXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgICAqL1xuXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogVHJhcHMgdGhlIGZvY3VzIGluIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICAgKi9cbiAgICB0cmFwRm9jdXM6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAgICRmaXJzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoMCksXG4gICAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSAkZmlyc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdTSElGVF9UQUInKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHJlbGVhc2UgdGhlIGZvY3VzIGZvci5cbiAgICAgKi9cbiAgICByZWxlYXNlRm9jdXM6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICAgIH1cbiAgfTtcblxuICAvKlxuICAgKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gICAgdmFyIGsgPSB7fTtcbiAgICBmb3IgKHZhciBrYyBpbiBrY3MpIHtcbiAgICAgIGtba2NzW2tjXV0gPSBrY3Nba2NdO1xuICAgIH1yZXR1cm4gaztcbiAgfVxuXG4gIEZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oZSl7ZnVuY3Rpb24gbihlKXt2YXIgbj17fTtmb3IodmFyIHQgaW4gZSluW2VbdF1dPWVbdF07cmV0dXJuIG59dmFyIHQ9ezk6XCJUQUJcIiwxMzpcIkVOVEVSXCIsMjc6XCJFU0NBUEVcIiwzMjpcIlNQQUNFXCIsMzc6XCJBUlJPV19MRUZUXCIsMzg6XCJBUlJPV19VUFwiLDM5OlwiQVJST1dfUklHSFRcIiw0MDpcIkFSUk9XX0RPV05cIn0sbz17fSxyPXtrZXlzOm4odCkscGFyc2VLZXk6ZnVuY3Rpb24oZSl7dmFyIG49dFtlLndoaWNofHxlLmtleUNvZGVdfHxTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpLnRvVXBwZXJDYXNlKCk7cmV0dXJuIG49bi5yZXBsYWNlKC9cXFcrLyxcIlwiKSxlLnNoaWZ0S2V5JiYobj1cIlNISUZUX1wiK24pLGUuY3RybEtleSYmKG49XCJDVFJMX1wiK24pLGUuYWx0S2V5JiYobj1cIkFMVF9cIituKSxuPW4ucmVwbGFjZSgvXyQvLFwiXCIpfSxoYW5kbGVLZXk6ZnVuY3Rpb24obix0LHIpe3ZhciBhLGksZCxmPW9bdF0sdT10aGlzLnBhcnNlS2V5KG4pO2lmKCFmKXJldHVybiBjb25zb2xlLndhcm4oXCJDb21wb25lbnQgbm90IGRlZmluZWQhXCIpO2lmKGE9XCJ1bmRlZmluZWRcIj09dHlwZW9mIGYubHRyP2Y6Rm91bmRhdGlvbi5ydGwoKT9lLmV4dGVuZCh7fSxmLmx0cixmLnJ0bCk6ZS5leHRlbmQoe30sZi5ydGwsZi5sdHIpLGk9YVt1XSxkPXJbaV0sZCYmXCJmdW5jdGlvblwiPT10eXBlb2YgZCl7dmFyIGw9ZC5hcHBseSgpOyhyLmhhbmRsZWR8fFwiZnVuY3Rpb25cIj09dHlwZW9mIHIuaGFuZGxlZCkmJnIuaGFuZGxlZChsKX1lbHNlKHIudW5oYW5kbGVkfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiByLnVuaGFuZGxlZCkmJnIudW5oYW5kbGVkKCl9LGZpbmRGb2N1c2FibGU6ZnVuY3Rpb24obil7cmV0dXJuISFuJiZuLmZpbmQoXCJhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiEoIWUodGhpcykuaXMoXCI6dmlzaWJsZVwiKXx8ZSh0aGlzKS5hdHRyKFwidGFiaW5kZXhcIik8MCl9KX0scmVnaXN0ZXI6ZnVuY3Rpb24oZSxuKXtvW2VdPW59LHRyYXBGb2N1czpmdW5jdGlvbihlKXt2YXIgbj1Gb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoZSksdD1uLmVxKDApLG89bi5lcSgtMSk7ZS5vbihcImtleWRvd24uemYudHJhcGZvY3VzXCIsZnVuY3Rpb24oZSl7ZS50YXJnZXQ9PT1vWzBdJiZcIlRBQlwiPT09Rm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShlKT8oZS5wcmV2ZW50RGVmYXVsdCgpLHQuZm9jdXMoKSk6ZS50YXJnZXQ9PT10WzBdJiZcIlNISUZUX1RBQlwiPT09Rm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShlKSYmKGUucHJldmVudERlZmF1bHQoKSxvLmZvY3VzKCkpfSl9LHJlbGVhc2VGb2N1czpmdW5jdGlvbihlKXtlLm9mZihcImtleWRvd24uemYudHJhcGZvY3VzXCIpfX07Rm91bmRhdGlvbi5LZXlib2FyZD1yfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuICB2YXIgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICAgJ2RlZmF1bHQnOiAnb25seSBzY3JlZW4nLFxuICAgIGxhbmRzY2FwZTogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICAgIHBvcnRyYWl0OiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgICByZXRpbmE6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbiAgfTtcblxuICB2YXIgTWVkaWFRdWVyeSA9IHtcbiAgICBxdWVyaWVzOiBbXSxcblxuICAgIGN1cnJlbnQ6ICcnLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICAgIGlmIChuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHNlbGYucXVlcmllcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgIHZhbHVlOiAnb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICcgKyBuYW1lZFF1ZXJpZXNba2V5XSArICcpJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICAgKi9cbiAgICBhdExlYXN0OiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBtYXRjaGVzIHRvIGEgYnJlYWtwb2ludC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQgZG9lcyBub3QuXG4gICAgICovXG4gICAgaXM6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICAgIGlmIChzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICAgIGlmIChzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgICAgaWYgKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICAgKi9cbiAgICBfZ2V0Q3VycmVudFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtYXRjaGVkO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgICAgbWF0Y2hlZCA9IHF1ZXJ5O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfd2F0Y2hlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5ld1NpemUgPSBfdGhpcy5fZ2V0Q3VycmVudFNpemUoKSxcbiAgICAgICAgICAgIGN1cnJlbnRTaXplID0gX3RoaXMuY3VycmVudDtcblxuICAgICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG4gIC8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbiAgLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbiAgd2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG5cbiAgICB2YXIgc3R5bGVNZWRpYSA9IHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYTtcblxuICAgIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICAgIGluZm8gPSBudWxsO1xuXG4gICAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgIHN0eWxlLmlkID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgIGluZm8gPSAnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93ICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbiAobWVkaWEpIHtcbiAgICAgICAgICB2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuICAgICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobWVkaWEpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICAgIH07XG4gICAgfTtcbiAgfSgpKTtcblxuICAvLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG4gIGZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICAgIH1cblxuICAgIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgICBpZiAoIXN0cikge1xuICAgICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICAgIH1cblxuICAgIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uIChyZXQsIHBhcmFtKSB7XG4gICAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXRba2V5XSA9IHZhbDtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sIHt9KTtcblxuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIEZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSl7dmFyIHQ9e307cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGU/dDooZT1lLnRyaW0oKS5zbGljZSgxLC0xKSk/dD1lLnNwbGl0KFwiJlwiKS5yZWR1Y2UoZnVuY3Rpb24oZSx0KXt2YXIgbj10LnJlcGxhY2UoL1xcKy9nLFwiIFwiKS5zcGxpdChcIj1cIikscj1uWzBdLGk9blsxXTtyZXR1cm4gcj1kZWNvZGVVUklDb21wb25lbnQociksaT12b2lkIDA9PT1pP251bGw6ZGVjb2RlVVJJQ29tcG9uZW50KGkpLGUuaGFzT3duUHJvcGVydHkocik/QXJyYXkuaXNBcnJheShlW3JdKT9lW3JdLnB1c2goaSk6ZVtyXT1bZVtyXSxpXTplW3JdPWksZX0se30pOnR9dmFyIG49e3F1ZXJpZXM6W10sY3VycmVudDpcIlwiLF9pbml0OmZ1bmN0aW9uKCl7dmFyIG4scj10aGlzLGk9ZShcIi5mb3VuZGF0aW9uLW1xXCIpLmNzcyhcImZvbnQtZmFtaWx5XCIpO249dChpKTtmb3IodmFyIGEgaW4gbiluLmhhc093blByb3BlcnR5KGEpJiZyLnF1ZXJpZXMucHVzaCh7bmFtZTphLHZhbHVlOlwib25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IFwiK25bYV0rXCIpXCJ9KTt0aGlzLmN1cnJlbnQ9dGhpcy5fZ2V0Q3VycmVudFNpemUoKSx0aGlzLl93YXRjaGVyKCl9LGF0TGVhc3Q6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5nZXQoZSk7cmV0dXJuISF0JiZ3aW5kb3cubWF0Y2hNZWRpYSh0KS5tYXRjaGVzfSxpczpmdW5jdGlvbihlKXtyZXR1cm4gZT1lLnRyaW0oKS5zcGxpdChcIiBcIiksZS5sZW5ndGg+MSYmXCJvbmx5XCI9PT1lWzFdP2VbMF09PT10aGlzLl9nZXRDdXJyZW50U2l6ZSgpOnRoaXMuYXRMZWFzdChlWzBdKX0sZ2V0OmZ1bmN0aW9uKGUpe2Zvcih2YXIgdCBpbiB0aGlzLnF1ZXJpZXMpaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KHQpKXt2YXIgbj10aGlzLnF1ZXJpZXNbdF07aWYoZT09PW4ubmFtZSlyZXR1cm4gbi52YWx1ZX1yZXR1cm4gbnVsbH0sX2dldEN1cnJlbnRTaXplOmZ1bmN0aW9uKCl7Zm9yKHZhciBlLHQ9MDt0PHRoaXMucXVlcmllcy5sZW5ndGg7dCsrKXt2YXIgbj10aGlzLnF1ZXJpZXNbdF07d2luZG93Lm1hdGNoTWVkaWEobi52YWx1ZSkubWF0Y2hlcyYmKGU9bil9cmV0dXJuXCJvYmplY3RcIj09dHlwZW9mIGU/ZS5uYW1lOmV9LF93YXRjaGVyOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcztlKHdpbmRvdykub24oXCJyZXNpemUuemYubWVkaWFxdWVyeVwiLGZ1bmN0aW9uKCl7dmFyIG49dC5fZ2V0Q3VycmVudFNpemUoKSxyPXQuY3VycmVudDtuIT09ciYmKHQuY3VycmVudD1uLGUod2luZG93KS50cmlnZ2VyKFwiY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5XCIsW24scl0pKX0pfX07Rm91bmRhdGlvbi5NZWRpYVF1ZXJ5PW4sd2luZG93Lm1hdGNoTWVkaWF8fCh3aW5kb3cubWF0Y2hNZWRpYT1mdW5jdGlvbigpe3ZhciBlPXdpbmRvdy5zdHlsZU1lZGlhfHx3aW5kb3cubWVkaWE7aWYoIWUpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKSxuPWRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdLHI9bnVsbDt0LnR5cGU9XCJ0ZXh0L2Nzc1wiLHQuaWQ9XCJtYXRjaG1lZGlhanMtdGVzdFwiLG4mJm4ucGFyZW50Tm9kZSYmbi5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0LG4pLHI9XCJnZXRDb21wdXRlZFN0eWxlXCJpbiB3aW5kb3cmJndpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHQsbnVsbCl8fHQuY3VycmVudFN0eWxlLGU9e21hdGNoTWVkaXVtOmZ1bmN0aW9uKGUpe3ZhciBuPVwiQG1lZGlhIFwiK2UrXCJ7ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfVwiO3JldHVybiB0LnN0eWxlU2hlZXQ/dC5zdHlsZVNoZWV0LmNzc1RleHQ9bjp0LnRleHRDb250ZW50PW4sXCIxcHhcIj09PXIud2lkdGh9fX1yZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJue21hdGNoZXM6ZS5tYXRjaE1lZGl1bSh0fHxcImFsbFwiKSxtZWRpYTp0fHxcImFsbFwifX19KCkpLEZvdW5kYXRpb24uTWVkaWFRdWVyeT1ufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIE1vdGlvbiBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cbiAgICovXG5cbiAgdmFyIGluaXRDbGFzc2VzID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG4gIHZhciBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcblxuICB2YXIgTW90aW9uID0ge1xuICAgIGFuaW1hdGVJbjogZnVuY3Rpb24gKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gICAgfSxcblxuICAgIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uIChlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pIHtcbiAgICB2YXIgYW5pbSxcbiAgICAgICAgcHJvZyxcbiAgICAgICAgc3RhcnQgPSBudWxsO1xuICAgIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3ZlKHRzKSB7XG4gICAgICBpZiAoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgICAgLy8gY29uc29sZS5sb2coc3RhcnQsIHRzKTtcbiAgICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICAgIGlmIChwcm9nIDwgZHVyYXRpb24pIHtcbiAgICAgICAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgZWxlbWVudCA9ICQoZWxlbWVudCkuZXEoMCk7XG5cbiAgICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gICAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gICAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgICByZXNldCgpO1xuXG4gICAgZWxlbWVudC5hZGRDbGFzcyhhbmltYXRpb24pLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICAgIH0pO1xuXG4gICAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgICAgZWxlbWVudC5jc3MoJ3RyYW5zaXRpb24nLCAnJykuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xuICAgIH0pO1xuXG4gICAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gICAgZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGVsZW1lbnQpLCBmaW5pc2gpO1xuXG4gICAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICAgIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICAgIGlmICghaXNJbikgZWxlbWVudC5oaWRlKCk7XG4gICAgICByZXNldCgpO1xuICAgICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoaW5pdENsYXNzICsgJyAnICsgYWN0aXZlQ2xhc3MgKyAnICcgKyBhbmltYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIEZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG4gIEZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihuKXtmdW5jdGlvbiBpKG4saSxlKXtmdW5jdGlvbiB0KHMpe3J8fChyPXMpLG89cy1yLGUuYXBwbHkoaSksbzxuP2E9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0LGkpOih3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYSksaS50cmlnZ2VyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkudHJpZ2dlckhhbmRsZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKSl9dmFyIGEsbyxyPW51bGw7cmV0dXJuIDA9PT1uPyhlLmFwcGx5KGkpLHZvaWQgaS50cmlnZ2VyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFtpXSkudHJpZ2dlckhhbmRsZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW2ldKSk6dm9pZChhPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCkpfWZ1bmN0aW9uIGUoaSxlLG8scil7ZnVuY3Rpb24gcygpe2l8fGUuaGlkZSgpLHUoKSxyJiZyLmFwcGx5KGUpfWZ1bmN0aW9uIHUoKXtlWzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbj0wLGUucmVtb3ZlQ2xhc3MoZCtcIiBcIitmK1wiIFwiK28pfWlmKGU9bihlKS5lcSgwKSxlLmxlbmd0aCl7dmFyIGQ9aT90WzBdOnRbMV0sZj1pP2FbMF06YVsxXTt1KCksZS5hZGRDbGFzcyhvKS5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJub25lXCIpLHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe2UuYWRkQ2xhc3MoZCksaSYmZS5zaG93KCl9KSxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtlWzBdLm9mZnNldFdpZHRoLGUuY3NzKFwidHJhbnNpdGlvblwiLFwiXCIpLmFkZENsYXNzKGYpfSksZS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGUpLHMpfX12YXIgdD1bXCJtdWktZW50ZXJcIixcIm11aS1sZWF2ZVwiXSxhPVtcIm11aS1lbnRlci1hY3RpdmVcIixcIm11aS1sZWF2ZS1hY3RpdmVcIl0sbz17YW5pbWF0ZUluOmZ1bmN0aW9uKG4saSx0KXtlKCEwLG4saSx0KX0sYW5pbWF0ZU91dDpmdW5jdGlvbihuLGksdCl7ZSghMSxuLGksdCl9fTtGb3VuZGF0aW9uLk1vdmU9aSxGb3VuZGF0aW9uLk1vdGlvbj1vfShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgdmFyIE5lc3QgPSB7XG4gICAgRmVhdGhlcjogZnVuY3Rpb24gKG1lbnUpIHtcbiAgICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnemYnO1xuXG4gICAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xuXG4gICAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7ICdyb2xlJzogJ21lbnVpdGVtJyB9KSxcbiAgICAgICAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxuICAgICAgICAgIHN1Ykl0ZW1DbGFzcyA9IHN1Yk1lbnVDbGFzcyArICctaXRlbScsXG4gICAgICAgICAgaGFzU3ViQ2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG5cbiAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmICh0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7ICdhcmlhLWV4cGFuZGVkJzogZmFsc2UgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJHN1Yi5hZGRDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkc3ViLmF0dHIoeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9LFxuICAgIEJ1cm46IGZ1bmN0aW9uIChtZW51LCB0eXBlKSB7XG4gICAgICB2YXIgLy9pdGVtcyA9IG1lbnUuZmluZCgnbGknKSxcbiAgICAgIHN1Yk1lbnVDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudScsXG4gICAgICAgICAgc3ViSXRlbUNsYXNzID0gc3ViTWVudUNsYXNzICsgJy1pdGVtJyxcbiAgICAgICAgICBoYXNTdWJDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudS1wYXJlbnQnO1xuXG4gICAgICBtZW51LmZpbmQoJz5saSwgLm1lbnUsIC5tZW51ID4gbGknKS5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnICcgKyBoYXNTdWJDbGFzcyArICcgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlJykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykuY3NzKCdkaXNwbGF5JywgJycpO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XG4gICAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG4gICAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pO1xuICAgIH1cbiAgfTtcblxuICBGb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xufShqUXVlcnkpOyIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbihlKXt2YXIgYT17RmVhdGhlcjpmdW5jdGlvbihhKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06XCJ6ZlwiO2EuYXR0cihcInJvbGVcIixcIm1lbnViYXJcIik7dmFyIG49YS5maW5kKFwibGlcIikuYXR0cih7cm9sZTpcIm1lbnVpdGVtXCJ9KSxpPVwiaXMtXCIrdCtcIi1zdWJtZW51XCIsdT1pK1wiLWl0ZW1cIixzPVwiaXMtXCIrdCtcIi1zdWJtZW51LXBhcmVudFwiO24uZWFjaChmdW5jdGlvbigpe3ZhciBhPWUodGhpcyksbj1hLmNoaWxkcmVuKFwidWxcIik7bi5sZW5ndGgmJihhLmFkZENsYXNzKHMpLmF0dHIoe1wiYXJpYS1oYXNwb3B1cFwiOiEwLFwiYXJpYS1sYWJlbFwiOmEuY2hpbGRyZW4oXCJhOmZpcnN0XCIpLnRleHQoKX0pLFwiZHJpbGxkb3duXCI9PT10JiZhLmF0dHIoe1wiYXJpYS1leHBhbmRlZFwiOiExfSksbi5hZGRDbGFzcyhcInN1Ym1lbnUgXCIraSkuYXR0cih7XCJkYXRhLXN1Ym1lbnVcIjpcIlwiLHJvbGU6XCJtZW51XCJ9KSxcImRyaWxsZG93blwiPT09dCYmbi5hdHRyKHtcImFyaWEtaGlkZGVuXCI6ITB9KSksYS5wYXJlbnQoXCJbZGF0YS1zdWJtZW51XVwiKS5sZW5ndGgmJmEuYWRkQ2xhc3MoXCJpcy1zdWJtZW51LWl0ZW0gXCIrdSl9KX0sQnVybjpmdW5jdGlvbihlLGEpe3ZhciB0PVwiaXMtXCIrYStcIi1zdWJtZW51XCIsbj10K1wiLWl0ZW1cIixpPVwiaXMtXCIrYStcIi1zdWJtZW51LXBhcmVudFwiO2UuZmluZChcIj5saSwgLm1lbnUsIC5tZW51ID4gbGlcIikucmVtb3ZlQ2xhc3ModCtcIiBcIituK1wiIFwiK2krXCIgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlXCIpLnJlbW92ZUF0dHIoXCJkYXRhLXN1Ym1lbnVcIikuY3NzKFwiZGlzcGxheVwiLFwiXCIpfX07Rm91bmRhdGlvbi5OZXN0PWF9KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBmdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbixcbiAgICAgICAgLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICBuYW1lU3BhY2UgPSBPYmplY3Qua2V5cyhlbGVtLmRhdGEoKSlbMF0gfHwgJ3RpbWVyJyxcbiAgICAgICAgcmVtYWluID0gLTEsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICB0aW1lcjtcblxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbWFpbiA9IC0xO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcbiAgICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmluZmluaXRlKSB7XG4gICAgICAgICAgX3RoaXMucmVzdGFydCgpOyAvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2IoKTtcbiAgICAgICAgfVxuICAgICAgfSwgcmVtYWluKTtcbiAgICAgIGVsZW0udHJpZ2dlcigndGltZXJzdGFydC56Zi4nICsgbmFtZVNwYWNlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgICAgLy9pZihlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcbiAgICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ3RpbWVycGF1c2VkLnpmLicgKyBuYW1lU3BhY2UpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbWFnZXMgLSBJbWFnZShzKSB0byBjaGVjayBpZiBsb2FkZWQuXG4gICAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoaW1hZ2VzLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gICAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGltYWdlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgICAgaWYgKHRoaXMuY29tcGxldGUgfHwgdGhpcy5yZWFkeVN0YXRlID09PSA0IHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfVxuICAgICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgICAgICB2YXIgc3JjID0gJCh0aGlzKS5hdHRyKCdzcmMnKTtcbiAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgICAgICQodGhpcykub25lKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgICB1bmxvYWRlZC0tO1xuICAgICAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkID0gb25JbWFnZXNMb2FkZWQ7XG59KGpRdWVyeSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUodCxlLGkpe3ZhciBhLHMsbj10aGlzLHI9ZS5kdXJhdGlvbixvPU9iamVjdC5rZXlzKHQuZGF0YSgpKVswXXx8XCJ0aW1lclwiLHU9LTE7dGhpcy5pc1BhdXNlZD0hMSx0aGlzLnJlc3RhcnQ9ZnVuY3Rpb24oKXt1PS0xLGNsZWFyVGltZW91dChzKSx0aGlzLnN0YXJ0KCl9LHRoaXMuc3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmlzUGF1c2VkPSExLGNsZWFyVGltZW91dChzKSx1PXU8PTA/cjp1LHQuZGF0YShcInBhdXNlZFwiLCExKSxhPURhdGUubm93KCkscz1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5pbmZpbml0ZSYmbi5yZXN0YXJ0KCksaSYmXCJmdW5jdGlvblwiPT10eXBlb2YgaSYmaSgpfSx1KSx0LnRyaWdnZXIoXCJ0aW1lcnN0YXJ0LnpmLlwiK28pfSx0aGlzLnBhdXNlPWZ1bmN0aW9uKCl7dGhpcy5pc1BhdXNlZD0hMCxjbGVhclRpbWVvdXQocyksdC5kYXRhKFwicGF1c2VkXCIsITApO3ZhciBlPURhdGUubm93KCk7dS09ZS1hLHQudHJpZ2dlcihcInRpbWVycGF1c2VkLnpmLlwiK28pfX1mdW5jdGlvbiBpKGUsaSl7ZnVuY3Rpb24gYSgpe3MtLSwwPT09cyYmaSgpfXZhciBzPWUubGVuZ3RoOzA9PT1zJiZpKCksZS5lYWNoKGZ1bmN0aW9uKCl7aWYodGhpcy5jb21wbGV0ZXx8ND09PXRoaXMucmVhZHlTdGF0ZXx8XCJjb21wbGV0ZVwiPT09dGhpcy5yZWFkeVN0YXRlKWEoKTtlbHNle3ZhciBlPXQodGhpcykuYXR0cihcInNyY1wiKTt0KHRoaXMpLmF0dHIoXCJzcmNcIixlKyhlLmluZGV4T2YoXCI/XCIpPj0wP1wiJlwiOlwiP1wiKSsobmV3IERhdGUpLmdldFRpbWUoKSksdCh0aGlzKS5vbmUoXCJsb2FkXCIsZnVuY3Rpb24oKXthKCl9KX19KX1Gb3VuZGF0aW9uLlRpbWVyPWUsRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZD1pfShqUXVlcnkpOyIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipXb3JrIGluc3BpcmVkIGJ5IG11bHRpcGxlIGpxdWVyeSBzd2lwZSBwbHVnaW5zKipcbi8vKipEb25lIGJ5IFlvaGFpIEFyYXJhdCAqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbihmdW5jdGlvbiAoJCkge1xuXG5cdCQuc3BvdFN3aXBlID0ge1xuXHRcdHZlcnNpb246ICcxLjAuMCcsXG5cdFx0ZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXHRcdHByZXZlbnREZWZhdWx0OiBmYWxzZSxcblx0XHRtb3ZlVGhyZXNob2xkOiA3NSxcblx0XHR0aW1lVGhyZXNob2xkOiAyMDBcblx0fTtcblxuXHR2YXIgc3RhcnRQb3NYLFxuXHQgICAgc3RhcnRQb3NZLFxuXHQgICAgc3RhcnRUaW1lLFxuXHQgICAgZWxhcHNlZFRpbWUsXG5cdCAgICBpc01vdmluZyA9IGZhbHNlO1xuXG5cdGZ1bmN0aW9uIG9uVG91Y2hFbmQoKSB7XG5cdFx0Ly8gIGFsZXJ0KHRoaXMpO1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kKTtcblx0XHRpc01vdmluZyA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaE1vdmUoZSkge1xuXHRcdGlmICgkLnNwb3RTd2lwZS5wcmV2ZW50RGVmYXVsdCkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0XHRpZiAoaXNNb3ZpbmcpIHtcblx0XHRcdHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuXHRcdFx0dmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG5cdFx0XHR2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuXHRcdFx0dmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcblx0XHRcdHZhciBkaXI7XG5cdFx0XHRlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuXHRcdFx0aWYgKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcblx0XHRcdFx0ZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0Jztcblx0XHRcdH1cblx0XHRcdC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuXHRcdFx0Ly8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuXHRcdFx0Ly8gfVxuXHRcdFx0aWYgKGRpcikge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdG9uVG91Y2hFbmQuY2FsbCh0aGlzKTtcblx0XHRcdFx0JCh0aGlzKS50cmlnZ2VyKCdzd2lwZScsIGRpcikudHJpZ2dlcignc3dpcGUnICsgZGlyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xuXHRcdGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcblx0XHRcdHN0YXJ0UG9zWCA9IGUudG91Y2hlc1swXS5wYWdlWDtcblx0XHRcdHN0YXJ0UG9zWSA9IGUudG91Y2hlc1swXS5wYWdlWTtcblx0XHRcdGlzTW92aW5nID0gdHJ1ZTtcblx0XHRcdHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UpO1xuXHRcdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0KCkge1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciAmJiB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRlYXJkb3duKCkge1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XG5cdH1cblxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7IHNldHVwOiBpbml0IH07XG5cblx0JC5lYWNoKFsnbGVmdCcsICd1cCcsICdkb3duJywgJ3JpZ2h0J10sIGZ1bmN0aW9uICgpIHtcblx0XHQkLmV2ZW50LnNwZWNpYWxbJ3N3aXBlJyArIHRoaXNdID0geyBzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG5cdFx0XHR9IH07XG5cdH0pO1xufSkoalF1ZXJ5KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNZXRob2QgZm9yIGFkZGluZyBwc3VlZG8gZHJhZyBldmVudHMgdG8gZWxlbWVudHMgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiFmdW5jdGlvbiAoJCkge1xuXHQkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcblx0XHRcdCQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcblx0XHRcdFx0Ly9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuXHRcdFx0XHRoYW5kbGVUb3VjaChldmVudCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0dmFyIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcyxcblx0XHRcdCAgICBmaXJzdCA9IHRvdWNoZXNbMF0sXG5cdFx0XHQgICAgZXZlbnRUeXBlcyA9IHtcblx0XHRcdFx0dG91Y2hzdGFydDogJ21vdXNlZG93bicsXG5cdFx0XHRcdHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG5cdFx0XHRcdHRvdWNoZW5kOiAnbW91c2V1cCdcblx0XHRcdH0sXG5cdFx0XHQgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG5cdFx0XHQgICAgc2ltdWxhdGVkRXZlbnQ7XG5cblx0XHRcdGlmICgnTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG5cdFx0XHRcdFx0J2J1YmJsZXMnOiB0cnVlLFxuXHRcdFx0XHRcdCdjYW5jZWxhYmxlJzogdHJ1ZSxcblx0XHRcdFx0XHQnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG5cdFx0XHRcdFx0J3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuXHRcdFx0XHRcdCdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcblx0XHRcdFx0XHQnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG5cdFx0XHRcdHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAgLypsZWZ0Ki8sIG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0Zmlyc3QudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuXHRcdH07XG5cdH07XG59KGpRdWVyeSk7XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi8iLCIhZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdCgpe3RoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLG4pLHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsdCkscj0hMX1mdW5jdGlvbiBuKG4pe2lmKGUuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0JiZuLnByZXZlbnREZWZhdWx0KCkscil7dmFyIG8saT1uLnRvdWNoZXNbMF0ucGFnZVgsYz0obi50b3VjaGVzWzBdLnBhZ2VZLHMtaSk7aD0obmV3IERhdGUpLmdldFRpbWUoKS11LE1hdGguYWJzKGMpPj1lLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkJiZoPD1lLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkJiYobz1jPjA/XCJsZWZ0XCI6XCJyaWdodFwiKSxvJiYobi5wcmV2ZW50RGVmYXVsdCgpLHQuY2FsbCh0aGlzKSxlKHRoaXMpLnRyaWdnZXIoXCJzd2lwZVwiLG8pLnRyaWdnZXIoXCJzd2lwZVwiK28pKX19ZnVuY3Rpb24gbyhlKXsxPT1lLnRvdWNoZXMubGVuZ3RoJiYocz1lLnRvdWNoZXNbMF0ucGFnZVgsYz1lLnRvdWNoZXNbMF0ucGFnZVkscj0hMCx1PShuZXcgRGF0ZSkuZ2V0VGltZSgpLHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLG4sITEpLHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsdCwhMSkpfWZ1bmN0aW9uIGkoKXt0aGlzLmFkZEV2ZW50TGlzdGVuZXImJnRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixvLCExKX1lLnNwb3RTd2lwZT17dmVyc2lvbjpcIjEuMC4wXCIsZW5hYmxlZDpcIm9udG91Y2hzdGFydFwiaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LHByZXZlbnREZWZhdWx0OiExLG1vdmVUaHJlc2hvbGQ6NzUsdGltZVRocmVzaG9sZDoyMDB9O3ZhciBzLGMsdSxoLHI9ITE7ZS5ldmVudC5zcGVjaWFsLnN3aXBlPXtzZXR1cDppfSxlLmVhY2goW1wibGVmdFwiLFwidXBcIixcImRvd25cIixcInJpZ2h0XCJdLGZ1bmN0aW9uKCl7ZS5ldmVudC5zcGVjaWFsW1wic3dpcGVcIit0aGlzXT17c2V0dXA6ZnVuY3Rpb24oKXtlKHRoaXMpLm9uKFwic3dpcGVcIixlLm5vb3ApfX19KX0oalF1ZXJ5KSwhZnVuY3Rpb24oZSl7ZS5mbi5hZGRUb3VjaD1mdW5jdGlvbigpe3RoaXMuZWFjaChmdW5jdGlvbihuLG8pe2UobykuYmluZChcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsXCIsZnVuY3Rpb24oKXt0KGV2ZW50KX0pfSk7dmFyIHQ9ZnVuY3Rpb24oZSl7dmFyIHQsbj1lLmNoYW5nZWRUb3VjaGVzLG89blswXSxpPXt0b3VjaHN0YXJ0OlwibW91c2Vkb3duXCIsdG91Y2htb3ZlOlwibW91c2Vtb3ZlXCIsdG91Y2hlbmQ6XCJtb3VzZXVwXCJ9LHM9aVtlLnR5cGVdO1wiTW91c2VFdmVudFwiaW4gd2luZG93JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB3aW5kb3cuTW91c2VFdmVudD90PW5ldyB3aW5kb3cuTW91c2VFdmVudChzLHtidWJibGVzOiEwLGNhbmNlbGFibGU6ITAsc2NyZWVuWDpvLnNjcmVlblgsc2NyZWVuWTpvLnNjcmVlblksY2xpZW50WDpvLmNsaWVudFgsY2xpZW50WTpvLmNsaWVudFl9KToodD1kb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRcIiksdC5pbml0TW91c2VFdmVudChzLCEwLCEwLHdpbmRvdywxLG8uc2NyZWVuWCxvLnNjcmVlblksby5jbGllbnRYLG8uY2xpZW50WSwhMSwhMSwhMSwhMSwwLG51bGwpKSxvLnRhcmdldC5kaXNwYXRjaEV2ZW50KHQpfX19KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24gKCQpIHtcblxuICB2YXIgTXV0YXRpb25PYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0oKTtcblxuICB2YXIgdHJpZ2dlcnMgPSBmdW5jdGlvbiAoZWwsIHR5cGUpIHtcbiAgICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICQoJyMnICsgaWQpW3R5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXSh0eXBlICsgJy56Zi50cmlnZ2VyJywgW2VsXSk7XG4gICAgfSk7XG4gIH07XG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgZnVuY3Rpb24gKCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdvcGVuJyk7XG4gIH0pO1xuXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4gIC8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gICAgaWYgKGlkKSB7XG4gICAgICB0cmlnZ2VycygkKHRoaXMpLCAnY2xvc2UnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUnKTtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuICAkKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdmFyIGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICAgIGlmIChhbmltYXRpb24gIT09ICcnKSB7XG4gICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUtZm9jdXMnKTtcbiAgICAkKCcjJyArIGlkKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xuICB9KTtcblxuICAvKipcbiAgKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKi9cbiAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgIGNoZWNrTGlzdGVuZXJzKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICAgIGV2ZW50c0xpc3RlbmVyKCk7XG4gICAgcmVzaXplTGlzdGVuZXIoKTtcbiAgICBzY3JvbGxMaXN0ZW5lcigpO1xuICAgIG11dGF0ZUxpc3RlbmVyKCk7XG4gICAgY2xvc2VtZUxpc3RlbmVyKCk7XG4gIH1cblxuICAvLyoqKioqKioqIG9ubHkgZmlyZXMgdGhpcyBmdW5jdGlvbiBvbmNlIG9uIGxvYWQsIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHdhdGNoICoqKioqKioqXG4gIGZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gICAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgICBpZiAocGx1Z2luTmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoeWV0aUJveGVzLmxlbmd0aCkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHBsdWdOYW1lcy5tYXAoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuICdjbG9zZW1lLnpmLicgKyBuYW1lO1xuICAgICAgfSkuam9pbignICcpO1xuXG4gICAgICAkKHdpbmRvdykub2ZmKGxpc3RlbmVycykub24obGlzdGVuZXJzLCBmdW5jdGlvbiAoZSwgcGx1Z2luSWQpIHtcbiAgICAgICAgdmFyIHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICAgIHZhciBwbHVnaW5zID0gJCgnW2RhdGEtJyArIHBsdWdpbiArICddJykubm90KCdbZGF0YS15ZXRpLWJveD1cIicgKyBwbHVnaW5JZCArICdcIl0nKTtcblxuICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKSB7XG4gICAgdmFyIHRpbWVyID0gdm9pZCAwLFxuICAgICAgICAkbm9kZXMgPSAkKCdbZGF0YS1yZXNpemVdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS56Zi50cmlnZ2VyJykub24oJ3Jlc2l6ZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIC8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgICAgfSwgZGVib3VuY2UgfHwgMTApOyAvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICB2YXIgdGltZXIgPSB2b2lkIDAsXG4gICAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgICBpZiAoJG5vZGVzLmxlbmd0aCkge1xuICAgICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLnRyaWdnZXInKS5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgIGlmICghTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgLy9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxuICAgICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7IC8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtdXRhdGVMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIHZhciAkbm9kZXMgPSAkKCdbZGF0YS1tdXRhdGVdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGggJiYgTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0ZSBldmVudFxuICAgICAgLy9ubyBJRSA5IG9yIDEwXG4gICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICAgIGlmICghTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuXG4gICAgICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcbiAgICAgICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcbiAgICAgICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsIFwibXV0YXRlXCIpO1xuICAgICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcbiAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLCBcIm11dGF0ZVwiKTtcbiAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy9ub3RoaW5nXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIC8vZm9yIGVhY2ggZWxlbWVudCB0aGF0IG5lZWRzIHRvIGxpc3RlbiBmb3IgcmVzaXppbmcsIHNjcm9sbGluZywgb3IgbXV0YXRpb24gYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZShub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gW1BIXVxuICAvLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xuICBGb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4gIC8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuICAvLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xufShqUXVlcnkpO1xuXG4vLyBmdW5jdGlvbiBkb21NdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKSB7XG4vLyAgIC8vICEhISBUaGlzIGlzIGNvbWluZyBzb29uIGFuZCBuZWVkcyBtb3JlIHdvcms7IG5vdCBhY3RpdmUgICEhISAvL1xuLy8gICB2YXIgdGltZXIsXG4vLyAgIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbXV0YXRlXScpO1xuLy8gICAvL1xuLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XG4vLyAgICAgLy8gdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuLy8gICAgIC8vICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4vLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIC8vICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4vLyAgICAgLy8gICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4vLyAgICAgLy8gICAgIH1cbi8vICAgICAvLyAgIH1cbi8vICAgICAvLyAgIHJldHVybiBmYWxzZTtcbi8vICAgICAvLyB9KCkpO1xuLy9cbi8vXG4vLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXG4vLyAgICAgdmFyIGJvZHlPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJvZHlNdXRhdGlvbik7XG4vLyAgICAgYm9keU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOnRydWUsIGF0dHJpYnV0ZUZpbHRlcjpbXCJzdHlsZVwiLCBcImNsYXNzXCJdfSk7XG4vL1xuLy9cbi8vICAgICAvL2JvZHkgY2FsbGJhY2tcbi8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XG4vLyAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRpb24gZXZlbnRcbi8vICAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG4vL1xuLy8gICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICBib2R5T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xuLy8gICAgICAgfSwgZGVib3VuY2UgfHwgMTUwKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH0iLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpe28oKSxhKCksaSgpLG4oKSxyKCl9ZnVuY3Rpb24gcihlKXt2YXIgcj10KFwiW2RhdGEteWV0aS1ib3hdXCIpLGE9W1wiZHJvcGRvd25cIixcInRvb2x0aXBcIixcInJldmVhbFwiXTtpZihlJiYoXCJzdHJpbmdcIj09dHlwZW9mIGU/YS5wdXNoKGUpOlwib2JqZWN0XCI9PXR5cGVvZiBlJiZcInN0cmluZ1wiPT10eXBlb2YgZVswXT9hLmNvbmNhdChlKTpjb25zb2xlLmVycm9yKFwiUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5nc1wiKSksci5sZW5ndGgpe3ZhciBpPWEubWFwKGZ1bmN0aW9uKHQpe3JldHVyblwiY2xvc2VtZS56Zi5cIit0fSkuam9pbihcIiBcIik7dCh3aW5kb3cpLm9mZihpKS5vbihpLGZ1bmN0aW9uKGUscil7dmFyIGE9ZS5uYW1lc3BhY2Uuc3BsaXQoXCIuXCIpWzBdLGk9dChcIltkYXRhLVwiK2ErXCJdXCIpLm5vdCgnW2RhdGEteWV0aS1ib3g9XCInK3IrJ1wiXScpO2kuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7ZS50cmlnZ2VySGFuZGxlcihcImNsb3NlLnpmLnRyaWdnZXJcIixbZV0pfSl9KX19ZnVuY3Rpb24gYShlKXt2YXIgcj12b2lkIDAsYT10KFwiW2RhdGEtcmVzaXplXVwiKTthLmxlbmd0aCYmdCh3aW5kb3cpLm9mZihcInJlc2l6ZS56Zi50cmlnZ2VyXCIpLm9uKFwicmVzaXplLnpmLnRyaWdnZXJcIixmdW5jdGlvbihpKXtyJiZjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Z3x8YS5lYWNoKGZ1bmN0aW9uKCl7dCh0aGlzKS50cmlnZ2VySGFuZGxlcihcInJlc2l6ZW1lLnpmLnRyaWdnZXJcIil9KSxhLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwicmVzaXplXCIpfSxlfHwxMCl9KX1mdW5jdGlvbiBpKGUpe3ZhciByPXZvaWQgMCxhPXQoXCJbZGF0YS1zY3JvbGxdXCIpO2EubGVuZ3RoJiZ0KHdpbmRvdykub2ZmKFwic2Nyb2xsLnpmLnRyaWdnZXJcIikub24oXCJzY3JvbGwuemYudHJpZ2dlclwiLGZ1bmN0aW9uKGkpe3ImJmNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtnfHxhLmVhY2goZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwic2Nyb2xsbWUuemYudHJpZ2dlclwiKX0pLGEuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJzY3JvbGxcIil9LGV8fDEwKX0pfWZ1bmN0aW9uIG4oZSl7dmFyIHI9dChcIltkYXRhLW11dGF0ZV1cIik7ci5sZW5ndGgmJmcmJnIuZWFjaChmdW5jdGlvbigpe3QodGhpcykudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpfSl9ZnVuY3Rpb24gbygpe2lmKCFnKXJldHVybiExO3ZhciBlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdXCIpLHI9ZnVuY3Rpb24oZSl7dmFyIHI9dChlWzBdLnRhcmdldCk7c3dpdGNoKGVbMF0udHlwZSl7Y2FzZVwiYXR0cmlidXRlc1wiOlwic2Nyb2xsXCI9PT1yLmF0dHIoXCJkYXRhLWV2ZW50c1wiKSYmXCJkYXRhLWV2ZW50c1wiPT09ZVswXS5hdHRyaWJ1dGVOYW1lJiZyLnRyaWdnZXJIYW5kbGVyKFwic2Nyb2xsbWUuemYudHJpZ2dlclwiLFtyLHdpbmRvdy5wYWdlWU9mZnNldF0pLFwicmVzaXplXCI9PT1yLmF0dHIoXCJkYXRhLWV2ZW50c1wiKSYmXCJkYXRhLWV2ZW50c1wiPT09ZVswXS5hdHRyaWJ1dGVOYW1lJiZyLnRyaWdnZXJIYW5kbGVyKFwicmVzaXplbWUuemYudHJpZ2dlclwiLFtyXSksXCJzdHlsZVwiPT09ZVswXS5hdHRyaWJ1dGVOYW1lJiYoci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKSxyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiLFtyLmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSkpO2JyZWFrO2Nhc2VcImNoaWxkTGlzdFwiOnIuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIiksci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIixbci5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO2JyZWFrO2RlZmF1bHQ6cmV0dXJuITF9fTtpZihlLmxlbmd0aClmb3IodmFyIGE9MDthPD1lLmxlbmd0aC0xO2ErKyl7dmFyIGk9bmV3IGcocik7aS5vYnNlcnZlKGVbYV0se2F0dHJpYnV0ZXM6ITAsY2hpbGRMaXN0OiEwLGNoYXJhY3RlckRhdGE6ITEsc3VidHJlZTohMCxhdHRyaWJ1dGVGaWx0ZXI6W1wiZGF0YS1ldmVudHNcIixcInN0eWxlXCJdfSl9fXZhciBnPWZ1bmN0aW9uKCl7Zm9yKHZhciB0PVtcIldlYktpdFwiLFwiTW96XCIsXCJPXCIsXCJNc1wiLFwiXCJdLGU9MDtlPHQubGVuZ3RoO2UrKylpZih0W2VdK1wiTXV0YXRpb25PYnNlcnZlclwiaW4gd2luZG93KXJldHVybiB3aW5kb3dbdFtlXStcIk11dGF0aW9uT2JzZXJ2ZXJcIl07cmV0dXJuITF9KCkscz1mdW5jdGlvbihlLHIpe2UuZGF0YShyKS5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihhKXt0KFwiI1wiK2EpW1wiY2xvc2VcIj09PXI/XCJ0cmlnZ2VyXCI6XCJ0cmlnZ2VySGFuZGxlclwiXShyK1wiLnpmLnRyaWdnZXJcIixbZV0pfSl9O3QoZG9jdW1lbnQpLm9uKFwiY2xpY2suemYudHJpZ2dlclwiLFwiW2RhdGEtb3Blbl1cIixmdW5jdGlvbigpe3ModCh0aGlzKSxcIm9wZW5cIil9KSx0KGRvY3VtZW50KS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLWNsb3NlXVwiLGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKS5kYXRhKFwiY2xvc2VcIik7ZT9zKHQodGhpcyksXCJjbG9zZVwiKTp0KHRoaXMpLnRyaWdnZXIoXCJjbG9zZS56Zi50cmlnZ2VyXCIpfSksdChkb2N1bWVudCkub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS10b2dnbGVdXCIsZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLmRhdGEoXCJ0b2dnbGVcIik7ZT9zKHQodGhpcyksXCJ0b2dnbGVcIik6dCh0aGlzKS50cmlnZ2VyKFwidG9nZ2xlLnpmLnRyaWdnZXJcIil9KSx0KGRvY3VtZW50KS5vbihcImNsb3NlLnpmLnRyaWdnZXJcIixcIltkYXRhLWNsb3NhYmxlXVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIHI9dCh0aGlzKS5kYXRhKFwiY2xvc2FibGVcIik7XCJcIiE9PXI/Rm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCh0KHRoaXMpLHIsZnVuY3Rpb24oKXt0KHRoaXMpLnRyaWdnZXIoXCJjbG9zZWQuemZcIil9KTp0KHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKFwiY2xvc2VkLnpmXCIpfSksdChkb2N1bWVudCkub24oXCJmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlclwiLFwiW2RhdGEtdG9nZ2xlLWZvY3VzXVwiLGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKS5kYXRhKFwidG9nZ2xlLWZvY3VzXCIpO3QoXCIjXCIrZSkudHJpZ2dlckhhbmRsZXIoXCJ0b2dnbGUuemYudHJpZ2dlclwiLFt0KHRoaXMpXSl9KSx0KHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtlKCl9KSxGb3VuZGF0aW9uLklIZWFyWW91PWV9KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogQWJpZGUgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24uYWJpZGVcbiAgICovXG5cbiAgdmFyIEFiaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgQWJpZGUuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIEFiaWRlI2luaXRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBYmlkZShlbGVtZW50KSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBYmlkZSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFiaWRlLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWJpZGUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgQWJpZGUgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IEFiaWRlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKEFiaWRlLCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7XG5cbiAgICAgICAgdGhpcy5fZXZlbnRzKCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBBYmlkZS5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19ldmVudHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9ldmVudHMoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuYWJpZGUnKS5vbigncmVzZXQuemYuYWJpZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMyLnJlc2V0Rm9ybSgpO1xuICAgICAgICB9KS5vbignc3VibWl0LnpmLmFiaWRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpczIudmFsaWRhdGVGb3JtKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmFsaWRhdGVPbiA9PT0gJ2ZpZWxkQ2hhbmdlJykge1xuICAgICAgICAgIHRoaXMuJGlucHV0cy5vZmYoJ2NoYW5nZS56Zi5hYmlkZScpLm9uKCdjaGFuZ2UuemYuYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3RoaXMyLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5saXZlVmFsaWRhdGUpIHtcbiAgICAgICAgICB0aGlzLiRpbnB1dHMub2ZmKCdpbnB1dC56Zi5hYmlkZScpLm9uKCdpbnB1dC56Zi5hYmlkZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfdGhpczIudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZhbGlkYXRlT25CbHVyKSB7XG4gICAgICAgICAgdGhpcy4kaW5wdXRzLm9mZignYmx1ci56Zi5hYmlkZScpLm9uKCdibHVyLnpmLmFiaWRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF90aGlzMi52YWxpZGF0ZUlucHV0KCQoZS50YXJnZXQpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIEFiaWRlIHVwb24gRE9NIGNoYW5nZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3JlZmxvdycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlZmxvdygpIHtcbiAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIGZvcm0gZWxlbWVudCBoYXMgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBhbmQgaWYgaXQncyBjaGVja2VkIG9yIG5vdFxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXR0cmlidXRlIGlzIGNoZWNrZWQgb3IgZW1wdHlcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVxdWlyZWRDaGVjaycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWlyZWRDaGVjaygkZWwpIHtcbiAgICAgICAgaWYgKCEkZWwuYXR0cigncmVxdWlyZWQnKSkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgdmFyIGlzR29vZCA9IHRydWU7XG5cbiAgICAgICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICAgIGlzR29vZCA9ICRlbFswXS5jaGVja2VkO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgICAgICB2YXIgb3B0ID0gJGVsLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpO1xuICAgICAgICAgICAgaWYgKCFvcHQubGVuZ3RoIHx8ICFvcHQudmFsKCkpIGlzR29vZCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKCEkZWwudmFsKCkgfHwgISRlbC52YWwoKS5sZW5ndGgpIGlzR29vZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzR29vZDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBCYXNlZCBvbiAkZWwsIGdldCB0aGUgZmlyc3QgZWxlbWVudCB3aXRoIHNlbGVjdG9yIGluIHRoaXMgb3JkZXI6XG4gICAgICAgKiAxLiBUaGUgZWxlbWVudCdzIGRpcmVjdCBzaWJsaW5nKCdzKS5cbiAgICAgICAqIDMuIFRoZSBlbGVtZW50J3MgcGFyZW50J3MgY2hpbGRyZW4uXG4gICAgICAgKlxuICAgICAgICogVGhpcyBhbGxvd3MgZm9yIG11bHRpcGxlIGZvcm0gZXJyb3JzIHBlciBpbnB1dCwgdGhvdWdoIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBmb3JtIGVycm9ycyB3aWxsIGJlIHNob3duLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyByZWZlcmVuY2UgdG8gZmluZCB0aGUgZm9ybSBlcnJvciBzZWxlY3Rvci5cbiAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGpRdWVyeSBvYmplY3Qgd2l0aCB0aGUgc2VsZWN0b3IuXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2ZpbmRGb3JtRXJyb3InLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRGb3JtRXJyb3IoJGVsKSB7XG4gICAgICAgIHZhciAkZXJyb3IgPSAkZWwuc2libGluZ3ModGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcblxuICAgICAgICBpZiAoISRlcnJvci5sZW5ndGgpIHtcbiAgICAgICAgICAkZXJyb3IgPSAkZWwucGFyZW50KCkuZmluZCh0aGlzLm9wdGlvbnMuZm9ybUVycm9yU2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRlcnJvcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhpcyBvcmRlcjpcbiAgICAgICAqIDIuIFRoZSA8bGFiZWw+IHdpdGggdGhlIGF0dHJpYnV0ZSBgW2Zvcj1cInNvbWVJbnB1dElkXCJdYFxuICAgICAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdmaW5kTGFiZWwnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRMYWJlbCgkZWwpIHtcbiAgICAgICAgdmFyIGlkID0gJGVsWzBdLmlkO1xuICAgICAgICB2YXIgJGxhYmVsID0gdGhpcy4kZWxlbWVudC5maW5kKCdsYWJlbFtmb3I9XCInICsgaWQgKyAnXCJdJyk7XG5cbiAgICAgICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuICRlbC5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRsYWJlbDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIHNldCBvZiBsYWJlbHMgYXNzb2NpYXRlZCB3aXRoIGEgc2V0IG9mIHJhZGlvIGVscyBpbiB0aGlzIG9yZGVyXG4gICAgICAgKiAyLiBUaGUgPGxhYmVsPiB3aXRoIHRoZSBhdHRyaWJ1dGUgYFtmb3I9XCJzb21lSW5wdXRJZFwiXWBcbiAgICAgICAqIDMuIFRoZSBgLmNsb3Nlc3QoKWAgPGxhYmVsPlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXR0cmlidXRlIGlzIGNoZWNrZWQgb3IgZW1wdHlcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZmluZFJhZGlvTGFiZWxzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmaW5kUmFkaW9MYWJlbHMoJGVscykge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICB2YXIgbGFiZWxzID0gJGVscy5tYXAoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgdmFyIGlkID0gZWwuaWQ7XG4gICAgICAgICAgdmFyICRsYWJlbCA9IF90aGlzMy4kZWxlbWVudC5maW5kKCdsYWJlbFtmb3I9XCInICsgaWQgKyAnXCJdJyk7XG5cbiAgICAgICAgICBpZiAoISRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICRsYWJlbCA9ICQoZWwpLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAkbGFiZWxbMF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAkKGxhYmVscyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyB0aGUgQ1NTIGVycm9yIGNsYXNzIGFzIHNwZWNpZmllZCBieSB0aGUgQWJpZGUgc2V0dGluZ3MgdG8gdGhlIGxhYmVsLCBpbnB1dCwgYW5kIHRoZSBmb3JtXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIGNsYXNzIHRvXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2FkZEVycm9yQ2xhc3NlcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgICAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKTtcbiAgICAgICAgdmFyICRmb3JtRXJyb3IgPSB0aGlzLmZpbmRGb3JtRXJyb3IoJGVsKTtcblxuICAgICAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgICAgICRsYWJlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgICAgICRmb3JtRXJyb3IuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5hdHRyKCdkYXRhLWludmFsaWQnLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlIENTUyBlcnJvciBjbGFzc2VzIGV0YyBmcm9tIGFuIGVudGlyZSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cE5hbWUgLSBBIHN0cmluZyB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZSBvZiBhIHJhZGlvIGJ1dHRvbiBncm91cFxuICAgICAgICpcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVJhZGlvRXJyb3JDbGFzc2VzKGdyb3VwTmFtZSkge1xuICAgICAgICB2YXIgJGVscyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnOnJhZGlvW25hbWU9XCInICsgZ3JvdXBOYW1lICsgJ1wiXScpO1xuICAgICAgICB2YXIgJGxhYmVscyA9IHRoaXMuZmluZFJhZGlvTGFiZWxzKCRlbHMpO1xuICAgICAgICB2YXIgJGZvcm1FcnJvcnMgPSB0aGlzLmZpbmRGb3JtRXJyb3IoJGVscyk7XG5cbiAgICAgICAgaWYgKCRsYWJlbHMubGVuZ3RoKSB7XG4gICAgICAgICAgJGxhYmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZm9ybUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAkZm9ybUVycm9ycy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIENTUyBlcnJvciBjbGFzcyBhcyBzcGVjaWZpZWQgYnkgdGhlIEFiaWRlIHNldHRpbmdzIGZyb20gdGhlIGxhYmVsLCBpbnB1dCwgYW5kIHRoZSBmb3JtXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byByZW1vdmUgdGhlIGNsYXNzIGZyb21cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVtb3ZlRXJyb3JDbGFzc2VzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFcnJvckNsYXNzZXMoJGVsKSB7XG4gICAgICAgIC8vIHJhZGlvcyBuZWVkIHRvIGNsZWFyIGFsbCBvZiB0aGUgZWxzXG4gICAgICAgIGlmICgkZWxbMF0udHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlUmFkaW9FcnJvckNsYXNzZXMoJGVsLmF0dHIoJ25hbWUnKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKTtcbiAgICAgICAgdmFyICRmb3JtRXJyb3IgPSB0aGlzLmZpbmRGb3JtRXJyb3IoJGVsKTtcblxuICAgICAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgICAgICRmb3JtRXJyb3IucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIHRvIGZpbmQgaW5wdXRzIGFuZCBwcm9jZWVkcyB0byB2YWxpZGF0ZSB0aGVtIGluIHdheXMgc3BlY2lmaWMgdG8gdGhlaXIgdHlwZS4gXG4gICAgICAgKiBJZ25vcmVzIGlucHV0cyB3aXRoIGRhdGEtYWJpZGUtaWdub3JlLCB0eXBlPVwiaGlkZGVuXCIgb3IgZGlzYWJsZWQgYXR0cmlidXRlcyBzZXRcbiAgICAgICAqIEBmaXJlcyBBYmlkZSNpbnZhbGlkXG4gICAgICAgKiBAZmlyZXMgQWJpZGUjdmFsaWRcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGFuIEhUTUwgaW5wdXRcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBnb29kVG9HbyAtIElmIHRoZSBpbnB1dCBpcyB2YWxpZCBvciBub3QuXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3ZhbGlkYXRlSW5wdXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbGlkYXRlSW5wdXQoJGVsKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIHZhciBjbGVhclJlcXVpcmUgPSB0aGlzLnJlcXVpcmVkQ2hlY2soJGVsKSxcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdHJ1ZSxcbiAgICAgICAgICAgIHZhbGlkYXRvciA9ICRlbC5hdHRyKCdkYXRhLXZhbGlkYXRvcicpLFxuICAgICAgICAgICAgZXF1YWxUbyA9IHRydWU7XG5cbiAgICAgICAgLy8gZG9uJ3QgdmFsaWRhdGUgaWdub3JlZCBpbnB1dHMgb3IgaGlkZGVuIGlucHV0cyBvciBkaXNhYmxlZCBpbnB1dHNcbiAgICAgICAgaWYgKCRlbC5pcygnW2RhdGEtYWJpZGUtaWdub3JlXScpIHx8ICRlbC5pcygnW3R5cGU9XCJoaWRkZW5cIl0nKSB8fCAkZWwuaXMoJ1tkaXNhYmxlZF0nKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVSYWRpbygkZWwuYXR0cignbmFtZScpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgICAgdmFsaWRhdGVkID0gY2xlYXJSZXF1aXJlO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSB0aGlzLnZhbGlkYXRlVGV4dCgkZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIGN1c3RvbVZhbGlkYXRvciA9IHRoaXMubWF0Y2hWYWxpZGF0aW9uKCRlbCwgdmFsaWRhdG9yLCAkZWwuYXR0cigncmVxdWlyZWQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGVsLmF0dHIoJ2RhdGEtZXF1YWx0bycpKSB7XG4gICAgICAgICAgZXF1YWxUbyA9IHRoaXMub3B0aW9ucy52YWxpZGF0b3JzLmVxdWFsVG8oJGVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBnb29kVG9HbyA9IFtjbGVhclJlcXVpcmUsIHZhbGlkYXRlZCwgY3VzdG9tVmFsaWRhdG9yLCBlcXVhbFRvXS5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gICAgICAgIHZhciBtZXNzYWdlID0gKGdvb2RUb0dvID8gJ3ZhbGlkJyA6ICdpbnZhbGlkJykgKyAnLnpmLmFiaWRlJztcblxuICAgICAgICBpZiAoZ29vZFRvR28pIHtcbiAgICAgICAgICAvLyBSZS12YWxpZGF0ZSBpbnB1dHMgdGhhdCBkZXBlbmQgb24gdGhpcyBvbmUgd2l0aCBlcXVhbHRvXG4gICAgICAgICAgdmFyIGRlcGVuZGVudEVsZW1lbnRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1lcXVhbHRvPVwiJyArICRlbC5hdHRyKCdpZCcpICsgJ1wiXScpO1xuICAgICAgICAgIGlmIChkZXBlbmRlbnRFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciBfdGhpcyA9IF90aGlzNDtcbiAgICAgICAgICAgICAgZGVwZW5kZW50RWxlbWVudHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykudmFsKCkpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzLnZhbGlkYXRlSW5wdXQoJCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tnb29kVG9HbyA/ICdyZW1vdmVFcnJvckNsYXNzZXMnIDogJ2FkZEVycm9yQ2xhc3NlcyddKCRlbCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGlucHV0IGlzIGRvbmUgY2hlY2tpbmcgZm9yIHZhbGlkYXRpb24uIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGB2YWxpZC56Zi5hYmlkZWAgb3IgYGludmFsaWQuemYuYWJpZGVgXG4gICAgICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIERPTSBlbGVtZW50IG9mIHRoZSBpbnB1dC5cbiAgICAgICAgICogQGV2ZW50IEFiaWRlI3ZhbGlkXG4gICAgICAgICAqIEBldmVudCBBYmlkZSNpbnZhbGlkXG4gICAgICAgICAqL1xuICAgICAgICAkZWwudHJpZ2dlcihtZXNzYWdlLCBbJGVsXSk7XG5cbiAgICAgICAgcmV0dXJuIGdvb2RUb0dvO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdvZXMgdGhyb3VnaCBhIGZvcm0gYW5kIGlmIHRoZXJlIGFyZSBhbnkgaW52YWxpZCBpbnB1dHMsIGl0IHdpbGwgZGlzcGxheSB0aGUgZm9ybSBlcnJvciBlbGVtZW50XG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gbm9FcnJvciAtIHRydWUgaWYgbm8gZXJyb3JzIHdlcmUgZGV0ZWN0ZWQuLi5cbiAgICAgICAqIEBmaXJlcyBBYmlkZSNmb3JtdmFsaWRcbiAgICAgICAqIEBmaXJlcyBBYmlkZSNmb3JtaW52YWxpZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd2YWxpZGF0ZUZvcm0nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbGlkYXRlRm9ybSgpIHtcbiAgICAgICAgdmFyIGFjYyA9IFtdO1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBhY2MucHVzaChfdGhpcy52YWxpZGF0ZUlucHV0KCQodGhpcykpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIG5vRXJyb3IgPSBhY2MuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5Jywgbm9FcnJvciA/ICdub25lJyA6ICdibG9jaycpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGlzIGZpbmlzaGVkIHZhbGlkYXRpbmcuIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGBmb3JtdmFsaWQuemYuYWJpZGVgIG9yIGBmb3JtaW52YWxpZC56Zi5hYmlkZWAuXG4gICAgICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIGVsZW1lbnQgb2YgdGhlIGZvcm0uXG4gICAgICAgICAqIEBldmVudCBBYmlkZSNmb3JtdmFsaWRcbiAgICAgICAgICogQGV2ZW50IEFiaWRlI2Zvcm1pbnZhbGlkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoKG5vRXJyb3IgPyAnZm9ybXZhbGlkJyA6ICdmb3JtaW52YWxpZCcpICsgJy56Zi5hYmlkZScsIFt0aGlzLiRlbGVtZW50XSk7XG5cbiAgICAgICAgcmV0dXJuIG5vRXJyb3I7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgdGV4dCBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB0aGUgcGF0dGVybiBzcGVjaWZpZWQgaW4gdGhlIGF0dHJpYnV0ZS4gSWYgbm8gbWF0Y2hpbmcgcGF0dGVybiBpcyBmb3VuZCwgcmV0dXJucyB0cnVlLlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gdmFsaWRhdGUsIHNob3VsZCBiZSBhIHRleHQgaW5wdXQgSFRNTCBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0dGVybiAtIHN0cmluZyB2YWx1ZSBvZiBvbmUgb2YgdGhlIFJlZ0V4IHBhdHRlcm5zIGluIEFiaWRlLm9wdGlvbnMucGF0dGVybnNcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgdGhlIGlucHV0IHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4gc3BlY2lmaWVkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3ZhbGlkYXRlVGV4dCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsaWRhdGVUZXh0KCRlbCwgcGF0dGVybikge1xuICAgICAgICAvLyBBIHBhdHRlcm4gY2FuIGJlIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uLCBvciBpdCB3aWxsIGJlIGluZmVyZWQgZnJvbSB0aGUgaW5wdXQncyBcInBhdHRlcm5cIiBhdHRyaWJ1dGUsIG9yIGl0J3MgXCJ0eXBlXCIgYXR0cmlidXRlXG4gICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuIHx8ICRlbC5hdHRyKCdwYXR0ZXJuJykgfHwgJGVsLmF0dHIoJ3R5cGUnKTtcbiAgICAgICAgdmFyIGlucHV0VGV4dCA9ICRlbC52YWwoKTtcbiAgICAgICAgdmFyIHZhbGlkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGlucHV0VGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcGF0dGVybiBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQgaXMgaW4gQWJpZGUncyBsaXN0IG9mIHBhdHRlcm5zLCB0aGVuIHRlc3QgdGhhdCByZWdleHBcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhdHRlcm5zLmhhc093blByb3BlcnR5KHBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YWxpZCA9IHRoaXMub3B0aW9ucy5wYXR0ZXJuc1twYXR0ZXJuXS50ZXN0KGlucHV0VGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIG5hbWUgaXNuJ3QgYWxzbyB0aGUgdHlwZSBhdHRyaWJ1dGUgb2YgdGhlIGZpZWxkLCB0aGVuIHRlc3QgaXQgYXMgYSByZWdleHBcbiAgICAgICAgICBlbHNlIGlmIChwYXR0ZXJuICE9PSAkZWwuYXR0cigndHlwZScpKSB7XG4gICAgICAgICAgICAgIHZhbGlkID0gbmV3IFJlZ0V4cChwYXR0ZXJuKS50ZXN0KGlucHV0VGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQW4gZW1wdHkgZmllbGQgaXMgdmFsaWQgaWYgaXQncyBub3QgcmVxdWlyZWRcbiAgICAgICAgZWxzZSBpZiAoISRlbC5wcm9wKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3IgYSBub3QgYSByYWRpbyBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCBpdCBpcyByZXF1aXJlZCBhbmQgc2VsZWN0ZWQuIEFsdGhvdWdoIHRoZSBmdW5jdGlvbiB0YXJnZXRzIGEgc2luZ2xlIGA8aW5wdXQ+YCwgaXQgdmFsaWRhdGVzIGJ5IGNoZWNraW5nIHRoZSBgcmVxdWlyZWRgIGFuZCBgY2hlY2tlZGAgcHJvcGVydGllcyBvZiBhbGwgcmFkaW8gYnV0dG9ucyBpbiBpdHMgZ3JvdXAuXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXBOYW1lIC0gQSBzdHJpbmcgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWUgb2YgYSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXQgbGVhc3Qgb25lIHJhZGlvIGlucHV0IGhhcyBiZWVuIHNlbGVjdGVkIChpZiBpdCdzIHJlcXVpcmVkKVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd2YWxpZGF0ZVJhZGlvJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWxpZGF0ZVJhZGlvKGdyb3VwTmFtZSkge1xuICAgICAgICAvLyBJZiBhdCBsZWFzdCBvbmUgcmFkaW8gaW4gdGhlIGdyb3VwIGhhcyB0aGUgYHJlcXVpcmVkYCBhdHRyaWJ1dGUsIHRoZSBncm91cCBpcyBjb25zaWRlcmVkIHJlcXVpcmVkXG4gICAgICAgIC8vIFBlciBXM0Mgc3BlYywgYWxsIHJhZGlvIGJ1dHRvbnMgaW4gYSBncm91cCBzaG91bGQgaGF2ZSBgcmVxdWlyZWRgLCBidXQgd2UncmUgYmVpbmcgbmljZVxuICAgICAgICB2YXIgJGdyb3VwID0gdGhpcy4kZWxlbWVudC5maW5kKCc6cmFkaW9bbmFtZT1cIicgKyBncm91cE5hbWUgKyAnXCJdJyk7XG4gICAgICAgIHZhciB2YWxpZCA9IGZhbHNlLFxuICAgICAgICAgICAgcmVxdWlyZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBGb3IgdGhlIGdyb3VwIHRvIGJlIHJlcXVpcmVkLCBhdCBsZWFzdCBvbmUgcmFkaW8gbmVlZHMgdG8gYmUgcmVxdWlyZWRcbiAgICAgICAgJGdyb3VwLmVhY2goZnVuY3Rpb24gKGksIGUpIHtcbiAgICAgICAgICBpZiAoJChlKS5hdHRyKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgICByZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXF1aXJlZCkgdmFsaWQgPSB0cnVlO1xuXG4gICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAvLyBGb3IgdGhlIGdyb3VwIHRvIGJlIHZhbGlkLCBhdCBsZWFzdCBvbmUgcmFkaW8gbmVlZHMgdG8gYmUgY2hlY2tlZFxuICAgICAgICAgICRncm91cC5lYWNoKGZ1bmN0aW9uIChpLCBlKSB7XG4gICAgICAgICAgICBpZiAoJChlKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlcm1pbmVzIGlmIGEgc2VsZWN0ZWQgaW5wdXQgcGFzc2VzIGEgY3VzdG9tIHZhbGlkYXRpb24gZnVuY3Rpb24uIE11bHRpcGxlIHZhbGlkYXRpb25zIGNhbiBiZSB1c2VkLCBpZiBwYXNzZWQgdG8gdGhlIGVsZW1lbnQgd2l0aCBgZGF0YS12YWxpZGF0b3I9XCJmb28gYmFyIGJhelwiYCBpbiBhIHNwYWNlIHNlcGFyYXRlZCBsaXN0ZWQuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IGlucHV0IGVsZW1lbnQuXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsaWRhdG9ycyAtIGEgc3RyaW5nIG9mIGZ1bmN0aW9uIG5hbWVzIG1hdGNoaW5nIGZ1bmN0aW9ucyBpbiB0aGUgQWJpZGUub3B0aW9ucy52YWxpZGF0b3JzIG9iamVjdC5cbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVxdWlyZWQgLSBzZWxmIGV4cGxhbmF0b3J5P1xuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiB2YWxpZGF0aW9ucyBwYXNzZWQuXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ21hdGNoVmFsaWRhdGlvbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbWF0Y2hWYWxpZGF0aW9uKCRlbCwgdmFsaWRhdG9ycywgcmVxdWlyZWQpIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgcmVxdWlyZWQgPSByZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICB2YXIgY2xlYXIgPSB2YWxpZGF0b3JzLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzNS5vcHRpb25zLnZhbGlkYXRvcnNbdl0oJGVsLCByZXF1aXJlZCwgJGVsLnBhcmVudCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjbGVhci5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVzZXRzIGZvcm0gaW5wdXRzIGFuZCBzdHlsZXNcbiAgICAgICAqIEBmaXJlcyBBYmlkZSNmb3JtcmVzZXRcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAncmVzZXRGb3JtJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldEZvcm0oKSB7XG4gICAgICAgIHZhciAkZm9ybSA9IHRoaXMuJGVsZW1lbnQsXG4gICAgICAgICAgICBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICQoJy4nICsgb3B0cy5sYWJlbEVycm9yQ2xhc3MsICRmb3JtKS5ub3QoJ3NtYWxsJykucmVtb3ZlQ2xhc3Mob3B0cy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgICAgICAkKCcuJyArIG9wdHMuaW5wdXRFcnJvckNsYXNzLCAkZm9ybSkubm90KCdzbWFsbCcpLnJlbW92ZUNsYXNzKG9wdHMuaW5wdXRFcnJvckNsYXNzKTtcbiAgICAgICAgJChvcHRzLmZvcm1FcnJvclNlbGVjdG9yICsgJy4nICsgb3B0cy5mb3JtRXJyb3JDbGFzcykucmVtb3ZlQ2xhc3Mob3B0cy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgICAgICRmb3JtLmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICQoJzppbnB1dCcsICRmb3JtKS5ub3QoJzpidXR0b24sIDpzdWJtaXQsIDpyZXNldCwgOmhpZGRlbiwgOnJhZGlvLCA6Y2hlY2tib3gsIFtkYXRhLWFiaWRlLWlnbm9yZV0nKS52YWwoJycpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICAgICAkKCc6aW5wdXQ6cmFkaW8nLCAkZm9ybSkubm90KCdbZGF0YS1hYmlkZS1pZ25vcmVdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAgICAgJCgnOmlucHV0OmNoZWNrYm94JywgJGZvcm0pLm5vdCgnW2RhdGEtYWJpZGUtaWdub3JlXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSkucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGhhcyBiZWVuIHJlc2V0LlxuICAgICAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXJlc2V0XG4gICAgICAgICAqL1xuICAgICAgICAkZm9ybS50cmlnZ2VyKCdmb3JtcmVzZXQuemYuYWJpZGUnLCBbJGZvcm1dKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICAgICAqIFJlbW92ZXMgZXJyb3Igc3R5bGVzIGFuZCBjbGFzc2VzIGZyb20gZWxlbWVudHMsIHdpdGhvdXQgcmVzZXR0aW5nIHRoZWlyIHZhbHVlcy5cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5hYmlkZScpLmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbiAgICAgICAgdGhpcy4kaW5wdXRzLm9mZignLmFiaWRlJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMucmVtb3ZlRXJyb3JDbGFzc2VzKCQodGhpcykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEFiaWRlO1xuICB9KCk7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICAgKi9cblxuXG4gIEFiaWRlLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGV2ZW50IHRvIHZhbGlkYXRlIGlucHV0cy4gQ2hlY2tib3hlcyBhbmQgcmFkaW9zIHZhbGlkYXRlIGltbWVkaWF0ZWx5LlxuICAgICAqIFJlbW92ZSBvciBjaGFuZ2UgdGhpcyB2YWx1ZSBmb3IgbWFudWFsIHZhbGlkYXRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdmaWVsZENoYW5nZSdcbiAgICAgKi9cbiAgICB2YWxpZGF0ZU9uOiAnZmllbGRDaGFuZ2UnLFxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byBpbnB1dCBsYWJlbHMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJ2lzLWludmFsaWQtbGFiZWwnXG4gICAgICovXG4gICAgbGFiZWxFcnJvckNsYXNzOiAnaXMtaW52YWxpZC1sYWJlbCcsXG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0cyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnaXMtaW52YWxpZC1pbnB1dCdcbiAgICAgKi9cbiAgICBpbnB1dEVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkLWlucHV0JyxcblxuICAgIC8qKlxuICAgICAqIENsYXNzIHNlbGVjdG9yIHRvIHVzZSB0byB0YXJnZXQgRm9ybSBFcnJvcnMgZm9yIHNob3cvaGlkZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnLmZvcm0tZXJyb3InXG4gICAgICovXG4gICAgZm9ybUVycm9yU2VsZWN0b3I6ICcuZm9ybS1lcnJvcicsXG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyBhZGRlZCB0byBGb3JtIEVycm9ycyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnaXMtdmlzaWJsZSdcbiAgICAgKi9cbiAgICBmb3JtRXJyb3JDbGFzczogJ2lzLXZpc2libGUnLFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRvIHRydWUgdG8gdmFsaWRhdGUgdGV4dCBpbnB1dHMgb24gYW55IHZhbHVlIGNoYW5nZS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBsaXZlVmFsaWRhdGU6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRvIHRydWUgdG8gdmFsaWRhdGUgaW5wdXRzIG9uIGJsdXIuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgdmFsaWRhdGVPbkJsdXI6IGZhbHNlLFxuXG4gICAgcGF0dGVybnM6IHtcbiAgICAgIGFscGhhOiAvXlthLXpBLVpdKyQvLFxuICAgICAgYWxwaGFfbnVtZXJpYzogL15bYS16QS1aMC05XSskLyxcbiAgICAgIGludGVnZXI6IC9eWy0rXT9cXGQrJC8sXG4gICAgICBudW1iZXI6IC9eWy0rXT9cXGQqKD86W1xcLlxcLF1cXGQrKT8kLyxcblxuICAgICAgLy8gYW1leCwgdmlzYSwgZGluZXJzXG4gICAgICBjYXJkOiAvXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XVswLTldKVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18KD86MjEzMXwxODAwfDM1XFxkezN9KVxcZHsxMX0pJC8sXG4gICAgICBjdnY6IC9eKFswLTldKXszLDR9JC8sXG5cbiAgICAgIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3N0YXRlcy1vZi10aGUtdHlwZS1hdHRyaWJ1dGUuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzc1xuICAgICAgZW1haWw6IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyQvLFxuXG4gICAgICB1cmw6IC9eKGh0dHBzP3xmdHB8ZmlsZXxzc2gpOlxcL1xcLygoKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6KSpAKT8oKChcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSkpfCgoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLj8pKDpcXGQqKT8pKFxcLygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkrKFxcLygoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSopKik/KT8oXFw/KCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxbXFx1RTAwMC1cXHVGOEZGXXxcXC98XFw/KSopPyhcXCMoKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFxcL3xcXD8pKik/JC8sXG4gICAgICAvLyBhYmMuZGVcbiAgICAgIGRvbWFpbjogL14oW2EtekEtWjAtOV0oW2EtekEtWjAtOVxcLV17MCw2MX1bYS16QS1aMC05XSk/XFwuKStbYS16QS1aXXsyLDh9JC8sXG5cbiAgICAgIGRhdGV0aW1lOiAvXihbMC0yXVswLTldezN9KVxcLShbMC0xXVswLTldKVxcLShbMC0zXVswLTldKVQoWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSkoWnwoW1xcLVxcK10oWzAtMV1bMC05XSlcXDowMCkpJC8sXG4gICAgICAvLyBZWVlZLU1NLUREXG4gICAgICBkYXRlOiAvKD86MTl8MjApWzAtOV17Mn0tKD86KD86MFsxLTldfDFbMC0yXSktKD86MFsxLTldfDFbMC05XXwyWzAtOV0pfCg/Oig/ITAyKSg/OjBbMS05XXwxWzAtMl0pLSg/OjMwKSl8KD86KD86MFsxMzU3OF18MVswMl0pLTMxKSkkLyxcbiAgICAgIC8vIEhIOk1NOlNTXG4gICAgICB0aW1lOiAvXigwWzAtOV18MVswLTldfDJbMC0zXSkoOlswLTVdWzAtOV0pezJ9JC8sXG4gICAgICBkYXRlSVNPOiAvXlxcZHs0fVtcXC9cXC1dXFxkezEsMn1bXFwvXFwtXVxcZHsxLDJ9JC8sXG4gICAgICAvLyBNTS9ERC9ZWVlZXG4gICAgICBtb250aF9kYXlfeWVhcjogL14oMFsxLTldfDFbMDEyXSlbLSBcXC8uXSgwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dXFxkezR9JC8sXG4gICAgICAvLyBERC9NTS9ZWVlZXG4gICAgICBkYXlfbW9udGhfeWVhcjogL14oMFsxLTldfFsxMl1bMC05XXwzWzAxXSlbLSBcXC8uXSgwWzEtOV18MVswMTJdKVstIFxcLy5dXFxkezR9JC8sXG5cbiAgICAgIC8vICNGRkYgb3IgI0ZGRkZGRlxuICAgICAgY29sb3I6IC9eIz8oW2EtZkEtRjAtOV17Nn18W2EtZkEtRjAtOV17M30pJC9cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgdmFsaWRhdGlvbiBmdW5jdGlvbnMgdG8gYmUgdXNlZC4gYGVxdWFsVG9gIGJlaW5nIHRoZSBvbmx5IGRlZmF1bHQgaW5jbHVkZWQgZnVuY3Rpb24uXG4gICAgICogRnVuY3Rpb25zIHNob3VsZCByZXR1cm4gb25seSBhIGJvb2xlYW4gaWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC4gRnVuY3Rpb25zIGFyZSBnaXZlbiB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAgKiBlbCA6IFRoZSBqUXVlcnkgZWxlbWVudCB0byB2YWxpZGF0ZS5cbiAgICAgKiByZXF1aXJlZCA6IEJvb2xlYW4gdmFsdWUgb2YgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBiZSBwcmVzZW50IG9yIG5vdC5cbiAgICAgKiBwYXJlbnQgOiBUaGUgZGlyZWN0IHBhcmVudCBvZiB0aGUgaW5wdXQuXG4gICAgICogQG9wdGlvblxuICAgICAqL1xuICAgIHZhbGlkYXRvcnM6IHtcbiAgICAgIGVxdWFsVG86IGZ1bmN0aW9uIChlbCwgcmVxdWlyZWQsIHBhcmVudCkge1xuICAgICAgICByZXR1cm4gJCgnIycgKyBlbC5hdHRyKCdkYXRhLWVxdWFsdG8nKSkudmFsKCkgPT09IGVsLnZhbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihBYmlkZSwgJ0FiaWRlJyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogRHJvcGRvd25NZW51IG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duLW1lbnVcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmJveFxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAgICovXG5cbiAgdmFyIERyb3Bkb3duTWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERyb3Bkb3duTWVudS5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I2luaXRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gRHJvcGRvd25NZW51KGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEcm9wZG93bk1lbnUpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcm9wZG93bk1lbnUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgICAgRm91bmRhdGlvbi5OZXN0LkZlYXRoZXIodGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XG4gICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0Ryb3Bkb3duTWVudScpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignRHJvcGRvd25NZW51Jywge1xuICAgICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnLFxuICAgICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiwgYW5kIGNhbGxzIF9wcmVwYXJlTWVudVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhEcm9wZG93bk1lbnUsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIHZhciBzdWJzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcygnZmlyc3Qtc3ViJyk7XG5cbiAgICAgICAgdGhpcy4kbWVudUl0ZW1zID0gdGhpcy4kZWxlbWVudC5maW5kKCdbcm9sZT1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbcm9sZT1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICAgIHRoaXMuJHRhYnMuZmluZCgndWwuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbENsYXNzKTtcblxuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMucmlnaHRDbGFzcykgfHwgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ3JpZ2h0JyB8fCBGb3VuZGF0aW9uLnJ0bCgpIHx8IHRoaXMuJGVsZW1lbnQucGFyZW50cygnLnRvcC1iYXItcmlnaHQnKS5pcygnKicpKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9ICdyaWdodCc7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1YnMuYWRkQ2xhc3MoJ29wZW5zLXJpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2V2ZW50cygpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ19pc1ZlcnRpY2FsJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaXNWZXJ0aWNhbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHRhYnMuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jayc7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gZWxlbWVudHMgd2l0aGluIHRoZSBtZW51XG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19ldmVudHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9ldmVudHMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICBoYXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyB8fCB0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcsXG4gICAgICAgICAgICBwYXJDbGFzcyA9ICdpcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAgICAgLy8gdXNlZCBmb3Igb25DbGljayBhbmQgaW4gdGhlIGtleWJvYXJkIGhhbmRsZXJzXG4gICAgICAgIHZhciBoYW5kbGVDbGlja0ZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJGVsZW0gPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJy4nICsgcGFyQ2xhc3MpLFxuICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyksXG4gICAgICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcbiAgICAgICAgICAgICAgJHN1YiA9ICRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpO1xuXG4gICAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgICAgaWYgKGhhc0NsaWNrZWQpIHtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayB8fCAhX3RoaXMub3B0aW9ucy5jbGlja09wZW4gJiYgIWhhc1RvdWNoIHx8IF90aGlzLm9wdGlvbnMuZm9yY2VGb2xsb3cgJiYgaGFzVG91Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICAgICAkZWxlbS5hZGQoJGVsZW0ucGFyZW50c1VudGlsKF90aGlzLiRlbGVtZW50LCAnLicgKyBwYXJDbGFzcykpLmF0dHIoJ2RhdGEtaXMtY2xpY2snLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja09wZW4gfHwgaGFzVG91Y2gpIHtcbiAgICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudSB0b3VjaHN0YXJ0LnpmLmRyb3Bkb3dubWVudScsIGhhbmRsZUNsaWNrRm4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGFuZGxlIExlYWYgZWxlbWVudCBDbGlja3NcbiAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrSW5zaWRlKSB7XG4gICAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgICAgICBpZiAoIWhhc1N1Yikge1xuICAgICAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUhvdmVyKSB7XG4gICAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcblxuICAgICAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fc2hvdygkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKSk7XG4gICAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgICAgIGlmIChoYXNTdWIgJiYgX3RoaXMub3B0aW9ucy5hdXRvY2xvc2UpIHtcbiAgICAgICAgICAgICAgaWYgKCRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnICYmIF90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmNsb3NpbmdUaW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdrZXlkb3duLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRlbGVtZW50ID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdbcm9sZT1cIm1lbnVpdGVtXCJdJyksXG4gICAgICAgICAgICAgIGlzVGFiID0gX3RoaXMuJHRhYnMuaW5kZXgoJGVsZW1lbnQpID4gLTEsXG4gICAgICAgICAgICAgICRlbGVtZW50cyA9IGlzVGFiID8gX3RoaXMuJHRhYnMgOiAkZWxlbWVudC5zaWJsaW5ncygnbGknKS5hZGQoJGVsZW1lbnQpLFxuICAgICAgICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkgLSAxKTtcbiAgICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkgKyAxKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIG5leHRTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEkZWxlbWVudC5pcygnOmxhc3QtY2hpbGQnKSkge1xuICAgICAgICAgICAgICAkbmV4dEVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJldlNpYmxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9wZW5TdWIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJHN1YiA9ICRlbGVtZW50LmNoaWxkcmVuKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG4gICAgICAgICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJHN1Yik7XG4gICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2xpID4gYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjbG9zZVN1YiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vaWYgKCRlbGVtZW50LmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xuICAgICAgICAgICAgdmFyIGNsb3NlID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKTtcbiAgICAgICAgICAgIGNsb3NlLmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIF90aGlzLl9oaWRlKGNsb3NlKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGZ1bmN0aW9ucyA9IHtcbiAgICAgICAgICAgIG9wZW46IG9wZW5TdWIsXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBfdGhpcy5faGlkZShfdGhpcy4kZWxlbWVudCk7XG4gICAgICAgICAgICAgIF90aGlzLiRtZW51SXRlbXMuZmluZCgnYTpmaXJzdCcpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKGlzVGFiKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuX2lzVmVydGljYWwoKSkge1xuICAgICAgICAgICAgICAvLyB2ZXJ0aWNhbCBtZW51XG4gICAgICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaG9yaXpvbnRhbCBtZW51XG4gICAgICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgbmV4dDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBwcmV2aW91czogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgICBuZXh0OiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBub3QgdGFicyAtPiBvbmUgc3ViXG4gICAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkge1xuICAgICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YixcbiAgICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdEcm9wZG93bk1lbnUnLCBmdW5jdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGJvZHkgdG8gY2xvc2UgYW55IGRyb3Bkb3ducyBvbiBhIGNsaWNrLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfYWRkQm9keUhhbmRsZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRCb2R5SGFuZGxlcigpIHtcbiAgICAgICAgdmFyICRib2R5ID0gJChkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKS5vbignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJGxpbmsgPSBfdGhpcy4kZWxlbWVudC5maW5kKGUudGFyZ2V0KTtcbiAgICAgICAgICBpZiAoJGxpbmsubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPcGVucyBhIGRyb3Bkb3duIHBhbmUsIGFuZCBjaGVja3MgZm9yIGNvbGxpc2lvbnMgZmlyc3QuXG4gICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJHN1YiAtIHVsIGVsZW1lbnQgdGhhdCBpcyBhIHN1Ym1lbnUgdG8gc2hvd1xuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQGZpcmVzIERyb3Bkb3duTWVudSNzaG93XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zaG93JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2hvdygkc3ViKSB7XG4gICAgICAgIHZhciBpZHggPSB0aGlzLiR0YWJzLmluZGV4KHRoaXMuJHRhYnMuZmlsdGVyKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIHJldHVybiAkKGVsKS5maW5kKCRzdWIpLmxlbmd0aCA+IDA7XG4gICAgICAgIH0pKTtcbiAgICAgICAgdmFyICRzaWJzID0gJHN1Yi5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jykuc2libGluZ3MoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAgIHRoaXMuX2hpZGUoJHNpYnMsIGlkeCk7XG4gICAgICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLmFkZENsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKS5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICB2YXIgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgICBpZiAoIWNsZWFyKSB7XG4gICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJy1yaWdodCcgOiAnLWxlZnQnLFxuICAgICAgICAgICAgICAkcGFyZW50TGkgPSAkc3ViLnBhcmVudCgnLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAgICAgJHBhcmVudExpLnJlbW92ZUNsYXNzKCdvcGVucycgKyBvbGRDbGFzcykuYWRkQ2xhc3MoJ29wZW5zLScgKyB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KTtcbiAgICAgICAgICBjbGVhciA9IEZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UoJHN1YiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAgICAgJHBhcmVudExpLnJlbW92ZUNsYXNzKCdvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCkuYWRkQ2xhc3MoJ29wZW5zLWlubmVyJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnJyk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7XG4gICAgICAgICAgdGhpcy5fYWRkQm9keUhhbmRsZXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbmV3IGRyb3Bkb3duIHBhbmUgaXMgdmlzaWJsZS5cbiAgICAgICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNzaG93XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3cuemYuZHJvcGRvd25tZW51JywgWyRzdWJdKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIaWRlcyBhIHNpbmdsZSwgY3VycmVudGx5IG9wZW4gZHJvcGRvd24gcGFuZSwgaWYgcGFzc2VkIGEgcGFyYW1ldGVyLCBvdGhlcndpc2UsIGhpZGVzIGV2ZXJ5dGhpbmcuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gaGlkZVxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIGluZGV4IG9mIHRoZSAkdGFicyBjb2xsZWN0aW9uIHRvIGhpZGVcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19oaWRlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGlkZSgkZWxlbSwgaWR4KSB7XG4gICAgICAgIHZhciAkdG9DbG9zZTtcbiAgICAgICAgaWYgKCRlbGVtICYmICRlbGVtLmxlbmd0aCkge1xuICAgICAgICAgICR0b0Nsb3NlID0gJGVsZW07XG4gICAgICAgIH0gZWxzZSBpZiAoaWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAkdG9DbG9zZSA9IHRoaXMuJHRhYnMubm90KGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGkgPT09IGlkeDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdG9DbG9zZSA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNvbWV0aGluZ1RvQ2xvc2UgPSAkdG9DbG9zZS5oYXNDbGFzcygnaXMtYWN0aXZlJykgfHwgJHRvQ2xvc2UuZmluZCgnLmlzLWFjdGl2ZScpLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgaWYgKHNvbWV0aGluZ1RvQ2xvc2UpIHtcbiAgICAgICAgICAkdG9DbG9zZS5maW5kKCdsaS5pcy1hY3RpdmUnKS5hZGQoJHRvQ2xvc2UpLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtaXMtY2xpY2snOiBmYWxzZVxuICAgICAgICAgIH0pLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICAgICAgICR0b0Nsb3NlLmZpbmQoJ3VsLmpzLWRyb3Bkb3duLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmICh0aGlzLmNoYW5nZWQgfHwgJHRvQ2xvc2UuZmluZCgnb3BlbnMtaW5uZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgICAgICAgICAkdG9DbG9zZS5maW5kKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZCgkdG9DbG9zZSkucmVtb3ZlQ2xhc3MoJ29wZW5zLWlubmVyIG9wZW5zLScgKyB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KS5hZGRDbGFzcygnb3BlbnMtJyArIG9sZENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvcGVuIG1lbnVzIGFyZSBjbG9zZWQuXG4gICAgICAgICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNoaWRlXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLmRyb3Bkb3dubWVudScsIFskdG9DbG9zZV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRtZW51SXRlbXMub2ZmKCcuemYuZHJvcGRvd25tZW51JykucmVtb3ZlQXR0cignZGF0YS1pcy1jbGljaycpLnJlbW92ZUNsYXNzKCdpcy1yaWdodC1hcnJvdyBpcy1sZWZ0LWFycm93IGlzLWRvd24tYXJyb3cgb3BlbnMtcmlnaHQgb3BlbnMtbGVmdCBvcGVucy1pbm5lcicpO1xuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignLnpmLmRyb3Bkb3dubWVudScpO1xuICAgICAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wZG93bk1lbnU7XG4gIH0oKTtcblxuICAvKipcbiAgICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gICAqL1xuXG5cbiAgRHJvcGRvd25NZW51LmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIERpc2FsbG93cyBob3ZlciBldmVudHMgZnJvbSBvcGVuaW5nIHN1Ym1lbnVzXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgZGlzYWJsZUhvdmVyOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBhdXRvY2xvc2U6IHRydWUsXG4gICAgLyoqXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGRlZmF1bHQgNTBcbiAgICAgKi9cbiAgICBob3ZlckRlbGF5OiA1MCxcbiAgICAvKipcbiAgICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gb3Blbi9yZW1haW4gb3BlbiBvbiBwYXJlbnQgY2xpY2sgZXZlbnQuIEFsbG93cyBjdXJzb3IgdG8gbW92ZSBhd2F5IGZyb20gbWVudS5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBjbGlja09wZW46IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCA1MDBcbiAgICAgKi9cblxuICAgIGNsb3NpbmdUaW1lOiA1MDAsXG4gICAgLyoqXG4gICAgICogUG9zaXRpb24gb2YgdGhlIG1lbnUgcmVsYXRpdmUgdG8gd2hhdCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnVzIHNob3VsZCBvcGVuLiBIYW5kbGVkIGJ5IEpTLiBDYW4gYmUgYCdsZWZ0J2Agb3IgYCdyaWdodCdgLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdsZWZ0J1xuICAgICAqL1xuICAgIGFsaWdubWVudDogJ2xlZnQnLFxuICAgIC8qKlxuICAgICAqIEFsbG93IGNsaWNrcyBvbiB0aGUgYm9keSB0byBjbG9zZSBhbnkgb3BlbiBzdWJtZW51cy5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGNsb3NlT25DbGljazogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBBbGxvdyBjbGlja3Mgb24gbGVhZiBhbmNob3IgbGlua3MgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjbG9zZU9uQ2xpY2tJbnNpZGU6IHRydWUsXG4gICAgLyoqXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byB2ZXJ0aWNhbCBvcmllbnRlZCBtZW51cywgRm91bmRhdGlvbiBkZWZhdWx0IGlzIGB2ZXJ0aWNhbGAuIFVwZGF0ZSB0aGlzIGlmIHVzaW5nIHlvdXIgb3duIGNsYXNzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICd2ZXJ0aWNhbCdcbiAgICAgKi9cbiAgICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxuICAgIC8qKlxuICAgICAqIENsYXNzIGFwcGxpZWQgdG8gcmlnaHQtc2lkZSBvcmllbnRlZCBtZW51cywgRm91bmRhdGlvbiBkZWZhdWx0IGlzIGBhbGlnbi1yaWdodGAuIFVwZGF0ZSB0aGlzIGlmIHVzaW5nIHlvdXIgb3duIGNsYXNzLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICdhbGlnbi1yaWdodCdcbiAgICAgKi9cbiAgICByaWdodENsYXNzOiAnYWxpZ24tcmlnaHQnLFxuICAgIC8qKlxuICAgICAqIEJvb2xlYW4gdG8gZm9yY2Ugb3ZlcmlkZSB0aGUgY2xpY2tpbmcgb2YgbGlua3MgdG8gcGVyZm9ybSBkZWZhdWx0IGFjdGlvbiwgb24gc2Vjb25kIHRvdWNoIGV2ZW50IGZvciBtb2JpbGUuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBmb3JjZUZvbGxvdzogdHJ1ZVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKERyb3Bkb3duTWVudSwgJ0Ryb3Bkb3duTWVudScpO1xufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIE9mZkNhbnZhcyBtb2R1bGUuXG4gICAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICAgKi9cblxuICB2YXIgT2ZmQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2ZmLWNhbnZhcyB3cmFwcGVyLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBpbml0aWFsaXplLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBPZmZDYW52YXMoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE9mZkNhbnZhcyk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgdGhpcy4kbGFzdFRyaWdnZXIgPSAkKCk7XG4gICAgICB0aGlzLiR0cmlnZ2VycyA9ICQoKTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT2ZmQ2FudmFzJywge1xuICAgICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIG9mZi1jYW52YXMgd3JhcHBlciBieSBhZGRpbmcgdGhlIGV4aXQgb3ZlcmxheSAoaWYgbmVlZGVkKS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoT2ZmQ2FudmFzLCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtdHJhbnNpdGlvbi0nICsgdGhpcy5vcHRpb25zLnRyYW5zaXRpb24pO1xuXG4gICAgICAgIC8vIEZpbmQgdHJpZ2dlcnMgdGhhdCBhZmZlY3QgdGhpcyBlbGVtZW50IGFuZCBhZGQgYXJpYS1leHBhbmRlZCB0byB0aGVtXG4gICAgICAgIHRoaXMuJHRyaWdnZXJzID0gJChkb2N1bWVudCkuZmluZCgnW2RhdGEtb3Blbj1cIicgKyBpZCArICdcIl0sIFtkYXRhLWNsb3NlPVwiJyArIGlkICsgJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJyArIGlkICsgJ1wiXScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKS5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgICAgIC8vIEFkZCBhbiBvdmVybGF5IG92ZXIgdGhlIGNvbnRlbnQgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgIHZhciBvdmVybGF5UG9zaXRpb24gPSAkKHRoaXMuJGVsZW1lbnQpLmNzcyhcInBvc2l0aW9uXCIpID09PSAnZml4ZWQnID8gJ2lzLW92ZXJsYXktZml4ZWQnIDogJ2lzLW92ZXJsYXktYWJzb2x1dGUnO1xuICAgICAgICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdqcy1vZmYtY2FudmFzLW92ZXJsYXkgJyArIG92ZXJsYXlQb3NpdGlvbik7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgICAgICAgaWYgKG92ZXJsYXlQb3NpdGlvbiA9PT0gJ2lzLW92ZXJsYXktZml4ZWQnKSB7XG4gICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID0gdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgfHwgbmV3IFJlZ0V4cCh0aGlzLm9wdGlvbnMucmV2ZWFsQ2xhc3MsICdnJykudGVzdCh0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgICAgICB0aGlzLl9zZXRNUUNoZWNrZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUoJCgnW2RhdGEtb2ZmLWNhbnZhc10nKVswXSkudHJhbnNpdGlvbkR1cmF0aW9uKSAqIDEwMDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19ldmVudHMnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9ldmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJykub24oe1xuICAgICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUpIHtcbiAgICAgICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJyk7XG4gICAgICAgICAgJHRhcmdldC5vbih7ICdjbGljay56Zi5vZmZjYW52YXMnOiB0aGlzLmNsb3NlLmJpbmQodGhpcykgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc2V0TVFDaGVja2VyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0TVFDaGVja2VyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5yZXZlYWwoZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZXZlYWwnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICAgICAgaWYgKGlzUmV2ZWFsZWQpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAgICAgJGNsb3Nlci5oaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oe1xuICAgICAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAgICAgJGNsb3Nlci5zaG93KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU3RvcHMgc2Nyb2xsaW5nIG9mIHRoZSBib2R5IHdoZW4gb2ZmY2FudmFzIGlzIG9wZW4gb24gbW9iaWxlIFNhZmFyaSBhbmQgb3RoZXIgdHJvdWJsZXNvbWUgYnJvd3NlcnMuXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfc3RvcFNjcm9sbGluZycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3N0b3BTY3JvbGxpbmcoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBUYWtlbiBhbmQgYWRhcHRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTY4ODk0NDcvcHJldmVudC1mdWxsLXBhZ2Utc2Nyb2xsaW5nLWlvc1xuICAgICAgLy8gT25seSByZWFsbHkgd29ya3MgZm9yIHksIG5vdCBzdXJlIGhvdyB0byBleHRlbmQgdG8geCBvciBpZiB3ZSBuZWVkIHRvLlxuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3JlY29yZFNjcm9sbGFibGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZWNvcmRTY3JvbGxhYmxlKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG5cbiAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZSAoY29udGVudCBvdmVyZmxvd3MpLCB0aGVuLi4uXG4gICAgICAgIGlmIChlbGVtLnNjcm9sbEhlaWdodCAhPT0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgdG9wLCBzY3JvbGwgZG93biBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIHVwXG4gICAgICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSAwKSB7XG4gICAgICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBib3R0b20sIHNjcm9sbCB1cCBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIGRvd25cbiAgICAgICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsZW0uYWxsb3dVcCA9IGVsZW0uc2Nyb2xsVG9wID4gMDtcbiAgICAgICAgZWxlbS5hbGxvd0Rvd24gPSBlbGVtLnNjcm9sbFRvcCA8IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGVsZW0ubGFzdFkgPSBldmVudC5vcmlnaW5hbEV2ZW50LnBhZ2VZO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zdG9wU2Nyb2xsUHJvcGFnYXRpb24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cbiAgICAgICAgdmFyIHVwID0gZXZlbnQucGFnZVkgPCBlbGVtLmxhc3RZO1xuICAgICAgICB2YXIgZG93biA9ICF1cDtcbiAgICAgICAgZWxlbS5sYXN0WSA9IGV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGlmICh1cCAmJiBlbGVtLmFsbG93VXAgfHwgZG93biAmJiBlbGVtLmFsbG93RG93bikge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPcGVucyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICAgICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ29wZW4nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oZXZlbnQsIHRyaWdnZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICAgICAqL1xuICAgICAgICBfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJykudHJpZ2dlcignb3BlbmVkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIGFkZCBjbGFzcyBhbmQgZGlzYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC50cmFwRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYiB0byBmaXJlIGFmdGVyIGNsb3N1cmUuXG4gICAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjbG9zZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoY2IpIHtcbiAgICAgICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgICAqL1xuICAgICAgICAudHJpZ2dlcignY2xvc2VkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIHJlbW92ZSBjbGFzcyBhbmQgcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVsZWFzZUZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVG9nZ2xlcyB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW4gb3IgY2xvc2VkLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAgICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAndG9nZ2xlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGUoZXZlbnQsIHRyaWdnZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoZXZlbnQsIHRyaWdnZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub3BlbihldmVudCwgdHJpZ2dlcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVzIGtleWJvYXJkIGlucHV0IHdoZW4gZGV0ZWN0ZWQuIFdoZW4gdGhlIGVzY2FwZSBrZXkgaXMgcHJlc3NlZCwgdGhlIG9mZi1jYW52YXMgbWVudSBjbG9zZXMsIGFuZCBmb2N1cyBpcyByZXN0b3JlZCB0byB0aGUgZWxlbWVudCB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2hhbmRsZUtleWJvYXJkJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlS2V5Ym9hcmQoZSkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczIuY2xvc2UoKTtcbiAgICAgICAgICAgIF90aGlzMi4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIHRoZSBvZmZjYW52YXMgcGx1Z2luLlxuICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKTtcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5vZmZjYW52YXMnKTtcblxuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE9mZkNhbnZhcztcbiAgfSgpO1xuXG4gIE9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgICAvKipcbiAgICAgKiBBbGxvdyB0aGUgdXNlciB0byBjbGljayBvdXRzaWRlIG9mIHRoZSBtZW51IHRvIGNsb3NlIGl0LlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBvdmVybGF5IG9uIHRvcCBvZiBgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XWAuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjb250ZW50T3ZlcmxheTogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZS9kaXNhYmxlIHNjcm9sbGluZyBvZiB0aGUgbWFpbiBjb250ZW50IHdoZW4gYW4gb2ZmIGNhbnZhcyBwYW5lbCBpcyBvcGVuLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgY29udGVudFNjcm9sbDogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEFtb3VudCBvZiB0aW1lIGluIG1zIHRoZSBvcGVuIGFuZCBjbG9zZSB0cmFuc2l0aW9uIHJlcXVpcmVzLiBJZiBub25lIHNlbGVjdGVkLCBwdWxscyBmcm9tIGJvZHkgc3R5bGUuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuICAgIHRyYW5zaXRpb25UaW1lOiAwLFxuXG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0cmFuc2l0aW9uIGZvciB0aGUgb2ZmY2FudmFzIG1lbnUuIE9wdGlvbnMgYXJlICdwdXNoJywgJ2RldGFjaGVkJyBvciAnc2xpZGUnLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHB1c2hcbiAgICAgKi9cbiAgICB0cmFuc2l0aW9uOiAncHVzaCcsXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZSB0aGUgcGFnZSB0byBzY3JvbGwgdG8gdG9wIG9yIGJvdHRvbSBvbiBvcGVuLlxuICAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgZm9yY2VUbzogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgaXNSZXZlYWxlZDogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBCcmVha3BvaW50IGF0IHdoaWNoIHRvIHJldmVhbC4gSlMgd2lsbCB1c2UgYSBSZWdFeHAgdG8gdGFyZ2V0IHN0YW5kYXJkIGNsYXNzZXMsIGlmIGNoYW5naW5nIGNsYXNzbmFtZXMsIHBhc3MgeW91ciBjbGFzcyB3aXRoIHRoZSBgcmV2ZWFsQ2xhc3NgIG9wdGlvbi5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUgez9zdHJpbmd9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIHJldmVhbE9uOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogRm9yY2UgZm9jdXMgdG8gdGhlIG9mZmNhbnZhcyBvbiBvcGVuLiBJZiB0cnVlLCB3aWxsIGZvY3VzIHRoZSBvcGVuaW5nIHRyaWdnZXIgb24gY2xvc2UuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBhdXRvRm9jdXM6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cbiAgICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCByZXZlYWwtZm9yLVxuICAgICAqIEB0b2RvIGltcHJvdmUgdGhlIHJlZ2V4IHRlc3RpbmcgZm9yIHRoaXMuXG4gICAgICovXG4gICAgcmV2ZWFsQ2xhc3M6ICdyZXZlYWwtZm9yLScsXG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXG4gICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgdHJhcEZvY3VzOiBmYWxzZVxuICB9O1xuXG4gIC8vIFdpbmRvdyBleHBvcnRzXG4gIEZvdW5kYXRpb24ucGx1Z2luKE9mZkNhbnZhcywgJ09mZkNhbnZhcycpO1xufShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgLyoqXG4gICAqIE9yYml0IG1vZHVsZS5cbiAgICogQG1vZHVsZSBmb3VuZGF0aW9uLm9yYml0XG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyXG4gICAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudG91Y2hcbiAgICovXG5cbiAgdmFyIE9yYml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvcmJpdCBjYXJvdXNlbC5cbiAgICAqIEBjbGFzc1xuICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBPcmJpdCBDYXJvdXNlbC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAqL1xuICAgIGZ1bmN0aW9uIE9yYml0KGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBPcmJpdCk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9yYml0LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT3JiaXQnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09yYml0Jywge1xuICAgICAgICAnbHRyJzoge1xuICAgICAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgICAgfSxcbiAgICAgICAgJ3J0bCc6IHtcbiAgICAgICAgICAnQVJST1dfTEVGVCc6ICduZXh0JyxcbiAgICAgICAgICAnQVJST1dfUklHSFQnOiAncHJldmlvdXMnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBjcmVhdGluZyBqUXVlcnkgY29sbGVjdGlvbnMsIHNldHRpbmcgYXR0cmlidXRlcywgYW5kIHN0YXJ0aW5nIHRoZSBhbmltYXRpb24uXG4gICAgKiBAZnVuY3Rpb25cbiAgICAqIEBwcml2YXRlXG4gICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKE9yYml0LCBbe1xuICAgICAga2V5OiAnX2luaXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICAvLyBAVE9ETzogY29uc2lkZXIgZGlzY3Vzc2lvbiBvbiBQUiAjOTI3OCBhYm91dCBET00gcG9sbHV0aW9uIGJ5IGNoYW5nZVNsaWRlXG4gICAgICAgIHRoaXMuX3Jlc2V0KCk7XG5cbiAgICAgICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuICAgICAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpO1xuXG4gICAgICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSxcbiAgICAgICAgICAgIGluaXRBY3RpdmUgPSB0aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJyksXG4gICAgICAgICAgICBpZCA9IHRoaXMuJGVsZW1lbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnb3JiaXQnKTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgICAgICdkYXRhLXJlc2l6ZSc6IGlkLFxuICAgICAgICAgICdpZCc6IGlkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghaW5pdEFjdGl2ZS5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLiRzbGlkZXMuZXEoMCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudXNlTVVJKSB7XG4gICAgICAgICAgdGhpcy4kc2xpZGVzLmFkZENsYXNzKCduby1tb3Rpb251aScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCgkaW1hZ2VzLCB0aGlzLl9wcmVwYXJlRm9yT3JiaXQuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcHJlcGFyZUZvck9yYml0KCk7IC8vaGVoZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgdGhpcy5fbG9hZEJ1bGxldHMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgdGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aGlzLmdlb1N5bmMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjZXNzaWJsZSkge1xuICAgICAgICAgIC8vIGFsbG93IHdyYXBwZXIgdG8gYmUgZm9jdXNhYmxlIHRvIGVuYWJsZSBhcnJvdyBuYXZpZ2F0aW9uXG4gICAgICAgICAgdGhpcy4kd3JhcHBlci5hdHRyKCd0YWJpbmRleCcsIDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBDcmVhdGVzIGEgalF1ZXJ5IGNvbGxlY3Rpb24gb2YgYnVsbGV0cywgaWYgdGhleSBhcmUgYmVpbmcgdXNlZC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2xvYWRCdWxsZXRzJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbG9hZEJ1bGxldHMoKSB7XG4gICAgICAgIHRoaXMuJGJ1bGxldHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLmJveE9mQnVsbGV0cykuZmluZCgnYnV0dG9uJyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBTZXRzIGEgYHRpbWVyYCBvYmplY3Qgb24gdGhlIG9yYml0LCBhbmQgc3RhcnRzIHRoZSBjb3VudGVyIGZvciB0aGUgbmV4dCBzbGlkZS5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZ2VvU3luYycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2VvU3luYygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50aW1lciA9IG5ldyBGb3VuZGF0aW9uLlRpbWVyKHRoaXMuJGVsZW1lbnQsIHtcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLnRpbWVyRGVsYXksXG4gICAgICAgICAgaW5maW5pdGU6IGZhbHNlXG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGltZXIuc3RhcnQoKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIFNldHMgd3JhcHBlciBhbmQgc2xpZGUgaGVpZ2h0cyBmb3IgdGhlIG9yYml0LlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfcHJlcGFyZUZvck9yYml0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcHJlcGFyZUZvck9yYml0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl9zZXRXcmFwcGVySGVpZ2h0KCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBDYWx1bGF0ZXMgdGhlIGhlaWdodCBvZiBlYWNoIHNsaWRlIGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdXNlcyB0aGUgdGFsbGVzdCBvbmUgZm9yIHRoZSB3cmFwcGVyIGhlaWdodC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gYSBjYWxsYmFjayBmdW5jdGlvbiB0byBmaXJlIHdoZW4gY29tcGxldGUuXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX3NldFdyYXBwZXJIZWlnaHQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRXcmFwcGVySGVpZ2h0KGNiKSB7XG4gICAgICAgIC8vcmV3cml0ZSB0aGlzIHRvIGBmb3JgIGxvb3BcbiAgICAgICAgdmFyIG1heCA9IDAsXG4gICAgICAgICAgICB0ZW1wLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtc2xpZGUnLCBjb3VudGVyKTtcblxuICAgICAgICAgIGlmIChfdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpWzBdICE9PSBfdGhpcy4kc2xpZGVzLmVxKGNvdW50ZXIpWzBdKSB7XG4gICAgICAgICAgICAvL2lmIG5vdCB0aGUgYWN0aXZlIHNsaWRlLCBzZXQgY3NzIHBvc2l0aW9uIGFuZCBkaXNwbGF5IHByb3BlcnR5XG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7ICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsICdkaXNwbGF5JzogJ25vbmUnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXggPSB0ZW1wID4gbWF4ID8gdGVtcCA6IG1heDtcbiAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjb3VudGVyID09PSB0aGlzLiRzbGlkZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kd3JhcHBlci5jc3MoeyAnaGVpZ2h0JzogbWF4IH0pOyAvL29ubHkgY2hhbmdlIHRoZSB3cmFwcGVyIGhlaWdodCBwcm9wZXJ0eSBvbmNlLlxuICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgY2IobWF4KTtcbiAgICAgICAgICB9IC8vZmlyZSBjYWxsYmFjayB3aXRoIG1heCBoZWlnaHQgZGltZW5zaW9uLlxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBTZXRzIHRoZSBtYXgtaGVpZ2h0IG9mIGVhY2ggc2xpZGUuXG4gICAgICAqIEBmdW5jdGlvblxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19zZXRTbGlkZUhlaWdodCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFNsaWRlSGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLiRzbGlkZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJCh0aGlzKS5jc3MoJ21heC1oZWlnaHQnLCBoZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGJhc2ljYWxseSBldmVyeXRoaW5nIHdpdGhpbiB0aGUgZWxlbWVudC5cbiAgICAgICogQGZ1bmN0aW9uXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyoqTm93IHVzaW5nIGN1c3RvbSBldmVudCAtIHRoYW5rcyB0bzoqKlxuICAgICAgICAvLyoqICAgICAgWW9oYWkgQXJhcmF0IG9mIFRvcm9udG8gICAgICAqKlxuICAgICAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvL1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnJlc2l6ZW1lLnpmLnRyaWdnZXInKS5vbih7XG4gICAgICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiB0aGlzLl9wcmVwYXJlRm9yT3JiaXQuYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN3aXBlKSB7XG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMub2ZmKCdzd2lwZWxlZnQuemYub3JiaXQgc3dpcGVyaWdodC56Zi5vcmJpdCcpLm9uKCdzd2lwZWxlZnQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgICAgICAgfSkub24oJ3N3aXBlcmlnaHQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICAgICAgdGhpcy4kc2xpZGVzLm9uKCdjbGljay56Zi5vcmJpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJywgX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykgPyBmYWxzZSA6IHRydWUpO1xuICAgICAgICAgICAgICBfdGhpcy50aW1lcltfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSA/ICdwYXVzZScgOiAnc3RhcnQnXSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGF1c2VPbkhvdmVyKSB7XG4gICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZW50ZXIuemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGltZXIucGF1c2UoKTtcbiAgICAgICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMudGltZXIuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubmF2QnV0dG9ucykge1xuICAgICAgICAgICAgdmFyICRjb250cm9scyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMubmV4dENsYXNzICsgJywgLicgKyB0aGlzLm9wdGlvbnMucHJldkNsYXNzKTtcbiAgICAgICAgICAgICRjb250cm9scy5hdHRyKCd0YWJpbmRleCcsIDApXG4gICAgICAgICAgICAvL2Fsc28gbmVlZCB0byBoYW5kbGUgZW50ZXIvcmV0dXJuIGFuZCBzcGFjZWJhciBrZXkgcHJlc3Nlc1xuICAgICAgICAgICAgLm9uKCdjbGljay56Zi5vcmJpdCB0b3VjaGVuZC56Zi5vcmJpdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoJCh0aGlzKS5oYXNDbGFzcyhfdGhpcy5vcHRpb25zLm5leHRDbGFzcykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgICB0aGlzLiRidWxsZXRzLm9uKCdjbGljay56Zi5vcmJpdCB0b3VjaGVuZC56Zi5vcmJpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKC9pcy1hY3RpdmUvZy50ZXN0KHRoaXMuY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfSAvL2lmIHRoaXMgaXMgYWN0aXZlLCBraWNrIG91dCBvZiBmdW5jdGlvbi5cbiAgICAgICAgICAgICAgdmFyIGlkeCA9ICQodGhpcykuZGF0YSgnc2xpZGUnKSxcbiAgICAgICAgICAgICAgICAgIGx0ciA9IGlkeCA+IF90aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZGF0YSgnc2xpZGUnKSxcbiAgICAgICAgICAgICAgICAgICRzbGlkZSA9IF90aGlzLiRzbGlkZXMuZXEoaWR4KTtcblxuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShsdHIsICRzbGlkZSwgaWR4KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjZXNzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy4kd3JhcHBlci5hZGQodGhpcy4kYnVsbGV0cykub24oJ2tleWRvd24uemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPcmJpdCcsIHtcbiAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAvLyBpZiBidWxsZXQgaXMgZm9jdXNlZCwgbWFrZSBzdXJlIGZvY3VzIG1vdmVzXG4gICAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaXMoX3RoaXMuJGJ1bGxldHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLiRidWxsZXRzLmZpbHRlcignLmlzLWFjdGl2ZScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJlc2V0cyBPcmJpdCBzbyBpdCBjYW4gYmUgcmVpbml0aWFsaXplZFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfcmVzZXQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZXNldCgpIHtcbiAgICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgdGhlcmUgYXJlIG5vIHNsaWRlcyAoZmlyc3QgcnVuKVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuJHNsaWRlcyA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLiRzbGlkZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIC8vIFJlbW92ZSBvbGQgZXZlbnRzXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi5vcmJpdCcpLmZpbmQoJyonKS5vZmYoJy56Zi5vcmJpdCcpO1xuXG4gICAgICAgICAgLy8gUmVzdGFydCB0aW1lciBpZiBhdXRvUGxheSBpcyBlbmFibGVkXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICAgICAgdGhpcy50aW1lci5yZXN0YXJ0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVzZXQgYWxsIHNsaWRkZXNcbiAgICAgICAgICB0aGlzLiRzbGlkZXMuZWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICQoZWwpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtYWN0aXZlIGlzLWluJykucmVtb3ZlQXR0cignYXJpYS1saXZlJykuaGlkZSgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2hvdyB0aGUgZmlyc3Qgc2xpZGVcbiAgICAgICAgICB0aGlzLiRzbGlkZXMuZmlyc3QoKS5hZGRDbGFzcygnaXMtYWN0aXZlJykuc2hvdygpO1xuXG4gICAgICAgICAgLy8gVHJpZ2dlcnMgd2hlbiB0aGUgc2xpZGUgaGFzIGZpbmlzaGVkIGFuaW1hdGluZ1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2xpZGVjaGFuZ2UuemYub3JiaXQnLCBbdGhpcy4kc2xpZGVzLmZpcnN0KCldKTtcblxuICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCBidWxsZXQgaWYgYnVsbGV0cyBhcmUgcHJlc2VudFxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVsbGV0cykge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQnVsbGV0cygwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgc2xpZGUgdG8gYSBuZXcgb25lLlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHBhcmFtIHtCb29sZWFufSBpc0xUUiAtIGZsYWcgaWYgdGhlIHNsaWRlIHNob3VsZCBtb3ZlIGxlZnQgdG8gcmlnaHQuXG4gICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBjaG9zZW5TbGlkZSAtIHRoZSBqUXVlcnkgZWxlbWVudCBvZiB0aGUgc2xpZGUgdG8gc2hvdyBuZXh0LCBpZiBvbmUgaXMgc2VsZWN0ZWQuXG4gICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSB0aGUgaW5kZXggb2YgdGhlIG5ldyBzbGlkZSBpbiBpdHMgY29sbGVjdGlvbiwgaWYgb25lIGNob3Nlbi5cbiAgICAgICogQGZpcmVzIE9yYml0I3NsaWRlY2hhbmdlXG4gICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnY2hhbmdlU2xpZGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZVNsaWRlKGlzTFRSLCBjaG9zZW5TbGlkZSwgaWR4KSB7XG4gICAgICAgIGlmICghdGhpcy4kc2xpZGVzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IC8vIERvbid0IGZyZWFrIG91dCBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGNsZWFudXBcbiAgICAgICAgdmFyICRjdXJTbGlkZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5lcSgwKTtcblxuICAgICAgICBpZiAoL211aS9nLnRlc3QoJGN1clNsaWRlWzBdLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gLy9pZiB0aGUgc2xpZGUgaXMgY3VycmVudGx5IGFuaW1hdGluZywga2ljayBvdXQgb2YgdGhlIGZ1bmN0aW9uXG5cbiAgICAgICAgdmFyICRmaXJzdFNsaWRlID0gdGhpcy4kc2xpZGVzLmZpcnN0KCksXG4gICAgICAgICAgICAkbGFzdFNsaWRlID0gdGhpcy4kc2xpZGVzLmxhc3QoKSxcbiAgICAgICAgICAgIGRpckluID0gaXNMVFIgPyAnUmlnaHQnIDogJ0xlZnQnLFxuICAgICAgICAgICAgZGlyT3V0ID0gaXNMVFIgPyAnTGVmdCcgOiAnUmlnaHQnLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgJG5ld1NsaWRlO1xuXG4gICAgICAgIGlmICghY2hvc2VuU2xpZGUpIHtcbiAgICAgICAgICAvL21vc3Qgb2YgdGhlIHRpbWUsIHRoaXMgd2lsbCBiZSBhdXRvIHBsYXllZCBvciBjbGlja2VkIGZyb20gdGhlIG5hdkJ1dHRvbnMuXG4gICAgICAgICAgJG5ld1NsaWRlID0gaXNMVFIgPyAvL2lmIHdyYXBwaW5nIGVuYWJsZWQsIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGBuZXh0YCBvciBgcHJldmAgc2libGluZywgaWYgbm90LCBzZWxlY3QgdGhlIGZpcnN0IG9yIGxhc3Qgc2xpZGUgdG8gZmlsbCBpbi4gaWYgd3JhcHBpbmcgbm90IGVuYWJsZWQsIGF0dGVtcHQgdG8gc2VsZWN0IGBuZXh0YCBvciBgcHJldmAsIGlmIHRoZXJlJ3Mgbm90aGluZyB0aGVyZSwgdGhlIGZ1bmN0aW9uIHdpbGwga2ljayBvdXQgb24gbmV4dCBzdGVwLiBDUkFaWSBORVNURUQgVEVSTkFSSUVTISEhISFcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuaW5maW5pdGVXcmFwID8gJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpLmxlbmd0aCA/ICRjdXJTbGlkZS5uZXh0KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKSA6ICRmaXJzdFNsaWRlIDogJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpIDogLy9waWNrIG5leHQgc2xpZGUgaWYgbW92aW5nIGxlZnQgdG8gcmlnaHRcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuaW5maW5pdGVXcmFwID8gJGN1clNsaWRlLnByZXYoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpLmxlbmd0aCA/ICRjdXJTbGlkZS5wcmV2KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKSA6ICRsYXN0U2xpZGUgOiAkY3VyU2xpZGUucHJldignLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcyk7IC8vcGljayBwcmV2IHNsaWRlIGlmIG1vdmluZyByaWdodCB0byBsZWZ0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJG5ld1NsaWRlID0gY2hvc2VuU2xpZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJG5ld1NsaWRlLmxlbmd0aCkge1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICogVHJpZ2dlcnMgYmVmb3JlIHRoZSBuZXh0IHNsaWRlIHN0YXJ0cyBhbmltYXRpbmcgaW4gYW5kIG9ubHkgaWYgYSBuZXh0IHNsaWRlIGhhcyBiZWVuIGZvdW5kLlxuICAgICAgICAgICogQGV2ZW50IE9yYml0I2JlZm9yZXNsaWRlY2hhbmdlXG4gICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2JlZm9yZXNsaWRlY2hhbmdlLnpmLm9yYml0JywgWyRjdXJTbGlkZSwgJG5ld1NsaWRlXSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgICAgICAgIGlkeCA9IGlkeCB8fCB0aGlzLiRzbGlkZXMuaW5kZXgoJG5ld1NsaWRlKTsgLy9ncmFiIGluZGV4IHRvIHVwZGF0ZSBidWxsZXRzXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVCdWxsZXRzKGlkeCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy51c2VNVUkgJiYgIXRoaXMuJGVsZW1lbnQuaXMoJzpoaWRkZW4nKSkge1xuICAgICAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKCRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlJykuY3NzKHsgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJywgJ3RvcCc6IDAgfSksIHRoaXMub3B0aW9uc1snYW5pbUluRnJvbScgKyBkaXJJbl0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJG5ld1NsaWRlLmNzcyh7ICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsICdkaXNwbGF5JzogJ2Jsb2NrJyB9KS5hdHRyKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkY3VyU2xpZGUucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpLCB0aGlzLm9wdGlvbnNbJ2FuaW1PdXRUbycgKyBkaXJPdXRdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICRjdXJTbGlkZS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKTtcbiAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgIV90aGlzLnRpbWVyLmlzUGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vZG8gc3R1ZmY/XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGN1clNsaWRlLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtaW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKS5oaWRlKCk7XG4gICAgICAgICAgICAkbmV3U2xpZGUuYWRkQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1pbicpLmF0dHIoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKS5zaG93KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QbGF5ICYmICF0aGlzLnRpbWVyLmlzUGF1c2VkKSB7XG4gICAgICAgICAgICAgIHRoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAqIFRyaWdnZXJzIHdoZW4gdGhlIHNsaWRlIGhhcyBmaW5pc2hlZCBhbmltYXRpbmcgaW4uXG4gICAgICAgICAgKiBAZXZlbnQgT3JiaXQjc2xpZGVjaGFuZ2VcbiAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2xpZGVjaGFuZ2UuemYub3JiaXQnLCBbJG5ld1NsaWRlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIFVwZGF0ZXMgdGhlIGFjdGl2ZSBzdGF0ZSBvZiB0aGUgYnVsbGV0cywgaWYgZGlzcGxheWVkLlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICogQHByaXZhdGVcbiAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBzbGlkZS5cbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdfdXBkYXRlQnVsbGV0cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZUJ1bGxldHMoaWR4KSB7XG4gICAgICAgIHZhciAkb2xkQnVsbGV0ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5ib3hPZkJ1bGxldHMpLmZpbmQoJy5pcy1hY3RpdmUnKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJykuYmx1cigpLFxuICAgICAgICAgICAgc3BhbiA9ICRvbGRCdWxsZXQuZmluZCgnc3BhbjpsYXN0JykuZGV0YWNoKCksXG4gICAgICAgICAgICAkbmV3QnVsbGV0ID0gdGhpcy4kYnVsbGV0cy5lcShpZHgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hcHBlbmQoc3Bhbik7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBEZXN0cm95cyB0aGUgY2Fyb3VzZWwgYW5kIGhpZGVzIHRoZSBlbGVtZW50LlxuICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLm9yYml0JykuZmluZCgnKicpLm9mZignLnpmLm9yYml0JykuZW5kKCkuaGlkZSgpO1xuICAgICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE9yYml0O1xuICB9KCk7XG5cbiAgT3JiaXQuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgKiBUZWxscyB0aGUgSlMgdG8gbG9vayBmb3IgYW5kIGxvYWRCdWxsZXRzLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgYnVsbGV0czogdHJ1ZSxcbiAgICAvKipcbiAgICAqIFRlbGxzIHRoZSBKUyB0byBhcHBseSBldmVudCBsaXN0ZW5lcnMgdG8gbmF2IGJ1dHRvbnNcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIG5hdkJ1dHRvbnM6IHRydWUsXG4gICAgLyoqXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdzbGlkZS1pbi1yaWdodCdcbiAgICAqL1xuICAgIGFuaW1JbkZyb21SaWdodDogJ3NsaWRlLWluLXJpZ2h0JyxcbiAgICAvKipcbiAgICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ3NsaWRlLW91dC1yaWdodCdcbiAgICAqL1xuICAgIGFuaW1PdXRUb1JpZ2h0OiAnc2xpZGUtb3V0LXJpZ2h0JyxcbiAgICAvKipcbiAgICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ3NsaWRlLWluLWxlZnQnXG4gICAgKlxuICAgICovXG4gICAgYW5pbUluRnJvbUxlZnQ6ICdzbGlkZS1pbi1sZWZ0JyxcbiAgICAvKipcbiAgICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICogQGRlZmF1bHQgJ3NsaWRlLW91dC1sZWZ0J1xuICAgICovXG4gICAgYW5pbU91dFRvTGVmdDogJ3NsaWRlLW91dC1sZWZ0JyxcbiAgICAvKipcbiAgICAqIEFsbG93cyBPcmJpdCB0byBhdXRvbWF0aWNhbGx5IGFuaW1hdGUgb24gcGFnZSBsb2FkLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgYXV0b1BsYXk6IHRydWUsXG4gICAgLyoqXG4gICAgKiBBbW91bnQgb2YgdGltZSwgaW4gbXMsIGJldHdlZW4gc2xpZGUgdHJhbnNpdGlvbnNcbiAgICAqIEBvcHRpb25cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICogQGRlZmF1bHQgNTAwMFxuICAgICovXG4gICAgdGltZXJEZWxheTogNTAwMCxcbiAgICAvKipcbiAgICAqIEFsbG93cyBPcmJpdCB0byBpbmZpbml0ZWx5IGxvb3AgdGhyb3VnaCB0aGUgc2xpZGVzXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBpbmZpbml0ZVdyYXA6IHRydWUsXG4gICAgLyoqXG4gICAgKiBBbGxvd3MgdGhlIE9yYml0IHNsaWRlcyB0byBiaW5kIHRvIHN3aXBlIGV2ZW50cyBmb3IgbW9iaWxlLCByZXF1aXJlcyBhbiBhZGRpdGlvbmFsIHV0aWwgbGlicmFyeVxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gICAgc3dpcGU6IHRydWUsXG4gICAgLyoqXG4gICAgKiBBbGxvd3MgdGhlIHRpbWluZyBmdW5jdGlvbiB0byBwYXVzZSBhbmltYXRpb24gb24gaG92ZXIuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBwYXVzZU9uSG92ZXI6IHRydWUsXG4gICAgLyoqXG4gICAgKiBBbGxvd3MgT3JiaXQgdG8gYmluZCBrZXlib2FyZCBldmVudHMgdG8gdGhlIHNsaWRlciwgdG8gYW5pbWF0ZSBmcmFtZXMgd2l0aCBhcnJvdyBrZXlzXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBhY2Nlc3NpYmxlOiB0cnVlLFxuICAgIC8qKlxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGFpbmVyIG9mIE9yYml0XG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdvcmJpdC1jb250YWluZXInXG4gICAgKi9cbiAgICBjb250YWluZXJDbGFzczogJ29yYml0LWNvbnRhaW5lcicsXG4gICAgLyoqXG4gICAgKiBDbGFzcyBhcHBsaWVkIHRvIGluZGl2aWR1YWwgc2xpZGVzLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnb3JiaXQtc2xpZGUnXG4gICAgKi9cbiAgICBzbGlkZUNsYXNzOiAnb3JiaXQtc2xpZGUnLFxuICAgIC8qKlxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYnVsbGV0IGNvbnRhaW5lci4gWW91J3JlIHdlbGNvbWUuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdvcmJpdC1idWxsZXRzJ1xuICAgICovXG4gICAgYm94T2ZCdWxsZXRzOiAnb3JiaXQtYnVsbGV0cycsXG4gICAgLyoqXG4gICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBgbmV4dGAgbmF2aWdhdGlvbiBidXR0b24uXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAqIEBkZWZhdWx0ICdvcmJpdC1uZXh0J1xuICAgICovXG4gICAgbmV4dENsYXNzOiAnb3JiaXQtbmV4dCcsXG4gICAgLyoqXG4gICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBgcHJldmlvdXNgIG5hdmlnYXRpb24gYnV0dG9uLlxuICAgICogQG9wdGlvblxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKiBAZGVmYXVsdCAnb3JiaXQtcHJldmlvdXMnXG4gICAgKi9cbiAgICBwcmV2Q2xhc3M6ICdvcmJpdC1wcmV2aW91cycsXG4gICAgLyoqXG4gICAgKiBCb29sZWFuIHRvIGZsYWcgdGhlIGpzIHRvIHVzZSBtb3Rpb24gdWkgY2xhc3NlcyBvciBub3QuIERlZmF1bHQgdG8gdHJ1ZSBmb3IgYmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXG4gICAgKiBAb3B0aW9uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICB1c2VNVUk6IHRydWVcbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihPcmJpdCwgJ09yYml0Jyk7XG59KGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICAvKipcbiAgICogUmVzcG9uc2l2ZU1lbnUgbW9kdWxlLlxuICAgKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAgICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICAgKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAgICovXG5cbiAgdmFyIFJlc3BvbnNpdmVNZW51ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAgICogQGNsYXNzXG4gICAgICogQGZpcmVzIFJlc3BvbnNpdmVNZW51I2luaXRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgZnVuY3Rpb24gUmVzcG9uc2l2ZU1lbnUoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3BvbnNpdmVNZW51KTtcblxuICAgICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICB0aGlzLnJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdyZXNwb25zaXZlLW1lbnUnKTtcbiAgICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG51bGw7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXNwb25zaXZlTWVudScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBNZW51IGJ5IHBhcnNpbmcgdGhlIGNsYXNzZXMgZnJvbSB0aGUgJ2RhdGEtUmVzcG9uc2l2ZU1lbnUnIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoUmVzcG9uc2l2ZU1lbnUsIFt7XG4gICAgICBrZXk6ICdfaW5pdCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgIC8vIFRoZSBmaXJzdCB0aW1lIGFuIEludGVyY2hhbmdlIHBsdWdpbiBpcyBpbml0aWFsaXplZCwgdGhpcy5ydWxlcyBpcyBjb252ZXJ0ZWQgZnJvbSBhIHN0cmluZyBvZiBcImNsYXNzZXNcIiB0byBhbiBvYmplY3Qgb2YgcnVsZXNcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJ1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHZhciBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgICAgIC8vIFBhcnNlIHJ1bGVzIGZyb20gXCJjbGFzc2VzXCIgcHVsbGVkIGZyb20gZGF0YSBhdHRyaWJ1dGVcbiAgICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLnJ1bGVzLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBydWxlID0gcnVsZXNbaV0uc3BsaXQoJy0nKTtcbiAgICAgICAgICAgIHZhciBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICAgICAgdmFyIHJ1bGVQbHVnaW4gPSBydWxlLmxlbmd0aCA+IDEgPyBydWxlWzFdIDogcnVsZVswXTtcblxuICAgICAgICAgICAgaWYgKE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEkLmlzRW1wdHlPYmplY3QodGhpcy5ydWxlcykpIHtcbiAgICAgICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCBkYXRhLW11dGF0ZSBzaW5jZSBjaGlsZHJlbiBtYXkgbmVlZCBpdC5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdyZXNwb25zaXZlLW1lbnUnKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciB0aGUgTWVudS5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnX2V2ZW50cycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vICQod2luZG93KS5vbigncmVzaXplLnpmLlJlc3BvbnNpdmVNZW51JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENoZWNrcyB0aGUgY3VycmVudCBzY3JlZW4gd2lkdGggYWdhaW5zdCBhdmFpbGFibGUgbWVkaWEgcXVlcmllcy4gSWYgdGhlIG1lZGlhIHF1ZXJ5IGhhcyBjaGFuZ2VkLCBhbmQgdGhlIHBsdWdpbiBuZWVkZWQgaGFzIGNoYW5nZWQsIHRoZSBwbHVnaW5zIHdpbGwgc3dhcCBvdXQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ19jaGVja01lZGlhUXVlcmllcycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NoZWNrTWVkaWFRdWVyaWVzKCkge1xuICAgICAgICB2YXIgbWF0Y2hlZE1xLFxuICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlIGFuZCBmaW5kIHRoZSBsYXN0IG1hdGNoaW5nIHJ1bGVcbiAgICAgICAgJC5lYWNoKHRoaXMucnVsZXMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3Qoa2V5KSkge1xuICAgICAgICAgICAgbWF0Y2hlZE1xID0ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm8gbWF0Y2g/IE5vIGRpY2VcbiAgICAgICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgICAgICAvLyBQbHVnaW4gYWxyZWFkeSBpbml0aWFsaXplZD8gV2UgZ29vZFxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luIGluc3RhbmNlb2YgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbikgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAgICAgJC5lYWNoKE1lbnVQbHVnaW5zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBDU1MgY2xhc3MgZm9yIHRoZSBuZXcgcGx1Z2luXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIG5ldyBwbHVnaW5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbikgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICAgICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVNZW51Jyk7XG4gICAgICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVzcG9uc2l2ZU1lbnU7XG4gIH0oKTtcblxuICBSZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4gIC8vIFRoZSBwbHVnaW4gbWF0Y2hlcyB0aGUgcGx1Z2luIGNsYXNzZXMgd2l0aCB0aGVzZSBwbHVnaW4gaW5zdGFuY2VzLlxuICB2YXIgTWVudVBsdWdpbnMgPSB7XG4gICAgZHJvcGRvd246IHtcbiAgICAgIGNzc0NsYXNzOiAnZHJvcGRvd24nLFxuICAgICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydkcm9wZG93bi1tZW51J10gfHwgbnVsbFxuICAgIH0sXG4gICAgZHJpbGxkb3duOiB7XG4gICAgICBjc3NDbGFzczogJ2RyaWxsZG93bicsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2RyaWxsZG93biddIHx8IG51bGxcbiAgICB9LFxuICAgIGFjY29yZGlvbjoge1xuICAgICAgY3NzQ2xhc3M6ICdhY2NvcmRpb24tbWVudScsXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICAgIH1cbiAgfTtcblxuICAvLyBXaW5kb3cgZXhwb3J0c1xuICBGb3VuZGF0aW9uLnBsdWdpbihSZXNwb25zaXZlTWVudSwgJ1Jlc3BvbnNpdmVNZW51Jyk7XG59KGpRdWVyeSk7IiwiKGZ1bmN0aW9uKCQpIHtcbiAgJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG4gICQoXCIjanMtZm9ybVwiKS5zdWJtaXQoZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJGZvcm0gPSAkKHRoaXMpO1xuICAgICRmb3JtLm9uKFwiZm9ybXZhbGlkLnpmLmFiaWRlXCIsIGZ1bmN0aW9uKGV2LCBmcm0pIHtcbiAgICAgICQucG9zdCgkZm9ybS5hdHRyKFwiYWN0aW9uXCIpLCAkZm9ybS5zZXJpYWxpemUoKSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gSGlkZSB0aGUgZm9ybSBhbmQgc2hvdyB0aGUgY29uZmlybWF0aW9uIG1lc2FnZS5cbiAgICAgICAgJGZvcm0uaGlkZSgpO1xuICAgICAgICAkKFwiI2pzLWNvbmZpcm1hdGlvblwiKVxuICAgICAgICAgIC5zaG93KClcbiAgICAgICAgICAuY3NzKFwiaGVpZ2h0XCIsICRmb3JtLmhlaWdodCgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICB2YXIgdmFsaWRhdGUgPSBmdW5jdGlvbigkZm9ybSkge307XG5cbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgJChcIiNyb29tc1wiKS5zbGljayh7XG4gICAgICBkb3RzOiBmYWxzZSxcbiAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgIHNsaWRlc1RvU2hvdzogNCxcbiAgICAgIHNsaWRlc1RvU2Nyb2xsOiA0LFxuICAgICAgbmV4dEFycm93OlxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLW5leHQtYXJyb3dcIiBhcmlhLWxhYmVsPVwiTmV4dCByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLXJpZ2h0XCI+PC91c2U+PC9zdmc+PC9idXR0b24+JyxcbiAgICAgIHByZXZBcnJvdzpcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJzbGljay1wcmV2aW91cy1hcnJvd1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91cyByb29tc1wiPjxzdmcgY2xhc3M9XCJpY29uXCI+PHVzZSB4bGluazpocmVmPVwiI2FuZ2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICB7XG4gICAgICAgICAgYnJlYWtwb2ludDogMTAyNCxcbiAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDMsXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgYnJlYWtwb2ludDogNjAwLFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGJyZWFrcG9pbnQ6IDQ4MCxcbiAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gWW91IGNhbiB1bnNsaWNrIGF0IGEgZ2l2ZW4gYnJlYWtwb2ludCBub3cgYnkgYWRkaW5nOlxuICAgICAgICAvLyBzZXR0aW5nczogXCJ1bnNsaWNrXCJcbiAgICAgICAgLy8gaW5zdGVhZCBvZiBhIHNldHRpbmdzIG9iamVjdFxuICAgICAgXVxuICAgIH0pO1xuICB9KTtcbiAgLypcbiAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICQoXCIjYXJyaXZlRHRcIikuZGF0ZXBpY2tlcigpO1xuICAgICAkKFwiI2RlcGFydER0XCIpLmRhdGVwaWNrZXIoKTtcbiAgICAgfSk7XG5cbiAgICAgZnVuY3Rpb24gc3VibWl0Zm9ybSgpIHtcbiAgICAgaWYgKCEkKFwiI2Fycml2ZUR0XCIpLnZhbCgpIHx8ICEkKFwiI2RlcGFydER0XCIpLnZhbCgpKSB7XG4gICAgIHdpbmRvdy5hbGVydChcIlBsZWFzZSBlbnRlciBhIFN0YXJ0IGFuZCBFbmQgRGF0ZSFcIik7XG4gICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgICAkKCcjcmVzYmxvY2snKS5zdWJtaXQoKTtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9XG4gICAgICovXG4gIC8vIGFycml2ZUR0XG4gIC8vIGRlcGFydER0XG4gIC8qKlxuICAgKiBJbml0aWFsaXplIFBpa2FkYXkgZGF0ZXBpY2tlcnMuXG4gICAqIEB0eXBlIHsqfVxuICAgKi9cbiAgLypcbiAgICB2YXIgY2hlY2tpbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJpdmVEdFwiKSxcbiAgICAgICAgY2hlY2tvdXRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVwYXJ0RHRcIiksXG4gICAgICAgIGNoZWNraW5QaWthID0gcGlrYWRheVJlc3BvbnNpdmUoY2hlY2tpbkVsLCB7XG4gICAgICAgICAgICBmb3JtYXQ6ICdNL0REL1lZWVknLFxuICAgICAgICAgICAgcGlrYWRheU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgY2hlY2tvdXRQaWthID0gcGlrYWRheVJlc3BvbnNpdmUoY2hlY2tvdXRFbCwge1xuICAgICAgICAgICAgZm9ybWF0OiAnTS9ERC9ZWVlZJyxcbiAgICAgICAgICAgIHBpa2FkYXlPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4qL1xuICAvLyBDaGVjayBjaGVja291dGRhdGVcbiAgLypcbiAgICAkKGNoZWNraW5FbCkub24oJ2NoYW5nZS1kYXRlJywgZnVuY3Rpb24gKGUsIGRhdGUpIHtcbiAgICAgICAgLy8gSWYgY2hlY2sgb3V0IGRhdGUgaXMgYmVmb3JlIGNoZWNrIGluIGRhdGVcbiAgICAgICAgaWYgKGRhdGUuZGF0ZS5pc0FmdGVyKGNoZWNrb3V0UGlrYS5kYXRlKSkge1xuICAgICAgICAgICAgY2hlY2tvdXRQaWthLnNldERhdGUoZGF0ZS5kYXRlLmFkZCgxLCAnZGF5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBtaW4gZGF0ZSBmb3IgdGhlIGNoZWNrb3V0IGlucHV0LlxuICAgICAgICBjaGVja291dFBpa2EucGlrYWRheS5zZXRNaW5EYXRlKGNoZWNraW5QaWthLmRhdGUudG9EYXRlKCkpO1xuICAgIH0pO1xuXG4gICAgJCgnLmJvb2tpbmctYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRpdGxlID0gJCh0aGlzKTtcbiAgICAgICAgdmFyIGJhciA9ICQoJy5ib29raW5nLWJhcicpO1xuICAgICAgICBiYXIuc2xpZGVUb2dnbGUoJ2Zhc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBiYXIudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIGlmIChiYXIuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgICAgIHRpdGxlLnRleHQoJ0Nsb3NlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlLnRleHQoJ0Jvb2sgTm93Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4qL1xuICAkKFwiLmhlcm8tc2xpY2tcIikuc2xpY2soe1xuICAgIG5leHRBcnJvdzpcbiAgICAgICc8YnV0dG9uIGNsYXNzPVwic2xpY2stbmV4dC1hcnJvd1wiIGFyaWEtbGFiZWw9XCJOZXh0IHJvb21zXCI+PHN2ZyBjbGFzcz1cImljb25cIj48dXNlIHhsaW5rOmhyZWY9XCIjYW5nbGUtcmlnaHRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuICAgIHByZXZBcnJvdzpcbiAgICAgICc8YnV0dG9uIGNsYXNzPVwic2xpY2stcHJldmlvdXMtYXJyb3dcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXMgcm9vbXNcIj48c3ZnIGNsYXNzPVwiaWNvblwiPjx1c2UgeGxpbms6aHJlZj1cIiNhbmdsZS1sZWZ0XCI+PC91c2U+PC9zdmc+PC9idXR0b24+J1xuICB9KTtcbn0pKGpRdWVyeSk7XG4iXX0=
