import h from './scripts/h'
import render from './scripts/render'

class MyComponent {
  constructor() {
    this.txt = 'a'
  }


  render() {
    return h(Child)
  }
}

class Child {
  render () {
    return h('div', null, 'child')
  }
}

render(h(MyComponent), document.querySelector('#app'))
