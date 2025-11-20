import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';

interface PlayerProps {
  onUnlock?: () => void;
}

export const Player: React.FC<PlayerProps> = ({ onUnlock }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useEffect(() => {
    // Set spawn point slightly above ground
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 2, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward.current = true; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft.current = true; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward.current = true; break;
        case 'ArrowRight':
        case 'KeyD': moveRight.current = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward.current = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft.current = false; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward.current = false; break;
        case 'ArrowRight':
        case 'KeyD': moveRight.current = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [camera]);

  useFrame((_, delta) => {
      if (!controlsRef.current) return;
      
      // Movement Speed
      const speed = 15 * delta;

      if (moveForward.current) controlsRef.current.moveForward(speed);
      if (moveBackward.current) controlsRef.current.moveForward(-speed);
      if (moveRight.current) controlsRef.current.moveRight(speed);
      if (moveLeft.current) controlsRef.current.moveRight(-speed);

      // Clamp height to simulate walking on ground (simple terrain)
      camera.position.y = 2;
  });

  return (
    <PointerLockControls 
      ref={controlsRef} 
      onUnlock={onUnlock} 
      selector="#root" // Explicitly attach to root to ensure events are caught properly
    />
  );
};