import { defineStore } from 'pinia';
import type { LoginResponse } from '~/types/api';

const TOKEN_COOKIE = 'susi_token';

export const useAuthStore = defineStore('auth', () => {
  // Matches the API's default token lifetime (12h); the API stays the authority on expiry.
  const token = useCookie<string | null>(TOKEN_COOKIE, {
    maxAge: 60 * 60 * 12,
    sameSite: 'strict',
    secure: import.meta.client && location.protocol === 'https:',
    default: () => null,
  });

  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(username: string, password: string) {
    const response = await useApi()<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    token.value = response.accessToken;
  }

  async function logout() {
    token.value = null;
    // Clear every store holding pilot data so the next sign-in starts clean.
    usePilotStore().$reset();
    useFlightHoursStore().$reset();
    useDocumentsStore().$reset();
    useScheduleStore().$reset();
    await navigateTo('/login', { replace: true });
  }

  return { token, isAuthenticated, login, logout };
});
