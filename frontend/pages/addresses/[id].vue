<script setup lang="ts">
import { useAddressesService } from '#imports';

const route = useRoute();
const { $satoshisBitcoinConverter } = useNuxtApp();
const { address, transactions, loading, error, getAddressesTransactions, getAddress } = useAddressesService();
const pageCount = ref(0);
const total = ref(0);
const page = ref((route.query.page ?? 1) as number);

onMounted(async () => {
  const id = route.params.id as string;
  await getAddress(id);
  await getAddressesTransactions({id, page: 1});
  if (address?.value) {
    console.log(address.value.transactionsCount / 20);
    pageCount.value = Math.floor(address.value.transactionsCount / 20);
    total.value = address.value.transactionsCount;
  }
});

watch(page, (newPage) => {
  if (!address?.value) return
  getAddressesTransactions({id: address.value.id, page: page.value});
});


const columns = [{
  key: 'hash',
  label: 'Hash'
}, {
  key: 'amount',
  label: 'Amount'
}, {
  key: 'time',
  label: 'Time'
}];

</script>


<template>
  <UContainer class="flex flex-col gap-4 py-10 items-center">
    <h1 class="text-4xl">Transactions de l'adresse</h1>
    <template v-if="!loading && address">
      <p>Hash : {{ address.hash }}</p>
      <p>Address balance : {{ $satoshisToBitcoins(address.addressBalance) }}</p>
    </template>
    <UTable :rows="transactions" :columns="columns">
      <template #time-data="{row}">
        <span>{{ new Date(row.time).toLocaleString() }}</span>
      </template>
    </UTable>
    <UPagination v-if="address" v-model="page" :page-count="pageCount" :total="total" :to="(page: number) => ({
      query: { page },
      hash: '#'
    })" />
  </UContainer>
  <UNotifications />
</template>