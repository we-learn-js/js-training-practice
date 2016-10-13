responseCount = 0
currentQuestion = 0

quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) {
    questions = data.questions

    getDataFromLocalStorage();

    if (quizData == null) {
      quizData = { responses: [] }
      responses = quizData.responses
    }
    $questions = $('<form class="ui form"></form>')

    appendProgressBar();

    $element = appendH1($element, data.title);
    $element = appendQuestionsToElement($element, questions);

    questions.map((question, i) => {

      if (question.code !== undefined) {
        var code = '<pre><code>' + question.code + '</code></pre>'
      } else {
        var code = ''
      }

      if (question.input === undefined) {
        question.input = { type: 'input' }
      }

      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
          var input = getHTMLForCheckboxAndRadio(question, i);
          break

        case 'inputs':
          var input = getHTMLForInput(question, i);
          break

        default:
          if (!!responses[i]) {
            var value = responses[i]
          } else {
            var value = ''
          }
          var input = getHTMLForDefault(question, i, value);
      }

      $questions.append(appendQuestionToQuestions(i, question.problem, code, input))

      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block)
      })

      setCurrentQuestionVisibility($questions, 'block');
      setProgressBarWidth(responseCount, questions.length);
    })

    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Thank you for your responses.<br/><br/> </div>')
      $element.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
    }

    $('#submit-response').on('click', function () {
      setSubmitClick();
    })
  })
}

function getDataFromLocalStorage() {
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    responses = quizData.responses || []
    currentQuestion = quizData.currentQuestion || -1
    responseCount = quizData.responseCount || -1
  } catch (e) {}
}

function setDataToLocalStorage(responses, responseCount, currentQuestion) {
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
}

function appendProgressBar() {
  $(document.body)
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')  
}

function appendH1(element, title) {
  $element.append('<h1 class="ui header">' + title + '</h1>')
  return $element;
}

function appendQuestionsToElement(element, questions) {
  $element.append($questions);
  return $element;
}

function getHTMLForCheckboxAndRadio(question, i) {
  var input = '<div class="inline fields">'
  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
    var type = question.input.type

    if (!!responses[i] && responses[i].indexOf(option.label) !== -1) {
      var checked = 'checked'
    } else {
      var checked = ''
    }

    input += '<div class="field">'
      + '<div class="ui checkbox ' + type + '">'
      + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
      + '<label for="question_' + i + '_' + j + '">' + option.label + '</label>'
      + '</div>'
      + '</div>'
  }
  input += '</div>'

  return input;
}

function getHTMLForInput(question, i) {
  var input = '<table>'
  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
    var type = 'checkbox'

    if (!!responses[i]) {
      var value = responses[i][j]
    } else {
      var value = ''
    }

    input += '<tr>'
      + '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>'
  }
  input += '</table>'

  return input;
}

function getHTMLForDefault(question, i, value) {
  var input = '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
    + '</div>'  

  return input;
}

function appendQuestionToQuestions(i, problem, code, input) {
  $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
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

  return $question;
}

function setCurrentQuestionVisibility(questions, visibility) {
  $questions.find('#question-' + currentQuestion).css('display', visibility)
}

function setProgressBarWidth(responseCount, questionsLength) {
  $('#progress').css('width', (responseCount / questionsLength * 100) + '%')
}

function setSubmitClick() {
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

  var responseCount = 0

  responses.map((response, i) => {
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

  setProgressBarWidth(responseCount, questions.length);

  isQuestionAnswered = true

  console.log('response', currentQuestion, responses[currentQuestion])
  if (!responses[currentQuestion]) {
    isQuestionAnswered = false
  }

  if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
     for (j = 0; j < responses[currentQuestion].length; j++) {      
       if (!responses[currentQuestion][j]) {
         isQuestionAnswered = false
       }
     }
  }

  if (!isQuestionAnswered) {
    alert('You must give a response')
  } else {
    setCurrentQuestionVisibility($questions, 'none');
    currentQuestion = currentQuestion + 1
    setCurrentQuestionVisibility($questions, 'block');

    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Exam filled in successfully. Thank you.</div>')
      $element.append('<button>Print responses</button>')
    }
  }

  setDataToLocalStorage(responses, responseCount, currentQuestion);
}

module.exports = quiz