import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    rules: {
      'unused-imports/no-unused-vars': ['error', { caughtErrors: 'none' }],
      'node/prefer-global/process': ['off'],
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      }],
    },
  }),
)
