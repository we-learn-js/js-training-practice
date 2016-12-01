export default class QuizNav {
  static createProgressElement() {
      return $('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
  }

  static showTextEndMessage () {
    $('#submit-response').css('display', 'none')
    $(element)
    .append('<div>Thank you for your responses.<br /><br /> </div>')
    .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  static getFieldId (idx) {
    return 'question-' + idx
  }

  static showQuestion (idx, show) {
    var display = show ? 'block' : 'none'
    $('#' + QuizNav.getFieldId(idx)).css('display', display)
  }

  static showCurrentQuestion (current) {
    QuizNav.showQuestion(current - 1, false)
    QuizNav.showQuestion(current, true)
  }

  static updateProgressBar (questions, responses) {
    $('#progress').css('width', (responses / questions * 100) + '%')
  }

  static updateQuizStatus (questions, responseCount) {
    QuizNav.showCurrentQuestion(responseCount)
    QuizNav.updateProgressBar(questions.length, responseCount)

    questions.length === responseCount && QuizNav.showTextEndMessage()
  }
}
