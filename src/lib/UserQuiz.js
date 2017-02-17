import Question from './Question'
import EventEmitter from 'events'

/**
 * The model of the quiz.
 * It stores responses and return them when requested
 * Observable
 */
export default class UserQuiz extends EventEmitter {

  get PROGRESS_EVENT () { return 'progress' }

  /**
   * @param  {Question[]} questions
   */
  constructor (questions) {
    super()
    this.__questions__ = questions;

  }

  /**
   * Gets info from the storage to set the quiz state to a stored one
   * @return {UserQuiz} this
   */
  init () {
    var storedData = localStorage.getItem('quiz') || '{}';
    storedData = JSON.parse(storedData);
    var {responses=[], currentQuestion=0, responseCount=0 } = storedData;
    this.responses = responses;
    this.currentQuestion = currentQuestion;
    this.responseCount = responseCount;
  }

  /**
   * Add response of the user.
   * Emits a progress event
   * @param {Numver} questionIndex
   * @param {String|Array} response
   */
  addResponse (questionIndex, response) {
    this.responses[questionIndex] = response;
    this.responseCount++;
    this.currentQuestion++;
  }

  /**
   * Stored quiz state
   */
  save () {
    var quizData = Object.assign({}, {
      responses: this.responses,
      responseCount: this.responseCount,
      currentQuestion: this.currentQuestion
    })
    localStorage.setItem('quiz', JSON.stringify(quizData));
  }

  /**
   * Reset the quiz
   * Emits a progress event
   */
  reset () {
    localStorage.removeItem('quiz');
    this.init();
  }

  /**
   * Get current progress of the quiz
   * @return {Number} Between 0 and 1
   */
  getProgress () {
    return this.responses / this.__questions__.length * 100;
  }

  /**
   * Returns a question of the quiz
   * @param  {Number} questionIndex
 * @return {Question}
   */
  getQuestion (questionIndex) {
    return this.__questions__[questionIndex];
  }
}
