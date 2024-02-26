import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const openai = new OpenAI();

  try {
  // First, ensure you are getting a valid body object
    const body = await readBody(event);
      if (!body) {
        return sendError(event, createError({ statusCode: 400, statusMessage: 'Request body is empty or invalid' }));
       }

    const { sensei_hash, model, system, message } = await readBody(event);
    

    if (!model) {
      return sendError(event, createError({ statusCode: 500, statusMessage: 'No model defined' }));
    }

    if (!system) {
      return sendError(event, createError({ statusCode: 500, statusMessage: 'No system defined' }));
    }

    if (!message) {
      return sendError(event, createError({ statusCode: 500, statusMessage: 'No message defined' })); // Corrected the error message here
    }

    // Using await for the completion creation
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          "role": "user",
          "content": message
        },
      ]
    });

    const content = completion.choices[0].message.content;
    console.log(content);

    if (!sensei_hash) {
      return sendError(event, createError({ statusCode: 500, statusMessage: 'No sensei_hash defined' }));
    }
    
    try {
      const response = await $fetch('https://api.sensei.plus/webhook', {
        method: 'post',
        params: {
          hash: sensei_hash,
          result: 'success',
        },
        body: {
          params: {
            local: {
              answer: content,
            }
          }
        }
      });

      console.log(response);
    } catch (err) {
      console.log(err);
      // If the fetch fails, log the error and proceed; you might want to handle this differently.
    }

    return 'ok';
  } catch (err) {
    
    if (sensei_hash) {
      await $fetch('https://api.sensei.plus/webhook', {
        method: 'post',
        params: {
          hash: sensei_hash,
          result: 'error',
        },
        body: {
          status: 500,
          error: err.message
        }
      });
    }

    return sendError(event, createError({ statusCode: 500, statusMessage: err.message }));
  }
});
