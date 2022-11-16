import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'
import { Button, Alert, Table } from 'react-bootstrap'

const FILES_API_FILE_FORM_KEY = 'file'

const Files: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: files, error } = useSWR(`/api/genbas/${id}/files`, fetcher)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData()
    acceptedFiles.map((file: File) => {
      formData.append(FILES_API_FILE_FORM_KEY, file)
    })
    try {
      await axios.post(`/api/genbas/${id}/files`, formData)
    } catch (err) {
      console.error(err)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleDeleteAll = () => {
    axios
      .delete(`/api/genbas/${id}/files`)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
  }

  if (!files) return (
    <section className='container' id='files-form'>
      <div {...getRootProps()} className='drop-box'>
        <input {...getInputProps({ className: 'dropzone' })} />
        {isDragActive ? (
          <p>ファイル選択中</p>
        ) : (
          <p>ファイルをここにドラッグ&ドロップするとアップロード</p>
        )}
      </div>
    </section>)
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>

  return (
    <section className='container' id='files-form'>
      <div {...getRootProps()} className='drop-box'>
        <input {...getInputProps({ className: 'dropzone' })} />
        {isDragActive ? (
          <p>ファイル選択中</p>
        ) : (
          <p>ファイルをここにドラッグ&ドロップするとアップロード</p>
        )}
      </div>

      <Table>
        <thead>
          <tr>
            <th>ローカル</th>
            <th></th>
            <th>サーバー</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td>
              <p>{files.length}個のファイル</p>
            </td>
            <td>
              <Button variant='danger' onClick={handleDeleteAll}>全削除</Button>
            </td>
          </tr>
          {
            files.map((elem: any, idx: number) => {
              return (
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <span key={idx}>{elem.fileName}</span><br />
                    <span style={{ fontSize: '13px' }}>{elem.stat.mtime} {elem.stat.size}B</span>
                  </td>
                  <td>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </section >
  )
}

export default Files
