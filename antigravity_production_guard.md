# 🛡️ AntiGravity Production Guard

> **Purpose:** This is your final quality assurance protocol. Use it with a fresh agent to perform a "Digital Audit" of your work.
> **Skillset:** Enforces @/.agent/skills/ui-ux-pro-max and @/.agent/skills/self-healing.

---

## 🚀 The Production Readiness Prompt

**Copy & Paste this to the Agent:**

```markdown
@/.agent/skills/ui-ux-pro-max @/.agent/skills/self-healing

I am ready to deploy. I need you to act as a **Lead QA Engineer** and perform a complete **Digital Audit** of this Next.js site.

**YOUR OBJECTIVE:**
Ensure the site is production-ready, ultra-smooth, and cinematically perfect.

**PHASE 1: THE INTEGRITY SCAN (Self-Healing)**
1. **Critical Flows:** Use the browser to click every primary CTA.
   - Verify "Post-Meeting Autopilot" opens the modal.
   - Verify the Audio Demo plays and word-by-word transcription works.
   - Verify ElevenLabs widget integration is correctly contained.
2. **Crash Test:** Check the Console for any React warnings, hydration errors, or failed imports.

**PHASE 2: THE BEAUTY & BREATHING CHECK (UI/UX Pro Max)**
1. **Responsive Refinement:** Test on iPhone 15 Pro viewport.
   - Check the `KaraokeText` for overflow.
   - Ensure the "Tech Tag" (Hint) doesn't clip on small screens.
   - **Optimization:** If spacing feels cramped, apply "Pro Max" breathing room (Tailwind `p-` and `gap-` adjustments).
2. **Animation Polish:** Ensure `framer-motion` transitions are `60fps` and use `easeOut` or `spring` for that premium feel.

**PHASE 3: PERFORMANCE HYGIENE**
1. **Import Audit:** Scan for unused libraries or large bundles that can be optimized.
2. **Debug Purge:** Ensure all `console.log` and `// TODO` comments are removed.
3. **Accessibility:** Verify basic Alt text on our new custom icons and visuals.

**FINAL OUTPUT:**
Document your findings in `production_audit_report.md`. 
If no issues are found, say: **"Systems Optimized. The Showcase is Launch Ready. 🛰️"**
```
