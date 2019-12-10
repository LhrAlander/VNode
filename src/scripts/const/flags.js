const VNodeFlags = {
  ELEMENT_HTML: 1,
  ELEMENT_SVG: 1 << 1,
  COMPONENT_STATEFUL_NORMAL: 1 << 2,
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  COMPONENT_STATEFUL_KEEP_ALIVE: 1 << 4,
  COMPONENT_FUNCTIONAL: 1 << 5,
  TEXT: 1 << 6,
  FRAGMENT: 1 << 7,
  PORTAL: 1 << 8
}

VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG
VNodeFlags.COMPONENT_STATEFUL =
  VNodeFlags.COMPONENT_STATEFUL |
  VNodeFlags.COMPONENT_STATEFUL_KEEP_ALIVE |
  VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE
VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL

const ChildrenFlags = {
  UNKNOWN_CHILDREN: 0,
  NO_CHILDREN: 1,
  SINGLE_VNODE: 1 << 1,
  KEYED_VNODES: 1 << 2,
  NONE_KEYED_VNODES: 1 << 3
}

ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES

const Fragment = Symbol('fragment')
const Portal = Symbol('portal')

export {
  ChildrenFlags,
  VNodeFlags,
  Fragment,
  Portal
}