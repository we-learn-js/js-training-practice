const {
  data,
  BUTTON_SELECTOR,
  RESET_SELECTOR,
  PROGRESS_SELECTOR,
  RESPONSE_MSG,
  questionSelector
} = require('./helpers')

describe('Quiz', () => {

  before((client, done) => {
    client
      .url(client.launchUrl)
      .waitForElementVisible('body', 3000, () => done())
  })

  after((client, done) => {
    client
      .end(() => done())
  })

  describe('when it\'s displayed', () => {
    before((client, done) => {
      client
        .waitForElementVisible('body', 3000)
        .pause(2000, () => done())
    })

    it('should display the title from config', (client) => {
      client.expect.element('h1').text.to.equal(data.title)
    })

    it('should SET progress bar', (client) => {
      client.expect.element(PROGRESS_SELECTOR)
        .to.have.css("width").which.equals('0px')
    })

    it('should only the display the first question', (client) => {
      client.expect.element(questionSelector(1))
        .to.be.visible
      client.expect.element(questionSelector(2))
        .to.not.be.visible
      client.expect.element(questionSelector(3))
        .to.not.be.visible
    })

    it('should display description of the question', (client) => {
      client.expect.element(questionSelector(1))
        .text.to.contain(data.questions[0].problem)
    })
  })

  describe('when a question is not answered', () => {

    before((client, done) => {
      client.click(BUTTON_SELECTOR, () => {
        done()
      })
    })

    it('should display an alert and maintain question', (client) => {
      client.getAlertText((alert) => {
        client.acceptAlert(() => {
          client.assert.ok(alert.value === RESPONSE_MSG)
          client.expect.element(questionSelector(1))
            .to.be.visible
        })
      })
    })
  })

  describe('when a question is answered', () => {

    before((client, done) => {
      client
        .setValue(`${questionSelector(1)} input[type=radio]`,
          data.questions[0].input.options[2].label)
      client.click(BUTTON_SELECTOR, () => done())
    })

    it('should display the next question', (client) => {
      client.expect.element(questionSelector(1))
        .to.not.be.visible
      client.expect.element(questionSelector(2))
        .to.be.visible
    })

    it('should update progress bar', (client) => {
      client.expect.element(PROGRESS_SELECTOR)
        .to.have.css("width").which.not.equals('0px')
    })
  })

  describe('when the page is refeshed and a question has been answered', () => {

    before((client, done) => {
      client
        .url(client.launchUrl)
        .waitForElementVisible('body', 1000, () => done())
    })

    it('should display the last non answered question', (client) => {
      client.expect.element(questionSelector(1))
        .to.not.be.visible
      client.expect.element(questionSelector(2))
        .to.be.visible
    })
  })

  describe('when reset is pressed', () => {

    before((client, done) => {
      client
        .click(RESET_SELECTOR)
        .waitForElementVisible('body', 1000, () => done())
    })

    it('should return to first question', (client) => {
      client.expect.element(questionSelector(1))
        .to.be.visible
      client.expect.element(questionSelector(2))
        .to.not.be.visible
    })
  })
})
