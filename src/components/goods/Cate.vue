<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片试图 -->
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddDialog">添加分类</el-button>
				</el-col>
			</el-row>
			<!-- 表格 -->
			<tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index  index-text="#" border>
				<!-- 是否有效 -->
				<template slot="isok" slot-scope = "scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted ===false" style="color: lightgreen;"></i>
					<i class="el-icon-error" v-else style="color: red;"></i>
				</template>
				<!-- 排序 -->
				<template slot="order" slot-scope = "scope">
					<el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
					<el-tag type="success" size="mini" v-else-if="scope.row.cat_level ===1">二级</el-tag>
					<el-tag type="warning" size="mini" v-else>三级</el-tag>
				</template>
				<!-- 操作 -->
				<template slot="opt" slot-scope= "scope">
					<el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
					<el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
				</template>
			</tree-table>
			
			<!-- 分页区域 -->
			<el-pagination
			      @size-change="handleSizeChange"
			      @current-change="handleCurrentChange"
			      :current-page="querInfo.pagenum"
			      :page-sizes="[5, 10, 15, 20]"
			      :page-size="querInfo.pagesize"
			      layout="total, sizes, prev, pager, next, jumper"
			      :total="total">
			    </el-pagination>
		</el-card>
		<!-- 添加分类 -->
		<el-dialog
		  title="添加分类"
		  :visible.sync="addCateDialogVisible"
		  width="50%" @close="addCateClosed">
		  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
		    <el-form-item label="分类名称:" prop="cat_name">
		      <el-input v-model="addCateForm.cat_name"></el-input>
		    </el-form-item>
			<el-form-item label="父级分类:">
				<!-- options用来指定数据源 -->
				<!-- props 用来配置指定对象 -->
			 <el-cascader
				expand-trigger="hover"
			     v-model="selectedKeys"
			     :options="parentCateList"
			     :props="cascaderProps"
			     @change="parentCateChange" clearable change-on-select></el-cascader>
			</el-form-item>
			</el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addCateDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addCate">确 定</el-button>
		  </span>
		</el-dialog>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				
				querInfo:{
					type:3,
					pagenum:1,
					pagesize:5
				},
				//商品分类的数据列表，默认为空
				catelist:[],
				//总条数
				total:0,
				//为table指定列的定义
				columns:[{
					label:'分类名称',
					prop:'cat_name'
				},
				{
					lebel:'是否有效',
					//表示，将当前列定义为模板列
					type:'template',
					//表示当前这一列使用模板名称
					template:'isok'
				},
				{
					label:'排序',
					type:'template',
					template:'order'
				},
				{
					label:'操作',
					type:'template',
					template:'opt'
				}],
				addCateDialogVisible:false,
				//添加分类的对象
				addCateForm:{
					//将要添加的分类名称
					cat_name:'',
					//父级Id
					cat_pid:0,
					//默认分类等级
					cat_level:0
				},
				addCateFormRules:{
					cat_name:[
						{required:true, message:'请输入分类名称',trigger:'blur'},
						
					]
				},
				parentCateList:[],
				//指顶级联选择器的对象
				cascaderProps:{
					value:'cat_id',
					label:'cat_name',
					children:'children'
					
				},
				//选择的父级分类Id数组
				selectedKeys:[]
			}
			
		},
		created(){
			this.getCateList()
		},
		methods:{
			async getCateList(){
				const { data: res } = await this.$http.get('categories',{params:this.querInfo})
				
				if(res.meta.status !== 200){
					return this.$message.error('获取商品分类失败')
				}
				//把数据列表赋值给list
				// console.log(res.data)
				this.catelist = res.data.result
				//为总数居条数赋值
				this.total = res.data.total
			},
			//监听pagesize
			handleSizeChange(newSize){
				this.querInfo.pagesize = newSize
				this.getCateList()
			},
			handleCurrentChange(newPage){
				this.querInfo.pagenum = newPage
				this.getCateList()
			},
			showAddDialog(){
				//先获取父级分类再展示对话框
				this.getParentCatelist()
				this.addCateDialogVisible = true
			},
			//获取父级分类的数据列表
			async getParentCatelist(){
				
				const {data:res} = await this.$http.get('categories',{params:{type:2}})
				if(res.meta.status !== 200){
					return this.$message.error('获取父级分类数据失败')
				}
				this.parentCateList = res.data
			},
			//选择项变化的函数
			parentCateChange(){
				console.log(this.selectedKeys)
				//如果数组中的Lengths>0证明选中了父级分类，反之则没有
				if(this.selectedKeys.length > 0){
					//父级分类的id
					this.addCateForm.cat_pid =  this.selectedKeys[this.selectedKeys.length -1]
					//为当前分类赋值
					this.addCateForm.cat_level = this.selectedKeys.length
					return
				}else{
					this.addCateForm.cat_pid = 0
					//为当前分类赋值
					this.addCateForm.cat_level = 0
				}
			},
			addCate(){
				// console.log(this.addCateForm)
				this.$refs.addCateFormRef.validate( async valid =>{
					if(!valid)return
					const {data:res} = await this.$http.post('categories',this.addCateForm)
					if(res.meta.status !==201){
						return this.$message.error('添加分类失败!')
					}
					this.$message.success('添加分类成功！')
					this.getCateList()
					this.addCateDialogVisible = false
				})
			},
			
			addCateClosed(){
				this.$refs.addCateFormRef.resetFields()
				this.selectedKeys = []
				this.addCateForm.cat_level = 0
				this.addCateForm.cat_pid = 0
			}
		}
		
	}
</script>

<style scoped="scoped" lang="less">
	.treeTable{
		margin-top: 15px;
	}
	.el-cascader{
		width: 100%;
	}
	
</style>
