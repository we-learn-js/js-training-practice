import EventEmitter from 'events'
import DOM from './DOM'
import ProgressView from './ProgressView'
import QuestionView from './QuestionView'

function createTitleElement (title) {
  return DOM.createDomElement('<h1 class="ui header">' + title + '</h1>')
}

/**
 * Builds and manages the view of the quiz
 */
class QuizView extends EventEmitter {

  get SUBMIT_EVENT () { return 'submit' }
  get RESET_EVENT () { return 'reset' }

  /**
   * @param  {Question[]} questions[]
   */
  constructor (title, questions) {
    super()
    this._questions = questions.map(q => new QuestionView(q))
    this._element = DOM.createDomElement('<form class="ui form"></form>')
    this._progress = new ProgressView()
    this._submitBtn = DOM.createDomElement('<button id="quiz-submit" class="ui primary button">Submit response</button>')
    this._resetBtn = DOM.createDomElement('<button class="ui button negative">Reset</button>')
    this._message = DOM.createDomElement('<div>Thank you for your responses.<br /><br /> </div>')

    DOM.append(this._element, createTitleElement(title))
    DOM.append(document.body, this._progress.getElement())
    this._questions.forEach((q) => {
      DOM.append(this._element, q.getElement())
    })

    DOM.click(this._resetBtn, (event) => {
      event.preventDefault()
      this.emit(this.RESET_EVENT)
    })
    DOM.click(this._submitBtn, (event) => {
      event.preventDefault()
      this.emit(this.SUBMIT_EVENT)
    })
    DOM.append(this._element, this._message, this._submitBtn, this._resetBtn)
  }

  /**
   * Shows given question
   * @param  {Number} index
   */
  showQuestion (index) {
    this._questions.forEach(function (question, i) {
      if (i === index) {
        question.show()
      } else {
        question.hide()
      }
    })
  }

  /**
   * Get response if a question
   * @param  {Number} index
   * @return {String|Array}
   */
  getResponse (index) {
    return this._questions[index].getResponse()
  }

  /**
   * Get HTMLElement for the given quiz
   * @return {HTMLElement} Element to add to DOM
   */
  getElement () {
    return this._element
  }

  /**
   * Set the progress of the quiz in the view
   * If the percentage is 1, it should display an ending message
   * @param {Number} percentage
   */
  setProgress (percentage) {
    this._progress.setValue(percentage * 100)
    if (percentage < 1) {
      DOM.css(this._submitBtn, 'display', '')
      DOM.css(this._message, 'display', 'none')
    } else {
      DOM.css(this._message, 'display', '')
      DOM.css(this._submitBtn, 'display', 'none')
    }
  }
}

export default QuizView
