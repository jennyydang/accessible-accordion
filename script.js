/**
 * Accessible Accordion
 * ---------------------------------------------------------------------
 * Implements the WAI-ARIA Accordion Pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * - Each trigger is a real <button> with aria-expanded + aria-controls.
 * - Each panel is a labelled region with aria-labelledby, and is fully
 *   removed from the accessibility tree / tab order (via [hidden]) when
 *   collapsed.
 * - Keyboard support: Enter/Space (native button activation), plus
 *   ArrowUp/ArrowDown/Home/End for moving focus between triggers.
 * - Multiple independent accordions can exist on one page; each is
 *   initialized and manages its own state.
 * - "Single open" vs "multiple open" behavior is configured per-accordion
 *   via the data-allow-multiple="true|false" attribute.
 */

(function () {
  "use strict";

  var TRANSITION_CLASS_COLLAPSED = "is-collapsed";
  var TRANSITION_CLASS_COLLAPSING = "is-collapsing";

  /**
   * @param {HTMLElement} accordionEl
   */
  function Accordion(accordionEl) {
    this.el = accordionEl;
    this.allowMultiple = accordionEl.getAttribute("data-allow-multiple") === "true";
    this.triggers = Array.prototype.slice.call(
      accordionEl.querySelectorAll(".accordion__trigger")
    );

    this.triggers.forEach(this.bindTrigger, this);
  }

  Accordion.prototype.bindTrigger = function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    trigger.addEventListener("click", this.handleClick.bind(this, trigger, panel));
    trigger.addEventListener("keydown", this.handleKeydown.bind(this, trigger));
  };

  Accordion.prototype.handleClick = function (trigger, panel) {
    var isExpanded = trigger.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      this.collapse(trigger, panel);
    } else {
      if (!this.allowMultiple) {
        this.collapseAllExcept(trigger);
      }
      this.expand(trigger, panel);
    }
  };

  Accordion.prototype.collapseAllExcept = function (exceptTrigger) {
    this.triggers.forEach(function (otherTrigger) {
      if (otherTrigger === exceptTrigger) return;
      if (otherTrigger.getAttribute("aria-expanded") !== "true") return;

      var otherPanel = document.getElementById(otherTrigger.getAttribute("aria-controls"));
      if (otherPanel) {
        this.collapse(otherTrigger, otherPanel);
      }
    }, this);
  };

  Accordion.prototype.expand = function (trigger, panel) {
    trigger.setAttribute("aria-expanded", "true");
    panel.removeAttribute("hidden");

    // Start from a collapsed (0fr) row size with no transition, force a
    // reflow, then remove the class so the change to the default 1fr
    // animates via the CSS transition on grid-template-rows.
    panel.classList.remove(TRANSITION_CLASS_COLLAPSING);
    panel.classList.add(TRANSITION_CLASS_COLLAPSED);

    // eslint-disable-next-line no-unused-expressions
    panel.offsetHeight; // force reflow

    panel.classList.remove(TRANSITION_CLASS_COLLAPSED);
  };

  Accordion.prototype.collapse = function (trigger, panel) {
    trigger.setAttribute("aria-expanded", "false");

    var onTransitionEnd = function (event) {
      if (event.target !== panel || event.propertyName !== "grid-template-rows") return;
      panel.removeEventListener("transitionend", onTransitionEnd);
      panel.classList.remove(TRANSITION_CLASS_COLLAPSING);
      panel.setAttribute("hidden", "");
    };

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      panel.setAttribute("hidden", "");
      return;
    }

    panel.addEventListener("transitionend", onTransitionEnd);
    panel.classList.add(TRANSITION_CLASS_COLLAPSING);
  };

  Accordion.prototype.handleKeydown = function (trigger, event) {
    var currentIndex = this.triggers.indexOf(trigger);
    var targetIndex = null;

    switch (event.key) {
      case "ArrowDown":
        targetIndex = (currentIndex + 1) % this.triggers.length;
        break;
      case "ArrowUp":
        targetIndex = (currentIndex - 1 + this.triggers.length) % this.triggers.length;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = this.triggers.length - 1;
        break;
      default:
        return; // let all other keys behave natively
    }

    event.preventDefault();
    this.triggers[targetIndex].focus();
  };

  function init() {
    var accordions = document.querySelectorAll("[data-accordion]");
    accordions.forEach(function (el) {
      new Accordion(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
