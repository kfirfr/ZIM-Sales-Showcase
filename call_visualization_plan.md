# 📞 Project: Hyper-Immersive Call Visualization
> **Goal:** Create a cinematic, ElevenLabs-style full-screen experience for playback of call recordings with synchronized transcription and dynamic audio visualization.

## 1. Technology Strategy & Stack
We will use a **Live-Rendered React Architecture** rather than pre-rendered video. This ensures:
- **Crispness:** Infinite resolution text/vectors on any screen.
- **Interactivity:** User can pause, scrub, and copy text instantly.
- **Performance:** No heavy video file download; just a lightweight MP3 + JSON.

### Additional Dependencies
We need to add these precise libraries to `package.json`:
- **`howler`**: For rock-solid audio playback control across browsers.
- **`framer-motion`**: Already installed! We will use it extensively for layout transitions and the "Orb" animation.
- **`zustand`** (Optional but recommended): For managing the complex playback state (current time, play/pause, volume) if it gets messy, but `useContext` might suffice for this isolated feature.

---

## 2. Design Vision (UI/UX Pro Max)
*Inspiration: ElevenLabs / OpenAI Voice Mode / Sci-Fi Interfaces*

### Visual Elements
1.  **The Stage (Modal):**
    -   Full-screen `fixed` overlay.
    -   Backdrop: `bg-slate-950/95` with `backdrop-blur-xl`.
    -   Entry Animation: Expanding *from* the trigger button using `layoutId` for a seamless "morphing" effect.

2.  **The "Agent" (Visualizer):**
    -   Not just a waveform. A **Living Orb**.
    -   **Idle State:** A breathing, rotating mesh of concentric rings (Cyan/Emerald gradients).
    -   **Speaking State:** The rings expand/contract rapidly based on audio frequency data.
    -   **Technique:** We will use the **Web Audio API** `AnalyserNode` connected to a canvas or mapped to Framer Motion values to drive the scale/opacity of the rings in real-time.

3.  **The Transcript (Dynamic Stream):**
    -   **Karaoke Style:** Current word/sentence highlights in bright white (`text-white`), future words are dimmed (`text-slate-500`).
    -   **Auto-Scroll:** The container smoothly centers the active sentence.

---

## 3. Asset Preparation (Prerequisites)
Before coding, you (or the agent team) need to prepare:

1.  **Audio File:** `call_recording.mp3` (Place in `/public/assets/audio/`)
2.  **Transcript JSON:** `call_transcript.json` with timestamp mappings.
    *Format:*
    ```json
    [
      { "start": 0.5, "end": 2.1, "speaker": "agent", "text": "Hello, this is Sarah from Genesys." },
      { "start": 2.5, "end": 4.0, "speaker": "user", "text": "Hi Sarah, I'm calling about my order." }
    ]
    ```

---

## 4. Implementation Steps

### Phase 1: The visualizer Engine (`AudioOrb.tsx`)
Create a component that connects to an audio source and renders the animation.
-   **Audio Context Setup:** Create an `AudioContext` and `AnalyserNode`.
-   **Data Hook:** `useAudioFrequency()` hook that returns a frequency array (0-255).
-   **Render Loop:** `requestAnimationFrame` to update the visual state.
-   **Visuals:** Use 3-5 `motion.div` circles. Bind their `scale` and `opacity` to the frequency data (e.g., bass frequencies control outer ring, treble controls inner core).

### Phase 2: The Player Logic (`CallPlayerContext.tsx`)
A provider to manage the logic:
-   `play()`, `pause()`, `seek(time)`.
-   `currentTime`: Precise state updated every 100ms (or via `requestAnimationFrame` for smoothness).
-   `currentLine`: Derived from `currentTime` vs `transcript.json`.

### Phase 3: The Transcript Component (`TranscriptStream.tsx`)
-   Map through the JSON.
-   **Active State:** If `currentTime` is within `start` and `end`, apply `scale-105` and `text-white` class.
-   **Scroll:** Use `useEffect` to scroll the active element into view with `{ behavior: 'smooth', block: 'center' }`.

### Phase 4: The Full-Screen Orchestrator (`CallVisualizationModal.tsx`)
-   Compose the `AudioOrb` (Left side or Top) and `TranscriptStream` (Right side or Bottom).
-   Add "Glass" controls: Play/Pause button, Scrubber progress bar.
-   **Close Interaction:** A clean "X" button that shrinks the modal back into the origin button.

### Phase 5: Integration
-   Edit `SummaryBox.tsx` (or `ProactiveEngagementBox.tsx`).
-   Add a **"Play Recording"** button with a "Cinema" icon.
-   On click, mount the `CallVisualizationModal`.

---

## 5. "Wow" Factors (Bonus)
-   **Sentiment Glow:** Change the Orb color based on sentiment? (Red for anger, Green for happy). *Requires sentiment metadata in JSON.*
-   **Particle Dust:** Add floating particles in the background (`Check the existing ParticleText.tsx or similar`).
-   **Glitch Effect:** A subtle digital glitch on the text when the speaker changes.

## 6. Execution Order (For your Agents)
1.  **Prompt 1:** "Scaffold the `call_transcript.json` and install `howler`."
2.  **Prompt 2:** "Create the `AudioOrb` component using Framer Motion and Web Audio API mock data."
3.  **Prompt 3:** "Build the `CallVisualizationModal` structure and integrate `howler` for actual playback."
4.  **Prompt 4:** "Implement the `TranscriptStream` with auto-scrolling synchronization."
5.  **Prompt 5:** "Final Polish: Add animations, blur effects, and integrate into the main UI."

start building! 🚀
