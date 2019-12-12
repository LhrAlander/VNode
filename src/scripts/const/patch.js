import mount, {domPropsRE, mountText} from '../mount'
import {ChildrenFlags, VNodeFlags} from './flags'
import {createTextVNode} from '../h'

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

function patchText(preVNode, nextVNode) {
  const el = (nextVNode.el = preVNode.el)
  if (preVNode.children !== nextVNode.children) {
    el.nodeValue = nextVNode.children
  }
}

function patchFragment(preVNode, nextVNode, container) {
  patchChildren(
    preVNode.childFlags,
    nextVNode.childFlags,
    preVNode.children,
    nextVNode.children,
    container
  )
  switch (nextVNode.childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el
      break
    case ChildrenFlags.NO_CHILDREN:
      const textEl = createTextVNode('')
      mountText(textEl, container)
      nextVNode.el = textEl.el
      break
    default:
      nextVNode.el = nextVNode.children[0].el
      break
  }
}

function patchPortal(preVNode, nextVNode) {
  const preContainer = typeof preVNode.tag === 'string' ? document.querySelector(preVNode.tag) : preVNode.tag
  const nextContainer = typeof nextVNode.tag === 'string' ? document.querySelector(nextVNode.tag) : nextVNode.tag
  patchChildren(
    preVNode.childFlags,
    nextVNode.childFlags,
    preVNode.children,
    nextVNode.children,
    preContainer
  )
  nextVNode.el = preVNode.el
  if (preContainer !== nextVNode) {
    switch (nextVNode.childFlags) {
      case ChildrenFlags.NO_CHILDREN:
        break
      case ChildrenFlags.SINGLE_VNODE:
        nextContainer.appendChild(nextVNode.children.el)
        break
      default:
        for (let i = 0, l = nextVNode.children.length; i < l; i++) {
          nextContainer.appendChild(nextVNode.children[i].el)
        }
        break
    }
  }
}

export default function patch(preVNode, nextVNode, container) {
  const prevFlags = preVNode.flags
  const nextFlags = nextVNode.flags
  if (prevFlags !== nextFlags) {
    replaceVNode(preVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.ELEMENT) {
    patchElement(preVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.TEXT) {
    patchText(preVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
    patchFragment(preVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.PORTAL) {
    patchPortal(preVNode, nextVNode)
  }
}