class ViewHandler {
        
    appendProgressBarToDom = () => {
        $('body')
        .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">' +
          '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>' +
          '</div>')    
    }
    
    appendTitleAndFormToQuiz = (title) => {
        $('#quiz')
        .append('<h1 class="ui header">' + title + '</h1>')
        .append('<form id="quiz-form" class="ui form"></form>')    
    }
    
    appendQuestionToQuizForm = (question, response, questionIndex) => {
        const input = this._constructDivQuestionInput(question.input, response, questionIndex)
        $question = this._constructDivQuestion(question.problem, input, questionIndex)

        $('#quiz-form')
          .append($question)
    }

    showQuestion(questionIndex) {
        $('#quiz-form')
        .find('#question-' + questionIndex)
        .css('display', 'block')
    }

    hideQuestion(questionIndex) {
        $('#quiz-form')
        .find('#question-' + questionIndex)
        .css('display', 'none')
    }    

    showModalMessage(message) {
        alert(message)
    }
    
    updateProgressBar(responseCount, questionsLength) {
        $('#progress')
            .css('width', (responseCount / questionsLength * 100) + '%')  
    }
    
    addButtonToSubmitResponse() {
        $('#quiz')
            .append('<button id="submit-response" class="ui primary button">Submit response</button>')
    }    

    showPrintResponsesButton() {
        $('#submit-response').css('display', 'none')
        $('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>')
        $('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')        
    }

    addResetButton() {
        const $resetButton = $('<button class="ui button negative">Reset</button>')
        $resetButton.on('click', function() {
          localStorage.removeItem('quiz')
          location.reload();
        })
        
        $('#quiz').append($resetButton)        
    }

    _getMultipleOptionsInput(questionInput, response, questionIndex) {
        let input = '<div class="inline fields">'
        for (let j = 0; j < questionInput.options.length; j++) {
        let option = questionInput.options[j]
        let type = questionInput.type
        let checked = ''

        if (!!response && response.indexOf(option.label) !== -1) {
            checked = 'checked'
        }

        input += '<div class="field">' +
            '<div class="ui checkbox ' + type + '">' +
            '<input type="' + type + '" ' + checked + ' name="question_' + questionIndex + '" id="question_' + 
            questionIndex + '_' + j + '" value="' + option.label + '">' +
            '<label for="question_' + questionIndex + '_' + j + '">' + option.label + '</label>' +
            '</div>' +
            '</div>' + 
            '</div>'
        }
    
        return input        
    }

    _getMultipleInputs(questionInput, response, questionIndex) {
        let input = '<table>'
        for (let j = 0; j < questionInput.options.length; j++) {
        var option = questionInput.options[j]
        var type = 'checkbox'

        if (!!response) {
            var value = response[j]
        } else {
            var value = ''
        }

        input += '<tr>' +
            '<td><label for="question_' + questionIndex + '_' + j + '">' + option.label + 
            '</label></td>' +
            '<td width="15px"></td>' +
            '<td><div class="ui input">' +
            '<input type="text" placeholder="Response..." name="question_' + questionIndex + 
            '" id="question_' + questionIndex + '_' + j + '" value="' + value + '" />' +
            '</div></td>' +
            '</tr>' +
            '<tr><td colspan="3">&nbsp;</tr></tr>' +
            '</table>'
        }

        return input
    }

    _getSimpleInput(questionInput, response, questionIndex) {
        if (!!response) {
            var value = response
        } else {
            var value = ''
        }
        
        const input = '<div class="ui input fluid">' +
            '<input type="text" placeholder="Response..." name="question_' + questionIndex + 
            '" value="' + value + '" />' +
            '</div>'
        
        return input
    }

    _constructDivQuestionInput = (questionInput, response, questionIndex) => {
        let input 
    
        switch (questionInput.type) {
            case 'checkbox':
            case 'radio':
                input = this._getMultipleOptionsInput(questionInput, response, questionIndex)
                break
            case 'inputs':
                input = this._getMultipleInputs(questionInput, response, questionIndex)
                break
            default:
                input = this._getSimpleInput()
                break
        }
        
        return input
    }
    
    _constructDivQuestion = (questionProblem, input, questionIndex) => {
        return $(
            '<div id="question-' + questionIndex + '" class="ui card" style="width: 100%;">' +
                '<div class="content">' +
                    '<div class="header">' + questionProblem + '</div>' +
                '</div>' +
                '<div class="content">' +
                    input +
                '</div>' +
            '</div>'
        ).css('display', 'none')    
    }    
}


var responseCount, currentQuestion, options,
questions, responses, quizData, question, j,
$question, $resetButton, isQuestionAnswered

responseCount = 0
currentQuestion = 0
options = {
  url: 'data/quiz.json?' + Date.now()
}

const viewHandler = new ViewHandler()

$.ajax({
  dataType: "json",
  url: options.url
}).done(function(data) {
  questions = data.questions

  // Load data from past reponses
  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    responses = quizData.responses || []
    currentQuestion = quizData.currentQuestion || -1
    responseCount = quizData.responseCount || -1
  } catch (e) {}

  if (quizData == null) {
    quizData = {
      responses: []
    }
    responses = quizData.responses
  }

  viewHandler.appendProgressBarToDom()
  viewHandler.appendTitleAndFormToQuiz(data.title)

  // For each question of the json,
  for (var i = 0; i < data.questions.length; i++) {
    question = data.questions[i]
    question.input = initQuestionInput(question.input)
    viewHandler.appendQuestionToQuizForm(question, responses[i], i)
  }

  viewHandler.showQuestion(currentQuestion)
  viewHandler.updateProgressBar(responseCount, questions.length)
  viewHandler.addButtonToSubmitResponse()

  // Is case all questions have been responded
  if (responseCount === questions.length) {
      viewHandler.showPrintResponsesButton()
  }

  // Add a reset button that will redirect to quiz start
  viewHandler.addResetButton()

  // Actions on every response submission
  $('#submit-response').on('click', function() {
    var $inputs = $('[name^=question_' + currentQuestion + ']')
    var question = questions[currentQuestion]

    // Behavior for each question type to add response to array of responses
    switch (question.input.type) {
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
    var responseCount = 0
    for (i = 0; i < responses.length; i++) {
      question = questions[i]
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
        case 'inputs':
          if (!!responses[i] && !!responses[i].join('')) {
            responseCount++
          }
          break
        default:
          if (!!responses[i]) {
            responseCount++
          }
      }
    }

    // Update progress bar
    viewHandler.updateProgressBar(responseCount, questions.length)

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
      viewHandler.showModalMessage('You must give a response')
    } else {

      // Display next question
      viewHandler.hideQuestion(currentQuestion)
      currentQuestion = currentQuestion + 1
      viewHandler.showQuestion(currentQuestion)

      // If it was the las question, display final message
      if (responseCount === questions.length) {
        viewHandler.showPrintResponsesButton()
      }
    }

    // Save current state of the quiz
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  })
})

const initQuestionInput = (questionInput) => {
    if (questionInput === undefined) {
        questionInput = {
          type: 'input'
        }
    }
    
    return questionInput
}

