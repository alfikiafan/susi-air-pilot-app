<script setup lang="ts">
import { initials } from '~/utils/format';

const props = withDefaults(
  defineProps<{ name: string; src?: string; size?: number }>(),
  { size: 44 },
);

// Fall back to locally rendered initials if the avatar URL fails to load.
const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
</script>

<template>
  <span class="avatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      :width="size"
      :height="size"
      @error="failed = true"
    />
    <span v-else class="avatar__initials" role="img" :aria-label="name">{{
      initials(name)
    }}</span>
  </span>
</template>

<style scoped lang="scss">
.avatar {
  display: inline-grid;
  flex-shrink: 0;
  overflow: hidden;
  place-items: center;
  background: var(--color-navy);
  border: 2px solid var(--color-surface);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--color-border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar__initials {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
</style>
