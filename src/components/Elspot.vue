<template>
  <div class="container">
    <section class="hero is-info" v-if="store.current">
      <div class="hero-body">
        <p class="subtitle has-text-centered">Prisen lige nu</p>
        <p class="title has-text-centered">{{ store.current }} øre/kWH</p>
        <div class="columns">
          <div class="column">
            <label class="radio">
              <input
                type="radio"
                name="zone"
                :checked="!store.isWestZone"
                @change="store.setZone('DK2')"
              />
              Øst for Storebælt
            </label>
          </div>
          <div class="column">
            <label class="radio">
              <input
                type="radio"
                name="zone"
                :checked="store.isWestZone"
                @change="store.setZone('DK1')"
              />
              Vest for Storebælt
            </label>
          </div>
        </div>
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
import { defineComponent } from 'vue'
import { usePriceStore } from '@/stores/prices'

export default defineComponent({
  name: 'ElSpot',
  setup() {
    const store = usePriceStore()

    return {
      store
    }
  }
})
</script>
