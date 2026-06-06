export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('permission', (el: HTMLElement, binding) => {
    const { has, hasAll, hasAny } = usePermission();
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value];
    const useAllLogic = binding.modifiers.all === true;
    const hasPermission = useAllLogic ? hasAll(permissions) : permissions.length === 1 ? has(permissions[0]) : hasAny(permissions);
    const shouldShow = binding.modifiers.hide !== true;

    el.style.display = shouldShow ? (hasPermission ? '' : 'none') : hasPermission ? 'none' : '';
  });
});
