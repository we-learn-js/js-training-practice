const QUESTION_CLASS = 'quiz-question'

const PROGRESS_ID = 'quiz-progress'

const SUBMIT_ID = 'quiz-submit'

export default class QuizNav {

  constructor (userQuiz, element) {
    this.__quiz__ = userQuiz
    this.__element__ = element
    this.__questions__ = this.__element__.getElementsByClassName(QUESTION_CLASS)
    this.__progress__ = document.getElementById(PROGRESS_ID)
  }

  update () {
    var responseCount = this.__quiz__.responseCount
    var isComplete = (this.__questions__.length === responseCount)
    showCurrentQuestion(this.__questions__, this.__quiz__.currentQuestion)
    this.__progress__.style.width = (responseCount / this.__questions__.length * 100) + '%'
    isComplete && ( showTextEndMessage(this.__element__))
  }
}

function showElement (element, show) {
  var display = show ? 'block' : 'none'
  $(element).css('display', display)
}

function showCurrentQuestion (questions, current) {
  showElement(questions[current - 1], false)
  showElement(questions[current], true)
}

function showTextEndMessage (element) {
  showElement(document.getElementById(SUBMIT_ID), false)
  $(element)
    .append('<div>Thank you for your responses.<br /><br /> </div>')
    .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
}
