import { describe, it, expect, beforeEach } from 'vitest';
import { useTheme, type Theme } from '~/layers/shared/app/composable/useTheme';

// Mocking useColorMode from @nuxtjs/color-mode
// Nuxt will automatically provide these in the test environment
describe('useTheme', () => {
  beforeEach(() => {
    const colorMode = useColorMode();
    colorMode.preference = 'system'; // Reset to default before each test
  });

  it('should return "system" as the default theme', () => {
    const { theme } = useTheme();

    expect(theme.value).toBe('system');
  });

  it('should update the theme when setTheme is called', () => {
    const { theme, setTheme } = useTheme();
    const newTheme: Theme = 'dark';

    setTheme(newTheme);

    expect(theme.value).toBe('dark');
    expect(useColorMode().preference).toBe('dark');
  });

  it('should sync preference with colorMode', () => {
    const { preference, setTheme } = useTheme();

    setTheme('light');
    expect(preference.value).toBe('light');

    // Simulate direct change to colorMode
    useColorMode().preference = 'dark';
    expect(preference.value).toBe('dark');
  });
});
