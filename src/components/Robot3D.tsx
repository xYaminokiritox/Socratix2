
import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// Simple Robot component
function Robot(props: any) {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  // Animate the robot
  useFrame((state) => {
    if (group.current) {
      // Gentle floating animation
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      
      // Gentle rotation
      if (!props.isDragging) {
        group.current.rotation.y += 0.003;
      }
    }
  });

  // Robot parts with primitive shapes
  return (
    <group
      ref={group}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={1.5}
    >
      {/* Robot Head */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial 
          color={hovered ? "#9b87f5" : "#8B5CF6"}
          metalness={0.8}
          roughness={0.2}
        />
        
        {/* Robot Eyes */}
        <mesh position={[0.2, 0.1, 0.38]} scale={[0.15, 0.15, 0.1]}>
          <sphereGeometry />
          <meshStandardMaterial 
            color="#0EA5E9" 
            emissive="#0EA5E9" 
            emissiveIntensity={2} 
          />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.38]} scale={[0.15, 0.15, 0.1]}>
          <sphereGeometry />
          <meshStandardMaterial 
            color="#0EA5E9" 
            emissive="#0EA5E9" 
            emissiveIntensity={2} 
          />
        </mesh>
        
        {/* Robot Antenna */}
        <mesh position={[0, 0.5, 0]} scale={[0.05, 0.3, 0.05]}>
          <cylinderGeometry />
          <meshStandardMaterial 
            color="#E5DEFF" 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>
        <mesh position={[0, 0.7, 0]} scale={[0.1, 0.1, 0.1]}>
          <sphereGeometry />
          <meshStandardMaterial 
            color="#F97316" 
            emissive="#F97316" 
            emissiveIntensity={1} 
          />
        </mesh>
      </mesh>
      
      {/* Robot Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial 
          color="#7E69AB" 
          metalness={0.6} 
          roughness={0.3}
        />
        
        {/* Robot Control Panel */}
        <mesh position={[0, 0, 0.3]} scale={[0.6, 0.4, 0.05]}>
          <boxGeometry />
          <meshStandardMaterial color="#1A1F2C" />
          
          {/* Control Panel Buttons */}
          <mesh position={[0.2, 0.1, 0.1]} scale={[0.15, 0.15, 0.1]}>
            <cylinderGeometry />
            <meshStandardMaterial color="#F97316" />
          </mesh>
          <mesh position={[-0.2, 0.1, 0.1]} scale={[0.15, 0.15, 0.1]}>
            <cylinderGeometry />
            <meshStandardMaterial color="#10B981" />
          </mesh>
          <mesh position={[0, -0.1, 0.1]} scale={[0.15, 0.05, 0.05]}>
            <boxGeometry />
            <meshStandardMaterial color="#D946EF" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Robot Arms */}
      <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial 
          color="#6E59A5" 
          metalness={0.7} 
          roughness={0.3} 
        />
        
        {/* Robot Hand */}
        <mesh position={[0, -0.4, 0]} scale={[0.3, 0.2, 0.3]}>
          <sphereGeometry />
          <meshStandardMaterial color="#D6BCFA" />
        </mesh>
      </mesh>
      <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial 
          color="#6E59A5" 
          metalness={0.7} 
          roughness={0.3} 
        />
        
        {/* Robot Hand */}
        <mesh position={[0, -0.4, 0]} scale={[0.3, 0.2, 0.3]}>
          <sphereGeometry />
          <meshStandardMaterial color="#D6BCFA" />
        </mesh>
      </mesh>
      
      {/* Robot Legs */}
      <mesh position={[0.3, -0.3, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.3]} />
        <meshStandardMaterial 
          color="#6E59A5" 
          metalness={0.6} 
          roughness={0.3} 
        />
        
        {/* Robot Foot */}
        <mesh position={[0, -0.5, 0.1]} scale={[0.3, 0.2, 0.5]}>
          <boxGeometry />
          <meshStandardMaterial color="#D6BCFA" />
        </mesh>
      </mesh>
      <mesh position={[-0.3, -0.3, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.3]} />
        <meshStandardMaterial 
          color="#6E59A5" 
          metalness={0.6} 
          roughness={0.3} 
        />
        
        {/* Robot Foot */}
        <mesh position={[0, -0.5, 0.1]} scale={[0.3, 0.2, 0.5]}>
          <boxGeometry />
          <meshStandardMaterial color="#D6BCFA" />
        </mesh>
      </mesh>
    </group>
  );
}

const Robot3D = () => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Set up pointer event listeners to track dragging state
  useEffect(() => {
    const handlePointerDown = () => {
      setIsDragging(true);
    };
    
    const handlePointerUp = () => {
      setIsDragging(false);
    };
    
    // Add global event listeners
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    
    // Clean up
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);
  
  return (
    <div className="h-[400px] md:h-[500px] w-full bg-gradient-to-r from-background to-muted/30 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        className="cursor-grab active:cursor-grabbing"
        shadows
        dpr={[1, 2]}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-0.5, 0.5]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
          // Removed problematic props completely - we're using window events instead
        >
          <Robot isDragging={isDragging} position={[0, -1, 0]} />
        </PresentationControls>
      </Canvas>
      <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground text-sm">
        Drag to interact with Socratix Assistant
      </div>
    </div>
  );
};

export default Robot3D;
