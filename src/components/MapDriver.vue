<template>
  <div>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="q-pt-none">
          <b>Orden ID:</b>
          {{ orderDetails.id_pedido }}
        </div>
        <div v-if="driver_name">
          <b>Conductor:</b>
          {{ driver_name }} {{ driver_phone }}
        </div>
      </q-card-section>
      <div class="content-dialog">
        <div class="map-container">
          <l-map
            ref="myMap"
            style="z-index:0"
            :zoom="zoom"
            :center="center"
            :options="{zoomControl: false}"
          >
            <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

            <l-marker :lat-lng="center_origen" :icon="markerUser"></l-marker>
            <l-marker :lat-lng="center_destino" :icon="markerLocal"></l-marker>
            <template v-if="showDriver">
              <l-marker :lat-lng="center" :icon="markerDriver"></l-marker>
            </template>
          </l-map>
        </div>
      </div>
      <!-- <q-card-actions
        v-if="driver_name == null && status != 1 && status != 2"
        align="center"
        class="text-negative"
      >
        <q-btn flat label="Cancelar solicitud" @click="cancelarSolicitud" />
      </q-card-actions> -->
    </q-card>
  </div>
</template>
<script>
import moment from "moment";
import { LMap, LTileLayer, LMarker, LIcon } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
// import { LocalStorage } from "quasar";

var markerUserAux = L.AwesomeMarkers.icon({
  icon: "user",
  prefix: "fa",
  markerColor: "red",
});

var markerLocalAux = L.AwesomeMarkers.icon({
  icon: "hand-holding-medical",
  prefix: "fa",
  markerColor: "green",
});

var markerDriverAux = L.AwesomeMarkers.icon({
  icon: "motorcycle",
  prefix: "fa",
  markerColor: "cadetblue",
});


