var count = 0

/**
 * In charge of unique ids creation
 */
class IdFactory {
  this._id = 0;

  /**
   * Get unique id. Used for Html elements identification.
   * @return {String}
   */
  static getId () {
    return `id_${this._id++}`;
  }
}

export default IdFactory
