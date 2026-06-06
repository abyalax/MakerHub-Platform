import { type ComputedRef, computed } from "vue";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const colorMode = useColorMode();

  const setTheme = (val: Theme) => {
    colorMode.preference = val;
  };

  const theme: ComputedRef<Theme> = computed(
    () => colorMode.preference as Theme,
  );

  return {
    theme,
    setTheme,
    preference: computed(() => colorMode.preference),
  };
}
