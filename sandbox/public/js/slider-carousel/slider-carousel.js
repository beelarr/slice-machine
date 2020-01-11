"use strict";

/* inert polyfill 
 * source: https://cdn.rawgit.com/GoogleChrome/inert-polyfill/v0.1.0/inert-polyfill.min.js
 */
window.addEventListener("load", function () {
  function h(a, b, c) {
    if (0 > b) {
      if (a.previousElementSibling) {
        for (a = a.previousElementSibling; a.lastElementChild;) {
          a = a.lastElementChild;
        }

        return a;
      }

      return a.parentElement;
    }

    if (a != c && a.firstElementChild) return a.firstElementChild;

    for (; null != a;) {
      if (a.nextElementSibling) return a.nextElementSibling;
      a = a.parentElement;
    }

    return null;
  }

  function g(a) {
    for (; a && a !== document.documentElement;) {
      if (a.hasAttribute("inert")) return a;
      a = a.parentElement;
    }

    return null;
  }

  (function (a) {
    var b = document.createElement("style");
    b.type = "text/css";
    b.styleSheet ? b.styleSheet.cssText = a : b.appendChild(document.createTextNode(a));
    document.body.appendChild(b);
  })("/*[inert]*/[inert]{position:relative!important;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none}[inert]::before{content:'';display:block;position:absolute;top:0;left:0;right:0;bottom:0}");

  var c = 0;
  document.addEventListener("keydown", function (a) {
    c = 9 === a.keyCode ? a.shiftKey ? -1 : 1 : 0;
  });
  document.addEventListener("mousedown", function () {
    c = 0;
  });
  document.body.addEventListener("focus", function (a) {
    var b = a.target,
        f = g(b);

    if (f) {
      if (document.hasFocus() && 0 !== c) {
        var d = document.activeElement,
            e = new KeyboardEvent("keydown", {
          keyCode: 9,
          which: 9,
          key: "Tab",
          code: "Tab",
          keyIdentifier: "U+0009",
          shiftKey: !!(0 > c),
          bubbles: !0
        });
        Object.defineProperty(e, "keyCode", {
          value: 9
        });
        document.activeElement.dispatchEvent(e);
        if (d != document.activeElement) return;

        for (d = f;;) {
          d = h(d, c, f);
          if (!d) break;

          a: {
            e = b;

            if (!(0 > d.tabIndex) && (d.focus(), document.activeElement !== e)) {
              e = !0;
              break a;
            }

            e = !1;
          }

          if (e) return;
        }
      }

      b.blur();
      a.preventDefault();
      a.stopPropagation();
    }
  }, !0);
  document.addEventListener("click", function (a) {
    g(a.target) && (a.preventDefault(), a.stopPropagation());
  }, !0);
});
"use strict";

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
  generateID: function generateID(base) {
    return base + Math.floor(Math.random() * 999);
  }
};

