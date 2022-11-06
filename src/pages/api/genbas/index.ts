import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../db'

const genbasHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const allGenbas = await prisma.genba.findMany()
    return res.json(allGenbas)
  }
  if (req.method === 'POST') {
    const name = req.body.name

    const createGenba = await prisma.genba.create({
      data: {
        name,
      },
    })
    return res.json(createGenba)
  }
}
export default genbasHandler
