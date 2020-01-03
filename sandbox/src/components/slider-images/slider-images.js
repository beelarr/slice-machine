
// each data-slide gets role group and aria-roledescription=slide
// if dotnav exists: 
// generate dotnav based on number of slides
// list of dotnav buttons is tablist 
// each dotnav button is role="tab" and has an ID
// each data-slide is has role="tabpanel" without aria-roledescription
// each slide has aria-labelledby set to the dot that controls it
// each dot would need a useful name; 
// from the apple site: use the data-slide ID but replace - with  nothing and capitalize, use "Slide X" instead


// if looping:
// when the selectedDot = current = last tab, disable next button
// when the selectedDot = current = first tab, disable previous button

"use strict";
if (typeof Object.assign != "function") {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      // .length of function is 2

      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError(
          "Cannot convert undefined or null to object"
        );
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (
              Object.prototype.hasOwnProperty.call(
                nextSource,
                nextKey
              )
            ) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
// add utilities; some of them borrowed from: https://scottaohara.github.io/a11y_tab_widget/
var util = {
  keyCodes: {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    HOME: 36,
    END: 35,
    ENTER: 13,
    SPACE: 32,
    DELETE: 46,
    TAB: 9
  },

  generateID: function (base) {
    return base + Math.floor(Math.random() * 999);
  },

  getDirectChildren: function (elm, selector) {
    return Array.prototype.filter.call(elm.children, function (child) {
      return child.matches(selector);
    });
  },

  getUrlHash: function () {
    return window.location.hash.replace('#', '');
  },

  /**
   * Use history.replaceState so clicking through Tabs
   * does not create dozens of new history entries.
   * Browser back should navigate to the previous page
   * regardless of how many Tabs were activated.
   *
   * @param {string} hash
   */
  setUrlHash: function (hash) {
    if (history.replaceState) {
      history.replaceState(null, '', '#' + hash);
    } else {
      location.hash = hash;
    }
  },

  /** 
   * Convert hyphen-separated string to camelCase
   * Source: https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase 
   * CamelCase is readable by Screen Readers and so can be used as an accessible label for the dotNav
   * More info: https://adrianroselli.com/2018/01/improving-your-tweet-accessibility.html#Hash
   */
  dashToCamelCase: function (string) {
    return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });

    // Usage:
    // var myStr = dashToCamelCase('this-string');
    // alert(myStr); // => thisString
  }

};




