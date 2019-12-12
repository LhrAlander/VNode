import h from './scripts/h'
import render from './scripts/render'

const preVNode = h('div', {
  style: {
    height: '100px',
    width: '100px',
    background: 'red',
    color: '#fff'
  }
}, 'old node')

const nextVNode = h('div', {
  style: {
    height: '200px',
    width: '100px',
    background: 'green',
    border: '1px solid #ccc'
  }
})

render(preVNode, document.querySelector('#app'))
setTimeout(() => render(nextVNode, document.querySelector('#app')), 2000)
