<script setup lang="ts">
import AppProvider from '../components/providers/AppProvider.vue';
</script>
<template>
  <AppProvider>
    <slot />
  </AppProvider>
</template>
