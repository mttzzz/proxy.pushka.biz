export default defineEventHandler(async (event) => {
  const { original_req_url: url, authorization } = event.node.req.headers

  if (!url) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'No \'original_req_url\' provided in headers',
      }),
    )
  }

  const params = getQuery(event)
  const method = event.node.req.method
  const options = { method, params, headers: {} }

  if (method !== 'GET') {
    options.body = await readBody(event)
  }
  if (authorization) {
    options.headers.authorization = authorization
  }

  try {
    return await $fetch(url, options)
  }
  catch (error) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: error.message }),
    )
  }
})
