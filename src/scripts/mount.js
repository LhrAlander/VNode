import {ChildrenFlags, VNodeFlags} from './const/flags'
import {createTextVNode} from './h'
import patch, {patchData} from './patch'

export const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/

function mountElement(vnode, container, isSvg) {
  isSvg = isSvg || (vnode.flags & VNodeFlags.ELEMENT_SVG)
  const el = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag)
  vnode.el = el
  const data = vnode.data
  if (data) {
    for (let key in data) {
      patchData(el, key, null, data[key])
    }
  }

  const {children, childFlags} = vnode
  if (childFlags !== ChildrenFlags.NO_CHILDREN) {
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
      mount(children, el, isSvg)
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
      for (let i = 0, l = children.length; i < l; i++) {
        mount(children[i], el, isSvg)
      }
    }
  }

  container.appendChild(el)
}

function mountStatefulComponent(vnode, container, isSvg) {
  const instance = (vnode.children = new vnode.tag())
  instance.$props = vnode.data
  instance._update = function () {
    if (instance._mounted) {
      const preVNode = instance.$vnode
      const nextVNode = (instance.$vnode = instance.render())
      patch(preVNode, nextVNode, container)
      instance.$el = vnode.el = instance.$vnode.el
    } else {
      instance.$vnode = instance.render()
      mount(instance.$vnode, container)
      instance._mounted = true
      instance.$el = container.el = instance.$vnode.el
      instance.mounted && instance.mounted()
    }
  }
  instance._update()
}

function mountFunctionalComponent(vnode, container, isSvg) {
  vnode.handle = {
    container,
    prev: null,
    next: vnode,
    update: () => {
      if (vnode.handle.prev) {
        const preVNode = vnode.handle.prev
        const nextVNode = vnode.handle.next
        const props = nextVNode.data
        const $preVNode = preVNode.children
        const $nextVNode = (nextVNode.children = nextVNode.tag(props))
        patch($preVNode, $nextVNode, vnode.handle.container)
      } else {
        const props = vnode.data
        const $vnode = (vnode.children = vnode.tag(props))
        mount($vnode, container, isSvg)
        vnode.el = $vnode.el
      }
    }
  }
  vnode.handle.update()

}

function mountComponent(vnode, container, isSvg) {
  if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSvg)
  } else {
    mountFunctionalComponent(vnode, container, isSvg)
  }
}

export function mountText(vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.appendChild(el)
}

function mountFragment(vnode, container, isSvg) {
  const {children, childFlags} = vnode
  switch (childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      mount(children, container, isSvg)
      vnode.el = children.el
      break
    case ChildrenFlags.NO_CHILDREN:
      const textEl = createTextVNode('')
      mountText(textEl, container)
      vnode.el = textEl.el
      break
    default:
      for (let i = 0, l = children.length; i < l; i++) {
        mount(children[i], container, isSvg)
      }
      vnode.el = children[i].el
      break
  }
}

function mountPortal(vnode, container) {
  const {tag, children, childFlags} = vnode
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, target)
  } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
    for (let i = 0, l = children.length; i < l; i++) {
      mount(children[i], target)
    }
  }
  const textEl = createTextVNode('')
  mountText(textEl, container)
  vnode.el = textEl.el
}

export default function mount(vnode, container, isSvg) {
  const {flags} = vnode
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container, isSvg)
  } else if (flags & VNodeFlags.COMPONENT) {
    mountComponent(vnode, container)
  } else if (flags & VNodeFlags.TEXT) {
    mountText(vnode, container)
  } else if (flags & VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container, isSvg)
  } else if (flags & VNodeFlags.PORTAL) {
    mountPortal(vnode, container)
  }
}

