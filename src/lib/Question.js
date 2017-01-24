/**
 * Strategy Pattern
 * Responsible for question info and validation
 */

import QuizApi from './QuizApi'

export default class Question {

  static serializeResponse (response) {
    debugger;
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
