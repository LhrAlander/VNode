import mount, {domPropsRE, mountText} from './mount'
import {ChildrenFlags, VNodeFlags} from './const/flags'
import {createTextVNode} from './h'
import {isNull} from './utils'

function replaceVNode(preVNode, nextVNode, container) {
  const refNode = preVNode.el.nextSibling
  container.removeChild(preVNode.el)
  if (preVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    const instance = preVNode.children
    instance.unmounted && instance.unmounted()
  }
  mount(nextVNode, container, false, refNode)
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
          let lastIndex = 0
          for (let i = 0, l = nextChildren.length; i < l; i++) {
            const nextVNode = nextChildren[i]
            let found = false
            for (let j = 0, l = preChildren.length; i < j; j++) {
              const preVNode = preChildren[j]
              if (nextVNode.key === preVNode.key) {
                found = true
                patch(preVNode, nextVNode, container)
                if (j < lastIndex) {
                  const refNode = nextChildren[j - 1].nextSibling
                  container.insertBefore(preVNode.el, refNode)
                } else {
                  lastIndex = j
                }
                break
              }
            }
            if (!found) {
              const refNode = i > 0 ? nextChildren[i - 1].el.nextSibling : null
              mount(nextVNode, container, false, refNode)
            }
          }
          for (let i = 0, l = preChildren.length; i < l; i++) {
            const preVNode = preChildren[i]
            const has = nextChildren.some(_ => _.key === preVNode.key)
            if (isNull(preVNode.key) || !has) {
              console.log('remove element', preVNode.el)
              container.removeChild(preVNode.el)
            }
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

function patchComponent(preVNode, nextVNode, container) {
  if (preVNode.tag !== nextVNode.tag) {
    replaceVNode(preVNode, nextVNode, container)
  } else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    const instance = (nextVNode.children = preVNode.children)
    instance.$props = nextVNode.data
    instance._update()
  } else {
    const handle = (nextVNode.handle = preVNode.handle)
    handle.container = container
    handle.prev = preVNode
    handle.next = nextVNode
    handle.update()
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
  } else if (nextFlags & VNodeFlags.COMPONENT) {
    patchComponent(preVNode, nextVNode, container)
  }
}