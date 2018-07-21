import Main from '@/view/main'
// import parentView from '@/components/parent-view'
import appRoutes from './app-routers'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

/**
 * 系统公用的路由
 */
const defaultRoutes = [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: 'home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: 'home',
        name: 'home',
        meta: {
          hideInMenu: true,
          notCache: true
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
]

/**
 * 错误页面的路由
 */
const errorRoutes = [
  {
    path: '/401',
    name: 'error_401',
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    component: () => import('@/view/error-page/404.vue')
  }
]
/**
 * 系统管理相关的路由，仅管理员访问
 */
const managementRoutes = [
  {
    path: '/auth_manage',
    name: '权限管理',
    meta: {
      icon: 'social-buffer',
      title: '权限管理'
    },
    component: Main,
    component1: 'main',
    children: [
      {
        path: 'menu_manage',
        name: '菜单管理',
        meta: {
          access: ['sys:menu:list'],
          icon: 'arrow-graph-up-right',
          title: '用户管理'
        },
        component: () => import('@/view/admin/menu-manage/menu-manage.vue'),
      },
      {
        path: 'role_manage',
        name: '角色管理',
        meta: {
          access: ['sys:role:list'],
          icon: 'arrow-graph-up-right',
          title: '角色管理'
        },
        component: () => import('@/view/admin/role-manage/role-manage.vue'),
      },
      {
        path: 'user_manage',
        name: '用户管理',
        meta: {
          access: ['sys:user:list'],
          icon: 'arrow-graph-up-right',
          title: '用户管理'
        },
        component: () => import('@/view/admin/user-manage/user-manage.vue'),
      },
      {
        path: 'dept_manage',
        name: '部门管理',
        meta: {
          access: ['sys:dept:list'],
          icon: 'arrow-graph-up-right',
          title: '部门管理'
        },
        component: () => import('@/view/admin/dept-manage/dept-manage.vue'),
      }
    ]
  }
]

export default [
  ...defaultRoutes,
  ...managementRoutes,
  ...appRoutes,
  ...errorRoutes
]
