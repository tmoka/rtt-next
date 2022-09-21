import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const data = req.body
    const { name, kana, email, password } = data

    const hashedPassword = await hash(password)

    const user = await prisma.user.create({
      data: {
        name,
        kana,
        email,
        hashedPassword,
      },
    })
    res.json(user)
  }
}

export default signupHandler
