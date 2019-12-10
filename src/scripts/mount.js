import {ChildrenFlags, VNodeFlags} from './const/flags'

function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag)
  vnode.el = el
  const data = vnode.data
  if (data) {
    for (let key in data) {
      switch(key) {
        case 'style':
          for (let k in data.style) {
            el.style[k] = data.style[k]
          }
          break;
      }
    }
  }

  const { children, childFlags } = vnode
  if (childFlags !== ChildrenFlags.NO_CHILDREN) {
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
      mount(children, el)
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
      for (let i = 0, l = children.length; i < l; i++) {
        mount(children[i], el)
      }
    }
  }

  container.appendChild(el)
}

function mountComponent(vnode, container) {

}

function mountText(vnode, container) {

}

function mountFragment(vnode, container) {

}

function mountPortal(vnode, container) {

}

export default function mount(vnode, container) {
  const { flags } = vnode
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container)
  } else if (flags & VNodeFlags.COMPONENT) {
    mountComponent(vnode, container)
  } else if (flags & VNodeFlags.TEXT) {
    mountText(vnode, container)
  } else if (flags & VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container)
  } else if (flags & VNodeFlags.PORTAL) {
    mountPortal(vnode, container)
  }
}

