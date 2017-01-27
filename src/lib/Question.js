/**
 * Strategy Pattern
 * Responsible for question info and validation
 */

import QuizApi from './QuizApi'

export default class Question extends QuestionValidationStrategy {

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

class QuestionValidationStrategy {
  selectValidator (validator) {
    this._validator = validator;
  }
  validate() {
    this._validator.validate(this.getValue());
  }
}

class Input extends QuestionValidationStrategy {
  setElement(DOMElement) {}
  getValue () {}
  setValue () {}
  /* ... */
}
class InputText extends Input {
  constructor () {
    super()
    this.selectValidator(inputValidator)
  }
}
class ChechBox extends Input {
  constructor () {
    super()
    this.selectValidator(checboxValidator)
  }
}

var inputValidator=function(){

}
var checboxValidator=function() {

}
