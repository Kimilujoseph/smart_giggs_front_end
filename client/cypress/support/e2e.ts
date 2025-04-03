/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('password123', 'password123')
       */
      login(email: string, password: string): Chainable<void>
    }
  }
} 