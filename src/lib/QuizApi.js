export default class QuizApi {
  static getConfig (url) {
    return getJson(url)
  }

  static getResponse (url, i) {
    return getJson(url.replace(':index', i))
      .then(response => response.response)
  }
}

function getJson (url) {
  return new Promise(function (resolve, reject) {
    $.ajax({ url: url }).done(resolve)
  })
}
