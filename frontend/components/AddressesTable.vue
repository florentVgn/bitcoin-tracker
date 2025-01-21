<script setup lang="ts">
import type { Address } from '~/models/address';

const emit = defineEmits(['sync']);

const props = defineProps<{ addresses: Address[] }>();
const columns = [{
  key: 'hash',
  label: 'Hash'

}, {
  key: 'createdAt',
  label: 'Created at'
}, {
  key: 'action'
}];

const emitSync = (event: Address) => {
  const addressId = props.addresses.find(address => address.hash === event.hash)?.id;
  emit('sync', { id: addressId });
};

</script>

<template>
  <UTable :rows="props.addresses" :columns="columns">
    <template #action-data='{ row }'>
      <NuxtLink :to="`/addresses/${row.id}`">
        <UButton variant="ghost" @click="emitSync(row)">
          Voir
        </UButton>
      </NuxtLink>
    </template>
  </UTable>
</template>