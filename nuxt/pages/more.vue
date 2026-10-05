<script setup lang="ts">
import { LogOut } from 'lucide-vue-next';

useHead({ title: 'More · Susi Air Pilot' });

const auth = useAuthStore();
const pilot = usePilotStore();
</script>

<template>
  <div>
    <header class="page-header">
      <h1>More</h1>
    </header>

    <div v-if="pilot.profile" class="profile-card">
      <PilotAvatar
        :name="pilot.profile.name"
        :src="pilot.profile.avatarUrl"
        :size="48"
      />
      <div>
        <p class="profile-card__name">{{ pilot.profile.name }}</p>
        <p class="profile-card__username">@{{ pilot.profile.username }}</p>
      </div>
    </div>

    <button type="button" class="sign-out" @click="auth.logout()">
      <LogOut :size="18" aria-hidden="true" />
      Sign out
    </button>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  padding: 20px 0 16px;

  h1 {
    font-size: 24px;
    font-weight: 800;
  }
}

.profile-card {
  @include card;

  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px;
}

.profile-card__name {
  font-size: 16px;
  font-weight: 700;
}

.profile-card__username {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.sign-out {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  margin-top: 16px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-brand-red);
  background: var(--color-surface);
  border: 1.5px solid var(--color-brand-red);
  border-radius: $radius-pill;
}
</style>
