/**
 * QuizNav converted to QuizCtrl
 * Observer of the quiz model
 */
class QuizCtrl {

  /**
   * [constructor description]
   * @param  {UserQuiz} quiz Quiz model
   * @param  {QuizView} view Quiz View
   */
  constructor (quiz, view) {
    this._quizModel = quiz;
    this._quizView = view;
  }

  /**
   * Updates quiz view depending on quiz model
   */
  update () {

  }

  /**
   * Submit a response to the quiz
   * If response is empty, is displays a message
   * Otherwise, if sets the response.
   * @param  {String|Array} userResponse
   */
  submitResponse (userResponse) {
    !!userResponse
      ? this.setResponse(userResponse)
      : alert('You must give a response')
  }

  /**
   * Set response to the model and displays correct/incorrect message
   * @param  {String|Array} userResponse
   */
  setResponse (userResponse) {

  }
}

export default QuizCtrl
