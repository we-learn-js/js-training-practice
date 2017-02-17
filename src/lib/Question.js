/**
 * Strategy Pattern
 * Responsible for question info and validation
 */

import QuizApi from './QuizApi'

export default class Question extends QuestionValidationStrategy {

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
    isResponseCorrect(response) {
      
    }

    /**
     * Get is response if empty
     * @param  {String|Array} response
     * @return {Boolean}
     */
    isResponseEmpty(response) {}
  }
