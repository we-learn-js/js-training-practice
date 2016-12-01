var quiz = function (element, options) {
  var userQuiz

  class UserQuiz {
    constructor (questions) {
      this.questions = questions
    }
    init () {
      var storedData = localStorage.getItem('quiz') || '{}'
      storedData = JSON.parse(storedData)
      var {responses=[], currentQuestion=0, responseCount=0 } = storedData
      Object.assign(this, {responses, currentQuestion, responseCount})

      var QuestionsArr = []

      this.questions.forEach( function(q) {
        if(!!q.input) {
        switch (q.input.type) {
          case 'checkbox':
              q = new CheckboxQuestion(q.problem, q.input.options)
              break
            case 'radio':
              q = new RadioQuestion(q.problem, q.input.options)
              break
            case 'inputs':
              q = new InputsQuestion(q.problem, q.input.options)
              break
            default:
              q = new Question(q.problem)
        }
      }
      else {
        q = new Question(q.problem)
      }
      QuestionsArr.push(q)
      })
      this.questions = QuestionsArr;
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
      return QuizApi.getQuizResponse(questionIndex)
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

  class QuizApi {
    static getQuizConfig() {
      return this.getJson(options.url)
    }

    static getJson(url) {
      return new Promise(function (resolve, reject) {
        $.ajax({ url: url }).done(resolve)
      })
    }

    static getQuizResponse(i) {
      return this.getJson(options.responsesUrl.replace(':index', i))
        .then(response => response.response)
    }
  }

  class QuizNav {
    static createProgressElement() {
        return $('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
          + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
          + '</div>')
    }

    static showQuestion (idx, show) {
      var display = show ? 'block' : 'none'
      $('#' + getFieldId(idx)).css('display', display)
    }

    static showCurrentQuestion (current) {
      this.showQuestion(current - 1, false)
      this.showQuestion(current, true)
    }

    static showTextEndMessage () {
      $('#submit-response').css('display', 'none')
      $(element)
        .append('<div>Thank you for your responses.<br /><br /> </div>')
        .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }

    static updateProgressBar (questions, responses) {
      $('#progress').css('width', (responses / questions * 100) + '%')
    }

    static updateQuizStatus (questions, responseCount) {
      this.showCurrentQuestion(responseCount)
      this.updateProgressBar(questions.length, responseCount)

      questions.length === responseCount && this.showTextEndMessage()
    }
  }

  class Question {
    constructor (problem) {
      this.problem = problem
    }

    getQuestionResponse (question, i) {
      var $inputs = $('[name^=' + getFieldName(i) + ']')
      return $inputs.val()
    }

    getFieldMarkup (question, response, i) {
      var value = response ? response : ''
      var input = question.getInputField(getFieldName(i), value)

      return input
    }

    getInputField (name, value) {
      return '<div class="ui input fluid">'
      + '<input type="text" placeholder="Response..." name="' + name + '" value="' + value + '" />'
      + '</div>'
    }
  }

  class InputsQuestion extends Question {
    constructor (problem, options) {
      super(problem)
      this.options = options
    }

    getQuestionResponse (question, i) {
      var $inputs = $('[name^=' + getFieldName(i) + ']')
      return $inputs.toArray().map(input => input.value)
    }

    getFieldMarkup (question, response, i) {
      var input = '<table>'
      question.options.forEach(function (option, j) {
        var value = response ? response[j] : ''
        input += question.getMultipleInputsField(getFieldName(i), j, option.label, value)
      })
      input += '</table>'

      return input
    }

    getMultipleInputsField (name, idx, label, value) {
      return '<tr>'
      + '<td><label for="' + name + '_' + idx + '">' + label + '</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="' + name + '" id="' + name + '_' + idx + '" value="' + value + '" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>'
    }
  }

  class RadioQuestion extends Question {
    constructor(problem, options) {
      super(problem)
      this.options = options;
    }

    getMultipleChoiceField (name, idx, label, checked = '') {
      checked = checked && 'checked'
      return '<div class="field">'
      + '<div class="ui checkbox radio">'
      + '<input type="radio" ' + checked + ' name="' + name + '" id="' + name + '_' + idx + '" value="' + label + '">'
      + '<label for="' + name + '_' + idx + '">' + label + '</label>'
      + '</div>'
      + '</div>'
    }

    getFieldMarkup (question, response, i) {
      var input = '<div class="inline fields">'
      question.options.forEach(function (option, j) {
        var checked = isOptionInResponse(option, response)
        input += question.getMultipleChoiceField(
          getFieldName(i), j, option.label, checked
        )
      })
      input += '</div>'

      return input
    }

    getQuestionResponse (question, i) {
      var $inputs = $('[name^=' + getFieldName(i) + ']')
      return $inputs.filter('[name=' + $inputs.attr('name') + ']:checked')
        .toArray().map(input => input.value)
    }
  }

  class CheckboxQuestion extends Question {
    constructor(problem, options) {
      super(problem)
      this.options = options;
    }

    getMultipleChoiceField (name, idx, label, checked = '') {
      checked = checked && 'checked'
      return '<div class="field">'
      + '<div class="ui checkbox checkbox">'
      + '<input type="checkbox" ' + checked + ' name="' + name + '" id="' + name + '_' + idx + '" value="' + label + '">'
      + '<label for="' + name + '_' + idx + '">' + label + '</label>'
      + '</div>'
      + '</div>'
    }

    getFieldMarkup (question, response, i) {
      var input = '<div class="inline fields">'
      question.options.forEach(function (option, j) {
        var checked = isOptionInResponse(option, response)
        input += question.getMultipleChoiceField(
          getFieldName(i), j, option.label, checked
        )
      })
      input += '</div>'

      return input
    }

    getQuestionResponse (question, i) {
      var $inputs = $('[name^=' + getFieldName(i) + ']')
      return $inputs.filter('[name=' + $inputs.attr('name') + ']:checked')
        .toArray().map(input => input.value)
    }
  }

  function createQuestionsForm () {
    return $('<form class="ui form"></form>')
  }

  function createTitleElement (title) {
    return $('<h1 class="ui header">' + title + '</h1>')
  }

  function isOptionInResponse (option, response) {
    return !!(response && response.indexOf(option.label) !== -1 )
  }



  function getInputField (name, value) {
    return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="' + name + '" value="' + value + '" />'
    + '</div>'
  }

  function getQuestionMarkup (question, response, i) {
    var code = question.code && '<pre><code>' + question.code + '</code></pre>'
    question.input = question.input || { type: 'input' }
    return '<div id="' + getFieldId(i) + '" class="ui card" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + question.problem + '</div>'
    + '</div>'
    + '<div class="content">'
    + (code || '')
    + '</div>'
    + '<div class="content">'
    + question.getFieldMarkup(question, response, i)
    + '</div>'
    + '</div>'
  }

  function createQuestionsElements (questions, responses) {
    return questions.map((question, i) => {
      return $(getQuestionMarkup(question, responses[i], i)).css('display', 'none')
    })
  }

  function getFieldName (idx) {
    return 'question_' + idx
  }

  function getFieldId (idx) {
    return 'question-' + idx
  }

  function createSubmitButton ($questions, questions) {
    return $('<button id="submit-response" class="ui primary button">Submit response</button>')
      .on('click', function () {
        processResponse($questions, questions)
      })
  }

  function createResetButton () {
    return $('<button class="ui button negative">Reset</button>')
      .on('click', function () {
        localStorage.removeItem('quiz')
        location.reload()
      })
  }


  function isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }

  function processResponse ($questions, questions) {
    var { currentQuestion, responses } = userQuiz
    var response = questions[currentQuestion].getQuestionResponse(questions[currentQuestion], currentQuestion)

    userQuiz.addResponse(currentQuestion, response)

    if (isEmptyResponse(responses[currentQuestion])) {
      alert('You must give a response')
    } else {
      userQuiz.isResponseCorrect(currentQuestion, response)
        .then(function (result) {
          alert( result.ok
            ? 'Response is correct!'
            : 'Response is not correct! It was: ' + result.correctResponse
          )
          userQuiz.save()
          QuizNav.updateQuizStatus(questions, userQuiz.responseCount)
        })
    }
  }

  function buildQuiz (title, questions, $element) {
    var { responses, responseCount } = userQuiz
    var $questions = createQuestionsForm()

    $(document.body)
      .append(QuizNav.createProgressElement())

    $element
      .append(createTitleElement(title))
      .append($questions)
      .append(createSubmitButton($questions, questions))
      .append(createResetButton())

    $questions
      .append(createQuestionsElements(questions, responses))
      .find('pre code').each((i, block) => {
      hljs.highlightBlock(block)})

    QuizNav.updateQuizStatus(questions, responseCount)
  }

  QuizApi.getQuizConfig()
    .then(function (data) {
      userQuiz = new UserQuiz(data.questions).init()
      buildQuiz(data.title, userQuiz.questions, $(element))
    })
}

module.exports = quiz
