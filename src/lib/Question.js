/**
 * Strategy Pattern
 * Responsible for question info and validation
 */
class Question {
    /**
     * @param  {Object} props Properties of the question
     */
    constructor(props) {}

    /**
     * Get statement of the question
     * @return {String}
     */
    getStatement() {}

    /**
     * Validate is response is correct for the question
     * @param  {String|Array} response
     * @return {Promise}
     */
    isResponseCorrect(response) {}

    /**
     * Get is response if empty
     * @param  {String|Array} response
     * @return {Boolean}
     */
    isResponseEmpty(response) {}
}

/*import QuizApi from './QuizApi'

export default class Question {

  static serializeResponse (response) {
    return (response.join && response.sort().join(', ')) || response
  }

  static isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }

  constructor (id, {problem, input} = {}) {
    this.__id__ = id
    this.__problem__ = problem
    this.__type__ = input && input.type
  }

  isResponseCorrect (response) {
    return QuizApi.getResponse(this.__id__)
      .then(Question.serializeResponse)
      .then(function(correctResponse) {
        return {
          ok: correctResponse == Question.serializeResponse(response),
          correctResponse: correctResponse
        }
      } )
  }
}
*/