import axios from "axios"
import { NextPage } from "next"
import path from "path";
import { useCallback } from "react"
import { useDropzone } from 'react-dropzone'

const FILES_API_FILE_FORM_KEY = 'file';

const Files: NextPage = () => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData();
    acceptedFiles.map((file: File) => {
      console.log(file)
      formData.append(FILES_API_FILE_FORM_KEY, file)
    })
    try {
      console.log(formData.get('file'))
      await axios.post('/api/genbas/1/files', formData)
    } catch (e) {
      console.error(e)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (<section className='container'><div {...getRootProps()}>
    <input {...getInputProps({ className: 'dropzone' })} />
    {isDragActive ? <p>Drop file here!</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
  </div></section>)
}

export default Files