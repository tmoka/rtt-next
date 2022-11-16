describe('未ログイン状態でトップページにアクセスする', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  it('未ログイン用のトップページが表示される', () => {
    cy.wait(10)
    cy.get('h1').should('have.text', 'トップ画面（未ログイン）')
    cy.get('#login-button').should('have.text', 'ログイン')
    cy.get('#signup-button').should('have.text', 'アカウント登録')
  })

  it('ログインボタンをクリックするとログインページに飛ぶ', () => {
    cy.wait(10)
    cy.get('#login-button').click().url().should('include', 'api/auth/signin')
  })

  it('アカウント登録ボタンをクリックするとアカウント新規登録ページに飛ぶ', () => {
    cy.wait(10)
    cy.get('#signup-button').click().url().should('include', 'signup')
  })
})
