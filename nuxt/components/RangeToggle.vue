<script setup lang="ts">
import { RANGE_KEYS, type RangeKey } from '~/types/api';

const model = defineModel<RangeKey>({ required: true });

const labels: Record<RangeKey, string> = {
  '1w': '1 week',
  '1m': '1 month',
  '3m': '3 months',
  '6m': '6 months',
  '1y': '1 year',
};

// Arrow keys move between options, as expected of a radio group.
function onKeydown(event: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
    event.key
  ];
  if (!step) return;
  event.preventDefault();
  const index =
    (RANGE_KEYS.indexOf(model.value) + step + RANGE_KEYS.length) %
    RANGE_KEYS.length;
  model.value = RANGE_KEYS[index]!;
  const target = (
    event.currentTarget as HTMLElement
  ).querySelectorAll<HTMLButtonElement>('button')[index];
  target?.focus();
}
</script>

<template>
  <div
    class="range-toggle"
    role="radiogroup"
    aria-label="Chart range"
    @keydown="onKeydown"
  >
    <button
      v-for="key in RANGE_KEYS"
      :key="key"
      type="button"
      role="radio"
      class="range-toggle__option"
      :class="{ 'is-active': model === key }"
      :aria-checked="model === key"
      :aria-label="labels[key]"
      :tabindex="model === key ? 0 : -1"
      @click="model = key"
    >
      {{ key }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.range-toggle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 3px;
  background: var(--color-muted-surface);
  border-radius: $radius-pill;
}

.range-toggle__option {
  height: 38px; // + 3px container padding on each side = 44px touch target
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  background: none;
  border: 0;
  border-radius: $radius-pill;
  transition:
    background 0.15s,
    color 0.15s;

  &.is-active {
    color: #fff;
    background: var(--color-navy);
  }
}
</style>
