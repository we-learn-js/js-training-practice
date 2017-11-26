function runApp($, JSON, localStorage) {

let options = {
  url: 'data/quiz.json?' + Date.now()
}

$.ajax({
  url: options.url
}).done(function(data) {
  const questions = data.questions

  var quizData
  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {}
  } catch (e) {}

  let { responses = [], currentQuestion: currentQuestionIndex = 0, responseCount = 0 } = quizData

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
    question.input = question.input || { type: 'input' }

    let { input: { type, options }, problem } = question

    let questionInputHtml
    // Construct the input depending on question type
    switch (type) {

      // Multiple options
      case 'checkbox':
      case 'radio':
        questionInputHtml = '<div class="inline fields">'
        for (let j = 0; j < options.length; j++) {
          var option = options[j]
          let checked = responses[i] && responses[i].indexOf(option.label) !== -1 ? 'checked' : ''

          questionInputHtml += '<div class="field">' +
            '<div class="ui checkbox ' + type + '">' +
            '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">' +
            '<label for="question_' + i + '_' + j + '">' + option.label + '</label>' +
            '</div>' +
            '</div>'
        }
        questionInputHtml += '</div>'
        break

        // Set of inputs (composed response)
      case 'inputs':
        questionInputHtml = '<table>'
        for (let j = 0; j < options.length; j++) {
          var option = options[j]
          let value = responses[i] ? responses[i][j] : ''

          questionInputHtml += '<tr>' +
            '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>' +
            '<td width="15px"></td>' +
            '<td><div class="ui input">' +
            '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />' +
            '</div></td>' +
            '</tr>' +
            '<tr><td colspan="3">&nbsp;</tr></tr>'
        }
        questionInputHtml += '</table>'
        break

        // Default: simple input
      default:
        let value = responses[i] ? responses[i] : ''
        questionInputHtml = '<div class="ui input fluid">' +
          '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
          '</div>'
    }

    $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      questionInputHtml +
      '</div>' +
      '</div>'
    ).css('display', 'none')

    $('#quiz-form')
      .append($question)

    // Show current question
    $('#quiz-form')
      .find('#question-' + currentQuestionIndex)
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
  const $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload();
  })
  $('#quiz').append($resetButton)

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    const $inputs = $('[name^=question_' + currentQuestionIndex + ']')
    const currentQuestion = questions[currentQuestionIndex]
    let currentResponse = responses[currentQuestionIndex]

    // Behavior for each question type to add response to array of responses
    switch (currentQuestion.input.type) {
      case 'checkbox':
      case 'radio':
        currentResponse = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function(i, input) {
          currentResponse.push(input.value)
        })
        if (currentResponse.length === 0) {
          currentResponse = null
        }
        break
      case 'inputs':
        currentResponse = []
        $inputs.each(function(i, input) {
          currentResponse.push(input.value)
        })
        break
      default:
        currentResponse = $inputs.val()
    }

    responses[currentQuestionIndex] = currentResponse

    // Set the current responses counter
    let responseCount = 0
    for (let i = 0; i < responses.length; i++) {
      let question = questions[i]
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
        case 'inputs':
          responses[i] && responses[i].join('') && responseCount++
          break
        default:
          responses[i] && responseCount++
      }
    }

    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
    let isQuestionAnswered = !!currentResponse

    if (currentResponse && currentResponse.length) {
      for (let j = 0; j < currentResponse.length; j++) {
        if (!currentResponse[j]) {
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
        .find('#question-' + currentQuestionIndex).css('display', 'none')
      currentQuestionIndex = currentQuestionIndex + 1

      $('#quiz-form')
        .find('#question-' + currentQuestionIndex).css('display', 'block')

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
    quizData.currentQuestion = currentQuestionIndex
    localStorage.setItem('quiz', JSON.stringify(quizData))
  })
})

}

runApp($, JSON, localStorage)
