<template>
  <Card>
    <Button type="success" @click="add()">新增</Button>
    <Button type="primary" @click="show()">修改</Button>
    <Button type="warning" @click="del()">删除</Button>
    <Tree ref="deptTree" :data="deptTree"></Tree>
    <Modal v-model="formModalVisable" :title="formModalTitle" @on-ok="formModalOk()" >
      <Form :model="formItem" :label-width="120">
          <FormItem label="部门名称">
            <Input v-model="formItem.name" placeholder="请输入"></Input>
          </FormItem>
          <FormItem label="上级部门">
            <Input v-model="formItem.parentName" placeholder="请选择上级部门" readonly @on-focus="deptModalVisable = true"></Input>
          </FormItem>
          <FormItem label="排序号">
            <Input v-model="formItem.orderNum" placeholder="排序号"></Input>
          </FormItem>
        </Form>
    </Modal>

    <Modal v-model="deptModalVisable" title="选择上级部门" @on-ok="deptModalOk()" >
      <Tree ref="deptSelectTree" :data="deptTreeForSelect"></Tree>
    </Modal>
  </Card>
</template>
<script>
import httpUtil from '@/libs/httpUtil'
import { getTreeFromPlainArray } from '@/libs/util'
export default {
  data () {
    return {
      deptTree: [],
      formModalMode: 'update', // 新增/编辑模式切换
      formModalVisable: false, // 新增/编辑用户模态框，是否可见
      formItem: {}, // 新增/编辑用户模态框，表单内容
      deptModalVisable: false, // 菜单选择模态框，是否可见
      deptTreeBak: [],
      deptTreeForSelect: []
    }
  },
  computed: {
    formModalTitle () {
      return this.formModalMode === 'update' ? '修改' : '新增'
    },
    parentDeptName () {
      return ''
    }
  },
  methods: {
    /**
     * 查询菜单列表
     */
    async query () {
      const res = await httpUtil.getRequest('/sys/dept/list')
      // console.log(res)
      this.deptTree = getTreeFromPlainArray(res, 'deptId', 'parentId', true)
      this.deptTreeBak = JSON.parse(JSON.stringify(this.deptTree)) // 复制一份，用于弹出模态框中，选择上一级菜单
      console.log(this.deptTreeBak)
    },
    /**
     * 点击新增按钮
     */
    async add () {
      this.formModalMode = 'new'
      this.formItem = {}
      this.deptTreeForSelect = JSON.parse(JSON.stringify(this.deptTreeBak)) // 从备份的菜单树重新复制一份
      this.formModalVisable = true
    },
    /**
     * 点击编辑按钮
     */
    async show () {
      const selected = this.$refs.deptTree.getSelectedNodes()
      if (!Array.isArray(selected) || selected.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      // const res = await httpUtil.getRequest("/sys/menu/info/" + selectedMenu[0].menuId)
      // console.log(res)
      this.formModalMode = 'update'
      this.formItem = selected[0]
      this.deptTreeForSelect = JSON.parse(JSON.stringify(this.deptTreeBak)) // 从备份的菜单树重新复制一份
      this.formModalVisable = true
    },
    /**
     * 点击删除按钮
     */
    async del () {
      const selected = this.$refs.deptTree.getSelectedNodes()
      if (!Array.isArray(selected) || selected.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      this.$Modal.confirm({
        title: '',
        content: '<p>确认删除吗？</p>',
        loading: true,
        onOk: async () => {
          const res = await httpUtil.getRequest('/sys/dept/delete', {deptId: selected[0].deptId})
          if (res.code === 0) {
            this.query()
            this.$Modal.remove()
            this.$Message.success('操作成功')
          }
        }
      })
    },
    /**
     * 新增/编辑模态框，点击确定
     */
    async formModalOk () {
      let reqUrl = this.formModalMode === 'update' ? '/sys/dept/update' : '/sys/dept/save'
      let res = await httpUtil.postRequest(reqUrl, this.formItem)
      console.log(res)
      if (res.code === 0) {
        this.query()
        this.$Message.success('操作成功')
      } else {
        this.$Message.error('操作失败')
      }
    },
    /**
     * 菜单选择模态框，点击确定
     */
    deptModalOk () {
      const selected = this.$refs.deptSelectTree.getSelectedNodes()
      if (!Array.isArray(selected) || selected.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      this.formItem.parentId = selected[0].deptId
      this.formItem.parentName = selected[0].name
    }
  },
  mounted () {
    this.query()
  }
}
</script>
