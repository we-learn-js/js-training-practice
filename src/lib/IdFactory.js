/**
 * Singleton pattern
 */
class IdFactory(){
  // this._id = 0;
  /**
   * Get unique id. Used for Html elements identification.
   * @return {String}
   */
  getId() {
    // return `id_${this._id++}`;
    return Symbol();
  }
}
