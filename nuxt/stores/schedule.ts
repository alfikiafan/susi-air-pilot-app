import { defineStore } from 'pinia';
import type { LegendItem, ScheduleEntry, SchedulesResponse } from '~/types/api';
import { type AppError, toAppError } from '~/utils/api-error';
import { shiftMonth, type YearMonth } from '~/utils/date';

/**
 * The month on screen and its entries. Deliberately not cached: the brief asks
 * for every month change to call /schedules, so the calendar is always fresh.
 */
export const useScheduleStore = defineStore('schedule', () => {
  const current = ref<YearMonth | null>(null);
  const entries = ref<ScheduleEntry[]>([]);
  const legend = ref<LegendItem[]>([]);
  const loading = ref(false);
  const error = ref<AppError | null>(null);
  let latestRequest = 0;

  const entriesByDate = computed(
    () => new Map(entries.value.map((entry) => [entry.duty_date, entry])),
  );

  async function load(target: YearMonth) {
    current.value = target;
    const requestId = ++latestRequest;
    loading.value = true;
    error.value = null;
    try {
      const response = await useApi()<SchedulesResponse>('/schedules', {
        query: {
          year: target.year,
          month: String(target.month).padStart(2, '0'),
        },
      });
      // Ignore answers for a month the pilot has already navigated away from.
      if (requestId !== latestRequest) return;
      entries.value = response.schedules;
      legend.value = response.legend;
    } catch (e) {
      if (requestId !== latestRequest) return;
      entries.value = [];
      error.value = toAppError(e);
    } finally {
      if (requestId === latestRequest) loading.value = false;
    }
  }

  function step(delta: number) {
    if (current.value) return load(shiftMonth(current.value, delta));
  }

  function $reset() {
    current.value = null;
    entries.value = [];
    legend.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    current,
    entries,
    entriesByDate,
    legend,
    loading,
    error,
    load,
    step,
    $reset,
  };
});
