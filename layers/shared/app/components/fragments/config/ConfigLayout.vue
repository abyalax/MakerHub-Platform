<script lang="ts" setup>
import { RadioGroupRoot as Radio } from "reka-ui";
import { useSidebar } from "../../ui/sidebar";
import { useLayout, type Collapsible } from "../../../context/useLayout";
import IconLayoutDefault from "../../../assets/custom/IconLayoutDefault.vue";
import IconLayoutCompact from "../../../assets/custom/IconLayoutCompact.vue";
import IconLayoutFull from "../../../assets/custom/IconLayoutFull.vue";
import SectionTitle from "./SectionTitle.vue";
import RadioItem from "./RadioItem.vue";

const { open, setOpen } = useSidebar();

const { defaultCollapsible, collapsible, setCollapsible } = useLayout();

const layoutModel = computed({
  get() {
    if (open.value) return "default";
    return collapsible.value;
  },
  set(v: string) {
    if (v === "default") {
      open.value = true;
      return;
    }
    open.value = false;
    collapsible.value = v as Collapsible;
  },
});

const onReset = () => {
  setOpen(true);
  setCollapsible(defaultCollapsible);
};

const themeOptions = [
  {
    value: "default",
    label: "Default",
    icon: IconLayoutDefault,
  },
  {
    value: "icon",
    label: "Compact",
    icon: IconLayoutCompact,
  },
  {
    value: "offcanvas",
    label: "Full layout",
    icon: IconLayoutFull,
  },
];
</script>

<template>
  <div class="max-md:hidden">
    <SectionTitle
      title="Layout"
      :show-reset="layoutModel !== 'default'"
      @on-reset="onReset"
    />
    <Radio
      v-model="layoutModel"
      class="grid w-full max-w-md grid-cols-3 gap-4"
      aria-label="Select layout style"
      aria-describedby="layout-description"
    >
      <RadioItem v-for="item in themeOptions" :key="item.value" :item="item" />
    </Radio>
    <div id="layout-description" class="sr-only">
      Choose between default expanded, compact icon-only, or full layout mode
    </div>
  </div>
</template>
