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
    var field
    var options = question.getOptions()
    switch (question.getType()) {
      case TYPES.RADIO:
        field = new FieldViewRadio(options)
        break
      case TYPES.CHECKBOX:
        field = new FieldViewCheckbox(options)
        break
      case TYPES.INPUT:
        field = new FieldViewText(options)
        break
      case TYPES.INPUTS:
        field = new FieldViewTexts(options)
        break
    }
    return field
  }
}

export default FieldViewFactory
