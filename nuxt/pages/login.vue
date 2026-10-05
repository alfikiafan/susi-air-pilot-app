<script setup lang="ts">
import { CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-vue-next';
import { toAppError } from '~/utils/api-error';

definePageMeta({ layout: 'blank' });
useHead({ title: 'Sign in · Susi Air Pilot' });

const auth = useAuthStore();
const route = useRoute();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

const canSubmit = computed(
  () =>
    username.value.trim() !== '' && password.value !== '' && !submitting.value,
);

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  errorMessage.value = null;
  try {
    await auth.login(username.value.trim(), password.value);
    const redirect =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/';
    await navigateTo(redirect, { replace: true });
  } catch (e) {
    const error = toAppError(e);
    errorMessage.value =
      error.code === 'INVALID_CREDENTIALS'
        ? 'Incorrect username or password. Please check and try again.'
        : error.message;
    password.value = '';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login">
    <div class="login__brand">
      <img
        src="/susiair-logo.webp"
        alt="Susi Air"
        width="160"
        height="40"
        class="login__logo"
      />
      <p class="login__tagline">Pilot App</p>
    </div>

    <form class="login__card" novalidate @submit.prevent="submit">
      <h1 class="login__title">Sign in</h1>
      <p class="login__subtitle">Use your pilot account to continue.</p>

      <div v-if="errorMessage" class="login__error" role="alert">
        <CircleAlert :size="18" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <label class="field">
        <span class="field__label">Username</span>
        <input
          v-model="username"
          class="field__input"
          name="username"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          required
          :aria-invalid="Boolean(errorMessage)"
        />
      </label>

      <label class="field">
        <span class="field__label">Password</span>
        <span class="field__password">
          <input
            v-model="password"
            class="field__input"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            :aria-invalid="Boolean(errorMessage)"
          />
          <button
            type="button"
            class="field__reveal"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <component
              :is="showPassword ? EyeOff : Eye"
              :size="18"
              aria-hidden="true"
            />
          </button>
        </span>
      </label>

      <button type="submit" class="login__submit" :disabled="!canSubmit">
        <LoaderCircle
          v-if="submitting"
          :size="18"
          class="login__spinner"
          aria-hidden="true"
        />
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p class="login__footer">PT ASI Pudjiastuti Aviation</p>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 56px 16px 24px;
}

.login__brand {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  margin-bottom: 32px;
}

.login__logo {
  width: 160px;
  height: auto;
}

.login__tagline {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.login__card {
  @include card;

  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px;
}

.login__title {
  font-size: 22px;
  font-weight: 700;
}

.login__subtitle {
  margin-top: -10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.login__error {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-danger);
  background: rgb(230 55 87 / 8%);
  border-radius: $radius-sm;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 13px;
  font-weight: 600;
}

.field__input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  font-size: 16px; // 16px stops iOS from zooming on focus
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-navy);
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: var(--color-danger);
  }
}

.field__password {
  position: relative;

  .field__input {
    padding-right: 48px;
  }
}

.field__reveal {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--color-text-secondary);
  background: none;
  border: 0;
  border-radius: $radius-sm;
}

.login__submit {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: var(--color-brand-red);
  border: 0;
  border-radius: $radius-pill;
  transition: opacity 0.15s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.login__spinner {
  animation: spin 0.8s linear infinite;
}

.login__footer {
  margin-top: auto;
  padding-top: 32px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
