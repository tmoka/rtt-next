import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../db'

const genbaHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { id } = req.query

  if (req.method === 'GET') {
    const genba = await prisma.genba.findUnique({
      where: {
        id: Number(id),
      },
    })
    return res.json(genba)
  }

  if (req.method === 'PUT') {
    const name = req.body.name

    const updateGenba = await prisma.genba.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    })
    return res.json(updateGenba)
  }

  if (req.method === 'DELETE') {
    const deleteGenba = await prisma.genba.delete({
      where: {
        id: Number(id),
      },
    })
    return res.json(deleteGenba)
  }
}
export default genbaHandler
