import { useMemo, useRef, useState } from 'react';
import type { ComponentRef, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

type LoadLevel = 'free' | 'medium' | 'busy';
type RoomStatus = 'frei' | 'belegt';

type Room = {
  name: string;
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
};

type FootprintPart = {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation?: number;
};

type Building = {
  id: string;
  name: string;
  short: string;
  position: [number, number, number];
  labelOffset?: [number, number, number];
  footprint: FootprintPart[];
  load: LoadLevel;
  rooms: Room[];
};

type ControlsRef = ComponentRef<typeof OrbitControls>;

const rooms: Room[] = [
  { name: 'W101', building: 'W', floor: 'Etage 1', capacity: 6, equipment: ['Beamer', 'Whiteboard', 'WLAN'], status: 'belegt' },
  { name: 'W204', building: 'W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Steckdosen', 'WLAN'], status: 'frei' },
  { name: 'W220', building: 'W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Glasboard', 'WLAN'], status: 'frei' },
  { name: 'Z015', building: 'Z', floor: 'Erdgeschoss', capacity: 8, equipment: ['Whiteboard', 'Gruppentisch', 'WLAN'], status: 'belegt' },
  { name: 'Z022', building: 'Z', floor: 'Etage 2', capacity: 2, equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN'], status: 'frei' },
  { name: 'Z404', building: 'Z', floor: 'Etage 4', capacity: 14, equipment: ['Whiteboard', 'Hybrid-Meeting', 'WLAN'], status: 'belegt' },
  { name: 'Y1.03', building: 'Y1', floor: 'Etage 1', capacity: 6, equipment: ['Monitorwand', 'Whiteboard', 'WLAN'], status: 'belegt' },
  { name: 'Y1.10', building: 'Y1', floor: 'Etage 1', capacity: 10, equipment: ['Beamer', 'Lautsprecher', 'WLAN'], status: 'belegt' },
  { name: 'Y1.15', building: 'Y1', floor: 'Etage 1', capacity: 8, equipment: ['Beamer', 'Whiteboard', 'WLAN'], status: 'frei' },
  { name: 'Y2.04', building: 'Y2', floor: 'Erdgeschoss', capacity: 4, equipment: ['Whiteboard', 'WLAN'], status: 'frei' },
  { name: 'R102', building: 'R', floor: 'Etage 1', capacity: 6, equipment: ['Arbeitsplätze', 'WLAN'], status: 'belegt' },
  { name: 'R210', building: 'R', floor: 'Etage 2', capacity: 8, equipment: ['Gruppentisch', 'WLAN'], status: 'belegt' },
  { name: 'S014', building: 'S', floor: 'Erdgeschoss', capacity: 5, equipment: ['Whiteboard', 'WLAN'], status: 'frei' },
  { name: 'T201', building: 'T', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'WLAN'], status: 'belegt' },
  { name: 'X001', building: 'X', floor: 'Erdgeschoss', capacity: 8, equipment: ['Gruppentisch', 'WLAN'], status: 'frei' },
  { name: 'F118', building: 'F', floor: 'Etage 1', capacity: 10, equipment: ['Smartboard', 'Steckdosen'], status: 'belegt' },
  { name: 'F204', building: 'F', floor: 'Etage 2', capacity: 6, equipment: ['WLAN', 'Whiteboard'], status: 'frei' },
  { name: 'V1 Audimax', building: 'V1', floor: 'Erdgeschoss', capacity: 80, equipment: ['Audimax', 'Beamer'], status: 'belegt' },
  { name: 'V2.01', building: 'V2', floor: 'Erdgeschoss', capacity: 12, equipment: ['Audimax nah', 'WLAN'], status: 'frei' },
];

