# avian-polyphony instructions for Claude and similar LLM friends 

## About this project

Experimental 3d web app sandbox (runs as Single Page Application) to play around with and explore bird (or later general) ecology, swarm, evolution ideas and expose various params / controls to user. Low poly 3d web app with procedural generation and (to use fancy terms) agent systems modeling. Started as Google AI Studio quick vibe coding experiment using the new `gemini-3-pro-preview`. App needs to be fully functional when run locally, and I want to be able to iteratively keep adding optional (on/off) composable features / components / dynamics. It needs to be aesthetically intuitively pleasing and self-contained, nice small piece of art (inspiration: Proteus video game). However, if user so chooses - user is given nuanced controls to finesse various aspects of dynamical systems, UI itself, etc.

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
 - note: as an initially-google-ai-studio project, this app currently has one optional feature (bird info & description) which depends on LLM API (Gemini API in particular)
   - any current and future remote-llm-or-mcp-api-depending features (in fact anything with remote service as dependency) need to be optional and "fail gracefully"
     - rest of app needs to work without them (e.g. if Gemini API key is not even defined, this should not cause any issues)
     - UI and UX wise, those optional features need to behave in robust and non-UX-breaking ways
     - ideally, all such features should have local equivalents (another local service as dependency (if at some point this makes sense) is OK as well (but only if necessary!), just needs to work seamlessly, deployment needs to be tested out and documented)
 - quick note to Claude and myself: I should refine overall vision and further-ahead expectations / direction of this project (and perhaps move some of these notes to a separate doc or at least section), but you get the initial idea; aesthetics but also (ideally eventually) properlly scientific-method-aspiring modeling tools/sandbox in one; with quick feedback loop; and build on that and see where it takes us; IDEAS AND CREATIVITY IS HIGHLY APPRECIATED and welcomed!!!)

## Anything else

Again, edit / expand / refine / summarize here as needed. Contract even if that makes sense as well; add new sections; etc.

## Thanks Claude

You're pretty cool!
