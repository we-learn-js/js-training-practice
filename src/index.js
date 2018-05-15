const options = {
  url: `data/quiz.json?${Date.now()}`
}

$.ajax({
  url: options.url
}).done(function(data) {

  // Load data from past reponses
  let quizData
  try {
    quizData = JSON.parse(localStorage.getItem('quiz')) || {}
  } catch (e) {}

  //destructuring data
  let {responses=[], responseCount=0, currentQuestion= 0} = quizData
  const {title: quizTitle, questions} = data
  questions.forEach(function(element){
    //esto podría resolverlo con destructuring en cada 'for' de más abajo, pero de esta manera siempre tengo esta key informada y
    //en los switch de más abajo puedo preguntar directamente por questions[i].input.type
    element.input === undefined ? element.input = {type:'input'} : element.input
  })


  // Append the progress bar to DOM
  $('body')
    .append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px;">
                <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
             </div>`)

  // Append title and form to quiz
  $('#quiz')
    .append(`<h1 class="ui header">${quizTitle}</h1>`)
    .append('<form id="quiz-form" class="ui form"></form>')

  // For each question of the json
  for (let i = 0; i < questions.length; i++) {
    
    let {problem:question, input:{type:inputType, options:answers}} = questions[i]
    // Construct the input depending on question type
    let input, value
    switch (inputType) {
      case 'checkbox':
      case 'radio':
        input = '<div class="inline fields">'
        for (let j = 0; j < answers.length; j++) {
          let {label: answerLabel} = answers[j]
          !!responses[i] && responses[i].indexOf(answerLabel) !== -1 ? value = 'checked' : ''
          input += `<div class="field">
                      <div class="ui checkbox ${inputType}">
                        <input type="${inputType}" ${value} name="question_${i}" id="question_${i}_${j}" value="${answerLabel}">
                        <label for="question_${i}_${j}">${answerLabel}</label>
                      </div>
                    </div>`
        }
        input += '</div>'
        break

        // Set of inputs (composed response)
      case 'inputs':
        input = '<table>'
        for (let j = 0; j < answers.length; j++) {
          let {label: answerLabel} = answers[j]
          !!responses[i] ? value = responses[i][j] : value = ''
          input += `<tr>
                      <td><label for="question_${i}_${j}">${answerLabel}</label></td>
                      <td width="15px"></td>
                      <td><div class="ui input"><input type="text" placeholder="Response..." name="question_${i}" id="question_${i}_${j}" value="${value}" /></div></td>
                    </tr>
                    <tr>
                      <td colspan="3">&nbsp;</td>
                    </tr>`
        }
        input += '</table>'
        break

        // Default: simple input
      default:
        !!responses[i] ? value = responses[i] : value = ''
        input = `<div class="ui input fluid">
                    <input type="text" placeholder="Response..." name="question_${i}" value="${value}" />
                </div>`
    }

    let $question = $(`<div id="question-${i}" class="ui card" style="width: 100%;">
                        <div class="content">
                          <div class="header">${question}</div>
                        </div>
                        <div class="content">
                          ${input}
                        </div>
                       </div>`
    ).css('display', 'none')

    $('#quiz-form')
      .append($question)

    // Show current question
    $('#quiz-form')
      .find(`#question-${currentQuestion}`)
      .css('display', 'block')

    // Update progress bar
    $('#progress')
      .css('width', `${(responseCount / questions.length * 100)}%`)
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
    location.reload();
  })
  $('#quiz').append($resetButton)

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    let $inputs = $(`[name^=question_${currentQuestion}]`)

    // Behavior for each question type to add response to array of responses
    responses[currentQuestion] = []
    switch (questions[currentQuestion].input.type) {
      case 'checkbox':
      case 'radio':
        $(`[name='${$inputs.attr('name')}']:checked`).each(function(i, input) {
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
    responseCount = 0
    for (let i = 0; i < responses.length; i++) {
      switch (questions[i].input.type) {
        case 'checkbox':
        case 'radio':
        case 'inputs':
          responseCount += !!responses[i] && !!responses[i].join('') ? 1 : 0
          break
        default:
        responseCount += responses[i] ? 1 : 0
      }
    }

    // Update progress bar
    $('#progress')
      .css('width', `${(responseCount / questions.length * 100)}%`)

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
        .find(`#question-${currentQuestion}`).css('display', 'none')
        
      currentQuestion++

      $('#quiz-form')
        .find(`#question-${currentQuestion}`).css('display', 'block')

      // If it was the las question, display final message
      if (responseCount === questions.length) {
        $('#submit-response').css('display', 'none')
        $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
        $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
      }
    }

    // Save current state of the quiz
    quizData = {responses, responseCount, currentQuestion}
    localStorage.setItem('quiz', JSON.stringify(quizData))
  })
})