(function (w, doc, undefined) {

  var ARIAaccOptions = {
    manual: true,
    open: 0,
    loop: true,
    widthDotNav: true
  }

  var ARIAslider = function (inst, options) {
    var _options = Object.assign(ARIAaccOptions, options);
    var el = inst;
    var slidesContainer = el.querySelector("[data-slides]");
    var slides = Array.from(el.querySelectorAll("[data-slide]"));
    var paddleNav = el.querySelector("[data-slider-paddleNav]");
    var prevButton = paddleNav.querySelector('[data-prev]');
    var nextButton = paddleNav.querySelector('[data-next]');

    var sliderID = util.generateID('c-slider-');

    var currentIndex = _options.open;
    var selectedDot = currentIndex;
    var manual = _options.manual;
    var loop = _options.loop;
    var withDotNav = _options.widthDotNav;
    var dots = [];


    var init = function () {
      el.setAttribute('id', sliderID);
      el.classList.add('js-slider');

      el.setAttribute('role', 'group'); // or region
      el.setAttribute('aria-roledescription', 'Slider');
      el.setAttribute('aria-label', el.getAttribute('data-aria-label'));

      // show Next and Prev Buttons
      paddleNav.removeAttribute('hidden');

      setupPaddleNav();
      if (withDotNav) setupDotNav();
      setupSlides();
    };

    var setupPaddleNav = function () {
      prevButton.addEventListener('click', function () {
        slideBack();
      });

      nextButton.addEventListener('click', function () {
        slideForward();
      });
    }

    var setupDotNav = function () {
      var dotNavList = document.createElement('div');
      dotNavList.setAttribute('data-slider-dotNav', '');
      dotNavList.setAttribute('role', 'tablist');
      dotNavList.setAttribute('class', 'c-slider__dotNav');

      // create dots
      var nb = slides.length;
      for (var i = 0; i < nb; i++) {
        let dot = document.createElement('button');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('id', sliderID + '__dot-' + i)
        dot.setAttribute('class', 'c-slider__dotNav__dot')
        dot.setAttribute('data-slider-dot', '')
        dot.setAttribute('data-controls', slides[i].getAttribute('id'));

        // append dot to dotNavList
        dotNavList.appendChild(dot);
        dots.push(dot);
      }

      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          selectDot(dot);
        }

        dot.addEventListener('click', (e) => {
          e.preventDefault();
          currentIndex = index;
          selectedDot = index;
          focusCurrentDot();
          selectDot(dot);
        }, false);

        dot.addEventListener('keydown', (e) => {
          dotKeyboardRespond(e, dot);
        }, false);
      });


      // append dotNavList to slider
      el.appendChild(dotNavList);
    }


    var focusCurrentDot = function () {
      dots[currentIndex].focus();
    }

    var selectDot = function (dot) {
      // unactivate all other dots
      dots.forEach(dot => {
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('tabindex', '-1');
      });
      //activate current tab
      dot.setAttribute('aria-selected', 'true');
      dot.setAttribute('tabindex', '0');

      // activate corresponding panel 
      showSlide(dot);
    }

    var setupSlides = function () {
      slides.forEach((slide, index) => {
        if (_options.widthDotNav) {
          slide.setAttribute('role', 'tabpanel');
        }
        else {
          slide.setAttribute('role', 'group');
          slide.setAttribute('aria-roledescription', 'Slide');
        }

        slide.setAttribute('tabindex', '-1');
        // slide.setAttribute('hidden', '');

        if (index == currentIndex) {
          // slide.removeAttribute('hidden');
        }

        slide.addEventListener('keydown', (e) => {
          // panelKeyboardRespond(e);
        }, false);

        slide.addEventListener("blur", () => {
          slide.setAttribute('tabindex', '-1');
        }, false);
      });
    }


    var slideKeyboardRespond = function (e) {
      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case util.keyCodes.TAB:
          slides[currentIndex].setAttribute('tabindex', '-1');
          break;

        default:
          break;
      }
    }


    var showSlide = function (dot) {
      slides.forEach((slide, index) => {
        slide.setAttribute('hidden', '');
        slide.removeAttribute('tabindex');

        if (index == currentIndex) {
          slide.removeAttribute('hidden');
          slide.setAttribute('aria-labelledby', dots[currentIndex].getAttribute('id'));
          slide.setAttribute('tabindex', '0');
        }
      });
    }

    var incrementcurrentIndex = function () {
      if (currentIndex < dots.length - 1) {
        return ++currentIndex;
      }
      else {
        currentIndex = 0;
        return currentIndex;
      }
    };


    var decrementcurrentIndex = function () {
      if (currentIndex > 0) {
        return --currentIndex;
      }
      else {
        currentIndex = dots.length - 1;
        return currentIndex;
      }
    };


    var slideBack = function () {
      decrementcurrentIndex();
      selectedDot = currentIndex;
      selectDot(dots[selectedDot]);
    }

    var slideForward = function () {
      incrementcurrentIndex();
      selectedDot = currentIndex;
      selectDot(dots[selectedDot]);
    }

    var moveBack = function (e) {
      e.preventDefault();
      decrementcurrentIndex();
      focusCurrentDot();

      if (!manual) {
        selectedDot = currentIndex;
        selectDot(dots[selectedDot]);
      }
    }

    var moveForward = function (e) {
      e.preventDefault();
      incrementcurrentIndex();
      focusCurrentDot();

      if (!manual) {
        selectedDot = currentIndex;
        selectDot(dots[selectedDot]);
      }
    }

    var dotKeyboardRespond = function (e, dot) {
      var firstDot = dots[0];
      var lastDot = dots[dots.length - 1];

      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case util.keyCodes.UP:
        case util.keyCodes.LEFT:
          moveBack(e);

          break;


        case util.keyCodes.DOWN:
        case util.keyCodes.RIGHT:
          moveForward(e);

          break;


        case util.keyCodes.ENTER:
        case util.keyCodes.SPACE:
          e.preventDefault();
          selectedDot = currentIndex;
          selectDot(dots[selectedDot]);

          break;


        case util.keyCodes.TAB:
          slides[selectedDot].setAttribute('tabindex', '0');
          currentIndex = selectedDot;

          break;


        case util.keyCodes.HOME:
          e.preventDefault();
          firstTab.focus();

          break;


        case util.keyCodes.END:
          e.preventDefault();
          lastTab.focus();

          break;
      }

    }

    init.call(this);
    return this;
  }; // ARIAslider()

  w.ARIAslider = ARIAslider;

})(window, document);




var sliderInstance = "[data-slider]";
var els = document.querySelectorAll(sliderInstance);
var allslider = [];

// Generate all slider instances
for (var i = 0; i < els.length; i++) {
  var nslider = new ARIAslider(els[i], { manual: true }); // if manual is set to false, the slider open on focus without needing an ENTER or SPACE press
  allslider.push(nslider);
}