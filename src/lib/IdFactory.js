/**
 * Singleton pattern
 */

export default class IdFactory {
  getId(){
    return Symbol();
  }
}
