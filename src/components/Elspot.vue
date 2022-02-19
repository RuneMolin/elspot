<template>
  <div class="container is-fullhd mt-1" v-if="store.current">
    <section class="hero is-info">
      <div class="hero-body">
        <p class="subtitle">Prisen for en kWh lige nu:</p>
        <p class="title">{{ store.current }} øre</p>
      </div>
    </section>
    <section class="section is-medium">
      <h1 class="title">De næste 24 timer: {{ store.lowest.price }} øre</h1>
      <h2 class="subtitle mt-2">
        kl. {{ store.lowest.start }} - {{ store.lowest.end }} i
        {{ store.lowest.day }}
      </h2>
    </section>
    <p>{{ store.lastUpdated }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePriceStore } from "@/stores/prices";

export default defineComponent({
  name: "Elspot",
  setup() {
    const store = usePriceStore();

    return {
      store,
    };
  },
});
</script>
