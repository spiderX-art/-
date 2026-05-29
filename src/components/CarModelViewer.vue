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
  'liquid-silver': 0xd7dde8,
  'solar-red': 0xc41f3b,
  'ion-blue': 0x2563eb,
  graphite: 0x27272a,
};

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let animationFrame = 0;
let resizeObserver: ResizeObserver | null = null;
let paintMaterials: Array<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial> = [];

const createVehicleModel = () => {
  const vehicle = new THREE.Group();

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: paintColors[props.paint.id] ?? paintColors['liquid-silver'],
    metalness: 0.72,
    roughness: 0.26,
    clearcoat: 0.85,
    clearcoatRoughness: 0.18,
  });
  paintMaterials = [bodyMaterial];

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
  const color = paintColors[paintId] ?? paintColors['liquid-silver'];
  paintMaterials.forEach((material) => {
    material.color.setHex(color);
    material.needsUpdate = true;
  });
};

const collectPaintMaterials = (model: THREE.Object3D) => {
  const blockedNames = ['glass', 'window', 'tire', 'tyre', 'wheel', 'rubber', 'rim', 'light'];
  const materials = new Set<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>();

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    const meshName = object.name.toLowerCase();
    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
    const clonedMaterials = sourceMaterials.map((material) => material.clone());
    object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];

    clonedMaterials.forEach((material) => {
      const materialName = material.name.toLowerCase();
      const shouldSkip = blockedNames.some((name) => meshName.includes(name) || materialName.includes(name));
      if (shouldSkip || !('color' in material)) return;
      materials.add(material as THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial);
    });
  });

  paintMaterials = Array.from(materials);
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
  controls.minDistance = 4.2;
  controls.maxDistance = 8;
  controls.minPolarAngle = 0.82;
  controls.maxPolarAngle = 1.62;
  controls.target.set(0, 0.35, 0);

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
});

watch(
  () => props.paint.id,
  (paintId) => {
    applyPaint(paintId);
  },
);

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
  controls?.dispose();

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
