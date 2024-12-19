<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header-toolbar">
      <q-toolbar>
        <q-btn
          color="primary"
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          style="z-index: 100 "
        />
        <q-space />
      </q-toolbar>
      <div class="q-px-lg q-pt-xl q-mb-md">
        <div class="text-h4" style="opacity: 0.0">-</div>
        <div class="text-subtitle1" style="opacity: 0.0">-</div>
      </div>
      <keep-alive>
      <q-carousel animated v-if="bannerImagenes.length > 0" v-model="slide" class="header-image absolute-top" infinite :autoplay="10000">
        <!-- <q-carousel-slide  v-for="(img, index) in bannerImagenes" :key="index" :name="index" :img-src="img" /> -->
        <q-carousel-slide  class="q-pa-none" v-for="(img, index) in bannerImagenes" :key="index" :name="index" :img-src="`https://boliviadona.com/uploads/banners/${img.banner}`" >
          <!-- <q-img class="full-height" :src="img" /> -->
          <div v-show="img.empresa || img.descripcion" class="absolute-bottom custom-caption">
            <div class="text-h6">{{ img.empresa }} <q-btn v-show="img.link" flat dark icon="fas fa-link" size="xs" @click="openLink(img.link)" /> </div>
            <div class="text-body2">{{ img.descripcion }}</div>
          </div>
        </q-carousel-slide>
      </q-carousel>
      <q-img v-else contain src="../assets/portada.png" class="header-image absolute-top" />
      </keep-alive>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="250" :breakpoint="600">
      <q-scroll-area class="scroll-container"
        style="height: calc(100% - 192px); margin-top: 192px; border-right: 1px solid #ddd;"
      >
        <q-list padding dark dense>
          <q-item to="/" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="group" /> -->
              <q-img class="iconos" contain src="../assets/iconos/beneficiarios.png" />
            </q-item-section>
            <q-item-section>Beneficiarios</q-item-section>
          </q-item>
          <q-item to="/mapa" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="place" /> -->
              <q-img class="iconos" contain src="../assets/iconos/mapa.png" />
            </q-item-section>

            <q-item-section>Mapa de beneficiarios</q-item-section>
          </q-item>
          <q-item to="/perfil" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="account_circle" /> -->
              <q-img class="iconos" contain src="../assets/iconos/perfil.png" />
            </q-item-section>

            <q-item-section>Perfil</q-item-section>
          </q-item>
          <q-item to="/historial" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="favorite_border" /> -->
              <q-img class="iconos" contain src="../assets/iconos/tus-donaciones.png" />
            </q-item-section>
            <q-item-section>Tus donaciones</q-item-section>
          </q-item>
          <q-item to="/ayuda" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="help" /> -->
              <q-img class="iconos" contain src="../assets/iconos/preguntas.png" />
            </q-item-section>

            <q-item-section>Preguntas Frecuentes</q-item-section>
          </q-item>
          <q-item @click="cerrarSesion" exact clickable v-ripple>
            <q-item-section avatar>
              <!-- <q-icon name="exit_to_app" /> -->
              <q-img class="iconos" contain src="../assets/iconos/salir.png" />
            </q-item-section>
            <q-item-section>Salir</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      <div>
        <!-- <q-btn glossy color="primary" class="full-width" label="Hazte Premium" /> -->
      </div>
      <q-img class="absolute-top" src="../assets/perfil.png" style="height: 192px">
        <div class="absolute-bottom " style="padding: 4px 16px;">
          <!-- <q-avatar v-if="getUsuario.logo_rest" size="56px" class="q-mb-sm">
            <img
              :src="`https://patioserviceonline.com/uploads/motoclick_logos/${getUsuario.logo_rest}`"
            />
          </q-avatar>-->
          <div class="text-weight-bold">{{ getUsuario.nombre }}</div>
          <div class="">{{ getUsuario.celular }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <!-- <keep-alive> -->
      <router-view />
      <!-- </keep-alive> -->
    </q-page-container>
  </q-layout>
</template>

<script>
import moment from "moment";
moment.locale("es");

export default {
  async created() {
    if (this.$store.getters["clientData/getId"]) {
      await this.getUsuarioByID();
      this.cargarBanners();
    } else {
      this.$router.replace({ name: "login" });
    }
  },
  data() {
    return {
      slide: 1,
      leftDrawerOpen: false,
      bannerImagenes: []
    };
  },
  methods: {
    conseguirCreditos() {
      this.$router.replace({ name: "creditos" });
    },
    cerrarSesion() {
      this.$router.replace({ name: "login" });
    },
    openLink(url) {
      window.open(url);
    },
    async cargarBanners() {
      const URI = "https://boliviadona.com/api/controllers/scController.php?type=banners";
      try {
        const res = await this.$axios.get(URI);
        this.bannerImagenes = res.data;
        console.log(this.bannerImagenes);
      } catch (error) {
        console.log(error);
        this.bannerImagenes = ['https://cdn.quasar.dev/img/mountains.jpg'];
      }
    },
    async getUsuarioByID() {
      const URI =
        "https://boliviadona.com/api/controllers/scController.php?type=donante&id=" +
        this.getUsuario.id;
      try {
        const res = await this.$axios.get(URI);
        if (res.data.length > 0) {
          this.$store.commit("clientData/guardarUsuario", res.data[0]);
        } else {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "No hay un usuario registrado con ese número"
          });
          this.$router.replace({ name: "login" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
  computed: {
    fechaActual() {
      return moment().format("dddd, DD MMMM");
    },
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    }
  }
};
</script>

<style lang="scss" scoped>
.q-item {
  margin-bottom: 8px;
  background: $primaryAux;
}

.q-item__section {
  font-weight: bold;
  color: #fff;
  vertical-align: middle;
}

.q-router-link--active {
  background: $secondary;
}
.q-router-link--active > .q-item__section {
  color: #000;
}
.header-image {
  height: 192px;  
  // z-index: -1;
  // opacity: 0.6;
  // filter: grayscale(100%);
}
.header-toolbar {
  height: 192px;  
}
.scroll-container {
   background: $primary
}

.custom-caption {
  text-align: left;
  padding: 4px 16px;
  color: white;
  background-color: rgba(0, 0, 0, .3);
}

.iconos {
  width: 100%;
  max-width: 22px;
  //  align-items: end;
}

</style>