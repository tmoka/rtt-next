import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { padZero } from '../../../../common/utils'
import { loadGenbaFiles } from '../../../../rtt_loader/files.node'

const rttwebHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { id } = req.query

  if (req.method === 'GET') {
    const genbaDir = 'uploads/genbas/' + padZero(Number(id), 4) + '/rttweb/original'
    const genba = await loadGenbaFiles(genbaDir)

    return res.json(genba)
  }
}
export default rttwebHandler
