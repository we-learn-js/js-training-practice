var count = 0

/**
 * In charge of unique ids creation
 */
class IdFactory {

  /**
   * Get unique id. Used for Html elements identification.
   * @return {String}
   */
  static getId () {
    return 'id' + count++
  }
}

export default IdFactory
