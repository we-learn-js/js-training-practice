import FieldViewRadio from './FieldViewRadio'
import FieldViewCheckbox from './FieldViewCheckbox'
import FieldViewText from './FieldViewText'
import FieldViewTexts from './FieldViewTexts'

const TYPES = {
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  INPUT: 'input',
  INPUTS: 'inputs'
}

/**
 * Factory in charge of creating FieldView instances depending on type
 */
class FieldViewFactory {

  /**
   * Create Field for given question
   * @param  {Question} question
   * @return {FieldViewAbstract}
   */
  static createField (question) {
    
  }
}

export default FieldViewFactory
