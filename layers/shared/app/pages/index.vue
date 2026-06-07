<script setup lang="ts"></script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold tracking-tight">MakerHub</h1>
      <p class="text-muted-foreground">Project-based learning marketplace</p>
    </div>

    <div class="flex gap-4">
      <NuxtLink to="/projects">
        <Button>Browse Projects</Button>
      </NuxtLink>
      <NuxtLink to="/login">
        <Button variant="outline">Sign In</Button>
      </NuxtLink>
    </div>
  </div>
</template>
