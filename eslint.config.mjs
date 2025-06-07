// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt().overrideRules({
  // Your custom configs here
  'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
  'vue/singleline-html-element-content-newline': ['off'],
  'vue/operator-linebreak': ['off'],
  'vue/multi-word-component-names': ['off'], // TODO
  'vue/no-multiple-template-roots': ['off'], // temporary fix
  '@stylistic/operator-linebreak': ['error', 'after'],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-implicit-any': 'off',
  '@typescript-eslint/explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': 'off'
});
