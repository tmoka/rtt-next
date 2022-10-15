import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
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
  if (req.method === 'GET') {
    const dirPath = path.join('uploads', 'genbas', fillZeroFolderId(String(id)))
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
  const uploadPath = path.join('uploads', 'genbas', fillZeroFolderId(genbaId))
  fs.existsSync(uploadPath) ? null : fs.mkdirSync(uploadPath)
  fs.writeFileSync(uploadPath + `/${file.originalFilename}`, data)
  await fs.unlinkSync(file.filepath)
  return
}

// 現場IDが3桁以下の場合、フォルダ名の前方を0で埋めて4桁に揃える
const fillZeroFolderId = (genbaId: string): string => {
  const genbaIdLength = genbaId.length
  if (genbaIdLength > 3) {
    return genbaId
  }
  return '0'.repeat(4 - genbaIdLength) + genbaId
}

export default filesHandler
