import OpenAI from "openai";

export default defineEventHandler(async (event) => {

  const openai = new OpenAI();
   
    try {
      const {model, message, system} = await readBody(event)

      if (!model)  {
        return 'No model defined'
      }

      if (!system)  {
        return 'No system defined'
      }

      if (!message)  {
        return 'No system defined'
      }

      const completion = await openai.chat.completions.create({model, messages : [
        {
          "role": "user",
          "content": message
        },
      ]});
      return completion.choices[0].message.content
      } catch (err) {
       
        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: err.message})
          );
        }
      }
    )