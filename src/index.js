responseCount = 0
currentQuestion = 0

quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) {
    questions = data.questions

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

    $questions = $('<form class="ui form"></form>')
    $(document.body).append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; "><div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div></div>')
    $element.append('<h1 class="ui header">' + data.title + '</h1>').append($questions)

    function inputTotal (i) {
      var input = '<div>'
      for (j = 0; j < question.input.options.length; j++) {
        var option = question.input.options[j]
        var type = question.input.type
        var checked = (!!responses[i] && responses[i].indexOf(option.label) !== -1) ? 'checked' : ''
        var value = !!responses[i] ? responses[i][j] : '';

        if (type === 'checkbox' || type === 'radio') {
          console.log(type);
          input += '<div class="ui checkbox ' + type + '">'
            + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
            + '<label for="question_' + i + '_' + j + '" style="margin-right:15px;">' + option.label + '</label>'
            + '</div>'
        } else {
          input += '<div style="margin-bottom: 5px;"><label for="question_' + i + '_' + j + '" style="margin-right:15px;">' + option.label + '</label>'
            + '<div class="ui input">'
            + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
            + '</div></div>'
        }
      }
      input += '</div>'
      return input
    }

    for (var i = 0; i < data.questions.length; i++) {
      question = data.questions[i]

      if (question.code !== undefined) {
        var code = '<div class="content"><pre><code>' + question.code + '</code></pre></div>'
      } else {
        var code = ''
      }

      if (question.input === undefined) {
        question.input = { type: 'input' }
        var value = !!responses[i] ? responses[i] : '';
        var input = '<div class="ui input fluid">'
          + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
          + '</div>'
      }
      else { var input = inputTotal (i)}


      $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
        + '<div class="content">'
        + '<div class="header">' + question.problem + '</div>'
        + '</div>'
        + code
        + '<div class="content">'
        + input
        + '</div>'
        + '</div>'
      ).hide() // Oculta todas las preguntas

      $questions.append($question)

      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block)
      })

      $questions.find('#question-' + currentQuestion).show()
    }

    $element.append('<button id="submit-response" class="ui primary button">Submit response</button><button id="button-reset" class="ui button negative">Reset</button>')

    $('#button-reset').on('click', function(){
      localStorage.removeItem('quiz')
      location.reload();
    })


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

      $('#progress').css('width', (responseCount / questions.length * 100) + '%')

      isQuestionAnswered = true

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
        $questions.find('#question-' + currentQuestion).hide()
        currentQuestion = currentQuestion + 1
        $questions.find('#question-' + currentQuestion).show()

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



// prueba de git