const campusFootprints = [
  {
    id: 'y1',
    name: 'Gebäude Y1',
    short: 'Y1',
    x: -7.1,
    z: -5.9,
    labelOffset: [0, 0, 0.2] as [number, number, number],
    footprint: [
      { x: -0.35, z: -1.05, width: 1.05, depth: 1.0 },
      { x: 0.1, z: 0.05, width: 1.0, depth: 2.55 },
      { x: 0.02, z: 1.75, width: 1.05, depth: 0.95 },
      { x: -0.42, z: 0.95, width: 0.5, depth: 0.55 },
    ],
  },
  {
    id: 'y2',
    name: 'Gebäude Y2',
    short: 'Y2',
    x: -5.45,
    z: -1.35,
    footprint: [
      { x: -0.25, z: 0, width: 1.1, depth: 1.15, rotation: -0.08 },
      { x: 0.55, z: -0.1, width: 0.95, depth: 1.2, rotation: 0.08 },
    ],
  },
  {
    id: 'z',
    name: 'Gebäude Z',
    short: 'Z',
    x: 2.9,
    z: -4.35,
    labelOffset: [0.7, 0, 0] as [number, number, number],
    footprint: [
      { x: 0.65, z: 0, width: 3.2, depth: 1.25 },
      { x: -1.18, z: 0.08, width: 1.1, depth: 2.2, rotation: 0.18 },
      { x: -0.5, z: 0.62, width: 1.2, depth: 0.72 },
    ],
  },
  {
    id: 'r',
    name: 'Gebäude R',
    short: 'R',
    x: -1.45,
    z: -1.1,
    footprint: [
      { x: 0, z: 0, width: 0.9, depth: 2.75, rotation: 0.18 },
      { x: 0.55, z: -0.72, width: 0.62, depth: 0.95, rotation: 0.18 },
      { x: 0.45, z: 0.38, width: 0.54, depth: 0.9, rotation: 0.18 },
    ],
  },
  {
    id: 's',
    name: 'Gebäude S',
    short: 'S',
    x: -1.55,
    z: 2.1,
    footprint: [
      { x: 0, z: 0, width: 0.95, depth: 2.1, rotation: 0.18 },
      { x: 0.34, z: 0.86, width: 0.54, depth: 0.72, rotation: 0.18 },
    ],
  },
  {
    id: 't',
    name: 'Gebäude T',
    short: 'T',
    x: 0.5,
    z: -0.7,
    footprint: [
      { x: 0, z: 0, width: 0.62, depth: 1.85, rotation: -0.16 },
    ],
  },
  {
    id: 'x',
    name: 'Gebäude X',
    short: 'X',
    x: 0.75,
    z: 1.15,
    footprint: [
      { x: 0, z: 0, width: 1.28, depth: 0.82 },
    ],
  },
  {
    id: 'w',
    name: 'Gebäude W',
    short: 'W',
    x: 2.35,
    z: 2.35,
    labelOffset: [0.35, 0, 0] as [number, number, number],
    footprint: [
      { x: 0, z: 0, width: 3.25, depth: 0.86 },
      { x: -1.38, z: -0.36, width: 0.86, depth: 0.76 },
      { x: 1.35, z: -0.42, width: 0.82, depth: 0.72 },
    ],
  },
  {
    id: 'f',
    name: 'Gebäude F',
    short: 'F',
    x: -6.1,
    z: 3.15,
    labelOffset: [0.85, 0, 0.18] as [number, number, number],
    footprint: [
      { x: -0.75, z: 0.1, width: 2.8, depth: 1.16 },
      { x: 0.78, z: 0.42, width: 0.95, depth: 1.08, rotation: -0.16 },
      { x: 1.42, z: 0.55, width: 0.55, depth: 0.82, rotation: -0.32 },
    ],
  },
  {
    id: 'v1',
    name: 'Gebäude V1',
    short: 'V1',
    x: 5.75,
    z: -0.55,
    footprint: [
      { x: 0, z: 0, width: 1.55, depth: 1.0 },
    ],
  },
  {
    id: 'v2',
    name: 'Gebäude V2',
    short: 'V2',
    x: 5.45,
    z: 1.0,
    footprint: [
      { x: 0, z: 0, width: 1.65, depth: 1.35 },
      { x: 0.82, z: 0.62, width: 0.8, depth: 0.55 },
    ],
  },
];

