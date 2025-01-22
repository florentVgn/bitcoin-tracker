<script setup lang="ts">
import { useToast } from '#imports';
import type { AddressDto } from '~/models/address';
import type { Address } from 'node:cluster';

const { $api } = useNuxtApp();
const addresses = ref<AddressDto[]>([]);
addresses.value = [];
const toast = useToast();

async function fetchAddresses() {
  try {
    const response = await $api('/addresses/', {
      method: 'GET'
    }) as { addresses: AddressDto[] };
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
    <h1 class="text-2xl text">Addresses list</h1>
    <AddressesTable :addresses="addresses" @sync="syncAddress"></AddressesTable>
  </UContainer>
  <UNotifications />
</template>