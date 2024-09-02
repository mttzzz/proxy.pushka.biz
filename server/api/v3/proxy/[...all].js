export default defineEventHandler((event) => {
  try {
    const { original_req_url: baseUrl } = event.node.req.headers
    const href = event.node.req.url.replace('/api/v3/proxy', '')

    if (!baseUrl) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'No \'original_req_url\' provided in headers',
        }),
      )
    }

    return proxyRequest(event, baseUrl + href, { fetch })
  }
  catch (err) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.message }),
    )
  }
})
