<script setup lang="ts">
const props = defineProps(['addresses'])
const columns = [{
  key: 'hash',
  label: 'Hash',

}, {
  key: 'createdAt',
  label: 'Created at'
}]

</script>

<template>
<UTable :rows="props.addresses" :columns="columns"/>
</template>