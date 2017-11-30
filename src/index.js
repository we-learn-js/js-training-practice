(function($, JSON, localStorage){
  const {url} = options = {
    url: `data/quiz.json?${Date.now()}`
  }

  $.ajax({ url }).done(function(data) {
    let {questions} = data

    let quizData = loadDataFromPastResponses()
    let {responses=[], currentQuestion=0, responseCount=0} = quizData

    appendProgressBarToDOM()
    appendTitleAndFormToQuiz(data.title)

    appendQuizQuestions(questions, responses)

    showQuestion(currentQuestion)
    updateProgressBar(responseCount, questions.length)

    addSubmitQuizResponseButton()

    showIfAllQuestionsResponded(responseCount, questions)

    addResetButton(localStorage, location)

    // Actions on every response submission
    $('#submit-response').on('click', function() {
      let response = addQuestionTypeResponseBehavior(questions, responses, currentQuestion)
      responses[currentQuestion] = response

      let responseCount = computeCurrentReponsesCounter(questions, responses)
      updateProgressBar(responseCount, questions.length)

      let isQuestionAnswered = isValidAnswer(response)

      if (!isQuestionAnswered) {
        // Alert user of missing response
        alert('You must give a response')
      } else {

        currentQuestion = displayNextQuestion(currentQuestion)

        displayFinalMessageIfLastQuestion(responseCount, questions)
      }

      saveCurrentStateOfQuiz(responses, responseCount, currentQuestion)
    })
  })
})($, JSON, localStorage)

function loadDataFromPastResponses() {
  let quizData

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {}
  } catch (e) {}

  return quizData
}

function saveCurrentStateOfQuiz(responses, responseCount, currentQuestion) {
  // Save current state of the quiz
  localStorage.setItem('quiz', JSON.stringify({responses, responseCount, currentQuestion}))
}

function appendProgressBarToDOM() {
  // Append the progress bar to DOM
  $('body')
    .append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
      <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
      </div>`)
}

function updateProgressBar(responseCount, questionsLength) {
  // Update progress bar
  $('#progress')
    .css('width', (responseCount / questionsLength * 100) + '%')
}

function appendTitleAndFormToQuiz(title) {
  // Append title and form to quiz
  $('#quiz')
    .append(`<h1 class="ui header">${title}</h1>`)
    .append('<form id="quiz-form" class="ui form"></form>')
}

function constructQuestionInputHtml(questionIndex, type, options, responses) {
  let inputHtml
  let i = questionIndex

  // Construct the input depending on question type
  switch (type) {

    // Multiple options
    case 'checkbox':
    case 'radio':
      inputHtml = '<div class="inline fields">'
      for (j = 0; j < options.length; j++) {
        const {[j]:option} = options
        const checked = !!responses[i] && responses[i].includes(option.label) ? 'checked' : ''

        inputHtml += `<div class="field">
          <div class="ui checkbox ${type}">
          <input type="${type}" ${checked} name="question_${i}" id="question_${i}_${j}" value="${option.label}">
          <label for="question_${i}_${j}">${option.label}</label>
          </div>
          </div>`
      }
      inputHtml += '</div>'
      break

      // Set of inputs (composed response)
    case 'inputs':
      inputHtml = '<table>'
      for (let j = 0; j < options.length; j++) {
        const {[j]:option} = options
        const value = responses[i] && responses[i][j] || ''

        inputHtml += `<tr>
          <td><label for="question_${i}_${j}">${option.label}</label></td>
          <td width="15px"></td>
          <td><div class="ui input">
          <input type="text" placeholder="Response..." name="question_${i}" id="question_${i}_${j}" value="${value}" />
          </div></td>
          </tr>
          <tr><td colspan="3">&nbsp;</tr></tr>`
      }
      inputHtml += '</table>'
      break

      // Default: simple input
    default:
      const value = responses[i] || ''
      inputHtml = `<div class="ui input fluid">
        <input type="text" placeholder="Response..." name="question_${i}" value="${value}" />
        </div>`
  }

  return inputHtml
}

function addSubmitQuizResponseButton() {
  // Add button to submit response
  $('#quiz')
    .append('<button id="submit-response" class="ui primary button">Submit response</button>')
}

function showQuestion(currentQuestion) {
  // Show current question
  $('#quiz-form')
    .find(`#question-${currentQuestion}`)
    .css('display', 'block')
}

function appendQuizQuestion(questionIndex, problem, inputHtml) {
  let i = questionIndex

  $question = $(`<div id="question-${i}" class="ui card" style="width: 100%;">
      <div class="content"><div class="header">${problem}</div></div>
      <div class="content">${inputHtml}</div>
    </div>`
  ).css('display', 'none')

  $('#quiz-form')
    .append($question)
}

function appendQuizQuestions(questions, responses) {
  // For each question of the json,
  for (let i = 0; i < questions.length; i++) {
    questions[i].input = questions[i].input || { type:'input' }
    let {problem, input, input: {type, options}} = questions[i]
    let inputHtml = constructQuestionInputHtml(i, type, options, responses)

    appendQuizQuestion(i, problem, inputHtml)
  }
}

function addResetButton(localStorage, location) {
  // Add a reset button that will redirect to quiz start
  const $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload();
  })
  $('#quiz').append($resetButton)
}

function addQuestionTypeResponseBehavior(questions, responses, currentQuestion) {
  const question = questions[currentQuestion]
  const type = question.input.type
  const $inputs = $(`[name^=question_${currentQuestion}`)
  let response = responses[currentQuestion]

  // Behavior for each question type to add response to array of responses
  switch (type) {
    case 'checkbox':
    case 'radio':
      response = []
      $(`[name=${$inputs.attr('name')}]:checked`).each(function(i, input) {
        response.push(input.value)
      })
      response = response.length ? response : null
      break
    case 'inputs':
      response = []
      $inputs.each(function(i, input) {
        response.push(input.value)
      })
      break
    default:
      response = $inputs.val()
  }

  return response
}

function computeCurrentReponsesCounter(questions, responses) {
  // Set the current responses counter
  let responseCount = 0
  for (let i = 0; i < responses.length; i++) {
    let question = questions[i]
    let response = responses[i]
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        responseCount += !!response && !!response.join('')
        break
      default:
        responseCount += !!response
    }
  }

  return responseCount
}

function isValidAnswer(response) {
  // Check if question had a valid answer
  let isQuestionAnswered = !!response
  if (response && response.length) {
    for (let j = 0; j < response.length; j++) {
      if (!response[j]) {
        isQuestionAnswered = false
      }
    }
  }

  return isQuestionAnswered
}

function displayNextQuestion(currentQuestionIndex) {
  let currentQuestion = currentQuestionIndex
  // Display next question
  $('#quiz-form')
    .find(`#question-${currentQuestion}`).css('display', 'none')

  $('#quiz-form')
    .find(`#question-${++currentQuestion}`).css('display', 'block')

  return currentQuestion
}

function displayFinalMessageIfLastQuestion(responseCount, questions) {
  // If it was the las question, display final message
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
    $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }
}

function showIfAllQuestionsResponded(responseCount, questions) {
  // Is case all questions have been responded
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
    $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }
}
