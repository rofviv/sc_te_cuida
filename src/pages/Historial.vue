<template>
  <q-page class="q-pa-lg">
    <h5 class="q-mt-none q-mb-sm">Tus donaciones</h5>
    <p v-if="lstDonaciones.length == 0">Vacio.</p>
    <template v-else>
      <q-list class="bg-white">
        <div v-for="(order, index) in lstDonaciones" :key="order.id">
          <q-item v-ripple clickable>
            <q-item-section>
              <q-item-label>Donación a {{ order.beneficiario }}</q-item-label>
              <q-item-label>Orden ID {{ order.id_pedido }}</q-item-label>
              <q-item-label
                caption
              >{{ order.descripcion }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>
                <q-icon name="query_builder" />
                {{ moment(order.creado_en).add(2, 'hours').format('LLL') }}
              </q-item-label>
              <q-item-label caption>
                <q-icon name="moped" />
                Envío {{ order.precio_envio }} Bs.
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </div>
      </q-list>
    </template>
  </q-page>
</template>

<script>
import moment from "moment";
moment.locale("es");

export default {
  created() {
    this.cargarHistorialDonaciones();
  },
  data() {
    return {
      moment: moment,
      lstDonaciones: []
    };
  },
  methods: {
    async cargarHistorialDonaciones() {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=historial&id_donante=" +
        this.getUsuario.id;
      try {
        const res = await this.$axios.get(URI);
        console.log(res.data);
        this.lstDonaciones = res.data;
      } catch (error) {
        console.log(error);
      }
    }
  },
  computed: {
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    }
  }
};
</script>
