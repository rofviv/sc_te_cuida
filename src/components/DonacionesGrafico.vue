<template>
  <q-card style="width:100%">
    <p class="q-ma-md">{{ titulo }}</p>
    <!-- <barras-moto-click v-if="loaded" :chartdata="chartdata" :options="options" /> -->
    <q-expansion-item
      v-for="fecha in datosFechas"
      :key="fecha.fecha"
      group="somegroup"
      expand-separator
      :label="moment(fecha.fecha).format('dddd DD MMMM')"
      :caption="`Donaciones: ${fecha.cant}`"
      @show="getDonadores(fecha.fecha)"
      @hide="stopCounting"
    >
      <q-card>
        <q-card-section>
          <div v-if="loadDonadores" class="text-center">
            <q-circular-progress indeterminate size="xs" class="q-ma-md" />
          </div>
          <q-list v-else class="bg-white">
            <div v-for="(order, index) in lstDonaciones" :key="order.id">
              <q-item>
                <q-item-section>
                  <q-item-label>Donador: {{ order.nombre }}</q-item-label>
                  <q-item-label caption>{{ order.descripcion }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>
                    <q-btn flat size="sm" icon="fas fa-camera" @click="verFoto(order.foto_url)" />
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
            </div>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-card>
</template>

<script>
// import BarrasMotoClick from "./BarrasMotoClick";
import moment from "moment";
moment.locale("es");

export default {
  props: ["beneficiario"],
  // components: { BarrasMotoClick },
  mounted() {
    this.verDetalles();
  },
  data() {
    return {
      moment: moment,
      counter: 0,
      titulo: "Cargando...",
      datosFechas: [],
      lstDonaciones: [],
      loadDonadores: false,
      // loaded: false,
      // chartdata: null,
      // labelsGrafico: [],
      // datosGrafico: [],
      // datosGraficoCancelados: [],
      // options: {
      //   responsive: true,
      //   maintainAspectRatio: false
      // }
    };
  },
  methods: {
    verFoto(img) {
      window.open("https://boliviadona.com/uploads/" + img);
    },
    async verDetalles() {
      this.titulo = "Cargando...";
      // console.log(this.beneficiario);
      // this.dialogDetalles = true;
      let URI =
        "https://boliviadona.com/api/controllers/scController.php?type=donaciones_beneficiario&id=" +
        this.beneficiario.id +
        "&intervalo=30";
      try {
        let res = await this.$axios.get(URI);
        if (res.data.length == 0) {
          this.titulo = "No hay donaciones";
          return;
        }
        this.titulo = "Selecciona una fecha para ver detalles";
        // await this.agruparDatos(res.data);
        this.datosFechas = res.data;
        // console.log(res.data);
      } catch (error) {
        console.log("detalles", error);
      }
    },
    async getDonadores(fecha) {
      this.loadDonadores = true;
      let URI =
        "https://boliviadona.com/api/controllers/scController.php?type=donaciones_beneficiario_fecha&id=" +
        this.beneficiario.id +
        "&fecha=" +
        fecha;
      try {
        let res = await this.$axios.get(URI);
        // console.log(res.data);
        this.lstDonaciones = res.data;
        // await this.agruparDatos(res.data);
        // this.datosFechas = res.data;
        // console.log(res.data);
      } catch (error) {
        console.log("detalles", error);
      }
      this.loadDonadores = false;
    },

    stopCounting() {
      this.lstDonaciones = [];
    },
    // async verDetalles() {
    //   this.titulo = 'Cargando...';
    //   console.log(this.beneficiario);
    //   this.loaded = false;
    //   // this.dialogDetalles = true;
    //   let URI =
    //     "https://boliviadona.com/api/controllers/scController.php?type=donaciones_beneficiario&id=" + this.beneficiario.id + "&intervalo=30";
    //   try {
    //     let res = await this.$axios.get(URI);
    //     if (res.data.length == 0) {
    //       this.titulo = 'No hay donaciones';
    //       // alert("No ha realizado ni un pedido");
    //       // this.dialogDetalles = false;
    //       return;
    //     }
    //     this.titulo = '';
    //     await this.agruparDatos(res.data);
    //     this.chartdata = {
    //       labels: this.labelsGrafico,
    //       datasets: [
    //         {
    //           label: "Pedidos Completados",
    //           data: this.datosGrafico,
    //           backgroundColor: "#2caab1",
    //           borderColor: "#2caab1",
    //           fill: false
    //         },
    //       ]
    //     };
    //     this.loaded = true;
    //   } catch (error) {
    //     console.log("detalles", error);
    //   }
    // },
    // agruparDatos(datos) {
    //   this.labelsGrafico = [];
    //   this.datosGrafico = [];
    //   // this.datosGraficoCancelados = [];
    //   datos.forEach(element => {
    //     this.labelsGrafico.push(moment(element.fecha).format("dddd DD MMMM"));
    //     this.datosGrafico.push(element.cant);
    //     // this.datosGraficoCancelados.push(element.cancelados);
    //   });
    // }
  },
};
</script>

<style>
</style>