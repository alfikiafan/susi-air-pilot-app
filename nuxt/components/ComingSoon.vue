<script setup lang="ts">
import { Construction } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    title: string;
    text: string;
    eyebrow?: string;
    headingLevel?: 'h1' | 'h2';
  }>(),
  {
    eyebrow: undefined,
    headingLevel: 'h2',
  },
);
</script>

<template>
  <div class="coming-soon">
    <span class="coming-soon__icon" aria-hidden="true"
      ><Construction :size="28"
    /></span>
    <p v-if="eyebrow" class="coming-soon__eyebrow">{{ eyebrow }}</p>
    <component :is="headingLevel" class="coming-soon__title">{{
      title
    }}</component>
    <p class="coming-soon__text">{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
.coming-soon {
  @include card;

  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 40px 24px;
  text-align: center;
}

.coming-soon__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
  color: var(--color-navy);
  background: var(--color-muted-surface);
  border-radius: 50%;
}

.coming-soon__eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-red);
}

.coming-soon__title {
  font-size: 18px;
  font-weight: 800;
}

.coming-soon__text {
  max-width: 260px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
