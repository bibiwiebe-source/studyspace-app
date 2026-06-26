import { useMemo, useRef, useState } from 'react';
import type { ComponentRef, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

type LoadLevel = 'free' | 'medium' | 'busy';

type Room = {
  name: string;
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  status: 'frei' | 'teilweise belegt' | 'belegt';
};

type Building = {
  id: string;
  name: string;
  short: string;
  position: [number, number, number];
  load: LoadLevel;
  rooms: Room[];
};

type ControlsRef = ComponentRef<typeof OrbitControls>;

const rooms: Room[] = [
  { name: 'W101', building: 'W', floor: 'Etage 1', capacity: 6, equipment: ['Beamer', 'Whiteboard', 'WLAN'], status: 'teilweise belegt' },
  { name: 'W204', building: 'W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Steckdosen', 'WLAN'], status: 'frei' },
  { name: 'W220', building: 'W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Glasboard', 'WLAN'], status: 'frei' },
  { name: 'Z015', building: 'Z', floor: 'Erdgeschoss', capacity: 8, equipment: ['Whiteboard', 'Gruppentisch', 'WLAN'], status: 'teilweise belegt' },
  { name: 'Z022', building: 'Z', floor: 'Etage 2', capacity: 2, equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN'], status: 'frei' },
  { name: 'Z404', building: 'Z', floor: 'Etage 4', capacity: 14, equipment: ['Whiteboard', 'Hybrid-Meeting', 'WLAN'], status: 'belegt' },
  { name: 'Y1.03', building: 'Y1', floor: 'Etage 1', capacity: 6, equipment: ['Monitorwand', 'Whiteboard', 'WLAN'], status: 'teilweise belegt' },
  { name: 'Y1.10', building: 'Y1', floor: 'Etage 1', capacity: 10, equipment: ['Beamer', 'Lautsprecher', 'WLAN'], status: 'belegt' },
  { name: 'Y1.15', building: 'Y1', floor: 'Etage 1', capacity: 8, equipment: ['Beamer', 'Whiteboard', 'WLAN'], status: 'frei' },
  { name: 'R102', building: 'R', floor: 'Etage 1', capacity: 6, equipment: ['Arbeitsplätze', 'WLAN'], status: 'teilweise belegt' },
  { name: 'S014', building: 'S', floor: 'Erdgeschoss', capacity: 5, equipment: ['Whiteboard', 'WLAN'], status: 'frei' },
  { name: 'T201', building: 'T', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'WLAN'], status: 'belegt' },
  { name: 'X001', building: 'X', floor: 'Erdgeschoss', capacity: 8, equipment: ['Gruppentisch', 'WLAN'], status: 'frei' },
  { name: 'F118', building: 'F', floor: 'Etage 1', capacity: 10, equipment: ['Smartboard', 'Steckdosen'], status: 'teilweise belegt' },
  { name: 'Y2.04', building: 'Y2', floor: 'Erdgeschoss', capacity: 4, equipment: ['Whiteboard', 'WLAN'], status: 'frei' },
];

const campusPositions = [
  { id: 'y1', name: 'Gebäude Y1', short: 'Y1', x: -6.3, z: -5.9 },
  { id: 'y2', name: 'Gebäude Y2', short: 'Y2', x: -5.2, z: -1.7 },
  { id: 'z', name: 'Gebäude Z', short: 'Z', x: 3.6, z: -4.8 },
  { id: 'r', name: 'Gebäude R', short: 'R', x: -1.5, z: -2.3 },
  { id: 's', name: 'Gebäude S', short: 'S', x: -1.4, z: 1.4 },
  { id: 't', name: 'Gebäude T', short: 'T', x: 1.1, z: -1.2 },
  { id: 'x', name: 'Gebäude X', short: 'X', x: 0.7, z: 1.3 },
  { id: 'w', name: 'Gebäude W', short: 'W', x: 4.6, z: 2.4 },
  { id: 'f', name: 'Gebäude F', short: 'F', x: -5.6, z: 3.0 },
];

const loadColor: Record<LoadLevel, string> = { free: '#19a66a', medium: '#f4b740', busy: '#d9534f' };
const loadLabel: Record<LoadLevel, string> = { free: 'Viele freie Räume', medium: 'Teilweise ausgelastet', busy: 'Stark ausgelastet' };

function getLoad(buildingRooms: Room[]): LoadLevel {
  const free = buildingRooms.filter((room) => room.status === 'frei').length;
  if (buildingRooms.length === 0 || free >= 2) return 'free';
  if (free === 1 || buildingRooms.some((room) => room.status === 'teilweise belegt')) return 'medium';
  return 'busy';
}

