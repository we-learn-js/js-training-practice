/**
 * QuizNav converted to QuizCtrl
 * Observer of the quiz model
 */
class QuizCtrl {
  /**
   * @param  {UserQuiz} quiz
   */
  /**
   * [constructor description]
   * @param  {UserQuiz} quiz Quiz model
   * @param  {QuizView} view Quiz View
   */
  constructor (quiz, view) {
    this._model = quiz
    this._view = view

    this._model.on(this._model.PROGRESS_EVENT, this.update.bind(this))
    this._view.on(this._view.RESET_EVENT, this._model.reset.bind(this._model))
    this._view.on(this._view.SUBMIT_EVENT, () => {
      this.submitResponse(this._view.getResponse(this._current))
    })

    this.update()
  }

  /**
   * Updates quiz view depending on quiz model
   */
  update () {
    this._current = this._model.currentQuestion || 0
    this._view.showQuestion(this._current)
    this._view.setProgress(this._model.getProgress())
  }

  /**
   * Submit a response to the quiz
   * If response is empty, is displays a message
   * Otherwise, if sets the response.
   * @param  {String|Array} userResponse
   */
  submitResponse (userResponse) {
    if (!userResponse) {
      alert('You must give a response')
    } else {
      this.setResponse(userResponse)
    }
  }

  /**
   * Set response to the model and displays correct/incorrect message
   * @param  {String|Array} userResponse
   */
  setResponse (userResponse) {
    let question = this._model.getQuestion(this._current)
    this._model.addResponse(this._current, userResponse)
    this._model.save()
    question.isResponseCorrect(userResponse)
      .then((result) => {
        alert(result.ok
          ? 'Response is correct!'
          : 'Response is not correct! It was: ' + result.correctResponse
        )
      })
  }
}

export default QuizCtrl
