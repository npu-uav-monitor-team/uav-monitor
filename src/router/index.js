import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'main',
        redirect: '/control-center'
    },
    {
        path: '/control-center',
        name: 'ControlCenter',
        component: () => import('../views/ControlCenter.vue')
    },
    {
        path: '/tracking',
        name: 'Tracking',
        component: () => import('../views/Tracking.vue')
    },
    {
        path: '/monitor-center',
        name: 'Monitor',
        component: () => import('../views/MonitorCenter.vue')
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue')
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
