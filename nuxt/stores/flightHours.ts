import { defineStore } from 'pinia';
import type { FlightHoursSummary, RangeKey } from '~/types/api';
import { type AppError, toAppError } from '~/utils/api-error';

/**
 * Rolling-sum summaries per range toggle. All the maths happens on the API;
 * this store only caches what it returns so flipping back to a range is instant.
 */
export const useFlightHoursStore = defineStore('flightHours', () => {
  const range = ref<RangeKey>('1w');
  const summaries = ref<Partial<Record<RangeKey, FlightHoursSummary>>>({});
  const loading = ref(false);
  const error = ref<AppError | null>(null);
  let latestRequest = 0;

  const summary = computed(() => summaries.value[range.value] ?? null);
  // The limit cards are the same whichever range is selected; take them from any loaded summary.
  const cards = computed(
    () => (summary.value ?? Object.values(summaries.value)[0])?.cards ?? [],
  );

  async function load(next: RangeKey = range.value, { force = false } = {}) {
    range.value = next;
    if (summaries.value[next] && !force) return;

    const requestId = ++latestRequest;
    loading.value = true;
    error.value = null;
    try {
      const result = await useApi()<FlightHoursSummary>(
        '/flight-hours/summary',
        {
          query: { range: next },
        },
      );
      summaries.value[next] = result;
    } catch (e) {
      // A late failure for a range the pilot already left should not cover the current one.
      if (requestId === latestRequest) error.value = toAppError(e);
    } finally {
      if (requestId === latestRequest) loading.value = false;
    }
  }

  function $reset() {
    range.value = '1w';
    summaries.value = {};
    loading.value = false;
    error.value = null;
  }

  return { range, summaries, summary, cards, loading, error, load, $reset };
});
