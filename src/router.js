import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const routes = [
    {
        path: '/',
        name: 'app',
        component: App,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('./pages/dashboard/view.vue')
            },
            {
                path: '/finance',
                name: 'finance',
                component: () => import('./pages/finance/view.vue')
            },
            {
                path: '/finance-report',
                name: 'report',
                component: () => import('./pages/report/view.vue')
            },
            {
                path: '/setting',
                name: 'setting',
                component: () => import('./pages/setting.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('./pages/Login.vue')
    },
    {
        path: '/404',
        name: 'notfound',
        component: () => import('./pages/NotFound.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    if (!localStorage.getItem("pin") && to.name !== 'login') {
      return '/login'
    }
})

export default router;
