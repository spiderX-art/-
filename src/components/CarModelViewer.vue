<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { PaintOption } from '../types/car';

const props = defineProps<{
  paint: PaintOption;
  modelUrl?: string;
}>();

const viewportRef = ref<HTMLDivElement | null>(null);

const paintColors: Record<string, number> = {
  'factory-celadon': 0xc5d9e6,
  'liquid-silver': 0xd7dde8,
  'solar-red': 0xc41f3b,
  'ion-blue': 0x2563eb,
  graphite: 0x27272a,
};

const factoryPalette = {
  exterior: 0xc5d9e6,
  interior: 0x4a7b6f,
  detail: 0xb8c0c8,
  caliper: 0xe11d48,
};

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let animationFrame = 0;
let resizeObserver: ResizeObserver | null = null;
let exteriorMaterials: Array<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial> = [];
let interiorMaterials: Array<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial> = [];
let detailMaterials: Array<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial> = [];
let caliperMaterials: Array<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial> = [];
let showroomTimer: ReturnType<typeof window.setTimeout> | null = null;
let pointerInsideViewport = false;

const clearShowroomTimer = () => {
  if (!showroomTimer) return;
  window.clearTimeout(showroomTimer);
  showroomTimer = null;
};

const setShowroomRotation = (enabled: boolean) => {
  if (!controls) return;
  controls.autoRotate = enabled;
};

const pauseShowroomRotation = () => {
  clearShowroomTimer();
  setShowroomRotation(false);
};

const queueShowroomRotation = () => {
  clearShowroomTimer();
  showroomTimer = window.setTimeout(() => {
    if (!pointerInsideViewport) setShowroomRotation(true);
  }, 5000);
};

const handlePointerEnter = () => {
  pointerInsideViewport = true;
  pauseShowroomRotation();
};

const handlePointerLeave = () => {
  pointerInsideViewport = false;
  pauseShowroomRotation();
  queueShowroomRotation();
};

const handlePointerDown = () => {
  pauseShowroomRotation();
};

const handlePointerMove = () => {
  if (pointerInsideViewport) pauseShowroomRotation();
};

const handlePointerUp = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    pointerInsideViewport = false;
    queueShowroomRotation();
  }
};

const handleWheel = () => {
  pauseShowroomRotation();
};

const tunePhysicalMaterial = (
  material: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial,
  options: { color: number; metalness: number; roughness: number; clearcoat?: number; clearcoatRoughness?: number },
) => {
  material.color.setHex(options.color);
  material.metalness = options.metalness;
  material.roughness = options.roughness;
  if (material instanceof THREE.MeshPhysicalMaterial) {
    material.clearcoat = options.clearcoat ?? material.clearcoat;
    material.clearcoatRoughness = options.clearcoatRoughness ?? material.clearcoatRoughness;
  }
  material.needsUpdate = true;
};

const createVehicleModel = () => {
  const vehicle = new THREE.Group();

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: paintColors[props.paint.id] ?? paintColors['liquid-silver'],
    metalness: 0.72,
    roughness: 0.26,
    clearcoat: 0.85,
    clearcoatRoughness: 0.18,
  });
  exteriorMaterials = [bodyMaterial];

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.12,
    transmission: 0.25,
    transparent: true,
    opacity: 0.76,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.62 });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.78, roughness: 0.24 });
  detailMaterials = [rimMaterial];

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.72, 1.9), bodyMaterial);
  body.position.y = 0.28;
  body.castShadow = true;
  vehicle.add(body);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 1.72), bodyMaterial);
  nose.position.set(2.15, 0.4, 0);
  nose.castShadow = true;
  vehicle.add(nose);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.68, 1.48), glassMaterial);
  cabin.position.set(-0.55, 0.98, 0);
  cabin.castShadow = true;
  vehicle.add(cabin);

  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 1.82), bodyMaterial);
  spoiler.position.set(-2.38, 0.86, 0);
  spoiler.castShadow = true;
  vehicle.add(spoiler);

  const wheelGeometry = new THREE.CylinderGeometry(0.36, 0.36, 0.32, 48);
  const rimGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.34, 48);
  const wheelPositions = [
    [-1.55, -0.16, -1.02],
    [1.55, -0.16, -1.02],
    [-1.55, -0.16, 1.02],
    [1.55, -0.16, 1.02],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, tireMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    vehicle.add(wheel);

    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    vehicle.add(rim);
  });

  vehicle.rotation.y = -0.55;
  return vehicle;
};

const applyPaint = (paintId: string) => {
  if (paintId === 'factory-celadon') {
    exteriorMaterials.forEach((material) => {
      tunePhysicalMaterial(material, {
        color: factoryPalette.exterior,
        metalness: 0.74,
        roughness: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
      });
    });
    interiorMaterials.forEach((material) => {
      tunePhysicalMaterial(material, {
        color: factoryPalette.interior,
        metalness: 0.04,
        roughness: 0.72,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
      });
    });
    detailMaterials.forEach((material) => {
      tunePhysicalMaterial(material, { color: factoryPalette.detail, metalness: 0.82, roughness: 0.22 });
    });
    caliperMaterials.forEach((material) => {
      tunePhysicalMaterial(material, { color: factoryPalette.caliper, metalness: 0.35, roughness: 0.3 });
    });
    return;
  }

  exteriorMaterials.forEach((material) => {
    tunePhysicalMaterial(material, {
      color: paintColors[paintId] ?? paintColors['liquid-silver'],
      metalness: 0.72,
      roughness: 0.26,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
    });
  });
};

