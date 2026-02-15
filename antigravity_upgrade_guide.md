# 🚀 AntiGravity Upgrade Guide: Call Visualization v2

> **What is this?**
> Since you already have the foundation (`CallPlayerModal`, `AudioOrb`, etc.), this guide focuses on **editing** your existing code to add the new "Full Screen" and "ElevenLabs" features.
>
> **The Strategy:**
> 1.  **Portal Upgrade:** Break the modal out of the simulation box using `createPortal`.
> 2.  **Menu Architecture:** Convert the Modal into a "Router" that can show the Menu, the Demo, or the Live Agent.
> 3.  **Integration:** Update the trigger button.

---

## 🛠 Step 1: The "Portal" & "Menu" Refactor (The Big One)

> **Goal:** We will completely rewrite `CallPlayerModal.tsx` to use Portals (fixing the layout issue) and handle the new "Choice" state.
> **Copy & Paste this into your agent:**

```text
@/src/components/CallPlayerModal.tsx
I need to upgrade `CallPlayerModal.tsx` to be a true full-screen experience and add a "Choice" menu.

**1. Portal Implementation:**
Wrap the entire return statement in `ReactDOM.createPortal(..., document.body)`.
*Note: You'll need to strictly handle "Client Side" checking (useEffect to set a mounted flag) to avoid hydration errors with Portals.*

**2. State Machine:**
Replace the simple `isOpen` logic with a View State:
`type ViewState = 'MENU' | 'DEMO' | 'LIVE';`
`const [view, setView] = useState<ViewState>('MENU');`

**3. The 'MENU' View:**
If `view === 'MENU'`, show a cinematic centered selection screen with 2 large cards:
-   **Card 1:** "Play Recorded Demo" -> Sets `view = 'DEMO'`.
-   **Card 2:** "Talk to Agent (Live)" -> Sets `view = 'LIVE'`.
-   *Style:* Large hoverable cards, glassmorphism, beautiful icons.

**4. The 'DEMO' View:**
This renders the *existing* Audio/Transcript player code you already wrote. Just wrap it in a `view === 'DEMO'` check.
*Add a "Back to Menu" button in the header.*

**5. The 'LIVE' View:**
Render the ElevenLabs Widget here.
-   Render: `<elevenlabs-convai agent-id="agent_5901khehzx57esxahpydfjr8wnpd"></elevenlabs-convai>`
-   Inject Script: Use a `useEffect` to append the script `https://unpkg.com/@elevenlabs/convai-widget-embed` if not already present.
-   *Add a "Back to Menu" button.*

**Refactor `CallPlayerModal.tsx` to implement this Portal + 3-View architecture.**
```

---

## 💅 Step 2: Update the Trigger (SummaryBox)

> **Goal:** Update the button text and icon to reflect the broader scope.
> **Copy & Paste this:**

```text
@/src/components/SummaryBox.tsx
Update the "Play Recording" button inside `PostMeetingAutopilotBox`.

1.  Change the text to **"Experience Voice AI"**.
2.  Change the icon to a `Sparkles` or `Zap` icon (from Lucide).
3.  Ensure it still opens the `CallPlayerModal` (which now defaults to the Menu).
```

---

## 🧩 Step 3: TypeScript Polish (If needed)

> **Goal:** Fix any "JSX element type 'elevenlabs-convai' does not exist" errors.
> **Copy & Paste this (only if you see TS errors):**

```text
@/src/types/global.d.ts
Size: Create this file if it doesn't exist.
Content:
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                'agent-id'?: string;
            };
        }
    }
}
```
