<template>
  <!-- <q-card style="min-width: 100%">
    <div class="content-dialog" >
  <div class="map-container" >-->
  <div
    style="z-index: 3; position: absolute; height: 100%; width: 100%; padding: 0px; border-width: 0px; margin: 0px; left: 0px; top: 0px; touch-action: pan-x pan-y;"
  >
    <l-map
      ref="myMap"
      style="z-index: 0; position: relative; height: 100%; width: 100% "
      :zoom="zoom"
      :center="[getUsuario.lat, getUsuario.lng]"
    >
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <!-- <l-marker :lat-lng="center"></l-marker> -->
      <l-marker
        v-for="ins in lstBeneficiarios"
        :key="ins.id"
        :lat-lng="[ins.lat, ins.lng]"
        :icon="markerLocal"
      >
        <l-popup>
          <b>Beneficiario:</b>
          {{ ins.beneficiario }}
          <br />
          <b>Contacto:</b>
          {{ ins.encargado }} - {{ ins.celular }}
        </l-popup>
      </l-marker>
      <l-marker :lat-lng="[getUsuario.lat, getUsuario.lng]" :icon="markerUser" @add="openPopup">
        <l-popup>
          <div>
            Tu ubicación
            <q-btn flat size="xs" color="primary" to="/perfil">Cambiar</q-btn>
          </div>
        </l-popup>
      </l-marker>
      <l-circle :lat-lng="[getUsuario.lat, getUsuario.lng]" :radius="8 * 1000" color="#4D96F2" />
    </l-map>
  </div>
  <!-- </div>
  </q-card>-->
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon,
  LCircle,
} from "vue2-leaflet";
import "leaflet.awesome-markers";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet/dist/leaflet.css";

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

export default {
  components: { LMap, LTileLayer, LMarker, LPopup, LIcon, LCircle },
  mounted() {
    this.getBeneficiarios();
    this.markerUser = markerUserAux;
    this.markerLocal = markerLocalAux;
  },
  data() {
    return {
      markerUser: null,
      markerLocal: null,
      zoom: 12,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      lstBeneficiarios: [],
      iconSize: 64,
    };
  },
  methods: {
    async getBeneficiarios() {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=beneficiarios&ciudad=" +
        this.getUsuario.ciudad;
      try {
        const res = await this.$axios.get(URI);
        // console.log(res.data);
        this.lstBeneficiarios = res.data;
      } catch (error) {
        console.log(error);
      }
    },
    openPopup: function (event) {
      this.$nextTick(() => {
        event.target.openPopup();
      });
    },
  },
  computed: {
    // center() {
    //   let center = [0, 0];
    //   switch (this.getUsuario.ciudad) {
    //     case "Santa Cruz":
    //       center = [-17.783384, -63.18203];
    //       break;
    //     case "Cochabamba":
    //       center = [-17.393868, -66.157481];
    //       break;
    //     case "La Paz":
    //       center = [-16.505147, -68.129631];
    //       break;
    //     case "Tarija":
    //       center = [-21.533739, -64.733768];
    //       break;
    //     case "Sucre":
    //       center = [-19.041316, -65.263144];
    //       break;
    //   }
    //   return center;
    // },
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
  },
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