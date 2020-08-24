<template>
	<div>
		<!-- 面包屑导航区 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片区域 -->
		<el-card class="box-card">

			<el-row :gutter="20">
				<el-col :span="8">
					<el-input clearable @clear="getUserList" v-model="queryInfo.query" placeholder="请输入内容" class="input-with-select">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
				</el-col>
			</el-row>
			<!-- 用户列表区 -->
			<el-table :data="userlist" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column prop="username" label="姓名">
				</el-table-column>
				<el-table-column prop="email" label="邮箱">
				</el-table-column>
				<el-table-column prop="mobile" label="电话">
				</el-table-column>
				<el-table-column prop="role_name" label="角色">
				</el-table-column>
				<el-table-column label="状态">
					<template slot-scope='scope'>
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<!-- 修改 -->
						<el-tooltip effect="dark" content="修改信息" placement="top" :enterable="false">
							<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						</el-tooltip>
						<!-- 删除 -->
						<el-tooltip effect="dark" content="删除信息" placement="top" :enterable="false">
							<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
						</el-tooltip>
						<!-- 分配 -->
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">

							<el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			 :page-sizes="[2, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-card>
		<!-- 添加用户的对话框 -->
		<el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
			<!-- 内容主体 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click=" addUser">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
			<el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="editFrom.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editFrom.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editFrom.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配权限对话框 -->
		<el-dialog @close="setRoleDialogClosed" title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
			<div>
				<p>当前的用户:{{userInfo.username}}</p>
				<p>当前的角色:{{userInfo.role_name}}</p>
				<p>分配新角色:
					<el-select v-model="selectedRoleId" placeholder="请选择">
						<el-option v-for="item in roleslist" :key="item.id" :label="item.roleName" :value="item.id">
						</el-option>
					</el-select>
				</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRoleDialogVisible">取 消</el-button>
				<el-button type="primary" @click="saveRoleInfo">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			var checkEmail = (rule, value, cb) => {
				//验证邮箱的正则
				const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
				if (regEmail.test(value)) {
					return cb()
				}
				cb(new Error('请输入合法的邮箱'))
			}

			var checkMobile = (rule, value, cb) => {
				//验证手机的正则
				const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
				if (regMobile.test(value)) {
					return cb()
				}
				cb(new Error('请输入合法的手机号码'))
			}
			return {
				queryInfo: {
					query: '',
					//当前的页数
					pagenum: 1,
					//当前每页显示多少条数据
					pagesize: 5
				},
				userlist: [],
				total: 0,
				//控制对话框的显示与隐藏
				addDialogVisible: false,

				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				//添加表单验证规则
				addFormRules: {
					username: [{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '用户名的长度在3~10个字符之间',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 6,
							max: 16,
							message: '密码的长度在6~16个字符之间',
							trigger: 'blur'
						}
					],
					email: [{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入手机号码',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]

				},
				editDialogVisible: false,
				editFrom: {
					// username:''
				},
				editFromRules: {
					email: [{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入手机号码',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]
				},
				//控制角色分配框的显示和隐藏
				setRoleDialogVisible: false,
				//需要被分配角色的用户信息
				userInfo: {},
				//所有角色的数据列表
				roleslist: [],
				//被选中的角色
				selectedRoleId: ''
			}
		},
		created() {
			this.getUserList()
		},
		methods: {
			async getUserList() {
				const {
					data: res
				} = await this.$http.get('users', {
					params: this.queryInfo
				})
				//console.log(res)
				if (res.meta.status !== 200) {
					return error('获取用户列表失败')
				}
				this.userlist = res.data.users
				this.total = res.data.total
			},
			//监听pagesize改变的事件
			handleSizeChange(newSize) {
				// console.log(newSize)
				this.queryInfo.pagesize = newSize
				this.getUserList()
			},
			//监听 页码值 改变的事件
			handleCurrentChange(newPage) {
				console.log(newPage)
				this.queryInfo.pagenum = newPage
				this.getUserList()

			},
			async userStateChanged(userinfo) {
				console.log(userinfo)
				const {
					data: res
				} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
				if (res.meta.status !== 200) {
					userinfo.mg_state = !userinfo.mg_state
					return this.$message.error('更新用户状态失败！')
				}
				this.$message.success('更新用户状态成功!')
			},
			//监听添加用户对话框的关闭事件
			addDialogClosed() {
				this.$refs.addFormRef.resetFields()
			},
			//点击按钮，添加新用户
			addUser() {
				this.$refs.addFormRef.validate(async valid => {
					console.log(valid)
					if (!valid) return
					//可以发起添加网络请求
					const {
						data: res
					} = await this.$http.post('users', this.addForm)

					if (res.meta.status !== 201) {
						this.$message.error('添加用户失败')
					}
					this.$message.success('添加用户成功')
					//隐藏对话框
					this.addDialogVisible = false
					//刷新列表
					this.getUserList()
				})
			},
			//展示编辑用户的对话框
			async showEditDialog(id) {
				const {
					data: res
				} = await this.$http.get('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('查询用户信息失败')
				}

				this.editFrom = res.data
				this.editDialogVisible = true
				// console.log(id)
			},
			editDialogClosed() {
				this.$refs.editFromRef.resetFields()
			},
			//修改用户信息提交
			editUserInfo() {
				this.$refs.editFromRef.validate(async valid => {
					//console.log(valid)
					if (!valid) return
					const {
						data: res
					} = await this.$http.put('users/' + this.editFrom.id, {
						email: this.editFrom.email,
						mobile: this.editFrom.mobile
					})
					if (res.meta.status !== 200) {
						return this.$message.error('更新用户信息失败')
					}
					//关闭对话框
					this.editDialogVisible = false
					//刷新数据列表
					this.getUserList()
					//提示修改成功
					this.$message.success('更新用户信息成功！')
				})

			},
			//删除用户
			async removeUserById(id) {
				const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => {
					return err
				})
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const {
					data: res
				} = await this.$http.delete('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除用户失败')
				}
				this.$message.success('删除用户成功')
				this.getUserList()
			},
			async setRole(userInfo) {
				this.userInfo = userInfo
				//展示之前获取所有角色列表
				const {
					data: res
				} = await this.$http.get('roles')

				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败')
				}
				this.roleslist = res.data
				this.$message.success('获取角色列表成功')
				this.setRoleDialogVisible = true
			},
			//点击按钮分配角色
			async saveRoleInfo() {
				if (!this.selectedRoleId) {
					return this.$message.error('请选择要分配的角色！')
				}
				const {
					data: res
				} = await this.$http.put(`users/${this.userInfo.id}/role`, {
					rid: this.selectedRoleId
				})
				// console.log(res)
				if (res.meta.status !== 200) {
					// console.log(res.meta.status)
					return this.$message.error('更新角色失败!')
				}
				this.$message.success('更新角色成功!')
				this.getUserList()
				this.setRoleDialogVisible = false
			},
			//监听角色分配框的关闭事件
			setRoleDialogClosed() {
				this.selectedRoleId = ''
				this.userInfo = {}
			}



		}
	}
</script>

<style>
</style>
