# 🛠 AntiGravity Fix & Polish Guide: The "True" Cinematic Experience

> **The Mission:**
> 1.  **ElevenLabs Fix:** Make the widget load reliably and look integrated. (Already Implemented ✅)
> 2.  **True Cinematic Karaoke:** Use the **real word-level timestamps** from your JSON to create a perfect synchronization.
> 3.  **Fix Controls & UI:** Robust seeking and a futuristic layout without "chat bubbles".

---

## 🎤 Step 2: The "True" Karaoke Engine (Real Timestamps)

> **The Logic:** You have exact word timings! We will upgrade the `TranscriptLine` interface and the mapping function to use them.
> **Copy & Paste this to your Agent:**

```text
@/src/types/CallTranscript.ts @/src/components/CallPlayerModal.tsx
I need to upgrade the transcript system to support true word-level karaoke.

**1. Update Types:**
-   In `src/types/CallTranscript.ts`, update `TranscriptLine` to include:
    ```typescript
    words: { text: string; start: number; end: number }[];
    ```

**2. Update Mapping:**
-   In `CallPlayerModal.tsx`, update `mapTranscript` to map the `words` array from the JSON:
    ```typescript
    words: seg.words.map((w: any) => ({
        text: w.text,
        start: w.start_time,
        end: w.end_time
    }))
    ```

**3. Create <KaraokeText /> Component:**
-   Create `src/components/ui/KaraokeText.tsx`.
-   **Props:** `words` (the array), `currentTime` (number), `isAgent` (boolean).
-   **Logic:**
    -   Render the sentence as a flex-wrap container of words.
    -   **Style:** Large, cinematic font (text-2xl or 3xl). Center aligned.
    -   **karaoke Logic:**
        -   Iterate through words.
        -   If `currentTime >= word.start`: Text is `text-white` (or `text-cyan-400` for Agent).
        -   If `currentTime < word.start`: Text is `text-white/20` (dimmed) or `opacity-0` (invisible), creating a "reveal" effect.
        -   **Motion:** Wrap the *current* word (where `currentTime` is between start/end) in a `<motion.span>` that scales up slightly (1.1) and glows.

Please implement these 3 changes.
```

---

## 🎬 Step 3: Cinematic Layout & Robust Controls

> **The Design:** Remove the "Chat Bubbles". Focus on the "Connection".
> **The Controls:** Seeking needs to pause updates to prevent "fighting".
> **Copy & Paste this to your Agent:**

```text
@/src/components/CallPlayerModal.tsx
Refactor the `DEMO` view in `CallPlayerModal.tsx` to use a "Cinematic" layout and fix the controls.

**1. The "Holographic" Layout:**
-   **Remove:** The scrollable vertical list of chat bubbles.
-   **Add:** A fixed, central "Stage".
    -   **Top:** Two Large Avatars (Agent vs User) connected by a subtle animated line.
        -   **Agent (Left):** Connects to `<AudioOrb />`. Pulses when speaking.
        -   **User (Right):** A simple avatar that glows when they speak.
    -   **Center:** The `<KaraokeText />` component showing *only* the current active sentence.
    -   **Transition:** unexpected silence? Show "..." or a subtle waveform.

**2. Controls Fix (Critical):**
-   **Seeking State:** Add a state `isSeeking` (boolean).
-   **Logic:**
    -   `onInput` (Slider Drag): Set `isSeeking(true)`, update `currentTime`. **Do NOT** seek Howl yet (too expensive).
    -   `onChange` (Slider Release): Set `isSeeking(false)`, **THEN** `soundRef.current.seek(value)`.
    -   **Animation Loop:** In `requestAnimationFrame`, ONLY update `currentTime` if `!isSeeking`. This prevents the slider from "fighting" the audio.
-   **Buttons:** Ensure Play/Pause toggles correctly.

**3. Auto-Progress:**
-   Since we show only *one* sentence at a time, ensure we always display the sentence corresponding to `currentTime`.

Please overhaul the `DEMO` view with this layout and control logic.
```
