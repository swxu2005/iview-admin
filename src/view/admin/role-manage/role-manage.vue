<template>
  <Card>
    <Input v-model="q" placeholder="请输入角色名" clearable style="width: 200px"></Input>
    <Button type="success" @click="query()">查询</Button>
    <Button type="primary" @click="add()">新增</Button>

    <Table border :columns="columnsDef" :data="tableData"></Table>
    <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
            <Page :total="tableTotalCount" :current="tableCurrPage" size="small" show-total show-elevator show-sizer
              :page-size="tablePageSize" :page-size-opts="tablePageSizeOpts"
              @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange">
            </Page>
        </div>
    </div>

    <Modal v-model="editModalVisable" :title="editModalTitle" @on-ok="editModalOk()" >
      <Form :model="editModalForm" :label-width="80">
        <FormItem label="角色名称">
          <Input v-model="editModalForm.roleName" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem label="所属部门">
          <Input v-model="deptName" placeholder="请选择部门" readonly @on-focus="deptModalVisable = true"></Input>
        </FormItem>
        <FormItem label="备注">
          <Input v-model="editModalForm.remark" placeholder=""></Input>
        </FormItem>
      </Form>
      <myTree ref="menuSelectTree" :data="menuTree" show-checkbox></myTree>
    </Modal>

    <Modal v-model="deptModalVisable" title="选择部门" @on-ok="deptModalOk()" >
      <Tree ref="deptTreeSelect" :data="deptTree"></Tree>
    </Modal>
  </Card>
</template>

<script>
import httpUtil from '@/libs/httpUtil'
import { getTreeFromPlainArray } from '@/libs/util'
import myTree from '@/components/my-tree'
export default {
  components: { myTree },
  data () {
    return {
      q: '', // 查询条件
      tableData: [],
      columnsDef: [
        {
          title: '角色ID',
          key: 'roleId'
        },
        {
          title: '角色名称',
          key: 'roleName'
        },
        {
          title: '所属部门',
          key: 'deptName'
        },
        {
          title: '备注',
          key: 'remark'
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
                      this.edit(params.index)
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
      tableTotalCount: 0, // 表中总记录数
      tableCurrPage: 1, // 当前页码
      tablePageSize: 10, // 每页记录数
      tablePageSizeOpts: [10, 20, 30, 50], // 每页记录数，可选项

      editModalMode: 'update', // 新增/编辑模式切换
      editModalVisable: false, // 新增/编辑用户模态框，是否可见
      editModalForm: {},

      menuTree: [],
      deptModalVisable: false,
      deptTree: [],
      deptList: []
    }
  },
  computed: {
    editModalTitle () {
      return this.editModalMode === 'update' ? '修改' : '新增'
    },
    deptName () {
      for (let item of this.deptList) {
        if (item.deptId === this.editModalForm.deptId) {
          return item.name
        }
      }
    }
  },
  methods: {
    async query () {
      const res = await httpUtil.getRequest('/sys/role/list', {
        roleName: this.q,
        page: this.tableCurrPage,
        limit: this.tablePageSize
      })
      console.log(res)
      this.tableTotalCount = res.count
      this.tableData = res.data
    },
    async add () {
      this.editModalMode = 'new'
      this.editModalForm = {deptId: ''} // 一定要加个初始值，不然在新增的情况下，计算属性deptName不会触发

      // 菜单(按钮)树
      const res2 = await httpUtil.getRequest('/sys/menu/list')
      this.menuTree = getTreeFromPlainArray(res2, 'menuId', 'parentId', true, [])

      // 部门树
      this.deptList = await httpUtil.getRequest('/sys/dept/list')
      this.deptTree = getTreeFromPlainArray(this.deptList, 'deptId', 'parentId', true)

      this.editModalVisable = true
    },
    async edit (index) {
      this.editModalMode = 'update'
      let res = await httpUtil.getRequest('/sys/role/info/' + this.tableData[index].roleId)
      this.editModalForm = res.role

      // 菜单(按钮)树
      res = await httpUtil.getRequest('/sys/menu/list')
      // console.log(res.role.menuIdList)
      this.menuTree = getTreeFromPlainArray(res, 'menuId', 'parentId', true, this.editModalForm.menuIdList)

      // 部门树
      this.deptList = await httpUtil.getRequest('/sys/dept/list')
      this.deptTree = getTreeFromPlainArray(this.deptList, 'deptId', 'parentId', true, null, [this.editModalForm.deptId])

      this.editModalVisable = true
    },
    async remove (index) {
      this.$Modal.confirm({
        title: '',
        content: '<p>确认删除吗？</p>',
        loading: true,
        onOk: async () => {
          const res = await httpUtil.postRequest('/sys/role/delete', [this.tableData[index].roleId])
          if (res.code === 0) {
            this.query()
            this.$Modal.remove()
            this.$Message.success('删除成功')
          }
        }
      })
    },
    /**
     * 分页相关：页码改变
     */
    handlePageChange (page) {
      this.tableCurrPage = page
      this.query()
    },
    /**
     * 分页相关：页大小改变
     */
    handlePageSizeChange (pageSize) {
      this.tablePageSize = pageSize
      this.query()
    },
    async editModalOk () {
      let res = this.$refs.menuSelectTree.getCheckedAllNodes()
      console.log(res)
      //= === 修改菜单(按钮)，就是更新editModalForm.menuIdList
      let newMenuIdList = res.map(item => item.menuId)
      console.log(newMenuIdList)
      this.editModalForm.menuIdList = newMenuIdList
      // let parentMenuIdList = newMenuIdList.map(item => item.parentId)
      // parentMenuIdList = Array.from(new Set(parentMenuIdList))
      // console.log(parentMenuIdList)
      // let rootMenuIdList = parentMenuIdList

      //= === 修改数据权限，就是更新editModalForm.deptIdList
      // 若是新增角色，将其deptIdList置为[]；若是修改角色，不改变其deptIdList
      if (this.editModalMode === 'new') {
        this.editModalForm.deptIdList = []
      }

      //= === 发送请求
      let reqUrl = this.editModalMode === 'update' ? '/sys/role/update' : '/sys/role/save'
      res = await httpUtil.postRequest(reqUrl, this.editModalForm)
      if (res.code === 0) {
        this.query()
        this.$Message.success('操作成功')
      } else {
        this.$Message.error('操作失败')
      }
    },
    deptModalOk () {
      const selected = this.$refs.deptTreeSelect.getSelectedNodes()
      this.editModalForm.deptId = selected[0].deptId
      console.log(this.editModalForm)
    }
  },
  mounted () {
    this.query()
    // let nodeData = this.nodeData
    // console.log($("#uploadtree"))
    // $.fn.zTree.init($("#uploadtree"), this.setting, nodeData)
  }
}
</script>
