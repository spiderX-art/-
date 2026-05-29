<script setup lang="ts">
import type { PaintOption } from '../types/car';

defineProps<{
  paints: PaintOption[];
  activePaintId: string;
}>();

const emit = defineEmits<{
  change: [paintId: string];
}>();
</script>

<template>
  <section class="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-5xl rounded-[1.7rem] border border-white/15 bg-black/35 p-3 shadow-panel backdrop-blur-2xl sm:bottom-5 sm:p-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="px-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Paint</p>
        <p class="text-base font-semibold text-white">Color studio</p>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <button
          v-for="paint in paints"
          :key="paint.id"
          type="button"
          class="group flex min-w-0 items-center gap-3 rounded-[1.25rem] border px-3 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
          :class="activePaintId === paint.id ? 'border-white/40 bg-white/20 shadow-[0_16px_35px_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/[0.06]'"
          @click="emit('change', paint.id)"
        >
          <span class="h-9 w-9 shrink-0 rounded-full border border-white/30 shadow-[inset_0_0_16px_rgba(255,255,255,0.32)]" :class="paint.swatchClass" />
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold text-white">{{ paint.name }}</span>
            <span class="block truncate text-xs text-white/45">{{ paint.finish }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
