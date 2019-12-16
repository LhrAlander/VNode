import {ChildrenFlags, Fragment, Portal, VNodeFlags} from './const/flags'

function normalizeVNodes(children) {
  return children.map((node, index) => {
    node.key = node.key || null
    return node
  })
}

export function createTextVNode(text) {
  return {
    _isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    children: text,
    data: null,
    childFlags: ChildrenFlags.NO_CHILDREN,
    el: null
  }
}

function normalizeClass(classValue)
{
  let res = ''
  if (typeof classValue === 'string') {
    res = classValue
  } else if (Array.isArray(classValue)) {
    res = classValue.reduce((finalStr, currVal) => finalStr + ' ' + normalizeClass(currVal), '')
  } else if (typeof classValue === 'object') {
    for (let key in classValue) {
      if (classValue[key]) {
        res += ` ${key}`
      }
    }
  }
  return res.trim()
}

function h(tag, data = null, children = null) {
  let flags = null
  if (typeof tag === 'string') {
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML
    if (data && data.class) {
      data.class = normalizeClass(data.class)
    }
  } else if (tag === Fragment) {
    flags = VNodeFlags.FRAGMENT
  } else if (tag === Portal) {
    flags = VNodeFlags.PORTAL
    data = data && data.target
  } else if (tag !== null && typeof tag === 'object') {
    flags = tag.functional
      ? VNodeFlags.COMPONENT_FUNCTIONAL
      : VNodeFlags.COMPONENT_STATEFUL_NORMAL
  } else if (typeof tag === 'function') {
    flags = tag.prototype && tag.prototype.render
      ? VNodeFlags.COMPONENT_STATEFUL_NORMAL
      : VNodeFlags.COMPONENT_FUNCTIONAL
  }

  let childFlags
  if (Array.isArray(children)) {
    const {length} = children
    if (length === 0) {
      childFlags = ChildrenFlags.NO_CHILDREN
    } else if (length === 1) {
      childFlags = ChildrenFlags.SINGLE_VNODE
      children = children[0]
    } else {
      childFlags = ChildrenFlags.KEYED_VNODES
      children = normalizeVNodes(children)
    }
  } else if (children === null) {
    childFlags = ChildrenFlags.NO_CHILDREN
  } else if (children._isVNode) {
    childFlags = ChildrenFlags.SINGLE_VNODE
  } else {
    childFlags = ChildrenFlags.SINGLE_VNODE
    children = createTextVNode(children + '')
  }

  return {
    _isVNode: true,
    flags,
    tag,
    data,
    children,
    childFlags,
    el: null,
    key: data && data.key !== null && data.key !== undefined ? data.key : null
  }
}

export default h