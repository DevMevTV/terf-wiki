import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function ModelViewer() {
    return (
        <Canvas camera={{ position: [2, 2, 2] }}>
            <ambientLight intensity={2} />
            <directionalLight position={[3, 5, 3]} />

            <mesh>
                <boxGeometry />
                <meshStandardMaterial color="orange" />
            </mesh>

            <OrbitControls />
        </Canvas>
    );
}