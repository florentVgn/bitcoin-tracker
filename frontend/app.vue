<script setup lang="ts">
import { useToast } from '#imports';

const { $api } = useNuxtApp();
const addresses = defineModel();
const toast = useToast();

async function fetchAddresses() {
  try {
    const response = await $api('/addresses/', {
      method: 'GET'
    }) as { addresses: any[] };
    addresses.value = response.addresses.map((address) => ({
      hash: address.hash,
      createdAt: new Date(address.createdAt).toLocaleString()
    }));
  } catch (error) {
    toast.add({ title: 'Error fetching addresses', color: 'red' });
  }
}

onMounted(async () => {
  await fetchAddresses();
});
</script>

<template>
  <UContainer class="flex flex-col gap-4 py-10">
    <NewAddressForm @addressAdded="fetchAddresses"></NewAddressForm>

    <h2>Addresses list</h2>
    <AddressesTable :addresses="addresses"></AddressesTable>
  </UContainer>
  <UNotifications />
</template>