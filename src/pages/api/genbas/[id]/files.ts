import { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Formidable } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

const form = formidable({ multiples: true })

const filesHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const contentType = req.headers['content-type']

    form.parse(req, async function (err, fields, files) {
      const acceptedFiles = files.file
      if (Array.isArray(acceptedFiles)) {
        acceptedFiles.map(async (elem: any) => {
          console.log(JSON.stringify(elem))
          await saveFile(elem)
        })
      }
      return res.status(200).send('')
    })
    return res.json({})
  }
  return res.json({})
}

const saveFile = async (file: any) => {
  const data = fs.readFileSync(file.filepath)
  fs.writeFileSync(`./public/${file.originalFilename}`, data)
  await fs.unlinkSync(file.filepath)
  return
}

export default filesHandler
