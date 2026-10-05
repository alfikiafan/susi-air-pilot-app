import { defineStore } from 'pinia';

/** After this long, a request is probably waiting on a free-tier API to wake up. */
const SLOW_REQUEST_MS = 4000;

/** Tracks in-flight API calls so the shell can say "waking the server" instead of looking frozen. */
export const useNetworkStore = defineStore('network', () => {
  const pending = ref(0);
  const isSlow = ref(false);
  let slowTimer: ReturnType<typeof setTimeout> | undefined;

  function start() {
    pending.value++;
    if (!slowTimer)
      slowTimer = setTimeout(() => (isSlow.value = true), SLOW_REQUEST_MS);
  }

  function finish() {
    pending.value = Math.max(pending.value - 1, 0);
    if (pending.value === 0) {
      clearTimeout(slowTimer);
      slowTimer = undefined;
      isSlow.value = false;
    }
  }

  return { pending, isSlow, start, finish };
});
