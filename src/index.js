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
  const removeFromQuizForm = element => $(element).remove()

  const updateProgress = questions => responses => {
    const responseCount = countValidResponses(responses)
    $('#progress')
      .css('width', (responseCount / questions.length * 100) + '%')
  }

  const getQuestionId = id => `question_${id}`

  const updateQuizViewStatus = questions => responses => {
    const current = countValidResponses(responses)
    const question = questions[current]
    question.input = question.input || { input: {type:'input'} }

    const nextQuestion = createQuestionElement(question)(getQuestionId(current))(responses[current])
    nextQuestion && appendToQuizForm(nextQuestion)

    const previousQuestion = document.getElementById(getQuestionId(current-1))
    previousQuestion && removeFromQuizForm(previousQuestion)

    // Is case all questions have been responded
    if (questions.length <= current ) {
      $('#submit-response').css('display', 'none')
      $('#quiz')
        .append('<div>Thank you for your responses.<br /><br /> </div>')
        .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }

    updateProgress(questions)(responses)
  }

  const resetQuiz = () => {
    localStorage.removeItem('quiz')
    location.reload();
  }

  const getInputsByName = form => {
    const inputs = Array.from(form)
    return name => inputs.filter( input => input.name.includes(name) )
  }

  const isValidResponse = response => !!response // has a value
    && !!Array.from(response).length // not an empty array
    && !!Array.from(response).reduce((value, item) => value && !!item, true) // no value is empty

  const countValidResponses = responses => responses
    .reduce( ((value, response) => value + isValidResponse(response)), 0 )

  const submitResponse = questions => () => {
    let {responses=[]} = getQuiz()
    const currentQuestion = responses.length
    const getFormInputs = getInputsByName(document.getElementById('quiz-form'))
    const inputs = getFormInputs(getQuestionId(currentQuestion))
    const response = inputs
      .filter(({checked, type}) => type === 'text' || checked ) // has checked and it's false
      .map(({value}) => value) // map to actual values

    // Set the current responses counter
    responses.push(response)

    if (!isValidResponse(response)) {
      // Alert user of missing response
      alert('You must give a response')
    } else {
      // Count valid responses
      updateQuizViewStatus(questions)(responses)
      setQuiz({responses})
    }
  }

  $.ajax({ url }).done(function(data) {
    let {questions} = data
    let {responses=[]} = getQuiz()

    setupQuizElement(data)(document.getElementById('quiz'))
    updateQuizViewStatus(questions)(responses)
  })
})($, JSON, localStorage)
