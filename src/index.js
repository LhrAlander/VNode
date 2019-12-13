import h from './scripts/h'
import render from './scripts/render'

function Child (props) {
  return h('div', null, props.txt)
}

class Comp {
  constructor() {
    this.txt = 'a'
  }

  mounted() {
    setTimeout(() => {
      this.txt = 'b'
      this._update()
    }, 2000)
  }

  render() {
    return h(Child, {
      txt: this.txt
    })
  }
}

render(h(Comp), document.querySelector('#app'))
