<script setup lang="ts">
import { useAddressesService } from '#imports';

const route = useRoute();
const { transactions, loading, error, getAddressesTransactions } = useAddressesService()

onMounted(async () => {
  await getAddressesTransactions(route.params.id as string);
});
</script>


<template>
  <UContainer class="flex flex-col gap-4 py-10">
    <h1 class="text-4xl">Transactions de l'adresse</h1>
    <UTable :rows="transactions"></UTable>
  </UContainer>
  <UNotifications />
</template>