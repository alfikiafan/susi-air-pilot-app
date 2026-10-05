// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // A signed-in operations tool talking to a separate API: no SEO or first-paint
  // needs, so it ships as a static SPA and the token never has to reach a server.
  ssr: false,

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:3001',
    },
  },

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Mixins and breakpoints in every component; colours live in CSS custom properties.
          additionalData: '@use "~/assets/scss/tools" as *;\n',
        },
      },
    },
  },

  app: {
    head: {
      title: 'Susi Air Pilot',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#0E2138' },
        {
          name: 'description',
          content:
            'Susi Air pilot app: schedule, flight hours and duty limits.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },
});
