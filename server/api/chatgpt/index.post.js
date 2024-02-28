import OpenAIClient from 'openai'

export default defineEventHandler(async (event) => {
  const openai = new OpenAIClient()
  let operationOutcome = { success: true, message: 'ok' } // Object to track operation outcome
  let sensei_hash, model, system, message // Объявление переменных здесь

  try {
    const body = await readBody(event)
    if (!body) {
      throw new Error('Request body is empty or invalid')
    }

    // Extracting fields from body
    ;({ sensei_hash, model, system, message } = body) // Использование деструктуризации без дополнительного объявления

    // Check for missing fields
    const missingFields = ['model', 'system', 'message', 'sensei_hash'].filter(
      (field) => !body[field],
    )
    if (missingFields.length) {
      throw new Error(`Missing required field(s): ${missingFields.join(', ')}`)
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
    })

    const content = completion.choices[0].message.content
    let parsedContent = null
    try {
      parsedContent = JSON.parse(content)
    } catch (error) {
      operationOutcome.params = { local: { JSON: content } }
    }

    if (!parsedContent) {
      throw new Error('Не валидный JSON')
    }

    operationOutcome.params = { local: { ...parsedContent, JSON: content } }
  } catch (err) {
    operationOutcome = {
      success: false,
      message: err.message,
      status: err.status,
      params: operationOutcome.params,
    }
  } finally {
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
