import type { Transaction } from '~/models/transaction';

export const useAddressesService = () => {
  const { $api } = useNuxtApp()

  const state = reactive<{
    transactions: Transaction[],
    loading: boolean,
    error: any | null,
  }>({
    transactions: [],
    loading: false,
    error: null
  })

  const getAddressesTransactions = async (id: string) => {
    state.loading = true
    try {
      const response = await $api(`/addresses/${id}/transactions`) as {transactions: Transaction[]}
      state.transactions = response.transactions
    } catch (error) {
      state.error = error
    } finally {
      state.loading = false
    }
  }

  return {
    ...toRefs(state),
    getAddressesTransactions,
  }
}