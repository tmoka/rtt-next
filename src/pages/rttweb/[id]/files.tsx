import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'
import { Button } from 'react-bootstrap'

const FILES_API_FILE_FORM_KEY = 'file'

const Files: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/genbas/' + id + '/files', fetcher)
  console.log(data)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData()
    acceptedFiles.map((file: File) => {
      console.log(file)
      formData.append(FILES_API_FILE_FORM_KEY, file)
    })
    try {
      console.log(formData.get('file'))
      await axios.post('/api/genbas/' + id + '/files', formData)
    } catch (e) {
      console.error(e)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleDelete = () => {}

  if (!data) return <>loading</>

  return (
    <section className='container'>
      <div {...getRootProps()}>
        <input {...getInputProps({ className: 'dropzone' })} />
        {isDragActive ? (
          <p>Drop file here!</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <h2>{data.length}個のファイル</h2>
      <Button variant='primary'>ダウンロード</Button>
      <Button variant='danger'>全削除</Button>
      {data.map((elem: any, idx: number) => {
        return (
          <>
            <p key={idx}>{elem.fileName}</p>
            <p>{elem.stat.mtime}</p>
            <p>{elem.stat.size}B</p>
            <Button variant='danger' id={String(idx)}>
              削除
            </Button>
          </>
        )
      })}
    </section>
  )
}

export default Files
