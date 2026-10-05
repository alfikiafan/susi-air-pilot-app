<script setup lang="ts">
import { BookOpen, CalendarDays, Ellipsis, House } from 'lucide-vue-next';

const items = [
  { to: '/', label: 'Home', icon: House, exact: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays, exact: false },
  { to: '/logbook', label: 'Logbook', icon: BookOpen, exact: false },
  { to: '/more', label: 'More', icon: Ellipsis, exact: false },
];

const route = useRoute();
const isActive = (item: (typeof items)[number]) =>
  item.exact ? route.path === item.to : route.path.startsWith(item.to);
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'is-active': isActive(item) }"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <component
        :is="item.icon"
        :size="22"
        :stroke-width="isActive(item) ? 2.2 : 1.8"
        aria-hidden="true"
      />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  max-width: $shell-max-width;
  height: calc(#{$bottom-nav-height} + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  transform: translateX(-50%);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color 0.15s;

  &.is-active {
    color: var(--color-brand-red);
  }
}
</style>
