describe('ログインする', () => {
  it('トップ画面に遷移する', () => {
    cy.login()

    cy.get('h1').should('have.text', 'トップ画面（ログイン中）')
  })
})
