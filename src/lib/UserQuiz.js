import QuizApi from './QuizApi'
import Question from './Question'

function createQuestions (questions) {
  return questions.map( function(question, i){
    return new Question(i, question)
  })
}

export default class UserQuiz {

  constructor (questions) {
    this.__questions__ = createQuestions(questions)
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

  getQuestion(questionIndex) {
    return this.__questions__[questionIndex]
  }

}
