# Custom Hooks (`app/hooks/`)

- `useAutoScroll.ts` — Auto-scrolls a scrollable container when a react-dnd drag nears its top or bottom edge. Works for both mouse and touch via `monitor.getClientOffset()`. Always scrolls the container (never the window).
- `useCountdown.ts` — Countdown timer hook; returns remaining time from a target date.
- `useCustomScrollbar.ts` — Applies custom styled scrollbar to a ref element.
- `useScrollReveal.ts` — Triggers reveal animation when elements enter viewport (IntersectionObserver).
