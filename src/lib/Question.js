/**
 * Strategy Pattern
 * Responsible for question info and validation
 */

import QuizApi from './QuizApi'

class QuestionValidationStrategy {
  selectResponseCorrectValidator (validator) {
    this._responseCorrectvalidator = validator;
  }
  selectIsResponseEmptyValidator (validator) {
    this._isResponseEmptyvalidator = validator;
  }

  isResponseCorrect(value) {
    this._responseCorrectvalidator.isResponseCorrect(value);
  }

  isResponseEmpty(value) {
    this._isResponseEmptyvalidator.isResponseEmpty(value);
  }
}

class Input extends InputValidationStrategy {
  setElement(DOMElement) {}
  getValue () {}
  setValue () {}
  /* ... */
}
class InputEmail {
  constructor () {
    super()
    this.selectValidator(emailValidator)
  }
}
class InputPhone {
  constructor () {
    super()
    this.selectValidator(phoneValidator)
  }
}

class Question extends QuestionValidationStrategy {

  static serializeResponse (response) {
    return (response.join && response.sort().join(', ')) || response
  }

  constructor (id, {problem, input} = {}) {
    this.__id__ = id
    this.__problem__ = problem
    this.__type__ = input && input.type
  }
}

const isResponseCorrectTextValidator = {
  isResponseCorrect (response) {
    return QuizApi.getResponse(this.__id__)
      .then(Question.serializeResponse)
      .then(function(correctResponse) {
        return {
          ok: correctResponse == Question.serializeResponse(response),
          correctResponse: correctResponse
        }
      })
}

const isResponseEmptyTextValidator = {
  isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }
}

const isResponseCorrectRadioValidator = {
  isResponseCorrect (response) {
    return QuizApi.getResponse(this.__id__)
      .then(Question.serializeResponse)
      .then(function(correctResponse) {
        return {
          ok: correctResponse == Question.serializeResponse(response),
          correctResponse: correctResponse
        }
      })
}

const isResponseEmptyRadioValidator = {
  isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }
}


const isResponseCorrectCheckboxValidator = {
  isResponseCorrect (response) {
    return QuizApi.getResponse(this.__id__)
      .then(Question.serializeResponse)
      .then(function(correctResponse) {
        return {
          ok: correctResponse == Question.serializeResponse(response),
          correctResponse: correctResponse
        }
      })
}

const isResponseEmptyCheckboxValidator = {
  isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }
}

class TextQuestion extends Question {
  this.selectResponseCorrectValidator(isResponseCorrectTextValidator);
  this.selectIsResponseEmptyValidator(isResponseEmptyTextValidator);
}

class RadioQuestion extends Question {
  this.selectResponseCorrectValidator(isResponseCorrectRadioValidator);
  this.selectIsResponseEmptyValidator(isResponseEmptyRadioValidator);
}

class CheckboxQuestion extends Question {
  this.selectResponseCorrectValidator(isResponseCorrectCheckboxValidator);
  this.selectIsResponseEmptyValidator(isResponseEmptyCheckboxValidator);
}

export { TextQuestion, RadioQuestion, CheckboxQuestion }
