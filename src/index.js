let options = {
  url: 'data/quiz.json?' + Date.now()
}

$.ajax({
  url: options.url
}).done(function(data) {

  let quizData;
  const {questions, title} = data

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {}
  } catch (e) {}

  let {responses = [], currentQuestion = 0, responseCount = 0} = quizData

  // Append the progress bar to DOM
  $('body')
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">' +
      '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>' +
      '</div>')

  // Append title and form to quiz
  $('#quiz')
    .append('<h1 class="ui header">' + title + '</h1>')
    .append('<form id="quiz-form" class="ui form"></form>')
  
  // For each question of the json,
  for (let i = 0; i < questions.length; i++) {
    let html
    let {input:{type, options} = {type:'input'}, problem} = questions[i]

    // Construct the input depending on question type
    switch (type) {
      // Multiple options
      case 'checkbox':
      case 'radio':
      html = '<div class="inline fields">'
        for (let j = 0; j < options.length; j++) {
          let {label} = options[j]
          let checked = !!responses[i] && responses[i].indexOf(label) !== -1 ? 'checked' : '';
          html += '<div class="field">' +
            '<div class="ui checkbox ' + type + '">' +
            '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + label + '">' +
            '<label for="question_' + i + '_' + j + '">' + label + '</label>' +
            '</div>' +
            '</div>'
        }
        html += '</div>'
        break
        // Set of inputs (composed response)
      case 'inputs':
        html = '<table>'
        for (let j = 0; j < options.length; j++) {
          let {label} = options[j];
          let value = !!responses[i] ? responses[i][j] : '';
          html += '<tr>' +
            '<td><label for="question_' + i + '_' + j + '">' + label + '</label></td>' +
            '<td width="15px"></td>' +
            '<td><div class="ui input">' +
            '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />' +
            '</div></td>' +
            '</tr>' +
            '<tr><td colspan="3">&nbsp;</tr></tr>'
        }
        html += '</table>'
        break
        // Default: simple input
      default:
        let value = !!responses[i] ? responses[i] : '';
        html = '<div class="ui input fluid">' +
          '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
          '</div>'
    }

    let $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      html +
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
  let $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload()
  })
  $('#quiz').append($resetButton)

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    let $inputs = $('[name^=question_' + currentQuestion + ']')
    let {input:{type} = ''} = questions[currentQuestion]
    responses[currentQuestion] = []
    // Behavior for each question type to add response to array of responses
    switch (type) {
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
    let responseCount = 0
    for (let i = 0; i < responses.length; i++) {
      let {input:{type} = ''} = questions[i]
      switch (type) {
        case 'checkbox':
        case 'radio':
        case 'inputs':
          responseCount += !!responses[i] && !!responses[i].join('') ? 1 : 0
          break
        default:
          responseCount += !!responses[i] ? 1 : 0
      }
    }

    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
    let isQuestionAnswered = !responses[currentQuestion] ? false : true

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

      //currentQuestion = currentQuestion + 1
      currentQuestion++

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