---
name: zim-brand
description: Visual standards for ZIM AI Showcase. Fuses ZIM corporate identity with Genesys AI accents.
---

# 1. Brand Assets & Identity
- **Logo:** `https://npkyfnkpkuovnplylxot.supabase.co/storage/v1/object/public/ZIM/zim80-logo-313x112-white.png`
- **Theme:** "Neural Dash 2030." High-contrast, dark mode, glassmorphism, and kinetic physics.

# 2. Master Gradient (The Quattro Gradient)
- **Definition:** The signature animated 4-color gradient used for headers and primary CTAs.
- **Colors:** `#60a5fa` (Blue) → `#34d399` (Green) → `#a78bfa` (Purple) → `#fb923c` (Orange).
- **CSS:** `linear-gradient(to right, #60a5fa, #34d399, #a78bfa, #fb923c)`
- **Animation Style:** `background-size: 300% 100%` with a smooth horizontal shift.

# 3. Feature Color Mapping (The Grid DNA)
Every feature card/simulation must be assigned one specific accent color from this list:

| Phase | # | Feature Name | Core Color | Hex / Tailwind |
| :--- | :--- | :--- | :--- | :--- |
| **Current** | 1 | Speech & Text Analytics | Blue | `#60a5fa` / `blue-400` |
| **Current** | 2 | AI Summarization | Green | `#34d399` / `emerald-400` |
| **Current** | 3 | Auto-Evaluations | Purple | `#a78bfa` / `violet-400` |
| **Current** | 4 | Global Translation | Orange | `#fb923c` / `orange-400` |
| **Future** | 5 | Predictive Engagement | Cyan | `#22d3ee` / `cyan-400` |
| **Future** | 6 | Predictive Routing | Gold | `#facc15` / `yellow-400` |
| **Future** | 7 | Agentic Virtual Agents | Crimson | `#f43f5e` / `rose-500` |
| **Future**| 8 | AI Knowledge Base | Indigo | `#818cf8` / `indigo-400` |
| **Expansion**| 9 | TBD | Lime | `#a3e635` / `lime-400` |
| **Expansion**| 10| TBD | Fuchsia | `#e879f9` / `fuchsia-400` |
| **Expansion**| 11| TBD | Amber | `#fbbf24` / `amber-400` |
| **Expansion**| 12| TBD | Slate | `#94a3b8` / `slate-400` |

# 4. Creative Directives
- **Physics:** Objects (particles, bubbles, cards) should use "Anti-Gravity" logic: high repulsion from the cursor and 70px minimum spacing from each other.
- **Simulation Design:** Visualizations must use the specific Feature Color (e.g., Feature 6 uses Gold nodes).
- **KPI Indicators:** Must pop to the side using `backdrop-blur-xl` and the assigned Feature Color for borders.
- **Typography:** Titles use `Inter` Extra Bold.