function App() {
  const buildings = useMemo<Building[]>(
    () => campusPositions.map((building) => {
      const buildingRooms = rooms.filter((room) => room.building === building.short);
      return {
        id: building.id,
        name: building.name,
        short: building.short,
        position: [building.x, 0.6, building.z],
        load: getLoad(buildingRooms),
        rooms: buildingRooms.length > 0 ? buildingRooms : [
          { name: `${building.short}.01`, building: building.short, floor: 'Erdgeschoss', capacity: 6, equipment: ['WLAN', 'Steckdosen'], status: 'frei' },
        ],
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
            <span><i className="free" /> frei</span>
            <span><i className="medium" /> teilweise</span>
            <span><i className="busy" /> stark</span>
          </div>
        </div>

        <Canvas camera={{ position: [7.8, 7.4, 11.6], fov: 48 }} shadows>
          <color attach="background" args={['#eef3f8']} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[8, 12, 7]} intensity={1.4} castShadow />
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
            <p className="panelText">Dummy-Auslastung: {selected.load === 'free' ? 'niedrig' : selected.load === 'medium' ? 'mittel' : 'hoch'}.</p>
            <div className="roomList">
              {selected.rooms.map((room) => (
                <article className="roomCard" key={room.name}>
                  <strong>{room.name}</strong>
                  <span>{room.floor} · {room.capacity} Plätze · {room.status}</span>
                  <p>{room.equipment.slice(0, 3).join(' · ')}</p>
                </article>
              ))}
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
      {buildings.map((building) => (
        <BuildingBlock key={building.id} building={building} selected={selected?.id === building.id} onSelect={onSelect} />
      ))}
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
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[18, 15]} />
      <meshStandardMaterial color="#dfe8ef" />
    </mesh>
  );
}

function Roads() {
  const roads = [
    { position: [0, 0.012, 4.6] as [number, number, number], scale: [15, 0.08, 0.55] as [number, number, number], rotation: 0 },
    { position: [5.9, 0.014, -0.5] as [number, number, number], scale: [0.55, 0.08, 10] as [number, number, number], rotation: 0 },
    { position: [-3.9, 0.014, -0.9] as [number, number, number], scale: [0.42, 0.08, 10] as [number, number, number], rotation: -0.22 },
    { position: [-1.2, 0.016, 0.1] as [number, number, number], scale: [8.8, 0.08, 0.32] as [number, number, number], rotation: -0.58 },
    { position: [1.5, 0.018, -3.2] as [number, number, number], scale: [7.2, 0.08, 0.3] as [number, number, number], rotation: 0.38 },
  ];

  return (
    <>
      {roads.map((road, index) => (
        <mesh key={index} position={road.position} rotation-y={road.rotation}>
          <boxGeometry args={road.scale} />
          <meshStandardMaterial color="#aab3bd" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[-1.9, 0.03, 2.7]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.55, 40]} />
        <meshStandardMaterial color="#aab3bd" />
      </mesh>
    </>
  );
}

function Parking() {
  return (
    <group position={[3.4, 0.04, 5.8]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial color="#cbd5df" />
      </mesh>
      <Text position={[0, 0.08, 0]} rotation-x={-Math.PI / 2} fontSize={0.45} color="#0b1f3a" anchorX="center" anchorY="middle">P</Text>
    </group>
  );
}

function BuildingBlock({ building, selected, onSelect }: { building: Building; selected: boolean; onSelect: (building: Building) => void }) {
  const color = loadColor[building.load];
  return (
    <group position={building.position}>
      <mesh
        castShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(building);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[1.15, 1.2, 1.15]} />
        <meshStandardMaterial color={color} roughness={0.55} emissive={selected ? color : '#000000'} emissiveIntensity={selected ? 0.18 : 0} />
      </mesh>
      {selected && (
        <mesh position={[0, -0.58, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.88, 1.05, 40]} />
          <meshBasicMaterial color="#0b1f3a" />
        </mesh>
      )}
      <Text position={[0, 1.55, 0]} fontSize={0.38} color="#0b1f3a" anchorX="center" anchorY="middle">{building.short}</Text>
      <Html position={[0.68, 1.12, 0]} center distanceFactor={10}>
        <span className={`miniBadge ${building.load}`}>{building.rooms.filter((room) => room.status === 'frei').length}</span>
      </Html>
    </group>
  );
}

export default App;
