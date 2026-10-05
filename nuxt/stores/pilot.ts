import { defineStore } from 'pinia';
import type { PilotProfile } from '~/types/api';
import { type AppError, toAppError } from '~/utils/api-error';

export const usePilotStore = defineStore('pilot', () => {
  const profile = ref<PilotProfile | null>(null);
  const loading = ref(false);
  const error = ref<AppError | null>(null);

  /** The server's reference date. Every "current month/day" in the UI derives from this. */
  const today = computed(() => profile.value?.today ?? null);

  async function load({ force = false } = {}) {
    if (profile.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      profile.value = await useApi()<PilotProfile>('/pilot/me');
    } catch (e) {
      error.value = toAppError(e);
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
    profile.value = null;
    loading.value = false;
    error.value = null;
  }

  return { profile, loading, error, today, load, $reset };
});
