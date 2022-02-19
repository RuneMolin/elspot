<template>
  <Elspot />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Elspot from "./components/Elspot.vue";
import { usePriceStore } from "@/stores/prices";

export default defineComponent({
  name: "App",
  components: {
    Elspot,
  },
  setup() {
    const store = usePriceStore();

    store.updatePrices();
  },
});
</script>
