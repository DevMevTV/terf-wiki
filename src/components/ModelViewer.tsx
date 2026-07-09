import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FileLoader, MeshStandardMaterial, NearestFilter, TextureLoader, BufferGeometry, Float32BufferAttribute, Group } from "three";
import { useMemo, useRef, useState } from "react";

export type PaletteEntry = {
    Name: string;
    Properties?: Record<string, string>;
};

export type Model = {
    x: number;
    y: number;
    z: number;
    palette: PaletteEntry[];
    blocks: number[];
};

type Face = {
    uv?: [number, number, number, number];
    texture: string;
    rotation?: 0 | 90 | 180 | 270;
    uvlock?: boolean;
};

type Element = {
    from: [number, number, number];
    to: [number, number, number];
    faces: Record<string, Face>;
};

type BlockModelData = {
    elements: Element[];
};

type BlockStateVariant = {
    model: string;
    x?: number;
    y?: number;
    uvlock?: boolean;
};

type BlockStateData = {
    variants?: Record<string, BlockStateVariant | BlockStateVariant[]>;
};

class JsonLoader extends FileLoader {
    override load(
        url: string,
        onLoad?: (data: string | ArrayBuffer) => void,
        onProgress?: (event: ProgressEvent<EventTarget>) => void,
        onError?: (err: unknown) => void
    ) {
        super.load(
            url,
            (data) => {
                if (typeof data !== "string") {
                    onError?.(new Error("Expected string response"));
                    return;
                }
                try {
                    onLoad?.(JSON.parse(data));
                } catch (e) {
                    onError?.(e);
                }
            },
            onProgress,
            onError
        );
    }
}

function createElementGeometry(
    from: [number, number, number],
    to: [number, number, number],
    faces: Record<string, Face>
) {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const groups: { start: number; count: number; materialIndex: number; }[] = [];

    const x1 = from[0] / 16;
    const y1 = from[1] / 16;
    const z1 = from[2] / 16;

    const x2 = to[0] / 16;
    const y2 = to[1] / 16;
    const z2 = to[2] / 16;

    function applyMinecraftUVs(uvArray: [number, number, number, number], rotation: number) {
        const uMin = uvArray[0] / 16;
        const vMin = uvArray[1] / 16;
        const uMax = uvArray[2] / 16;
        const vMax = uvArray[3] / 16;

        const baseCoords = [
            [uMin, 1 - vMax],
            [uMax, 1 - vMax],
            [uMax, 1 - vMin],
            [uMin, 1 - vMin]
        ];

        const steps = (rotation / 90) % 4;
        const finalCoords = [];
        for (let i = 0; i < 4; i++) {
            const targetIndex = (i - steps + 4) % 4;
            finalCoords.push(...baseCoords[targetIndex]);
        }
        return finalCoords;
    }

    function addFace(
        direction: string,
        corners: [number, number, number][],
        face: Face | undefined,
        materialIndex: number
    ) {
        if (!face) return;

        const vertexStart = vertices.length / 3;
        const indexStart = indices.length;

        for (const corner of corners) {
            vertices.push(corner[0], corner[1], corner[2]);
        }

        let uvRange = face.uv;
        if (!uvRange) {
            if (direction === 'east' || direction === 'west') {
                uvRange = [z1 * 16, (1 - y2) * 16, z2 * 16, (1 - y1) * 16];
            } else if (direction === 'up' || direction === 'down') {
                uvRange = [x1 * 16, z1 * 16, x2 * 16, z2 * 16];
            } else {
                uvRange = [x1 * 16, (1 - y2) * 16, x2 * 16, (1 - y1) * 16];
            }
        }

        const rotationValue = face.rotation ?? 0;
        uvs.push(...applyMinecraftUVs(uvRange, rotationValue));

        indices.push(
            vertexStart, vertexStart + 2, vertexStart + 1,
            vertexStart, vertexStart + 3, vertexStart + 2
        );

        groups.push({
            start: indexStart,
            count: 6,
            materialIndex
        });
    }

    addFace('east',  [[x2, y1, z1], [x2, y1, z2], [x2, y2, z2], [x2, y2, z1]], faces.east,  0);
    addFace('west',  [[x1, y1, z2], [x1, y1, z1], [x1, y2, z1], [x1, y2, z2]], faces.west,  1);
    addFace('up',    [[x2, y2, z2], [x1, y2, z2], [x1, y2, z1], [x2, y2, z1]], faces.up,    2);
    addFace('down',  [[x2, y1, z1], [x1, y1, z1], [x1, y1, z2], [x2, y1, z2]], faces.down,  3);
    addFace('south', [[x2, y1, z2], [x1, y1, z2], [x1, y2, z2], [x2, y2, z2]], faces.south, 4);
    addFace('north', [[x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1]], faces.north, 5);

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex);
    }

    geometry.computeVertexNormals();
    return geometry;
}

function ModelElement({ element }: { element: Element }) {
    const geometry = useMemo(() => createElementGeometry(element.from, element.to, element.faces), [element]);
    const faceKeys = ['east', 'west', 'up', 'down', 'south', 'north'];
    
    const materials = faceKeys.map(key => {
        const face = element.faces[key];
        if (!face) return new MeshStandardMaterial({ visible: false });

        const texture = useLoader(TextureLoader, `/terf-wiki/assets/textures/${face.texture}.png`);
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;

        return new MeshStandardMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    });

    return <mesh geometry={geometry} material={materials} />;
}