export default {
  props: ["orderDetails"],
  components: { LMap, LTileLayer, LMarker, LIcon },
  mounted() {
    this.cargarCiudad();
    this.markerUser = markerUserAux;
    this.markerLocal = markerLocalAux;
    this.markerDriver = markerDriverAux;
  },
  destroyed() {
    clearTimeout(this.refresh_handler);
    this.refresh_handler = null;
  },
  data() {
    return {
      markerUser: null,
      markerLocal: null,
      markerDriver: null,
      // orderMsg: {
      //   color: "bg-primary",
      //   icon: "search",
      //   order: "Confirmando",
      //   details: "Asignando orden",
      //   driver_name: ""
      // },

      status: 7,
      // orderFailed: false,
      showDriver: false,
      order_id: "",
      // details: "",
      driver_id: null,
      driver_name: null,
      driver_phone: "",
      dodo_delivery_id: null,

      zoom: 14,
      url: "https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      center: [0, 0],
      center_origen: [0, 0],
      center_destino: [0, 0],

      // icon_origen: L.icon({
      //   iconUrl:
      //     "http://patioserviceonline.com/sc" + "/statics/marker-origen.png",
      //   iconSize: [64, 64],
      //   iconAnchor: [24, 64]
      // }),

      // icon_destino: L.icon({
      //   iconUrl:
      //     "http://patioserviceonline.com/sc" + "/statics/marker-destino.png",
      //   iconSize: [64, 64],
      //   iconAnchor: [34, 64]
      // }),

      // icon_driver: L.icon({
      //   iconUrl:
      //     "http://patioserviceonline.com/sc" + "/statics/marker-driver.png",
      //   iconSize: [64, 64],
      //   iconAnchor: [30, 64]
      // }),

      access_token:
        "36a993750ffd0e47db62b0036dc13ed722965726976aafdb676af5d0b91e892d",
      operator_token: "ca3686de8b9cd13abcb362e09e494210",

      refresh_handler: null,
      time_refresh: 15,

      reload: false,
      loadCancel: false
    };
  },
  methods: {
    cancelarSolicitud() {
      this.$emit("cancelar", this.orderDetails.id_pedido);
    },
    cargarCiudad() {
      // this.center = LocalStorage.getItem("center") || [-17.783384, -63.18203];
      this.order_id = this.orderDetails.id_pedido;
      this.center = [this.getUsuario.lat, this.getUsuario.lng];
      this.center_origen = [this.getUsuario.lat, this.getUsuario.lng];
      this.monitoringOrderDelivery();
    },
    checkParams() {
      // var id = this.$route.params.order_id;
      // if (id) {
      //   this.order_id = id;
      //   this.monitoringOrderDelivery();
      // }
    },
    async cancelOrder() {
      this.loadCancel = true;
      const res = confirm("¿Esta seguro de cancelar esta orden?");
      if (res) {
        const URI = "https://dodo.jugnoo.in:8024/update_order";
        const data = {
          key_type: 5,
          order_id: this.dodo_delivery_id,
          access_token: "5e26d40edd82f1035e8fe0d12e7304df"
        };
        try {
          const res = await this.$axios.post(URI, data);
          console.log("CANCELANDO ", res);
          alert("ORDEN CANCELADA");
        } catch (error) {
          console.log("CANCEL ERROR ", error);
        }
      }
      this.loadCancel = false;
    },
    async monitoringOrderDelivery() {
      // const time = Date.now();
      // const date = moment().format("YYYY-MM-DD");
      // const URI =
      //   "https://prod-fatafat-new.jugnoo.in:4030/panel/view_orders?token=5e26d40edd82f1035e8fe0d12e7304df&secret=P7JlZXiRiIvSssQSSzqs&city_id=395&start_date=" +
      //   date +
      //   "&end_date=" +
      //   date +
      //   "&fetch_active_orders=1&order_id=" +
      //   this.order_id +
      //   "&sEcho=1&iColumns=12&sColumns=%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=25&mDataProp_0=&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=true&mDataProp_1=&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=false&mDataProp_2=&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=false&mDataProp_3=&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=false&mDataProp_4=&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=false&mDataProp_5=&sSearch_5=&bRegex_5=false&bSearchable_5=true&bSortable_5=false&mDataProp_6=&sSearch_6=&bRegex_6=false&bSearchable_6=true&bSortable_6=false&mDataProp_7=&sSearch_7=&bRegex_7=false&bSearchable_7=true&bSortable_7=false&mDataProp_8=&sSearch_8=&bRegex_8=false&bSearchable_8=true&bSortable_8=false&mDataProp_9=&sSearch_9=&bRegex_9=false&bSearchable_9=true&bSortable_9=false&mDataProp_10=&sSearch_10=&bRegex_10=false&bSearchable_10=true&bSortable_10=false&mDataProp_11=&sSearch_11=&bRegex_11=false&bSearchable_11=true&bSortable_11=false&sSearch=&bRegex=false&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&_=" +
      //   time;
      const URI =
        "https://prod-fatafat-new.jugnoo.in:4030/panel/order_details?token=b3de8bde6886e4695cbf5f23fcc363fa&order_id=" +
        this.order_id;

      try {
        const res = await this.$axios.get(URI);
        const orden = res.data.order_details;
        console.log(orden);
        if (orden) {
          if (!this.reload) {
            // this.details = res.data.aaData[0].details;
            this.center_origen = [orden.from_latitude, orden.from_longitude];
            this.center_destino = [
              orden.to_latitude,
              orden.to_longitude
            ];
          }
          this.dodo_delivery_id = orden.dodo_delivery_id;
          this.driver_id = orden.driver_id;
          this.status = orden.status; // 1 cancelado, 2 completado, 6 confirmada, 7 despachada
          if (this.status == 1) {
            alert(
              "Esta orden se ha cancelado. Si desconoces el motivo comunícate con soporte"
            );
          } else if (this.status == 2) {
            alert(
              "Esta orden se ha completado. Si crees que esto es un error comunícate con soporte"
            );
          }
          if (this.driver_id) {
            this.getCoordsDriver(orden.city_id);
            this.driver_name = orden.driver_name;
          }
        }

        // if (res.data.aaData.length > 0) {
        //   if (!this.reload) {
        //     this.details = res.data.aaData[0].details;
        //     this.center_origen = [
        //       res.data.aaData[0].pickup_latitude,
        //       res.data.aaData[0].pickup_longitude
        //     ];
        //     this.center_destino = [
        //       res.data.aaData[0].to_latitude,
        //       res.data.aaData[0].to_longitude
        //     ];
        //   }
        //   this.dodo_delivery_id = res.data.aaData[0].dodo_delivery_id;
        //   this.driver_id = res.data.aaData[0].driver_id;
        //   this.status = res.data.aaData[0].dodo_delivery_status;
        //   if (this.driver_id) {
        //     this.getCoordsDriver();
        //     this.driver_name = res.data.aaData[0].driver_name;
        //     this.updateMsg(
        //       "bg-green",
        //       "done",
        //       "Orden " + this.order_id,
        //       this.details,
        //       this.driver_name
        //     );
        //   }
        // } else {
        //   this.orderFailed = true;
        //   this.status = 10;
        //   console.log("No se encuentra la Orden " + this.order_id);
        //   this.driver_phone = "";
        //   this.updateMsg("bg-green", "home", "Orden entregada", "", "");
        //   clearTimeout(this.refresh_handler);
        //   this.refresh_handler = null;
        // }
      } catch (error) {
        console.log(error);
      }
      this.reset_timer();
    },
    reset_timer() {
      clearTimeout(this.refresh_handler);
      this.refresh_handler = setTimeout(() => {
        this.reload = true;
        this.monitoringOrderDelivery();
        console.log("Refresh DRIVER...");
      }, this.time_refresh * 1000);
    },
    async getCoordsDriver(city_id) {
      const URI =
        "https://api-panels.jugnoo.in:8020/get_driver_details?token=5e26d40edd82f1035e8fe0d12e7304df&city_id=" +
        city_id +
        "&status=1&delivery_enabled=1&is_delivery_panel=1";
      try {
        const res = await this.$axios.get(URI);
        if (res.data.data.length > 0) {
          const array = res.data.data;
          const index = array.findIndex(
            driver => driver.driver_id == this.driver_id
          );
          if (index >= 0) {
            this.center = [
              array[index].current_latitude,
              array[index].current_longitude
            ];
            this.zoom = 15;
            this.showDriver = true;
            this.driver_phone = array[index].phone_no;
            // this.updateStatus();
          } else {
            // this.status = 10;
            // this.orderFailed = true;
            // console.log("NO SE ENCONTRO LA MOTO");
            // this.updateMsg("bg-green", "home", "Orden entregada", "", "");
            // clearTimeout(this.refresh_handler);
            // this.refresh_handler = null;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    // updateMsg(color, icon, order, details, driver_name) {
    //   this.orderMsg = {
    //     color: color,
    //     icon: icon,
    //     order: order,
    //     details: details,
    //     driver_name: driver_name
    //   };
    // }
    // async updateStatus() {
    //   const time = Date.now();
    //   const date = moment().format("YYYY-MM-DD");
    //   const URI = "https://prod-fatafat-new.jugnoo.in:4030/panel/view_orders?token=b3de8bde6886e4695cbf5f23fcc363fa&secret=P7JlZXiRiIvSssQSSzqs&city_id=395&start_date=" + date + "&end_date=" + date + "&fetch_active_orders=1&order_id=" + this.order_id +"&sEcho=1&iColumns=12&sColumns=%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=25&mDataProp_0=&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=true&mDataProp_1=&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=false&mDataProp_2=&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=false&mDataProp_3=&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=false&mDataProp_4=&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=false&mDataProp_5=&sSearch_5=&bRegex_5=false&bSearchable_5=true&bSortable_5=false&mDataProp_6=&sSearch_6=&bRegex_6=false&bSearchable_6=true&bSortable_6=false&mDataProp_7=&sSearch_7=&bRegex_7=false&bSearchable_7=true&bSortable_7=false&mDataProp_8=&sSearch_8=&bRegex_8=false&bSearchable_8=true&bSortable_8=false&mDataProp_9=&sSearch_9=&bRegex_9=false&bSearchable_9=true&bSortable_9=false&mDataProp_10=&sSearch_10=&bRegex_10=false&bSearchable_10=true&bSortable_10=false&mDataProp_11=&sSearch_11=&bRegex_11=false&bSearchable_11=true&bSortable_11=false&sSearch=&bRegex=false&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&_=" + time;

    //   try {
    //     const res = await this.$axios.get(URI);
    //     if (res.data.aaData.length > 0) {
    //       this.status = res.data.aaData[0].dodo_delivery_status;
    //     } else {
    //       this.status = 10;
    //       this.orderFailed = true;
    //       console.log("No se encuentra la Orden " + this.order_id);
    //     }
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }
  },
  computed: {
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    }
  }
};
</script>

<style lang="scss">
.content-dialog {
  color: white;
  width: 100%;
  height: 400px;
}
.map-container {
  position: relative;
  width: 100%;
  height: 400px;
}
.map-marker-centered {
  width: 50px;
  height: 60px;
  position: absolute;
  z-index: 99;
  left: calc(50% - 25px);
  top: calc(50% - 90px);
  transition: all 0.4s ease;
}
</style>