import h from './scripts/h'
import render from './scripts/render'

const old = h('ul', null, [
  h('li', null, '1'),
  h('li', null, '2'),
  h('li', null, '3')
])

const newEl = h('ul', null, [
  h('li', null, '2'),
  h('div', null, '3'),
  h('li', null, '1')
])

render(old, document.querySelector('#app'))
setTimeout(() => {
  console.log('rerender')
  render(newEl, document.querySelector('#app'))
}, 2000)
