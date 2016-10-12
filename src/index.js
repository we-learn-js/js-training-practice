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

    data.questions.forEach( function(question, i) {
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
          var input = '<div class="inline fields">'

          question.input.options.forEach( function(option, j) {
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
          })
          input += '</div>'
          break

        case 'inputs':
          var input = '<table>'
          question.input.options.forEach( function(option, j) {
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
          })
          input += '</table>'
          break
        default:
          if (!!responses[i]) {
            var value = responses[i]
          } else {
            var value = ''
          }
          var input = '<div class="ui input fluid">'
            + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
            + '</div>'
      }

      $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
        + '<div class="content">'
        + '<div class="header">' + question.problem + '</div>'
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

      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block)
      })

      $questions.find('#question-' + currentQuestion).css('display', 'block')
      $('#progress').css('width', (responseCount / questions.length * 100) + '%')
    })
    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Thank you for your responses.<br /><br /> </div>')
      $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }

    $resetButton = $('<button class="ui button negative">Reset</button>')
    $resetButton.on('click', function(){
      localStorage.removeItem('quiz')
      location.reload();
    })

    $element.append($resetButton)

    $('#submit-response').on('click', function () {
      var $inputs = $('[name^=question_' + currentQuestion + ']')
      var question = questions[currentQuestion]

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
        $questions.find('#question-' + currentQuestion).css('display', 'none')
        currentQuestion = currentQuestion + 1
        $questions.find('#question-' + currentQuestion).css('display', 'block')

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
