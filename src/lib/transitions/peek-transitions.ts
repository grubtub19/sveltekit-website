import { backOut } from "svelte/easing";
import type { EasingFunction } from "svelte/transition";

// 1. Centralized Map
export const DIRECTION_MAP = {
  'right': 0,
  'bottom-right': 45,
  'bottom': 90,
  'bottom-left': 135,
  'left': 180,
  'top-left': 225,
  'top': -90,
  'top-right': -45
} as const;

// 2. Derive the Type from the Map keys
export type Direction = keyof typeof DIRECTION_MAP;

interface PeekOptions {
  duration?: number;
  delay?: number;
  direction?: Direction;
  angle?: number;
  distance?: number;
  rotation?: number;
  easing?: EasingFunction;
}

export function peek(node: HTMLElement, { 
  duration = 400, 
  delay = 0,
  direction, 
  angle = 0,
  distance = 100,
  rotation = 0,
  easing = backOut
}: PeekOptions = {}) {

  angle = direction ? DIRECTION_MAP[direction] : angle;

  const rad = (angle * Math.PI) / 180;
  const startX = Math.cos(rad) * distance;
  const startY = Math.sin(rad) * distance;

  return {
    duration,
    delay,
    easing,
    css: (t: number) => {
      const inverted = 1 - t;
      return `
        transform: translate(${startX * inverted}%, ${startY * inverted}%) 
                   rotate(${rotation * inverted}deg);
        opacity: ${t};
      `;
    }
  };
}