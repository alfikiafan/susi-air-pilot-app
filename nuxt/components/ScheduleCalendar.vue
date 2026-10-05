<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import type { ScheduleEntry } from '~/types/api';
import { readableTextColor } from '~/utils/color';
import {
  daysInMonth,
  formatLongDate,
  toIsoDate,
  weekdayIndex,
  type YearMonth,
} from '~/utils/date';

const props = defineProps<{
  month: YearMonth;
  entriesByDate: Map<string, ScheduleEntry>;
  today: string | null;
}>();

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayCell {
  date: string;
  day: number;
  entry?: ScheduleEntry;
}

// Leading nulls pad the first week so day 1 lands under its weekday (weeks start on Monday).
const cells = computed<(DayCell | null)[]>(() => {
  const { year, month } = props.month;
  const first = toIsoDate(year, month, 1);
  const padding: null[] = Array.from(
    { length: weekdayIndex(first) },
    () => null,
  );
  const days = Array.from({ length: daysInMonth(props.month) }, (_, i) => {
    const date = toIsoDate(year, month, i + 1);
    return { date, day: i + 1, entry: props.entriesByDate.get(date) };
  });
  return [...padding, ...days];
});

function cellStyle(cell: DayCell) {
  if (!cell.entry) return undefined;
  return {
    backgroundColor: cell.entry.base_color,
    color: readableTextColor(cell.entry.base_color),
  };
}

function cellLabel(cell: DayCell) {
  const parts = [formatLongDate(cell.date)];
  if (cell.date === props.today) parts.push('today');
  if (cell.entry) {
    parts.push(`${cell.entry.duty_type} ${cell.entry.base_name}`);
    parts.push(
      cell.entry.is_complete
        ? 'all duties logged'
        : `${cell.entry.remaining} of ${cell.entry.count_schedules} duties to log`,
    );
  }
  return parts.join(', ');
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__weekdays" aria-hidden="true">
      <span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span>
    </div>

    <ol class="calendar__grid">
      <li
        v-for="(cell, index) in cells"
        :key="cell?.date ?? `pad-${index}`"
        class="calendar__slot"
      >
        <NuxtLink
          v-if="cell"
          :to="`/schedule/${cell.date}`"
          class="day"
          :class="{ 'has-duty': cell.entry, 'is-today': cell.date === today }"
          :style="cellStyle(cell)"
          :aria-label="cellLabel(cell)"
        >
          <span class="day__number">{{ cell.day }}</span>
          <span v-if="cell.entry" class="day__base">{{
            cell.entry.base_name
          }}</span>

          <span
            v-if="cell.entry && cell.entry.is_complete"
            class="day__badge day__badge--done"
            aria-hidden="true"
          >
            <Check :size="10" :stroke-width="3.5" />
          </span>
          <span v-else-if="cell.entry" class="day__badge" aria-hidden="true">{{
            cell.entry.remaining
          }}</span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 359px) {
    gap: 4px;
  }
}

.calendar__weekdays {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-align: center;
  text-transform: uppercase;
}

.calendar__grid {
  padding: 0;
  margin: 0;
  list-style: none;
}

.calendar__slot {
  aspect-ratio: 1 / 1.08;
}

.day {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text);
  background: var(--color-muted-surface);
  border-radius: $radius-sm;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.94);
  }

  &.is-today {
    box-shadow:
      0 0 0 2px var(--color-surface),
      0 0 0 4px var(--color-brand-red);
  }
}

.day__number {
  @include numeric;

  font-size: 14px;
  line-height: 1;
}

.day__base {
  max-width: 100%;
  overflow: hidden;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-overflow: clip;
  white-space: nowrap;
  opacity: 0.9;
}

.day__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  background: var(--color-brand-red);
  border: 2px solid var(--color-surface);
  border-radius: $radius-pill;
}

.day__badge--done {
  padding: 0;
  background: var(--color-success);
}
</style>
