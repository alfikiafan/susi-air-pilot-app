<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next';

defineProps<{ message: string }>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="error-state" role="alert">
    <CircleAlert :size="20" aria-hidden="true" />
    <p>{{ message }}</p>
    <button type="button" class="error-state__retry" @click="emit('retry')">
      Try again
    </button>
  </div>
</template>

<style scoped lang="scss">
.error-state {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--color-danger);
  background: rgb(230 55 87 / 8%);
  border-radius: $radius-sm;

  p {
    flex: 1;
    color: var(--color-text);
  }
}

.error-state__retry {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand-red);
  background: var(--color-surface);
  border: 1px solid currentcolor;
  border-radius: $radius-pill;
}
</style>
