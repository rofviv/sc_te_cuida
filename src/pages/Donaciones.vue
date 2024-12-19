<template>
  <q-page class="bg-grey-3 q-pa-lg">
    <q-dialog v-model="dialogOrder">
      <map-driver v-bind:orderDetails="orderView" />
    </q-dialog>
    <q-dialog
      v-model="dialogDonar"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <donar-form
        v-bind:beneficiario="beneficiario"
        v-on:adicionarDelivery="adicionarDelivery"
        v-on:mostrarInformacion="viewInformacion"
      />
    </q-dialog>
    <q-dialog v-model="dialogInformacion">
      <informacion v-bind:informacion="infoBeneficiario" />
    </q-dialog>
    <q-dialog v-model="dialogGrafico">
      <donaciones-grafico v-bind:beneficiario="beneficiario" />
    </q-dialog>
    <div class="q-gutter-xs">
      <q-card v-show="lstDonaciones.length > 0">
        <q-card-section>
          <q-scroll-area class style="height: 200px">
            <q-list class="bg-white">
              <div v-for="(order, index) in lstDonaciones" :key="order.id">
                <q-slide-item
                  @left="eliminarItemLista(order.id_pedido, index)"
                  left-color="deep-orange"
                >
                  <template v-slot:left>
                    <div class="row items-center">
                      <q-icon left name="send" />Enviar al historial
                    </div>
                  </template>
                  <q-item
                    v-ripple
                    @click="verDetalleOrden(order)"
                    clickable
                    :class="{ 'done bg-blue-1' : order.done }"
                  >
                    <q-item-section>
                      <q-item-label>Donación a {{ order.beneficiario }}</q-item-label>
                      <q-item-label>Orden ID {{ order.id_pedido }}</q-item-label>
                      <q-item-label caption lines="1">{{ order.descripcion }}</q-item-label>
                      <q-item-label caption>Toca para ver detalles</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption>
                        <q-icon name="query_builder" />
                        {{ moment(order.creado_en).add(2, 'hours').fromNow() }}
                      </q-item-label>
                      <q-item-label caption>
                        <q-icon name="moped" />
                        Envío {{ order.precio_envio }} Bs.
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                </q-slide-item>
              </div>
            </q-list>
            <div
              v-show="lstDonaciones.length > 0"
              class="q-pl-md q-pt-md text-caption text-grey"
            >Desliza a la derecha para enviar al historial de donaciones</div>
          </q-scroll-area>
        </q-card-section>
      </q-card>

      <div v-if="cargandoListaBeneficiarios">
        <q-card class="my-card" flat bordered style="max-width: 500px">
          <q-item>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" class="text-subtitle1" />
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-skeleton
                type="QAvatar"
                animation="fade"
                style="top: 0; right: 12px; transform: translateY(-50%);"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" width="80%" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="50%" class="text-subtitle2" animation="fade" />
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section class="q-pl-sm">
              <!-- <q-skeleton height="150px" class="q-mb-sm" /> -->

              <div class="row items-center justify-between no-wrap">
                <div class="row items-left">
                  <!-- <q-icon name="chat_bubble_outline" color="grey-4" class="q-mr-sm" size="18px" /> -->
                  <q-skeleton type="text" width="30px" />
                </div>

                <div class="row items-left">
                  <!-- <q-icon name="repeat" color="grey-4" class="q-mr-sm" size="18px" /> -->
                  <q-skeleton type="text" width="30px" />
                </div>

                <div class="row items-left">
                  <!-- <q-icon name="favorite_border" color="grey-4" class="q-mr-sm" size="18px" /> -->
                  <q-skeleton type="text" width="30px" />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
      <div v-else>
        <div v-if="lstInstituciones.length > 0">
          <div>
            <p
              class="titulo text-h6 text-weight-regular q-mb-none"
            >
            <q-icon name="fas fa-th"></q-icon>
            BENEFICIARIOS <i><span class="relleno">Rango de 8 km</span> {{ getUsuario.ciudad }}</i></p>
          </div>
          <div class="text-center">
            <div class="box-contador shadow-up-1 q-my-sm" v-for="(n, index) in 4" :key="n">
              <span>{{ totalDonaciones[4 - n] || 0}}</span>
            </div>
            <div class="text-grey text-caption">
              Donaciones
            </div>
          </div>
          <div class="row align-center">
            <div
              class="col-12 col-sm-6 q-pa-xs"
              v-for="ins in lstInstituciones"
              :key="ins.id"
            >
              <q-card flat class="my-card q-mt-lg">
                <!-- <q-img src="https://cdn.quasar.dev/img/chicken-salad.jpg" /> -->
                <q-card-section>
                  <q-btn
                    @click="abrirUbicacion(ins)"
                    fab
                    color="primary"
                    icon="place"
                    class="absolute"
                    style="top: 0; right: 12px; transform: translateY(-50%);"
                  />

                  <div class="row no-wrap items-center">
                    <q-icon name="fas fa-th" class="q-pr-sm"></q-icon> 
                    <div class="col text-h6 ellipsis">{{ ins.beneficiario }}</div>
                    <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
                      <q-icon name="place" />
                      {{ parseInt(ins.distancia) > 0 ? parseInt(ins.distancia) : 'Menos de 1' }} KM
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <div class="text-subtitle1">{{ ins.encargado }} - {{ ins.celular }}</div>
                  <div class="text-caption text-grey">{{ ins.direccion }}</div>
                  <div
                    class="text-caption text-grey"
                  >Publicado {{ moment(ins.creado_en).fromNow() }}</div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right" class="acciones-boton q-py-none">
                  <q-btn flat color="white" size="lg" @click="donarA(ins)">
                    <q-avatar size="42px">
                      <q-img class="iconos" src="../assets/iconos/donar.png" />
                    </q-avatar>
                    Donar
                  </q-btn>
                  <q-btn
                    flat
                     size="lg"
                    color="white"
                    @click="graficosBeneficiario(ins)"
                  >
                    <q-avatar size="42px">
                      <q-img class="iconos" src="../assets/iconos/tus-donaciones.png" />
                    </q-avatar>
                    Donaciones
                  </q-btn>

                  <!-- <q-btn
                    flat
                    color="secondary"
                    icon="info"
                    @click="viewInformacion(ins.informacion)"
                  /> -->
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
        <div v-else>
          <q-banner dense class="bg-primary" dark>
            <template v-slot:avatar>
              <q-icon name="fa fa-search-location" />
            </template>
            No hay beneficiarios en el rango de 8 KM
            <template
              v-slot:action
            >
              <q-btn flat color="secondary" to="/mapa" label="Ver mapa de beneficiarios" />
            </template>
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import DonarForm from "../components/DonarForm.vue";
import DonacionesGrafico from "../components/DonacionesGrafico.vue";
import MapDriver from "../components/MapDriver"; 
import Informacion from "./Informacion";
import moment from "moment";
moment.locale("es");

