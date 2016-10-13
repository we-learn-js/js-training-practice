responseCount = 0
currentQuestion = 0

function loadResponses(){

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

function initializeView(data){
    $questions = $('<form class="ui form"></form>')
    $(document.body)
      .append('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>')
    $element
      .append('<h1 class="ui header">' + data.title + '</h1>')
      .append($questions)
}

function fillLabel(i, j, text){
	return '<label for="question_' + i + '_' + j + '">' + text + '</label>';
}


function fillInputRadio(question, responses, i)	{
	var input = '<div class="inline fields">'
	
	question.input.options.forEach(function(option,j){
		var type = question.input.type;

		if (!!responses[i] && responses[i].indexOf(option.label) !== -1) {
		  var checked = 'checked'
		} else {
		  var checked = ''
		}

		input += '<div class="field">'
		  + '<div class="ui checkbox ' + type + '">'
		  + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
		  +  fillLabel(i, j, option.label)
		  + '</div>'
		  + '</div>'
	});
	input += '</div>'
  
	return input;
}


function fillInputInputs(question, responses, i){
	
	var input = '<table>'
		
	question.input.options.forEach(function(option,j){

		if (!!responses[i]) {
		  var value = responses[i][j]
		} else {
		  var value = ''
		}

		input += '<tr>'
		  + '<td>'
		  +  fillLabel(i, j, option.label)
		  + '</td>'
		  + '<td width="15px"></td>'
		  + '<td><div class="ui input">'
		  + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
		  + '</div></td>'
		  + '</tr>'
		  + '<tr><td colspan="3">&nbsp;</tr></tr>'
	});
	input += '</table>'
	
	return input;	  
}

function fillInputDefault(i){

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


quiz = function (element, options) {
  $element = $(element)

  $.ajax({
    url: options.url
  }).done(function (data) {
    questions = data.questions;

	loadResponses();
	initializeView(data);
	
	data.questions.forEach(function(question,i){
		question = data.questions[i]

		if (question.code !== undefined) {
			var code = '<pre><code>' + question.code + '</code></pre>'
		} else {
			var code = ''
		}

		if (question.input === undefined) {
			question.input = { type: 'input' }
		}
		  
		switch (question.input.type) {
			case 'checkbox':
			case 'radio':
				var input = fillInputRadio(question, responses, i);
				break;

			case 'inputs':
				var input = fillInputInputs(question, responses, i);
				break;
							  
			default:
				var input = fillInputDefault(i);
				break;
		}  
		  
		$question = $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
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

		$questions.append($question)

		$('pre code').each(function (i, block) {
			hljs.highlightBlock(block)
		})

		$questions.find('#question-' + currentQuestion).css('display', 'block')
		$('#progress').css('width', (responseCount / questions.length * 100) + '%')
    });
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

      $('#progress').css('width', (responseCount / questions.length * 100) + '%')

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
  })
}

module.exports = quiz
