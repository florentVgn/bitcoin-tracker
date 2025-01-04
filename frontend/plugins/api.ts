export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: 'http://localhost:3333',
  })

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api
    }
  }
})
