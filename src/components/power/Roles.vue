<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片试图 -->
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary">添加角色</el-button>
				</el-col>
			</el-row>
			<!-- 角色列表 -->
			<el-table border stripe :data="rolelist">
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :class="['bdbottom','vcenter',i1 === 0 ? 'bdtop' : '']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
							<!-- 一级权限 -->
							<el-col :span="5">
								<el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<!-- 二级权限 -->
							<el-col :span="19">
								<el-row :class="[i2 ===0 ? '' : 'bdtop','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" @close="removeRightById(scope.row,item2.id)" closable>{{item2.authName}}
										</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag @close="removeRightById(scope.row,item3.id)" closable type="warning" v-for="(item3 , i3) in item2.children"
										 :key="item3.id">{{item3.authName }}</el-tag>
									</el-col>
								</el-row>
							</el-col>

						</el-row>
					</template>
				</el-table-column>
				<!-- 索引列 -->
				<el-table-column type="index"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="290px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
						<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 添加角色 -->

		</el-card>
		<!-- 分配全新 -->
		<el-dialog @close="setRightDialogCloesd" title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
			<el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRightDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>

	</div>
</template>

<script>
	export default {
		data() {
			return {
				rolelist: [],
				setRightDialogVisible: false,
				rightslist: [],
				
				treeProps:{
					label:'authName',
					children:'children'
				},
				//默认选中 的权限
				defKeys:[],
				//当前即将分配权限的id
				roleId:''
			}
		},
		created() {
			this.getRolesList()
		},
		methods: {
			async getRolesList() {
				const {
					data: res
				} = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败')
				}
				this.rolelist = res.data

				console.log(this.rolelist)
			},
			async removeRightById(role, rightId) {
				const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmResult !== 'confirm') {
					return this.$message.info('取消了删除')
				}
				const {
					data: res
				} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
				if (res.meta.status !== 200) {
					return this.$message.error('权限删除失败')
				}
				// this.getRolesList()
				role.children = res.data
			},
			async showSetRightDialog(role) {
				this.roleId = role.id
				const {
					data: res
				} = await this.$http.get('rights/tree')
				if (res.meta.status !== 200) {
					return this.$message.error('获取权限数据失败')
				}
				//把获取到的数据保存在data中
				this.rightslist = res.data
				// console.log(this.rightslist)
				this.getLeafKeys(role,this.defKeys)
				
				this.setRightDialogVisible = true
			},
			//通过递归形式，获取所有的三级权限
			getLeafKeys(node,arr){
				//如果当前的 node
				if(!node.children){
					return arr.push(node.id)
				}
				node.children.forEach(item => this.getLeafKeys(item,arr))
			},
			//监听权限赋值的关闭事件
			setRightDialogCloesd(){
				this.defKeys = []
			},
			//点击角色分配权限
			async allotRights(){
				const keys = [
					...this.$refs.treeRef.getCheckedKeys(),
					...this.$refs.treeRef.getHalfCheckedKeys()
				]
				const idStr = keys.join(',')
				
				const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr})
				 if(res.meta.status !==200){
					 return this.$message.error('分配权限失败！')
				 }
				 this.$message.success('分配权限成功！')
				 this.getRolesList()
				 this.setRightDialogVisible = false
			}
		},
	}
</script>

<style lang="less" scoped>
	.el-tag {
		margin: 7px;
	}

	.bdtop {
		border-top: 1px solid #EEEEEE;
	}

	.bdbottom {
		border-top: 1px solid #EEEEEE;
	}

	.vcenter {
		display: flex;
		align-items: center;
	}
</style>
