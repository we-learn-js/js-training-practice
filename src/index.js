(function($, JSON, localStorage, location) {
	let options;
	const { url } = (options = {
		url: `data/quiz.json?${Date.now()}`
	});

	const getDataFromLocalStorage = (localStorage, JSON) => {
		return JSON.parse(localStorage.getItem('quiz')) || {};
	};

	const renderProgressBar = ($) => {
		$('body').append(`<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">
      <div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>
      </div>`);
	};

	const getMultipleOptionsInput = (options, responses, type, indexQuestion) => {
		let inputHtml = '<div class="inline fields">';

		options.forEach((option, indexOption) => {
			const checked =
				!!responses[indexQuestion] && responses[indexQuestion].includes(option.label) ? 'checked' : '';

			inputHtml += `<div class="field">
        <div class="ui checkbox ${type}">
        <input type="${type}" ${checked} name="question_${indexQuestion}" id="question_${indexQuestion}_${indexOption}" value="${option.label}">
        <label for="question_${indexQuestion}_${indexOption}">${option.label}</label>
        </div>
        </div>`;
		});

		inputHtml += '</div>';

		return inputHtml;
	};

	const getInputHtml = (options, responses, indexQuestion) => {
		let inputHtml = '<table>';

		options.forEach((option, indexOption) => {
			const value = (responses[indexQuestion] && responses[indexQuestion][indexOption]) || '';

			inputHtml += `<tr>
      <td><label for="question_${indexQuestion}_${indexOption}">${option.label}</label></td>
      <td width="15px"></td>
      <td><div class="ui input">
      <input type="text" placeholder="Response..." name="question_${indexQuestion}" id="question_${indexQuestion}_${indexOption}" value="${value}" />
      </div></td>
      </tr>
      <tr><td colspan="3">&nbsp;</tr></tr>`;
		});

		inputHtml += '</table>';

		return inputHtml;
	};

	const getDefaultInputHtml = (responses, indexQuestion) => {
		const value = responses[indexQuestion] || '';
		return `<div class="ui input fluid">
      <input type="text" placeholder="Response..." name="question_${indexQuestion}" value="${value}" />
      </div>`;
	};

	const getQuestionElement = ($, indexQuestion, problem, inputHtml) => {
		return $(`<div id="question-${indexQuestion}" class="ui card" style="width: 100%;">
                <div class="content"><div class="header">${problem}</div></div>
                <div class="content">${inputHtml}</div>
              </div>`).css('display', 'none');
	};

	const renderResetButton = ($, localStorage, location) => {
		// Add a reset button that will redirect to quiz start
		const $resetButton = $('<button class="ui button negative">Reset</button>');
		$resetButton.on('click', function() {
			localStorage.removeItem('quiz');
			location.reload();
		});
		$('#quiz').append($resetButton);
	};

	const renderFinalOfTest = ($) => {
		$('#submit-response').css('display', 'none');
		$('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>');
		$('#quiz').append('<button class="ui primary button" onclick="window.print()" >Print responses</button>');
	};

	const renderSubmitButton = ($) => {
		$('#quiz').append('<button id="submit-response" class="ui primary button">Submit response</button>');
	};

	const getIsQuestionAnswered = (response) => {
		let isQuestionAnswered = !!response;
		if (response && response.length) {
			for (let j = 0; j < response.length; j++) {
				if (!response[j]) {
					isQuestionAnswered = false;
				}
			}
		}

		return isQuestionAnswered;
	};

	$.ajax({ url }).done(function(data) {
		let { questions } = data;
		let quizData = getDataFromLocalStorage(localStorage, JSON);
		let { responses = [], currentQuestion = 0, responseCount = 0 } = quizData;

		// Append the progress bar to DOM
		renderProgressBar($);

		// Append title and form to quiz
		$('#quiz')
			.append(`<h1 class="ui header">${data.title}</h1>`)
			.append('<form id="quiz-form" class="ui form"></form>');

		questions.forEach((question, indexQuestion) => {
			question.input = question.input || { type: 'input' };
			let { problem, input, input: { type, options } } = questions[indexQuestion];
			let inputHtml;

			switch (type) {
				case 'checkbox':
				case 'radio':
					inputHtml = getMultipleOptionsInput(options, responses, type, indexQuestion);
					break;
				case 'inputs':
					inputHtml = getInputHtml(options, responses, indexQuestion);
					break;
				default:
					inputHtml = getDefaultInputHtml(responses, indexQuestion);
			}

			const $question = getQuestionElement($, indexQuestion, problem, inputHtml);

			$('#quiz-form').append($question);

			// Show current question
			$('#quiz-form').find(`#question-${currentQuestion}`).css('display', 'block');

			// Update progress bar
			$('#progress').css('width', responseCount / questions.length * 100 + '%');
		});

		// Add button to submit response
		renderSubmitButton($);

		// Is case all questions have been responded
		if (responseCount === questions.length) {
			renderFinalOfTest($);
		}

		renderResetButton($, localStorage, location);

		// Actions on every response submission
		$('#submit-response').on('click', () => {
			const $inputs = $(`[name^=question_${currentQuestion}`);
			const question = questions[currentQuestion];
			let response = responses[currentQuestion];

			// Behavior for each question type to add response to array of responses
			switch (question.input.type) {
				case 'checkbox':
				case 'radio':
					response = [];
					$(`[name=${$inputs.attr('name')}]:checked`).each(function(i, input) {
						response.push(input.value);
					});
					response = response.length ? response : null;
					break;
				case 'inputs':
					response = [];
					$inputs.each(function(i, input) {
						response.push(input.value);
					});
					break;
				default:
					response = $inputs.val();
			}

			// Set the current responses counter
			responses[currentQuestion] = response;
			let responseCount = 0;
			for (let i = 0; i < responses.length; i++) {
				let question = questions[i];
				let response = responses[i];
				switch (question.input.type) {
					case 'checkbox':
					case 'radio':
					case 'inputs':
						responseCount += !!response && !!response.join('');
						break;
					default:
						responseCount += !!response;
				}
			}

			// Update progress bar
			$('#progress').css('width', responseCount / questions.length * 100 + '%');

			// Check if question had a valid answer
			let isQuestionAnswered = getIsQuestionAnswered(response);

			if (!isQuestionAnswered) {
				// Alert user of missing response
				alert('You must give a response');
			} else {
				// Display next question
				$('#quiz-form').find(`#question-${currentQuestion}`).css('display', 'none');

				$('#quiz-form').find(`#question-${++currentQuestion}`).css('display', 'block');

				// If it was the las question, display final message
				if (responseCount === questions.length) {
					$('#submit-response').css('display', 'none');
					$('#quiz').append('<div>Thank you for your responses.<br /><br /> </div>');
					$('#quiz').append(
						'<button class="ui primary button" onclick="window.print()" >Print responses</button>'
					);
				}
			}

			// Save current state of the quiz
			localStorage.setItem('quiz', JSON.stringify({ responses, responseCount, currentQuestion }));
		});
	});
})($, JSON, localStorage, location);
