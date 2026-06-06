<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import Button from "../../ui/button/Button.vue";
import { cn } from "../../../lib/utils";

interface ConfirmDialogProps {
  title: string;
  desc?: string;
  disabled?: boolean;
  cancelBtnText?: string;
  confirmText?: string;
  destructive?: boolean;
  isLoading?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  disabled: false,
  cancelBtnText: "Cancel",
  confirmText: "Continue",
  desc: "",
  class: "",
});

const emit = defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent :class="cn(props.class)">
      <AlertDialogHeader class="text-start">
        <AlertDialogTitle>
          <slot name="title">{{ title }}</slot>
        </AlertDialogTitle>

        <AlertDialogDescription as-child>
          <div>
            <slot name="description">{{ desc }}</slot>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <slot />

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isLoading">
          {{ cancelBtnText }}
        </AlertDialogCancel>

        <Button
          :variant="destructive ? 'destructive' : 'default'"
          :disabled="disabled || isLoading"
          @click="emit('confirm')"
        >
          <template v-if="isLoading"> Loading... </template>
          <template v-else>
            {{ confirmText }}
          </template>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
