<template>
  <div>
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">MAPA</div>
      </q-card-section>

      <q-card-section
        class="q-pt-none"
      >
       <q-img src="../assets//mapa.jpeg" />
       </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>
