<script lang="ts" setup>
import { setupDirectionProvider } from "../../context/useDirection";
setupDirectionProvider();
</script>
<template>
  <slot />
</template>
