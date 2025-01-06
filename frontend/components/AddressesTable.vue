<script setup lang="ts">
const { $api } = useNuxtApp();
const addresses = defineModel<any[]>();

onMounted(async () => {
  try {
    const response = await $api('/addresses/', {
      method: 'GET'
    }) as { addresses: any[] };
    addresses.value = response.addresses.map((address) => ({
      hash: address.hash,
      createdAt: new Date(address.createdAt).toLocaleString()
    }));
    console.log(addresses.value);
  } catch (error) {
    console.log(error);
  }
});

const columns = [{
  key: 'hash',
  label: 'Hash',

}, {
  key: 'createdAt',
  label: 'Created at'
}]

</script>

<template>
<UTable :rows="addresses" :columns="columns"/>
</template>