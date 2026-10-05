import { useAuthStore } from '~/stores/auth';
import { useNetworkStore } from '~/stores/network';

/**
 * $fetch bound to the Nest API: adds the bearer token, tracks slow requests,
 * and signs the pilot out when the API rejects the token.
 */
export function useApi() {
  const { public: config } = useRuntimeConfig();
  const auth = useAuthStore();
  const network = useNetworkStore();

  return $fetch.create({
    baseURL: config.apiBase,
    retry: 0,
    onRequest({ options }) {
      network.start();
      if (auth.token) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${auth.token}`);
      }
    },
    onRequestError() {
      network.finish();
    },
    onResponse() {
      network.finish();
    },
    async onResponseError({ request, response }) {
      // Expired or invalid token: drop the session. Login's own 401 is a form error, not a session end.
      const isLogin = String(request).endsWith('/auth/login');
      if (response.status === 401 && !isLogin && auth.token) {
        await auth.logout();
      }
    },
  });
}
