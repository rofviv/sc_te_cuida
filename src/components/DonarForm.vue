<template>
  <q-card>
    <q-bar class="bg-primary text-white">
      Donar
      <q-space />
      <q-btn dense flat icon="close" v-close-popup>
        <q-tooltip content-class="bg-white text-primary">Cerrar</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section>
      <div class="text-h6">{{ beneficiario.beneficiario }}</div>
    </q-card-section>
    <q-form ref="formSolicitar" @submit="calcularCostoEnvio" class="q-gutter-md">
      <q-card-section class="q-pt-none">
        <q-banner v-show="bannerInfo" inline-actions class="text-white bg-primary q-mb-md">
          <p>
            - Describe tu donación
            <br />- Adjunta una imagen
            <br />- El delivery llegará a la ubicación que tienes registrada
          </p>
          <template v-slot:action>
            <q-btn flat color="white" @click="bannerInfo = false" label="Ocultar" />
          </template>
        </q-banner>
        <div class="text-left">
          <q-btn
            color="primary"
            size="md"
            @click="viewInformacion(beneficiario.informacion)"
            class="q-mb-sm"
            outline
          >¿Qué puedo donar?</q-btn>
        </div>
        <q-input
          placeholder="Escribe brevemente tu donación"
          v-model="descripcion"
          outlined
          autogrow
          :rules="[ val => val && val.length > 0 || 'Describe brevemente tu donación']"
        >
          <template v-slot:prepend>
            <q-icon name="edit" />
          </template>
        </q-input>
        <q-file
          outlined
          class="q-px-xs"
          v-model="imagen"
          hint="Adjuntar imagen"
          label="Foto de la donacion"
          :rules="rulesTexto"
        >
          <template v-slot:prepend>
            <q-icon name="add_a_photo" />
          </template>
        </q-file>

        <!-- <p class="q-mt-md q-ml-xs text-grey"><b>Dirección registrada:</b> {{this.getUsuario.direccion}}</p> <q-btn icon="place"></q-btn> -->
        <q-list bordered class="q-mt-md q-mx-xs">
          <q-item>
            <q-item-section>
              <q-item-label class="text-grey">
                <b>Dirección registrada:</b>
                {{this.getUsuario.direccion}}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-btn flat color="red" @click="abrirGoogleMaps" icon="place" />
              <q-item-label class="text-grey q-mt-xs">Ubicacion</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="text-right">
          <q-btn color="primary" size="md" to="/perfil" class="q-mb-sm" flat>Cambiar mi ubicación</q-btn>
        </div>

        <q-card class="q-mt-md text-center">
          <q-card-section>
            <!-- <q-icon name="electric_moped" class="text-teal" style="font-size: 3.5em" /> -->
            <q-img src="../assets/logo-ps.png" style="width: 100%; max-width:130px;" />
            <p class="q-mt-sm q-mb-xs">Solicita un agente de PatioService que recogera la donación</p>
            <p
              class="q-mt-sm text-caption"
            >Al presionar Solicitar se calculará el costo de envío y se te pedirá confirmación para finalizar</p>
            <q-btn color="primary" type="submit">Solicitar</q-btn>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script>
import { QSpinnerCube } from "quasar";

