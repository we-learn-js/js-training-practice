$.ajax({
  url: 'data/quiz.json?' + Date.now()
}).done(function(data) {
  const questions = data.questions
  let responseCount = 0
  let responses 
  let quizData
  let currentQuestion = 0
  const $question, $resetButton

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    responses = quizData.responses || []
    currentQuestion = quizData.currentQuestion || -1
    responseCount = quizData.responseCount || -1
  } catch (e) {}

  if (quizData == null) {
    quizData = {
      responses: []
    }
    responses = quizData.responses
  }


  // Append the progress bar to DOM
  $('body')
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">' +
      '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>' +
      '</div>')

  // Append title and form to quiz
  $('#quiz')
    .append('<h1 class="ui header">' + data.title + '</h1>')
    .append('<form id="quiz-form" class="ui form"></form>')

  // For each question of the json,
  for (let i = 0; i < data.questions.length; i++) {
    let question = data.questions[i]
	let option
	let type
	let checked
	let input
	
    if (question.input === undefined) {
      question.input = {
        type: 'input'
      }
    }

    // Construct the input depending on question type
    switch (question.input.type) {

      // Multiple options
      case 'checkbox':
      case 'radio':
        input = '<div class="inline fields">'
        for (let j = 0; j < question.input.options.length; j++) {
          option = question.input.options[j]
          type = question.input.type

          if (!!responses[i] && responses[i].indexOf(option.label) !== -1) {
            checked = 'checked'
          } else {
            checked = ''
          }

          input += '<div class="field">' +
            '<div class="ui checkbox ' + type + '">' +
            '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">' +
            '<label for="question_' + i + '_' + j + '">' + option.label + '</label>' +
            '</div>' +
            '</div>'
        }
        input += '</div>'
        break

        // Set of inputs (composed response)
      case 'inputs':
        input = '<table>'
        for ( let j = 0; j < question.input.options.length; j++) {
          option = question.input.options[j]
          type = 'checkbox'

          if (!!responses[i]) {
            value = responses[i][j]
          } else {
            value = ''
          }

          input += '<tr>' +
            '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>' +
            '<td width="15px"></td>' +
            '<td><div class="ui input">' +
            '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />' +
            '</div></td>' +
            '</tr>' +
            '<tr><td colspan="3">&nbsp;</tr></tr>'
        }
        input += '</table>'
        break

        // Default: simple input
      default:
        if (!!responses[i]) {
          value = responses[i]
        } else {
          value = ''
        }
        input = '<div class="ui input fluid">' +
          '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
          '</div>'
    }

    $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + question.problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      input +
      '</div>' +
      '</div>'
    ).css('display', 'none')

    $('#quiz-form')
      .append($question)

    // Show current question
    $('#quiz-form')
      .find('#question-' + currentQuestion)
      .css('display', 'block')

    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')
  }

  // Add button to submit response
  $('#quiz')
    .append('<button id="submit-response" class="ui primary button">Submit response</button>')

  // Is case all questions have been responded
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
    $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  // Add a reset button that will redirect to quiz start
  $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload();
  })
  $('#quiz').append($resetButton)

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    let $inputs = $('[name^=question_' + currentQuestion + ']')
    let question = questions[currentQuestion]

    // Behavior for each question type to add response to array of responses
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        responses[currentQuestion] = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function(i, input) {
          responses[currentQuestion].push(input.value)
        })
        if (responses[currentQuestion].length === 0) {
          responses[currentQuestion] = null
        }
        break
      case 'inputs':
        responses[currentQuestion] = []
        $inputs.each(function(i, input) {
          responses[currentQuestion].push(input.value)
        })
        break
      default:
        responses[currentQuestion] = $inputs.val()
    }

    // Set the current responses counter
    let responseCount = 0
    for (i = 0; i < responses.length; i++) {
      let question = questions[i]
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

    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
    let isQuestionAnswered = true
    if (!responses[currentQuestion]) {
      isQuestionAnswered = false
    }
    if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
      for (let j = 0; j < responses[currentQuestion].length; j++) {
        if (!responses[currentQuestion][j]) {
          isQuestionAnswered = false
        }
      }
    }

    if (!isQuestionAnswered) {
      // Alert user of missing response
      alert('You must give a response')
    } else {

      // Display next question
      $('#quiz-form')
        .find('#question-' + currentQuestion).css('display', 'none')
      currentQuestion = currentQuestion + 1

      $('#quiz-form')
        .find('#question-' + currentQuestion).css('display', 'block')

      // If it was the las question, display final message
      if (responseCount === questions.length) {
        $('#submit-response').css('display', 'none')
        $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
        $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
      }
    }

    // Save current state of the quiz
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  })
})
