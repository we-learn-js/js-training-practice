# JS Training: practice project

## How to launch dev mode?


**Launch the project on dev mode**

 ```
$ npm run start-dev
```

**Open the project in in Chrome**

URL: http://localhost:8080/webpack-dev-server/  

Now you can start coding.

**Once you're done, create a pull request**

Assign [davidbarna](https://github.com/davidbarna)


## Refactor steps

### Objects

Create a constructor named `UserQuiz` that will manage the state of the quiz.

`UserQuiz` has the following properties:
* **responses:** array with responses given by user
* **currentQuestion:** index of current question
* **responseCount:** number of responses

`UserQuiz` has the following methods:

* **init():** fills its properties from local storage
* **save():** saves info to local storage like `saveQuizData`
* **addResponse(questionIndex, response):** adds response given by user
* **isResponseCorrect(questionIndex, response):** returns if response if correct, like `isResponseCorrect`

```js

var quiz = function (element, options) {
  var userQuiz
  getQuizConfig()
    .then(function (data) {
      userQuiz = new UserQuiz().init()
      buildQuiz(data.title, data.questions, $(element))
    });
/* ... */
}

```

Make `userQuiz` manage the state of the quiz.
Unused code should be removed.

### Object-Oriented Programming

Create the following classes and implement them in the program:
* **UserQuiz:** responsible for the state of the quiz
* **Question:** handles question info and related operations
* **QuizNav:** shows/hides questions in the view
* **QuizApi:** makes requests to the JSON API


### Object-Oriented Design and Patterns

Taking as a inspiration the following OO design, refactor our Quiz app.

```js
/**
 * Façade Pattern
 * Responsible for DOM Manipulation
 */
class DOM {

  /**
   * Create DOM element from HTML markup string
   * @return {HTMLElement}
   */
  createDomElement(HTMLString) {

  }

  /**
   * Append DOM elements to an element container
   * @param  {HTMLElement} parent Parent element
   * @param  {HTMLElement} child Child element to add
   * @return {HTMLElement} Parent Element
   */
  append(parent, ...children) {}

  /**
   * Set property of element style
   * @param  {HTMLElement} element
   * @param  {String} property
   * @param  {Mixed} value
   * @return {element}
   */
  css(element, property, value) {}

  /**
   * Add event listener to click event on an element
   * @param  {HTMLElement}   element
   * @param  {Function} callback
   * @return {Function} Function to call to remove the event listener (Observer pattern)
   */
  click(element, callback) {}
}

/**
 * Singleton pattern
 */
class IdFactory(){
  /**
   * Get unique id. Used for Html elements identification.
   * @return {String}
   */
  getId() {}
}

/**
 * Strategy Pattern
 * Responsible for question info and validation
 */
class Question {
  /**
   * @param  {Object} props Properties of the question
   */
  constructor(props) {}

  /**
   * Get statement of the question
   * @return {String}
   */
  getStatement() {}

  /**
   * Validate is response is correct for the question
   * @param  {String|Array} response
   * @return {Promise}
   */
  isResponseCorrect(response) {}

  /**
   * Get is response if empty
   * @param  {String|Array} response
   * @return {Boolean}
   */
  isResponseEmpty(response) {}
}


/* MVC Pattern */

/**
 * Represents a Question in the DOM
 */
class QuestionView {

  /**
   * @param  {Question} question
   */
  constructor(question) {}

  /**
   * Hide question in DOM
   */
  hide(){}

  /**
   * Show question in DOM
   */
  show(){}

  /**
   * Get HTMLElement for the given question
   * @return {HTMLElement} Element to add to DOM
   */
  getElement(){}
}

/**
 * Composite Pattern
 * In charge of quiz fields management
 */
class FieldView {

  /**
   * @param  {String} name
   * @param  {String} label Optional
   */
  contructor(name, label) {}

  /**
   * Set value(s) of the field
   * @param {String|Array} value
   */
  setValue(value){}

  /**
   * Get the value of the field (response of user)
   * @return {String|Array} Value(s) of the field
   */
  getValue(){}

  /**
   * Get HTMLElement for the given field
   * @return {HTMLElement} Element to add to DOM
   */
  getElement(){}
}
class FieldViewText extends FieldView {}
class FieldViewRadio extends FieldView  {}
class FieldViewCheckbox extends FieldView  {}

/**
 * Factory Pattern
 * In charge of creating FieldView instances depending on type
 */
class FieldViewFactory {
  /**
   * Create Field for given field type
   * @param  {String} type
   * @return {FieldView}
   */
  createField(type) {}
}

/**
 * Representation fot the Progress of a quiz
 */
class ProgressView {

  /**
   * @param  {UserQuiz} quiz
   */
  constructor(quiz) {}

  /**
   * Update progress bar depending of quiz state
   * @return {[type]} [description]
   */
  update() {}

  /**
   * Get element of the progress bar
   * @return {HTMLElement}
   */
  getElement() {}
}


/**
 * Observer Pattern: Observable
 *
 * Responsible for quiz status
 */
class UserQuiz extends EventEmitter {

  /**
   * Add response and dispatch related events
   * @param {[type]} response [description]
   */
  addResponse (response) {
    if(question.isResponseEmpty()) {
      this.emit('emptyResponse', responseCount)
      return
    } else {
      this.emit('response', responseCount)
    }

    if(lastQuestion) {
      this.emit('end', responseCount)
    }
  }
}

/**
 * QuizNav converted to QuizCtrl
 */
class QuizCtrl {
  /**
   * @param  {UserQuiz} quiz
   */
  constructor(quiz){
    this.quiz.on('response', this.onResponse)
    this.quiz.on('empty_response', this.onEmptyResponse)
  }

  /**
   * Handle response event
   * @param  {String|Array} response
   */
  onResponse(response) {}

  /**
   * Handle empty response event
   */
  onEmptyResponse() {}
}


class QuizView {

  /**
   * @param  {Question[]} questions[]
   */
  constructor(questions[]) {}

  /**
   * Show given id question
   * @param  {Number} index
   */
  showQuestion(index) {}
}

```
