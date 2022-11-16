import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import useSWR from 'swr'
import { Button, Form, Alert } from 'react-bootstrap'

const EditGenba: NextPage = () => {
  type EditGenbaType = {
    name: string
    kana?: string
    motouke?: string
  }

  const { control, handleSubmit, setValue } = useForm<EditGenbaType>()

  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: editGenba, error } = useSWR('/api/genbas/' + id, fetcher)
  if (!id || !editGenba) return <Alert variant='warning'>データをロード中です</Alert>
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>
  setValue('name', editGenba.name)

  const onSubmit = (editGenba: EditGenbaType) => {
    axios
      .put('/api/genbas/' + id, editGenba)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(editGenba))
    router.push('/genbas')
  }

  return (
    <div>
      <h1>現場を更新する</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>現場名<span style={{ color: 'red' }}>*</span></Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='name'
            control={control}
            defaultValue=''
          />
          <Form.Label>フリガナ</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='kana'
            control={control}
            defaultValue=''
          />
          <Form.Label>元請け</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='motouke'
            control={control}
            defaultValue=''
          />
        </Form.Group>
        <Button className='mt-2' type='submit'>更新</Button>
        <Button className='mt-2 ms-1' variant='secondary' onClick={() => router.back()}>キャンセル</Button>
      </Form>
    </div>
  )
}

export default EditGenba
