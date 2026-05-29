<script setup lang="ts">
import { computed, ref } from 'vue';
import CarModelDetail from './components/CarModelDetail.vue';
import CarModelViewer from './components/CarModelViewer.vue';
import CarSeriesList from './components/CarSeriesList.vue';
import PaintSelector from './components/PaintSelector.vue';
import { carSeries, paintOptions } from './data/showcase';

const activeCarId = ref(carSeries[0].id);
const activePaintId = ref(paintOptions[0].id);

const activeCar = computed(() => carSeries.find((car) => car.id === activeCarId.value) ?? carSeries[0]);
const activePaint = computed(() => paintOptions.find((paint) => paint.id === activePaintId.value) ?? paintOptions[0]);
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-[#080a0f] font-display text-white">
    <div class="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_28%),linear-gradient(135deg,#080a0f_0%,#111827_46%,#050608_100%)]" />
    <div class="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

    <div class="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 pb-44 pt-5 sm:px-6 sm:pb-36 lg:flex-row lg:gap-6 lg:px-8 lg:pt-8">
      <CarSeriesList :cars="carSeries" :active-car-id="activeCarId" @select="activeCarId = $event" />

      <CarModelDetail :car="activeCar" :paint="activePaint">
        <template #model>
          <CarModelViewer :paint="activePaint" model-url="/assets/car_models/xiaomi_vision_gt.glb" />
        </template>
      </CarModelDetail>
    </div>

    <PaintSelector :paints="paintOptions" :active-paint-id="activePaintId" @change="activePaintId = $event" />
  </main>
</template>
