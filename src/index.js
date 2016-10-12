responseCount = 0
currentQuestion = 0

quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) { proceso(data)});

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
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function proceso(data){
    questions = data.questions

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

    $questions = $('<form class="ui form"></form>')
    $(document.body)
      .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
    $element
      .append('<h1 class="ui header">' + data.title + '</h1>')
      .append($questions)

      data.questions.forEach(function(question,i){

      var code=question.code!==undefined?'<pre><code>' + question.code + '</code></pre>':'';

      if (question.input === undefined) {
        question.input = { type: 'input' }
      }
      switch (question.input.type) {
        case 'checkbox':
        case 'radio':
          var input = PrintCheckboxRadio(question,responses,i)
          break

        case 'inputs':
          var input =PrintInputs(question,responses,i)
          break
        default:
          value=(!!responses[i])?responses[i]:'';

          var input = '<div class="ui input fluid">'
            + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
            + '</div>'
      }

      $question = $(PrintQuestion(question,i,input,code)).css('display', 'none')

      $questions.append($question)

      $questions.find('#question-' + currentQuestion).css('display', 'block')
      $('#progress').css('width', (responseCount / questions.length * 100) + '%')
    });

    /// final forEach

    $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

    if (responseCount === questions.length) {
      $('#submit-response').css('display', 'none')
      $element.append('<div>Thank you for your responses.<br /><br /> </div>')
      $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
    }

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

      var responseCount = 0
      responses.forEach(function(responses,i){
        question = questions[i]
        switch (question.input.type) {
          case 'checkbox':
          case 'radio':
          case 'inputs':
            if (!!responses && !!responses.join('')) {
              responseCount++
            }
            break
          default:
            if (!!responses) {
              responseCount++
            }
        }
      });

      $('#progress').css('width', (responseCount / questions.length * 100) + '%')

      if (!responses[currentQuestion]) {
        alert('You must give a response')
      } else {
        $questions.find('#question-' + currentQuestion).css('display', 'none')
        currentQuestion = currentQuestion + 1
        $questions.find('#question-' + currentQuestion).css('display', 'block')

        if (responseCount === questions.length) {
          $('#submit-response').css('display', 'none')
          $element.append('<div>Thank you for your responses.<br /><br /> </div>')
          $element.append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
        }
      }

      quizData.responses = responses
      quizData.responseCount = responseCount
      quizData.currentQuestion = currentQuestion
      localStorage.setItem('quiz', JSON.stringify(quizData))
    })
  }
}

module.exports = quiz
