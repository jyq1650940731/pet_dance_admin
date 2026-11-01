/**
 * @param date - 时间
 * @param type - 格式化类型（'YYYY-MM-DD'、'YYYY年MM月DD日'）
 */
import emitter from './mitt.js'

export function formatDate(date) {
  var time = date;
  type = type || 'YYYY-MM-DD';
  time = dayjs(date).format(type);
  if (date == null || date == '' || date == undefined) {
    return '';
  } else {
    return time;
  }
}

// 核心：查找节点的直接父级 ID
export const findDirectParentId = (nodeId, treeData, key = 'children') => {
  // 递归遍历树形数据
  for (const node of treeData) {
    // 找到子节点包含目标 id 的节点，返回该节点 id
    if (node[key] && node[key].some(item => item.id === nodeId)) {
      return node.id;
    }
    // 递归查找子节点
    if (node[key]) {
      const parentId = findDirectParentId(nodeId, node[key]);
      if (parentId) return parentId;
    }
  }
  return undefined; // 无父级（根节点）返回 0 或 null
};

// 选中节点变化时获取父级 ID
export const handleTreeChange = (val) => {
  if (!val) return;
  // 获取直接父级 ID
  const parentId = findDirectParentId(Number(val), treeData.value);
  console.log("选中节点 ID：", val);
  console.log("直接父级 ID：", parentId);
};

export const getQueryVariable = (variable, urlSearch = window.location.search) => {
  const query = urlSearch.substring(1)
  const vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return ''
}

export const deleteWidget = (element, props) => {
  console.log({ element, props });
  
  const { id } = element
  const index = props.widgets.findIndex(item => item.id === id)
  if (index >= 0) {
    console.log(props.widgets);
    
    props.widgets.splice(index, 1)

    /** 更新panel */
    try {
      emitter.emit('deleteSetCurrentWidget')

      const pid = id.split('-')[0]
      const pIndex = props.panel.findIndex(item => item.id === pid)
      const cIndex = props.panel[pIndex].children.findIndex(item => item.id === id)

      props.panel[pIndex].children[cIndex].currentCount--
    } catch {}
  }
}
