import React, { useMemo } from 'react';
import { TreeData } from '../types';

interface TreeProps {
  data: TreeData;
}

export const Tree: React.FC<TreeProps> = ({ data }) => {
  const { position, scale, type } = data;

  // Lush colors
  const color = useMemo(() => {
      // Brighter, more saturated greens
      return type === 'pine' ? '#228B22' : '#4CAF50'; 
  }, [type]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 6]} />
        <meshStandardMaterial color="#3E2723" /> 
      </mesh>

      {/* Foliage */}
      {type === 'pine' ? (
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.8, 2.5, 7]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.4, 2.2, 7]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
             <coneGeometry args={[0.9, 1.8, 7]} />
             <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <group position={[0, 3, 0]}>
           <mesh castShadow receiveShadow>
             <dodecahedronGeometry args={[1.8, 0]} />
             <meshStandardMaterial color={color} roughness={0.8} />
           </mesh>
           <mesh position={[1, 0.5, 0]} scale={0.6} castShadow>
             <dodecahedronGeometry args={[1.5, 0]} />
             <meshStandardMaterial color={color} roughness={0.8} />
           </mesh>
           <mesh position={[-1, 0.2, 0.5]} scale={0.7} castShadow>
             <dodecahedronGeometry args={[1.5, 0]} />
             <meshStandardMaterial color={color} roughness={0.8} />
           </mesh>
        </group>
      )}
    </group>
  );
};