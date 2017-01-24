import QuizApi from './lib/QuizApi'
import UserQuiz from './lib/UserQuiz'
import QuizNav from './lib/QuizNav'
import Question from './lib/Question'
import DOM from './lib/DOM'

var quiz = function (element, options) {
  var userQuiz, quizNav

  QuizApi.setConfigUrl(options.url)
  QuizApi.setResponseUrl(options.responsesUrl)

  function createQuestionsForm () {
    return DOM.createDomElement('<form class="ui form"></form>')
  }

  function createProgressElement () {
    return DOM.createDomElement('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="quiz-progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
  }

  function createTitleElement (title) {
    return DOM.createDomElement('<h1 class="ui header">' + title + '</h1>')
  }

  function isOptionInResponse (option, response) {
    return !!(response && response.indexOf(option.label) !== -1 )
  }

  function getMultipleChoiceField (type, name, idx, label, checked = '') {
    checked = checked && 'checked'
    return '<div class="field">'
    + '<div class="ui checkbox ' + type + '">'
    + '<input type="' + type + '" ' + checked + ' name="' + name + '" id="' + name + '_' + idx + '" value="' + label + '">'
    + '<label for="' + name + '_' + idx + '">' + label + '</label>'
    + '</div>'
    + '</div>'
  }

  function getMultipleInputsField (name, idx, label, value) {
    return '<tr>'
    + '<td><label for="' + name + '_' + idx + '">' + label + '</label></td>'
    + '<td width="15px"></td>'
    + '<td><div class="ui input">'
    + '<input type="text" placeholder="Response..." name="' + name + '" id="' + name + '_' + idx + '" value="' + value + '" />'
    + '</div></td>'
    + '</tr>'
    + '<tr><td colspan="3">&nbsp;</tr></tr>'
  }

  function getInputField (name, value) {
    return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="' + name + '" value="' + value + '" />'
    + '</div>'
  }

  function getFieldMarkup (question, response, i) {
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        var input = '<div class="inline fields">'
        question.input.options.forEach(function (option, j) {
          var type = question.input.type
          var checked = isOptionInResponse(option, response)
          input += getMultipleChoiceField(
            type, getFieldName(i), j, option.label, checked
          )
        })
        input += '</div>'
        break
      case 'inputs':
        var input = '<table>'
        question.input.options.forEach(function (option, j) {
          var value = response ? response[j] : ''
          input += getMultipleInputsField(getFieldName(i), j, option.label, value)
        })
        input += '</table>'
        break
      default:
        var value = response ? response : ''
        var input = getInputField(getFieldName(i), value)
    }

    return input
  }

  function getQuestionMarkup (question, response, i) {
    var code = question.code && '<pre><code>' + question.code + '</code></pre>'
    question.input = question.input || { type: 'input' }

    return '<div id="' + getFieldId(i) + '" class="ui card quiz-question" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + question.problem + '</div>'
    + '</div>'
    + '<div class="content">'
    + (code || '')
    + '</div>'
    + '<div class="content">'
    + getFieldMarkup(question, response, i)
    + '</div>'
    + '</div>'
  }

  function createQuestionsElements (questions, responses) {
    return questions.map((question, i) => {
      var questionElement = DOM.createDomElement(getQuestionMarkup(question, responses[i], i))
      DOM.css(questionElement, 'display', 'none')
      return questionElement
    })
  }

  function getFieldName (idx) {
    return 'question_' + idx
  }

  function getFieldId (idx) {
    return 'question-' + idx
  }

  function createSubmitButton ($questions, questions) {
    var submitBtn = DOM.createDomElement('<button id="quiz-submit" class="ui primary button">Submit response</button>')
    DOM.click(submitBtn, function () {
      processResponse($questions, questions)
    })
    return submitBtn
  }

  function createResetButton () {
    var resetBtn = DOM.createDomElement('<button class="ui button negative">Reset</button>')
    DOM.click(resetBtn, function () {
      localStorage.removeItem('quiz')
      location.reload()
    })
    return resetBtn
  }

  function getQuestionResponse (question, i) {
    var $inputs = DOM.createDomElement('[name^=' + getFieldName(i) + ']')
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        return $inputs.filter('[name=' + $inputs.attr('name') + ']:checked')
          .toArray().map(input => input.value)
        break
      case 'inputs':
        return $inputs.toArray().map(input => input.value)
        break
      default:
        return $inputs.val()
    }
  }

  function updateProgressBar (questions, responses) {
    var progressElement = DOM.createDomElement('#progress')
    DOM.css(progressElement, { width: (responses / questions * 100) + '%' } )
  }

  function processResponse ($questions, questions) {
    var { currentQuestion, responses } = userQuiz
    var response = getQuestionResponse(questions[currentQuestion], currentQuestion)

    if (Question.isEmptyResponse(response)) {
      alert('You must give a response')
    } else {
      userQuiz.addResponse(currentQuestion, response)
      userQuiz.getQuestion(currentQuestion).isResponseCorrect(response)
        .then(function (result) {
          alert( result.ok
            ? 'Response is correct!'
            : 'Response is not correct! It was: ' + result.correctResponse
          )
          userQuiz.save()
          quizNav.update()
        })
    }
  }

  function buildQuiz (title, questions, $element) {
    var { responses, responseCount } = userQuiz
    var $questions = createQuestionsForm()

    DOM
      .append(document.body, createProgressElement())
      .append($element, createTitleElement(title), $questions,
        createSubmitButton($questions, questions), createResetButton()
      )
      .append($questions, ...createQuestionsElements(questions, responses))
  }

  QuizApi.getConfig()
    .then(function (data) {
      userQuiz = new UserQuiz(data.questions).init()
      buildQuiz(data.title, data.questions, $(element))
      quizNav = new QuizNav(userQuiz, element)
      quizNav.update()
    })
}

module.exports = quiz
