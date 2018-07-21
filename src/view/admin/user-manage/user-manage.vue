<template>
  <Card>
    <Input v-model="q" placeholder="请输入用户名" clearable style="width: 200px"></Input>
    <Button type="success" @click="queryUserList()">查询</Button>
    <Button type="primary" @click="add()">新增</Button>
    <Button type="warning" @click="exportExcel()">导出</Button>
    <Table border :columns="columnsDef" :data="tableData"></Table>
    <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
            <Page :total="tableTotalCount" :current="tableCurrPage" size="small" show-total show-elevator show-sizer
              :page-size="tablePageSize" :page-size-opts="tablePageSizeOpts"
              @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange">
            </Page>
        </div>
    </div>

    <Modal v-model="modalVisable" :title="modalTitle" @on-ok="modalOk()" >
        <Form :model="formItem" :label-width="80">
          <FormItem label="用户名">
              <Input v-model="formItem.username" placeholder="请输入用户名"></Input>
          </FormItem>
          <FormItem label="所属部门">
              <Input v-model="deptName" placeholder="请选择部门" readonly @on-focus="deptModalVisable = true"></Input>
          </FormItem>
          <FormItem label="密码">
              <Input v-model="formItem.password" placeholder="请输入"></Input>
          </FormItem>
          <FormItem label="邮箱">
              <Input v-model="formItem.email" placeholder="请输入邮箱"></Input>
          </FormItem>
          <FormItem label="手机号">
              <Input v-model="formItem.mobile" placeholder="请输入手机号"></Input>
          </FormItem>
          <FormItem label="角色">
              <CheckboxGroup v-model="formItem.roleIdList">
                <Checkbox v-for="item in this.roleList" :label="item.roleId" :key="item.roleId">{{ item.roleName }}</Checkbox>
              </CheckboxGroup>
          </FormItem>
          <FormItem label="状态">
            <i-switch size="large" v-model="statusSwitch" @on-change="statusChange()">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </i-switch>
          </FormItem>
        </Form>
    </Modal>

    <Modal v-model="deptModalVisable" title="选择部门" @on-ok="deptModalOk()" >
      <Tree ref="deptTreeSelect" :data="deptTree"></Tree>
    </Modal>
  </Card>
