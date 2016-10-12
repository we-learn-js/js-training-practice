responseCount = 0
currentQuestion = 0

function InitProgressBar()
{
  $(document.body)
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
}

function IncrementProgressBar(responseCount, questionsLenght){
  $('#progress').css('width', (responseCount / questionsLenght * 100) + '%')
}

function ShowQuestion(question) {
  $questions.find('#question-' + question).css('display', 'block')
}

function HideQuestion(question) {
  console.log('#question-' + question);
  $questions.find('#question-' + question).css('display', 'hide')
}

function ShowFinishMessage(responseCount, questionsLenght)
{
  (responseCount === questionsLenght) ? ShowThanks() : ''
}

function ShowThanks() {
  $('#submit-response').css('display', 'none')
  $element.append('<div>Thank you for your responses.<br/><br/> </div>')
  $element.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
}

function CheckResponse(index, responses, option) {
  return (!!responses[index] && responses[index].indexOf(option.label) !== -1) ? 'checked' : ''
}

function printRadioCheck(questionInput, responses, index) {
  var input = '<div class="inline fields">'
  questionInput.options.forEach( (option, j) => {
    var type = questionInput.type
    var checked = CheckResponse(index, responses, option)

    input += '<div class="field">'
      + '<div class="ui checkbox ' + type + '">'
      + '<input type="' + type + '" ' + checked + ' name="question_' + index + '" id="question_' + index + '_' + j + '" value="' + option.label + '">'
      + '<label for="question_' + index + '_' + j + '">' + option.label + '</label>'
      + '</div>'
      + '</div>'
  })
  input += '</div>'
  return input
}

function GetValueResponse(responses, questionIndex, responseIndex) {
  return (!!responses[questionIndex]) ? responses[questionIndex][responseIndex] : ''
}

function printInputs(questionInput, responses, index) {
  var input = '<table>'
  questionInput.options.forEach( (option, j) => {
    var type = 'checkbox'
    var value = GetValueResponse(responses, index, j)
    input += '<tr>'
      + '<td><label for="question_' + index + '_' + j + '">' + option.label + '</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="question_' + index + '" id="question_' + index + '_' + j + '" value="' + value + '" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>'
    })
    input += '</table>'
    return input
}

function printDefaultInput(responses, index) {
  var value = (!!responses[index]) ? responses[index] : ''
  return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_' + index + '" value="' + value + '" />'
    + '</div>'
}

function GetCodeQuestion(question) {
  return (question.code !== undefined) ? '<pre><code>' + question.code + '</code></pre>' : ''
}

function IsQuestionAnswered(currentQuestion, responses) {
  var isQuestionAnswered = (!responses[currentQuestion]) ? false : true
  console.log('response', currentQuestion, responses[currentQuestion])
  if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
    for (j = 0; j < responses[currentQuestion].length; j++) {
      if (!responses[currentQuestion][j]) {
        isQuestionAnswered = false
      }
    }
  }
  return isQuestionAnswered
}

function GetResponseCounter(responses, question, i) {
  var responseCount = 0
  for (i = 0; i < responses.length; i++) {
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
  }
  return responseCount
}

function printQuestion(problem, code, input, index) {
  $question = $('<div id="question-' + index + '" class="ui card" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + problem + '</div>'
    + '</div>'
    + '<div class="content">'
    + code
    + '</div>'
    + '<div class="content">'
    + input
    + '</div>'
    + '</div>'
  ).css('display', 'none')

  $questions.append($question)
}

function GetQuizData(){
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    responses = quizData.responses || []
    currentQuestion = quizData.currentQuestion || -1
    responseCount = quizData.responseCount || -1
  } catch (e) {}

  if (quizData == null) {
    quizData = { responses: [] }
    responses = quizData.responses
  }
}

function StoreData(responses, responseCount, currentQuestion){
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
}

quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) {
    questions = data.questions

    GetQuizData()

    $questions = $('<form class="ui form"></form>')

    InitProgressBar();

    $element
      .append('<h1 class="ui header">' + data.title + '</h1>')
      .append($questions)

    for (var i = 0; i < data.questions.length; i++) {
      question = data.questions[i]
      var code = GetCodeQuestion(question)

      if (question.input === undefined) {
        question.input = { type: 'input' }
      }
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
          var input = printRadioCheck(question.input, responses, i)
          break
        case 'inputs':
          var input = printInputs(question.input, responses, i)
          break
        default:
          var input = printDefaultInput(responses, i)
      }
      printQuestion(question.problem, code, input, i)

      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block)
      })

      // $questions.find('input').on('keypress', onValueChange)
      // $questions.find('input').on('change', onValueChange)
      ShowQuestion(currentQuestion);
      IncrementProgressBar(responseCount, questions.length)
    }
    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

    ShowFinishMessage(responseCount, questions.length)

    $('#submit-response').on('click', function () {
      var $inputs = $('[name^=question_' + currentQuestion + ']')
      var question = questions[currentQuestion]

      console.log($inputs)

      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
          responses[currentQuestion] = []
          $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
            responses[currentQuestion].push(input.value)
          })
          if (responses[currentQuestion].length === 0) {
            responses[currentQuestion] = null
          }
          break
        case 'inputs':
          responses[currentQuestion] = []
          $inputs.each(function (i, input) {
            responses[currentQuestion].push(input.value)
          })
          break
        default:
          responses[currentQuestion] = $inputs.val()
      }


      var responseCount = GetResponseCounter(responses, question, i)
      IncrementProgressBar(responseCount, questions.length)

      isQuestionAnswered = IsQuestionAnswered(currentQuestion, responses)
      if (!isQuestionAnswered) {
        alert('You must give a response')
      } else {
        HideQuestion(currentQuestion);
        currentQuestion = currentQuestion + 1
        ShowQuestion(currentQuestion)
        ShowFinishMessage(responseCount, questions.length)
      }

      StoreData(responses, responseCount, currentQuestion)
    })
  })
}

module.exports = quiz
