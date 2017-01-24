import QuizApi from './lib/QuizApi'
import UserQuiz from './lib/UserQuiz'
import QuizNav from './lib/QuizNav'
import Question from './lib/Question'
import Dom from './lib/Dom'

var quiz = function (element, options) {
  var userQuiz, quizNav,dom=new Dom()


  QuizApi.setConfigUrl(options.url)
  QuizApi.setResponseUrl(options.responsesUrl)

  function createQuestionsForm () {
    return  $(dom.css(dom.createDomElement('form'),'class','ui form'));
  }

  function createProgressElement () {
    var div1=dom.css(dom.createDomElement('div','quiz-progress'),'style',"background: #1678c2; width: 1%;");
    var div2=dom.css(dom.createDomElement('div'),'style','position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ')
    return  dom.append(div2,div1);
  }

  function createTitleElement (title) {
    return $(dom.css(dom.createDomElement('h1',undefined,title),'class','ui header'))
  }

  function isOptionInResponse (option, response) {
    return !!(response && response.indexOf(option.label) !== -1 )
  }

  function getMultipleChoiceField (type, name, idx, label, checked = '') {
    checked = checked && 'checked'

    var div1=dom.css(dom.createDomElement('div'),'class','field')
    var div1_1=dom.css(dom.createDomElement('div'),'class','ui checkbox ' + type )
    var input=dom.css(dom.css(dom.css(dom.createDomElement('input',name + '_' + idx,label),'type',type),'checked',checked),'name',name)
    var label=dom.css(dom.createDomElement('label',undefined,label),'for',name + '_' + idx)
    dom.append(div1_1,input,label)
    return dom.append(div1,div1_1)

  }

  function getMultipleInputsField (name, idx, label, value) {
    var label=dom.css(dom.createDomElement('label'),'for',name + '_' + idx)
    var td1=dom.append(dom.createDomElement('td'),label)
    var td2=dom.css(dom.createDomElement('td'),'width','15px')
    var input=dom.css(dom.css(dom.createDomElement('input',name + '_' + idx,value),'placeholder','Response...'),'name',name)
    var div=dom.append(dom.css(dom.createDomElement('div'),'class','ui input'),input)
    var td3=dom.createDomElement('td')
    dom.append(td3,div)
    return dom.append(dom.createDomElement('tr'),td1,td2,td3)
  }

  function getInputField (name, value) {
    var input=dom.css(dom.css(dom.createDomElement('input',undefined,value),'placeholder','Response...'),'name',name)
    return dom.append(dom.css(dom.createDomElement('div'),'class','ui input fluid'),input)

  }

  function getFieldMarkup (question, response, i) {
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        var input =dom.css(dom.createDomElement('div'), 'class','inline fields')
        question.input.options.forEach(function (option, j) {
          var type = question.input.type
          var checked = isOptionInResponse(option, response)
          dom.append(input,getMultipleChoiceField(type, getFieldName(i), j, option.label, checked))
        })

        break
      case 'inputs':
        var input = dom.createDomElement('table')
        question.input.options.forEach(function (option, j) {
          var value = response ? response[j] : ''
          dom.append(input, getMultipleInputsField(getFieldName(i), j, option.label, value))
        })
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

    var div1=dom.css(dom.css(dom.createDomElement('div',getFieldId(i)),'class','ui card quiz-question'),'style','width:100%;')
    var div1_1=dom.css(dom.createDomElement('div'),'class','content')
    var div1_1_1=dom.css(dom.createDomElement('div',undefined,question.problem),'class','header')
    div1_1=dom.append(div1_1,div1_1_1)
    var div1_2=dom.css(dom.createDomElement('div',undefined,(code||'')),'class','content')
    var div1_3=dom.append(dom.css(dom.createDomElement('div'),'class','content'),getFieldMarkup(question, response, i))
    return dom.append(div1,div1_1,div1_2,div1_3)

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
    return $(dom.css(dom.createDomElement('button','quiz-submit','Submit response'),'class','ui primary button'))
      .on('click', function () {
        processResponse($questions, questions)
      })
  }

  function createResetButton () {
    //return $('<button class="ui button negative">Reset</button>')
    return $(dom.css(dom.createDomElement('button',undefined,'Reset'),'class','ui button negative'))
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

  function updateProgressBar (questions, responses) {
    $('#progress').css('width', (responses / questions * 100) + '%')
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

    $(document.body)
      .append(createProgressElement())

    $element
      .append(createTitleElement(title))
      .append($questions)
      .append(createSubmitButton($questions, questions))
      .append(createResetButton())

    $questions
      .append(createQuestionsElements(questions, responses))
      .find('pre code').each((i, block) => {
      hljs.highlightBlock(block)})

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
