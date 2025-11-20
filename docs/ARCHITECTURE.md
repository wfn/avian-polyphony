# Avian Polyphony - Technical Architecture

## System Overview
The application is a Single Page Application (SPA) built with **React 19**. It utilizes **Three.js** (via `@react-three/fiber`) for 3D rendering and **Tone.js** for real-time audio synthesis. The simulation runs entirely client-side, with the exception of the AI analysis feature which calls the **Google Gemini API**.

## Tech Stack
*   **Frontend Framework:** React 19
*   **3D Engine:** Three.js / @react-three/fiber / @react-three/drei
*   **Audio Engine:** Tone.js
*   **AI SDK:** @google/genai
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript

## Architecture Patterns

### 1. The "Ref vs State" Pattern
To maintain 60 FPS with dozens of autonomous agents, the application separates React state (UI updates) from the Physics loop.
*   **React State:** Handles low-frequency updates: UI visibility, selected bird ID, total population stats, chart history, API data.
*   **Refs & Mutable Objects:** The bird positions, velocities, and immediate behaviors are stored in mutable objects (`BirdData`). The physics calculations happen inside `useFrame` loops (React Three Fiber's render loop) without triggering React re-renders. Visual meshes are updated directly via `ref.current.position`.

### 2. Component Structure
*   **`App.tsx` (Orchestrator):**
    *   Holds global UI state (Settings, View Mode, Selected Bird).
    *   **UI Layout Engine:** Handles the "Dashboard Mode" toggle, switching between floating popovers and a consolidated sidebar layout for controls.
    *   Manages the connection to `audioEngine` and `geminiService`.
    *   Renders the 2D UI overlays (Stats, Settings Panels, Charts).
    *   Contains the `Canvas` (via `World` wrapper).
*   **`World.tsx` (Simulation Container):**
    *   Manages the `flock` array (the source of truth for the simulation).
    *   **`FlockVisualizer`:** A dedicated sub-component that renders the flocking network. It uses `THREE.LineSegments` with a pre-allocated geometry buffer for high-performance rendering of dynamic connections between birds.
    *   Handles the **Evolution Loop** (Aging, Birth, Death, Energy calculation).
    *   Calculates global stats (Population, Flock counts) periodically.
    *   Renders the environment (Sky, Light, Trees).
*   **`Bird.tsx` (Agent Logic):**
    *   Each bird component runs its own logic inside `useFrame`.
    *   **Boids Algorithm:** Calculates alignment, cohesion, and separation forces against neighbors.
    *   **State Machine:** Switches between Flying, Foraging, Singing, Idle.
    *   **Audio Trigger:** Calls `audioEngine.playCall()` based on probabilistic timers.
    *   **Visuals:** Updates mesh position, rotation, and "singing ring" visualizers.
    *   **Trail Rendering:** Uses `@react-three/drei`'s `Trail` component to visualize movement history and energy levels.

### 3. Services

#### `audioEngine.ts` (Singleton)
*   Wraps `Tone.js`.
*   Initializes a `PolySynth`, `Reverb`, and `FeedbackDelay`.
*   Exposes a simple `playCall(pitch, melody, type)` method that the Birds call.
*   Uses a Singleton pattern to ensure only one AudioContext exists.

#### `geminiService.ts`
*   Stateless function export.
*   Constructs a prompt based on the `BirdData` object.
*   Calls `ai.models.generateContent` with a JSON schema to ensure structured output for the UI.

#### `PopulationChart.tsx`
*   A pure SVG visualizer.
*   Receives a history buffer from `App.tsx`.
*   Auto-scales Y-axis based on min/max values in the buffer.

## File Manifest

| File | Responsibility |
|Data | --- |
| `index.tsx` | Entry point. |
| `App.tsx` | Main UI layout, state management, API integration. |
| `constants.ts` | Simulation constants (Speed, World Size, Colors). |
| `types.ts` | TypeScript interfaces (`BirdData`, `SimSettings`, Enums). |
| **Components** | |
| `components/World.tsx` | 3D Scene setup, Evolution loop, Camera Logic, Flock Visualizer. |
| `components/Bird.tsx` | Boids physics, Agent behavior, Audio triggers, Trail. |
| `components/Tree.tsx` | Static environmental assets. |
| `components/Player.tsx` | First-person control logic (PointerLock). |
| `components/PopulationChart.tsx` | SVG Data visualization. |
| **Services** | |
| `services/audioEngine.ts` | Tone.js synthesizer and effects chain. |
| `services/geminiService.ts` | Google GenAI SDK implementation. |

## Data Flow
1.  **Initialization:** `World` generates initial `BirdData[]` array.
2.  **Frame Loop (Physics):**
    *   `Bird` components read neighbors from `flockRef`.
    *   `Bird` updates its own mutable position/velocity.
    *   `Bird` updates its Mesh ref directly.
3.  **Frame Loop (Evolution):**
    *   `World` iterates over `flockRef`.
    *   Updates Age/Energy.
    *   Handles Birth (adds to ref) and Death (filters ref).
    *   Syncs `ref` to `state` only when topology (count) changes.
4.  **User Interaction:**
    *   User clicks UI -> Updates `App` state -> Propagates to `World` props -> Affects simulation logic.