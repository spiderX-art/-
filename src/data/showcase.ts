import type { CarSeries, PaintOption } from '../types/car';

export const carSeries: CarSeries[] = [
  {
    id: 'aero-gt',
    name: 'Aero GT',
    tagline: 'Dual motor grand tourer',
    range: '721 km',
    acceleration: '3.1 s',
    price: '$89,900',
    accent: 'from-cyan-300 to-blue-500',
  },
  {
    id: 'nova-s',
    name: 'Nova S',
    tagline: 'Urban performance sedan',
    range: '642 km',
    acceleration: '3.8 s',
    price: '$72,400',
    accent: 'from-emerald-300 to-teal-500',
  },
  {
    id: 'orbit-x',
    name: 'Orbit X',
    tagline: 'Long-range crossover',
    range: '806 km',
    acceleration: '4.2 s',
    price: '$96,800',
    accent: 'from-amber-200 to-orange-500',
  },
];

export const paintOptions: PaintOption[] = [
  {
    id: 'liquid-silver',
    name: 'Liquid Silver',
    finish: 'Pearl metallic',
    swatchClass: 'bg-gradient-to-br from-zinc-100 via-slate-300 to-zinc-600',
    glowClass: 'from-slate-100/40 via-cyan-200/25 to-blue-500/20',
    imageToneClass: 'saturate-100 hue-rotate-0',
  },
  {
    id: 'solar-red',
    name: 'Solar Red',
    finish: 'Gloss performance',
    swatchClass: 'bg-gradient-to-br from-red-300 via-rose-600 to-black',
    glowClass: 'from-red-300/35 via-rose-500/25 to-orange-500/20',
    imageToneClass: 'saturate-150 hue-rotate-[140deg]',
  },
  {
    id: 'ion-blue',
    name: 'Ion Blue',
    finish: 'Electric satin',
    swatchClass: 'bg-gradient-to-br from-sky-200 via-blue-600 to-indigo-950',
    glowClass: 'from-sky-300/35 via-blue-500/25 to-indigo-600/25',
    imageToneClass: 'saturate-150 hue-rotate-[22deg]',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    finish: 'Stealth matte',
    swatchClass: 'bg-gradient-to-br from-neutral-300 via-neutral-700 to-black',
    glowClass: 'from-zinc-200/25 via-neutral-500/20 to-black/20',
    imageToneClass: 'grayscale contrast-125 brightness-90',
  },
];
