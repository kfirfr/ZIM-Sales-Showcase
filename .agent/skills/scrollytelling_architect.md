---
description: Expert rules for architecting high-performance scrollytelling experiences using GSAP and React.
---

# Scrollytelling Architect Skill

This skill defines the architectural standards for implementing scroll-driven animations (Scrollytelling).

## Core Principles

1.  **Main Thread Sanctity**: NEVER block the main thread. Heavy logic must happen in `requestAnimationFrame` or Web Workers.
2.  **GPU vs CPU**: Always animate `transform` (GPU) and `opacity` (GPU). NEVER animate `top`, `left`, `width`, `height` (CPU Layout Thrashing).
3.  **Virtualization**: For long sequences (like image sequences), do not render 240 DOM nodes. Use **Virtualization** (rendering only what is visible) or a single **Canvas** element updated frame-by-frame.

## Implementation Rules

### 1. The Setup (GSAP + Lenis)
Always wrap the application (or root layout) in a `ReactLenis` provider to smooth out the native scroll steps.

```jsx
// layout.tsx
import { ReactLenis } from 'react-lenis'

function Layout({ children }) {
  return (
    <ReactLenis root>
      {children}
    </ReactLenis>
  )
}
```

### 2. Image Sequence Strategy
When dealing with video-like scrubbing:
-   **Method**: Draw to `<canvas>`.
-   **Optimization**: Preload images in chunks (Lazy Loading) rather than all at once, unless necessary for the immediate opening sequence.
-   **Context**: Use `ctx.drawImage(img, ...)` inside a `requestAnimationFrame` loop that checks if the `currentFrame` index has changed.

### 3. ScrollTrigger Best Practices
-   **Scrubbing**: Use `scrub: true` or `scrub: 1` (adds 1s lag for smoothness) for timeline-bonded animations.
-   **Pinning**: When pinning a hero section (`pin: true`), ensure the wrapper has sufficient height (e.g., `300vh`) to determine the playback duration.
-   **Anticipate**: Set `anticipatePin: 1` if the pinning feels jumpy on initialization.

### 4. The "Handoff"
Transitioning from a fixed canvas to normal content requires precise z-index management.
-   **State A (Scroll 0-90%)**: Canvas is `fixed` or `sticky`, z-index 50. Content is `relative`, z-index 10.
-   **State B (Scroll 90-100%)**: Canvas scales up (fly-thru) and opacity fades.
-   **State C (Scroll 100%+)**: Canvas is `hidden` or `pointer-events: none`. Content is fully visible.
