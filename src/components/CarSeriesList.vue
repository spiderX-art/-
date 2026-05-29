<script setup lang="ts">
import type { CarSeries } from '../types/car';

defineProps<{
  cars: CarSeries[];
  activeCarId: string;
}>();

const emit = defineEmits<{
  select: [carId: string];
}>();
</script>

<template>
  <section class="w-full lg:w-[22rem]">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200/80">Showcase</p>
        <h1 class="mt-2 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">3D Car</h1>
      </div>
      <span class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70 shadow-panel backdrop-blur-xl">
        2026
      </span>
    </div>

    <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
      <button
        v-for="car in cars"
        :key="car.id"
        type="button"
        class="group relative overflow-hidden rounded-[2rem] border p-4 text-left shadow-panel backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
        :class="activeCarId === car.id ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/[0.07]'"
        @click="emit('select', car.id)"
      >
        <div
          class="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-30 blur-2xl transition group-hover:opacity-60"
          :class="car.accent"
        />
        <div class="relative">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-white">{{ car.name }}</h2>
            <span class="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
          </div>
          <p class="mt-1 text-sm text-white/55">{{ car.tagline }}</p>
          <div class="mt-5 grid grid-cols-3 gap-2 text-white">
            <div>
              <p class="text-base font-semibold">{{ car.range }}</p>
              <p class="text-[0.65rem] uppercase text-white/40">Range</p>
            </div>
            <div>
              <p class="text-base font-semibold">{{ car.acceleration }}</p>
              <p class="text-[0.65rem] uppercase text-white/40">0-100</p>
            </div>
            <div>
              <p class="text-base font-semibold">{{ car.price }}</p>
              <p class="text-[0.65rem] uppercase text-white/40">Start</p>
            </div>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
