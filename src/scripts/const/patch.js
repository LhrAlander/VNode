import mount, {domPropsRE} from '../mount'
import {ChildrenFlags, VNodeFlags} from './flags'

function replaceVNode(preVNode, nextVNode, container) {
  container.removeChild(preVNode.el)
  mount(nextVNode, container)
}

export function patchData(el, key, preValue, nextValue) {
  switch (key) {
    case 'style':
      for (let k in nextValue) {
        el.style[k] = nextValue[k]
      }
      for (let k in preValue) {
        if (!nextValue.hasOwnProperty(k)) {
          el.style[k] = ''
        }
      }
      break
    case 'class':
      el.className = nextValue
      break
    default:
      if (key.startsWith('on')) {
        if (preValue) {
          el.removeEventListener(key.slice(2), preValue)
        }
        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue)
        }
      } else if (domPropsRE.test(key)) {
        el[key] = nextValue
      } else {
        el.setAttribute(key, nextValue)
      }
      break
  }
}

function patchChildren(preChildFlags, nextChildFlags, preChildren, nextChildren, container) {
  switch (preChildFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          patch(preChildren, nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          container.removeChild(preChildren.el)
          break
        default:
          container.removeChild(preChildren.el)
          for (let i = 0, l = nextChildren.length; i < l; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    case ChildrenFlags.NO_CHILDREN:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          mount(nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          break
        default:
          for (let i = 0, l = nextChildren.length; i < l; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    default:
      switch (nextChildFlags) {
        case ChildrenFlags.NO_CHILDREN:
          for (let i = 0, l = preChildren.length; i < l; i++) {
            container.removeChild(preChildren[i].el)
          }
          break
        case ChildrenFlags.SINGLE_VNODE:
          for (let i = 0, l = preChildren.length; i < l; i++) {
            container.removeChild(preChildren[i].el)
          }
          mount(nextChildren, container)
          break
        default:
          for (let i = 0, l = preChildren.length; i < l; i++) {
            container.removeChild(preChildren[i].el)
          }
          for (let i = 0, l = nextChildren.length; i < l; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
  }
}

function patchElement(preVNode, nextVNode, container) {
  if (preVNode.tag !== nextVNode.tag) {
    replaceVNode(preVNode, nextVNode, container)
    return
  }

  const el = (nextVNode.el = preVNode.el)
  const preData = preVNode.data
  const nextData = nextVNode.data
  if (nextData) {
    for (let key in nextData) {
      const preValue = preData[key]
      const nextValue = nextData[key]
      patchData(el, key, preValue, nextValue)
    }
  }
  if (preData) {
    for (let key in preData) {
      const preValue = preData[key]
      if (preValue && !nextData.hasOwnProperty(key)) {
        patchData(el, key, preValue, null)
      }
    }
  }
  patchChildren(
    preVNode.childFlags,
    nextVNode.childFlags,
    preVNode.children,
    nextVNode.children,
    el
  )
}

export default function patch(preVNode, nextVNode, container) {
  const prevFlags = preVNode.flags
  const nextFlags = nextVNode.flags
  if (prevFlags !== nextFlags) {
    replaceVNode(preVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.ELEMENT) {
    patchElement(preVNode, nextVNode, container)
  }
}