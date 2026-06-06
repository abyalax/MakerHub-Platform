<script lang="ts" setup>
import LoginForm from '../components/LoginForm.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const redirect = route.query.redirect as string;
const redirectUrl = redirect ?? '/dashboard';
</script>
<template>
  <div class="container relative flex h-screen flex-col items-center justify-center lg:px-0">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p class="text-sm text-muted-foreground">Enter your email and password to sign in</p>
      </div>

      <LoginForm :redirect-url="redirectUrl" />

      <p class="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink to="/register" class="hover:text-brand underline underline-offset-4"> Sign up </NuxtLink>
      </p>
    </div>
  </div>
</template>