const collectPaintMaterials = (model: THREE.Object3D) => {
  const exterior = new Set<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>();
  const interior = new Set<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>();
  const detail = new Set<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>();
  const caliper = new Set<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>();

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    const meshName = object.name.toLowerCase();
    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
    const clonedMaterials = sourceMaterials.map((material) => material.clone());
    object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];

    clonedMaterials.forEach((material) => {
      const materialName = material.name.toLowerCase();
      const combinedName = `${meshName} ${materialName}`;
      if (!('color' in material)) return;

      const targetMaterial = material as THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
      if (['glass', 'window', 'tire', 'tyre', 'rubber', 'light'].some((name) => combinedName.includes(name))) return;
      if (['caliper', 'brake'].some((name) => combinedName.includes(name))) {
        caliper.add(targetMaterial);
        return;
      }
      if (['rim', 'wheel', 'chrome', 'metal'].some((name) => combinedName.includes(name))) {
        detail.add(targetMaterial);
        return;
      }
      if (['interior', 'seat', 'leather', 'cabin', 'dash', 'steering'].some((name) => combinedName.includes(name))) {
        interior.add(targetMaterial);
        return;
      }
      exterior.add(targetMaterial);
    });
  });

  exteriorMaterials = Array.from(exterior);
  interiorMaterials = Array.from(interior);
  detailMaterials = Array.from(detail);
  caliperMaterials = Array.from(caliper);
  applyPaint(props.paint.id);
};

const fitModelToViewport = (model: THREE.Object3D) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z);

  model.position.sub(center);
  model.scale.setScalar(4.5 / maxAxis);
  model.position.y = -0.48;
};

const resizeRenderer = () => {
  if (!viewportRef.value || !renderer || !camera) return;

  const { clientWidth, clientHeight } = viewportRef.value;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
};

onMounted(() => {
  if (!viewportRef.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(4.6, 2.3, 5.4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'h-full w-full cursor-grab active:cursor-grabbing';
  viewportRef.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.55;
  controls.minDistance = 4.2;
  controls.maxDistance = 8;
  controls.minPolarAngle = 0.82;
  controls.maxPolarAngle = 1.62;
  controls.target.set(0, 0.35, 0);
  controls.addEventListener('start', pauseShowroomRotation);
  controls.addEventListener('end', queueShowroomRotation);

  renderer.domElement.addEventListener('pointerenter', handlePointerEnter);
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
  renderer.domElement.addEventListener('pointerdown', handlePointerDown);
  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  renderer.domElement.addEventListener('pointerup', handlePointerUp);
  renderer.domElement.addEventListener('wheel', handleWheel);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0f172a, 2.6));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
  keyLight.position.set(3.8, 5.4, 4.2);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x67e8f9, 58, 8);
  rimLight.position.set(-3.2, 2.1, -2.8);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.1, 96),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.82, metalness: 0.18 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.54;
  floor.receiveShadow = true;
  scene.add(floor);

  if (props.modelUrl) {
    const loader = new GLTFLoader();
    loader.load(
      props.modelUrl,
      (gltf) => {
        fitModelToViewport(gltf.scene);
        collectPaintMaterials(gltf.scene);
        scene?.add(gltf.scene);
      },
      undefined,
      () => {
        scene?.add(createVehicleModel());
      },
    );
  } else {
    scene.add(createVehicleModel());
  }

  resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(viewportRef.value);
  resizeRenderer();

  const animate = () => {
    controls?.update();
    renderer?.render(scene as THREE.Scene, camera as THREE.PerspectiveCamera);
    animationFrame = window.requestAnimationFrame(animate);
  };
  animate();
  queueShowroomRotation();
});

watch(
  () => props.paint.id,
  (paintId) => {
    applyPaint(paintId);
  },
);

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame);
  clearShowroomTimer();
  resizeObserver?.disconnect();
  controls?.removeEventListener('start', pauseShowroomRotation);
  controls?.removeEventListener('end', queueShowroomRotation);
  controls?.dispose();
  renderer?.domElement.removeEventListener('pointerenter', handlePointerEnter);
  renderer?.domElement.removeEventListener('pointerleave', handlePointerLeave);
  renderer?.domElement.removeEventListener('pointerdown', handlePointerDown);
  renderer?.domElement.removeEventListener('pointermove', handlePointerMove);
  renderer?.domElement.removeEventListener('pointerup', handlePointerUp);
  renderer?.domElement.removeEventListener('wheel', handleWheel);

  scene?.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });

  renderer?.dispose();
  renderer?.domElement.remove();
});
</script>

<template>
  <div ref="viewportRef" class="relative z-10 h-[25rem] w-full sm:h-[30rem] lg:h-[34rem]" />
</template>
