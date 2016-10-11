var quizData;
var questions;
//responseCount = 0
//currentQuestion = 0
var QUIZ = 'quiz'

function getFormElement() {
  return $('<form class="ui form"></form>');
}

function getProgressBarHtml() {
  return '<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>';
}

function getH1Html(title) {
  return '<h1 class="ui header">' + title + '</h1>';
}

function getPreCodeHtml(code) {
  return '<pre><code>' + code + '</code></pre>';
}

function getRadioCheckboxHtml(question, responses, i) {
  var input = '<div class="inline fields">';

  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
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
  }
  input += '</div>'

  return input;
}

function getInputHtml(question, responses, i) {
  var input = '<table>';

  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
    var type = 'checkbox'

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
  }
  input += '</table>'

  return input;
}

function getDefaultInputHtml(responses, i) {
  if (!!responses[i]) {
    var value = responses[i]
  } else {
    var value = ''
  }
  return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
    + '</div>'
}

function getQuestionHtml(i, question, responses) {
  var input = getInput(question, responses, i);
  var code = getQuestionCode(question.code);

  return $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
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
      ).css('display', 'none')
}

function getQuestionCode(code) {
  return code !== undefined
    ? getPreCodeHtml(code)
    : '';
}

function getInput(question, responses, i) {
  if (question.input === undefined) {
    question.input = { type: 'input' }
  }

  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      return getRadioCheckboxHtml(question, responses, i);
      break

    case 'inputs':
      return getInputHtml(question, responses, i);
      break
    default:
      return getDefaultInputHtml(responses, i);
  }
}

function addProgressBarToBody() {
  $(document.body).append(getProgressBarHtml())
}

function processQuestion(question, i) {
  $questions.append(getQuestionHtml(i, question, quizData.responses));

  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block)
  })

  $questions.find('#question-' + quizData.currentQuestion).css('display', 'block')
  $('#progress').css('width', (quizData.responseCount / questions.length * 100) + '%')
}

function updateResponseCount() {
  quizData.responseCount = getResponseCount();
}

function getResponseCount() {
  var responseCount = 0

  for (i = 0; i < quizData.responses.length; i++) {
    question = questions[i]
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        if (!!quizData.responses[i] && !!quizData.responses[i].join('')) {
          responseCount++
        }
        break
      default:
        if (!!quizData.responses[i]) {
          responseCount++
        }
    }
  }

  return responseCount;
}

function printProgressBar() {
  $('#progress').css('width', (quizData.responseCount / questions.length * 100) + '%')
}

function getQuizData() {
  try {
    quizData = JSON.parse(localStorage.getItem(QUIZ))
  } catch (e) {}

  if(quizData === null)
    quizData = {}

  quizData.responses = quizData.responses || []
  quizData.currentQuestion = quizData.currentQuestion || 0
  quizData.responseCount = quizData.responseCount || -1

  return quizData;
}

function printSubmitButton($element) {
  $element.append(GetButtonHtml())
}

function GetButtonHtml() {
  return '<button id="submit-response" class="ui primary button">Submit response</button>';
}

function checkQuizFinished(quizData, data, $element) {
  if (isQuizFinished(quizData, data)) {
    $('#submit-response').css('display', 'none')
    $element.append('<div>Thank you for your responses.<br/><br/> </div>')
    $element.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
  }
}

function isQuizFinished(quizData, data) {
  return quizData.responseCount === questions.length;
}

function getQuestions(data) {
  return data.questions;
}

function printQuiz (element, data) {
  questions = getQuestions(data)
  quizData2 = getQuizData()

  addProgressBarToBody();
  
  $element = $(element)
  $questions = getFormElement()
  $element
    .append(getH1Html(data.title))
    .append($questions)

  questions.forEach(function (question, i) {
    $questions.append(getQuestionHtml(i, question, quizData2.responses));

    $('pre code').each(function (i, block) {
      hljs.highlightBlock(block)
    })

    $questions.find('#question-' + quizData2.currentQuestion).css('display', 'block')
    $('#progress').css('width', (quizData2.responseCount / questions.length * 100) + '%')
  });

  printSubmitButton($element);

  checkQuizFinished(quizData, data, $element);

  $('#submit-response').on('click', function (){
    submitResponseClick($element);
  });
}

function submitResponseClick($element) {
  storeAnswer();
  updateResponseCount();
  printProgressBar();

  if (!isCurrentQuestionAnswered(quizData.responses[quizData.currentQuestion])) {
    alert('You must give a response')
  } else {
    showNextQuestion($questions, $element);
  }

  localStorage.setItem(QUIZ, JSON.stringify(quizData))
}

function storeAnswer() {
  var $inputs = $('[name^=question_' + quizData.currentQuestion + ']')
  
  var question = questions[quizData.currentQuestion]

  console.log($inputs)

  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      quizData.responses[quizData.currentQuestion] = []
      $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
        quizData.responses[quizData.currentQuestion].push(input.value)
      })
      if (quizData.responses[quizData.currentQuestion].length === 0) {
        quizData.responses[quizData.currentQuestion] = null
      }
      break
    case 'inputs':
      quizData.responses[quizData.currentQuestion] = []
      $inputs.each(function (i, input) {
        quizData.responses[quizData.currentQuestion].push(input.value)
      })
      break
    default:
      quizData.responses[quizData.currentQuestion] = $inputs.val()
  }
}

function showNextQuestion($questions, $element) {
  $questions.find('#question-' + quizData.currentQuestion).css('display', 'none')
  quizData.currentQuestion++
  $questions.find('#question-' + quizData.currentQuestion).css('display', 'block')
  
  if (quizData.responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $element.append('<div>Exam filled in successfully. Thank you.</div>')
    $element.append('<button>Print responses</button>')
  }
}

function checkAnswer(prev, current) {
  if (!current) {
    return false
  }

  return prev;
}

function isCurrentQuestionAnswered(question) {
  return !!question
          ? !!!question.reduce
            ? true
            : question.reduce(checkAnswer, true)
          : false;
}

quiz = function (element, options) {
  $.ajax({
    url: options.url
  }).done(function(data) {
    printQuiz(element, data)
  })
}

module.exports = quiz
