<script lang="ts" setup>
import { cn } from "../../../lib/utils";
import { RadioGroupItem } from "reka-ui";
import type { Component } from "vue";
import { CircleCheck } from "lucide-vue-next";

type RadioItemProps = {
  item: {
    value: string;
    label: string;
    icon: Component;
  };
  isTheme?: boolean;
};
defineProps<RadioItemProps>();
</script>

<template>
  <RadioGroupItem
    :value="item.value"
    :class="cn('group outline-none', 'transition duration-200 ease-in')"
    :aria-label="`Select ${item.label.toLowerCase()}`"
    :aria-describedby="`${item.value}-description`"
  >
    <div
      :class="
        cn(
          'ring-border relative rounded-[6px] ring-[1px]',
          'group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl',
          'group-focus-visible:ring-2',
        )
      "
      :aria-hidden="false"
      :aria-label="`${item.label} option preview`"
    >
      <CircleCheck
        :class="
          cn(
            'fill-primary size-6 stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
          )
        "
        aria-hidden
      />
      <component
        :is="item.icon"
        :class="
          cn(
            !isTheme &&
              'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground',
          )
        "
        aria-hidden
      />
    </div>
    <div
      :id="`${item.value}-description`"
      class="mt-1 text-xs"
      aria-live="polite"
    >
      {{ item.label }}
    </div>
  </RadioGroupItem>
</template>
