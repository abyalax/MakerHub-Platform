import { ref } from 'vue';

/**
 * Composable for confirm dialog state
 * @param initialState boolean
 * @returns An object containing the reactive state and a toggle function.
 */
export function useDialogState(initialState: boolean = false) {
  const open = ref(initialState);
  const setOpen = () => open.value = true;
  return {
    open, 
    setOpen
  };
}