const loadColor: Record<LoadLevel, string> = { free: '#19a66a', medium: '#f4b740', busy: '#d9534f' };
const loadLabel: Record<LoadLevel, string> = { free: 'Alle Räume frei', medium: 'Teilweise freie Räume', busy: 'Alle Räume belegt' };
const roomColor: Record<RoomStatus, string> = { frei: '#19a66a', belegt: '#d9534f' };
const buildingHeights: Record<string, number> = {
  y1: 1.35,
  y2: 0.85,
  z: 1.55,
  r: 1.15,
  s: 0.95,
  t: 1.25,
  x: 0.8,
  w: 1.45,
  f: 1.05,
  v1: 1.2,
  v2: 0.9,
};

function getLoad(buildingRooms: Room[]): LoadLevel {
  if (buildingRooms.length === 0) return 'busy';
  const free = buildingRooms.filter((room) => room.status === 'frei').length;
  if (free === 0) return 'busy';
  if (free === buildingRooms.length) return 'free';
  return 'medium';
}

function App() {
  const buildings = useMemo<Building[]>(
    () => campusFootprints.map((building) => {
      const buildingRooms = rooms.filter((room) => room.building === building.short);
      return {
        id: building.id,
        name: building.name,
        short: building.short,
        position: [building.x, 0.5, building.z],
        labelOffset: building.labelOffset,
        footprint: building.footprint,
        load: getLoad(buildingRooms),
        rooms: buildingRooms,
      };
    }),
    [],
  );

  const [selected, setSelected] = useState<Building | null>(buildings.find((building) => building.short === 'W') ?? buildings[0]);

  return (
    <main className="appShell">
      <section className="sceneWrap">
        <div className="topBar">
          <div>
            <span className="kicker">StudySpace Campus 3D</span>
            <h1>HSNR Campus MG</h1>
          </div>
          <div className="legend">
            <span><i className="free" /> alle frei</span>
            <span><i className="medium" /> teilweise frei</span>
            <span><i className="busy" /> belegt</span>
          </div>
        </div>

        <Canvas camera={{ position: [7.8, 7.4, 11.6], fov: 46 }} shadows dpr={[1, 1.75]}>
          <color attach="background" args={['#e9f0f5']} />
          <fog attach="fog" args={['#e9f0f5', 18, 34]} />
          <ambientLight intensity={0.32} />
          <hemisphereLight args={['#dcecff', '#71806c', 1.1]} />
          <directionalLight
            position={[-7, 12, 8]}
            intensity={2.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0004}
          />
          <CampusScene buildings={buildings} selected={selected} onSelect={setSelected} />
        </Canvas>

        <div className="hint">Startpunkt: Parkplatz P · Ziehen zum Drehen · Scrollen zum Zoomen · Gebäude anklicken</div>
      </section>

      <aside className={`infoPanel ${selected ? 'open' : ''}`}>
        {selected ? (
          <>
            <button className="closeButton" type="button" onClick={() => setSelected(null)}>×</button>
            <span className="kicker">Gebäudedetails</span>
            <h2>{selected.name}</h2>
            <div className={`loadPill ${selected.load}`}>{loadLabel[selected.load]}</div>
            <p className="panelText">
              {selected.rooms.filter((room) => room.status === 'frei').length} von {selected.rooms.length} Räumen sind aktuell frei.
            </p>
            <div className="roomList">
              {selected.rooms.length > 0 ? selected.rooms.map((room) => (
                <article className="roomCard" style={{ borderLeftColor: roomColor[room.status] }} key={room.name}>
                  <div className="roomTop">
                    <strong>{room.name}</strong>
                    <span className={`roomStatus ${room.status === 'frei' ? 'free' : 'busy'}`}>{room.status}</span>
                  </div>
                  <span>{room.floor} · {room.capacity} Plätze</span>
                  <p>{room.equipment.slice(0, 3).join(' · ')}</p>
                </article>
              )) : (
                <article className="roomCard">
                  <strong>Keine Lernräume hinterlegt</strong>
                  <span>Für dieses Gebäude sind im PoC noch keine Räume erfasst.</span>
                </article>
              )}
            </div>
          </>
        ) : (
          <div className="emptyPanel">
            <h2>Gebäude auswählen</h2>
            <p>Klicke auf einen Campusblock, um Räume und Auslastung zu sehen.</p>
          </div>
        )}
      </aside>
    </main>
  );
}

