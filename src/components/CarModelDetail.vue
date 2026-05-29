<script setup lang="ts">
import type { CarSeries, PaintOption } from '../types/car';

defineProps<{
  car: CarSeries;
  paint: PaintOption;
}>();
</script>

<template>
  <section class="relative min-h-[34rem] flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-glow backdrop-blur-2xl sm:p-6 lg:min-h-[44rem]">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_20%_76%,rgba(45,212,191,0.12),transparent_26%)]" />
    <div class="absolute inset-x-8 top-16 h-64 rounded-full bg-gradient-to-r blur-3xl" :class="paint.glowClass" />

    <div class="relative z-10 flex flex-col gap-6">
      <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p class="text-sm font-medium text-cyan-100/70">{{ car.tagline }}</p>
          <h2 class="mt-2 text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">{{ car.name }}</h2>
        </div>
        <div class="grid grid-cols-3 gap-2 rounded-[1.4rem] border border-white/10 bg-black/20 p-2 text-center text-white backdrop-blur-xl sm:w-80">
          <div class="rounded-2xl bg-white/10 px-3 py-3">
            <p class="text-lg font-semibold">{{ car.range }}</p>
            <p class="text-[0.65rem] uppercase text-white/45">Range</p>
          </div>
          <div class="rounded-2xl bg-white/10 px-3 py-3">
            <p class="text-lg font-semibold">{{ car.acceleration }}</p>
            <p class="text-[0.65rem] uppercase text-white/45">0-100</p>
          </div>
          <div class="rounded-2xl bg-white/10 px-3 py-3">
            <p class="text-lg font-semibold">{{ car.price }}</p>
            <p class="text-[0.65rem] uppercase text-white/45">From</p>
          </div>
        </div>
      </header>

      <div class="relative flex min-h-[25rem] items-center justify-center sm:min-h-[30rem] lg:min-h-[34rem]">
        <slot name="model">
          <div class="absolute bottom-12 h-20 w-4/5 rounded-[100%] bg-black/50 blur-2xl" />
          <img
            src="/assets/car-hero.png"
            :alt="`${car.name} ${paint.name}`"
            class="relative z-10 w-full max-w-5xl select-none object-contain drop-shadow-[0_34px_40px_rgba(0,0,0,0.55)] transition duration-500 hover:scale-[1.02]"
            :class="paint.imageToneClass"
            draggable="false"
          />
          <div class="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </slot>
      </div>

      <footer class="flex flex-col gap-3 text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-white/45">Selected paint</p>
          <p class="text-xl font-semibold text-white">{{ paint.name }}</p>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm backdrop-blur-xl">
          <span class="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
          3D viewport ready
        </div>
      </footer>
    </div>
  </section>
</template>
