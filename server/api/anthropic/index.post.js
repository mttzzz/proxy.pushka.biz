export default defineEventHandler(async (event) => {
  const anthropic = event.context.anthropic

  let operationOutcome = { success: true, message: 'ok' }
  const { sensei_hash, model, system, message } = await readBody(event)

  try {
    const completion = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system,
      messages: [
        { role: 'user', content: message },
      ],
    })

    const content = completion.content[0].text

    let parsedContent = null
    try {
      parsedContent = JSON.parse(content)
    }
    catch (error) {
      console.error(error)

      operationOutcome.params = { local: { JSON: content } }
    }

    if (!parsedContent) {
      throw new Error('Не валидный JSON')
    }

    operationOutcome.params = { local: { ...parsedContent, JSON: content } }
  }
  catch (err) {
    operationOutcome = {
      success: false,
      message: err.message,
      status: err.status,
      params: operationOutcome.params,
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
        body: { params: operationOutcome.params },
      }).catch((finalErr) => {
        operationOutcome = {
          success: false,
          message: finalErr.message,
          status: finalErr.status,
          params: operationOutcome.params,
        }
      })
    }
  }

  return operationOutcome
})
