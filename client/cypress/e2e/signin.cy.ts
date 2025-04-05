const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibWFuYWdlciIsImVtYWlsIjoibWFuYWdlckBjYXB0ZWNoLmNvLmtlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const actualToken = localStorage.getItem('tk');

describe('SignIn Page', () => {
  beforeEach(() => {
    cy.visit('/auth/signin')
  })

  it('should display the sign in form', () => {
    // Check if the form elements are present
    cy.get('form').should('exist')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should show validation errors for empty form submission', () => {
    cy.get('button[type="submit"]').click()
    
    // Check for required field validation
    cy.get('input[type="email"]').should('have.attr', 'required')
    cy.get('input[type="password"]').should('have.attr', 'required')
  })

  it('should show validation error for invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Check for email validation
    cy.get('input[type="email"]').should('have.attr', 'type', 'email')
  })

  it('should handle successful login', () => {
    // Mock successful login response

    cy.intercept('POST', '/api/user/user/signin', {
      statusCode: 200,
      body: {
        token: mockToken,
        status: 200,
        message: 'Login successful'
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Loading ...')

    // Wait for the login request to complete
    cy.wait('@loginRequest')

	// Reload the page
	// cy.reload()

    // Check if redirected to home page
    cy.url().should('not.include', '/auth/signin')
  })

  it('should handle failed login with incorrect credentials', () => {
    // Mock failed login response
    cy.intercept('POST', '/api/user/user/signin', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')

    // Check if error message is displayed
    cy.get('.error-message').should('be.visible')
  })

  it('should handle unauthorized role access', () => {
    // Mock response with unauthorized role
    cy.intercept('POST', '/api/user/user/signin', {
      statusCode: 200,
      body: {
        token: mockToken,
        role: 'unauthorized_role'
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')

    // Check if unauthorized alert is shown
    cy.on('window:alert', (str) => {
      expect(str).to.equal('An error occurred')
    })
  })

  it('should handle network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '/api/user/user/signin', {
      forceNetworkError: true
    }).as('loginRequest')

    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')

    // Check if error message is displayed
    cy.get('.error-message').should('be.visible')
  })

  it('should persist login state after page refresh', () => {
    // Mock successful login
    cy.intercept('POST', '/api/user/user/signin', {
      statusCode: 200,
      body: {
        token: mockToken,
        status: 200,
        message: 'Login successful'
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')

    // Refresh the page
    cy.reload()

    // Check if still logged in (not on signin page)
    cy.url().should('not.include', '/auth/signin')
  })

  it('should show loading state during login attempt', () => {
    // Mock slow response
    cy.intercept('POST', '/api/user/user/signin', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: {
          token: mockToken,
          status: 200,
          message: 'Login successful'
        }
      })
    }).as('loginRequest')

    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Loading ...')
  })
}) 