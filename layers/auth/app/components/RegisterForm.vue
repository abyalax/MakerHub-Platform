<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { Button } from '~/layers/shared/app/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/layers/shared/app/components/ui/form';
import { passwordSchema } from '../utils/password-validation';

const { mutate: register, isPending } = useRegister();

const registerSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    password: passwordSchema,
  })
);

const form = useForm({
  validationSchema: registerSchema,
  initialValues: {
    name: '',
    email: '',
    password: '',
  },
});

const onSubmit = form.handleSubmit((values) =>
  register({
    name: values.name,
    email: values.email,
    password: values.password,
  })
);
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter your name" v-bind="componentField" :disabled="isPending" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

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
          <Input type="password" placeholder="Create a password" v-bind="componentField" :disabled="isPending" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? 'Creating account...' : 'Register' }}
    </Button>
  </form>
</template>
