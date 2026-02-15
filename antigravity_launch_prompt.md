# 🚀 AntiGravity Launch Protocol

> **Purpose:** This file contains the **Master Prompt** you need to run to perform the final "Sanity Check" and "Optimization" pass.
> **How to Use:**
> 1.  Open a **New Chat** with the Agent.
> 2.  **Copy & Paste** the entire code block below into the chat.
> 3.  Let the agent run the audit.

---

## 📋 The Master Prompt

```markdown
@/.agent/skills/ui-ux-pro-max @/.agent/skills/self-healing

I need you to perform a **Final Launch Audit** of my Next.js application.

**Context:**
The site is feature-complete. We have just finished implementing complex "Call Visualization" features (Audio Orbs, ElevenLabs integration, Transcripts).
I need you to ensure everything is **Fast, Responsive, and Error-Free** before deployment.

**YOUR MISSION:**
Execute the following 4-Step Audit Protocol.
**CRITICAL RULE:** Do NOT delete or rewrite working logic. Only optimize, clean up, or fix legitimate bugs.

### Phase 1: The "Self-Healing" Check (Browser)
1.  **Launch the Site:** Visit `http://localhost:3000` (or appropriate port).
2.  **Verify Core Flows:**
    -   Click "Sales Meeting AI Summary" -> "Experience Voice AI".
    -   Verify the **Opening Animation** plays smoothly.
    -   Verify the **Audio Orb** reacts to sound.
    -   Verify the **Transcript** scrolls/highlights correctly.
    -   Verify the **ElevenLabs Widget** loads in its container.
3.  **Responsiveness:**
    -   Switch to "Mobile View" (iPhone 14/15 Pro).
    -   Ensure the **Modal** fits the screen.
    -   Ensure the **Menu Cards** stack correctly.
    -   **Fix:** If anything overflows or looks broken on mobile, fix it with CSS (Tailwind).

### Phase 2: The "UI/UX Pro Max" Polish
1.  **Typography & Spacing:**
    -   Scan `src/components/CallPlayerModal.tsx` and `src/components/SummaryBox.tsx`.
    -   Ensure adequate padding on mobile.
    -   Ensure font sizes are legible (min 14px for body text).
    -   Check contrast ratios (using your best judgment/tools).
2.  **Animations:**
    -   Ensure `framer-motion` transitions are not causing layout shifts (`layout` prop usage).
    -   Ensure no "jank" on modal open/close.

### Phase 3: Performance & Code Hygiene
1.  **Console Cleanup:**
    -   Grep for `console.log` and remove debug logs.
    -   Check for valid unique `key` props in lists (especially the Transcript map).
2.  **Image Optimization:**
    -   Ensure we are using `next/image` where appropriate (though for this specific task, we mostly used CSS/SVGs which is good).
3.  **Unused Code:**
    -   Scan for unused imports or variables in `CallPlayerModal.tsx` and remove them.

### Phase 4: The Report
-   If you make fixes, document them in `audit_fixes.md`.
-   If everything is perfect, tell me "Launch Ready 🚀".

**GO! Start with Phase 1.**
```
