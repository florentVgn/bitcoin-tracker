<script setup lang="ts">
import { useToast } from '#imports';
import type { Address } from '~/models/Address';

const { $api } = useNuxtApp();
const addresses = ref<Address[]>([]);
addresses.value = [];
const toast = useToast();

async function fetchAddresses() {
  try {
    const response = await $api('/addresses/', {
      method: 'GET'
    }) as { addresses: Address[] };
    addresses.value = response.addresses.map((address) => ({
      id: address.id,
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

async function syncAddress(event: Pick<Address, 'id'>) {
  console.log(event);
  try {
    await $api(`/addresses/${event.id}/sync/`, {
      method: 'POST'
    });
    toast.add({ title: 'Address has been synced' });
  } catch (error) {
    toast.add({ title: 'Error synchronizing address', color: 'red' });
  }
}
</script>

<template>
  <UContainer class="flex flex-col gap-4 py-10">
    <NewAddressForm @addressAdded="fetchAddresses"></NewAddressForm>

    <h2>Addresses list</h2>
    <AddressesTable :addresses="addresses" @sync="syncAddress"></AddressesTable>
  </UContainer>
  <UNotifications />
</template>