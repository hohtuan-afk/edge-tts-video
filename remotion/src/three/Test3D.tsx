// Đoạn thử 3D: máy thở + bộ dây gợn trong suốt + dòng khí phát sáng + phổi 3D có cây phế quản.
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, ap} from '../lib';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// ---------- môi trường ánh sáng (không cần tải HDR) ----------
const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    return () => {
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

const CameraRig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const k = interpolate(t, [2.5, 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    const ang = lerp(-0.18, 0.55, k);
    const r = lerp(11.5, 7.2, k);
    const target = V(lerp(-0.2, 2.2, k), lerp(0, -0.1, k), 0);
    camera.position.set(target.x + r * Math.sin(ang), lerp(1.6, 1.2, k) + 0.15 * Math.sin(t * 0.6), r * Math.cos(ang));
    camera.lookAt(target);
    (camera as THREE.PerspectiveCamera).fov = 35;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, t]);
  return null;
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- máy thở ----------
const roundedBox = (w: number, h: number, d: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, {depth: d, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 10});
  g.translate(0, 0, -d / 2);
  return g;
};

const Ventilator: React.FC<{t: number}> = ({t}) => {
  const body = useMemo(() => roundedBox(1.7, 2.6, 1.1, 0.18), []);
  const screen = useMemo(() => roundedBox(1.3, 0.85, 0.02, 0.08), []);
  const wave = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const ph = (u * 2 + t / 2) % 1;
      const v = ph < 0.35 ? Math.min(1, ph / 0.06) : Math.max(0, 1 - (ph - 0.35) / 0.08);
      pts.push(V(-0.55 + u * 1.1, -0.25 + v * 0.42, 0));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.012, 6);
  }, [t]);
  return (
    <group position={[-3.4, 0, 0]}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#E6ECF3" roughness={0.32} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.25} />
      </mesh>
      <mesh geometry={screen} position={[0, 0.62, 0.62]}>
        <meshPhysicalMaterial color="#061322" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh geometry={wave} position={[0, 0.62, 0.66]}>
        <meshBasicMaterial color="#5EEAD4" toneMapped={false} />
      </mesh>
      {[-0.45, 0, 0.45].map((x) => (
        <mesh key={x} position={[x, -0.15, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 32]} />
          <meshPhysicalMaterial color="#2B3647" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -0.75, 0.6]}>
        <boxGeometry args={[1.2, 0.08, 0.04]} />
        <meshBasicMaterial color={C.amber} toneMapped={false} />
      </mesh>
      {[0.45, -0.45].map((y) => (
        <mesh key={y} position={[0.9, y, 0.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.22, 28]} />
          <meshPhysicalMaterial color="#9AA8BA" roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- ống gợn trong suốt + dòng khí ----------
const Corrugated: React.FC<{curve: THREE.Curve<THREE.Vector3>; color: string; r?: number}> = ({curve, color, r = 0.16}) => {
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 220, r, 24), [curve, r]);
  const ribs = useMemo(() => {
    const L = curve.getLength();
    const n = Math.floor(L / 0.07);
    const geo = new THREE.TorusGeometry(r * 1.02, r * 0.16, 8, 28);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshPhysicalMaterial({color, roughness: 0.25, transparent: true, opacity: 0.85, clearcoat: 1}), n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const p = curve.getPointAt(u);
      const tg = curve.getTangentAt(u);
      q.setFromUnitVectors(V(0, 0, 1), tg);
      m.compose(p, q, V(1, 1, 1));
      mesh.setMatrixAt(i, m);
    }
    return mesh;
  }, [curve, color, r]);
  return (
    <group>
      <mesh geometry={tube}>
        <meshPhysicalMaterial color={color} roughness={0.15} transparent opacity={0.35} clearcoat={1} depthWrite={false} />
      </mesh>
      <primitive object={ribs} />
    </group>
  );
};

const FlowDots: React.FC<{curve: THREE.Curve<THREE.Vector3>; n: number; t: number; color: string; speed?: number; r?: number}> = ({
  curve, n, t, color, speed = 0.12, r = 0.055,
}) => (
  <group>
    {Array.from({length: n}, (_, i) => {
      const u = (i / n + t * speed) % 1;
      const p = curve.getPointAt(u);
      const fade = Math.min(1, u / 0.05, (1 - u) / 0.05);
      return (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[r, 16, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={fade} />
          </mesh>
          <mesh>
            <sphereGeometry args={[r * 2.6, 16, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.18 * fade} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ---------- phổi 3D ----------
const lobeGeometry = (side: 1 | -1) => {
  const g = new THREE.SphereGeometry(1, 72, 54);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let {x, y, z} = v;
    const taper = 1 - 0.38 * Math.max(0, y);
    x *= 0.62 * taper;
    z *= 0.5 * taper;
    if (x * side < 0) x *= 0.42; // mặt trong phẳng hơn
    if (y < -0.55) y = -0.55 + (y + 0.55) * 0.45; // đáy phẳng (cơ hoành)
    y *= 1.15;
    const n = 0.025 * Math.sin(x * 9 + y * 7) * Math.cos(z * 8 + y * 5);
    pos.setXYZ(i, x + n, y + n, z + n);
  }
  g.computeVertexNormals();
  return g;
};

const Bronchi: React.FC = () => {
  const segs = useMemo(() => {
    const out: {a: THREE.Vector3; b: THREE.Vector3; r: number}[] = [];
    const grow = (a: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
      const b = a.clone().add(dir.clone().multiplyScalar(len));
      out.push({a, b, r});
      if (depth === 0) return;
      for (const s of [-1, 1]) {
        const d = dir.clone().applyAxisAngle(V(0, 0, 1), s * (0.45 + 0.1 * depth)).applyAxisAngle(V(0, 1, 0), s * 0.5).normalize();
        grow(b, d, len * 0.72, r * 0.68, depth - 1);
      }
    };
    for (const s of [-1, 1]) grow(V(0, 0.55, 0), V(s * 0.75, -0.55, 0).normalize(), 0.55, 0.075, 4);
    return out;
  }, []);
  return (
    <group>
      {segs.map(({a, b, r}, i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[r * 0.8, r, len, 10]} />
            <meshStandardMaterial color="#FFE7EE" emissive="#FF9DB6" emissiveIntensity={0.9} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

const Lungs3D: React.FC<{t: number; pos: [number, number, number]}> = ({t, pos}) => {
  const L = useMemo(() => lobeGeometry(1), []);
  const R = useMemo(() => lobeGeometry(-1), []);
  const k = 1 + 0.045 * Math.sin((2 * Math.PI * t) / 4);
  return (
    <group position={pos}>
      <group scale={[k, k, k]}>
        <Bronchi />
        {[[-0.68, L], [0.68, R]].map(([x, g], i) => (
          <mesh key={i} geometry={g as THREE.BufferGeometry} position={[x as number, -0.05, 0]}>
            <meshPhysicalMaterial color="#F28CA6" roughness={0.42} sheen={1} sheenColor="#FFD2DE" sheenRoughness={0.5} clearcoat={0.35} transparent opacity={0.72} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* khí quản có vòng sụn */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.25, 24]} />
        <meshPhysicalMaterial color="#DCE6F2" roughness={0.35} clearcoat={0.6} />
      </mesh>
      {Array.from({length: 9}, (_, i) => (
        <mesh key={i} position={[0, 0.65 + i * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.128, 0.022, 8, 24]} />
          <meshPhysicalMaterial color="#F4F7FB" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- bình làm ẩm ----------
const Humidifier: React.FC<{p: THREE.Vector3; t: number}> = ({p, t}) => (
  <group position={[p.x, p.y - 0.55, p.z]}>
    <mesh>
      <cylinderGeometry args={[0.34, 0.34, 0.6, 40]} />
      <meshPhysicalMaterial color="#CFEFFF" roughness={0.05} transparent opacity={0.28} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh position={[0, -0.12 + 0.01 * Math.sin(t * 2), 0]}>
      <cylinderGeometry args={[0.31, 0.31, 0.32, 40]} />
      <meshPhysicalMaterial color="#3BA7F0" roughness={0.1} transparent opacity={0.7} emissive="#0B4F8A" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0, -0.38, 0]}>
      <cylinderGeometry args={[0.42, 0.44, 0.16, 40]} />
      <meshPhysicalMaterial color="#2A3242" roughness={0.4} metalness={0.5} />
    </mesh>
    <mesh position={[0, -0.3, 0.38]}>
      <boxGeometry args={[0.3, 0.05, 0.04]} />
      <meshBasicMaterial color="#FB7185" toneMapped={false} />
    </mesh>
  </group>
);

const Floor: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]}>
      <planeGeometry args={[14, 5]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC<{t: number}> = ({t}) => {
  const lungPos: [number, number, number] = [2.9, -0.35, 0];
  const curves = useMemo(() => {
    const Y = V(1.45, 0.05, 0.35);
    const insp = new THREE.CatmullRomCurve3([V(-2.45, -0.45, 0.15), V(-1.7, -0.75, 0.45), V(-0.3, -0.95, 0.75), V(0.8, -0.55, 0.6), Y]);
    const exp = new THREE.CatmullRomCurve3([Y, V(0.8, 0.65, 0.5), V(-0.4, 0.95, 0.4), V(-1.7, 0.75, 0.25), V(-2.45, 0.45, 0.15)]);
    const pat = new THREE.CatmullRomCurve3([Y, V(2.0, 0.25, 0.25), V(2.55, 1.1, 0.08), V(2.9, 1.75, 0)]);
    const inspFlow = new THREE.CatmullRomCurve3([...insp.points, ...pat.points.slice(1)]);
    const expFlow = new THREE.CatmullRomCurve3([...[...pat.points].reverse(), ...exp.points.slice(1)]);
    return {Y, insp, exp, pat, inspFlow, expFlow};
  }, []);
  const hp = curves.insp.getPointAt(0.3);
  return (
    <>
      <Env />
      <CameraRig t={t} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#FFFFFF" />
      <directionalLight position={[-6, 2, -4]} intensity={1.2} color="#5EB8FF" />
      <pointLight position={[3, 0, 3]} intensity={6} distance={6} color="#FF9DB6" />
      <Floor />
      <Ventilator t={t} />
      <Corrugated curve={curves.insp} color="#7FD6F5" />
      <Corrugated curve={curves.exp} color="#B9A6FF" />
      <Corrugated curve={curves.pat} color="#C9D6EA" r={0.12} />
      <mesh position={curves.Y}>
        <sphereGeometry args={[0.2, 32, 24]} />
        <meshPhysicalMaterial color="#F5C451" roughness={0.3} clearcoat={1} />
      </mesh>
      <Humidifier p={hp} t={t} />
      <FlowDots curve={curves.inspFlow} n={26} t={t} color="#5EEAD4" />
      <FlowDots curve={curves.expFlow} n={20} t={t} color="#C4B5FD" speed={0.1} />
      <Lungs3D t={t} pos={lungPos} />
    </>
  );
};

export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const fade = Math.min(1, f / 15, (durationInFrames - f) / 20);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 55% 40%, #1A2C4A, ${C.bg0} 70%)`, opacity: fade}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0, 1.6, 11.5], near: 0.1, far: 100}}>
        <Scene t={t} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 80, top: 56, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.txt, opacity: ap(t, 0.3)}}>
        Hệ thống máy thở <span style={{color: C.amber}}>· bản thử 3D</span>
      </div>
      {[
        ['Máy thở', 0.8, 300, 760],
        ['Bộ dây · nhánh hít vào', 1.4, 760, 780],
        ['Phổi + cây phế quản', 2.0, 1430, 860],
      ].map(([s, d, x, y]) => (
        <div
          key={String(s)}
          style={{
            position: 'absolute', left: Number(x), top: Number(y), fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.txt,
            padding: '8px 20px', borderRadius: 16, background: 'rgba(8,14,26,0.7)', border: '1.5px solid rgba(160,185,225,0.25)',
            opacity: Math.min(ap(t, Number(d)), 1 - ap(t, 3.2)),
          }}
        >
          {s}
        </div>
      ))}
    </AbsoluteFill>
  );
};
