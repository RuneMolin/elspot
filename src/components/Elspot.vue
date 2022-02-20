<template>
  <div class="container">
    <section class="hero is-info" v-if="store.current">
      <div class="hero-body">
        <p class="subtitle has-text-centered">Prisen lige nu</p>
        <p class="title has-text-centered">{{ store.current }} øre/kWH</p>
      </div>
    </section>
    <div class="box">
      <p class="is-size-5 has-text-centered">Priser de næste 24 timer</p>
      <table class="table is-striped is-fullwidth">
        <thead>
          <th>Tidspunkt</th>
          <th>Øre/kWH</th>
        </thead>
        <tbody>
          <tr v-for="price in store.summaryTable" :key="price.time">
            <td>{{ price.time }}</td>
            <td>{{ price.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
