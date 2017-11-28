
const options = {
  url: 'data/quiz.json?' + Date.now()
}

$.ajax(options).done(function(data) {
  let quizData
  const {questions} = data  

  // Load data from past reponses

  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {}
    //responseCount = quizData.responseCount || -1
  } catch (e) {
    quizData = {}
  }
  console.log("POTATO", quizData)
  let {responseCount = 0, currentQuestion = 0, responses = []} =  quizData
  

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
    const question = data.questions[i]
    question.input = question.input || { type: 'input' }
    const {input, problem, input: {type, options}} = question

    // Construct the input depending on question type
    let output
    switch (type) {

      // Multiple options
      case 'checkbox':
      case 'radio':
        output = '<div class="inline fields">'
        for (let j = 0; j < options.length; j++) {
          const {[j] : option} = options
          const checked = (responses[i] && responses[i].indexOf(option.label) !== -1) 
            ? 'checked'
            :  ''
        
            output += '<div class="field">' +
            '<div class="ui checkbox ' + type + '">' +
            '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">' +
            '<label for="question_' + i + '_' + j + '">' + option.label + '</label>' +
            '</div>' +
            '</div>'
        }
        output += '</div>'
        break

        // Set of inputs (composed response)
      case 'inputs':
      output = '<table>'
        for (let j = 0; j < options.length; j++) {
          const {[j]: option} = options
          const value = responses[i] && responses[i][j] || ''
          
          output += '<tr>' +
            '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>' +
            '<td width="15px"></td>' +
            '<td><div class="ui input">' +
            '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />' +
            '</div></td>' +
            '</tr>' +
            '<tr><td colspan="3">&nbsp;</tr></tr>'
        }
        output += '</table>'
        break
        // Default: simple input
      default:
        const {[i]:value = ''} = responses
        output = '<div class="ui input fluid">' +
          '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />' +
          '</div>'
    }

    const $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">' +
      '<div class="content">' +
      '<div class="header">' + problem + '</div>' +
      '</div>' +
      '<div class="content">' +
      output +
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
    const {[currentQuestion]: question} = questions
    const {type} = question.input
    // Behavior for each question type to add response to array of responses
    switch (type) {
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
    const responseCount = responses.filter((response) => response).length
    
    // Update progress bar
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')

    // Check if question had a valid answer
    const isQuestionAnswered = responses[currentQuestion] && responses[currentQuestion].filter((question)=>question).length
    

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
    quizData = {responses, responseCount, currentQuestion}
    //quizData.responseCount = responseCount
    //quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  })
})
