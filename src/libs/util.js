import Cookies from 'js-cookie'
// cookie保存的天数
import config from '@/config'
import { forEach, hasOneOf } from '@/libs/tools'

export const TOKEN_KEY = 'token'

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token, {expires: config.cookieExpires || 1})
}

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}

export const hasChild = (item) => {
  return item.children && item.children.length !== 0
}

const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    if (hasOneOf(item.meta.access, access)) return true
    else return false
  } else return true
}
/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
  let res = []
  forEach(list, item => {
    if (item.meta && !item.meta.hideInMenu) {
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta
      }
      if (hasChild(item) && showThisMenuEle(item, access)) {
        obj.children = getMenuByRouter(item.children, access)
      }
      if (item.meta.href) obj.href = item.meta.href
      if (showThisMenuEle(item, access)) res.push(obj)
    }
  })
  return res
}

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = (routeMetched) => {
  let res = routeMetched.filter(item => {
    return item.meta === undefined || !item.meta.hide
  }).map(item => {
    let obj = {
      icon: (item.meta && item.meta.icon) || '',
      name: item.name,
      meta: item.meta
    }
    return obj
  })
  res = res.filter(item => {
    return !item.meta.hideInMenu
  })
  return [{
    name: 'home',
    to: '/home'
  }, ...res]
}

export const showTitle = (item, vm) => vm.$config.useI18n ? vm.$t(item.name) : ((item.meta && item.meta.title) || item.name)

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  localStorage.tagNaveList = JSON.stringify(list)
}
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = localStorage.tagNaveList
  return list ? JSON.parse(list) : []
}

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = routers => {
  let i = -1
  let len = routers.length
  let homeRoute = {}
  while (++i < len) {
    let item = routers[i]
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children)
      if (res.name) return res
    } else {
      if (item.name === 'home') homeRoute = item
    }
  }
  return homeRoute
}

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const { name, path, meta } = newRoute
  let newList = [...list]
  if (newList.findIndex(item => item.name === name) >= 0) return newList
  else newList.push({ name, path, meta })
  return newList
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  if (route.meta && route.meta.access) return hasOneOf(access, route.meta.access)
  else return true
}

/**
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const getHasAccessRouteNames = (list) => {
    let res = []
    list.forEach(item => {
      if (item.children && item.children.length) {
        res = [].concat(res, getHasAccessRouteNames(item.children))
      } else {
        if (item.meta && item.meta.access) {
          if (hasAccess(access, item)) res.push(item.name)
        } else {
          res.push(item.name)
        }
      }
    })
    return res
  }
  const canTurnToNames = getHasAccessRouteNames(routes)
  return canTurnToNames.indexOf(name) > -1
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split('?')[1].split('&')
  let paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextName = (list, name) => {
  let res = ''
  if (list.length === 2) {
    res = 'home'
  } else {
    if (list.findIndex(item => item.name === name) === list.length - 1) res = list[list.length - 2].name
    else res = list[list.findIndex(item => item.name === name) + 1].name
  }
  return res
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
  let i = -1
  while (++i < times) {
    callback()
  }
}

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = (file) => {
  let nameSplit = file.name.split('.')
  let format = nameSplit[nameSplit.length - 1]
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsText(file) // 以文本格式读取
    let arr = []
    reader.onload = function (evt) {
      let data = evt.target.result // 读到的数据
      let pasteData = data.trim()
      arr = pasteData.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(row => {
        return row.split('\t')
      }).map(item => {
        return item[0].split(',')
      })
      if (format === 'csv') resolve(arr)
      else reject(new Error('[Format Error]:你上传的不是Csv文件'))
    }
  })
}

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = (array) => {
  let columns = []
  let tableData = []
  if (array.length > 1) {
    let titles = array.shift()
    columns = titles.map(item => {
      return {
        title: item,
        key: item
      }
    })
    tableData = array.map(item => {
      let res = {}
      item.forEach((col, i) => {
        res[titles[i]] = col
      })
      return res
    })
  }
  return {
    columns,
    tableData
  }
}

export const findNodeUpper = (ele, tag) => {
  if (ele.parentNode) {
    if (ele.parentNode.tagName === tag.toUpperCase()) {
      return ele.parentNode
    } else {
      return findNodeUpper(ele.parentNode, tag)
    }
  }
}

export const findNodeDownward = (ele, tag) => {
  const tagName = tag.toUpperCase()
  if (ele.childNodes.length) {
    let i = -1
    let len = ele.childNodes.length
    while (++i < len) {
      let child = ele.childNodes[i]
      if (child.tagName === tagName) return child
      else return findNodeDownward(child, tag)
    }
  }
}

export const showByAccess = (access, canViewAccess) => {
  return hasOneOf(canViewAccess, access)
}

/**
 * 写localStorage
 */
