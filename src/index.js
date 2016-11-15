var quiz = function (element, options) {

  class UserQuiz {
    constructor (questions) {
      this._questions = questions

      this._responses = []
      this._currentQuestion = 0
      this._responseCount = 0
    }

    init() {
      var storedData = localStorage.getItem('quiz')
      var storedDataParsed = (storedData) ? JSON.parse(storedData) : {}
      
      var {responses=[], currentQuestion=0, responseCount=0 } = storedDataParsed

      this._responses = responses
      this._currentQuestion = currentQuestion
      this._responseCount = responseCount

      return this
    }

    save() {
      var quizData = Object.assign({}, {
                responses: this._responses,
                responseCount: this._responseCount,
                currentQuestion: this._currentQuestion
              })

      localStorage.setItem('quiz', JSON.stringify(quizData))
    }

    addResponse (questionIndex, response) {
      this._responses[questionIndex] = response
    }

    static isResponseCorrect (userResponse, correctResponse) {
      return UserQuiz.serializeResponse(userResponse) == UserQuiz.serializeResponse(correctResponse)
    }

    static serializeResponse (response) {
      return (response.join && response.sort().join(', ')) || response
    }

    getQuizResponse (i) {
      return UserQuiz.getJson(options.responsesUrl.replace(':index', i))
        .then(response => response.response)
    }

    static getJson (url) {
      return new Promise(function (resolve, reject) {
        $.ajax({ url: url }).done(resolve)
      })
    }

    get currentQuestion() {
      return this._currentQuestion
    }

    set currentQuestion(value) {
      this._currentQuestion = value
    }

    get questions() {
      return this._questions
    }

    get responses() {
      return this._responses
    }

    get responseCount() {
      return this._responseCount
    }

    set responseCount(value) {
      this._responseCount = value
    }
  }

  function getQuizConfig () {
    return UserQuiz.getJson(options.url)
  }

  function createQuestionsForm () {
    return $('<form class="ui form"></form>')
  }

  function createProgressElement () {
    return $('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
  }

  function createTitleElement (title) {
    return $('<h1 class="ui header">' + title + '</h1>')
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

    return '<div id="' + getFieldId(i) + '" class="ui card" style="width: 100%;">'
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

  function getQuestionResponse (question, i) {
    var $inputs = $('[name^=' + getFieldName(i) + ']')
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

  function isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }

  function getResponseCount (responses) {
    return responses.reduce(function (result, response) {
      return result + (+!isEmptyResponse(response))
    }, 0)
  }

  function showQuestion (idx, show) {
    var display = show ? 'block' : 'none'
    $('#' + getFieldId(idx)).css('display', display)
  }

  function showCurrentQuestion (current) {
    showQuestion(current - 1, false)
    showQuestion(current, true)
  }

  function showTextEndMessage () {
    $('#submit-response').css('display', 'none')
    $(element)
      .append('<div>Thank you for your responses.<br /><br /> </div>')
      .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  function updateProgressBar (questions, responses) {
    $('#progress').css('width', (responses / questions * 100) + '%')
  }

  function processResponse ($questions, questions) {
    var response = getQuestionResponse(questions[userQuiz.currentQuestion], userQuiz.currentQuestion)
    userQuiz.responses[userQuiz.currentQuestion] = response

    if (isEmptyResponse(userQuiz.responses[userQuiz.currentQuestion])) {
      alert('You must give a response')
    } else {
      userQuiz.responseCount = getResponseCount(userQuiz.responses)

      userQuiz.getQuizResponse(userQuiz.currentQuestion)
        .then(function (correctResponse) {
          alert(UserQuiz.isResponseCorrect(response, correctResponse)
            ? 'Response is correct!'
            :'Response is not correct! It was: ' + UserQuiz.serializeResponse(correctResponse)
          )
          updateQuizStatus(questions, userQuiz.responseCount)
          
          userQuiz.currentQuestion = userQuiz.currentQuestion + 1
          userQuiz.save()
        })
    }
  }

  function updateQuizStatus (questions, responseCount) {
    showCurrentQuestion(responseCount)
    updateProgressBar(questions.length, responseCount)

    questions.length === responseCount && showTextEndMessage()
  }

  function buildQuiz (title, questions, $element) {
    var $questions = createQuestionsForm()

    $(document.body)
      .append(createProgressElement())

    $element
      .append(createTitleElement(title))
      .append($questions)
      .append(createSubmitButton($questions, userQuiz.questions))
      .append(createResetButton())

    $questions
      .append(createQuestionsElements(userQuiz.questions, userQuiz.responses))
      .find('pre code').each((i, block) => {
      hljs.highlightBlock(block)})

    updateQuizStatus(userQuiz.questions, userQuiz.responseCount)
  }

  var userQuiz

  getQuizConfig()
    .then(function (data) {
      userQuiz = new UserQuiz(data.questions).init()
      buildQuiz(data.title, data.questions, $(element))
    })
}


module.exports = quiz
