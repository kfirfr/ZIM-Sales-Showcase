---
name: self-healing-qa
description: Protocol for verifying the site works before human review.
---

# Verification Protocol
After every code change, you must SPAWN a Browser Agent to:
1. **Load:** Visit `http://localhost:3100`.
2. **Interact:** Click every CTA button. If a button does nothing, report ERROR.
3. **Responsiveness:** Toggle viewport to "Mobile (iPhone 14)". If text overflows, report ERROR.
4. **Console:** Check Chrome DevTools Console. If Red errors exist, report ERROR.

# Auto-Fix Strategy
- If an ERROR is found:
  1. Capture a screenshot artifact.
  2. Read the specific component file.
  3. Apply a fix immediately.
  4. Re-verify.