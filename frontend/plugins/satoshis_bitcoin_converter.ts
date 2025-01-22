export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      satoshisToBitcoins: (satoshis: number) => {
        return satoshis / 10**8
      },
    }
  }
})