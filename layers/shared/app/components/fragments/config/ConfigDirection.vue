<script lang="ts" setup>
import { useDirection, type Direction } from "../../../context/useDirection";
import { RadioGroupRoot as Radio } from "reka-ui";
import SectionTitle from "./SectionTitle.vue";
import type { SVGAttributes } from "vue";
import IconDir from "../../../assets/custom/IconDir.vue";
import RadioItem from "./RadioItem.vue";

const { defaultDir, dir, setDir } = useDirection();

const dirModel = computed({
  get: () => dir.value,
  set: (dir: Direction) => setDir(dir),
});

const onReset = () => setDir(defaultDir);
const themeOptions = [
  {
    value: "ltr",
    label: "Left to Right",
    icon: (props: SVGAttributes) => h(IconDir, { ...props, dir: "ltr" }),
  },
  {
    value: "rtl",
    label: "Right to Left",
    icon: (props: SVGAttributes) => h(IconDir, { ...props, dir: "rtl" }),
  },
];
</script>

<template>
  <div>
    <SectionTitle
      title="Direction"
      :show-reset="defaultDir !== dir"
      @on-reset="onReset"
    />
    <Radio
      v-model="dirModel"
      class="grid w-full max-w-md grid-cols-3 gap-4"
      aria-label="Select site direction"
      aria-describedby="direction-description"
    >
      <RadioItem v-for="item in themeOptions" :key="item.value" :item="item" />
    </Radio>
    <div id="direction-description" class="sr-only">
      Choose between left-to-right or right-to-left site direction
    </div>
  </div>
</template>
