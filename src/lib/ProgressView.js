import DOM from './DOM'

/**
 * Representation of a progress bar
 */
class ProgressView {

  constructor () {
    this._progressBar = DOM.createDomElement('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
  }

  /**
   * Update progress bar depending on value
   * @param {Number} value Percentage of progress
   */
  setValue (value) {
    DOM.css(this._progressBar, 'width', +value + '%')
  }

  /**
   * Get element of the progress bar
   * @return {HTMLElement}
   */
  getElement () { return this._element }
}

export default ProgressView
