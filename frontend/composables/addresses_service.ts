import type { Transaction } from '~/models/transaction';
import type { AddressDto } from '~/models/address';
import type { Address } from 'node:cluster';

export const useAddressesService = () => {
  const { $api } = useNuxtApp()

  const state = reactive<{
    address: AddressDto | null,
    transactions: Transaction[],
    loading: boolean,
    error: any | null,
  }>({
    address: null,
    transactions: [],
    loading: false,
    error: null
  })

  const getAddressesTransactions = async ({id, page}:{ id: string, page: number }) => {
    state.loading = true
    try {
      const response = await $api(`/addresses/${id}/transactions?page=${page}`) as {transactions: Transaction[]}
      state.transactions = response.transactions
    } catch (error) {
      state.error = error
    } finally {
      state.loading = false
    }
  }

  const getAddress = async (id: string) => {
    state.loading = true
    try {
      const response = await $api(`/addresses/${id}`) as {address: AddressDto}
      state.address = response.address
    } catch (error) {
      state.error = error
    } finally {
      state.loading = false
    }
  }

  return {
    ...toRefs(state),
    getAddressesTransactions,
    getAddress
  }
}