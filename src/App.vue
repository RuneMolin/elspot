<template>
  <ElSpot />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ElSpot from '@/components/Elspot.vue'
import { usePriceStore } from '@/stores/prices'

export default defineComponent({
  name: 'App',
  components: {
    ElSpot
  },
  setup () {
    const store = usePriceStore()

    store.updatePrices()
  }
})
</script>
