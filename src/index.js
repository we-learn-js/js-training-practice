options = {
  url: 'data/quiz.json?' + Date.now()
}

function createCheckboxOrRadioHtml(input, responses, i) {
  let inputHtml = '<div class="inline fields">'
  for (j = 0; j < input.options.length; j++) {
    var option = input.options[j]
    var type = input.type
    var checked = responses[i] && responses[i].indexOf(option.label) !== -1 ? 'checked': ''
    inputHtml += '<div class="field">' +
      '<div class="ui checkbox ' + type + '">' +
      '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">' +
      '<label for="question_' + i + '_' + j + '">' + option.label + '</label>' +
      '</div>' +
      '</div>'
  }
  inputHtml += '</div>'
  return inputHtml
}

function createInputsHtml(input, responses, i) {
  let inputHtml = '<table>'
  for (j = 0; j < input.options.length; j++) {
    const option = input.options[j]
    const type = 'checkbox'
    const value = responses[i] ? responses[i][j] : ''

    inputHtml += '<tr>' +
      '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>' +
      '<td width="15px"></td>' +
      '<td><div class="ui input">' +
      '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />' +
      '</div></td>' +
      '</tr>' +
      '<tr><td colspan="3">&nbsp;</tr></tr>'
  }
  inputHtml += '</table>'
  return inputHtml
}

function createInputHtml(input, responses, i) {
  const value = responses[i] || ''
  return '<div class="ui input fluid">' +
    '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
    '</div>'
}

function HtmlInputFactory(input, responses, i) {
  let htmlCreationStrategies = {
    'checkbox': createCheckboxOrRadioHtml,
    'radio': createCheckboxOrRadioHtml,
    'inputs': createInputsHtml,
    'input': createInputHtml
  }
  return htmlCreationStrategies.hasOwnProperty(input.type) &&
  htmlCreationStrategies[input.type](input, responses, i)
}

$.ajax({
  url: options.url
}).done(function(data) {
  // Load data from past reponses
  const {questions} = data
  var responseCount = 0
  var currentQuestion = 0
  var responses = []
  var quizData = {responses}
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    var {responses = [], currentQuestion = -1, responseCount = -1} = quizData
  } catch (e) {}

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
    let {problem, input = {type: 'input'} } = questions[i]

    // Construct the input depending on question type
    $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      HtmlInputFactory(input, responses, i) +
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
  const $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload();
  })
  $('#quiz').append($resetButton)

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    const $inputs = $('[name^=question_' + currentQuestion + ']')
    let {input = {type: 'input'} } = questions[currentQuestion]

    // Behavior for each question type to add response to array of responses
    responses[currentQuestion] = []
    switch (input.type) {
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

    var responseCount = responses.map(r => r ? 1 : 0).reduce((acc, cur) => acc + cur)
    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
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
      // Alert user of missing response
      alert('You must give a response')
    } else {

      // Display next question
      $('#quiz-form')
        .find('#question-' + currentQuestion).css('display', 'none')
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
    localStorage.setItem('quiz', JSON.stringify({responses, responseCount, currentQuestion}))
  })
})
