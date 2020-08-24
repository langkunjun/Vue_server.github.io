<template>
	<el-container class="home-container">
		<!-- 头部 -->
		<el-header>
			<div class="header_box">
				<img src="../assets/img/home.png" />
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="loginout">退出</el-button>
		</el-header>
		<!-- 主体区 -->
		<el-container>
			<!-- 菜单区 -->
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<div class="toggle-button" @click="toggleCollapse">|||</div>
			<!-- 侧边导航栏 -->
				<el-menu background-color="#333744"
				 text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
				 <!-- 一级菜单 -->
					<el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
						<!-- 一级菜单模板区 -->
						<template slot="title">
							<!-- 图标 -->
							<i :class="iconsObj[item.id]"></i>
							<!-- 文本 -->
							<span>{{item.authName}}</span>
						</template>
						<!-- 二级菜单 -->
						<el-menu-item :index="'/' + subItem.path + ''" v-for="subItem in item.children" @click="saveNavState('/' + subItem.path)">
							<template slot="title">
								<!-- 图标 -->
								<i class="el-icon-menu"></i>
								<!-- 文本 -->
								<span>{{subItem.authName}}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<!-- 内容区 -->
			<el-main>
				<!-- 路由占位符 -->
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>

</template>

<script>
	export default {
		data(){
			return{
				menulist: [],
				iconsObj: {
					'125':'iconfont icon-user',
					'103':'iconfont icon-tijikongjian',
					'101':'iconfont icon-shangpin',
					'102':'iconfont icon-danju',
					'145':'iconfont icon-baobiao'
				},
				//
				isCollapse:false,
				activePath:''
				
			}
		},
		created(){
			this.getMenuList()
			this.activePath = window.sessionStorage.getItem('activePath')
		},
		methods: {
			loginout() {
				window.sessionStorage.clear();
				this.$router.push('/login')
			},
			async getMenuList(){
				const { data: res } = await this.$http.get('menus')
				if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
				this.menulist = res.data
				console.log(res)
			},
			toggleCollapse(){
				this.isCollapse = ! this.isCollapse
			},
			saveNavState(activePath) {
				window.sessionStorage.setItem('activePath',activePath)
				this.activePath = activePath
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.home-container {
		height: 100%;
	}

	.el-header {
		background-color: #373d41;
		display: flex;
		justify-content: space-between;
		padding-left: 0;
		align-items: center;
		color: white;
		font-size: 22px;

		>div {
			display: flex;
			align-items: center;

			span {
				margin-left: 15px;
			}
		}
	}

	.el-aside {
		background-color: #333744;
		.el-menu{
			border: none;
		}
	}

	.el-main {
		background-color: #eaedf1;
	}
	.iconfont {
		margin-right: 10px;
	}
	.toggle-button{
		background-color: #4a5064;
		font-size: 10px;
		line-height: 24px;
		color: white;
		text-align: center;
		letter-spacing: 0.2em;
		cursor: pointer;
	}
</style>
