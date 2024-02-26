import OpenAIClient from 'openai'

export default defineEventHandler(async (event) => {
  const openai = new OpenAIClient()

  try {
    const { sensei_hash, model, system, message } = await readBody(event)

    if (!model) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: 'No model defined' }),
      )
    }

    if (!system) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: 'No system defined' }),
      )
    }

    if (!message) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: 'No system defined' }),
      )
    }

    openai.chat.completions
      .create({
        model,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      })
      .then((completion) => {
        const content = completion.choices[0].message.content
        let parsedContent = null
        try {
          parsedContent = JSON.parse(content)
        } catch (error) {
          console.log(error)
        }

        if (!parsedContent) {
          throw new Error('Не валидный JSON')
        }
        $fetch('https://api.sensei.plus/webhook', {
          method: 'post',
          params: {
            hash: sensei_hash,
            result: 'success',
          },
          body: {
            params: {
              local: {
                JSON: content,
                Цели:
                  parsedContent?.data?.targets ??
                  'не получилось распарсить JSON',
                Задачи:
                  parsedContent?.data?.tasks ?? 'не получилось распарсить JSON',
                Обязательства:
                  parsedContent?.data?.need ?? 'не получилось распарсить JSON',
              },
            },
          },
        })
          .then((res) => {
            console.log(res)
          })
          .catch((err) => {
            console.log(err)
          })
      })

    return 'ok'
  } catch (err) {
    $fetch('https://api.sensei.plus/webhook', {
      method: 'post',
      params: {
        hash: sensei_hash,
        result: 'error',
      },
      body: {
        status: 500,
        error: err.message,
      },
    })

    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.message }),
    )
  }
})
