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
    switch(question.type){
      case TYPES.RADIO:
        return new FieldViewRadio();break;
      case TYPES.CHECKBOX:
        return new FieldViewCheckbox();break;
      case TYPES.INPUT:
        return new FieldViewText();break;
    }

  }
}

export default FieldViewFactory
