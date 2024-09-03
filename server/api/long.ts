export default defineEventHandler(async () => {
  await new Promise(resolve => setTimeout(resolve, 65000))
  return 'Hello Nitro!'
})
