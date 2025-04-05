describe('User Creation by Manager', () => {
  beforeEach(() => {
    // Login as manager first
    cy.visit('/auth/signin')
    cy.get('input[type="email"]').type('manager@captech.co.ke')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Wait for login to complete and redirect
    cy.url().should('not.include', '/auth/signin')
    
    // Visit users page
    cy.visit('/users')
  })

  it('should display the add user button', () => {
    cy.get('a[class*="rounded-full border border-primary"]').should('exist')
    cy.get('a[class*="rounded-full border border-primary"]').should('contain', 'Add User')
  })

  it('should open the user creation form when add user button is clicked', () => {
    cy.get('a[class*="rounded-full border border-primary"]').click()
    cy.get('form').should('exist')
    cy.get('h1').should('contain', 'Account Information')
  })

  it('should show validation errors for empty form submission', () => {
    cy.get('a[class*="rounded-full border border-primary"]').click()
    cy.get('button[type="submit"]').click()
    
    // Check for required field validation
    cy.get('select[value]').should('have.attr', 'required')
    cy.get('input[placeholder="Enter full name"]').should('have.attr', 'required')
    cy.get('input[placeholder="Enter your email address"]').should('have.attr', 'required')
    cy.get('input[placeholder="Enter phone number"]').should('have.attr', 'required')
    cy.get('input[placeholder="Enter password"]').should('have.attr', 'required')
    cy.get('input[placeholder="Enter full name"]').eq(1).should('have.attr', 'required')
    cy.get('input[placeholder="Enter phone number"]').eq(1).should('have.attr', 'required')
  })

  it('should show validation error for invalid email format', () => {
    cy.get('a[class*="rounded-full border border-primary"]').click()
    cy.get('input[placeholder="Enter your email address"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    
    // Check for email validation
    cy.get('input[placeholder="Enter your email address"]').should('have.attr', 'type', 'email')
  })

  it('should show validation error for password length', () => {
    cy.get('a[class*="rounded-full border border-primary"]').click()
    cy.get('input[placeholder="Enter password"]').type('short')
    cy.get('button[type="submit"]').click()
    
    // Check for password length validation
    cy.get('input[placeholder="Enter password"]').should('have.attr', 'minLength', '8')
  })

  it('should successfully create a seller user', () => {
    // Mock successful user creation response
    cy.intercept('POST', '/api/user/seller/signup', {
      statusCode: 201,
      body: {
        message: 'User created successfully'
      }
    }).as('createSeller')

    cy.get('a[class*="rounded-full border border-primary"]').click()
    
    // Fill in the form
    cy.get('select[value]').select('seller')
    cy.get('input[placeholder="Enter full name"]').first().type('Test Seller')
    cy.get('input[placeholder="Enter your email address"]').type('test.seller@example.com')
    cy.get('input[placeholder="Enter phone number"]').first().type('+254712345678')
    cy.get('input[placeholder="Enter password"]').type('password123')
    cy.get('input[placeholder="Enter full name"]').eq(1).type('Next of Kin')
    cy.get('input[placeholder="Enter phone number"]').eq(1).type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Submitting...')

    // Wait for the request to complete
    cy.wait('@createSeller')

    // Check for success message
    cy.get('.success-message').should('be.visible')
    cy.get('.success-message').should('contain', 'User created successfully')
  })

  it('should successfully create a manager user', () => {
    // Mock successful user creation response
    cy.intercept('POST', '/api/user/manager/signup', {
      statusCode: 201,
      body: {
        message: 'User created successfully'
      }
    }).as('createManager')

    cy.get('a[class*="rounded-full border border-primary"]').click()
    
    // Fill in the form
    cy.get('select[value]').select('manager')
    cy.get('input[placeholder="Enter full name"]').first().type('Test Manager')
    cy.get('input[placeholder="Enter your email address"]').type('test.manager@example.com')
    cy.get('input[placeholder="Enter phone number"]').first().type('+254712345680')
    cy.get('input[placeholder="Enter password"]').type('password123')
    cy.get('input[placeholder="Enter full name"]').eq(1).type('Next of Kin')
    cy.get('input[placeholder="Enter phone number"]').eq(1).type('+254712345681')
    
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Submitting...')

    // Wait for the request to complete
    cy.wait('@createManager')

    // Check for success message
    cy.get('.success-message').should('be.visible')
    cy.get('.success-message').should('contain', 'User created successfully')
  })

  it('should handle duplicate email error', () => {
    // Mock duplicate email error response
    cy.intercept('POST', '/api/user/seller/signup', {
      statusCode: 400,
      body: {
        message: 'Email already exists'
      }
    }).as('createUser')

    cy.get('a[class*="rounded-full border border-primary"]').click()
    
    // Fill in the form
    cy.get('select[value]').select('seller')
    cy.get('input[placeholder="Enter full name"]').first().type('Test Seller')
    cy.get('input[placeholder="Enter your email address"]').type('existing@example.com')
    cy.get('input[placeholder="Enter phone number"]').first().type('+254712345678')
    cy.get('input[placeholder="Enter password"]').type('password123')
    cy.get('input[placeholder="Enter full name"]').eq(1).type('Next of Kin')
    cy.get('input[placeholder="Enter phone number"]').eq(1).type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    cy.wait('@createUser')

    // Check for error message
    cy.get('.error-message').should('be.visible')
    cy.get('.error-message').should('contain', 'Email already exists')
  })

  it('should handle network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '/api/user/seller/signup', {
      forceNetworkError: true
    }).as('createUser')

    cy.get('a[class*="rounded-full border border-primary"]').click()
    
    // Fill in the form
    cy.get('select[value]').select('seller')
    cy.get('input[placeholder="Enter full name"]').first().type('Test Seller')
    cy.get('input[placeholder="Enter your email address"]').type('test.seller@example.com')
    cy.get('input[placeholder="Enter phone number"]').first().type('+254712345678')
    cy.get('input[placeholder="Enter password"]').type('password123')
    cy.get('input[placeholder="Enter full name"]').eq(1).type('Next of Kin')
    cy.get('input[placeholder="Enter phone number"]').eq(1).type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    cy.wait('@createUser')

    // Check for error message
    cy.get('.error-message').should('be.visible')
  })

  it('should cancel form submission', () => {
    cy.get('a[class*="rounded-full border border-primary"]').click()
    cy.get('button[class*="bg-warning"]').click()
    
    // Check if form is closed
    cy.get('form').should('not.exist')
  })

  it('should show loading state during form submission', () => {
    // Mock slow response
    cy.intercept('POST', '/api/user/seller/signup', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 201,
        body: {
          message: 'User created successfully'
        }
      })
    }).as('createUser')

    cy.get('a[class*="rounded-full border border-primary"]').click()
    
    // Fill in the form
    cy.get('select[value]').select('seller')
    cy.get('input[placeholder="Enter full name"]').first().type('Test Seller')
    cy.get('input[placeholder="Enter your email address"]').type('test.seller@example.com')
    cy.get('input[placeholder="Enter phone number"]').first().type('+254712345678')
    cy.get('input[placeholder="Enter password"]').type('password123')
    cy.get('input[placeholder="Enter full name"]').eq(1).type('Next of Kin')
    cy.get('input[placeholder="Enter phone number"]').eq(1).type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Submitting...')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('button[class*="bg-warning"]').should('be.disabled')
  })
}) 