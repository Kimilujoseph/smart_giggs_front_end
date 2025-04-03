import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'ypbavo',
  e2e: {
    baseUrl: 'http://localhost:4422',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
