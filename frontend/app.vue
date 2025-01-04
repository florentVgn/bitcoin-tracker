<script setup lang="ts">
import { apiFetch } from '~/composables/apiFetch';

const address = defineModel<string>('test');
const { $api } = useNuxtApp()

const createAddress = async () => {
  console.log(address.value)
  return $api('/wallets', {
    method: 'POST',
    body: {
      address: address.value
    }
  })
}
</script>


<template>
  <UContainer class="flex flex-col gap-4">
    <UInput v-model="address" />
    <UButton @click="createAddress()">Send</UButton>
  </UContainer>
</template>