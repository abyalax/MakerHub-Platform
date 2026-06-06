<script lang="ts" setup>
import SearchProvider from './SearchProvider.vue';
import DirectionProvider from './DirectionProvider.vue';
import LayoutProvider from './LayoutProvider.vue';
import Toaster from '../ui/sonner/Sonner.vue';
import { useTheme } from '../../composable/useTheme';

const { theme } = useTheme();
</script>

<template>
  <DirectionProvider>
    <SearchProvider>
      <LayoutProvider>
        <Toaster :theme="theme" rich-colors position="top-center" close-button />
        <slot />
      </LayoutProvider>
    </SearchProvider>
  </DirectionProvider>
</template>