export default {
  props: ["beneficiario"],
  mounted() {},
  data() {
    return {
      closeDialog: false,
      bannerInfo: true,
      imagen: null,
      descripcion: "",
      rulesTexto: [(val) => !!val || "Este campo es importante"],
      messageLoading:
        "<h6 class='q-mt-none'>Calculando la tarifa.<br /> Espera un momento necesitaremos tu confirmación.</h6>",
    };
  },
  methods: {
    async calcularCostoEnvio() {
      this.messageLoading =
        "<h6 class='q-mt-none'>Calculando la tarifa.<br /> Espera un momento necesitaremos tu confirmación.</h6>";
      this.showLoading();
      const URI =
        "https://prod-fatafat-new.jugnoo.in:4030/get_all_details?device_type=0&app_version=436&to_latitude=" +
        this.beneficiario.lat +
        "&access_token=" +
        this.getUsuario.access_token +
        "&login_type=0&from_latitude=" +
        this.getUsuario.lat +
        "&locale=es&operator_token=" +
        this.getUsuario.operator_token +
        "&to_longitude=" +
        this.beneficiario.lng +
        "&customer_package_name=com.movapps.mav.patioservice&from_longitude=" +
        this.getUsuario.lng;
      try {
        const res = await this.$axios.get(URI);
        if (res.data.delivery_charges) {
          // this.confirmarDelivery(res.data.delivery_charges.estimated_charges);
          this.confirmarDelivery(0);
        } else {
          alert(res.data.message);
        }
        this.$q.loading.hide();
      } catch (error) {
        console.log("Tarifa", error);
      }
    },
    confirmarDelivery(delivery) {
      this.$q
        .dialog({
          title: "Costo del envío",
          // message:
          //   "El costo por recoger tu donación y llevar al lugar de donación costará <b>" + delivery + " Bs.</b> monto que deberás pagar al repartidor al entregar la donación ¿Confirmar?",
          message:
            "El costo por recoger tu donación y llevar al lugar de donación costará <b>" +
            delivery +
            " Bs.</b> PatioService asume las primeras 2000 carreras ¿Confirmar?",
          cancel: true,
          persistent: true,
          html: true,
          ok: {
            label: "Sí, Confirmar",
            push: true,
          },
          cancel: {
            label: "No, Cancelar",
            push: true,
            color: "negative",
          },
        })
        .onOk(() => {
          this.solicitarDelivery(delivery);
        });
    },
    abrirGoogleMaps() {
      window.open(
        "https://maps.google.com/maps?q=" +
          this.getUsuario.lat +
          "%2C" +
          this.getUsuario.lng +
          "&z=17&hl=es"
      );
    },
    async solicitarDelivery(envio) {
      this.messageLoading =
        "<h6 class='q-mt-none'>Confirmado<br /> Solicitando delivery.</h6>";
      this.showLoading();
      const pedido_jugno = await this.crearPedidoJugno();
      if (pedido_jugno.id) {
        const URI =
          "https://boliviadona.com/api/controllers/scController.php?type=delivery";
        const data = new FormData();
        data.append("id_pedido", pedido_jugno.id);
        data.append("descripcion", this.descripcion);
        data.append("precio_envio", envio);
        data.append("id_donante", this.getUsuario.id);
        data.append("id_beneficiario", this.beneficiario.id);
        data.append("imagen", this.imagen);
        try {
          const res = await this.$axios.post(URI, data);
          // console.log(res.data);
          this.$q.notify({
            position: "top",
            message: "Delivery en camino a su ubicación",
            icon: "electric_moped",
            color: "primary",
            timeout: 6000,
          });
          this.$emit("adicionarDelivery", {
            id_pedido: pedido_jugno.id,
            descripcion: this.descripcion,
            precio_envio: envio,
            beneficiario: this.beneficiario.beneficiario,
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        alert(pedido_jugno.mensaje);
      }
      this.$q.loading.hide();
    },
    async crearPedidoJugno() {
      const URI = "https://prod-fatafat-new.jugnoo.in:4030/place_order";
      var auxDetails = this.getUsuario.nombre + " - " + this.getUsuario.celular;

      const data = new URLSearchParams();

      data.append(
        "details",
        "*DONACION: " +
          auxDetails +
          " *Recoger: " +
          this.descripcion +
          " *Direccion: " +
          this.getUsuario.direccion +
          " *Para: " +
          this.beneficiario.beneficiario
      );
      data.append(
        "from_address",
        "*DONACION: " +
          auxDetails +
          " *Recoger: " +
          this.descripcion +
          " *Direccion: " +
          this.getUsuario.direccion +
          " *Para: " +
          this.beneficiario.beneficiario
      );
      data.append("from_latitude", this.getUsuario.lat);
      data.append("from_longitude", this.getUsuario.lng);
      data.append("payment_mode", "1");
      data.append(
        "to_address",
        "*DONACION: " +
          auxDetails +
          " *Entregar: " +
          this.descripcion +
          " *Lugar: " +
          this.beneficiario.beneficiario +
          " *Direccion: " +
          this.beneficiario.direccion +
          " *Encargado: " +
          this.beneficiario.encargado +
          " - " +
          this.beneficiario.celular
      );
      data.append("to_latitude", this.beneficiario.lat);
      data.append("to_longitude", this.beneficiario.lng);
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
    showLoading() {
      const spinner =
        typeof QSpinnerCube !== "undefined"
          ? QSpinnerCube
          : Quasar.components.QSpinnerCube;

      this.$q.loading.show({
        spinner,
        spinnerColor: "orange",
        spinnerSize: 140,
        message: this.messageLoading,
        sanitize: false,
      });
    },
    viewInformacion(info) {
      this.$emit("mostrarInformacion", info);
    },
  },
  computed: {
    getUsuario() {
      return this.$store.getters["clientData/getUsuario"];
    },
  },
};
</script>

<style>
</style>