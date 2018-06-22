let options = {url: `data/quiz.json? ${Date.now()}`}

function loadResponses() {
  let quizData
  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {responses: [], responseCount: 0, currentQuestion: 0}
  } catch (e) {}
  return quizData
}

function saveResponses(responses, responseCount, currentQuestion) {
  let quizData = {responses, responseCount, currentQuestion}
  localStorage.setItem('quiz', JSON.stringify(quizData))
}

function appendProgressBar() {
  $('body')
    .append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
      <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
      </div>`)
}

function appendTitle(title) {
  $('#quiz')
    .append(`<h1 class="ui header"> ${title} </h1>
             <form id="quiz-form" class="ui form"></form>`)
}

function buildInput(i, type, options, responses) {
  let input 
  switch (type) {  

    // Multiple options
    case 'checkbox':
    case 'radio':
      input = '<div class="inline fields">'
      options.forEach((option, j) => {
        let checked = responses[i] && responses[i].indexOf(option.label) !== -1 ? 'checked' : ''

        input += `<div class="field">
          <div class="ui checkbox ${type}">
          <input type="${type}" ${checked} name="question_${i}" id="question_${i}_${j}" value="${option.label}">
          <label for="question_${i}_${j}">${option.label}</label>
          </div>
          </div>`
      })
      input += '</div>'
      break

    // Set of inputs (composed response)
    case 'inputs':
      input = '<table>'
      options.forEach((option, j) => {
        let value = responses[i] ? responses[i][j] : ''
        
        input += `<tr>
          <td><label for="question_${i}_${j}">${option.label}</label></td>
          <td width="15px"></td>
          <td><div class="ui input">
          <input type="text" placeholder="Response..." name="question_${i}" id="question_${i}_${j}" value="${value}" />
          </div></td>
          </tr>
          <tr><td colspan="3">&nbsp;</tr></tr>`
      })
      input += '</table>'
      break

    // Default: simple input
    default:
      let value = responses[i] ? responses[i] : ''
      
      input = `<div class="ui input fluid">
        <input type="text" placeholder="Response..." name="question_${i}" value="${value}" />
        </div>`
  }
  return input
}

function appendQuestion(i, question, input) {
  const $question = $(`<div id="question-${i}" class="ui card" style="width: 100%;">
      <div class="content">
      <div class="header">${question.problem}</div>
      </div>
      <div class="content">
      ${input}
      </div>
      </div>`
    ).css('display', 'none')

  $('#quiz-form')
    .append($question)
}

function showCurrentQuestion(currentQuestion) {
  $('#quiz-form')
      .find(`#question-${currentQuestion}`)
      .css('display', 'block')
}

function updateProgressBar(responseCount, questions) {
  $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')
}

function checkAllQuestionsAnswered(responseCount, questions) {
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
    $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }
}

function addResetButton() {
  const $resetButton = $('<button class="ui button negative">Reset</button>')
  $resetButton.on('click', function() {
    localStorage.removeItem('quiz')
    location.reload();
  })
  $('#quiz').append($resetButton)
}

function putResponsesIntoArray(question, $inputs, responses, currentQuestion) {
  let result = responses.map(item => item)

  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      result[currentQuestion] = []
      $(`[name=${$inputs.attr('name')}]:checked`).each((i, input) =>{
        result[currentQuestion].push(input.value)
      })
      if (result[currentQuestion].length === 0) {
        result[currentQuestion] = null
      }
      break
    case 'inputs':
      result[currentQuestion] = []
      $inputs.each((i, input) => {
        result[currentQuestion].push(input.value)
      })
      break
    default:
      result[currentQuestion] = $inputs.val()
  }
  return result
}

function getResponseCount(responses, questions) {
  let responseCount = 0
  responses.forEach((response, i) => {
    let question = questions[i]
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        if (response && response.join('')) {
          responseCount++
        }
        break
      default:
        if (response) {
          responseCount++
        }
    }
  })
  return responseCount
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function checkIfQuestionAnswered(responses, currentQuestion) {
  let isQuestionAnswered = !responses[currentQuestion] ? false : true
    
  if (responses[currentQuestion] && responses[currentQuestion].length && isArray(responses[currentQuestion])) {
    responses[currentQuestion].forEach((response) => {
      if (!response) {
        isQuestionAnswered = false
      }
    })
  }
  return isQuestionAnswered
}

function displayNextQuestion(currentQuestion) {
  let result = currentQuestion
  $('#quiz-form')
        .find(`#question-${result}`).css('display', 'none')
        result++

      $('#quiz-form')
        .find(`#question-${result}`).css('display', 'block')
  return result
}

function checkForFinalMessage(responseCount, questions) {
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $('#quiz').append(`<div>Thank you for your responses.<br /><br /> </div>
                       <button class="ui primary button" onclick="window.print()" >Print responses</button>`)
  }
}

$.ajax({
  url: options.url
}).done((data) => {
  const { questions , title} = data;

  // Load data from past reponses
  let quizData = loadResponses()
  let {currentQuestion=0, responseCount=0, responses=[]} = quizData
  
  // Append the progress bar to DOM
  appendProgressBar()
  
  // Append title and form to quiz
  appendTitle(title)
  
  // For each question of the json,
  questions.forEach((question, i) => {
    const {input: {type= 'input', options=[]} = {}, problem} = question
          
    if (question.input === undefined) {
      question.input = {
        type: 'input'
      }
    }

    // Construct the input depending on question type
    let input = buildInput(i, type, options, responses)   
    appendQuestion(i, question, input)

    // Show current question
    showCurrentQuestion(currentQuestion)

    // Update progress bar
    updateProgressBar(responseCount, questions)
  })

  // Add button to submit response
  $('#quiz')
    .append('<button id="submit-response" class="ui primary button">Submit response</button>')

  // Is case all questions have been responded
  checkAllQuestionsAnswered(responseCount, questions)

  // Add a reset button that will redirect to quiz start
  addResetButton()

  // Actions on every response submission
  $('#submit-response').on('click', () => {
    
    const $inputs = $(`[name^=question_${currentQuestion}]`)
    let question = questions[currentQuestion]

    // Behavior for each question type to add response to array of responses
    responses = putResponsesIntoArray(question, $inputs, responses, currentQuestion)

    // Set the current responses counter
    let responseCount = getResponseCount(responses, questions)

    // Update progress bar
    updateProgressBar(responseCount, questions)

    // Check if question had a valid answer
    if (!checkIfQuestionAnswered(responses, currentQuestion)) {
      // Alert user of missing response
      alert('You must give a response')
    } else {

      // Display next question
      currentQuestion = displayNextQuestion(currentQuestion)
      
      // If it was the las question, display final message
      checkForFinalMessage(responseCount, questions)
    }

    // Save current state of the quiz
    saveResponses(responses, responseCount, currentQuestion)
  })
})