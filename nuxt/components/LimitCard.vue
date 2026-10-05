<script setup lang="ts">
import type { LimitCard } from '~/types/api';
import { formatHours } from '~/utils/format';

const props = defineProps<{ card: LimitCard }>();

const windowLabel = computed(() =>
  props.card.windowDays === 1 ? 'Today' : `Last ${props.card.windowDays} days`,
);
const statusLabel = computed(
  () =>
    ({
      ok: 'Within limit',
      warning: 'Approaching limit',
      exceeded: 'Limit exceeded',
    })[props.card.status],
);
const footnote = computed(() =>
  props.card.status === 'exceeded'
    ? `${formatHours(props.card.hours - props.card.limit)} h over`
    : `${formatHours(props.card.remaining)} h left`,
);
// The bar stops at 100% so it never overflows the card; the label carries the exact figure.
const barWidth = computed(() => `${Math.min(props.card.percentUsed, 100)}%`);
</script>

<template>
  <article class="limit-card" :class="`is-${card.status}`">
    <header class="limit-card__head">
      <h3 class="limit-card__label">{{ card.label }}</h3>
      <span class="limit-card__window">{{ windowLabel }}</span>
    </header>

    <p class="limit-card__value">
      <strong>{{ formatHours(card.hours) }}</strong>
      <span>/ {{ card.limit }} h</span>
    </p>

    <div
      class="limit-card__bar"
      role="progressbar"
      :aria-label="`${card.label} hours: ${statusLabel}`"
      aria-valuemin="0"
      :aria-valuemax="card.limit"
      :aria-valuenow="card.hours"
      :aria-valuetext="`${formatHours(card.hours)} of ${card.limit} hours, ${card.percentUsed}%`"
    >
      <span :style="{ width: barWidth }" />
    </div>

    <p class="limit-card__foot">
      <span>{{ footnote }}</span>
      <span class="limit-card__percent">{{ card.percentUsed }}%</span>
    </p>
  </article>
</template>

<style scoped lang="scss">
.limit-card {
  @include card;

  --status-color: var(--color-success);

  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;

  &.is-warning {
    --status-color: var(--color-warning);
  }

  &.is-exceeded {
    --status-color: var(--color-danger);
  }
}

.limit-card__head {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.limit-card__label {
  font-size: 14px;
  font-weight: 700;
}

.limit-card__window {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.limit-card__value {
  display: flex;
  flex-wrap: wrap; // on very narrow screens "/ 1050 h" drops to its own line as a unit
  gap: 2px 4px;
  align-items: baseline;

  strong {
    @include numeric;

    font-size: 24px;
    line-height: 1;
  }

  span {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }
}

.limit-card__bar {
  height: 6px;
  overflow: hidden;
  background: var(--color-muted-surface);
  border-radius: $radius-pill;

  span {
    display: block;
    height: 100%;
    background: var(--status-color);
    border-radius: inherit;
    transition: width 0.4s ease;
  }
}

.limit-card__foot {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.limit-card__percent {
  color: var(--status-color);
}
</style>
