# TL;DR

Actionable guidance & focus for machines *and* humans: read through section [LLM Developer Briefing (Working with the Roadmap)](#llm-developer-briefing-working-with-the-roadmap). This is the most important section for loading up context quickly. As a side note, be aware that humans leading development make heavy use of (and attempt to maintain) [DEVELOPMENT_ROADMAP](./docs/DEVELOPMENT_ROADMAP.md). As either humans or machines, you are genuinely heavily encouraged to ask as many complex questions as necessary; express confusion; challenge ideas wherever that makes sense. End of TL;DR.

# avian-polyphony instructions for Claude and similar LLM friends 

## About this project

Experimental 3d web app sandbox (runs as Single Page Application) to play around with and explore bird (or later general) ecology, swarm, evolution ideas and expose various params / controls to user. Low poly 3d web app with procedural generation and (to use fancy terms) agent systems modeling. Started as Google AI Studio quick vibe coding experiment using the new `gemini-3-pro-preview`. App needs to be fully functional when run locally, and I want to be able to iteratively keep adding optional (on/off) composable features / components / dynamics. It needs to be aesthetically intuitively pleasing and self-contained, nice small piece of art (inspiration: Proteus video game). However, if user so chooses - user is given nuanced controls to finesse various aspects of dynamical systems, UI itself, etc.

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

### Working with `docs/FUTURE_WORK.md`

**Structure:**
- 11 major domains (Testing, UI, Graphics, Audio, Ecology, Behavior, Data, State, Games, Infrastructure, Other)
- Each feature has: **Priority** (High/Medium/Low) | **Complexity** (Low/Medium/High/Very High)
- Dependencies marked explicitly (e.g., "Sexual reproduction requires genotype system")

**When User Requests Feature Development:**

1. **Check roadmap first**: Reference `docs/FUTURE_WORK.md` section number
2. **Verify dependencies**: Does it need genotype system? Behavior trees? Testing infrastructure?
3. **Propose implementation plan**:
   - Break into phases if complex
   - Identify which files to modify (`components/`, `services/`, `types.ts`)
   - List tests to write (even if test infrastructure doesn't exist yet - note what SHOULD be tested)
   - Consider performance implications (Will this run 60 FPS for 100+ birds?)

4. **Follow composability principle**:
   - New features MUST be toggle-able (on/off at runtime if possible)
   - Add UI controls in appropriate panel (Flight/Evolution/Species/Dashboard)
   - Update `types.ts` with new settings interfaces
   - Preserve determinism if relevant (same seed → same outcome)

5. **Update docs after implementation**:
   - `docs/ARCHITECTURE.md` if architecture changed
   - `docs/DESCRIPTION.md` if user-facing features added
   - `docs/FUTURE_WORK.md` if implementation revealed new considerations

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
- **Write pure, testable functions** when possible (see `birdNomenclature.ts` as example)
- **Avoid side effects**: Separate computation from rendering/mutation

**When User Asks for Tests (Section 1 of Roadmap):**
- Start with **unit tests** for pure functions (nomenclature, color classification, boids math)
- Then **integration tests** (service interactions)
- Finally **E2E tests** with Playwright (user journeys)
- Preserve existing inline test examples (e.g., `test-nomenclature.ts` pattern)

### Key Files Reference

**Core Simulation:**
- `components/World.tsx` - Main simulation loop, evolution, population management
- `components/Bird.tsx` - Individual bird agent (boids, state machine, audio triggers)
- `types.ts` - All TypeScript interfaces and enums
- `constants.ts` - Tunable parameters (speeds, colors, world size)

**Services:**
- `services/birdNomenclature.ts` - Local species generation (highly deterministic)
- `services/audioEngine.ts` - Tone.js wrapper (singleton pattern)
- `services/geminiService.ts` - Optional LLM integration

**UI:**
- `App.tsx` - UI orchestration, settings panels, dashboard mode
- `components/PopulationChart.tsx` - SVG data visualization

### Development Workflow

1. **Read relevant code first**: Use Read tool to understand existing patterns
2. **Propose before implementing**: Outline plan for user approval
3. **Test as you go**: Run `npm run dev`, check browser console for errors
4. **Commit often**: Use git for incremental progress
5. **Update docs**: Keep ARCHITECTURE.md and DESCRIPTION.md in sync

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

"Product" point-of-view description as well as technical documentation is under directory `docs/`.

Please:
 - refer to this documentation as needed
 - keep it up to date as well

## Build & Deploy locally
 - serve locally with: `npm run dev`
 - app should be reachable at http://localhost:3000/
 - local deployment needs to always work
 - my experience is as a backend developer, so recommend (and make decisions as needed) deployment/pipeline improvements when prudent

## Project Structure
 - again see `docs/ARCHITECTURE.md`, but also if you deem it prudent, refine and add notes here
 - in general, add notes to this file if this is deemed a good idea

## Style Guidelines
 - as a developer I try my best to avoid too much frontend, so adopt whatever style you deem best, and be consistent above everything
 - update and add new Markdown docs when needed

## Deployment
 - for context, some time in the future I may want to deploy this to a VPS or some PaaS, so keep that in mind
 - but for now important thing is that it builds and runs locally
 - note: as an initially-google-ai-studio project, this app has a bird species nomenclature feature that can optionally use Gemini API for LLM-generated descriptions
   - **Local-first design**: The app now has a fully-functional local procedural nomenclature system that generates bird names and descriptions without any API dependencies
   - When Gemini API key is available, it can optionally provide more creative/varied descriptions
   - When API key is not available or API calls fail, the app seamlessly falls back to local generation
   - any current and future remote-llm-or-mcp-api-depending features (in fact anything with remote service as dependency) need to be optional and "fail gracefully"
     - rest of app needs to work without them (e.g. if Gemini API key is not even defined, this should not cause any issues)
     - UI and UX wise, those optional features need to behave in robust and non-UX-breaking ways
     - ideally, all such features should have local equivalents (another local service as dependency (if at some point this makes sense) is OK as well (but only if necessary!), just needs to work seamlessly, deployment needs to be tested out and documented)
   - ✅ **Current status**: Bird nomenclature feature fully functional offline with local generation
 - quick note to Claude and myself: I should refine overall vision and further-ahead expectations / direction of this project (and perhaps move some of these notes to a separate doc or at least section), but you get the initial idea; aesthetics but also (ideally eventually) properlly scientific-method-aspiring modeling tools/sandbox in one; with quick feedback loop; and build on that and see where it takes us; IDEAS AND CREATIVITY IS HIGHLY APPRECIATED and welcomed!!!)

## Anything else

Again, edit / expand / refine / summarize here as needed. Contract even if that makes sense as well; add new sections; etc.

## Thanks Claude

You're pretty cool!
