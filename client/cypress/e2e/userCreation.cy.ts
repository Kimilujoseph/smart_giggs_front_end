describe('User Creation by Manager', () => {
  beforeEach(() => {
    // Login as manager first
    cy.login('manager@captech.co.ke', 'password123')
    cy.visit('/users')
  })

  it('should display the add user button', () => {
    cy.get('a[onclick*="setToggleAddUser"]').should('exist')
    cy.get('a[onclick*="setToggleAddUser"]').should('contain', 'Add User')
  })

  it('should open the user creation form when add user button is clicked', () => {
    cy.get('a[onclick*="setToggleAddUser"]').click()
    cy.get('form').should('exist')
    cy.get('h1').should('contain', 'Account Information')
  })

  it('should show validation errors for empty form submission', () => {
    cy.get('a[onclick*="setToggleAddUser"]').click()
    cy.get('button[type="submit"]').click()
    
    // Check for required field validation
    cy.get('select[name="userType"]').should('have.attr', 'required')
    cy.get('input[name="name"]').should('have.attr', 'required')
    cy.get('input[name="email"]').should('have.attr', 'required')
    cy.get('input[name="phone"]').should('have.attr', 'required')
    cy.get('input[name="password"]').should('have.attr', 'required')
    cy.get('input[name="nextofKinName"]').should('have.attr', 'required')
    cy.get('input[name="nextofKinPhone"]').should('have.attr', 'required')
  })

  it('should show validation error for invalid email format', () => {
    cy.get('a[onclick*="setToggleAddUser"]').click()
    cy.get('input[name="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    
    // Check for email validation
    cy.get('input[name="email"]').should('have.attr', 'type', 'email')
  })

  it('should show validation error for password length', () => {
    cy.get('a[onclick*="setToggleAddUser"]').click()
    cy.get('input[name="password"]').type('short')
    cy.get('button[type="submit"]').click()
    
    // Check for password length validation
    cy.get('input[name="password"]').should('have.attr', 'minLength', '8')
  })

  it('should successfully create a seller user', () => {
    // Mock successful user creation response
    cy.intercept('POST', '/api/user/seller/signup', {
      statusCode: 201,
      body: {
        message: 'User created successfully'
      }
    }).as('createSeller')

    cy.get('a[onclick*="setToggleAddUser"]').click()
    
    // Fill in the form
    cy.get('select[name="userType"]').select('seller')
    cy.get('input[name="name"]').type('Test Seller')
    cy.get('input[name="email"]').type('test.seller@example.com')
    cy.get('input[name="phone"]').type('+254712345678')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="nextofKinName"]').type('Next of Kin')
    cy.get('input[name="nextofKinPhone"]').type('+254712345679')
    
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

    cy.get('a[onclick*="setToggleAddUser"]').click()
    
    // Fill in the form
    cy.get('select[name="userType"]').select('manager')
    cy.get('input[name="name"]').type('Test Manager')
    cy.get('input[name="email"]').type('test.manager@example.com')
    cy.get('input[name="phone"]').type('+254712345680')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="nextofKinName"]').type('Next of Kin')
    cy.get('input[name="nextofKinPhone"]').type('+254712345681')
    
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

    cy.get('a[onclick*="setToggleAddUser"]').click()
    
    // Fill in the form
    cy.get('select[name="userType"]').select('seller')
    cy.get('input[name="name"]').type('Test Seller')
    cy.get('input[name="email"]').type('existing@example.com')
    cy.get('input[name="phone"]').type('+254712345678')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="nextofKinName"]').type('Next of Kin')
    cy.get('input[name="nextofKinPhone"]').type('+254712345679')
    
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

    cy.get('a[onclick*="setToggleAddUser"]').click()
    
    // Fill in the form
    cy.get('select[name="userType"]').select('seller')
    cy.get('input[name="name"]').type('Test Seller')
    cy.get('input[name="email"]').type('test.seller@example.com')
    cy.get('input[name="phone"]').type('+254712345678')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="nextofKinName"]').type('Next of Kin')
    cy.get('input[name="nextofKinPhone"]').type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    cy.wait('@createUser')

    // Check for error message
    cy.get('.error-message').should('be.visible')
  })

  it('should cancel form submission', () => {
    cy.get('a[onclick*="setToggleAddUser"]').click()
    cy.get('button[onclick*="setToggleAddUser(false)"]').click()
    
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

    cy.get('a[onclick*="setToggleAddUser"]').click()
    
    // Fill in the form
    cy.get('select[name="userType"]').select('seller')
    cy.get('input[name="name"]').type('Test Seller')
    cy.get('input[name="email"]').type('test.seller@example.com')
    cy.get('input[name="phone"]').type('+254712345678')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="nextofKinName"]').type('Next of Kin')
    cy.get('input[name="nextofKinPhone"]').type('+254712345679')
    
    cy.get('button[type="submit"]').click()

    // Check loading state
    cy.get('button[type="submit"]').should('contain', 'Submitting...')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('button[onclick*="setToggleAddUser(false)"]').should('be.disabled')
  })
}) 