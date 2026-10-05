<script setup lang="ts">
import { Clock } from 'lucide-vue-next';
import { formatLongDate } from '~/utils/date';
import { formatHours } from '~/utils/format';

const pilot = usePilotStore();
</script>

<template>
  <header class="home-header">
    <div class="home-header__bar">
      <img
        src="/susiair-logo.webp"
        alt="Susi Air"
        width="112"
        height="28"
        class="home-header__logo"
      />
      <span v-if="pilot.today" class="home-header__date">{{
        formatLongDate(pilot.today)
      }}</span>
    </div>

    <ErrorState
      v-if="pilot.error && !pilot.profile"
      :message="pilot.error.message"
      @retry="pilot.load({ force: true })"
    />

    <div v-else-if="pilot.profile" class="home-header__pilot">
      <div class="home-header__text">
        <p class="home-header__greeting">Welcome back,</p>
        <h1 class="home-header__name">{{ pilot.profile.name }}</h1>
        <p class="home-header__total">
          <Clock :size="14" aria-hidden="true" />
          <strong>{{ formatHours(pilot.profile.totalFlightHours) }}</strong>
          total flight hours
        </p>
      </div>
      <PilotAvatar
        :name="pilot.profile.name"
        :src="pilot.profile.avatarUrl"
        :size="56"
      />
    </div>

    <div v-else class="home-header__pilot" aria-busy="true">
      <div class="home-header__text">
        <SkeletonBlock height="14px" style="width: 40%" />
        <SkeletonBlock height="24px" style="width: 70%" />
        <SkeletonBlock height="14px" style="width: 55%" />
      </div>
      <SkeletonBlock height="56px" radius="50%" style="width: 56px" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.home-header {
  padding: 16px 0 8px;
}

.home-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.home-header__logo {
  width: 112px;
  height: auto;
}

.home-header__date {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.home-header__pilot {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.home-header__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.home-header__greeting {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.home-header__name {
  overflow: hidden;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-header__total {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  align-self: flex-start;
  margin-top: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border-radius: $radius-pill;
  box-shadow: var(--shadow-card);

  strong {
    @include numeric;

    color: var(--color-text);
  }
}
</style>
