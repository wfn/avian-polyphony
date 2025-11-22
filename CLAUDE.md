# xenogenesis instructions for Claude and similar LLM friends

## About this project

**xenogenesis** is a computational laboratory for exploring emergence and evolution across impossible substrates. It's a meta-framework containing multiple self-contained modules, each exploring different questions about what life could be if the rules were different.

**Current structure:**
- **`xenogenesis/`** (this repository) - Meta-project framework
  - **`avian-polyphony/`** - Module 1: Bird-like flocking agents with genetic evolution, procedural audio, and species nomenclature
  - **`docs/`** - Cross-module philosophy and roadmap
  - Future modules will be added as siblings to avian-polyphony

**Philosophy:** Inspired by Greg Egan's *Wang's Carpets*, we're building composable systems for exploring life-like emergence in substrates biology never tried—from flocking birds to high-dimensional alien cognition.

### avian-polyphony (Module 1)

Experimental 3D web app sandbox (runs as Single Page Application) exploring bird ecology, swarm dynamics, and evolution. Low poly 3D web app with procedural generation and agent systems modeling. Started as Google AI Studio quick vibe coding experiment using `gemini-3-pro-preview`.

**Design goals:**
- Fully functional when run locally
- Iteratively add optional (on/off) composable features/components/dynamics
- Aesthetically intuitive and self-contained (inspiration: Proteus video game)
- User given nuanced controls to adjust dynamical systems, UI, etc.

---

## LLM Developer Briefing (Working with the Roadmap)

**Context:** You're being asked to work on features from `docs/FUTURE_WORK.md`. This section helps you quickly understand the project state and effective development patterns.

### Current Project State (As of Nov 2025)

**What Works Now:**
- ✅ **Core simulation**: Boids flocking (separation/alignment/cohesion), lifecycle (birth/death), energy metabolism
- ✅ **Audio system**: Procedural vocalizations (3 call types: social/mating/territorial) via Tone.js
- ✅ **Local nomenclature**: Deterministic bird species generation (25 color families, 6 genus groups, Latin binomial names)
- ✅ **UI**: Dashboard mode, population controls, camera modes (Orbit/FPS/Follow), real-time stats, population charts
- ✅ **Evolution**: Asexual reproduction with mutation, trait inheritance (color, pitch, scale, melody)
- ✅ **Zero external dependencies**: Fully functional offline (Gemini API is optional fallback only)

**What's Missing (High Priority from Roadmap):**
- ❌ **Testing infrastructure**: No unit/integration/E2E tests yet
- ❌ **Genotype/phenotype separation**: Traits are directly inherited, no hidden genetic layer
- ❌ **Sexual reproduction**: Only asexual currently
- ❌ **Modular behavior system**: No plugin architecture for behaviors yet
- ❌ **UI layout flexibility**: Dashboard is good but components can still overlap/hide

### Architecture Patterns to Follow

**Performance Pattern (Critical):**
```
React State (UI updates) ⊥ Ref Loop (60 FPS physics)
```
- **Use `useRef` + mutable objects** for anything updated per-frame (bird positions, velocities)
- **Use React `useState`** only for UI changes (selected bird, panel visibility, settings)
- **Sync ref → state** only when topology changes (bird count, new selections)
- See: `components/World.tsx` and `components/Bird.tsx` for examples

**Service Pattern:**
```
services/
├── audioEngine.ts      # Singleton for Tone.js (only one AudioContext)
├── birdNomenclature.ts # Pure functions, deterministic, no side effects
└── geminiService.ts    # Async with graceful fallback
```

**Data Flow:**
```
World.tsx (source of truth)
  ├─> flockRef: BirdData[] (mutable, 60 FPS updates)
  ├─> flockState: BirdData[] (React state, synced when count changes)
  └─> Stats/Charts (computed from ref, published periodically)
```

**Key Technical Decisions:**
- **Float → Int conversion required**: All array indices MUST use `Math.floor()` on floating-point values (pitch, scale, etc.)
- **Deterministic generation**: Same bird traits → same species name (via hash-based selection)
- **HTML rendering**: Bird descriptions use `dangerouslySetInnerHTML` for styled text (colored spans)
- **TypeScript**: Strict types, all interfaces in `types.ts`

### Working with `avian-polyphony/docs/FUTURE_WORK.md`

