describe('The Safe Place - Critical User Journeys', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete full game startup sequence', () => {
    // Main menu
    cy.contains('THE SAFE PLACE').should('be.visible')

    // Start new game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()

    // Character creation
    cy.contains('CREAZIONE PERSONAGGIO').should('be.visible')
    cy.contains('INIZIA AVVENTURA').click()

    // Game loading
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Game screen
    cy.contains('MAPPA DEL MONDO').should('be.visible')
    cy.contains('HP:').should('be.visible')
    cy.contains('Sazietà:').should('be.visible')
    cy.contains('Idratazione:').should('be.visible')
  })

  it('should handle inventory operations', () => {
    // Start game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()
    cy.contains('INIZIA AVVENTURA').click()
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Open inventory
    cy.get('body').type('i')
    cy.contains('INVENTARIO').should('be.visible')

    // Close inventory (ESC)
    cy.get('body').type('{esc}')
    cy.contains('MAPPA DEL MONDO').should('be.visible')
  })

  it('should handle character sheet operations', () => {
    // Start game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()
    cy.contains('INIZIA AVVENTURA').click()
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Open character sheet
    cy.get('body').type('{tab}')
    cy.contains('SCHEDE PERSONAGGIO').should('be.visible')

    // Close character sheet (ESC)
    cy.get('body').type('{esc}')
    cy.contains('MAPPA DEL MONDO').should('be.visible')
  })

  it('should handle level up screen', () => {
    // Start game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()
    cy.contains('INIZIA AVVENTURA').click()
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Open level up screen
    cy.get('body').type('l')
    cy.contains('LEVEL UP').should('be.visible')

    // Close level up screen (ESC)
    cy.get('body').type('{esc}')
    cy.contains('MAPPA DEL MONDO').should('be.visible')
  })

  it('should handle shelter operations', () => {
    // Start game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()
    cy.contains('INIZIA AVVENTURA').click()
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Open shelter (assuming player starts near one)
    cy.get('body').type('r') // Rest action
    cy.contains('RIFUGIO').should('be.visible')

    // Close shelter (ESC)
    cy.get('body').type('{esc}')
    cy.contains('MAPPA DEL MONDO').should('be.visible')
  })

  it('should handle save/load operations', () => {
    // Start game
    cy.contains('NUOVA PARTITA').click()
    cy.contains('INIZIA').click()
    cy.contains('INIZIA AVVENTURA').click()
    cy.contains('CARICAMENTO...', { timeout: 15000 }).should('not.exist')

    // Quick save
    cy.get('body').type('{f5}')

    // Quick load
    cy.get('body').type('{f9}')

    // Game should still be running
    cy.contains('MAPPA DEL MONDO').should('be.visible')
  })

  it('should handle options screen', () => {
    cy.contains('OPZIONI').click()
    cy.contains('IMPOSTAZIONI').should('be.visible')

    // Go back
    cy.contains('INDIETRO').click()
    cy.contains('THE SAFE PLACE').should('be.visible')
  })

  it('should handle story screen', () => {
    cy.contains('STORIA').click()
    cy.contains('LA STORIA').should('be.visible')

    // Go back
    cy.contains('INDIETRO').click()
    cy.contains('THE SAFE PLACE').should('be.visible')
  })

  it('should handle instructions screen', () => {
    cy.contains('ISTRUZIONI').click()
    cy.contains('COME GIOCARE').should('be.visible')

    // Go back
    cy.contains('INDIETRO').click()
    cy.contains('THE SAFE PLACE').should('be.visible')
  })
})