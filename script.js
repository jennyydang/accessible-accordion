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

  /**
   * Cancel a still-running expand/collapse animation on a panel, if any,
   * so rapid repeated clicks don't pile up transitionend listeners or leave
   * a stale one firing after the panel has moved on to a different state.
   */
  Accordion.prototype.cancelPendingTransition = function (panel) {
    if (panel._accordionTransitionHandler) {
      panel.removeEventListener("transitionend", panel._accordionTransitionHandler);
      panel._accordionTransitionHandler = null;
    }
  };

  Accordion.prototype.expand = function (trigger, panel) {
    trigger.setAttribute("aria-expanded", "true");
    this.cancelPendingTransition(panel);
    panel.removeAttribute("hidden");

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      panel.style.height = "";
      return;
    }

    // Animate from an explicit 0px (never from "auto", which can't be
    // transitioned) up to the panel's real measured height, then hand
    // height back to "auto" so it stays responsive to content/viewport
    // changes while open.
    panel.style.height = "0px";
    // eslint-disable-next-line no-unused-expressions
    panel.offsetHeight; // force reflow so the 0px start is committed

    panel.style.height = panel.scrollHeight + "px";

    var onTransitionEnd = function (event) {
      if (event.target !== panel || event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onTransitionEnd);
      panel._accordionTransitionHandler = null;
      panel.style.height = "";
    };
    panel._accordionTransitionHandler = onTransitionEnd;
    panel.addEventListener("transitionend", onTransitionEnd);
  };

  Accordion.prototype.collapse = function (trigger, panel) {
    trigger.setAttribute("aria-expanded", "false");
    this.cancelPendingTransition(panel);

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      panel.style.height = "";
      panel.setAttribute("hidden", "");
      return;
    }

    // Pin the panel's current (possibly "auto") height down to an explicit
    // pixel value first, then force a reflow, so the drop to 0px on the
    // next line is a real, fully-animated transition instead of a jump.
    panel.style.height = panel.scrollHeight + "px";
    // eslint-disable-next-line no-unused-expressions
    panel.offsetHeight; // force reflow

    panel.style.height = "0px";

    var onTransitionEnd = function (event) {
      if (event.target !== panel || event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onTransitionEnd);
      panel._accordionTransitionHandler = null;
      panel.setAttribute("hidden", "");
      panel.style.height = "";
    };
    panel._accordionTransitionHandler = onTransitionEnd;
    panel.addEventListener("transitionend", onTransitionEnd);
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
