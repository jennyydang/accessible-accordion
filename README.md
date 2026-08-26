# Accessible Accordion

A dependency-free accordion component built with vanilla HTML, CSS3, and
JavaScript, implementing the [WAI-ARIA Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

## Files

- `index.html` — markup for the accordion (an FAQ example with 4 panels)
- `styles.css` — visual styling, animated expand/collapse, and focus styles
- `script.js` — behavior: toggling, keyboard navigation, state management

## Usage

Open `index.html` in a browser — no build step or dependencies required.

## Accessibility features

- **Semantic triggers** — each header is a real `<button>` inside an `<h2>`,
  so it's reachable and operable via keyboard and announced correctly by
  screen readers (no `<div onclick>` fakery).
- **State conveyed via `aria-expanded`** — updated on every toggle so
  assistive technology announces "expanded"/"collapsed" automatically.
- **Explicit relationships** — `aria-controls` on the trigger points at its
  panel's `id`; the panel uses `aria-labelledby` to point back at the
  trigger and exposes `role="region"` so it's reachable as a landmark.
- **Content removed when collapsed** — collapsed panels get the `hidden`
  attribute, taking them out of the accessibility tree and the tab order
  entirely (not just visually hidden).
- **Full keyboard support**:
  - <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> — move focus between triggers
  - <kbd>Enter</kbd> / <kbd>Space</kbd> — toggle the focused panel (native
    button behavior)
  - <kbd>↓</kbd> / <kbd>↑</kbd> — move focus to the next/previous trigger
  - <kbd>Home</kbd> / <kbd>End</kbd> — jump to the first/last trigger
- **Visible focus indicator** — a high-contrast `:focus-visible` outline
  that is never removed without a replacement.
- **Reduced motion respected** — `prefers-reduced-motion: reduce` disables
  the expand/collapse animation.
- **Configurable single/multi-open behavior** — set
  `data-allow-multiple="true"` on `.accordion` to let several panels stay
  open simultaneously, or `"false"` (default behavior in the example) to
  auto-collapse other panels when a new one opens.

## Customizing

- Add or remove `.accordion__heading` + `.accordion__panel` pairs inside a
  `.accordion` container. Each trigger/panel pair needs matching, unique
  `id`s wired up via `aria-controls` / `aria-labelledby`.
- Multiple independent `.accordion` instances can coexist on the same page;
  `script.js` initializes each one separately.
- Colors, spacing, and animation timing are all controlled by CSS custom
  properties at the top of `styles.css`.
