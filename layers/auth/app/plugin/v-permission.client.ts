/**
 * v-permission directive plugin for Nuxt 4
 *
 * Usage:
 *   v-permission="'user:delete'"                    // Single
 *   v-permission="['user:delete', 'user:update']"  // Multiple OR
 *   v-permission.all="['user:read', 'user:update']" // Multiple AND
 *   v-permission.show="true"                        // Show if authorized
 *   v-permission.hide="true"                        // Hide if authorized
 *
 * Example:
 *   <button v-permission="PERMISSIONS.USER.DELETE">Delete</button>
 *   <div v-permission.all="[PERMISSIONS.EVENT.READ, PERMISSIONS.EVENT.PUBLISH]">
 *     Publish section
 *   </div>
 *   <p v-permission.hide="PERMISSIONS.ADMIN">Not admin</p>
 */

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('permission', (el: HTMLElement, binding) => {
    const { has, hasAll, hasAny } = usePermission();

    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value];

    // Determine logic: AND atau OR
    const useAllLogic = binding.modifiers.all === true;

    let hasPermission = false;

    if (useAllLogic) {
      // AND logic
      hasPermission = hasAll(permissions);
    } else {
      // OR logic (default)
      hasPermission = permissions.length === 1 ? has(permissions[0]) : hasAny(permissions);
    }

    // Determine visibility: show atau hide
    const shouldShow = binding.modifiers.hide !== true;

    // Apply visibility
    if (shouldShow) {
      // Show if authorized, hide if not
      el.style.display = hasPermission ? '' : 'none';
    } else {
      // Hide if authorized, show if not
      el.style.display = hasPermission ? 'none' : '';
    }
  });
});
