<template>
  <q-page class="q-pa-lg">
    <h5 class="q-mt-none q-mb-md">Compra Créditos</h5>
    <div class="row wrap">
      <div class="col-6" v-for="paquete in paquetes" :key="paquete.creditos">
        <q-card class="q-mb-md q-mx-sm" bordered flat>
          <q-card-section class="q-pa-xs text-center">
            <q-chip square>
              <q-avatar color="orange" text-color="white">{{ paquete.creditos }}</q-avatar>Créditos
            </q-chip>
          </q-card-section>

          <q-separator />

          <q-card-actions vertical>
            <q-btn color="secondary" :label="`${paquete.monto} BOB`" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      paquetes: [
        { creditos: 25, monto: 25 },
        { creditos: 50, monto: 50 },
        { creditos: 75, monto: 75 },
        { creditos: 120, monto: 100 },
        { creditos: 180, monto: 150 }
      ]
    };
  }
};
</script>
