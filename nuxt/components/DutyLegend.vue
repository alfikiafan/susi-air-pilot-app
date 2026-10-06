<script setup lang="ts">
import type { LegendItem } from '~/types/api';

defineProps<{ items: LegendItem[] }>();
</script>

<template>
  <ul class="legend">
    <li v-for="item in items" :key="item.code" class="legend__item">
      <span
        class="legend__swatch"
        :style="{ backgroundColor: item.color }"
        aria-hidden="true"
      />
      <span class="legend__code">{{ item.code }}</span>
      <span class="legend__label">{{ item.label }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.legend {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  gap: 10px 12px;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  list-style: none;

  @media (max-width: 359px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: normal;
  }
}

.legend__item {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
  font-size: 12px;
}

.legend__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend__code {
  flex-shrink: 0;
  font-weight: 700;
}

.legend__label {
  min-width: 0;
  line-height: 1.3;
  color: var(--color-text-secondary);
  white-space: nowrap;

  @media (max-width: 359px) {
    white-space: normal;
  }
}
</style>
