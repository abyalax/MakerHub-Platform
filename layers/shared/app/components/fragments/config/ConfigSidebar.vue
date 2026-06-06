<script lang="ts" setup>
import { useLayout, type Variant } from "../../../context/useLayout";
import { RadioGroupRoot as Radio } from "reka-ui";
import IconSidebarInset from "../../../assets/custom/IconSidebarInset.vue";
import IconSidebarFloating from "../../../assets/custom/IconSidebarFloating.vue";
import IconSidebarDefault from "../../../assets/custom/IconSidebarDefault.vue";
import RadioItem from "./RadioItem.vue";
import SectionTitle from "./SectionTitle.vue";

const { defaultVariant, variant, setVariant } = useLayout();

const variantModel = computed({
  get: () => variant.value,
  set: (v: Variant) => setVariant(v),
});

const themeOptions = [
  {
    value: "inset",
    label: "Inset",
    icon: IconSidebarInset,
  },
  {
    value: "floating",
    label: "Floating",
    icon: IconSidebarFloating,
  },
  {
    value: "sidebar",
    label: "Sidebar",
    icon: IconSidebarDefault,
  },
];
</script>

<template>
  <div class="max-md:hidden">
    <SectionTitle title="Sidebar" :show-reset="defaultVariant !== variant" />
    <Radio
      v-model="variantModel"
      class="grid w-full max-w-md grid-cols-3 gap-4"
      aria-label="Select sidebar style"
      aria-describedby="sidebar-description"
    >
      <RadioItem v-for="item in themeOptions" :key="item.value" :item="item" />
    </Radio>
    <div id="sidebar-description" class="sr-only">
      Choose between inset, floating, or standard sidebar layout
    </div>
  </div>
</template>