function CampusScene({ buildings, selected, onSelect }: { buildings: Building[]; selected: Building | null; onSelect: (building: Building) => void }) {
  const controls = useRef<ControlsRef | null>(null);
  const focus = selected?.position ?? [0, 0.2, 0];

  return (
    <>
      <CameraRig controls={controls} target={focus} />
      <OrbitControls ref={controls} enableDamping dampingFactor={0.08} minDistance={6} maxDistance={22} maxPolarAngle={Math.PI / 2.15} target={[0, 0, 0]} />
      <Ground />
      <Roads />
      <Parking />
      <Landscaping />
      {buildings.map((building) => (
        <BuildingBlock key={building.id} building={building} selected={selected?.id === building.id} onSelect={onSelect} />
      ))}
      <ContactShadows position={[0, 0.035, 0]} opacity={0.28} scale={20} blur={2.8} far={11} resolution={512} />
    </>
  );
}

function CameraRig({ controls, target }: { controls: MutableRefObject<ControlsRef | null>; target: [number, number, number] }) {
  const { camera } = useThree();
  const targetVector = useMemo(() => new THREE.Vector3(), []);
  const cameraVector = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const [x, y, z] = target;
    targetVector.set(x, y, z);
    controls.current?.target.lerp(targetVector, 0.06);
    cameraVector.set(x + 4.8, y + 4.3, z + 5.8);
    camera.position.lerp(cameraVector, 0.035);
    controls.current?.update();
  });

  return null;
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial color="#dfe8dd" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[16.8, 13.8]} />
        <meshStandardMaterial color="#edf1e9" roughness={0.92} />
      </mesh>
    </group>
  );
}

