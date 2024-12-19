<template>
  <div>
    <q-card>
      <q-card-section class="text-center q-pb-none">
        <q-avatar icon="alarm_off" color="warning" text-color="white" />
        <div class="text-h6">Fuera de horario</div>
      </q-card-section>
      <q-card-section class="row items-center text-justify q-px-md">
        <span class="q-ml-sm">
          El horario disponible es desde las <b>{{ horarios[0] }}</b> hasta las <b>{{ horarios[1] }}</b> horas.
          
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Entendido" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  props: [ 'horarios' ]
};
</script>
