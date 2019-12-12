import mount, {domPropsRE} from '../mount'
import {VNodeFlags} from './flags'

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