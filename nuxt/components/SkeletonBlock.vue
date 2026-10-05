<script setup lang="ts">
withDefaults(defineProps<{ height?: string; radius?: string }>(), {
  height: '16px',
  radius: '8px',
});
</script>

<template>
  <div
    class="skeleton"
    :style="{ height, borderRadius: radius }"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.skeleton {
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--color-muted-surface) 25%,
    #f7f8fa 50%,
    var(--color-muted-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
