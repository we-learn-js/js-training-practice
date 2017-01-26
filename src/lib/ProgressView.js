import DOM from './DOM'

/**
 * Representation of a progress bar
 */
class ProgressView {

  constructor () {
    this._element = DOM.createDomElement('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress-view" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
  }

  /**
   * Update progress bar depending on value
   * @param {Number} value Percentage of progress
   */
  setValue (value) {
    var progressElement = document.getElementById('progress-view')
    DOM.css(progressElement, 'width', value + '%')
  }

  /**
   * Get element of the progress bar
   * @return {HTMLElement}
   */
  getElement () { return this._element }
}

export default ProgressView
