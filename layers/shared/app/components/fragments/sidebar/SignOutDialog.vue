<script lang="ts" setup>
import ConfirmDialog from '../confirm/ConfirmDialog.vue';

const open = defineModel<boolean>('open', { default: false });
const { mutate } = useLogout();
</script>

<template>
  <ConfirmDialog
    v-model:open="open"
    title="Sign Out"
    desc="Are you sure you want to sign out? You will need to sign in again to access your account."
    destructive
    :is-loading="false"
    class="sm:max-w-sm"
    @confirm="mutate"
  />
</template>