function Roads() {
  const roads = [
    { position: [-2.95, 0.015, 0.1] as [number, number, number], scale: [0.72, 0.08, 13.5] as [number, number, number], rotation: -0.12 },
    { position: [-3.35, 0.018, -5.75] as [number, number, number], scale: [8.3, 0.08, 0.36] as [number, number, number], rotation: 0 },
    { position: [-5.7, 0.018, 2.25] as [number, number, number], scale: [4.4, 0.08, 0.36] as [number, number, number], rotation: 0.12 },
    { position: [-3.95, 0.018, 3.28] as [number, number, number], scale: [2.8, 0.08, 0.34] as [number, number, number], rotation: 0.85 },
    { position: [2.0, 0.018, -3.1] as [number, number, number], scale: [4.7, 0.08, 0.32] as [number, number, number], rotation: 0 },
    { position: [4.1, 0.018, -2.1] as [number, number, number], scale: [0.3, 0.08, 2.0] as [number, number, number], rotation: 0 },
    { position: [4.05, 0.018, 0.85] as [number, number, number], scale: [0.34, 0.08, 3.9] as [number, number, number], rotation: 0 },
    { position: [2.15, 0.018, 1.18] as [number, number, number], scale: [3.5, 0.08, 0.32] as [number, number, number], rotation: 0.22 },
    { position: [5.8, 0.018, 0.2] as [number, number, number], scale: [0.36, 0.08, 4.9] as [number, number, number], rotation: 0 },
    { position: [1.0, 0.018, 2.75] as [number, number, number], scale: [4.8, 0.08, 0.33] as [number, number, number], rotation: 0 },
    { position: [-0.55, 0.018, -0.35] as [number, number, number], scale: [5.1, 0.08, 0.28] as [number, number, number], rotation: -1.25 },
  ];

  return (
    <>
      {roads.map((road, index) => (
        <mesh key={index} position={road.position} rotation-y={road.rotation}>
          <boxGeometry args={road.scale} />
          <meshStandardMaterial color="#b5b7ba" roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[2.95, 0.03, 0.25]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.58, 40]} />
        <meshStandardMaterial color="#b5b7ba" />
      </mesh>
    </>
  );
}

function Landscaping() {
  const trees = [
    [-7.5, -3.7], [-6.4, -3.9], [-4.4, -4.4], [-3.7, -2.4], [-3.9, 0.2],
    [-7.4, 1.2], [-5.1, 4.4], [-2.6, 4.6], [0.4, 4.2], [3.9, 4.5],
    [5.0, 2.8], [6.8, 3.5], [6.8, -2.0], [4.9, -3.5], [0.2, -5.5],
  ] as [number, number][];

  return (
    <group>
      {trees.map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, 0, z]} scale={0.82 + (index % 3) * 0.08}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.075, 0.48, 8]} />
            <meshStandardMaterial color="#8a6a4d" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color={index % 2 ? '#3f7657' : '#4f8662'} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Parking() {
  return (
    <group position={[6.95, 0.045, 1.45]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.45, 2.65]} />
        <meshStandardMaterial color="#e6e7e8" />
      </mesh>
      <Text position={[0, 0.08, 0]} rotation-x={-Math.PI / 2} fontSize={0.55} color="#8b8f94" anchorX="center" anchorY="middle">
        P
      </Text>
    </group>
  );
}

function BuildingBlock({ building, selected, onSelect }: { building: Building; selected: boolean; onSelect: (building: Building) => void }) {
  const color = loadColor[building.load];
  const label = building.labelOffset ?? [0, 0, 0];
  const height = buildingHeights[building.id] ?? 1;

  return (
    <group position={[building.position[0], height / 2, building.position[2]]}>
      {building.footprint.map((part, index) => (
        <group key={index} position={[part.x, 0, part.z]} rotation-y={part.rotation ?? 0}>
          <mesh
            castShadow
            receiveShadow
            onClick={(event) => {
              event.stopPropagation();
              onSelect(building);
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <boxGeometry args={[part.width, height, part.depth]} />
            <meshStandardMaterial color={selected ? '#ffffff' : '#f5f4ef'} roughness={0.7} metalness={0.02} />
          </mesh>
          <mesh position={[0, height / 2 + 0.045, 0]} castShadow>
            <boxGeometry args={[part.width + 0.06, 0.09, part.depth + 0.06]} />
            <meshStandardMaterial color={color} roughness={0.48} emissive={color} emissiveIntensity={selected ? 0.32 : 0.08} />
          </mesh>
          {part.width > 0.8 && (
            <mesh position={[0, 0, part.depth / 2 + 0.006]}>
              <planeGeometry args={[part.width * 0.62, Math.min(0.24, height * 0.22)]} />
              <meshStandardMaterial color="#244158" roughness={0.38} metalness={0.12} />
            </mesh>
          )}
        </group>
      ))}
      {selected && (
        <mesh position={[0, -height / 2 + 0.025, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.06, 1.28, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} />
        </mesh>
      )}
      <Text position={[label[0], height / 2 + 0.48 + label[1], label[2]]} fontSize={0.4} color="#173047" anchorX="center" anchorY="middle" outlineWidth={0.018} outlineColor="#ffffff">
        {building.short}
      </Text>
    </group>
  );
}

export default App;
