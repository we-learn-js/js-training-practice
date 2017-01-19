/**
 * QuizNav converted to QuizCtrl
 */
class QuizCtrl {
    /**
     * @param  {UserQuiz} quiz
     */
    constructor(quiz){
        this.quiz.on('response', this.onResponse)
        this.quiz.on('empty_response', this.onEmptyResponse)
    }

    /**
     * Handle response event
     * @param  {String|Array} response
     */
    onResponse(response) {}

    /**
     * Handle empty response event
     */
    onEmptyResponse() {}
}