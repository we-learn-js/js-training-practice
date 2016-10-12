
var quiz = function (element, options) {

  var responseCount = 0
  var currentQuestion = 0
  var quizData
  var responses
  var $questions = $('<form class="ui form"></form>')

  var $body = $(document.body)
  var $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) {
    var questions = data.questions

    quizData()

    addProgressBar($body)

    quizTitle(data.title)

    quizQuestions($questions, questions)

    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Thank you for your responses.<br/><br/> </div>')
      $element.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
    }

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

      var responseCount = 0
      responses.map((response, i) => {
        question = questions[i]
        switch (question.input.type) {
          case 'checkbox':
          case 'radio':
          case 'inputs':
            (!!responses[i] && !!responses[i].join('')) ? responseCount++ : null
            break
          default:
            (!!responses[i]) ? responseCount++ : null
        }
      })

      progressBar(responseCount, questions.length)

      isQuestionAnswered = true

      console.log('response', currentQuestion, responses[currentQuestion])
      if (!responses[currentQuestion]) {
        isQuestionAnswered = false
      }

      if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
        responses[currentQuestion].map( (responses, j) => {
          if (!responses[currentQuestion][j]) {
            isQuestionAnswered = false
          }
        })
      }

      if (!isQuestionAnswered) {
        alert('You must give a response')
      } else {
        toggleQuestion('none')
        currentQuestion++
        toggleQuestion('block')

        if (responseCount === questions.length) {
          $('#submit-response').css('display', 'none')
          $element.append('<div>Exam filled in successfully. Thank you.</div>')
          $element.append('<button>Print responses</button>')
        }
      }

      quizStorage(responses, responseCount, currentQuestion)

    })
  })

  /**
   * Get data from localStorage
   * @return null
   */
  function quizData() {
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

  /**
   * Save reponses to localStorage
   * @param  {array} responses
   * @param  {int} responseCount   [description]
   * @param  {int} currentQuestion [description]
   * @return null
   */
  function quizStorage(responses, responseCount, currentQuestion) {
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  }

  /**
   * Add <h1> tag with Title of Quiz
   * @param  {strind} title   Title of quiz
   * @return null
   */
  function quizTitle(title) {
    $element.append('<h1 class="ui header">' + title + '</h1>')
  }

  /**
   * Add form elment, questions and submit button
   * @param  {nodeList} $questions
   * @param  {object} questions
   * @return null
   */
  function quizQuestions($questions, questions) {

    // Form element ------------------------------------------------------------
    $element.append($questions)

    // Questions ---------------------------------------------------------------
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
          break

        case 'inputs':
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

      // $questions.find('input').on('keypress', onValueChange)
      // $questions.find('input').on('change', onValueChange)
      $questions.find('#question-' + currentQuestion).css('display', 'block')

      progressBar(responseCount, questions.length)


    })

    // submit button -----------------------------------------------------------
    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')
  }

  /**
   * Toggle display for currentQuestion
   * @param  {string} value none || block
   * @return null
   */
  function toggleQuestion(value) {
    $questions.find('#question-' + currentQuestion).css('display', value)
  }

  /**
   * Add progress bar to Quiz
   * @param  {nodeList} $body Element of body
   * @return null
   */
  function addProgressBar($body) {
    $body.append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
  }

  /**
   * Update progree bar
   * @param  {int} responseCount
   * @param  {int} length
   * @return null
   */
  function progressBar(responseCount, length) {
    $('#progress').css('width', (responseCount / length * 100) + '%')
  }
}

module.exports = quiz
