export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  ssr: false,

  extends: [
    './layers/shared',
    './layers/auth',
    './layers/users',
    './layers/projects',
    './layers/payments',
    './layers/enrollments',
    './layers/progress',
    './layers/revenue',
    './layers/subscriptions',
    './layers/admin-analytics',
    './layers/bookmarks',
  ],

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
    'pinia-plugin-persistedstate/nuxt',
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

    isProduction: process.env.NODE_ENV === 'production',
    appUrl: process.env.APP_URL,

    xenditApiKey: process.env.XENDIT_API_KEY,
    xenditApiUrl: process.env.XENDIT_API_URL || 'https://api.xendit.co',
    xenditWebhookToken: process.env.XENDIT_WEBHOOK_TOKEN,

    storageProvider: process.env.STORAGE_PROVIDER || 'minio',
    storageEndpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
    storageAccessKey: process.env.STORAGE_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
    storageSecretKey: process.env.STORAGE_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    storageRegion: process.env.STORAGE_REGION || 'us-east-1',
    storageBucket: process.env.STORAGE_BUCKET || 'boilerplate-uploads',
    storagePresignedUploadExpirationMinutes: process.env.STORAGE_PRESIGNED_UPLOAD_EXPIRATION_MINUTES || '10',
    storagePresignedDownloadExpirationMinutes: process.env.STORAGE_PRESIGNED_DOWNLOAD_EXPIRATION_MINUTES || '10',
    storageMaxFileSizeMb: process.env.STORAGE_MAX_FILE_SIZE_MB || '10',

    public: {
      apiBaseUrl: process.env.API_BASE_URL || '/api',
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
