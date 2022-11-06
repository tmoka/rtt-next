import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from '../../../db'

const genbasHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    let { id } = req.query
  
    if (req.method === 'GET') {
      const allGenbas = await prisma.user.findMany()
      return res.json(allGenbas)
    }
  }
  export default genbasHandler
  