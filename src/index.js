import QuizApi from './lib/QuizApi'
import UserQuiz from './lib/UserQuiz'
import DOM from './lib/DOM'
import QuizView from './lib/QuizView'
import QuizCtrl from './lib/QuizCtrl'
import Question from './lib/Question'


var quiz = function (element, options) {
  QuizApi
    .setConfigUrl(options.url)
    .setResponseUrl(options.responsesUrl)
    .getConfig()
    .then(function (data) {
      var questions = data.questions.map(q => new Question(q))
      // console.log(questions)
      // console.log(data)
      var quizModel = new UserQuiz(questions).init()
      var quizView = new QuizView(data.title, questions)
      var quizCtrl = new QuizCtrl(quizModel, quizView)
      DOM.append(element, quizView.getElement())
    })
}

module.exports = quiz
