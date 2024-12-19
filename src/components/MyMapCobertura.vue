<template>
  <q-card style="min-width: 100%">
    <!-- <q-card-section v-if="idOrder">
      <q-list>
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>
              La orden
              <b>{{ idOrder }}</b> ha sido recibida
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
    <q-card-section v-else>
      <div class="q-gutter-xs">
        <q-badge class="q-pa-md" v-for="tarifa in tarifas" :key="tarifa.precio" :color="tarifa.color">
          {{ tarifa.precio }} BOB
        </q-badge>
      </div>
    </q-card-section> -->
    <q-card-section>
      <div class="q-gutter-xs">
        <q-badge class="q-pa-md" v-for="tarifa in tarifas" :key="tarifa.precio" :color="tarifa.color">
          {{ tarifa.precio }} BOB
        </q-badge>
      </div>
    </q-card-section>
    <div class="content-dialog">
      <div class="map-container">
        <l-map
          ref="myMap"
          style="z-index: 0; position: relative; height: 100%; width: 100% "
          :zoom="zoom"
          :center="center"
        >
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-marker :lat-lng="center"></l-marker>
          <l-circle
            v-for="tarifa in tarifas"
            :key="tarifa.precio"
            :lat-lng="center"
            :radius="tarifa.radio"
            :color="tarifa.color"
          />
        </l-map>
      </div>
    </div>
    <!-- <q-card-actions v-if="idOrder" align="center" class="text-negative">
      <q-btn flat label="Cancelar solicitud" @click="cancelarSolicitud" /> 
    </q-card-actions> -->
  </q-card>
</template>

<script>
import { LMap, LTileLayer, LMarker, LCircle } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default {
  // props: ['idOrder'],
  components: { LMap, LTileLayer, LMarker, LCircle },
  data() {
    return {
      zoom: 13,
      // center: [-17.783384, -63.18203],
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      tarifas: [
        { color: "#4D96F2", precio: 10, radio: 1200 },
        { color: "orange", precio: 12, radio: 2200 },
        { color: "purple", precio: 15, radio: 3700 },
        { color: "red", precio: 18, radio: 5000 }
      ]
    };
  },
  methods: {
    // cancelarSolicitud() {
    //   this.$emit('cancelar', this.idOrder)
    // }
  },
  computed: {
    center() {
      return [
        this.$store.getters["clientData/getUsuario"].lat,
        this.$store.getters["clientData/getUsuario"].lng
      ];
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