export default {
  components: {
    DonarForm,
    MapDriver,
    Informacion,
    DonacionesGrafico,
  },
  mounted() {
    this.cargarInstituciones();
    this.cargarDonaciones();
    this.cargarTotalDonaciones();    
  },
  data() {
    return {
      cargandoListaBeneficiarios: true,
      lstDonaciones: [],
      moment: moment,
      dialogDonar: false,
      dialogInformacion: false,
      dialogGrafico: false,
      lstInstituciones: [],
      beneficiario: {},
      infoBeneficiario: null,
      totalDonaciones: 0,
      dialogOrder: false,
      orderView: {},
    };
  },
  methods: {
    async cargarTotalDonaciones() {
      const URI = "https://boliviadona.com/api/controllers/scController.php?type=total_donacion";
      try {
        const res = await this.$axios.get(URI);
        this.totalDonaciones = Array.from(res.data[0].cant).reverse();
      } catch (error) {
        console.log(error);
      }
    },
    async cargarInstituciones() {
      this.cargandoListaBeneficiarios = true;
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=instituciones&ciudad=" +
        this.getUsuario.ciudad +
        "&lat=" +
        this.getUsuario.lat +
        "&lng=" +
        this.getUsuario.lng;
      try {
        const res = await this.$axios.get(URI);
        // console.log(res.data);
        this.lstInstituciones = res.data;
      } catch (error) {
        console.log(error);
      }
      this.cargandoListaBeneficiarios = false;
    },
    async cargarDonaciones() {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=donaciones_visibles&id=" +
        this.getUsuario.id;
      try {
        const res = await this.$axios.get(URI);
        // console.log(res.data);
        this.lstDonaciones = res.data;
      } catch (error) {
        console.log(error);
      }
    },
    adicionarDelivery(donacion) {
      // console.log(donacion);
      this.lstDonaciones.push(donacion);
      this.dialogDonar = false;
    },
    viewInformacion(info) {
      this.infoBeneficiario = info;
      this.dialogInformacion = true;
    },
    donarA(ins) {
      this.beneficiario = ins;
      this.dialogDonar = true;
      // console.log(ins);
    },
    graficosBeneficiario(ins) {
      this.beneficiario = ins;
      this.dialogGrafico = true;
    },
    abrirUbicacion(ins) {
      window.open(
        "https://maps.google.com/maps?q=" +
          ins.lat +
          "%2C" +
          ins.lng +
          "&z=17&hl=es"
      );
    },
    verDetalleOrden(order) {
      // window.open("https://patioserviceonline.com/sc/#/map/order/" + order.id);
      this.orderView = order;
      this.dialogOrder = true;
      // alert("Orden " + order.id_pedido);
    },
    async eliminarItemLista(id, index) {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=visible&id_pedido_jugno=" +
        id;
      try {
        const res = await this.$axios.post(URI);
        // console.log(res.data);
        this.$q.notify({
          message:
            "Puedes volver a ver el pedido en el historial de donaciones.",
          color: "primary",
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        this.lstDonaciones.splice(index, 1);
      } catch (error) {
        console.log(error);
      }
    },
  },
  computed: {
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    },
  },
};
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 400px;
  border-radius: 0px 50px;
  background: $tertiary;
}
.relleno {
  padding: 4px 8px;
  margin: 4px;
  background: $tertiary;
}
.acciones-boton {
  background: $primary;
}
.iconos {
  width: 100%;
  max-width: 32px;
  //  align-items: end;
}
.titulo {
  color: $primary;
}

.box-contador {
  width: 30px;
  height: 30px;
  border-radius: 20%;
  font-size: 18px;
  background: $primary;
  color: white;
  margin-left: 2px;
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
  padding-top: 4px;
}
</style>
