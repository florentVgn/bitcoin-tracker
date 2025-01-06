<script setup lang="ts">
const address = defineModel<string>('test');
const { $api } = useNuxtApp();
const toast = useToast();

const createAddress = async () => {
  console.log(address.value);
  await $api('/wallets', {
    method: 'POST',
    body: {
      address: address.value
    }
  });

};

</script>


<template>
  <UContainer class="flex flex-col gap-4">
    <UInput v-model="address" />
    <UButton @click="createAddress()">Send</UButton>

    <h2>Addresses list</h2>
    <AddressesTable>
    </AddressesTable>
  </UContainer>
  <UNotifications />
</template>