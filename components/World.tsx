
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { Bird } from './Bird';
import { Tree } from './Tree';
import { Player } from './Player';
import { BirdData, TreeData, BirdState, BirdActionType, ViewMode, SimSettings, SimulationStats, EvolutionSettings, WorldCommand } from '../types';
import { BIRD_COUNT, TREE_COUNT, WORLD_SIZE, BIRD_COLORS, BASE_FREQ, PERCEPTION_RADIUS, INITIAL_ENERGY, MAX_ENERGY, METABOLIC_RATE, FORAGING_RATE, REPRODUCTION_THRESHOLD, REPRODUCTION_COST, MATURATION_AGE } from '../constants';
import * as THREE from 'three';

interface WorldProps {
  onBirdSelect: (bird: BirdData) => void;
  selectedBirdId: string | null;
  followedBirdId?: string | null;
  isAudioEnabled: boolean;
  actionSignal?: { id: string, type: BirdActionType, time: number } | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  simSettings: SimSettings;
  evolutionSettings: EvolutionSettings;
  isPaused: boolean;
  onStatsUpdate: (stats: SimulationStats) => void;
  worldCommand: WorldCommand;
}

// Component to handle camera following logic
const CameraController: React.FC<{ 
  viewMode: ViewMode; 
  followedBirdId?: string | null; 
  flockRef: React.MutableRefObject<BirdData[]>; 
}> = ({ viewMode, followedBirdId, flockRef }) => {
  const lastDirection = useRef(new THREE.Vector3(0, 0, 1));
  
  useFrame((state, delta) => {
    if (viewMode === ViewMode.FOLLOW && followedBirdId) {
      const bird = flockRef.current.find(b => b.id === followedBirdId);
      if (bird) {
        const birdPos = new THREE.Vector3(...bird.position);
        const birdVel = new THREE.Vector3(...bird.velocity);
        
        // Calculate target camera position (behind and slightly above)
        // Only update direction if bird is actually moving significantly to avoid snapping when stopping
        if (birdVel.lengthSq() > 0.001) {
           lastDirection.current.copy(birdVel).normalize();
        }
        
        // If bird is stationary (IDLE), use last known direction
        const direction = lastDirection.current.clone();
        
        // Offset: 3 units behind, 1.5 units up relative to movement direction
        const offset = direction.multiplyScalar(-3).add(new THREE.Vector3(0, 1.5, 0));
        const targetPos = birdPos.clone().add(offset);

        // Smoothly interpolate camera position
        // Using delta for frame-rate independent smoothing
        state.camera.position.lerp(targetPos, 3.0 * delta);
        
        // Look slightly ahead of the bird or at the bird
        state.camera.lookAt(birdPos);
      }
    }
  });
  return null;
};

