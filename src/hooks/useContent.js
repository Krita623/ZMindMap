import { useMapStore } from '@/store/map'
const store = useMapStore()
export async function addNode (pid, cid = null) {
  const content = store.content
  const node = content[pid]
  if (!node) return
  const id = `${pid}-${node.children.length}`
  if (!cid) {
    // 添加孩子 => 添加到第一个
    node.children.splice(0, 0, id)
  } else {
    // 添加兄弟 => 添加到当前位置的下一个
    const index = node.children.indexOf(cid)
    node.children.splice(index + 1, 0, id)
  }
  const child = {
    html: '新节点',
    id,
    children: [],
    _children: [],
    parent: pid,
    collapsed: false
  }
  content[id] = child
  await store.setContent(content)
  return id
}

export async function deleteNode (id, list = undefined) {
  // 更新其父节点的信息
  const content = store.content
  const p = content[content[id].parent]
  // 没有父节点 => 是根节点 => 根节点不能被删除
  if (!p) return
  p.children = p.children.filter(v => v !== id)
  // 删除此节点和其所有后代
  const queue = [id]
  while (queue.length) {
    const front = queue.shift()
    queue.push(...content[front].children)
    delete content[front]
  }
  await store.setContent(content)
  // list==undefined => 是在map中删除 不需要定位焦点
  if (!list) return
  // 返回上一个ID
  let prevId
  // 删除的是第一个节点 焦点将给到第二个节点
  if (list[0].id === id) {
    prevId = list[1].id
  } else {
    for (const index in list) {
      if (list[index].id === id) {
        prevId = list[index - 1].id
        break
      }
    }
  }
  return prevId
}
export async function collapse (id) {
  const content = store.content
  const node = content[id]
  ;[node.children, node._children] = [node._children, node.children]
  await store.setContent(content)
}

export function moveToLastFocus (id) {
  // 把光标移到文字最后面
  const $el = document.getElementById(id)
  const range = document.createRange()
  range.selectNodeContents($el)
  range.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

export async function tabNode (id, noteList) {
  // TODO
  return id
}

export async function changeNodeHtml (id, html) {
  const content = store.content
  // ! 由于debounce 此事件可能发生在deleteNode之后 此id节点可能被删除 需要判空
  if (!content[id]) return
  content[id].html = html
  await store.setContent(content)
}
