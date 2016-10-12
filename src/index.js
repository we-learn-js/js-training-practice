responseCount = 0
currentQuestion = 0

quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) { proceso(data)});

function InitProcess(){
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

function EndProcess(){
  quizData.responses = responses
  quizData.responseCount = responseCount
  quizData.currentQuestion = currentQuestion
  localStorage.setItem('quiz', JSON.stringify(quizData))
}

function PrintCheckboxRadio(question,responses,i){
  var input = '<div class="inline fields">'
  question.input.options.forEach(function(option,j){

  var type = question.input.type

  var checked=(!!responses[i] && responses[i].indexOf(option.label) !== -1)?'checked':''

  input += '<div class="field">'
    + '<div class="ui checkbox ' + type + '">'
    + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
    + '<label for="question_' + i + '_' + j + '">' + option.label + '</label>'
    + '</div>'
    + '</div>'
  });
  input += '</div>'
  return input
}

function PrintInputs(question,responses,i){
  var input = '<table>'
  question.input.options.forEach(function(option,j){
    var type = 'checkbox'

    var value=(!!responses[i])?responses[i][j]:'';

    input += '<tr>'
      + '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>'
  });
  input += '</table>'
  return input
}

function PrintDefault(responses,i){
  value=(!!responses[i])?responses[i]:'';

  return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
    + '</div>'
}
function  PrintQuestion(question,i,input,code) {
  return '<div id="question-' + i + '" class="ui card" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + question.problem + '</div>'
    + '</div>'
    + '<div class="content">'
    + code
    + '</div>'
    + '<div class="content">'
    + input
    + '</div>'
    + '</div>'
}

function ResponseCount(){
  var responseCount=0
  responses.forEach(function(response,i){
    question = questions[i]
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        if (!!response && !!response.join('')) {
          responseCount++
        }
        break
      default:
        if (!!response) {
          responseCount++
        }
    }
  });
  return responseCount;
}

function PrintBarProgressHtml(){
  $(document.body)
    .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
}

function PrintEndQuestions(responseCount){
  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $element.append('<div>Thank you for your responses.<br /><br /> </div>')
    $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }
}

function ShowNextQuestion(questions,responseCount,currentQuestion){
  var _currentQuestion=currentQuestion;
  if (responseCount<responses.length) {
    alert('You must give a response')
  } else {
    questions.find('#question-' + _currentQuestion).css('display', 'none')
    _currentQuestion++
    questions.find('#question-' + _currentQuestion).css('display', 'block')

    PrintEndQuestions(responseCount)

  }
  return _currentQuestion
}

function GetInputType(obj){
  var _obj=obj
  return _obj === undefined?{ type: 'input' }:_obj
}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function proceso(data){
    questions = data.questions

    InitProcess()

    $questions = $('<form class="ui form"></form>')

    PrintBarProgressHtml()

    $element
      .append('<h1 class="ui header">' + data.title + '</h1>')
      .append($questions)

      data.questions.forEach(function(question,i){

      var code=question.code!==undefined?'<pre><code>' + question.code + '</code></pre>':'';

      question.input=GetInputType(question.input)

      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
          var input = PrintCheckboxRadio(question,responses,i)
          break
        case 'inputs':
          var input =PrintInputs(question,responses,i)
          break
        default:
          var input =PrintDefault(responses,i)
      }

      $questions.append($(PrintQuestion(question,i,input,code)).css('display', 'none'))

      $questions.find('#question-' + currentQuestion).css('display', 'block')
      $('#progress').css('width', (responseCount / questions.length * 100) + '%')
    });

    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

    PrintEndQuestions(responseCount)

    $resetButton = $('<button class="ui button negative">Reset</button>')
    $resetButton.on('click', function(){
      localStorage.removeItem('quiz')
      location.reload();
    })

    $element.append($resetButton)

    $('#submit-response').on('click', function () {
      var $inputs = $('[name^=question_' + currentQuestion + ']')
      var question = questions[currentQuestion]
      responses[currentQuestion] = []
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':

          $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
            responses[currentQuestion].push(input.value)
          })
          break
        case 'inputs':
          $inputs.each(function (i, input) {
            responses[currentQuestion].push(input.value)
          })
          break
        default:
          responses[currentQuestion] = $inputs.val()
      }

      var responseCount = ResponseCount();

      $('#progress').css('width', (responseCount / questions.length * 100) + '%');

      currentQuestion= ShowNextQuestion($questions,responseCount,currentQuestion);

      EndProcess()

    })
  }
}

module.exports = quiz
