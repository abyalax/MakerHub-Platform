<script setup lang="ts">
import { Button } from '~/layers/shared/app/components/ui/button';
import type { User } from '../types';

defineProps<{
  user: User;
  canUpdate: boolean;
  canDelete: boolean;
}>();

defineEmits<{
  edit: [user: User];
  delete: [user: User];
}>();
</script>

<template>
  <div class="flex gap-2">
    <Button v-if="canUpdate" variant="outline" size="sm" @click.stop="$emit('edit', user)">Edit</Button>
    <Button v-if="canDelete" variant="destructive" size="sm" @click.stop="$emit('delete', user)">Delete</Button>
  </div>
</template>
