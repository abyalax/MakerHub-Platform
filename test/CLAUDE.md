

Testing instructions for this repository, following Nuxt 4 standards.

## Structure


```

tests/
├── setup.ts           # Global setup (Nuxt mocks)
├── unit/              # Node environment (Fast)
├── nuxt/              # Nuxt environment (Composables, components)
└── e2e/               # Playwright (End-to-end)

```

### When to use each folder

| Folder | Environment | Speed | What to test |
|-------|----------|------------|--------------|
| `unit/` | Pure Node | ⚡ Fast | Pure functions, utils, validators |
| `nuxt/` | Nuxt Runtime | 🐢 Medium | Composables, stores, components |
| `e2e/` | Real Browser | 🐌 Slow | Full flows, navigation |

## Tools

| Tool | Usage |
|------------|-----|
| Vitest | Unit and Nuxt tests |
| Playwright | E2E (end-to-end) tests |
| @vue/test-utils | Mount Vue components |
| @testing-library/vue | User-centric testing |
| happy-dom | DOM environment |

## Commands

```bash
# Unit tests (Vitest)
npm run test           # Watch mode
npm run test:run       # Single execution
npm run test:coverage  # With coverage report
npm run test:ui        # Visual UI interface

# E2E tests (Playwright)
npm run test:e2e           # Run tests
npm run test:e2e:ui        # Visual UI interface
npm run test:e2e:headed    # With visible browser
npm run test:e2e:install   # Install browsers

```

## Unit Testing (tests/unit/)

For pure functions that do not depend on Nuxt:

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest'

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

describe('formatCPF', () => {
  it('should format CPF correctly', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01')
  })
})

```

## Nuxt Testing (tests/nuxt/)

For code that requires the Nuxt runtime (composables, stores, components):

### Composable Testing

```typescript
// tests/nuxt/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})

```

### Store Testing (Pinia)

```typescript
// tests/nuxt/stores/example.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should start empty', () => {
    const store = useExampleStore()
    expect(store.items).toEqual([])
  })
})

```

### Component Testing

```typescript
// tests/nuxt/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/layers/1-base/app/components/ui/button/Button.vue'

describe('Button', () => {
  it('should render slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })
})

```

## E2E Testing (tests/e2e/)

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Nuxt/)
  })
})

```

## Mocking

### Mocking $fetch (in tests/nuxt/)

```typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

it('should call API', async () => {
  mockFetch.mockResolvedValue([{ id: '1', name: 'Test' }])

  const api = useExampleApi()
  const result = await api.getAll()

  expect(mockFetch).toHaveBeenCalledWith('/api/examples')
})

```

## Best Practices

### Naming Conventions

```typescript
// ✅ GOOD - Describes behavior
it('should show error when email is invalid', () => {})

// ❌ BAD - Vague
it('test 1', () => {})

```

### Data-testid for E2E

```vue
<button data-testid="submit-button">Send</button>

<button class="btn btn-primary">Send</button>

```

## References

* [Nuxt 4 Testing](https://nuxt.com/docs/4.x/getting-started/testing)
* [Vitest](https://vitest.dev/)
* [Playwright](https://playwright.dev/)
* [Vue Test Utils](https://test-utils.vuejs.org/)

```