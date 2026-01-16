# SolChat Design Brief 🎨

This document details the user interface philosophy and aesthetic decisions for SolChat. For security architecture and cryptographic details, see [README.md](./README.md).

---

## Design Philosophy: Anti-Gravity Interface

SolChat's interface embodies **anti-gravity design** — a visual language where elements feel weightless, ethereal, and effortlessly suspended in digital space. This philosophy reflects the protocol's core promise: communication that transcends traditional barriers.

### Core Principles

1. **Weightlessness**: UI elements float with soft shadows and subtle depth
2. **Transparency**: Glassmorphism creates layers of visual hierarchy without visual weight
3. **Fluidity**: Smooth transitions reinforce the seamless encryption happening behind the scenes
4. **Darkness**: Dark mode as default respects user attention and reduces eye strain during extended use

---

## Visual Language

### Glassmorphism Aesthetics

The interface leverages frosted glass effects to create depth and hierarchy:

```css
/* Core glassmorphism tokens */
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f172a` | Base background |
| `--bg-elevated` | `rgba(30, 41, 59, 0.8)` | Cards, panels |
| `--accent-primary` | `#8b5cf6` | Primary actions, highlights |
| `--accent-success` | `#10b981` | Encryption verified states |
| `--text-primary` | `#f8fafc` | Primary text |
| `--text-muted` | `#94a3b8` | Secondary text |

### Typography

- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (wallet addresses, keys)
- **Scale**: 14px base with 1.5 line height

---

## Motion Design

Powered by **Framer Motion**, animations are purposeful and reinforce user actions:

### Transition Tokens

```javascript
// Standard easing
const easeOut = [0.16, 1, 0.3, 1];

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut }
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2 }
};
```

### Key Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade + slide up | 300ms |
| Message bubbles | Scale in | 200ms |
| Encryption indicator | Pulse on verify | 500ms |
| Button hover | Subtle lift | 150ms |

---

## Component Design

### Message Bubbles

- Sent messages: Right-aligned, accent gradient background
- Received messages: Left-aligned, glass panel background
- Encryption badge: Visible on each message with lock icon

### Chat Window

- Floating header with recipient info and encryption status
- Auto-scroll with smooth behavior
- Virtual scrolling for performance with large histories

### Sidebar

- Collapsible on mobile
- Chat list with unread indicators
- Search with real-time filtering

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 640px` | Sidebar overlays, full-width chat |
| `640px - 1024px` | Collapsible sidebar, adaptive spacing |
| `> 1024px` | Full sidebar, comfortable density |

---

## Tech Stack (UI Layer)

- **Framework**: React 18.x
- **Build**: Vite
- **Styling**: TailwindCSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

---

*Premium user experience. Uncompromising security.*