const SceneContent: React.FC<WorldProps> = ({ 
  onBirdSelect, 
  selectedBirdId, 
  followedBirdId, 
  actionSignal, 
  viewMode, 
  onViewModeChange,
  simSettings,
  evolutionSettings,
  isPaused,
  onStatsUpdate,
  worldCommand
}) => {
    const { scene } = useThree();
    const lastStatsUpdate = useRef(0);
    // Initialize ID counter to 0 so first bird is bird-0, matching potential default expectations
    const uniqueIdCounter = useRef(0);
    
    // We need State for React rendering, but Ref for physics performance.
    // Use Frame synchronizes them when topology changes (birth/death).
    const [flockState, setFlockState] = useState<BirdData[]>([]);
    const flockRef = useRef<BirdData[]>([]);
    
    // Handle manual world commands (Population / Selection)
    useEffect(() => {
        if (!worldCommand) return;

        let updatedFlock = [...flockRef.current];
        let needsUpdate = false;

        if (worldCommand.type === 'ADD') {
            for (let i = 0; i < worldCommand.count; i++) {
                updatedFlock.push(createBird(true));
            }
            needsUpdate = true;
        } else if (worldCommand.type === 'REMOVE') {
            if (updatedFlock.length > 0) {
                 updatedFlock.splice(0, Math.min(updatedFlock.length, worldCommand.count));
                 needsUpdate = true;
            }
        } else if (worldCommand.type === 'SELECT_RANDOM') {
             if (updatedFlock.length > 0) {
                 const randomBird = updatedFlock[Math.floor(Math.random() * updatedFlock.length)];
                 onBirdSelect(randomBird);
             }
        }

        if (needsUpdate) {
            flockRef.current = updatedFlock;
            setFlockState(updatedFlock);
        }

    }, [worldCommand]);

    // Helper to create a bird
    const createBird = (randomPos: boolean = true, parent?: BirdData): BirdData => {
        const id = `bird-${uniqueIdCounter.current++}`;
        
        let position: [number, number, number];
        let color = BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)];
        let melody = [1];
        let pitch = BASE_FREQ + (Math.random() * 600);
        let generation = 0;

        if (parent) {
            // Inherit with mutation
            position = [
                parent.position[0] + (Math.random() - 0.5) * 2,
                parent.position[1],
                parent.position[2] + (Math.random() - 0.5) * 2,
            ];
            
            // Mutate color occasionally
            if (Math.random() < evolutionSettings.mutationRate) {
                 color = BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)];
            } else {
                 color = parent.color;
            }

            // Mutate pitch
            const mutation = (Math.random() - 0.5) * 100 * evolutionSettings.mutationRate;
            pitch = parent.pitch + mutation;

            // Mutate melody
            melody = [...parent.melody];
            if (Math.random() < evolutionSettings.mutationRate) {
                const idx = Math.floor(Math.random() * melody.length);
                melody[idx] = Math.max(1, melody[idx] + (Math.random() - 0.5) * 0.5);
            }

            generation = parent.generation + 1;

        } else {
            // Random spawn
             const x = (Math.random() - 0.5) * (WORLD_SIZE * 0.8);
             const y = 5 + Math.random() * 10;
             const z = (Math.random() - 0.5) * (WORLD_SIZE * 0.8);
             position = [x, y, z];

             const possibleIntervals = [1, 1.125, 1.25, 1.33, 1.5, 1.66, 1.875, 2];
             for(let m=0; m<3; m++) {
                melody.push(possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)]);
             }
        }

        return {
            id,
            position,
            velocity: [(Math.random()-0.5)*0.1, 0, (Math.random()-0.5)*0.1],
            color,
            state: BirdState.FLYING,
            scale: 0.5 + Math.random() * 0.5,
            pitch,
            melody,
            lastChirp: 0,
            age: 0,
            maxAge: (60 + Math.random() * 120), // 1-3 minutes lifespan
            energy: INITIAL_ENERGY,
            generation
        };
    };

    // Initialize Fog, Lighting, and Initial Flock
    useEffect(() => {
        // Dynamic Fog based on render distance
        // Visbility approx 3/density.
        const density = 3.0 / simSettings.renderDistance;
        scene.fog = new THREE.FogExp2('#e0f2fe', density);
        
        // Initial spawn
        if (flockRef.current.length === 0) {
            const initialBirds = [];
            for (let i = 0; i < BIRD_COUNT; i++) {
                initialBirds.push(createBird());
            }
            flockRef.current = initialBirds;
            setFlockState(initialBirds);
        }
    }, [scene, simSettings.renderDistance]);

    // Generate Trees (Memoized)
    const trees = useMemo(() => {
        const items: TreeData[] = [];
        for (let i = 0; i < TREE_COUNT; i++) {
            const x = (Math.random() - 0.5) * WORLD_SIZE;
            const z = (Math.random() - 0.5) * WORLD_SIZE;
            const scale = 0.8 + Math.random() * 1.5;
            items.push({
                id: `tree-${i}`,
                position: [x, 0, z],
                scale,
                type: Math.random() > 0.4 ? 'pine' : 'oak'
            });
        }
        return items;
    }, []);

    // Handle Incoming Actions
    useEffect(() => {
      if (actionSignal) {
        const bird = flockRef.current.find(b => b.id === actionSignal.id);
        if (bird) {
          bird.lastAction = { type: actionSignal.type, time: actionSignal.time };
        }
      }
    }, [actionSignal]);

    // Main Simulation Loop (Physics + Evolution)
    useFrame((state, delta) => {
        if (isPaused) return;

        const now = state.clock.elapsedTime;
        let flockChanged = false;
        const survivors: BirdData[] = [];
        const newOffspring: BirdData[] = [];

        // 1. Evolution Lifecycle Update
        if (evolutionSettings.enabled) {
            flockRef.current.forEach(bird => {
                // Aging
                bird.age += delta * evolutionSettings.agingSpeed;

                // Energy Consumption
                bird.energy -= METABOLIC_RATE * delta;

                // Energy Gain
                if (bird.state === BirdState.FORAGING) {
                    bird.energy += FORAGING_RATE * delta * evolutionSettings.foodAbundance;
                    if (bird.energy > MAX_ENERGY) bird.energy = MAX_ENERGY;
                }

                // Reproduction
                if (
                    bird.age > MATURATION_AGE && 
                    bird.energy > REPRODUCTION_THRESHOLD && 
                    Math.random() < 0.05 * delta
                ) {
                    bird.energy -= REPRODUCTION_COST;
                    newOffspring.push(createBird(false, bird));
                    flockChanged = true;
                }

                // Death Check
                const deadFromAge = bird.age > bird.maxAge;
                const deadFromStarvation = bird.energy <= 0;

                if (!deadFromAge && !deadFromStarvation) {
                    survivors.push(bird);
                } else {
                    flockChanged = true;
                }
            });

            if (flockChanged) {
                flockRef.current = [...survivors, ...newOffspring];
                setFlockState(flockRef.current);
            }
        }

        // 2. Stats Calculation Loop (Periodic)
        if (now - lastStatsUpdate.current > 0.5) {
            lastStatsUpdate.current = now;
            
            const birds = flockRef.current;
            const population = birds.length;
            const activeVoices = birds.filter(b => b.state === BirdState.SINGING).length;
            const foragingCount = birds.filter(b => b.state === BirdState.FORAGING).length;
            const averageHeight = birds.reduce((acc, b) => acc + b.position[1], 0) / (population || 1);
            const maxGeneration = birds.reduce((max, b) => Math.max(max, b.generation), 0);
            const avgEnergy = birds.reduce((acc, b) => acc + b.energy, 0) / (population || 1);

            // Calculate Flocks (Connected Components)
            let flockCount = 0;
            const visited = new Set<string>();
            const perceptionSq = PERCEPTION_RADIUS * PERCEPTION_RADIUS;

            for (let i = 0; i < birds.length; i++) {
                if (!visited.has(birds[i].id)) {
                    flockCount++;
                    const stack = [birds[i]];
                    visited.add(birds[i].id);
                    
                    while (stack.length > 0) {
                        const current = stack.pop()!;
                        const curPos = new THREE.Vector3(...current.position);
                        
                        for (let j = 0; j < birds.length; j++) {
                            if (!visited.has(birds[j].id)) {
                                const otherPos = new THREE.Vector3(...birds[j].position);
                                if (curPos.distanceToSquared(otherPos) < perceptionSq) {
                                    visited.add(birds[j].id);
                                    stack.push(birds[j]);
                                }
                            }
                        }
                    }
                }
            }

            onStatsUpdate({
                population,
                flockCount,
                activeVoices,
                averageHeight,
                foragingCount,
                maxGeneration,
                avgEnergy
            });
        }
    });

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight 
                position={[50, 80, 25]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
            >
                <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
            </directionalLight>
            
            <Sky sunPosition={[100, 40, 100]} turbidity={0.3} rayleigh={0.8} mieCoefficient={0.005} mieDirectionalG={0.8} />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[WORLD_SIZE * 4, WORLD_SIZE * 4]} />
                <meshStandardMaterial color="#66BB6A" roughness={1} />
            </mesh>
            
            {trees.map(tree => <Tree key={tree.id} data={tree} />)}

            {flockState.map((bird) => (
                <Bird 
                    key={bird.id} 
                    data={bird} 
                    flock={flockRef}
                    onSelect={onBirdSelect}
                    isSelected={selectedBirdId === bird.id}
                    simSettings={simSettings}
                    isPaused={isPaused}
                />
            ))}

            <CameraController viewMode={viewMode} followedBirdId={followedBirdId} flockRef={flockRef} />
            
            {viewMode === ViewMode.ORBIT && (
                <OrbitControls 
                    maxPolarAngle={Math.PI / 2 - 0.1} 
                    minDistance={5}
                    maxDistance={simSettings.renderDistance * 0.8}
                    enablePan={true}
                />
            )}
            {viewMode === ViewMode.FPS && (
                <Player onUnlock={() => onViewModeChange(ViewMode.ORBIT)} />
            )}
        </>
    );
}

export const World: React.FC<WorldProps> = (props) => {
  return (
    <Canvas shadows camera={{ position: [25, 15, 25], fov: 45, far: 1000 }}>
      <SceneContent {...props} />
    </Canvas>
  );
};