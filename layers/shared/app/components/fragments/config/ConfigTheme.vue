<script lang="ts" setup>
import IconThemeSystem from "../../../assets/custom/IconThemeSystem.vue";
import SectionTitle from "./SectionTitle.vue";
import { RadioGroupRoot as Radio } from "reka-ui";
import RadioItem from "./RadioItem.vue";
import IconThemeLight from "../../../assets/custom/IconThemeLight.vue";
import IconThemeDark from "../../../assets/custom/IconThemeDark.vue";
import { useTheme, type Theme } from "../../../composable/useTheme";

const { theme, setTheme } = useTheme();

const themeModel = computed({
  get: () => theme.value,
  set: (v: Theme) => setTheme(v),
});

const themeOptions = [
  { value: "system", label: "System", icon: IconThemeSystem },
  { value: "light", label: "Light", icon: IconThemeLight },
  { value: "dark", label: "Dark", icon: IconThemeDark },
];
</script>

<template>
  <div>
    <SectionTitle title="Theme" :show-reset="false" />
    <Radio
      v-model="themeModel"
      class="grid w-full max-w-md grid-cols-3 gap-4"
      aria-label="Select theme preference"
    >
      <RadioItem v-for="item in themeOptions" :key="item.value" :item="item" />
    </Radio>
    <div id="theme-description" class="sr-only">
      Choose between system preference, light mode, or dark mode
    </div>
  </div>
</template>
