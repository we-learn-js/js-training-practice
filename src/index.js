(function($, JSON, localStorage){
  const {url} = options = {
    url: `data/quiz.json?${Date.now()}`
  }

  const getOptionsMarkup = type => options => id =>  response => {
    return '<div class="inline fields">'
      + options
        .map(({label}, j) => {
          const checked = !!response && response.includes(label) ? 'checked' : ''
          const optionId = `${id}_${j}`
          return `<div class="field">
            <div class="ui checkbox ${type}">
              <input type="${type}" ${checked} name="${id}" id="${optionId}" value="${label}">
              <label for="${optionId}">${label}</label>
            </div>
          </div>`
        }).join('')
      + '</div>'
  }

  const getInputsOptionsMarkup = options => id =>  response => {
    return '<table>'
      + options.map(({label}, j) =>  {
        const optionId = `${id}_${j}`
        const value = response && response[j] || ''
        return `<tr>
          <td><label for="${optionId}">${label}</label></td>
          <td width="15px"></td>
          <td><div class="ui input">
            <input type="text" placeholder="Response..." name="${id}" id="${optionId}" value="${value}" />
          </div></td>
          </tr>
        <tr><td colspan="3">&nbsp;</tr></tr>` }).join('')
      + '</table>'
  }

  const getInputMarkup = id =>  (response='') => `<div class="ui input fluid">
      <input type="text" placeholder="Response..." name="${id}" value="${response}" />
    </div>`

  const getCheckboxesMarkup = getOptionsMarkup('checkbox')
  const getRadiosMarkup = getOptionsMarkup('radio')

  const getQuiz = () => JSON.parse(localStorage.getItem('quiz') || null) || {}
  const setQuiz = data => localStorage.setItem('quiz', JSON.stringify(data))
  const setupQuizElement = (quizContainer, title) => {
    $(document.body)
      .append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
        <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
        </div>`)
    $(quizContainer)
      .append(`<h1 class="ui header">${title}</h1>`)
      .append('<form id="quiz-form" class="ui form"></form>')
  }
  const updateProgress = questions => responses =>
    $('#progress')
      .css('width', (responses / questions * 100) + '%')

  $.ajax({ url }).done(function(data) {
    let {questions} = data
    let {responses=[], currentQuestion=0, responseCount=0} = getQuiz()

    setupQuizElement(document.getElementById('quiz'), data.title)

    // For each question of the json,
    for (let i = 0; i < questions.length; i++) {
      questions[i].input = questions[i].input || { type:'input' }
      let {problem, input, input: {type, options}} = questions[i]
      let response = responses[i]
      let name = `question_${i}`
      let inputHtml

      // Construct the input depending on question type
      switch (type) {
        // Multiple options
        case 'checkbox':
          inputHtml = getCheckboxesMarkup(options)(name)(response)
          break
        case 'radio':
          inputHtml = getRadiosMarkup(options)(name)(response)
          break
          // Set of inputs (composed response)
        case 'inputs':
          inputHtml = getInputsOptionsMarkup(options)(name)(response)
          break
          // Default: simple input
        default:
          inputHtml = getInputMarkup(name)(response)
      }

      $question = $(`<div id="question-${i}" class="ui card" style="width: 100%;">
          <div class="content"><div class="header">${problem}</div></div>
          <div class="content">${inputHtml}</div>
        </div>`
      ).css('display', 'none')

      $('#quiz-form')
        .append($question)

      // Show current question
      $('#quiz-form')
        .find(`#question-${currentQuestion}`)
        .css('display', 'block')

      updateProgress(questions.length)(responseCount)
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
      const $inputs = $(`[name^=question_${currentQuestion}`)
      const question = questions[currentQuestion]
      let response = responses[currentQuestion]

      // Behavior for each question type to add response to array of responses
      switch (question.input.type) {
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



      // Set the current responses counter
      responses[currentQuestion] = response
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

      updateProgress(questions.length)(responseCount)

      // Check if question had a valid answer
      let isQuestionAnswered = !!response
      if (response && response.length) {
        for (let j = 0; j < response.length; j++) {
          if (!response[j]) {
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


        $('#quiz-form')
          .find(`#question-${++currentQuestion}`).css('display', 'block')

        // If it was the las question, display final message
        if (responseCount === questions.length) {
          $('#submit-response').css('display', 'none')
          $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
          $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
        }
      }

      // Save current state of the quiz
      setQuiz({responses, responseCount, currentQuestion})
    })
  })
})($, JSON, localStorage)
