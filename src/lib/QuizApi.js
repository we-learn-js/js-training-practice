export default class QuizApi {

  static setConfigUrl (url) {
    this.__configUrl__ = url
    return this
  }
  
  static setResponseUrl (url) {
    this.__responseUrl__ = url
    return this
  }

  static getConfig () {
    return getJson(this.__configUrl__)
  }

  static getResponse (i) {
    return getJson(this.__responseUrl__.replace(':index', i))
      .then(response => response.response)
  }
}

function getJson (url) {
  return new Promise(function (resolve, reject) {
    $.ajax({ url: url }).done(resolve)
  })
}
