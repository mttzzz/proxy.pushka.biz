export default defineEventHandler(async (event) => {
  let timeout = 65000
  const query = getQuery(event)
  if (query && query.timeout) {
    timeout = Number.parseInt(query.timeout.toString())
  }
  await new Promise(resolve => setTimeout(resolve, timeout))
  return 'Hello Nitro!'
})
