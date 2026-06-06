<script setup lang="ts"></script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold tracking-tight">Nuxt 4 Layers Template</h1>
      <p class="text-muted-foreground">Template with shadcn-vue, tailwinds v4 and Nuxt layers architecture</p>
    </div>

    <div class="flex gap-4">
      <NuxtLink to="/example">
        <Button>Example Modules</Button>
      </NuxtLink>
      <NuxtLink to="/public-events">
        <Button variant="outline">Public Events</Button>
      </NuxtLink>
    </div>
  </div>
</template>
