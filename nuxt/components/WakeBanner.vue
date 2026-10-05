<script setup lang="ts">
// The API runs on a free tier that sleeps when idle; the first call can take up to a minute.
const network = useNetworkStore();
</script>

<template>
  <Transition name="wake">
    <div v-if="network.isSlow" class="wake-banner" role="status">
      <span class="wake-banner__spinner" aria-hidden="true" />
      Waking up the server, this can take up to a minute…
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.wake-banner {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-navy);
}

.wake-banner__spinner {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 2px solid rgb(255 255 255 / 30%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.wake-enter-active,
.wake-leave-active {
  transition: opacity 0.2s;
}

.wake-enter-from,
.wake-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
