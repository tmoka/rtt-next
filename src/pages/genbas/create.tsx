import axios from 'axios'
import { NextPage } from 'next'
import router from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'

const CreateGenba: NextPage = () => {
  type GenbaInputType = {
    name: string
  }

  const { control, handleSubmit } = useForm<GenbaInputType>()

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
      <h1>現場新規登録</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>現場名</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='name'
            control={control}
            defaultValue=''
          />
        </Form.Group>
        <Button type='submit'>新規現場登録</Button>
      </Form>
    </>
  )
}

export default CreateGenba
