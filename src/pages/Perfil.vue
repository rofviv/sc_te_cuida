<template>
  <q-page class="q-pa-lg">
    <q-dialog v-model="viewMap" persistent>
      <q-card style="min-width: 100%">
        <div class="content-dialog">
          <div class="map-container">
            <div class="map-marker-centered">
              <q-img src="../assets/marker-home.png"></q-img>
            </div>
            <l-map
              ref="myMap"
              style="z-index: 0; position: relative; height: 100%; width: 100% "
              :zoom="zoom"
              :center="center"
              :options="{zoomControl: false}"
              @update:center="centerUpdated"
            >
              <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
            </l-map>
          </div>
        </div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Detectar mi ubicación" @click="getLocation" />
          <q-btn flat label="Seleccionar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <h5 class="q-mt-none q-mb-sm">Tu Perfil</h5>
    <p>Tu Nombre: {{ this.getUsuario.nombre }}</p>
    <p>Celular: {{ this.getUsuario.celular }}</p>
    <p>Ciudad: {{ this.getUsuario.ciudad }}</p>
    <p>Dirección: {{ this.getUsuario.direccion }}</p>

    <div class="text-right">
      <q-btn
        flat
        color="primary"
        @click="editar = !editar"
        :icon="editar ? 'close' : 'edit'"
        :label="editar ? 'Cancelar' : 'Editar'"
      />
    </div>
    <q-slide-transition>
      <div v-show="editar">
        <q-form ref="formEditar" @submit="actualizarDireccion" class="q-gutter-md">
          <q-select
            class="q-mb-md"
            outlined
            square
            v-model="citySelect"
            @input="cambiarCiudad"
            :options="cityOptions"
          ></q-select>
          <q-input
            placeholder="Ejm.: B. Urbari C. Dechia Nro 282 Porton negro"
            v-model="direccion"
            outlined
            autogrow
            :rules="[ val => val && val.length > 0 || 'Escribe la dirección']"
          >
            <template v-slot:prepend>
              <q-icon name="edit" />
            </template>
          </q-input>
          <q-list bordered separator>
            <q-item tag="label" v-ripple class="q-my-sm" @click="mostrarMapa">
              <q-item-section avatar>
                <q-radio v-model="typeLocation" val="selectMap" @input="changedLocation" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Seleccionar una ubicación</q-item-label>
                <q-item-label caption>Muestra el mapa para seleccionar una ubicación manualmente</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn type="submit" color="primary">Actualizar</q-btn>
        </q-form>
      </div>
    </q-slide-transition>
  </q-page>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";

export default {
  components: { "l-map": LMap, "l-tile-layer": LTileLayer },
  created() {
    this.citySelect = this.getUsuario.ciudad;
  },
  data() {
    return {
      citySelect: 'Santa Cruz',
      cityOptions: ['Santa Cruz', 'Cochabamba', 'La Paz', 'Tarija', 'Sucre'],
      location: false,
      typeLocation: null,
      viewMap: false,
      editar: false,
      direccion: "",

      zoom: 14,
      center: [-17.783384, -63.18203],
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    };
  },
  methods: {
    cambiarCiudad() {
      switch (this.citySelect) {
        case "Santa Cruz":
          this.center = [-17.783384, -63.18203];
          break;
        case "Cochabamba":
          this.center = [-17.393868, -66.157481];
          break;
        case "La Paz":
          this.center = [-16.505147, -68.129631];
          break;
        case "Tarija":
          this.center = [-21.533739, -64.733768];
          break;
        case "Sucre":
          this.center = [-19.041316, -65.263144];
          break;
      }
      this.typeLocation = null;
      this.location = false;
    },
    async actualizarDireccion() {
      if (this.$refs.formEditar.validate()) {
        if (!this.location) {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "Selecciona la ubicación"
          });
          return;
        }
        this.$q.loading.show();
        const URI =
          "https://boliviadona.com/api/controllers/scController.php?type=registro_actualizar_dir&id=" +
          this.getUsuario.id;
        let data = new FormData();
        data.append("lat", this.center[0]);
        data.append("lng", this.center[1]);
        data.append("direccion", this.direccion);
        data.append("ciudad", this.citySelect);
        try {
          const res = await this.$axios.post(URI, data);
          this.$q.notify({
            message: "Dirección y ubicación actualizada correctamente.",
            color: "positive",
            position: "top",
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
          await this.getUsuarioByID();
          // await this.$store.commit("clientData/guardarCiudad", this.citySelect);
          // location.reload();
          this.editar = false;
          this.direccion = '';
          this.typeLocation = null;
          this.location = false;
        } catch (error) {
          console.log(error);
        }
      }
      this.$q.loading.hide();
    },
    async getUsuarioByID() {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=donante&id=" +
        this.getUsuario.id;
      try {
        const res = await this.$axios.get(URI);
        if (res.data.length > 0) {
          this.$store.commit("clientData/guardarUsuario", res.data[0]);
        }
      } catch (error) {
        console.log(error);
      }
    },
    changedLocation() {
      this.viewMap = true;
      this.location = true;
    },
    mostrarMapa() {
      // this.getLocation();
      this.viewMap = true;
    },
    async getLocation() {
      this.$q.loading.show({
        message: "Obteniendo tu ubicación, un momento.."
      });
      try {
        await this.getCoords();
      } catch (e) {}

      this.$q.loading.hide();
    },
    getCoords() {
      if (!navigator.geolocation) {
        return alert(
          "Tu navegador no soporta el acceso a la ubicación. Intenta con otro"
        );
      }

      const onUbicacionConcedida = ubicacion => {
        this.lat = ubicacion.coords.latitude;
        this.lng = ubicacion.coords.longitude;
        this.center = [this.lat, this.lng];
      };

      const onErrorDeUbicacion = err => {
        console.log("Error obteniendo ubicación: ", err);
      };

      const opcionesDeSolicitud = {
        enableHighAccuracy: true,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        onUbicacionConcedida,
        onErrorDeUbicacion,
        opcionesDeSolicitud
      );
    },
    centerUpdated(center) {
      this.center = [center.lat, center.lng];
    }
  },
  computed: {
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    }
  }
};
</script>

<style lang="scss" >
.content-dialog {
  color: white;
  width: 100%;
  height: 350px;
}
.map-container {
  position: relative;
  width: 100%;
  height: 350px;
}
.map-marker-centered {
  width: 50px;
  height: 60px;
  position: absolute;
  z-index: 99;
  left: calc(50% - 25px);
  top: calc(50% - 45px);
  transition: all 0.4s ease;
}
</style>