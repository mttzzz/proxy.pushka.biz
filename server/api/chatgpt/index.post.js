import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const apiKey = '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'
  const openai = new OpenAI({apiKey });
   
    try {
      const {model, messages} = await readBody(event)

      if (!model)  {
        return 'No model defined'
      }

      if (!messages)  {
        return 'No messages defined'
      }

      const completion = await openai.chat.completions.create({
        messages: [{"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who won the world series in 2020?"},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            {"role": "user", "content": "Where was it played?"}],
        model: "gpt-3.5-turbo",
      });
      return completion.choices[0].message.content
      } catch (err) {
       
        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: err.message})
          );
        }
      }
    )