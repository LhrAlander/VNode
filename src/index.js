import h from './scripts/h'
import render from './scripts/render'

const node = h('div', {
  style: {
    height: '100px',
    width: '100px',
    background: 'red'
  }
}, h('div', {
  style: {
    width: '45px',
    height: '45px',
    background: 'green'
  }
}))

render(node, document.querySelector('#app'))
