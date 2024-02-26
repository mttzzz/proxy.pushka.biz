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

    // Prepare response content for the success case to send to Sensei
    operationOutcome.responseContent = {
      params: { local: { answer: content } },
    }
  } catch (err) {
    operationOutcome = {
      success: false,
      message: err.message,
      status: err.status,
    }
  } finally {
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
