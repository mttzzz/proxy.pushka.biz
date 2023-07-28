export default defineEventHandler(async (event) =>{
   
try {
  const {original_req_url: url} = event.node.req.headers

  if (!url) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "No 'original_req_url' provided in headers" })
      );
    }
   

    return proxyRequest(event, url, {fetch})

  } catch (err) {
   
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.message})
      );
    }
  }
)