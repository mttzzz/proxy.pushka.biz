// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  eslint: {
    config: {
      standalone: false,
    },
  },
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    anthropicApiKey: process.env.NUXT_ANTHROPIC_API_KEY,
    anthropicApiKey2: process.env.NUXT_ANTHROPIC_API_KEY2,
  },

  compatibilityDate: '2024-09-02',
})
