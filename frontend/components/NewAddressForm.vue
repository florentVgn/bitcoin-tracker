<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { z } from 'zod';

const { $api } = useNuxtApp();
const toast = useToast();
const emit = defineEmits(['addressAdded']);

const schema = z.object({
  hash: z.string().trim().min(26)
});
const state = reactive({
  hash: undefined
});
type Schema = z.output<typeof schema>


const createAddress = async (event: FormSubmitEvent<Schema>) => {
  try {
    await $api('/addresses', {
      method: 'POST',
      body: {
        hash: event.data.hash
      }
    });
    toast.add({ title: 'Address has been added' });
    emit('addressAdded');
  } catch (e) {
    toast.add({ title: 'Error adding address', color: 'red' });
  }
};

</script>
<template>
  <UForm :state="state" :schema="schema" @submit="createAddress">
    <UFormGroup label="Address hash" name="hash">
      <UInput v-model="state.hash" placeholder="bc1qmujpmjvygvqa9tnhc5akyq4589aga3v6slajzx" />
    </UFormGroup>
    <UButton class="mt-4" type="submit">Add address</UButton>
  </UForm>
</template>
