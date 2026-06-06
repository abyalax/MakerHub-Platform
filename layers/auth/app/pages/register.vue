<script setup lang="ts">
import RegisterForm from '~/layers/auth/app/components/RegisterForm.vue';
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight">Create your account</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-primary hover:underline"> Sign in </NuxtLink>
        </p>
      </div>

      <RegisterForm />
    </div>
  </div>
</template>
