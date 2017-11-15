(function($, JSON, localStorage){
  const {url} = options = {
    url: `data/quiz.json?${Date.now()}`
  }

  const DataLayer = function(JSON, localStorage) {
    const LOCAL_STORAGE_ITEM = 'quiz'
    return {
      load: () => {
        try {
          return JSON.parse(localStorage.getItem(LOCAL_STORAGE_ITEM)) || {}
        } catch (e) {
          return undefined
        }
      },
      save: (data) => {
        localStorage.setItem(LOCAL_STORAGE_ITEM, JSON.stringify(data))
      },
      reset: () => {
        localStorage.removeItem(LOCAL_STORAGE_ITEM)
        location.reload();
      }
    }
  }

  const isQuestionAnswered = (response) =>  {
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

  const changeQuestionShowState = (questionNumber, state) =>
    $('#quiz-form')
      .find(`#question-${questionNumber}`)
      .css('display', state)

  const QuestionHtmlFactory = (questionNumber, options, responses) => {
    const DEFAULT_STRATEGY = 'input'

    const createCheckboxOrRadioOption = (questionNumber, optionNumber, type, checked, label) =>
        `<div class="field">
          <div class="ui checkbox ${type}">
            <input type="${type}" ${checked} name="question_${questionNumber}" id="question_${questionNumber}_${optionNumber}" value="${label}">
            <label for="question_${questionNumber}_${optionNumber}">${label}</label>
          </div>
        </div>`
    const createCheckboxOrRadio = (type) =>
      (questionNumber, options, responses) => {
        inputHtml = '<div class="inline fields">'
        for (optionNumber = 0; optionNumber < options.length; optionNumber++) {
          const {[optionNumber]:option} = options
          const checked = !!responses[questionNumber] && responses[questionNumber].includes(option.label) ? 'checked' : ''
          inputHtml += createCheckboxOrRadioOption(questionNumber, optionNumber, type, checked, option.label)
        }
        inputHtml += '</div>'
        return inputHtml
      }

    const createMultipleInputs = (questionNumber, options, responses) => {
      inputHtml = '<table>'
      for (let j = 0; j < options.length; j++) {
        const {[j]:option} = options
        const value = responses[questionNumber] && responses[questionNumber][j] || ''

        inputHtml += `<tr>
          <td><label for="question_${questionNumber}_${j}">${option.label}</label></td>
          <td width="15px"></td>
          <td><div class="ui input">
          <input type="text" placeholder="Response..." name="question_${questionNumber}" id="question_${questionNumber}_${j}" value="${value}" />
          </div></td>
          </tr>
          <tr><td colspan="3">&nbsp;</tr></tr>`
      }
      inputHtml += '</table>'
      return inputHtml
    }

    const createSingleInput = (questionNumber, options, responses) => {
      const value = responses[questionNumber] || ''
      return `<div class="ui input fluid">
                <input type="text" placeholder="Response..." name="question_${questionNumber}" value="${value}" />
              </div>`
    }

    const strategies = {
      'checkbox': createCheckboxOrRadio('checkbox'),
      'radio': createCheckboxOrRadio('radio'),
      'inputs': createMultipleInputs,
      'input': createSingleInput
    }
    return (type) => strategies[Object.keys(strategies).find(x => x === type) || DEFAULT_STRATEGY](questionNumber, options, responses)
  }

  const UILayer = function() {
    return {
      createProgressBar: () =>
        `<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
                <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
            </div>`,
      createH1: (title) =>
        `<h1 class="ui header">${title}</h1>`,
      createForm: (id) =>
        `<form id="${id}" class="ui form"></form>`,
      updateProgressBar: ($element, value) =>
        $element.css('width', value + '%'),
      createButton: (id, text, classes) =>
        `<button id="${id}" class="${classes.join(' ')}">${text}</button>`,
      showQuestion: (questionNumber) =>
        changeQuestionShowState(questionNumber, 'block'),
      hideQuestion: (questionNumber) =>
        changeQuestionShowState(questionNumber, 'none'),
      createQuestionElement: (questions, i, responses) => {
        questions[i].input = questions[i].input || { type:'input' }
        let {problem, input, input: {type, options}} = questions[i]
        let inputHtml = QuestionHtmlFactory(i, options, responses)(type)
        return $(`<div id="question-${i}" class="ui card" style="width: 100%;">
            <div class="content"><div class="header">${problem}</div></div>
            <div class="content">${inputHtml}</div>
          </div>`
        ).css('display', 'none')
      },
      finishQuiz: () => {
          $('#submit-response').css('display', 'none')
          $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
          $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
      }
    }
  }

  const ResponseService = ($) => {
    const DEFAULT_STRATEGY = 'input'

    const getResponseCb = ($inputs) => {
      response = $.map($(`[name=${$inputs.attr('name')}]:checked`), (input) => input.value)
      return response.length ? response : null
    }
    const getResponseMultipleInputs = ($inputs) => $.map($inputs, (input) => input.value)
    const getResponseSingleInput = ($inputs) => $inputs.val()

    const strategies = {
      'checkbox': getResponseCb,
      'radio': getResponseCb,
      'inputs': getResponseMultipleInputs,
      'input': getResponseSingleInput
    }
    return ($inputs, type) => strategies[Object.keys(strategies).find(x => x === type) || DEFAULT_STRATEGY]($inputs)
  }

  $.ajax({ url }).done(function(data) {
    const dataLayer = DataLayer(JSON, localStorage)
    const uiLayer = UILayer()
    const responseService = ResponseService($)
    let {questions} = data
    let {responses=[], currentQuestion=0, responseCount=0} = dataLayer.load()
    // Append the progress bar to DOM
    $('body')
      .append(uiLayer.createProgressBar())

    $('#quiz')
      .append(uiLayer.createH1(data.title))
      .append($(uiLayer.createForm("quiz-form")).append(questions.map((element, index) =>
        uiLayer.createQuestionElement(questions, index, responses)
      )))

    // Show current question
    uiLayer.showQuestion(currentQuestion)
    // Update progress bar
    uiLayer.updateProgressBar($('#progress'), (responseCount / questions.length * 100))

    // Add button to submit response
    $('#quiz')
      .append(uiLayer.createButton("submit-response", "Submit Response", ["ui", "primary", "button"]))

    // Is case all questions have been responded
    if (responseCount === questions.length) {
      uiLayer.finishQuiz();
    }

    // Add a reset button that will redirect to quiz start

    const $resetButton = $(uiLayer.createButton(null, "Reset", ["ui", "button", "negative"])).on('click', dataLayer.reset)
    $('#quiz').append($resetButton)

    // Actions on every response submission
    $('#submit-response').on('click', function() {
      const $inputs = $(`[name^=question_${currentQuestion}`)
      const question = questions[currentQuestion]
      let response = responses[currentQuestion]
      response = responseService($inputs, question.input.type)
      responses[currentQuestion] = response
      let responseCount = responses.map(x => x && x.join('') ? 1 : 0).reduce((cur, acc) => cur + acc)
      // Update progress bar
      uiLayer.updateProgressBar($('#progress'), (responseCount / questions.length * 100))

      // Check if question had a valid answer
      if (!isQuestionAnswered(response)) {
        // Alert user of missing response
        alert('You must give a response')
      } else {
        // Display next question
        uiLayer.hideQuestion(currentQuestion)
        uiLayer.showQuestion(++currentQuestion)
        // If it was the las question, display final message
        if (responseCount === questions.length) {
          uiLayer.finishQuiz();
        }
      }

      dataLayer.save({responses, responseCount, currentQuestion})
    })
  })
})($, JSON, localStorage)
