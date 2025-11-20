
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Trail } from '@react-three/drei';
import { BirdData, BirdState, BirdCallType, BirdActionType, SimSettings } from '../types';
import { BIRD_SPEED, PERCEPTION_RADIUS, SEPARATION_DISTANCE, WORLD_SIZE, CALL_PROPERTIES, MATURATION_AGE, MAX_ENERGY } from '../constants';
import { audioEngine } from '../services/audioEngine';

interface BirdProps {
  data: BirdData;
  flock: React.MutableRefObject<BirdData[]>;
  onSelect: (bird: BirdData) => void;
  isSelected: boolean;
  simSettings: SimSettings;
  isPaused: boolean;
}

export const Bird: React.FC<BirdProps> = ({ data, flock, onSelect, isSelected, simSettings, isPaused }) => {
  const groupRef = useRef<Group>(null);
  const [chirpVisual, setChirpVisual] = useState(0); // 0 = none, >0 = expanding ring scale
  const [chirpType, setChirpType] = useState<BirdCallType>(BirdCallType.SOCIAL);

  // Internal state for smooth interpolation
  const velocity = useRef(new Vector3(...data.velocity));
  const position = useRef(new Vector3(...data.position));
  
  // Behavior timers
  const stateTimer = useRef(Math.random() * 100);
  const chirpTimer = useRef(Math.random() * 500);
  const lastActionTime = useRef(0);

  useFrame((state, delta) => {
    if (isPaused) return;
    if (!groupRef.current) return;

    // Update Visual Scale based on Age
    // Clamp growth between 0.3 and 1.0 of genetic max scale
    const growthProgress = Math.min(1, Math.max(0.3, data.age / MATURATION_AGE));
    const currentScale = data.scale * growthProgress;
    
    // Visual cues for health/age
    const opacity = data.age > data.maxAge * 0.9 ? 0.6 : 1.0;
    
    // Pulse scale slightly if singing
    const singingScale = data.state === BirdState.SINGING ? (1 + Math.sin(state.clock.elapsedTime * 20) * 0.1) : 1;
    const finalScale = currentScale * singingScale;

    // Update mesh scale directly
    groupRef.current.scale.setScalar(finalScale);

    stateTimer.current -= 1;
    chirpTimer.current -= 1;

    // --- User Interaction Handling ---
    if (data.lastAction && data.lastAction.time > lastActionTime.current) {
      lastActionTime.current = data.lastAction.time;
      
      if (data.lastAction.type === BirdActionType.FEED) {
        // Feed behavior: Stop, get happy, come slightly closer to ground if high up
        data.state = BirdState.FORAGING;
        stateTimer.current = 300; // Stay eating for a while
        velocity.current.set(0, -0.02, 0); // Drift down slightly
        
        // Play happy social chirp
        const happyPitch = data.pitch * 1.1;
        audioEngine.playCall(happyPitch, data.melody, BirdCallType.SOCIAL);
        
        // Visual feedback
        setChirpType(BirdCallType.SOCIAL);
        setChirpVisual(0.1);
      } 
      else if (data.lastAction.type === BirdActionType.DISTRACT) {
        // Distract behavior: Panic, fly away fast
        data.state = BirdState.FLYING;
        stateTimer.current = 200; // Stay flying for a while
        
        // Burst of speed in random upward direction
        const burstSpeed = BIRD_SPEED * 3 * simSettings.speed;
        velocity.current.set(
          (Math.random() - 0.5) * 2,
          0.5 + Math.random(),
          (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(burstSpeed);

        // Play alarm chirp
        audioEngine.playCall(data.pitch, data.melody, BirdCallType.TERRITORIAL);
        
        // Visual feedback
        setChirpType(BirdCallType.TERRITORIAL);
        setChirpVisual(0.1);
      }
    }

    // --- State Machine ---
    if (stateTimer.current <= 0) {
      stateTimer.current = 200 + Math.random() * 300;
      const rand = Math.random();
      
      // Young birds fly less, forage more
      const isYoung = data.age < MATURATION_AGE;
      
      if (rand < (isYoung ? 0.4 : 0.6)) {
         data.state = BirdState.FLYING;
         // Kickstart velocity if it was stagnant
         if (velocity.current.lengthSq() < 0.001) {
             velocity.current.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
               .normalize()
               .multiplyScalar(BIRD_SPEED * simSettings.speed);
         }
      }
      else if (rand < 0.8) data.state = BirdState.IDLE;
      else if (rand < 0.9) data.state = BirdState.FORAGING;
      else data.state = BirdState.SINGING;
    }

    // --- Audio & Ecology Logic ---
    if (chirpTimer.current <= 0 && data.state !== BirdState.FLYING) {
       const prob = data.state === BirdState.SINGING ? 0.8 : 0.3;
       
       if (Math.random() < prob) {
          // Determine Call Type based on Ecology (Neighbors)
          let neighborCount = 0;
          const currentPos = position.current;
          
          flock.current.forEach(b => {
             if (b.id !== data.id) {
                const dist = new Vector3(...b.position).distanceTo(currentPos);
                if (dist < 8) neighborCount++;
             }
          });

          let type = BirdCallType.SOCIAL;
          
          // If crowded, get territorial
          if (neighborCount > 2) {
             type = BirdCallType.TERRITORIAL;
          } 
          // If exactly one neighbor close by, potential mating call
          // Only adults mate
          else if (neighborCount === 1 && data.age > MATURATION_AGE) {
             type = BirdCallType.MATING;
          }
          // Otherwise simple social broadcast

          audioEngine.playCall(data.pitch, data.melody, type);
          
          setChirpType(type);
          setChirpVisual(0.1); // Start visual ring
          
          // Reset timer based on urgency
          const resetTime = type === BirdCallType.TERRITORIAL ? 80 : (200 + Math.random() * 400);
          chirpTimer.current = resetTime;
       } else {
         chirpTimer.current = 50; // Try again soon
       }
    }

    // --- Visual Ring Animation ---
    if (chirpVisual > 0) {
      const props = CALL_PROPERTIES[chirpType];
      setChirpVisual(prev => {
         const next = prev + delta * props.speed;
         return next > props.maxScale ? 0 : next;
      });
    }

    // --- Boids / Movement Logic ---
    if (data.state === BirdState.FLYING) {
      const pos = position.current;
      const vel = velocity.current;
      
      const acceleration = new Vector3();
      
      const alignment = new Vector3();
      const cohesion = new Vector3();
      const separation = new Vector3();
      let neighborCount = 0;

      // Collect Neighbors
      flock.current.forEach(neighbor => {
          if (neighbor.id === data.id) return;
          
          const nPos = new Vector3(neighbor.position[0], neighbor.position[1], neighbor.position[2]);
          const dist = pos.distanceTo(nPos);
          
          if (dist < PERCEPTION_RADIUS) {
             // Alignment: Avg velocity
             const nVel = new Vector3(neighbor.velocity[0], neighbor.velocity[1], neighbor.velocity[2]);
             alignment.add(nVel);
             
             // Cohesion: Center of mass
             cohesion.add(nPos);
             
             // Separation: Avoid crowding
             if (dist < SEPARATION_DISTANCE) {
                 const diff = new Vector3().subVectors(pos, nPos).normalize().divideScalar(dist);
                 separation.add(diff);
             }
             
             neighborCount++;
          }
      });

      // Define Physics Limits based on Settings
      const maxSpeed = BIRD_SPEED * simSettings.speed;
      // We scale maxForce by speed so that at low speeds, steering is also slower (physics consistency for "slow motion")
      // Base agility factor: 0.01 looks good for general purpose
      const maxForce = 0.01 * simSettings.agility * simSettings.speed;

      if (neighborCount > 0) {
          // Reynolds Steering: Steer = Desired - Velocity
          
          // Alignment
          alignment.divideScalar(neighborCount).setLength(maxSpeed).sub(vel).clampLength(0, maxForce);
          
          // Cohesion
          cohesion.divideScalar(neighborCount).sub(pos).setLength(maxSpeed).sub(vel).clampLength(0, maxForce);
          
          // Separation
          // Separation is strictly a repulsive force, we allow it to be stronger to prevent clipping
          separation.multiplyScalar(1.5).setLength(maxSpeed).sub(vel).clampLength(0, maxForce * 2.0);

          acceleration.add(alignment.multiplyScalar(1.0));
          acceleration.add(cohesion.multiplyScalar(0.8));
          acceleration.add(separation.multiplyScalar(2.0));
      } else {
          // Wander force if alone to keep movement organic
          const wander = new Vector3(
              (Math.random() - 0.5),
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5)
          ).normalize().multiplyScalar(maxForce * 0.5);
          acceleration.add(wander);
      }

      // World Boundaries (Soft Walls)
      const bound = WORLD_SIZE / 2 - 5;
      const boundaryForce = new Vector3();
      if (pos.x > bound) boundaryForce.x -= 1;
      if (pos.x < -bound) boundaryForce.x += 1;
      if (pos.z > bound) boundaryForce.z -= 1;
      if (pos.z < -bound) boundaryForce.z += 1;
      
      // Floor / Ceiling
      if (pos.y < 3) boundaryForce.y += 2;
      if (pos.y > 30) boundaryForce.y -= 1;

      if (boundaryForce.lengthSq() > 0) {
          boundaryForce.normalize().multiplyScalar(maxForce * 3.0);
          acceleration.add(boundaryForce);
      }
      
      // Apply Acceleration
      vel.add(acceleration);
      
      // Apply Speed Limits
      // Age factor for speed
      const ageFactor = (data.age < MATURATION_AGE) ? 0.8 : (data.age > data.maxAge * 0.9 ? 0.7 : 1.0);
      const speedLimit = maxSpeed * ageFactor;
      const minSpeed = speedLimit * 0.5;
      
      vel.clampLength(minSpeed, speedLimit);
      
      // Integrate Position
      pos.add(vel);

      // Sync data for other components
      data.velocity = [vel.x, vel.y, vel.z];

      // Update Mesh Position
      groupRef.current.position.copy(pos);
      
      // Update Mesh Rotation (Smoothly look at direction of movement)
      const lookTarget = pos.clone().add(vel);
      groupRef.current.lookAt(lookTarget);

    } else {
      // Idle/Singing/Foraging logic (Bobbing)
      const yOffset = Math.sin(state.clock.elapsedTime * 2 + parseInt(data.id.split('-')[1] || '0')) * 0.05;
      
      // Drift slowly if foraging
      if (data.state === BirdState.FORAGING) {
          position.current.add(velocity.current);
          velocity.current.multiplyScalar(0.9);
      }
      
      const displayPos = position.current.clone();
      displayPos.y += yOffset;
      
      groupRef.current.position.copy(displayPos);
      
      // Rotate slowly when scanning/singing
      if (Math.random() < 0.02) {
        groupRef.current.rotation.y += (Math.random() - 0.5) * 0.5;
      }
    }

    // Sync position data for Camera Controller
    if (groupRef.current) {
        data.position = [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z];
    }
  });

  // Determine material color based on health/age
  const visualColor = data.color;
  const finalOpacity = data.age > data.maxAge * 0.9 ? 0.6 : 1.0;

  // Calculate trail width based on energy (high energy = thicker trail)
  // Cap width at reasonable size
  const trailWidth = 0.3 * (data.energy / MAX_ENERGY);

  return (
    <group>
      <Trail
         width={trailWidth}
         length={6}
         color={visualColor}
         attenuation={(t) => t}
      >
          {/* The Bird Mesh */}
          <group 
            ref={groupRef} 
            position={new Vector3(...data.position)} 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data);
            }}
          >
            <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.3, 1, 8]} />
              <meshStandardMaterial 
                color={isSelected ? '#ffffff' : visualColor} 
                emissive={isSelected ? '#555555' : (data.energy < 20 ? '#330000' : '#000000')} 
                transparent
                opacity={finalOpacity}
              />
            </mesh>
            
            {/* Wings */}
            <mesh position={[0, 0, 0.2]} rotation={[0.5, 0, 0]}>
               <boxGeometry args={[0.8, 0.1, 0.3]} />
               <meshStandardMaterial color={visualColor} transparent opacity={finalOpacity} />
            </mesh>
          </group>
      </Trail>

      {/* Visual Sound Propagation */}
      {chirpVisual > 0 && groupRef.current && (
        <mesh 
          position={groupRef.current.position} 
          rotation={[-Math.PI/2, 0, 0]}
        >
          <ringGeometry args={[chirpVisual * 0.85, chirpVisual, 32]} />
          <meshBasicMaterial 
            color={CALL_PROPERTIES[chirpType].color} 
            transparent 
            opacity={(1 - (chirpVisual / CALL_PROPERTIES[chirpType].maxScale)) * 0.8} 
            toneMapped={false}
            side={2} 
          />
        </mesh>
      )}
    </group>
  );
};
