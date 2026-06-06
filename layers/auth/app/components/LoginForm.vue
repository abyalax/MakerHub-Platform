<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { Button } from '~/layers/shared/app/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/layers/shared/app/components/ui/form';
import { useLogin } from '../composables/useLogin';

interface Props {
  redirectUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  redirectUrl: '/dashboard',
});

const { mutate: mutateLogin, isPending } = useLogin();

const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
);

const form = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: 'admin@gmail.com',
    password: 'adminPassword1_',
  },
});

const onSubmit = form.handleSubmit((values) =>
  mutateLogin({
    email: values.email,
    password: values.password,
    redirectUrl: props.redirectUrl,
  })
);
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="name@example.com" v-bind="componentField" :disabled="isPending" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="••••••••" v-bind="componentField" :disabled="isPending" />
        </FormControl>
        <FormMessage />
        <p class="text-sm text-muted-foreground">
          <a href="/forgot-password" class="hover:text-brand underline underline-offset-4"> Forgot password? </a>
        </p>
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? 'Logging in...' : 'Login' }}
    </Button>
  </form>
</template>
