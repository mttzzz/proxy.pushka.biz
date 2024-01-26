import OpenAI from "openai";

export default defineEventHandler(async (event) => {

  const openai = new OpenAI();
   
    try {
      const {sensei_hash,model,system, message  } = await readBody(event) 
      

      

      if (!model)  {
        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: 'No model defined'})
          );
        }
    

      if (!system)  {
        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: 'No system defined'})
          );
        }
      
      

      if (!message)  {
        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: 'No system defined'})
          );
        }
     
    
      
      openai.chat.completions.create({model, messages : [
        {
          "role": "user",
          "content": message
        },
      ]}).then(completion => {
        const content = completion.choices[0].message.content


        $fetch('https://api.sensei.plus/webhook', { method:'post', params: {
          hash: sensei_hash,
          result: 'success',
        }, body: {params: {local: {
          answer: content,
         
        }}}
      }).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
        
       
      });

      return 'ok'
      } catch (err) {
        $fetch('https://api.sensei.plus/webhook', { method:'post', params: {
          hash: sensei_hash,
          result: 'error',
        }, body: {
         status: 500,
         error: err.message
        }
      })

        return sendError(
          event,
          createError({ statusCode: 500, statusMessage: err.message})
          );
        }
      }
    )