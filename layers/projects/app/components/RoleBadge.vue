<script setup lang="ts">
defineProps<{ role: string }>();
</script>

<template>
  <span
    class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
  >
    {{ role }}
  </span>
</template>
