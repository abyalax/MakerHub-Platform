<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="max-w-md rounded-lg border bg-card p-8 text-center">
      <h1 class="text-2xl font-semibold">Unauthorized</h1>
      <p class="mt-2 text-sm text-muted-foreground">You do not have permission to access this page.</p>
      <NuxtLink to="/dashboard">
        <Button class="mt-6">Back to dashboard</Button>
      </NuxtLink>
    </div>
  </div>
</template>
