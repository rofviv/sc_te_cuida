import { LocalStorage } from 'quasar'

export const clientData = {
  namespaced: true,
  state: {
    id: LocalStorage.getItem('sc_id_donante') || null,
    nombre: "",
    celular: 0,
    direccion: "",
    lat: LocalStorage.getItem('sc_donante_lat') || 0,
    lng: LocalStorage.getItem('sc_donante_lng') || 0,
    ciudad: LocalStorage.getItem('sc_donante_ciudad') || null
  },
  getters: {
    getCreditos: state => {
      return state.creditos;
    },
    getId: state => {
      return state.id;
    },
    getUsuario: state => {
      return {
        id: state.id,
        nombre: state.nombre,
        celular: state.celular,
        direccion: state.direccion,
        correo: state.correo,
        lat: state.lat,
        lng: state.lng,
        ciudad: state.ciudad,

        user_identifier: 'f098ca9ec28803',
        operator_token: 'ca3686de8b9cd13abcb362e09e494210',
        access_token: '91e57f5aad349a0c8778f787d22edabd89558dedf975f3d239e4b943078c8411',
      }
    }
  },
  mutations: {
    guardarUsuario(state, payload) {
      state.id = payload.id;
      state.nombre = payload.nombre;
      state.celular = payload.celular;
      state.direccion = payload.direccion;
      state.lat = payload.lat;
      state.lng = payload.lng;
      state.ciudad = payload.ciudad;
      LocalStorage.set('sc_id_donante', state.id);
      LocalStorage.set('sc_donante_ciudad', state.ciudad);
      LocalStorage.set('sc_donante_lat', state.lat);
      LocalStorage.set('sc_donante_lng', state.lng);
    },
    guardarCiudad(state, ciudad) {
      state.ciudad = ciudad;
      LocalStorage.set('sc_donante_ciudad', state.ciudad);
    }
  }
}