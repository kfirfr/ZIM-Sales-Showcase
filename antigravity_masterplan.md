# 🚀 AntiGravity Masterplan: The Immersive Call Visualization v2

> **What is this?**
> This is your **execution guide**. You don't need to write code. You just need to **copy and paste** these prompts into your AI agent (Cursor, Windsurf, or AntiGravity) one by one.
>
> **The Strategy (v2 Updates):**
> 1.  **FULL SCREEN FIX:** Previous plan trapped the modal inside the simulation box. We will now use `React Portals` to guarantee it covers the entire viewport.
> 2.  **DUAL MODE:** Added a "Menu" screen to choose between "Play Demo" and "Let's Talk" (ElevenLabs).
> 3.  **ELEVENLABS:** Integration of the live conversational widget.

---

## 🛠 Phase 0: Preparation (Do this manually)

**1. Audio File**
   - Get your call recording (MP3).
   - Rename it to `call_recording.mp3`.
   - Place it in: `public/assets/audio/call_recording.mp3` (Create folder if needed).

**2. Transcript File**
   - Create a file at `src/data/call_transcript.json`.
   - Paste your transcript in this format (or use the tool to generate it):
   ```json
   [
     { "start": 0.5, "end": 2.1, "speaker": "agent", "text": "Hello, this is Sarah from Genesys." },
     { "start": 2.5, "end": 4.5, "speaker": "user", "text": "Hi Sarah, calling about the shipment." }
   ]
   ```

---

## 🤖 Phase 1: The Foundation (Prompt 1)

> **Goal:** Install dependencies and set up data structure.
> **Copy & Paste this:**

```text
@/package.json
I need to add audio capabilities to our project.
Please install 'howler' for reliable audio playback.
Run: `npm install howler @types/howler`

Then, create a TypeScript interface for our Call Transcript.
Create file: `src/types/CallTranscript.ts`
Content:
export interface TranscriptLine {
    start: number;
    end: number;
    speaker: 'agent' | 'user';
    text: string;
}

Finally, verify that `public/assets/audio/call_recording.mp3` and `src/data/call_transcript.json` exist. If not, create placeholder files.
```

---

## 🎨 Phase 2: The "ElevenLabs" Visualizer (Prompt 2)

> **Goal:** Create the mesmerizing "Orb" animation that reacts to audio.
> **Copy & Paste this:**

```text
@/src/components/ui/AudioOrb.tsx
I want to create a stunning, ElevenLabs-style audio visualizer component called `AudioOrb`.
It should not be a simple waveform, but a "living" circular entity.

**Requirements:**
1.  **Tech:** Use `framer-motion` for smooth animations.
2.  **Visuals:**
    -   A central core (Canvas or Div) that pulses.
    -   3-4 concentric rings that expand/contract based on a `volume` prop (0 to 1).
    -   **Colors:** Use a gradient of Cyan-500 to Blue-600.
    -   **Glow:** Heavy use of `box-shadow` to create a neon/holographic effect (e.g., `shadow-[0_0_50px_rgba(6,182,212,0.5)]`).
3.  **Props:**
    -   `isActive`: boolean (is audio playing?)
    -   `volume`: number (mock or real frequency data).

**Animation Details:**
-   **Idle:** Keep the rings slowly breathing (scale 0.9 to 1.1) even when `isActive` is false.
-   **Active:** React sharply to the `volume` prop.

Please implement this component in `src/components/ui/AudioOrb.tsx`.
```

---

## 🎬 Phase 3: The Full-Screen Experience (Prompt 3)

> **Goal:** Build the modal that overlays the *entire screen* via Portal, with a Menu selection.
> **Copy & Paste this:**

```text
@/src/components/CallExperienceModal.tsx
Now, let's build the main stage: `CallExperienceModal.tsx`.
**CRITICAL:** This must use `ReactDOM.createPortal` targeting `document.body` to ensure it covers the ENTIRE screen and escapes any parent containments (like `transform` properties on simulation boxes).

**Tech Stack:**
-   `howler` for audio.
-   `framer-motion` for transitions.
-   `lucide-react` for icons.

**State Machine:**
The modal has 3 internal views:
1.  `MENU`: Two big buttons centered on screen.
    -   **Button A:** "Play Recorded Demo" -> Go to `DEMO` view.
    -   **Button B:** "Let's Talk (Live)" -> Go to `LIVE` view.
2.  `DEMO`: The Audio Visualizer + Transcript Player (from previous plan).
3.  `LIVE`: Embeds the ElevenLabs widget.

**Implementation Details:**
-   **Menu View:** Cinematic presentation. Large cards with hover effects.
-   **Demo View:** Load `call_recording.mp3`, sync with transcript JSON. Show `<AudioOrb />`.
-   **Live View:**
    -   Dynamically load script: `https://unpkg.com/@elevenlabs/convai-widget-embed`.
    -   Render: `<elevenlabs-convai agent-id="agent_5901khehzx57esxahpydfjr8wnpd"></elevenlabs-convai>`.
    -   Note: You may need to ignore TS errors for the custom element or declare it in `global.d.ts`.

**Layout:**
-   `fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md`.
-   Close button (X) always visible in top-right.

Please implement the full `CallExperienceModal` component using `createPortal`.
```

---

## 🔗 Phase 4: Integration (Prompt 4)

> **Goal:** Add the trigger button to `SummaryBox.tsx`.
> **Copy & Paste this:**

```text
@/src/components/SummaryBox.tsx
@/src/components/CallExperienceModal.tsx

I want to add a trigger to open our new `CallExperienceModal`.

1.  In `SummaryBox.tsx`, add a state: `const [isExperienceOpen, setIsExperienceOpen] = useState(false)`.
2.  Locate the header or control area.
3.  Add a new "Experience Voice AI" button:
    -   **Style:** Premium look (gradient border or glowing effect).
    -   **Icon:** `Sparkles` or `Headphones`.
    -   **Action:** Sets `setIsExperienceOpen(true)`.
4.  Render the `<CallExperienceModal />` when open.
    -   Pass `onClose={() => setIsExperienceOpen(false)}`.
    -   Since the modal uses a Portal, you can render it anywhere in the JSX tree, but preferably at the bottom.

Make these edits to `SummaryBox.tsx`.
```
