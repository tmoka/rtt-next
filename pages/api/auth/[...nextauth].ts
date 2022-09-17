import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { verify } from "argon2"

const prisma = new PrismaClient()

export default NextAuth({
  providers: [
    CredentialsProvider({
      // サインインフォームに表示する名前 (例: "Sign in with...")
      name: "Credentials POC",
      // 認証情報は、サインインページに適切なフォームを生成するために使用されます。
      // 送信されることを期待するフィールドを何でも指定することができます。
      // 例: ドメイン、ユーザー名、パスワード、2FAトークンなど。
      // オブジェクトを通して、任意の HTML 属性を <input> タグに渡すことができます。
      credentials: {
        email: { label: "メールアドレス", type: "email", placeholder: "メールアドレス" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials, req) {
        // 提供されたcretentialからユーザーを検索
        const email = credentials?.email;
        if (!email) return null;

        const password = credentials?.password;
        if (!password) return null;

        const user = await prisma.user.findFirst({
          where: {
            email,
          }
        })

        if (!user) return null;

        const isValidPassword = await verify(user?.hashedPassword, password);

        // 返されたオブジェクトはJWTの `user` プロパティに保存される
        if (isValidPassword) {
          return user
        } else {
          // もし、NULLを返した場合は、ユーザーに詳細を確認するよう促すエラーが表示されます。
          return null
          // また、このコールバックをエラーで拒否することもできます。この場合、ユーザーはエラーメッセージをクエリパラメータとして持つエラーページに送られます。
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
})