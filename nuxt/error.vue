<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const isNotFound = computed(() => props.error.statusCode === 404);
const title = computed(() =>
  isNotFound.value ? 'Page not found' : 'Something went wrong',
);
const text = computed(() =>
  isNotFound.value
    ? "The page you are looking for doesn't exist or has moved."
    : 'An unexpected error occurred. Please try again.',
);

useHead({ title: () => `${title.value} · Susi Air Pilot` });

const home = () => clearError({ redirect: '/' });
</script>

<template>
  <main class="error-page">
    <img
      src="/susiair-logo.webp"
      alt="Susi Air"
      width="140"
      height="35"
      class="error-page__logo"
    />
    <p class="error-page__code">{{ error.statusCode }}</p>
    <h1 class="error-page__title">{{ title }}</h1>
    <p class="error-page__text">{{ text }}</p>
    <button type="button" class="error-page__button" @click="home">
      Back to Home
    </button>
  </main>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  max-width: $shell-max-width;
  min-height: 100dvh;
  padding: 24px 16px;
  margin: 0 auto;
  text-align: center;
}

.error-page__logo {
  width: 140px;
  height: auto;
  margin-bottom: 24px;
}

.error-page__code {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-brand-red);
}

.error-page__title {
  font-size: 22px;
  font-weight: 800;
}

.error-page__text {
  max-width: 280px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.error-page__button {
  height: 48px;
  padding: 0 28px;
  margin-top: 16px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: var(--color-brand-red);
  border: 0;
  border-radius: $radius-pill;
}
</style>
