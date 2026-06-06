import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt().append({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-mutating-props': 'error',

    'vue/html-self-closing': [
      'error',
      {
        html: { void: 'always', normal: 'always', component: 'always' },
      },
    ],

    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
});
