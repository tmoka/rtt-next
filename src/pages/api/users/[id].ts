import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { useRouter } from 'next/router'
import usersController from '.'
import { prisma } from '../../../db'

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { id } = req.query

  if (req.method === 'GET') {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    })
    return res.json(user)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const { name, kana, email } = data
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        kana,
        email,
      },
    })
    return res.json(user)
  }

  if (req.method === 'DELETE') {
    const deleteUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    })
    return res.json(deleteUser)
  }
  return res.json({})
}

export default userHandler