export const setLocalStorage = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

/**
 * 读localStorage
 */
export const getLocalStorage = name => {
  if (!name) return
  let result = window.localStorage.getItem(name)
  if (result) {
    result = JSON.parse(result)
  }
  return result
}

/**
 * 从平级的列表（元素须带当前id与父id）得到iView的Tree组件所需的数据结构
 * origList：平级列表
 * currIdKey：当前id的键名
 * parentIdKay：父id的键名
 * isSubExpand: 子层是否展开
 * checkedIdList: 需要标记为checked的id列表
 * selectedIdList: 需要标记为selected的id列表
 */
export const getTreeFromPlainArray = (origList, currIdKey, parentIdKey, isSubExpand = false, checkedIdList = null, selectedIdList = null) => {
  let currIdList = origList.map(item => item[currIdKey])
  let parentIdList = origList.map(item => item[parentIdKey])
  currIdList = Array.from(new Set(currIdList)) // 去重
  parentIdList = Array.from(new Set(parentIdList)) // 去重

  // 找到根的id是多少
  const rootIdList = parentIdList.filter(item => currIdList.indexOf(item) < 0)

  // 找出根元素
  let rootElemList = origList.filter(item => rootIdList.indexOf(item[parentIdKey]) >= 0)
  rootElemList.sort((item1, item2) => item1.orderNum - item2.orderNum)

  // 创建Tree的根层节点
  let tree = rootElemList.map((item) => {
    let treeItem = JSON.parse(JSON.stringify(item)) // Object.assign(item)
    treeItem.title = item.name
    treeItem.expand = true // 根层总是展开的
    // 注：父层不需要判断是否checked，因为子层有checked的话，父层会有indeterminate状态
    // if (Array.isArray(checkedIdList) && checkedIdList.length > 0 && checkedIdList.indexOf(item[currIdKey]) >= 0) {
    //   console.log(item.menuId)
    //   treeItem.checked = true
    // }
    // 判断是否被selected
    if (Array.isArray(selectedIdList) && selectedIdList.length > 0 && selectedIdList.indexOf(item[currIdKey]) >= 0) {
      treeItem.selected = true
    }
    return treeItem
  })

  // 遍历创建Tree的子层节点
  for (let parentElem of tree) {
    createSubElem(parentElem, origList, currIdKey, parentIdKey, isSubExpand, checkedIdList, selectedIdList)
  }
  return tree
}

function createSubElem (parentElem, origList, currIdKey, parentIdKey, isSubExpand, checkedIdList, selectedIdList) {
  let subList = origList.filter(item => item[parentIdKey] === parentElem[currIdKey])
  if (subList.length === 0) {
    return
  }
  subList.sort((item1, item2) => item1.orderNum - item2.orderNum)

  parentElem.children = subList.map((item) => {
    let treeItem = JSON.parse(JSON.stringify(item)) // Object.assign(item)
    treeItem.title = item.name
    treeItem.expand = isSubExpand
    // 注：这里只适用于菜单(按钮)的场景，type=2是按钮类型
    if (item.type === 2 && Array.isArray(checkedIdList) && checkedIdList.indexOf(item[currIdKey]) >= 0) {
      treeItem.checked = true
    }
    if (Array.isArray(selectedIdList) && selectedIdList.length > 0 && selectedIdList.indexOf(item[currIdKey]) >= 0) {
      treeItem.selected = true
    }
    return treeItem
  })
  for (let child of parentElem.children) {
    createSubElem(child, origList, currIdKey, parentIdKey, isSubExpand, checkedIdList)
  }
}
