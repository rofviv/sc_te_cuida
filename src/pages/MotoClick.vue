<template>
  <q-page class="bg-grey-3 column">
    <q-dialog v-model="dialogOrder">
      <map-driver v-bind:orderDetails="orderView" v-on:cancelar="opcionesCancelar($event)" />
    </q-dialog>
    <q-dialog v-model="dialogPedidoConfirmado">
      <pedido-confirmado />
    </q-dialog>
    <!-- <q-dialog v-model="dialogCobertura" :persistent="idOrder ? true : false">
      <my-map-cobertura v-bind:idOrder="idOrder" />
    </q-dialog>-->
    <q-dialog v-model="dialogCobertura">
      <my-map-cobertura />
    </q-dialog>
    <q-dialog v-model="dialogInformacion">
      <informacion />
    </q-dialog>
    <q-dialog v-model="dialogFueraHorario">
      <fuera-horario v-bind:horarios="horaAtencion" />
    </q-dialog>
    <div class="column q-pa-xs" style="background-color: #17868b;">
      <q-btn-group class="col " flat spread>
        <q-btn color="primary" size="11px" @click="showCoberturaMapa" label="Cobertura y Tarifas" icon="pin_drop" />
        <q-btn color="primary" size="11px" @click="showInformacion" label="Información" icon="receipt_long" />
      </q-btn-group>
    </div>
    <q-dialog v-model="dialogCreditos" persistent>
      <q-card>
        <q-card-section class="text-center q-pb-none">
          <q-avatar icon="slow_motion_video" color="negative" text-color="white" />
          <div class="text-h6" v-if="tieneCreditos">Tienes {{ creditosActuales }} créditos.</div>
          <div class="text-h6" v-else>No tienes créditos</div>
        </q-card-section>
        <q-card-section class="row items-center text-justify q-px-md">
          <span class="q-ml-sm" v-if="tieneCreditos">
            <b>Consigue más créditos</b> antes que te quedes sin ellos
          </span>
          <span class="q-ml-sm" v-else>
            <b>Compra créditos</b> para solicitar el servicio.
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Más tarde" color="negative" v-close-popup />
          <q-btn
            flat
            label="Conseguir ahora"
            @click="conseguirCreditos"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogInstruccion" persistent>
      <q-card>
        <q-card-section class="text-center q-pb-none">
          <q-avatar icon="notifications_active" color="primary" text-color="white" />
          <div class="text-h6">Importante</div>
        </q-card-section>
        <q-card-section class="row items-center text-justify q-px-md">
          <span class="q-ml-sm">
            <b>No te olvides</b> de dar el
            <b>número</b> de tu cliente,
            <b>dirección</b> de referencia al conductor y confirmar el
            <b>costo del envío</b> antes de que salga de tu tienda.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Entendido" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-list class="bg-white" separator bordered>
      <div v-for="(order, index) in lstOrder" :key="order.id">
        <q-slide-item @left="eliminarItemLista(order.id, index)" left-color="deep-orange">
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
              <q-item-label>Orden ID {{ order.id }}</q-item-label>
              <q-item-label caption>{{ order.monto }}</q-item-label>
              <q-item-label caption>Toca para ver detalles</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>
                <q-icon name="query_builder" />
                {{ moment(order.creado_en).fromNow() }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-slide-item>
      </div>
    </q-list>
    <div
      v-show="lstOrder.length > 0"
      class="q-pl-md q-pt-xs text-caption"
    >Desliza a la derecha para enviar el pedido al historial</div>
    <div class="no-task row justify-center q-mt-lg q-pt-md">
      <div class="shadow-box shadow-3 flex-center cursor-pointer" @click="precioProducto">
        <!-- <div class="text-center q-pt-sm">
          <q-icon name="electric_moped" size="100px" color="primary" />
          <div class="text-h5 text-primary non-selectable">Moto Click</div>
        </div>-->
        <!-- <div class="row justify-center q-mt-lg q-pt-lg"> -->
          <q-img class="imgRedonda" :src="solicitoMoto ? require('../assets/boton-moto.gif') : require('../assets/boton.png')" />
        <!-- </div> -->
      </div>
    </div>
  </q-page>
</template>

<script>
import MyMapCobertura from "../components/MyMapCobertura";
import PedidoConfirmado from "../components/PedidoConfirmado";
import MapDriver from "../components/MapDriver";
import Informacion from "./Informacion";
import FueraHorario from "./FueraHorario";
import { QSpinnerRings } from "quasar";
import moment from "moment";
moment.locale("es");

// var moment_tz = require('moment-timezone');
// moment_tz().tz("America/La_Paz").format();

export default {
  components: {
    MyMapCobertura,
    MapDriver,
    PedidoConfirmado,
    Informacion,
    FueraHorario
  },
  created() {
    this.cargarPedidosVisibles();
  },
  data() {
    return {
      dialogFueraHorario: false,
      dialogPedidoConfirmado: false,
      dialogCobertura: false,
      dialogInformacion: false,
      solicitoMoto: false,
      moment: moment,
      dialogInstruccion: false,
      dialogCreditos: false,
      text: "",
      lstOrder: [],
      orderView: {},
      dialogOrder: false,
      idOrder: null,
      horaAtencion: [7, 22]
    };
  },
  methods: {
    async cargarPedidosVisibles() {
      const URI =
        "https://patioserviceonline.com/api/v1/?route=motoclick&type=pedidos&id_rest=" +
        this.getUsuario.id;
      try {
        const res = await this.$axios.get(URI);
        console.log(res.data);
        res.data.forEach(element => {
          this.lstOrder.push({
            id: element.id_pedido_jugno,
            monto: element.monto_texto,
            creado_en: element.creado_en
          });
        });
      } catch (error) {
        console.log(error);
      }
    },
    conseguirCreditos() {
      this.$router.push({ name: "creditos" });
    },
    showCoberturaMapa() {
      this.dialogCobertura = true;
    },
    showInformacion() {
      this.dialogInformacion = true;
    },
    verDetalleOrden(order) {
      // window.open("https://patioserviceonline.com/sc/#/map/order/" + order.id);
      this.orderView = order;
      this.dialogOrder = true;
    },
    deleteTask(index) {
      this.$q
        .dialog({
          title: "Confirmar",
          message: "Eliminar?",
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.lstOrder.splice(index, 1);
          this.$q.notify("Eliminado");
        });
    },
    precioProducto() {
      this.solicitoMoto = true;
      let hoyAux = new Date().toLocaleString("en-US", {
        timeZone: "America/La_Paz"
      });
      let hoy = new Date(hoyAux);
      if (
        hoy.getHours() >= this.horaAtencion[0] &&
        hoy.getHours() < this.horaAtencion[1]
      ) {
        if (this.tieneCreditos) {
          this.$q
            .dialog({
              title:
                '<div class="text-body2"><b>Tu Dirección:</b> ' +
                this.getUsuario.direccion +
                "</div>",
              message:
                "<b>¿Cuánto cuesta el producto que recogerá el repartidor?</b>",
              html: true,
              options: {
                type: "radio",
                model: "1 - 50 BOB",
                // inline: true
                items: [
                  { label: "1 - 50 BOB", value: "1 - 50 BOB" },
                  { label: "51 - 100 BOB", value: "51 - 100 BOB" },
                  { label: "101 - 150 BOB", value: "101 - 150 BOB" },
                  { label: "151 - 200 BOB", value: "151 - 200 BOB" },
                  { label: "201 - 300 BOB", value: "201 - 300 BOB" },
                  { label: "301 - 400 BOB", value: "301 - 400 BOB" }
                ]
              },
              ok: {
                color: "primary",
                label: "Solicitar",
                push: true
              },
              cancel: {
                label: "Cerrar",
                push: true,
                color: "negative"
              },
              persistent: true
            })
            .onOk(data => {
              this.solicitarMoto(data);
            }).onCancel(() => {
              this.solicitoMoto = false;
            })
        } else {
          this.dialogCreditos = true;
        }
      } else {
        this.dialogFueraHorario = true;
      }
    },
    async crearPedidoJugno(precio) {
      const URI = "https://prod-fatafat-new.jugnoo.in:4030/place_order";
      var auxDetails = "";
      if (this.getUsuario.nombre_rest) {
        auxDetails +=
          this.getUsuario.nombre_rest + " - " + this.getUsuario.celular;
      } else {
        auxDetails =
          this.getUsuario.nombre_cliente + " - " + this.getUsuario.celular;
      }

      const data = new URLSearchParams();

      data.append(
        "details",
        "*MOTO CLICK: " +
          auxDetails +
          " *Precio aprox: " +
          precio +
          " *Dirección, número y tarifa solicitala en el lugar de recogida"
      );
      data.append("from_address", this.getUsuario.direccion);
      data.append("from_latitude", this.getUsuario.lat);
      data.append("from_longitude", this.getUsuario.lng);
      data.append("payment_mode", "1");
      data.append(
        "to_address",
        "*MOTO CLICK: " +
          auxDetails +
          " *Precio aprox: " +
          precio +
          " No te olvides de exigir dirección, número y tarifa del cliente en el lugar de recogida"
      );
      data.append("to_latitude", this.getUsuario.lat);
      data.append("to_longitude", this.getUsuario.lng);
      data.append("is_immediate", "1");
      data.append("user_identifier", this.getUsuario.user_identifier);
      data.append("app_version", "436");
      data.append("device_type", "0");
      data.append("login_type", "0");
      data.append("operator_token", this.getUsuario.operator_token);
      data.append("customer_package_name", "com.movapps.mav.patioservice");
      data.append("locale", "es");
      data.append("access_token", this.getUsuario.access_token);
      try {
        const res = await this.$axios.post(URI, data);
        if (res.data.order_id) {
          return { id: res.data.order_id };
        } else {
          return { mensaje: res.data.message };
        }
      } catch (error) {
        console.log(error);
      }
    },
    async solicitarMoto(precio) {
      this.showLoading();
      this.dialogCobertura = true;
      const pedido_jugno = await this.crearPedidoJugno(precio);
      if (pedido_jugno.id) {
        const URI =
          "https://patioserviceonline.com/api/v1/?route=motoclick&type=pedido";
        let data = new FormData();
        data.append("id_rest", this.getUsuario.id);
        data.append("id_pedido_jugno", pedido_jugno.id);
        data.append("monto_texto", precio);
        try {
          const res = await this.$axios.post(URI, data);
          this.lstOrder.push({
            id: pedido_jugno.id,
            monto: precio
          });
          this.dialogCobertura = false;
          // this.idOrder = pedido_jugno.id;
          this.showNotif();
          this.dialogPedidoConfirmado = true;
          const timer = setTimeout(() => {
            // if (this.dialogCobertura) {
            this.dialogPedidoConfirmado = false;
            // this.idOrder = null;
            this.dialogInstruccion = true;
            // }
          }, 30 * 1000);
          if (this.getUsuario.credito_ilimitado == 0) {
            this.$store.commit("clientData/quitarCreditos", 5);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        alert(pedido_jugno.mensaje);
      }
      this.$q.loading.hide();
      this.solicitoMoto = false;
    },
    showLoading() {
      const spinner =
        typeof QSpinnerRings !== "undefined"
          ? QSpinnerRings
          : Quasar.components.QSpinnerRings;

      this.$q.loading.show({
        spinner,
        spinnerColor: "red",
        spinnerSize: 140,
        message:
          "<h5 class='q-mt-none'>Solicitando Moto Click.<br /> Espera un momento...</h5>",
        sanitize: false
      });
    },
    showNotif() {
      this.$q.notify({
        position: "top",
        message: "Su pedido ha sido recibido.",
        icon: "electric_moped",
        color: "teal",
        timeout: 6000
      });
    },
    async eliminarItemLista(id, index) {
      const URI =
        "https://patioserviceonline.com/api/v1/?route=motoclick&type=visible&id_pedido_jugno=" +
        id;
      try {
        const res = await this.$axios.post(URI);
        this.$q.notify({
          message: "Puedes volver a ver el pedido en el historial.",
          color: "primary",
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              }
            }
          ]
        });
        this.lstOrder.splice(index, 1);
      } catch (error) {
        console.log(error);
      }
    },
    opcionesCancelar(id) {
      this.$q
        .dialog({
          title: "Cancelar Orden",
          message: "<b>¿Cuál es el mótivo?</b>",
          html: true,
          options: {
            type: "radio",
            model: "Ya no necesito la moto",
            items: [
              {
                label: "Ya no necesito la moto",
                value: "Ya no necesito la moto"
              },
              { label: "Mucho demora la moto", value: "Mucho demora la moto" },
              {
                label: "La moto va hacia otra dirección ",
                value: "La moto va hacia otra direccion"
              },
              { label: "Se canceló mi pedido", value: "Se cancelo mi pedido" },
              { label: "Por error la solicite", value: "Por error la solicite" }
            ]
          },
          ok: {
            color: "negative",
            label: "Cancelar Orden",
            push: true
          },
          cancel: {
            label: "Volver",
            push: true,
            color: "primary"
          },
          persistent: true
        })
        .onOk(data => {
          this.cancelarPedido(id, data);
        });
    },
    async cancelarPedido(id, motivo) {
      this.$q.loading.show();
      const URI =
        "https://prod-fatafat-new.jugnoo.in:4030/panel/order_details?token=b3de8bde6886e4695cbf5f23fcc363fa&order_id=" +
        id;
      try {
        const res = await this.$axios.get(URI);
        if (res.data.order_details.dodo_delivery_id) {
          await this.cancelarOrderByDeliveryID(
            res.data.order_details.dodo_delivery_id
          );
          await this.actualizarEstadoPedido(id, motivo);
          this.dialogOrder = false;
          // this.dialogCobertura = false;
          // this.idOrder = null;
          this.$q.notify({
            position: "top",
            message: "Pedido cancelado.",
            icon: "cancel_schedule_send",
            color: "teal",
            timeout: 6000
          });
          location.reload();
        }
      } catch (error) {
        console.log(error);
      }
      this.$q.loading.hide();
    },
    async actualizarEstadoPedido(id, motivo) {
      const URI =
        "https://patioserviceonline.com/api/v1/?route=motoclick&type=cancelar&id_pedido_jugno=" +
        id;
      let data = "motivo=" + motivo;
      try {
        const res = await this.$axios.post(URI, data);
      } catch (error) {
        console.log(error);
      }
    },
    async cancelarOrderByDeliveryID(dodo_delivery_id) {
      const URI = "https://dodo.jugnoo.in:8024/update_order";
      const data = {
        key_type: 5,
        order_id: dodo_delivery_id,
        access_token: "5e26d40edd82f1035e8fe0d12e7304df"
      };
      try {
        const res = await this.$axios.post(URI, data);
      } catch (error) {
        console.log("CANCEL ERROR ", error);
      }
    }
  },
  computed: {
    tieneCreditos() {
      return this.$store.getters["clientData/getCreditos"] >= 5;
    },
    creditosActuales() {
      if (this.$store.getters["clientData/getCreditos"] <= 15) {
        this.dialogCreditos = true;
      }
      return this.$store.getters["clientData/getCreditos"];
    },
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    }
  }
};
</script>

<style lang="scss">
.done {
  .q-item__label {
    text-decoration: line-through;
    color: #bbb;
  }
}

// .no-task {
//   opacity: 0.5;
// }

// .circle-moto {
//   background-color: white;
//   border-radius: 200px 200px 200px 200px;
//   -moz-border-radius: 200px 200px 200px 200px;
//   -webkit-border-radius: 200px 200px 200px 200px;
//   border: 0px solid #000000;
// }
.imgRedonda {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 1px solid #222;
}

.shadow-box {
  width: 170px;
  height: 170px;
  background-color: white;
  // margin: 50px;
  border-radius: 50%;
}
.shadow-box:hover {
  background-color: orange;
}

.shadow-box:active {
  background-color: $secondary;
}
</style>