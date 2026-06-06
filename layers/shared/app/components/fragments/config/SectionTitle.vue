<script lang="ts" setup>
import { RotateCcw } from "lucide-vue-next";
import Button from "../../ui/button/Button.vue";
import { cn } from "../../../lib/utils";

type Props = {
  title: string;
  showReset?: boolean;
  class?: string;
};

type EmitType = (e: "on-reset") => void;

const emit = defineEmits<EmitType>();
const props = defineProps<Props>();

const onReset = () => emit("on-reset");

const classes = computed(() =>
  cn(
    "text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold",
    props.class,
  ),
);
</script>

<template>
  <div :class="classes">
    {{ title }}
    <Button
      v-if="showReset"
      size="icon"
      variant="secondary"
      class="size-4 rounded-full"
      @click="onReset"
    >
      <RotateCcw class="size-3" />
    </Button>
  </div>
</template>
