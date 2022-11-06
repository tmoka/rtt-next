import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { padZero } from '../../../../common/utils'

export const config = {
  api: {
    bodyParser: false,
  },
}

const UPLOAD_FOLDER_NAME_LENGTH = 4

const form = formidable({ multiples: true })

const filesHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  if (req.method === 'GET') {
    const dirPath = path.join('uploads', 'genbas', padZero(Number(id), UPLOAD_FOLDER_NAME_LENGTH))
    const fileNameList = fs.readdirSync(dirPath)
    let results: object[] = []
    fileNameList.map((fileName: string) => {
      const stat = fs.statSync(path.join(dirPath, fileName))
      const obj = { fileName: fileName, stat: stat }
      results.push(obj)
    })
    return res.json(results)
  }

  if (req.method === 'POST') {
    const contentType = req.headers['content-type']

    form.parse(req, async function (err, fields, files) {
      const acceptedFiles = files.file
      if (Array.isArray(acceptedFiles)) {
        acceptedFiles.map(async (elem: any) => {
          await saveFile(elem, String(id))
        })
      }
      return res.status(200).send('')
    })
  }
}

const saveFile = async (file: any, genbaId: string) => {
  const data = fs.readFileSync(file.filepath)
  const uploadPath = path.join(
    'uploads',
    'genbas',
    padZero(Number(genbaId), UPLOAD_FOLDER_NAME_LENGTH),
  )
  fs.existsSync(uploadPath) ? null : fs.mkdirSync(uploadPath)
  fs.writeFileSync(uploadPath + `/${file.originalFilename}`, data)
  await fs.unlinkSync(file.filepath)
  return
}

export default filesHandler
