<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import type { PilotDocument } from '~/types/api';
import { formatDate } from '~/utils/date';

const props = defineProps<{ document: PilotDocument }>();

// The badge colour comes straight from the API's status; only the wording is decided here.
const badge = computed(
  () =>
    ({ expired: 'Expired', soon: 'Expiring soon', safe: 'Valid' })[
      props.document.status
    ],
);

// Non-breaking spaces keep "14 days left" and the date in one piece, so a line can only break after the dot.
const NBSP = String.fromCharCode(160);

const dateLabel = computed(() =>
  formatDate(props.document.expiryDate).replaceAll(' ', NBSP),
);

const detail = computed(() => {
  const days = props.document.daysRemaining;
  const text =
    days < 0
      ? `Expired ${-days} day${days === -1 ? '' : 's'} ago`
      : days === 0
        ? 'Expires today'
        : `${days} day${days === 1 ? '' : 's'} left`;
  return text.replaceAll(' ', NBSP);
});
</script>

<template>
  <li class="document" :class="`is-${document.status}`">
    <span class="document__icon" aria-hidden="true">
      <FileText :size="18" />
    </span>
    <div class="document__body">
      <p class="document__label">{{ document.label }}</p>
      <p class="document__meta">
        <time :datetime="document.expiryDate">{{ dateLabel }}</time
        >&nbsp;·
        {{ detail }}
      </p>
    </div>
    <span class="document__badge">{{ badge }}</span>
  </li>
</template>

<style scoped lang="scss">
.document {
  --status-color: var(--color-success);
  --status-bg: rgb(31 191 143 / 12%);

  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 0;

  & + & {
    border-top: 1px solid var(--color-border);
  }

  &.is-soon {
    --status-color: var(--color-warning);
    --status-bg: rgb(245 158 11 / 16%);
  }

  &.is-expired {
    --status-color: var(--color-danger);
    --status-bg: rgb(230 55 87 / 12%);
  }
}

.document__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--status-color);
  background: var(--status-bg);
  border-radius: $radius-sm;
}

.document__body {
  flex: 1;
  min-width: 0;
}

.document__label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.document__meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.document__badge {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--status-color);
  white-space: nowrap;
  background: var(--status-bg);
  border-radius: $radius-pill;
}
</style>
