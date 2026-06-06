import { onBeforeUnmount } from 'vue';

export function useDebounceFn<T extends unknown[]>(fn: (...args: T) => void, ms = 200) {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, ms);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onBeforeUnmount(cancel);

  return debounced;
}
