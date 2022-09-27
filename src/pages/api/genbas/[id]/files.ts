import { NextApiRequest, NextApiResponse } from "next"
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
};


const filesHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log("TEST TEXT")
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      console.log(JSON.stringify(files.file))
      await saveFile(files.file);
      return res.status(200).send("");
    });
    
    
    return res.json({})
  }
  return res.json({})
}

const saveFile = async (file: any) => {
  const data = fs.readFileSync(file.filepath);
  fs.writeFileSync(`./public/${file.originalFilename}`, data);
  await fs.unlinkSync(file.filepath);
  return;
};

export default filesHandler