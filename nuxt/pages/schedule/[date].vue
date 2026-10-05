<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { formatLongDate, isIsoDate } from '~/utils/date';

const route = useRoute();
const date = computed(() => String(route.params.date));
const isValid = computed(() => isIsoDate(date.value));

useHead({ title: 'Duty detail · Susi Air Pilot' });

// Back goes to the month this day belongs to, not just the last-viewed month.
const backTo = computed(() =>
  isValid.value
    ? {
        path: '/schedule',
        query: { year: date.value.slice(0, 4), month: date.value.slice(5, 7) },
      }
    : '/schedule',
);
</script>

<template>
  <div>
    <header class="detail__header">
      <NuxtLink :to="backTo" class="detail__back">
        <ArrowLeft :size="20" aria-hidden="true" />
        Schedule
      </NuxtLink>
    </header>

    <ComingSoon
      heading-level="h1"
      :eyebrow="isValid ? formatLongDate(date) : undefined"
      title="Detail page coming soon"
      text="Duty details for this day will be available in a future release."
    />
  </div>
</template>

<style scoped lang="scss">
.detail__header {
  padding: 20px 0 16px;
}

.detail__back {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 44px;
  font-size: 15px;
  font-weight: 700;
}
</style>
