import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verify } from 'argon2'
import { prisma } from '../../../db'

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      // サインインフォームに表示する名前 (例: "Sign in with...")
      name: 'ログインフォーム',
      // 認証情報はサインインページに適切なフォームを生成するために使用される
      // 送信されることを期待するフィールドを何でも指定できる
      // 例: ドメイン、ユーザー名、パスワード、2FAトークンなど
      // オブジェクトを通して任意の HTML 属性を <input> タグに渡すことができる
      credentials: {
        email: { label: 'メールアドレス', type: 'email', placeholder: 'メールアドレス' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials, req) {
        // 提供されたcretentialからユーザーを検索
        const email = credentials?.email
        if (!email) return null

        const password = credentials?.password
        if (!password) return null

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!user) return null

        const isValidPassword = await verify(user?.hashedPassword, password)

        // 返されたオブジェクトはJWTの `user` プロパティに保存される
        if (isValidPassword) {
          return user
        } else {
          // NULLを返した場合、ユーザーに詳細を確認するよう促すエラーが表示される
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    signingKey: {"kty":"oct","kid":"--","alg":"HS256","k":"--"},
    verificationOptions: {
      algorithms: ["HS256"]
    }
  },
})
