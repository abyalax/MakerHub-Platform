export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  ssr: false,

  extends: ['./layers/shared', './layers/public', './layers/auth', './layers/users', './layers/projects'],

  css: ['~/layers/shared/app/assets/css/tailwind.css', 'vue-sonner/style.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  modules: [
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/test-utils/module',
    '@peterbud/nuxt-query',
    'vue-sonner/nuxt',
  ],

  shadcn: {
    prefix: '',
    componentDir: './layers/shared/app/components/ui',
  },

  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    },
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'nuxt-color-mode',
  },

  runtimeConfig: {
    authAccessTokenSecret: process.env.NUXT_AUTH_ACCESS_TOKEN_SECRET,
    authRefreshTokenSecret: process.env.NUXT_AUTH_REFRESH_TOKEN_SECRET,
    authAccessTokenTtl: process.env.NUXT_AUTH_ACCESS_TOKEN_TTL,
    authRefreshTokenTtl: process.env.NUXT_AUTH_REFRESH_TOKEN_TTL,
    storageProvider: process.env.STORAGE_PROVIDER,
    storageEndpoint: process.env.STORAGE_ENDPOINT,
    storageAccessKey: process.env.STORAGE_ACCESS_KEY,
    storageSecretKey: process.env.STORAGE_SECRET_KEY,
    storageRegion: process.env.STORAGE_REGION,
    storageBucket: process.env.STORAGE_BUCKET,
    storagePresignedUploadExpirationMinutes: process.env.STORAGE_PRESIGNED_UPLOAD_EXPIRATION_MINUTES,
    storagePresignedDownloadExpirationMinutes: process.env.STORAGE_PRESIGNED_DOWNLOAD_EXPIRATION_MINUTES,
    storageMaxFileSizeMb: process.env.STORAGE_MAX_FILE_SIZE_MB,
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    },
  },

  vite: {
    define: {
      __DEV__: true,
    },
  },

  app: {
    head: {
      title: 'Nuxt 4 Layers Architecture',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Template Nuxt 4 with shadcn-vue, Tailwind CSS v4 Nuxt Layers Architecture.' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
});
