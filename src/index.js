import h from './scripts/h'
import render from './scripts/render'

function click() {
  console.log('hello world')
}

const node = h('div', {
  style: {
    width: '100px',
    height: '100px',
    background: 'red'
  },
  onclick: click
})

render(node, document.querySelector('#app'))
