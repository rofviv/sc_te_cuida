
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'instituciones', component: () => import('pages/Donaciones.vue') },
      { path: 'mapa', name:'mapa', component: () => import('pages/Mapa.vue') },
      { path: 'creditos', name: 'creditos', component: () => import('pages/CompraCreditos.vue') },
      { path: 'perfil', name: 'perfil', component: () => import('pages/Perfil.vue') },
      { path: 'historial', name: 'historial', component: () => import('pages/Historial.vue') },
      { path: 'ayuda', component: () => import('pages/Ayuda.vue') }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/Login.vue')
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
