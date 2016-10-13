responseCount = 0
currentQuestion = 0

function getQuizConfig (url, callback) {
  $.ajax({ url: url }).done( callback )
}

function getStoredQuizData () {
  storedData = localStorage.getItem('quiz')
  return (storedData) ? JSON.parse(storedData) : {}
}

function getQuizData () {
  quizData = getStoredQuizData()
  quizData.responses = quizData.responses || []
  quizData.currentQuestion = quizData.currentQuestion || 0
  quizData.responseCount = quizData.responseCount || 0
  return quizData
}

function createQuestionsForm () {
  return $('<form class="ui form"></form>')
}

function createProgressElement () {
  return $('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
    + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
    + '</div>')
}

function createTitleElement(title) {
  return $('<h1 class="ui header">' + title + '</h1>')
}

function isOptionInResponse (option, response) {
  return !!response && response.indexOf(option.label) !== -1
}

function getMultipleChoiceField(type, name, idx, label, checked){
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

function getFieldMarkup (question, i) {
  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      var input = '<div class="inline fields">'
      question.input.options.forEach( function(option, j) {
        var type = question.input.type
        var checked = isOptionInResponse(option, responses[i])
        input += getMultipleChoiceField(
          type, getFieldName(i),  j, option.label,  checked
        )
      })
      input += '</div>'
      break
    case 'inputs':
      var input = '<table>'
      question.input.options.forEach( function(option, j) {
        var value = !!responses[i] ? responses[i][j] : ''
        input += getMultipleInputsField(getFieldName(i), j, option.label, value)
      })
      input += '</table>'
      break
    default:
      var value = responses[i] ? responses[i] : ''
      var input = getInputField(getFieldName(i), value)
  }

  return input
}

function getQuestionMarkup (question, i) {
  var code = question.code && '<pre><code>' + question.code + '</code></pre>'
  question.input = question.input || { type: 'input' }
  return '<div id="' + getFieldId(i) + '" class="ui card" style="width: 100%;">'
  + '<div class="content">'
  + '<div class="header">' + question.problem + '</div>'
  + '</div>'
  + '<div class="content">'
  + code
  + '</div>'
  + '<div class="content">'
  + getFieldMarkup(question, i)
  + '</div>'
  + '</div>'
}

function createQuestionsElements(questions) {
  return questions.map( (question, i) => {
    return $( getQuestionMarkup(question, i) ).css('display', 'none')
  })
}

function getFieldName (idx){
  return 'question_' + idx
}

function getFieldId (idx){
  return 'question-' + idx
}

function createSubmitButton () {
  return $('<button id="submit-response" class="ui primary button">Submit response</button>')
}

function createResetButton () {
  return $('<button class="ui button negative">Reset</button>')
    .on('click', function(){
      localStorage.removeItem('quiz')
      location.reload();
    })
}

function getQuestionResponse(question, i) {
  var $inputs = $('[name^=' + getFieldName(i) + ']')
  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      return $inputs.filter('[name=' + $inputs.attr('name') + ']:checked')
        .toArray().map( input => input.value )
      break
    case 'inputs':
      return $inputs.toArray().map( input => input.value )
      break
    default:
      return $inputs.val()
  }
}

quiz = function (element, options) {
  $element = $(element)

  getQuizConfig(options.url, function(data){

    questions = data.questions

    quizData = getQuizData ()
    responses = quizData.responses
    currentQuestion = quizData.currentQuestion
    responseCount = quizData.responseCount
    responses = quizData.responses


    $questions = createQuestionsForm()

    $(document.body)
      .append(createProgressElement())

    $element
      .append(createTitleElement(data.title))
      .append($questions)
      .append(createSubmitButton())
      .append(createResetButton())

    $questions
      .append( createQuestionsElements(data.questions) )
      .find('#' + getFieldId(currentQuestion)).css('display', 'block')
      .find('pre code').each((i, block) => { hljs.highlightBlock(block) })


    $('#progress').css('width', (responseCount / questions.length * 100) + '%')


    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Thank you for your responses.<br /><br /> </div>')
      $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }

    $('#submit-response').on('click', function () {

      var question = questions[currentQuestion]
      responses[currentQuestion] = getQuestionResponse(question, currentQuestion)


      var responseCount = 0
      responses.forEach( function(response, i) {
        question = questions[i]
        switch (question.input.type) {
          case 'checkbox':
          case 'radio':
          case 'inputs':
            if (!!responses[i] && !!responses[i].join('')) {
              responseCount++
            }
            break
          default:
            if (!!responses[i]) {
              responseCount++
            }
        }
      })

      $('#progress').css('width', (responseCount / questions.length * 100) + '%')

      isQuestionAnswered = true

      if (!responses[currentQuestion]) {
        isQuestionAnswered = false
      }

      if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
        responses[currentQuestion].forEach(function(response, j){
          if (!responses[currentQuestion][j]) {
            isQuestionAnswered = false
          }
        })
      }

      if (!isQuestionAnswered) {
        alert('You must give a response')
      } else {
        $questions.find(getFieldId(currentQuestion)).css('display', 'none')
        currentQuestion = currentQuestion + 1
        $questions.find('#' + getFieldId(currentQuestion)).css('display', 'block')

        if (responseCount === questions.length) {
          $('#submit-response').css('display', 'none')
          $element.append('<div>Thank you for your responses.<br /><br /> </div>')
          $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
        }
      }

      quizData.responses = responses
      quizData.responseCount = responseCount
      quizData.currentQuestion = currentQuestion
      localStorage.setItem('quiz', JSON.stringify(quizData))
    })
  })
}

module.exports = quiz
