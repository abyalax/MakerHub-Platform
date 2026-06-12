<script setup lang="ts">
defineProps<{
  id: string;
  title: string;
}>();
</script>

<template>
  <section :id="id" class="scroll-mt-24 border-b pb-8 last:border-b-0">
    <h2 class="group flex items-center gap-2 text-2xl font-semibold tracking-tight">
      <a :href="`#${id}`" class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">#</a>
      <span>{{ title }}</span>
    </h2>

    <div class="mt-4 text-sm leading-7 text-muted-foreground">
      <slot />
    </div>
  </section>
</template>
