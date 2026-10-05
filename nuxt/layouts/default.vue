<script setup lang="ts">
// The profile carries the server's "today", which several pages need, so the shell loads it once.
const pilot = usePilotStore();
onMounted(() => pilot.load());
</script>

<template>
  <div class="shell">
    <WakeBanner />
    <main class="shell__main">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped lang="scss">
.shell {
  max-width: $shell-max-width;
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--color-bg);

  @media (min-width: $bp-tablet) {
    box-shadow: 0 0 0 1px var(--color-border);
  }
}

.shell__main {
  padding: 0 16px
    calc(#{$bottom-nav-height} + 24px + env(safe-area-inset-bottom));
}
</style>
