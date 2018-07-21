<template>
  <Card>
    <Button type="success" @click="add()">新增</Button>
    <Button type="primary" @click="show()">修改</Button>
    <Button type="warning" @click="del()">删除</Button>
    <Tree ref="menuTree" :data="menuTree"></Tree>
    <Modal v-model="formModalVisable" :title="formModalTitle" @on-ok="formModalOk()" >
      <Form :model="formItem" :label-width="120">
          <FormItem label="类型">
            <RadioGroup v-model="formItem.type">
              <Radio :label="0">目录</Radio>
              <Radio :label="1">菜单</Radio>
              <Radio :label="2">按钮</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="菜单(按钮)名称">
            <Input v-model="formItem.name" placeholder="请输入"></Input>
          </FormItem>
          <FormItem label="上级菜单">
            <Input v-model="formItem.parentName" placeholder="请选择上级菜单" readonly @on-focus="menuModalVisable = true"></Input>
          </FormItem>
          <FormItem label="菜单URL">
            <Input v-model="formItem.url" placeholder="菜单URL"></Input>
          </FormItem>
          <FormItem label="授权标志">
            <Input v-model="formItem.perms" placeholder="授权标志"></Input>
          </FormItem>
          <FormItem label="排序号">
            <Input v-model="formItem.orderNum" placeholder="排序号"></Input>
          </FormItem>
          <FormItem label="图标">
            <Input v-model="formItem.icon" placeholder="图标"></Input>
          </FormItem>
        </Form>
    </Modal>

    <Modal v-model="menuModalVisable" title="选择上级菜单" @on-ok="menuModalOk()" >
      <Tree ref="menuSelectTree" :data="menuTreeForSelect"></Tree>
    </Modal>
  </Card>
</template>
<script>
import httpUtil from '@/libs/httpUtil'
import { getTreeFromPlainArray } from '@/libs/util'
export default {
  data () {
    return {
      menuTree: [],
      formModalMode: 'update', // 新增/编辑模式切换
      formModalVisable: false, // 新增/编辑用户模态框，是否可见
      formItem: {}, // 新增/编辑用户模态框，表单内容
      menuModalVisable: false, // 菜单选择模态框，是否可见
      menuTreeBak: [],
      menuTreeForSelect: []
    }
  },
  computed: {
    formModalTitle () {
      return this.formModalMode === 'update' ? '修改' : '新增'
    },
    parentMenuName () {
      return ''
    }
  },
  methods: {
    /**
     * 查询菜单列表
     */
    async queryMenuList () {
      const res = await httpUtil.getRequest('/sys/menu/list')
      // console.log(res)
      this.menuTree = getTreeFromPlainArray(res, 'menuId', 'parentId')
      this.menuTreeBak = JSON.parse(JSON.stringify(this.menuTree)) // 复制一份，用于弹出模态框中，选择上一级菜单
      console.log(this.menuTreeBak)
    },
    /**
     * 点击新增按钮
     */
    async add () {
      this.formModalMode = 'new'
      this.formItem = {}
      this.menuTreeForSelect = JSON.parse(JSON.stringify(this.menuTreeBak)) // 从备份的菜单树重新复制一份
      this.formModalVisable = true
    },
    /**
     * 点击编辑按钮
     */
    async show () {
      const selectedMenu = this.$refs.menuTree.getSelectedNodes()
      if (!Array.isArray(selectedMenu) || selectedMenu.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      // const res = await httpUtil.getRequest("/sys/menu/info/" + selectedMenu[0].menuId)
      // console.log(res)
      this.formModalMode = 'update'
      this.formItem = selectedMenu[0]
      this.menuTreeForSelect = JSON.parse(JSON.stringify(this.menuTreeBak)) // 从备份的菜单树重新复制一份
      this.formModalVisable = true
    },
    /**
     * 点击删除按钮
     */
    async del () {
      const selectedMenu = this.$refs.menuTree.getSelectedNodes()
      if (!Array.isArray(selectedMenu) || selectedMenu.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      this.$Modal.confirm({
        title: '',
        content: '<p>确认删除吗？</p>',
        loading: true,
        onOk: async () => {
          const res = await httpUtil.getRequest('/sys/menu/delete', {menuId: selectedMenu[0].menuId})
          if (res.code === 0) {
            this.queryMenuList()
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
      let reqUrl =
        this.formModalMode === 'update' ? '/sys/menu/update' : '/sys/menu/save'
      let res = await httpUtil.postRequest(reqUrl, this.formItem)
      console.log(res)
      if (res.code === 0) {
        this.queryMenuList()
        this.$Message.success('操作成功')
      } else {
        this.$Message.error('操作失败')
      }
    },
    /**
     * 菜单选择模态框，点击确定
     */
    menuModalOk () {
      const selectedMenu = this.$refs.menuSelectTree.getSelectedNodes()
      if (!Array.isArray(selectedMenu) || selectedMenu.length === 0) {
        this.$Message.error('请先选中一个菜单(或按钮)')
      }
      this.formItem.parentId = selectedMenu[0].menuId
      this.formItem.parentName = selectedMenu[0].name
    }
  },
  mounted () {
    this.queryMenuList()
  }
}
</script>
