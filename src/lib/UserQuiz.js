import QuizApi from './QuizApi'

export default class UserQuiz {
  constructor (questions) {
    this.questions = questions
  }
  init () {
    var storedData = localStorage.getItem('quiz') || '{}'
    storedData = JSON.parse(storedData)
    var {responses=[], currentQuestion=0, responseCount=0 } = storedData
    Object.assign(this, {responses, currentQuestion, responseCount})
    return this
  }

  save () {
    var { responses, currentQuestion, responseCount } = this
    var data = { responses, currentQuestion, responseCount }
    localStorage.setItem('quiz', JSON.stringify(data))
  }

  addResponse (questionIndex, response) {
    this.responses[questionIndex] = response
    this.responseCount++
    this.currentQuestion++
  }

  isResponseCorrect (questionIndex, response) {
    return QuizApi.getResponse(questionIndex)
      .then(UserQuiz.serializeResponse)
      .then(function(correctResponse) {
        return {
          ok: correctResponse == UserQuiz.serializeResponse(response),
          correctResponse: correctResponse
        }
      } )
  }

  static serializeResponse (response) {
    return (response.join && response.sort().join(', ')) || response
  }
}
