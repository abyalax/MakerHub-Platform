import { defineNuxtPlugin } from 'nuxt/app';
import { provideSSRWidth } from '@vueuse/core';

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp);
});
