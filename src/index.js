
quiz = function (element, options) {
  var responseCount = 0,
      currentQuestion = 0,
      $element = $(element),
      $questions = $('<form class="ui form"></form>')

  $.ajax({
    url: options.url
  }).done(
    function (data) {
      questions = data.questions
      init(data)
    }
  )

  function initProgressBar(){
    $(document.body)
      .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
  }

  function updateProgressBar(responseCount, questionsLength){
    $('#progress').css('width', (responseCount / questionsLength * 100) + '%')
  }

  function showThanks(){
    $('#submit-response').css('display', 'none')
    $element.append('<div>Thank you for your responses.<br /><br /> </div>')
    $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  function hideCurrentQuestion(currentQuestion){
    $questions.find('#question-' + currentQuestion).css('display', 'none')
  }

  function showNextQuestion(currentQuestion){
    $questions.find('#question-' + currentQuestion).css('display', 'block')
  }

  function printTitle(title){
    $element.append('<h1 class="ui header">' + title + '</h1>')
  }

  function printForm(questions){
    $element.append(questions)
  }

  function printSubmitButton(){
    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')
  }

  function printResetButton(){
    $resetButton = $('<button class="ui button negative">Reset</button>')
    $resetButton.on('click', function(){
      localStorage.removeItem('quiz')
      location.reload();
    })
    $element.append($resetButton)
  }

  function printCheckboxRadio(question, responses, i){

    var input = '<div class="inline fields">'
    question.input.options.forEach(function( option, j){
      var type = question.input.type

      if (!!responses[i] && responses[i].indexOf(option.label) !== -1) {
        var checked = 'checked'
      } else {
        var checked = ''
      }

      input += '<div class="field">'
        + '<div class="ui checkbox ' + type + '">'
        + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
        + '<label for="question_' + i + '_' + j + '">' + option.label + '</label>'
        + '</div>'
        + '</div>'
    })
    input += '</div>'
    return input;
  }

  function printInputs(question, i){
    var input = '<table>'
    question.input.options.forEach(function(option, j){

      if (!!responses[i]) {
        var value = responses[i][j]
      } else {
        var value = ''
      }

      input += '<tr>'
        + '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>'
        + '<td width="15px"></td>'
        + '<td><div class="ui input">'
        + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
        + '</div></td>'
        + '</tr>'
        + '<tr><td colspan="3">&nbsp;</tr></tr>'
    })
    input += '</table>'
    return input;
  }

  function printDefaultInput(responses, i){
    if (!!responses[i]) {
      var value = responses[i]
    } else {
      var value = ''
    }
    var input = '<div class="ui input fluid">'
      + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
      + '</div>'
      return input;
  }

  function printQuestions(problem, input, i){
    $question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
      + '<div class="content">'
      + '<div class="header">' + problem + '</div>'
      + '</div>'
      + '<div class="content">'
      + input
      + '</div>'
      + '</div>'
    ).css('display', 'none')
    $questions.append($question)
  }

  function printResponses(question, responses, i){
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        input = printCheckboxRadio(question, responses, i)
        break
      case 'inputs':
        input = printInputs(question, i)
        break
      default:
        input = printDefaultInput(responses, i)
    }
  }

  function getQuizData(){
    try {
      quizData = JSON.parse(localStorage.getItem('quiz'))
      responses = quizData.responses || []
      currentQuestion = quizData.currentQuestion || -1
      responseCount = quizData.responseCount || -1
    } catch (e) {}

    if (quizData == null) {
      quizData = { responses: [] }
      responses = quizData.responses
    }
  }

  function printQuiz(data){
    data.questions.forEach(function(question, i){

      if (question.input === undefined) {
        question.input = { type: 'input' }
      }

      printResponses(question, responses, i)
      printQuestions(question.problem, input, i)
      showNextQuestion(currentQuestion)
      updateProgressBar(responseCount, questions.length)
    })
  }

  function init(data){
    getQuizData()
    initProgressBar()
    printTitle(data.title)
    printForm($questions)
    printQuiz(data)
    printSubmitButton()
    printResetButton()
    bindSubmitButton()
    checkLastQuestion(responseCount, questions.length)
  }

  function setAnswers(){
    var $inputs = $('[name^=question_' + currentQuestion + ']')
    var question = questions[currentQuestion]

    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        responses[currentQuestion] = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
        if (responses[currentQuestion].length === 0) {
          responses[currentQuestion] = null
        }
        break
      case 'inputs':
        responses[currentQuestion] = []
        $inputs.each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
        break
      default:
        responses[currentQuestion] = $inputs.val()
    }
  }

  function responseCounter(){
    var responseCount = 0

    responses.forEach(function(response, i){
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
    })
    return responseCount;
  }

  function storeData(responses, responseCount, currentQuestion ){
    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  }

  function checkLastQuestion(responseCount, questionsLength){
    if (responseCount === questionsLength) {
      showThanks();
    }
  }

  function bindSubmitButton(){
    $('#submit-response').bind('click', function () {

      setAnswers()
      responseCount = responseCounter() //immutability fail :/
      updateProgressBar(responseCount, questions.length)

      if (!responses[currentQuestion]) {
        alert('You must give a response')
      } else {
        hideCurrentQuestion(currentQuestion)
        currentQuestion = currentQuestion + 1
        showNextQuestion(currentQuestion )
        checkLastQuestion(responseCount, questions.length)
      }
      storeData(responses, responseCount, currentQuestion )
    })
  }
}

module.exports = quiz
