export default defineEventHandler(async (event) => {
  const anthropic = event.context.anthropic
  let operationOutcome = { success: true, message: 'ok' }
  const { sensei_hash, model, system, message, temperature, top_p, key } = await readBody(event)

  try {
    const config = useRuntimeConfig()
    anthropic.apiKey = Number.parseInt(key) === 2 ? config.anthropicApiKey2 : config.anthropicApiKey
    const completion = await anthropic.beta.promptCaching.messages.create({
      model,
      max_tokens: 8192,
      top_p: Number.parseFloat(top_p) || 1.0,
      temperature: Number.parseFloat(temperature) || 1.0,
      system: [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        { role: 'user', content: message },
      ],
    })

    const content = completion.content[0].text
    operationOutcome.completion = completion
    // Prepare response content for the success case to send to Sensei
    operationOutcome.responseContent = {
      params: { local: { answer: content } },
    }
  }
  catch (err) {
    operationOutcome = {
      success: false,
      message: err.message,
      status: err.status,
    }
  }
  finally {
    if (sensei_hash) {
      await $fetch('https://api.sensei.plus/webhook', {
        method: 'post',
        params: {
          hash: sensei_hash,
          result: operationOutcome.success ? 'success' : 'error',
        },
        body: operationOutcome.responseContent,
      }).catch((finalErr) => {
        operationOutcome = {
          success: false,
          message: finalErr.message,
          status: finalErr.status,
        }
      })
    }
  }

  return operationOutcome
})
