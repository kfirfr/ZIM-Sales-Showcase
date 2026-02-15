# 🛠 AntiGravity Debug & Polish Guide

> **The Situation:**
> 1.  **ElevenLabs:** The "Small White Thing" is the default minimized "Launcher" button. It ignores our container constraints. We need to **force it to fit** or give it a custom trigger.
> 2.  **Audio Demo:** "Nothing moves" because the default logic is too strict (hiding future words completely) and the `currentTime` sync needs a fallback.

---

## 🤖 Step 1: ElevenLabs "Embedded" Fix

> **The Problem:** The widget is designed to be a "Floating Button" by default, not an embedded card.
> **The Fix:** We will try to stylisticly force it, but more importantly, we will **Mask it** with a custom "Connect" button that looks futuristic.
> **Copy & Paste this to your Agent:**

```text
@/src/components/CallPlayerModal.tsx
I need to fix the ElevenLabs widget integration. It currently looks like a broken white button.

**1. Create a "Connect Layer":**
-   Wrap the `<elevenlabs-convai>` element in a `div` that is `absolute inset-0 opacity-0 pointer-events-auto z-50`.
-   **Why?** We want the user to *click* anywhere in the futuristic box to trigger the widget's interaction.
-   **Visuals:** Behind this invisible trigger, create a **"Waiting for Connection"** UI:
    -   A pulsing "Fingerprint" or "Network Icon" in the center.
    -   Text: "Initialize Neural Link" (or "Start Conversation").
    -   When the user clicks, the invisible widget captures the click and should open its interface (or at least focus).

**2. Enhance the Container:**
-   Ensure the container `div` has `relative overflow-hidden` to clip any weird overflow.

**3. Fallback (Critical):**
-   Add a text below the widget: *"If the agent doesn't load, please ensure your microphone permissions are active."*

Please replace `LiveView` with this "Custom Trigger" approach.
```

---

## 🎤 Step 2: Fix "Frozen" Demo & Transcript

> **The Problem:** The "Future Words" are invisible/blurred, and if the timestamp is slightly off, you see empty space.
> **The Fix:** Show future words as **dimmed** (not invisible) so the sentence is readable. Force the `AudioOrb` to pulse even when silent.
> **Copy & Paste this to your Agent:**

```text
@/src/components/CallPlayerModal.tsx @/src/components/ui/KaraokeText.tsx
I need to fix the "Frozen" UI in the Demo view.

**1. Fix KaraokeText Visibility (KaraokeText.tsx):**
-   Change the logic for "Future Words":
    -   **Current:** `text-white/10 blur-[1px]` (Too hard to see!)
    -   **New:** `text-slate-600 opacity-60` (Visible but inactive).
-   **Remove** the `useMemo` dependency on `currentTime` if it's causing stale renders (or ensure it updates on every frame). Actually, **remove useMemo** entirely for now to guarantee render updates.

**2. Fix "Nothing Moves" (CallPlayerModal.tsx):**
-   **AudioOrb:** Pass `isActive={true}` (always active).
-   **Volume Calculation:**
    -   If `volumeLevel` is < 0.1, force it to `0.1` + a tiny sine wave oscillation `Math.sin(Date.now() / 1000) * 0.05`. This ensures it *always* breathes/pulses `alive`.
-   **Current Time Sync:**
    -   Add a `console.log(currentTime)` in the `animate` loop to verify updates.
    -   Ensure `mapTranscript` is correctly populating `words`.

**3. "Winning Design" Polish:**
-   Add a **"Spectrum Background"** behind the avatars. A simple row of `div` bars that animate height based on random values (simulated visuals).

Please implement these fixes to make the UI "Alive".
```
