import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

  const routes = [
	  {path:'/',redirect:'/Login'},
	{path:'/Login',component:Login},
	{ path:'/Home',component:Home}
]

const router = new VueRouter({
  routes
})
//路由导航守卫
router.beforeEach((to,from,next) =>{
	//to将要访问的路径
	//from 代表从哪个路径跳转过来
	//next（）放行  next('/login') 强制跳转
	if(to.path ==='/login') return next();
	//获取token
	const tokenStr = window.sessionStorage.getItem('token')
	if (!tokenStr) return next('/login')
	next()
})

export default router
