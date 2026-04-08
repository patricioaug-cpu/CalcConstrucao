import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ServiceType } from '../types';

interface VisualizerProps {
  service: ServiceType;
  width: number;
  heightOrLength: number;
  thickness: number;
}

const ConstructionElement: React.FC<VisualizerProps> = ({ service, width, heightOrLength, thickness }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert cm to m for scale, but use a minimum for visibility
  const t = Math.max(thickness / 100, 0.05);
  const w = Math.max(width, 0.5);
  const h = Math.max(heightOrLength, 0.5);

  // Colors based on service
  const colors: Record<string, string> = {
    reboco: '#94a3b8', // Slate
    contrapiso: '#64748b', // Darker slate
    alvenaria: '#f87171', // Reddish for bricks
  };

  return (
    <mesh ref={meshRef} position={[0, h/2, 0]}>
      <boxGeometry args={[w, h, t]} />
      <meshStandardMaterial 
        color={colors[service]} 
        roughness={0.7} 
        metalness={0.1}
      />
      {service === 'alvenaria' && (
        <meshStandardMaterial 
          color="#f87171" 
          wireframe={false}
          emissive="#450a0a"
          emissiveIntensity={0.1}
        />
      )}
    </mesh>
  );
};

export const Visualizer3D: React.FC<VisualizerProps> = (props) => {
  return (
    <div className="h-[300px] w-full bg-slate-900 rounded-xl overflow-hidden relative border border-slate-700">
      <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-white/10">
        Visualização 3D (Escala aproximada)
      </div>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <ConstructionElement {...props} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor="#334155" 
          cellColor="#1e293b" 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
