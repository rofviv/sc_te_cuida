<template>
  <q-card style="min-width: 100%">
    <q-card-section>
      <q-list>
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>
              La orden ha sido recibida
              <q-icon name="done" />
            </q-item-label>
            <q-item-label>
              El conductor esta en camino
              <q-icon name="moped" />
            </q-item-label>
            <q-item-label>
              Tiempo de llegada 15 a 20 minutos
              <q-icon name="access_time" />
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div>
              <q-spinner-hourglass color="primary" size="2em" />
              <q-tooltip :offset="[0, 8]">QSpinnerHourglass</q-tooltip>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section>
      <h5 class="q-mt-none q-mb-md">Gracias por pedir!</h5>
    </q-card-section>
  </q-card>
</template>

<script>
export default {

}
</script>

<style>

</style>