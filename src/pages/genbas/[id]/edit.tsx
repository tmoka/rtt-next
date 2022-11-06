import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import useSWR from 'swr'
import { Button, Form, Alert } from 'react-bootstrap'

const EditGenba: NextPage = () => {
  type EditGenbaType = {
    name: string
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
      <h1>現場編集</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>現場名</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='name'
            control={control}
            defaultValue={editGenba.name}
          />
        </Form.Group>
        <Button type='submit'>編集</Button>
      </Form>
    </div>
  )
}

export default EditGenba
