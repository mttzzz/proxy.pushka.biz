import OpenaiClient from 'openai'

let openai: OpenaiClient
declare module 'h3' {
  interface H3EventContext {
    openai: OpenaiClient
  }
}

export default eventHandler((event) => {
  if (!openai) {
    openai = new OpenaiClient({ apiKey: useRuntimeConfig().openaiApiKey })
  }
  event.context.openai = openai
})
