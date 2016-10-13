var quizData;
var questions;
var QUIZ = 'quiz'
var FORM_TEMPLATE = '<form class="ui form"></form>';
var PROGRESS_BAR_HTML = '<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>';
var H1_HTML_TEMPLATE = '<h1 class="ui header">{0}</h1>';
var PRE_CODE_HTML = '<pre><code>{0}</code></pre>';
var RADIO_CHECKBOX_HTML_TEMPLATE = '<div class="inline fields">{0}</div>';
var RADIO_CHECKBOX_OPTION_HTML_TEMPLATE = '<div class="field">'
      + '<div class="ui checkbox {0}">'
      + '<input type="{0}" {1} name="question_{2}" id="question_{2}_{3}" value="{4}">'
      + '<label for="question_{2}_{3}">{4}</label>'
      + '</div>'
      + '</div>';
var INPUT_OPTION_HTML_TEMPLATE = '<tr>'
      + '<td><label for="question_{0}_{1}">{2}</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="question_{0}" id="question_{0}_{1}" value="{3}" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>';

var INPUT_HTML_TEMPLATE = '<table>{0}</table>';

var DEFAULT_INPUT_HTML = '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_{0}" value="{1}" />'
    + '</div>'; // i value

function getH1Html(title) {
  return H1_HTML_TEMPLATE.replace('{0}', title);
}

function getPreCodeHtml(code) {
  return PRE_CODE_HTML.replace('{0}', code);
}

function getRadioCheckboxOptionHtml(option, j, question, responses, i) {
  var type = question.input.type

  var checked = (!!responses[i] && responses[i].indexOf(option.label) !== -1)
    ? 'checked'
    : '';

  return RADIO_CHECKBOX_OPTION_HTML_TEMPLATE
          .replace('{0}', type)
          .replace('{0}', type)
          .replace('{1}', checked)
          .replace('{2}', i)
          .replace('{2}', i)
          .replace('{2}', i)
          .replace('{3}', j)
          .replace('{3}', j)
          .replace('{4}', option.label)
          .replace('{4}', option.label);
}

function getRadioCheckboxHtml(question, responses, i) {
  var inputOptionsHtml = question.input.options.map(function(option, j) { return getRadioCheckboxOptionHtml(option, j, question, responses, i) });

  return RADIO_CHECKBOX_HTML_TEMPLATE.replace('{0}', inputOptionsHtml.join(''));
}

function getInputOptionHtml(option, j, responses, i) {
  var value = (!!responses[i])
          ? responses[i][j]
          : '';

  return INPUT_OPTION_HTML_TEMPLATE
          .replace('{0}', i)
          .replace('{0}', i)
          .replace('{0}', i)
          .replace('{1}', j)
          .replace('{1}', j)
          .replace('{2}', option.label)
          .replace('{3}', value);
}

function getInputHtml(question, responses, i) {
  var inputOptionsHtml = question.input.options.map(function(option, j) { return getInputOptionHtml(option, j, responses, i) });

  return INPUT_HTML_TEMPLATE.replace('{0}', inputOptionsHtml.join(''));
}

function getDefaultInputHtml(responses, i) {
  var value = (!!responses[i])
                ? responses[i]
                : '';

  return DEFAULT_INPUT_HTML
    .replace('{0}', i)
    .replace('{1}', value);
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
  $(document.body).append(PROGRESS_BAR_HTML);
}

function highlightPreCodes() {
  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block)
  })
}

function setDisplayToQuestion(index, display) {
  $questions.find('#question-' + index).css('display', display);
}

function showQuestionWithIndex(index) {
  setDisplayToQuestion(index, 'block');
}

function hideQuestionWithIndex(index) {
  setDisplayToQuestion(index, 'none');
}

function processQuestion(question, i, responses, currentQuestion, responseCount, questionsCount) {
  $questions.append(getQuestionHtml(i, question, responses));

  highlightPreCodes();
  
  showQuestionWithIndex(currentQuestion);
  $('#progress').css('width', (responseCount / questionsCount * 100) + '%')
}

function updateResponseCount() {
  quizData.responseCount = getResponseCount();
}

function countAnswer(count, answer, index) {
  question = questions[index]

  switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        if (!!answer && !!answer.join('')) {
          count++
        }
        break
      default:
        if (!!answer) {
          count++
        }
    }

  return count;
}

function getResponseCount() {
  return quizData.responses.reduce(countAnswer, 0);
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
  quizData = getQuizData()

  addProgressBarToBody();
  
  $element = $(element)
  $questions = $(FORM_TEMPLATE)
  $element
    .append(getH1Html(data.title))
    .append($questions)

  questions.forEach(function (question, i) { return processQuestion(question, i, quizData.responses, quizData.currentQuestion, quizData.responseCount, questions.length) });

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
  hideQuestionWithIndex(quizData.currentQuestion);
  quizData.currentQuestion++
  showQuestionWithIndex(quizData.currentQuestion);
  
  if (quizData.responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $element.append('<div>Exam filled in successfully. Thank you.</div>')
    $element.append('<button>Print responses</button>')
  }
}

function checkAnswer(prev, current) {
  return !current
    ? false
    : prev;
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
