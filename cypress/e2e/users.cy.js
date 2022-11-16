describe('ログイン状態でユーザ一覧ページを開く', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('localhost:3000/users')
  })
  it('ユーザーリストが表示される', () => {
    cy.get('h1').should('have.text', 'ユーザーリスト')
  })
})
