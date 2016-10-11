responseCount = 0
currentQuestion = 0

quiz = function (element, options) {
  $element = $(element)
  $questions = $('<form class="ui form"></form>')

  $.ajax({
    url: options.url
  })
  .done(function (data) {
    questions = data.questions
    init(data)
  })

  function initProgressBar(){
    $(document.body)
      .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
  }
  function updateProgress(responseCount, questionsLength){
    $('#progress').css('width', (responseCount / questionsLength * 100) + '%')
  }

  function showThanks(){
    $('#submit-response').css('display', 'none')
    $element.append('<div>Thank you for your responses.<br /><br /> </div>')
    $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  function hideCurrentQuestion(currentQuestion){
    $questions.find('#question-' + currentQuestion).css('display', 'none')
  }

  function showNextQuestion(currentQuestion){
    $questions.find('#question-' + currentQuestion).css('display', 'block')
  }

  function isCheckBox(type) {
    return type == 'checkbox'
  }
  function isRadio(type) {
    return type == 'radio'
  }
  function isInput(type) {
    return type == 'inputs'
  }

  function printTitle(title){
    $element.append('<h1 class="ui header">' + title + '</h1>')
  }
  function printForm(questions){
    $element.append(questions)
  }
  function printSubmit(){
    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')
  }


  function init(data){
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

    initProgressBar()
    printTitle(data.title)
    printForm($questions )

    data.questions.map(function(question, i){

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

          question.input.options.map(function( option, j){

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
      showNextQuestion(currentQuestion )
      updateProgress(responseCount, questions.length)

    })

    printSubmit()


    if (responseCount === questions.length) {
      showThanks()
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

      if (isCheckBox(question.input.type) | isRadio(question.input.type)){
        responses[currentQuestion] = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
        if (responses[currentQuestion].length === 0) {
          responses[currentQuestion] = null
        }
      }
      else if (isInput(question.input.type)) {
        responses[currentQuestion] = []
        $inputs.each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
      }
      else{
        responses[currentQuestion] = $inputs.val()
      }

      var responseCount = 0

      // responses.map(function(response, i){
      //
      // })
      for (i = 0; i < responses.length; i++) {

        //console.log(responses.length);
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
      updateProgress(responseCount, questions.length)

      isQuestionAnswered = true

      if (!responses[currentQuestion]) {
        isQuestionAnswered = false
      }

      // if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
      //   for (j = 0; j < responses[currentQuestion].length; j++) {
      //     if (!responses[currentQuestion][j]) {
      //       isQuestionAnswered = false
      //     }
      //   }
      // }

      if (!isQuestionAnswered) {
        alert('You must give a response')
      } else {
        hideCurrentQuestion(currentQuestion)
        currentQuestion = currentQuestion + 1
        showNextQuestion(currentQuestion )

        if (responseCount === questions.length) {
          showThanks();
        }
      }

      quizData.responses = responses
      quizData.responseCount = responseCount
      quizData.currentQuestion = currentQuestion
      localStorage.setItem('quiz', JSON.stringify(quizData))
    })
  }
}

module.exports = quiz