</template>
<script>
import httpUtil from '@/libs/httpUtil'
import { getTreeFromPlainArray } from '@/libs/util'
export default {
  data () {
    return {
      q: '', // 查询条件
      modalVisable: false, // 新增/编辑用户模态框，是否可见
      modalMode: 'update', // 新增/编辑模式切换
      formItem: {}, // 新增/编辑用户模态框，表单内容
      deptModalVisable: false, // 部门选择模态框，是否可见
      deptTree: [], // 部门树形结构，用于Tree组件
      deptList: [], // 部门平级结构，用于根据deptId查询deptName
      roleList: [], // 角色列表
      columnsDef: [
        {
          title: '用户ID',
          key: 'userId'
        },
        {
          title: '用户名',
          key: 'username'
        },
        {
          title: '所属部门',
          key: 'deptName'
        },
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: '手机号',
          key: 'mobile'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '创建时间',
          key: 'createTime'
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.show(params.index)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.index)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      tableData: [],

      tableTotalCount: 0, // 表中总记录数
      tableCurrPage: 1, // 当前页码
      tablePageSize: 10, // 每页记录数
      tablePageSizeOpts: [10, 20, 30, 50] // 每页记录数，可选项
    }
  },
  computed: {
    modalTitle () {
      return this.modalMode === 'update' ? '修改' : '新增'
    },
    roleArray () {
      return this.formItem.roleIdList ? this.formItem.roleIdList[0] : ''
    },
    deptName () {
      for (let item of this.deptList) {
        if (item.deptId === this.formItem.deptId) {
          return item.name
        }
      }
    },
    statusSwitch () {
      return this.formItem.status === 1
    }
  },
  methods: {
    /**
     * 查询用户列表，带条件
     */
    async queryUserList () {
      const res = await httpUtil.getRequest('/sys/user/list', {username: this.q})
      console.log(res)
      this.tableData = res.data
    },
    /**
     * 点击编辑按钮
     */
    async show (index) {
      this.modalMode = 'update'
      let res = await httpUtil.getRequest('/sys/user/info/' + this.tableData[index].userId)
      console.log(res)
      this.formItem = res.user

      // 部门树
      this.deptList = await httpUtil.getRequest('/sys/dept/list')
      this.deptTree = getTreeFromPlainArray(this.deptList, 'deptId', 'parentId', true)

      // 角色列表
      let res2 = await httpUtil.getRequest('/sys/role/select')
      this.roleList = res2.list

      this.modalVisable = true
    },
    /**
     * 点击删除按钮
     */
    async remove (index) {
      let res = await httpUtil.postRequest('/sys/user/delete', [this.tableData[index].userId])
      if (res.code === 0) {
        this.queryUserList()
        this.$Message.success('删除成功')
      } else {
        this.$Message.error('删除失败')
      }
    },
    /**
     * 点击新增按钮
     */
    async add () {
      this.modalMode = 'new'
      this.formItem = {deptId: ''} // 一定要加个初始值，不然在新增的情况下，计算属性deptName不会触发

      // 部门树
      this.deptList = await httpUtil.getRequest('/sys/dept/list')
      this.deptTree = getTreeFromPlainArray(this.deptList, 'deptId', 'parentId', true)

      // 角色列表
      let res2 = await httpUtil.getRequest('/sys/role/select')
      this.roleList = res2.list

      this.modalVisable = true
    },
    /**
     * 点击导出Excel按钮
     */
    exportExcel () {

    },
    /**
     * 分页相关：页码改变
     */
    handlePageChange (page) {
      this.tableCurrPage = page
      this.queryUserList()
    },
    /**
     * 分页相关：页大小改变
     */
    handlePageSizeChange (pageSize) {
      this.tablePageSize = pageSize
      this.queryUserList()
    },
    /**
     * 新增/编辑模态框，点击确定
     */
    async modalOk () {
      console.log(this.formItem)
      let reqUrl = this.modalMode === 'update' ? '/sys/user/update' : '/sys/user/save'
      let res = await httpUtil.postRequest(reqUrl, this.formItem)
      console.log(res)
      if (res.code === 0) {
        this.queryUserList()
        this.$Message.success('操作成功')
      } else {
        this.$Message.error('操作失败')
      }
    },
    /**
     * 功能方法：根据后端返回的平级部门结构，得到树状结构，用于Tree组件
     */
    transToTree (orgsList) {
      let tree = {}
      console.log('start')
      for (let org of orgsList) {
        console.log(org)
        // 根据父节点名称，查找到父节点对象
        let parentNode = this.findParent(org.parentId, tree)
        console.log('找到父节点')
        console.log(parentNode)
        if (!parentNode) {
          tree = {
            title: org.name,
            deptId: org.deptId,
            selected: org.deptId === this.formItem.deptId,
            expand: true
          }
        } else {
          if (!Array.isArray(parentNode.children)) {
            parentNode.children = []
          }
          parentNode.children.push({
            title: org.name,
            deptId: org.deptId,
            selected: org.deptId === this.formItem.deptId,
            expand: true
          })
        }
      }
      console.log('end:...')
      console.log(tree)
      this.deptTree = [tree]
    },
    findParent (parentId, tree) {
      console.log('开始查找父节点')
      console.log(parentId)
      console.log(tree)
      let res = null
      if (tree.deptId && tree.deptId === parentId) {
        res = tree
      } else if (tree.children) {
        for (let child of tree.children) {
          let res2 = this.findParent(parentId, child)
          if (res2) {
            res = res2
            break
          }
        }
      }
      return res
    },
    /**
     * 部门选择模态框，点击确定
     */
    deptModalOk () {
      const selected = this.$refs.deptTreeSelect.getSelectedNodes()
      this.formItem.deptId = selected[0].deptId
      console.log(this.formItem)
    },
    /**
     * 用户状态切换
     */
    statusChange () {
      if (!this.formItem.status || this.formItem.status === 0) {
        this.formItem.status = 1
      } else {
        this.formItem.status = 0
      }
    }
  },
  mounted () {
    this.queryUserList()
  }
}
</script>
