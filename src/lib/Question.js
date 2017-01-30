import QuizApi from './QuizApi'

/**
 * Default field type
 * @type {String}
 */
const DEFAULT_TYPE = 'input'

/**
 * Responsible for question info and validation
 */
class Question {

  static serializeResponse (response) {
    return (response.join && response.sort().join(', ')) || response
  }

  static isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) || false
  }

  /**
   * @param  {Object} props Properties of the question
   * @param  {String} props.id Id of the question
   * @param  {String} props.problem Statement of the question
   * @param  {String} props.input.type Type of field
   * @param  {Object[]} props.input.options Options of the field
   */
  constructor (props) {
    this._id = props.id
    this._statement = props.problem
    this._type = (props.input && props.input.type) || DEFAULT_TYPE
    this._options = (props.input && props.input.options) || []
  }

  /**
   * Get type of field
   * @return {String}
   */
  getType () {
    return this._type
  }

  /**
   * Get options of field
   * @return {Object[]}
   */
  getOptions () {
    return this._options
  }

  /**
   * Get statement of the question
   * @return {String}
   */
  getStatement () {
    return this._statement
  }

  /**
   * Validate is response is correct for the question
   * @param  {String|Array} response
   * @return {Promise} {ok, correctResponse }
   */
  isResponseCorrect (response) {
    return QuizApi.getResponse(this._id)
      .then(Question.serializeResponse)
      .then(function (correctResponse) {
          return {
              ok: correctResponse == Question.serializeResponse(response),
              correctResponse: correctResponse
          }
      })
  }
}

export default Question
