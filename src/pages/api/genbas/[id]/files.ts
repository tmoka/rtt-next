import { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Formidable } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const form = formidable({ multiples: true })

const filesHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  if (req.method === 'POST') {
    const contentType = req.headers['content-type']

    form.parse(req, async function (err, fields, files) {
      const acceptedFiles = files.file
      if (Array.isArray(acceptedFiles)) {
        acceptedFiles.map(async (elem: any) => {
          console.log(JSON.stringify(elem))
          await saveFile(elem, String(id))
        })
      }
      return res.status(200).send('')
    })
  }
}

const saveFile = async (file: any, genbaId: string) => {
  const data = fs.readFileSync(file.filepath)
  const uploadPath = path.join('uploads', 'genbas', genbaId)
  fs.existsSync(uploadPath) ? null : fs.mkdirSync(uploadPath)
  fs.writeFileSync(uploadPath + `/${file.originalFilename}`, data)
  await fs.unlinkSync(file.filepath)
  return
}

export default filesHandler
