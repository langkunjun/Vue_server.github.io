<template>
	<div class="login_container">
		<div class="login_box">
			<div class="avatar_box">
				<img src="../assets/img/user1.png" />
			</div>
			<el-form ref="loginFormRef" :rules="loginRules" class="login_form" :model="loginForm">
			  <el-form-item prop="username">
				  <!-- 用户名 -->
			    <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
			  </el-form-item>
			  <el-form-item prop="password">
				  <!-- 密码 -->
			    <el-input type="password" prefix-icon="el-icon-lock" v-model="loginForm.password"></el-input>
			  </el-form-item>
			  <el-form-item class="btns">
			  	<!-- 登录 -->
			   <el-button type="primary" @click="login">登录</el-button>
			   <!-- 注册 -->
			   <el-button type="info" @click="resetLoginForm">重置</el-button>
			  </el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			
			return {
				loginForm: {
					username:'admin',
					password:'123456'
				},
				loginRules:{
					username:[
						{ required: true, message: '请输入用户名', trigger: 'blur' },
						{ min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
					],
					password:[
						{ required: true, message: '请输入密码', trigger: 'blur' },
						{ min: 6, max: 12, message: '至少 6 到 12 个字符', trigger: 'blur' }
					]
				}
			}
		},
		methods:{
			resetLoginForm(){
				// console.log(this);
				this.$refs.loginFormRef.resetFields();
			},
			login(){
				this.$refs.loginFormRef.validate(async valid =>{
					if(!valid) return;
					const {data:res} = await this .$http.post('login',this.loginForm);
					if(res.meta.status != 200)return this.$message.error("登录失败");
					this.$message.success("登录成功");
					
					//console.log(res);
					//保存token值
					window.sessionStorage.setItem("token",res.data.token);
					
					this.$router.push('/home');
					
				});
			}
			
		}
		
	}
</script>

<style lang="less" scoped="scoped">
	.login_container{
		background-color: lightslategray;
		height: 100%;
	}
	.login_box{
		width: 450px;
		height: 300px;
		background-color: white;
		border-radius: 4px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
	}
	.avatar_box{
		height: 130px;
		width: 130px;
		border: 1px solid #eee;
		border-radius: 50%;
		padding: 10px;
		box-shadow:0 0 10px ;
		position: absolute;
		left: 50%;
		transform: translate(-50%,-50%);
		background-color: #FFFFFF;
		img{
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: #eee;
		}
		
	}
	.btns{
		display: flex;
		justify-content: flex-end;
	}
	.login_form{
		position: absolute;
		bottom:0 ;
		width:100% ;
		padding: 0 20px;
		box-sizing: border-box;
	}
</style>
