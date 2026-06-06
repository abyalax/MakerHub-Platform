<script setup lang="ts">
import { setupSearchProvider } from "../../context/useAppSearch";
import CommandMenu from "../fragments/command/CommandMenu.vue";

setupSearchProvider();
</script>

<template>
  <slot />
  <CommandMenu />
</template>
