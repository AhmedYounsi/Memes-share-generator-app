import Vue from 'vue'
import VueRouter from 'vue-router'
 
import Chat from '../views/chat'
import _Chat from '../views/_chat'
import Home from '../views/home'
import Inbox from '../views/inbox'
import Profile from '../views/profile'
import Editor from '../views/editor'
Vue.use(VueRouter)

const routes = [
  {
    path: '/editor',
    name: 'editor',
    component: Editor
  },
    {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/inbox',
        name: 'inbox',
        component: Inbox,
        children: [
          { path: '/inbox/_chat/:id', name: '_chat', component: _Chat },
          
        ]
      },
   {
    path: '/chat/:id',
    name: 'chat',
    component: Chat,
  },
  {
    path: '/profile/:id',
    name: 'profile',
    component: Profile,
  },
  {
    path: '/_chat/:id',
    name: '_chat',
    component: _Chat,
  },
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
