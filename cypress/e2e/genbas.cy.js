describe('ログイン状態で現場一覧ページを開く', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('localhost:3000/genbas')
  })
  it('現場一覧が表示される', () => {
    cy.get('h1').should('have.text', '現場リスト')
  })
})
