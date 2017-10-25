responseCount = 0
currentQuestion = 0
options = {
  url: 'data/quiz.json?' + Date.now()
}

$.ajax({
  url: options.url
}).done(function(data) {
  var responseCount = 0
  var currentQuestion = 0
  var responses = []
  const {questions} = data
  console.log(data)

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    var {responses = [], currentQuestion = -1, responseCount = -1} = quizData
  } catch (e) {}

  quizData = quizData || {responses}
    
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
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    question.input = question.input || {type: 'input'}
    // Construct the input depending on question type
    switch (question.input.type) {

      // Multiple options
      case 'checkbox':
      case 'radio':
        var input = '<div class="inline fields">'
        for (j = 0; j < question.input.options.length; j++) {
          const option = question.input.options[j]
          const type = question.input.type
          const checked = responses[i] && responses[i].indexOf(option.label) !== -1 ? 'checked' : ''

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
        for (let j = 0; j < question.input.options.length; j++) {
          const option = question.input.options[j]
          const type = 'checkbox'

          const value = responses[i] ? responses[i][j] : ''

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
        const value = responses[i] || ''
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
    const $inputs = $('[name^=question_' + currentQuestion + ']')
    let question = questions[currentQuestion]

    // Behavior for each question type to add response to array of responses
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        responses[currentQuestion] = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function(i, input) {
          responses[currentQuestion].push(input.value)
        })
        responses[currentQuestion] =responses[currentQuestion].length === 0 ? null : responses[currentQuestion].length
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
    for (let i = 0; i < responses.length; i++) {
      question = questions[i]
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
        case 'inputs':
          responses[i] && responseCount++
          break
        default:
          responses[i] && responseCount++
      }
    }

    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
    isQuestionAnswered = true
    if (!responses[currentQuestion]) {
      isQuestionAnswered = false
    }
    if (responses[currentQuestion] && responses[currentQuestion].length) {
      for (let j = 0; j < responses[currentQuestion].length; j++) {
        isQuestionAnswered = !!responses[currentQuestion][j] || false
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
    localStorage.setItem('quiz', JSON.stringify({responses, responseCount, currentQuestion}))
  })
})
