# 🧹 AntiGravity Cleanup: "Safe Removal"

> **Purpose:** Use this prompt to completely and safely remove the Container Animation (`CardStream`) from the footer.
> **Why:** The assets are currently causing sizing issues that detract from the premium feel of the rest of the site.

---

## 🗑️ The Removal Prompt

**Copy & Paste this to the Agent:**

```markdown
@/src/components/VisionaryFooter.tsx

I have decided to **Remove the Container Animation (CardStream)** from the footer to keep the design clean and focused.

**Required Actions:**
1. **Clean up VisionaryFooter.tsx:**
   - Remove the `dynamic` import for `CardStream` (lines 6-9).
   - Remove the `<CardStream />` component and its wrapper `div` (lines 36-38).
   - Adjust the `pt-32` on the `footer` (line 23) if the section feels too empty now, or keep it for breathing room.
2. **Safety:** Do NOT remove the "Kfir Frank" signature or the "The Future is a Choice" quote.
3. **Delete Files (Optional but Recommended):** 
   - Delete `src/components/CardStream.tsx` and `src/components/CardStream.css`.
   - Delete any temporary audit/fix guides like `antigravity_fix_v12.md`, `v13.md`, `v14.md`.

**Execute this to leave the footer clean, professional, and minimal.**
```
