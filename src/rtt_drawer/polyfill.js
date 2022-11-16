/**
 * event.composedPath を Edge でも使えるようにする
 * 参考: https://gist.github.com/rockinghelvetica/00b9f7b5c97a16d3de75ba99192ff05c
 */
;((E, d, w) => {
  if (!E.composedPath) {
    // eslint-disable-next-line no-param-reassign
    E.composedPath = function composedPath() {
      if (this.path) {
        return this.path
      }
      let { target } = this

      this.path = []
      while (target.parentNode !== null) {
        this.path.push(target)
        target = target.parentNode
      }
      this.path.push(d, w)
      return this.path
    }
  }
})(Event.prototype, document, window)