**Structure:**
- 11 major domains (Testing, UI, Graphics, Audio, Ecology, Behavior, Data, State, Games, Infrastructure, Other)
- Each feature has: **Priority** (High/Medium/Low) | **Complexity** (Low/Medium/High/Very High)
- Dependencies marked explicitly (e.g., "Sexual reproduction requires genotype system")

**When User Requests Feature Development:**

1. **Check roadmap first**: Reference `avian-polyphony/docs/FUTURE_WORK.md` section number
2. **Verify dependencies**: Does it need genotype system? Behavior trees? Testing infrastructure?
3. **Propose implementation plan**:
   - Break into phases if complex
   - Identify which files to modify (`avian-polyphony/components/`, `avian-polyphony/services/`, `avian-polyphony/types.ts`)
   - List tests to write (even if test infrastructure doesn't exist yet - note what SHOULD be tested)
   - Consider performance implications (Will this run 60 FPS for 100+ birds?)

4. **Follow composability principle**:
   - New features MUST be toggle-able (on/off at runtime if possible)
   - Add UI controls in appropriate panel (Flight/Evolution/Species/Dashboard)
   - Update `avian-polyphony/types.ts` with new settings interfaces
   - Preserve determinism if relevant (same seed → same outcome)

5. **Update docs after implementation**:
   - `avian-polyphony/docs/ARCHITECTURE.md` if architecture changed
   - `avian-polyphony/docs/DESCRIPTION.md` if user-facing features added
   - `avian-polyphony/docs/FUTURE_WORK.md` if implementation revealed new considerations
   - `docs/philosophy.md` if insights apply to meta-project vision

**When User Requests Roadmap Discussion/Refinement:**

1. **Ask clarifying questions**:
   - Primary audience? (Scientists / Artists / Educators / General public)
   - Performance targets? (How many birds? Target FPS?)
   - Artistic vs scientific balance? (Proteus-like beauty vs rigorous modeling)
   - Timeline? (Quick prototype vs long-term project)

2. **Provide critical analysis**:
   - Identify dependencies and ordering constraints
   - Flag complexity/scope creep risks
   - Suggest MVP vs full-featured approaches
   - Propose alternative implementations (simpler/faster)

3. **Be specific about tradeoffs**:
   - "Neural networks sound cool but: performance cost, training time, interpretability challenges"
   - "Genotype system enables speciation BUT requires significant refactoring and adds complexity"

### Testing Expectations

**Current State:** No test infrastructure exists yet.

**When Implementing Features:**
- **Note what SHOULD be tested** even if tests aren't written yet
- **Write pure, testable functions** when possible (see `avian-polyphony/services/birdNomenclature.ts` as example)
- **Avoid side effects**: Separate computation from rendering/mutation

**When User Asks for Tests (Section 1 of Roadmap):**
- Start with **unit tests** for pure functions (nomenclature, color classification, boids math)
- Then **integration tests** (service interactions)
- Finally **E2E tests** with Playwright (user journeys)
- Tests should live in module directories (e.g., `avian-polyphony/tests/`)

### Key Files Reference

**Meta-Project:**
- `README.md` - xenogenesis vision and philosophy
- `docs/philosophy.md` - Influences, computational substrates, Wang's Carpets
- `CLAUDE.md` - This file (LLM developer briefing)

**avian-polyphony Module:**

**Core Simulation:**
- `avian-polyphony/components/World.tsx` - Main simulation loop, evolution, population management
- `avian-polyphony/components/Bird.tsx` - Individual bird agent (boids, state machine, audio triggers)
- `avian-polyphony/types.ts` - All TypeScript interfaces and enums
- `avian-polyphony/constants.ts` - Tunable parameters (speeds, colors, world size)

**Services:**
- `avian-polyphony/services/birdNomenclature.ts` - Local species generation (highly deterministic)
- `avian-polyphony/services/audioEngine.ts` - Tone.js wrapper (singleton pattern)
- `avian-polyphony/services/geminiService.ts` - Optional LLM integration

**UI:**
- `avian-polyphony/App.tsx` - UI orchestration, settings panels, dashboard mode
- `avian-polyphony/components/PopulationChart.tsx` - SVG data visualization

### Development Workflow

1. **Read relevant code first**: Use Read tool to understand existing patterns
2. **Propose before implementing**: Outline plan for user approval
3. **Test as you go**: Run `cd avian-polyphony && npm run dev`, check browser console for errors
4. **Commit often**: Use git for incremental progress
5. **Update docs**: Keep module docs (avian-polyphony/docs/) and meta docs (docs/) in sync

### Common Pitfalls to Avoid

❌ **Don't use floats as array indices** - Always `Math.floor()` first
❌ **Don't trigger React re-renders in useFrame loops** - Use refs for per-frame updates
❌ **Don't make features dependent on external APIs** - Local-first always
❌ **Don't over-engineer** - Add only what's requested, keep it simple
❌ **Don't skip console logging for complex features** - Debug info is helpful
❌ **Don't forget fallback values** - Always handle undefined/null cases

### Red Flags / Ask User First

- **Large architectural changes** (ECS, Redux, behavior trees) - Discuss first
- **Performance-intensive features** (neural networks, thousands of birds) - Verify requirements
- **Game-like mechanics** (objectives, scoring) - May not align with artistic vision
- **Breaking changes** (file structure refactor) - Get explicit approval

### Creativity Welcome

The user values:
- **Ideas and creativity** for new features/approaches
- **Critical assessment** of proposed features
- **Suggestions for improvements** to existing systems
- **Identifying better patterns** or refactoring opportunities
- **Pushing boundaries** of ecological simulation + generative art

Don't just implement - think, question, propose alternatives!

---

## Documentation

**Meta-project documentation:**
- `README.md` - xenogenesis vision, philosophy, current modules
- `docs/philosophy.md` - Detailed influences, computational substrates, open questions
- `docs/ROADMAP.md` - (Future) Cross-module development roadmap

**avian-polyphony module documentation:**
- `avian-polyphony/README.md` - Module-specific intro, screenshots, quick start
- `avian-polyphony/docs/DESCRIPTION.md` - Product/feature description
- `avian-polyphony/docs/ARCHITECTURE.md` - Technical architecture
- `avian-polyphony/docs/FUTURE_WORK.md` - Comprehensive feature analysis (11 domains)
- `avian-polyphony/docs/DEVELOPMENT_ROADMAP.md` - Visual guide with Mermaid diagrams

Please:
 - refer to this documentation as needed
 - keep it up to date as well
 - update meta docs when changes affect the overall framework
 - update module docs when changes are module-specific

## Build & Deploy locally (avian-polyphony)
 - Navigate to module: `cd avian-polyphony`
 - Serve locally: `npm run dev`
 - App should be reachable at http://localhost:3000/
 - Local deployment needs to always work
 - My experience is as a backend developer, so recommend (and make decisions as needed) deployment/pipeline improvements when prudent

## Project Structure
 - See `avian-polyphony/docs/ARCHITECTURE.md` for module architecture
 - See `docs/philosophy.md` for meta-project philosophy
 - If you deem it prudent, refine and add notes here or to appropriate docs

## Style Guidelines
 - as a developer I try my best to avoid too much frontend, so adopt whatever style you deem best, and be consistent above everything
 - update and add new Markdown docs when needed

## Deployment & External Dependencies

**Meta-project principle:** All modules must be **local-first** and fully functional offline.

**avian-polyphony specific:**
 - Builds and runs locally: `cd avian-polyphony && npm run dev`
 - **Zero required external dependencies**: Fully functional without API keys
 - Has optional Gemini API integration for bird nomenclature (falls back to local generation)
 - ✅ **Current status**: Bird nomenclature feature fully functional offline with local generation

**General rules for all modules (current and future):**
 - Any external API/service dependencies MUST be optional and "fail gracefully"
 - Rest of module must work without them (e.g., if API key is not defined, this should not cause any issues)
 - UI and UX must behave robustly when optional features are unavailable
 - Ideally, all optional features should have local equivalents
 - For future deployment to VPS or PaaS, keep this constraint in mind

**Vision note:**
The goal is a computational laboratory for exploring emergence and evolution across different substrates—aesthetics AND scientific-method-aspiring modeling tools in one, with rapid feedback loops. Each module explores different questions about what life could be. **IDEAS AND CREATIVITY ARE HIGHLY APPRECIATED AND WELCOMED!**

## Anything else

Again, edit / expand / refine / summarize here as needed. Contract even if that makes sense as well; add new sections; etc.

## Thanks Claude

You're pretty cool!