function BlockModel({ data }: { data: BlockModelData }) {
    return (
        <>
            {data.elements.map((element, i) => (
                <ModelElement key={i} element={element} />
            ))}
        </>
    );
}

function SingleVoxel({ entry, position }: { entry: PaletteEntry, position: [number, number, number] }) {
    const cleanName = entry.Name.replace("minecraft:", "");
    
    const stateData = useLoader(JsonLoader, `/terf-wiki/assets/blockstates/${cleanName}.json`) as unknown as BlockStateData;
    
    const variantKeys = useMemo(() => {
        if (!entry.Properties) return [];
        return Object.entries(entry.Properties)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([k, v]) => `${k}=${v}`);
    }, [entry.Properties]);

    const matchedVariants = useMemo(() => {
        if (!stateData || !stateData.variants) return [];
        
        const matches: BlockStateVariant[] = [];

        for (const [keys, variant] of Object.entries(stateData.variants)) {
            let add = true;

            for (const key of keys.split(",")) {
                if (key === "" || variantKeys.includes(key)) continue

                add = false;
                break;
            }

            if (!add) continue;

            if (Array.isArray(variant)) {
                matches.push(...variant)
            } else {
                matches.push(variant)
            }
        }

        return matches;
    }, [stateData, variantKeys]);

    // 2. Map matches to their file paths
    const modelPaths = useMemo(() => {
        return matchedVariants.map(v => `/terf-wiki/assets/models/${v.model}.json`);
    }, [matchedVariants]);

    // 3. Load ALL models (useLoader handles arrays automatically!)
    const modelsData = useLoader(JsonLoader, modelPaths) as unknown as BlockModelData[];

    if (!modelsData || modelsData.length === 0) return null;

    return (
        <group position={position}>
            {matchedVariants.map((variant, index) => {
                const modelData = modelsData[index];
                if (!modelData) return null;

                // Calculate distinct rotation for this specific variant layer
                const radX = -((variant.x ?? 0) * Math.PI) / 180;
                const radY = -((variant.y ?? 0) * Math.PI) / 180;
                const rotation: [number, number, number] = [radX, radY, 0];

                return (
                    <group 
                        key={index} 
                        rotation={[rotation[0], rotation[1], rotation[2], "YXZ"]} 
                        position={[0.5, 0.5, 0.5]}
                    >
                        <group position={[-0.5, -0.5, -0.5]}>
                            <BlockModel data={modelData} />
                        </group>
                    </group>
                );
            })}
        </group>
    );
}

function VoxelModel({ model, currentLayer }: { model: Model, currentLayer: number }) {
    const cubes = [];

    for (let y = 0; y < model.y; y++) {
        if (currentLayer !== -1 && y !== currentLayer) continue;

        for (let z = 0; z < model.z; z++) {
            for (let x = 0; x < model.x; x++) {
                const index = x + z * model.x + y * model.x * model.z;
                const paletteIndex = model.blocks[index];

                if (paletteIndex === 0) continue;

                const block = model.palette[paletteIndex];

                cubes.push(
                    <SingleVoxel 
                        key={index} 
                        entry={block} 
                        position={[x, y, z]} 
                    />
                );
            }
        }
    }

    return <>{cubes}</>;
}

function AutoRotatingScene({ model, isMaximized, currentLayer }: { model: Model, isMaximized: boolean, currentLayer: number }) {
    const lastInteractionTime = useRef<number>(Date.now());
    const groupRef = useRef<Group>(null!);

    useFrame(() => {
        if (!groupRef.current) return;

        if (isMaximized) return;

        const timeSinceInteraction = Date.now() - lastInteractionTime.current;
        if (timeSinceInteraction > 4000) {
            //groupRef.current.rotation.y += 0.001;
        }
    })

    const handleUserInteraction = () => {
        lastInteractionTime.current = Date.now();
    }

    return (
        <>
            <ambientLight intensity={1.2} />

            <group ref={groupRef}>
                <VoxelModel model={model} currentLayer={currentLayer} />
            </group>

            <OrbitControls
                target={[model.x / 2, model.y / 2, model.z / 2]}
                onChange={handleUserInteraction}
            />
        </>
    )
}

export default function ModelViewer({ model, isMaximized }: { model: Model, isMaximized: boolean }) {
    const [currentLayer, setCurrentLayer] = useState<number>(-1);

    return (
        <div
            style = {{
                position: "relative",
                width: "100%",
                height: "100%"
            }}
        >
            <Canvas camera={{ position: [model.x, model.y, model.z] }}>
                <AutoRotatingScene model={model} isMaximized={isMaximized} currentLayer={isMaximized ? currentLayer : -1} />
            </Canvas>

            {isMaximized && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "20px",
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#fff",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontFamily: "sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        zIndex: 10,
                    }}
                >
                    <label
                        style={{
                            fontSize: "12px",
                            fontWeight: "bold"
                        }}
                    >
                        Layer: {currentLayer === -1 ? "All" : `Y = ${currentLayer}`}
                    </label>
                    <input
                        type="range"
                        min="-1"
                        max={model.y - 1}
                        value={currentLayer}
                        onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
                        style={{
                            cursor: "pointer",
                            width: "150px"
                        }}
                    />
                </div>
            )}
        </div>
    );
}