# Avian Polyphony - Product Description

## Overview
Avian Polyphony is a serene, generative nature sandbox that simulates a 3D bird ecology directly in the browser. It combines low-poly aesthetics with procedural audio and artificial intelligence to create an immersive, relaxing, and scientifically-inspired experience.

Users act as observers and subtle influencers of a digital ecosystem where birds flock, communicate, forage, evolve, and die, all while generating a unique, never-ending musical composition based on their interactions.

## Core Features

### 1. The Living Ecosystem
The core of the application is a simulation of a bird flock. The birds are not pre-animated assets following a track; they are autonomous agents governed by specific rules:
*   **Flocking Behavior:** Birds move using a Boids algorithm (Separation, Alignment, Cohesion), creating mesmerizing, organic fluid motion.
*   **Lifecycle:** Birds are born, age, consume energy, reproduce, and eventually die.
*   **States:** Birds switch dynamically between states: Flying, Idle (perched), Foraging (ground-level feeding), and Singing.

### 2. Procedural Audio (The "Polyphony")
The soundscape is generated in real-time, not played from recordings.
*   **Generative Calls:** Each bird has a unique pitch and melody.
*   **Contextual Vocalization:** Birds make different sounds based on context:
    *   *Social:* Short chirps to maintain flock cohesion.
    *   *Territorial:* Rapid, aggressive trills when crowded.
    *   *Mating:* Complex melodic sequences when seeking a partner.
*   **Spatial & Environmental Effects:** The audio engine applies reverb and delay to simulate the acoustics of a forest environment.

### 3. AI-Powered Species Discovery
By integrating with Google's Gemini API, the application offers a "Field Researcher" experience.
*   **Specimen Analysis:** When a user selects a procedural bird, the system captures its unique traits (color, pitch, size, energy).
*   **Generative Lore:** The AI invents a scientific name, common name, temperament, and field guide description for that specific generated bird, bridging the gap between abstract data and narrative.

### 4. Interactive Controls
The user can observe or intervene:
*   **Camera Modes:**
    *   *Orbit:* Rotate around the forest.
    *   *First Person:* Walk through the simulation on the ground.
    *   *Follow:* Lock onto a specific bird and track its flight.
*   **Dashboard Mode:** A comprehensive overlay that displays all simulation parameters (Flight, Evolution, Species) simultaneously in a sidebar for advanced control.
*   **Interventions:**
    *   *Feed:* Scatter food to attract birds to the ground.
    *   *Distract:* Trigger a scare event to scatter the flock.
    *   *Introduce Species:* Users can manually design new bird species (color, size, pitch) or trigger a "migration event" of random birds.

### 5. Data Visualization
*   **Real-time HUD:** Displays population count, active voices, and average energy.
*   **Population Dynamics Chart:** An interactive, expandable graph tracking the history of population, foraging activity, and vocalization levels over time.

## Simulation Logic

### Energy & Survival
*   **Metabolism:** Birds lose energy over time.
*   **Foraging:** Birds regain energy by landing on the ground (Foraging state).
*   **Reproduction:** If a bird has high energy and is mature, it may reproduce (asexually in this sim version for simplicity), passing down genetic traits with slight mutations.

### Visual Language
*   **Rings:** Visual rings expand from birds when they sing. The color indicates the type of call (Cyan for Social, Pink for Mating, Red for Territorial).
*   **Trails:** Birds leave a fading trail behind them. The thickness of the trail corresponds to the bird's current energy level.
*   **Flocking Network:** An optional visualization that draws lines between birds within perception range, revealing the underlying Boids neighbor graph.
*   **Color & Opacity:** Older birds become slightly transparent.