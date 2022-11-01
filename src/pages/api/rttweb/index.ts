import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { loadGenbaFiles } from '../../../rtt_loader/files.node'

const prisma = new PrismaClient()

const rttwebHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const genba = await loadGenbaFiles("/Users/tomowatari/Documents/rtt-next/uploads/genbas/0001/rttweb/original")

    return res.json(genba)
  }
}
export default rttwebHandler
