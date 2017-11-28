(function($, JSON, localStorage){
  console.clear()
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
  const setupQuizElement = ({title, questions}) => (quizContainer) => {
    const $resetButton = $('<button class="ui button negative">Reset</button>')
    const $submitButton = $('<button id="submit-response" class="ui primary button">Submit response</button>')
    $resetButton.on('click', resetQuiz)
    $submitButton.on('click', submitResponse(questions))

    $(quizContainer)
      .append(`<h1 class="ui header">${title}</h1>`)
      .append('<form id="quiz-form" class="ui form"></form>')
      .append($submitButton)
      .append($resetButton)

    $(document.body)
      .append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
        <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
        </div>`)
  }
  const createQuestionElement = ({problem, input, input: {type, options}}) => name => response => {
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

    return $(`<div id="${name}" class="ui card" style="width: 100%;">
        <div class="content"><div class="header">${problem}</div></div>
        <div class="content">${inputHtml}</div>
      </div>`
    ).get(0)
  }
  const appendToQuizForm = element => $('#quiz-form').append(element)

  const updateProgress = questions => responses =>
    $('#progress')
      .css('width', (responses / questions * 100) + '%')

  const updateQuizViewStatus = questions => current => {
    $('#quiz-form')
      .find(`.card[id^=question_]`)
      .css('display', 'none')
    $('#quiz-form')
      .find(`#question_${current}`)
      .css('display', 'block')

    // Is case all questions have been responded
    if (questions <= current ) {
      $('#submit-response').css('display', 'none')
      $('#quiz')
        .append('<div>Thank you for your responses.<br /><br /> </div>')
        .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }
  }

  const setupQuestions = questions => responses => {
    const defaultInput = { input: {type:'input'} }
    questions
      .map(question => question.input ? question : Object.assign({}, defaultInput, question))
      .map((question, i) => createQuestionElement(question)(`question_${i}`)(responses[i]))
      .map(appendToQuizForm)
  }

  const resetQuiz = () => {
    localStorage.removeItem('quiz')
    location.reload();
  }

  const getInputsByName = form => {
    const inputs = Array.from(form)
    return name => inputs.filter( input => input.name.includes(name) )
  }



  const submitResponse = questions => () => {
    let {responses=[], currentQuestion=0} = getQuiz()
    const {input:{type}={}} = questions[currentQuestion]
    const getFormInputs = getInputsByName(document.getElementById('quiz-form'))
    const inputs = getFormInputs(`question_${currentQuestion}`)

    // Behavior for each question type to add response to array of responses
    switch (type) {
      case 'checkbox':
      case 'radio':
        response = inputs
          .filter(({checked}) => checked)
          .map(({value}) => value)
        response = response.length ? response : null
        break
      case 'inputs':
        response = inputs
          .map(({value}) => value)
        break
      default:
        response = inputs
          .map(({value}) => value)[0]
    }

    // Set the current responses counter
    responses[currentQuestion] = response
    let responseCount = 0
    for (let i = 0; i < responses.length; i++) {
      let question = questions[i]
      let response = responses[i]

      switch (question.input && question.input.type) {
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
      updateQuizViewStatus(questions.length)(++currentQuestion)
    }

    // Save current state of the quiz
    setQuiz({responses, responseCount, currentQuestion})
  }

  $.ajax({ url }).done(function(data) {
    let {questions} = data
    let {responses=[], currentQuestion=0, responseCount=0} = getQuiz()

    setupQuizElement(data)(document.getElementById('quiz'))
    setupQuestions(questions)(responses)
    updateQuizViewStatus(questions.length)(currentQuestion)
    updateProgress(questions.length)(responseCount)
  })
})($, JSON, localStorage)
