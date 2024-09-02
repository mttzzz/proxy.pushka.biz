import AnthropicClient from '@anthropic-ai/sdk'

let anthropic: AnthropicClient
declare module 'h3' {
  interface H3EventContext {
    anthropic: AnthropicClient
  }
}

export default eventHandler((event) => {
  if (!anthropic) {
    anthropic = new AnthropicClient({ apiKey: useRuntimeConfig().anthropicApiKey })
  }
  event.context.anthropic = anthropic
})
