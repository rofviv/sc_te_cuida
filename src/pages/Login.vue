<template>
  <div>
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
    <q-dialog
      v-model="dialogLogin"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-form ref="formLogin" @submit="login" class="q-gutter-md">
          <q-bar class="bg-primary text-white">
            <div class="text-weight-bold">Iniciar</div>
            <q-space />
            <q-btn dense flat icon="close" v-close-popup>
              <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
            </q-btn>
          </q-bar>

          <q-card-section>Ingresa tu número de celular</q-card-section>

          <q-card-section class="q-mt-none">
            <q-input
              class="q-mx-lg"
              v-model="celularLogin"
              placeholder="71091407"
              hint="Número de celular"
              counter
              maxlength="8"
              :rules="rulesCel"
            >
              <template v-slot:prepend>
                <q-icon name="smartphone" />
              </template>
            </q-input>
            <div class="row justify-center q-mt-md">
              <q-btn type="submit" outline color="primary" label="Iniciar" />
            </div>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogRegister"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-form ref="formRegister" @submit="registrarse" class="q-gutter-md">
          <q-bar class="bg-primary text-white">
            <div class="text-weight-bold">Registra tus datos</div>
            <q-space />
          </q-bar>

          <q-card-section class="q-pb-none q-pt-none">
            Es extremadamente importante que sus datos sean correctos
            <h3 class="text-h6 text-weight-light q-mb-none q-mt-sm">Ingresa tus datos.</h3>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              class="q-mx-lg"
              v-model="nombreRegister"
              placeholder="John Doe"
              hint="Nombre y apellido"
              :rules="rulesTexto"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
            <q-input
              readonly
              class="q-mx-lg"
              v-model="celularLogin"
              placeholder="71091407"
              hint="Número de celular"
              counter
              maxlength="8"
              :rules="rulesCel"
            >
              <template v-slot:prepend>
                <q-icon name="smartphone" />
              </template>
            </q-input>

            <div class="text-right">
              <q-btn flat color="negative" @click="dialogRegister = false" size="sm">Este no es mi número</q-btn>
            </div>

            <q-separator inset class="q-mt-lg" />
            <h3 class="q-pt-xs text-subtitle1 text-weight-light flex flex-center">Tu dirección</h3>
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
              :rules="[ val => val && val.length > 0 || 'Escribe la dirección de origen']"
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

            <div class="row justify-center q-mt-md">
              <q-btn type="submit" outline color="primary" label="Registrarse" />
            </div>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
    <div class="row justify-center q-mt-lg q-pt-lg">
      <q-img class="imgRedonda" src="../assets/perfil.png" />
    </div>
    <div class="row justify-center q-mt-md">
      <h4 class="q-mt-none q-mb-none">Bolivia Dona</h4>
    </div>
    <div class="row justify-center q-mt-md">
      <p class="q-mt-none q-mb-none">Una esperanza para los necesitados</p>
    </div>
    <q-separator class="q-mt-md" />
    <div class="row justify-center q-mt-md">
      <q-btn @click="dialogLogin = true" color="primary" style="width: 200px">
        <div class="ellipsis">Iniciar</div>
      </q-btn>
    </div>
    <!-- <div class="row justify-center q-mt-md">
      <q-btn @click="dialogRegister = true" color="primary" style="width: 200px">
        <div class="ellipsis">Registrate</div>
      </q-btn>
    </div>-->
  </div>
</template>

<script>
import { QSpinnerRings } from "quasar";
import { LMap, LTileLayer } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import moment from "moment";

export default {
  components: { "l-map": LMap, "l-tile-layer": LTileLayer },
  data() {
    return {
      solicitoClaveOTP: false,
      dialogLogin: false,
      celularLogin: "",
      claveLogin: "",

      citySelect: 'Santa Cruz',
      cityOptions: ['Santa Cruz', 'Cochabamba', 'La Paz', 'Tarija', 'Sucre'],

      dialogRegister: false,
      nombreRegister: "",
      celularRegister: "",
      emailRegister: "",
      claveRegister: "",
      claveRegisterRepetir: "",
      esEmpresa: true,
      isPwd: true,
      nombreEmpresa: null,
      logo_rest: null,
      direccion: "",
      typeLocation: null,
      location: false,
      viewMap: false,

      zoom: 15,
      center: [-17.783384, -63.18203],
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      rulesTexto: [val => !!val || "Este campo es importante"],
      rulesClave: [
        val => !!val || "Escribe tu contraseña",
        val => val.length > 3 || "Mínimo 4 carácteres"
      ],
      rulesCel: [
        val => !!val || "Escribe tu número de celular",
        val => val.length > 7 || "Debe ser un número real"
      ],
      rulesEmail: [
        v => !!v || "Email es importante",
        v => /.+@.+/.test(v) || "El Email debe ser real"
      ]
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
    changedLocation() {
      this.location = true;
      this.viewMap = true;
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
    },
    solicitarClaveOTP() {
      this.solicitoClaveOTP = true;
    },
    async login(celular) {
      // if (this.$refs.formLogin.validate()) {
        // console.log(this.celularLogin);
        this.showLoading();
        const URI =
          "https://boliviadona.com/api/controllers/scController.php?type=login";
        var data = new FormData();
        data.append("celular", this.celularLogin);
        try {
          const res = await this.$axios.post(URI, data);
          // console.log('Login', res.data);
          if (res.data.length > 0) {
            this.$store.commit("clientData/guardarUsuario", res.data[0]);
            this.$router.replace({ name: "instituciones" });
          } else {
            this.dialogRegister = true;
            this.$q.notify({
              color: "primary",
              textColor: "white",
              icon: "account_circle",
              message: "Registra tus datos para continuar"
            });
          }
        } catch (error) {
          console.log(error);
        }
        this.$q.loading.hide();
      // }
    },
    async registrarse() {
      if (this.$refs.formRegister.validate()) {
        if (this.location !== true) {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "Selecciona un método para ubicarte"
          });
        } else {
          this.showLoading();
          const URI =
            "https://boliviadona.com/api/controllers/scController.php?type=registro";
          let data = new FormData();
          data.append("celular", this.celularLogin);
          data.append("nombre", this.nombreRegister);
          data.append("direccion", this.direccion);
          data.append("ciudad", this.citySelect);
          data.append("lat", this.center[0]);
          data.append("lng", this.center[1]);
          try {
            const res = await this.$axios.post(URI, data);
            // this.$q.notify({
            //   color: "positive",
            //   textColor: "white",
            //   icon: "check",
            //   message: "Registrado con éxito, Inicia sesión"
            // });
            this.dialogRegister = false;
            this.login();
            // this.dialogLogin = false;
            // this.$router.replace({ name: "motoclick" });
          } catch (error) {
            console.log(error);
          }
          this.$q.loading.hide();
        }
      }
    },
    showLoading() {
      const spinner =
        typeof QSpinnerRings !== "undefined"
          ? QSpinnerRings
          : Quasar.components.QSpinnerRings;

      this.$q.loading.show({
        spinner,
        spinnerColor: "red",
        spinnerSize: 140
      });
    }
  }
};
</script>

<style lang="scss" >
.imgRedonda {
  width: 150px;
  height: 150px;
  border-radius: 150px;
  border: 1px solid #222;
}
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