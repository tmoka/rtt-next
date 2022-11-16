import axios from 'axios'
import { NextPage } from 'next'
import router, { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'

const CreateGenba: NextPage = () => {
  type GenbaInputType = {
    name: string
    kana?: string
    motouke?: string
  }

  const { control, handleSubmit } = useForm<GenbaInputType>()

  const router = useRouter()

  const onSubmit = (data: GenbaInputType) => {
    axios
      .post('/api/genbas', data)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(data))
    router.push('/genbas')
  }
  return (
    <>
      <h1>現場を新規作成する</h1>
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
        <Button className='mt-2' type='submit'>新規作成</Button>
        <Button className='mt-2 ms-1' variant='secondary' onClick={() => router.back()}>キャンセル</Button>
      </Form>
    </>
  )
}

export default CreateGenba
