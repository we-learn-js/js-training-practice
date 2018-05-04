/* global cy, expect, Cypress */

import {
  data,
  BUTTON_SELECTOR,
  RESET_SELECTOR,
  PROGRESS_SELECTOR,
  RESPONSE_MSG,
  questionSelector
} from './fixtures/constants'

describe('JS Practice | Quiz', () => {
  before(() => cy.visit('/'))

  describe("when it's displayed", () => {
    it('should display the title', () => {
      cy.title().should('include', 'Quiz')
    })

    it('should display the header title from config', () => {
      cy.get('h1').contains(data.title)
    })

    it('should SET progress bar', () => {
      cy.get(PROGRESS_SELECTOR).should('have.css', 'width', '0px')
    })

    it('should only the display the first question', () => {
      cy.get(questionSelector(1)).should('be.visible')
      cy.get(questionSelector(2)).should('not.be.visible')
      cy.get(questionSelector(3)).should('not.be.visible')
    })

    it('should display description of the question', () => {
      cy.get(questionSelector(1)).should('contain', data.questions[0].problem)
    })
  })

  describe('when a question is not answered', () => {
    it('should display an alert and maintain question', () => {
      const stub = cy.stub()
      cy.on('window:alert', stub)
      cy
        .get(BUTTON_SELECTOR)
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(RESPONSE_MSG)
          cy.get(questionSelector(1)).should('be.visible')
        })
    })
  })

  describe('when a question is answered', () => {
    before(() => {
      cy
        .get(`${questionSelector(1)} input[type=radio]`)
        .eq(2)
        .click()
    })

    it('should save the response', () => {
      cy
        .get(BUTTON_SELECTOR)
        .click()
        .should(function() {
          expect(localStorage.getItem('quiz')).to.contain('"responseCount":1')
        })
    })

    it('should display the next question', () => {
      cy.get(questionSelector(1)).should('not.be.visible')
      cy.get(questionSelector(2)).should('be.visible')
      cy.get(questionSelector(3)).should('not.be.visible')
    })

    it('should update progress bar', () => {
      cy.get(PROGRESS_SELECTOR).should('not.have.css', 'width', '0px')
    })
  })

  describe('when the page is refeshed and a question has been answered', () => {
    before(() =>
      cy
        .reload()
        .then(() => cy.clearLocalStorage())
        .then(ls => {
          ls.setItem(
            'quiz',
            `{"responses":[["2 years"],null],"responseCount":1,"currentQuestion":1}`
          )
        })
    )

    it('should display the last non answered question', () => {
      cy.get(questionSelector(1)).should('not.be.visible')
      cy.get(questionSelector(2)).should('be.visible')
      cy.get(questionSelector(3)).should('not.be.visible')
    })
  })

  describe('when reset is pressed', () => {
    it('should reset responses data', () => {
      cy
        .get(RESET_SELECTOR)
        .click()
        .should(function() {
          expect(localStorage.getItem('quiz')).to.be.null
        })
    })

    it('should return to first question', () => {
      cy.get(questionSelector(1)).should('be.visible')
      cy.get(questionSelector(2)).should('not.be.visible')
      cy.get(questionSelector(3)).should('not.be.visible')
    })
  })
})
