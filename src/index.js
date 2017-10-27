const $quiz = $('#quiz')
const QUIZ_LOCALSTORAGE = 'quiz'

const options = {
  url: 'data/quiz.json?' + Date.now()
}

$.ajax({
  url: options.url
}).done(function(data) {

  var responseCount = 0,
      currentQuestion = 0,
      responses = [],
      quizData = []

  const {questions} = data

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem(QUIZ_LOCALSTORAGE))
    var { responses = [], currentQuestion = -1, responseCount = -1 } = quizData
  } catch (e) {}

  quizData = quizData || {responses}

  // Append the progress bar to DOM
  $('body')
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">' +
      '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>' +
      '</div>')

  const $progressBar = $('#progress')

  // Append title and form to quiz
  $quiz
    .append('<h1 class="ui header">' + data.title + '</h1>')
    .append('<form id="quiz-form" class="ui form"></form>')

  const $form = $('#quiz-form')

  // For each question of the json,
  for (let i = 0; i < data.questions.length; i++) {
    question = data.questions[i]

    question.input = question.input || { type: 'input' }

    // Construct the input depending on question type
    switch (question.input.type) {

      // Multiple options
      case 'checkbox':
      case 'radio':
        var input = '<div class="inline fields">'
        for (let j = 0; j < question.input.options.length; j++) {
          let option = question.input.options[j]
          let type = question.input.type

          let checked = responses[i] && responses[i].indexOf(option.label) !== -1 ? 'checked' : ''

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
        var input = '<table>'
        for (let j = 0; j < question.input.options.length; j++) {
          let option = question.input.options[j]
          const type = 'checkbox'
          let value = responses[i] ? responses[i][j] : ''

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
        let value = responses[i] || ''
        var input = '<div class="ui input fluid">' +
          '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
          '</div>'
    }

    let $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + question.problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      input +
      '</div>' +
      '</div>'
    ).css('display', 'none')

    $form
      .append($question)

    // Show current question
    $form
      .find('#question-' + currentQuestion)
      .css('display', 'block')

    // Update progress bar
    $progressBar
      .css('width', (responseCount / questions.length * 100) + '%')
  }

  // Add button to submit response
  $quiz
    .append('<button id="submit-response" class="ui primary button">Submit response</button>')

  const $submitButton = $('#submit-response')

  // Is case all questions have been responded
  if (responseCount === questions.length) {
    $submitButton.css('display', 'none')
    $quiz.append('<div>Thank you for your responses.<br /><br /> </div>')
    $quiz.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  // Add a reset button that will redirect to quiz start
  $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem(QUIZ_LOCALSTORAGE)
    location.reload();
  })
  $quiz.append($resetButton)

  // Actions on every response submission
  $submitButton.on('click', function() {
    var $inputs = $('[name^=question_' + currentQuestion + ']')
    var question = questions[currentQuestion]

    responses[currentQuestion] = []
    // Behavior for each question type to add response to array of responses
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        $('[name=' + $inputs.attr('name') + ']:checked').each(function(i, input) {
          responses[currentQuestion].push(input.value)
        })
        if (responses[currentQuestion].length === 0) {
          responses[currentQuestion] = null
        }
        break
      case 'inputs':
        $inputs.each(function(i, input) {
          responses[currentQuestion].push(input.value)
        })
        break
      default:
        responses[currentQuestion] = $inputs.val()
    }

    // Set the current responses counter
    var responseCount = 0
    for (let i = 0; i < responses.length; i++) {
      if (responses[i]) {
        responseCount++
      }
    }

    // Update progress bar
    $progressBar
      .css('width', (responseCount / questions.length * 100) + '%')

    isQuestionAnswered = responses[currentQuestion] ? true : false 

    if (isQuestionAnswered) {
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
      $form
        .find('#question-' + currentQuestion).css('display', 'none')

      $form
        .find('#question-' + ++currentQuestion).css('display', 'block')

      // If it was the las question, display final message
      if (responseCount === questions.length) {
        $submitButton.css('display', 'none')
        $quiz.append('<div>Thank you for your responses.<br /><br /> </div>')
        $quiz.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
      }
    }

    // Save current state of the quiz
    localStorage.setItem(QUIZ_LOCALSTORAGE, JSON.stringify({responses, responseCount, currentQuestion}))
  })
})