(function (w, doc, undefined) {
  var ARIAcarouselOptions = {};

  var ARIAcarousel = function ARIAcarousel(inst, options) {
    var _options = Object.assign(ARIAcarouselOptions, options);

    var el = inst;
    var carouselContainer = el.querySelector("[data-carousel-cards]");
    var cardsWrapper = el.querySelector("[data-carousel-cards-wrapper]");
    var cards = Array.from(el.querySelectorAll("[data-carousel-card]"));
    var paddleNav = el.querySelector("[data-carousel-paddleNav]");
    var prevButton = paddleNav.querySelector('[data-prev]');
    var nextButton = paddleNav.querySelector('[data-next]');
    var carouselID = util.generateID('c-carousel-');
    var cardWidth = cards[0].offsetWidth;
    var containerWidth = carouselContainer.offsetWidth;
    var itemsAvailable = Math.floor(containerWidth / cardWidth);
    var itemsOutOfView = cards.length - itemsAvailable;
    var rightCounter = itemsOutOfView; // counts the number of remaining slides that are out of view

    var leftCounter = 0;
    var itemsShowing = []; // console.log('card width: ' + cardWidth);
    // console.log('Items in view: ' + itemsAvailable);
    // console.log('Items out of view: ' + itemsOutOfView);

    var init = function init() {
      el.setAttribute('id', carouselID);
      el.classList.add('js-carousel');
      el.setAttribute('role', 'group'); // or region

      el.setAttribute('aria-roledescription', 'Carousel');
      el.setAttribute('aria-label', el.getAttribute('data-aria-label')); // show Next and Prev Buttons

      paddleNav.removeAttribute('hidden');
      /***************************************** * 
       * handle carousel on window resize 
       ******************************************/

      var timeout = false,
          // holder for timeout id
      delay = 100,
          // delay after event is "complete" to run callback
      calls = 0;
      window.addEventListener("resize", function () {
        // clear the timeout
        clearTimeout(timeout); // start timing for event "completion"

        timeout = setTimeout(updateState, delay);
      });
      updateState();

      function updateState() {
        cardWidth = cards[0].offsetWidth;
        containerWidth = carouselContainer.offsetWidth;
        itemsAvailable = Math.floor(containerWidth / cardWidth);
        itemsOutOfView = cards.length - itemsAvailable;
        rightCounter = itemsOutOfView;
        leftCounter = 0; // reset it

        handlePaddleButtonsState();
        updateHelper();
        slideCards();
      }
      /* ************************************************ */


      var helper = document.createElement('span');
      helper.setAttribute('aria-live', 'polite');
      helper.setAttribute('id', carouselID + '__SRHelper');
      helper.classList.add('sr-only');
      helper.classList.add('c-carousel__SRHelper');
      el.prepend(helper);
      initCards();
      initPaddleNav();
      initHelper();
      enableTouchSwipes();
    };

    var initCards = function initCards() {
      var options = {
        root: carouselContainer,
        rootMargin: '0px',
        threshold: 0.1
      };
      var observer = new IntersectionObserver(a11ifyCards, options);
      cards.forEach(function (card) {
        return observer.observe(card);
      });

      function a11ifyCards(entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // entry.target.style.opacity = "1";
            entry.target.classList.add('is-visible');
            entry.target.setAttribute('aria-hidden', 'false');
            entry.target.removeAttribute('inert');
          } else {
            // entry.target.style.opacity = "0";
            entry.target.classList.remove('is-visible');
            entry.target.setAttribute('aria-hidden', 'true');
            entry.target.setAttribute('inert', '');
          }
        });
      }
    };

    var enableTouchSwipes = function enableTouchSwipes() {
      var mc = new Hammer(cardsWrapper, {
        threshold: 500
      }); // listen to events...

      mc.on("swipeleft", function (e) {
        paddleForward();
      });
      mc.on("swiperight", function (e) {
        paddleBack();
      });
    };

    var initHelper = function initHelper() {
      updateHelper();
    };

    var updateHelper = function updateHelper() {
      setTimeout(function () {
        var visibleItems = Array.from(el.querySelectorAll('.c-carousel__card.is-visible'));
        var cardNumbers = [];
        var helper = el.querySelector('.c-carousel__SRHelper');
        visibleItems.forEach(function (item) {
          var number = cards.indexOf(item);
          cardNumbers.push(number + 1);
        });
        helper.innerHTML = 'Showing carousel items ' + cardNumbers.toString() + ' of ' + cards.length;
      }, 300);
    };

    var initPaddleNav = function initPaddleNav() {
      prevButton.addEventListener('keydown', function (e) {
        paddleKeyboardRespond(e);
      }, false);
      nextButton.addEventListener('keydown', function (e) {
        paddleKeyboardRespond(e);
      }, false);
      prevButton.addEventListener('click', function (e) {
        paddleBack();
      });
      nextButton.addEventListener('click', function (e) {
        paddleForward(e);
      });
      handlePaddleButtonsState();
    };

    var handlePaddleButtonsState = function handlePaddleButtonsState() {
      if (rightCounter == 0) {
        nextButton.setAttribute('aria-disabled', 'true');
        nextButton.setAttribute('tabindex', '-1');
      } else if (rightCounter > 0) {
        nextButton.removeAttribute('aria-disabled');
        nextButton.removeAttribute('tabindex');
      }

      if (leftCounter == 0) {
        prevButton.setAttribute('aria-disabled', 'true');
        prevButton.setAttribute('tabindex', '-1');
      } else if (leftCounter > 0) {
        prevButton.removeAttribute('aria-disabled');
        prevButton.removeAttribute('tabindex');
      }
    };

    var slideCards = function slideCards() {
      var translateValue = leftCounter * cardWidth * -1;
      cardsWrapper.style.transform = 'translateX(' + translateValue + 'px)';
    };

    var incrementRightCounter = function incrementRightCounter() {
      if (rightCounter < itemsOutOfView) {
        return ++rightCounter;
      } else return;
    };

    var decrementRightCounter = function decrementRightCounter() {
      if (rightCounter > 0) {
        return --rightCounter;
      } else return;
    };

    var incrementLeftCounter = function incrementLeftCounter() {
      if (leftCounter < itemsOutOfView) {
        return ++leftCounter;
      } else return;
    };

    var decrementLeftCounter = function decrementLeftCounter() {
      if (leftCounter > 0) {
        return --leftCounter;
      } else return;
    };

    var paddleBack = function paddleBack(e) {
      incrementRightCounter();
      decrementLeftCounter();
      slideCards();
      updateHelper();
      handlePaddleButtonsState();
    };

    var paddleForward = function paddleForward(e) {
      decrementRightCounter();
      incrementLeftCounter();
      slideCards();
      updateHelper();
      handlePaddleButtonsState();
    };

    var paddleKeyboardRespond = function paddleKeyboardRespond(e) {
      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case util.keyCodes.LEFT:
          prevButton.focus();
          paddleBack(e);
          break;

        case util.keyCodes.RIGHT:
          nextButton.focus();
          paddleForward(e);
          break;

        case util.keyCodes.ENTER:
        case util.keyCodes.SPACE:
          // selectedDot = currentIndex;
          // selectDot();
          break;

        case util.keyCodes.TAB:
          // slides[selectedDot].setAttribute('tabindex', '0');
          // currentIndex = selectedDot;
          break;
      }
    };

    init.call(this);
    return this;
  }; // ARIAcarousel()


  w.ARIAcarousel = ARIAcarousel;
})(window, document);

var carouselInstance = "[data-carousel]";
var els = document.querySelectorAll(carouselInstance);
var allcarousel = []; // Generate all carousel instances

for (var i = 0; i < els.length; i++) {
  var ncarousel = new ARIAcarousel(els[i]); // if manual is set to false, the carousel open on focus without needing an ENTER or SPACE press

  allcarousel.push(ncarousel);
}