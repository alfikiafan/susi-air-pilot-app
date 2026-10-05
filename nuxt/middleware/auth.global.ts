/** Every page except /login needs a session; a signed-in pilot never sees the login form. */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const isLoginPage = to.path === '/login';

  if (!auth.isAuthenticated && !isLoginPage) {
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined;
    return navigateTo(
      { path: '/login', query: redirect ? { redirect } : {} },
      { replace: true },
    );
  }
  if (auth.isAuthenticated && isLoginPage) {
    return navigateTo('/', { replace: true });
  }
});
