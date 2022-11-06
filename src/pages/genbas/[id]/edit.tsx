import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import useSWR from 'swr'
import { Button, Form } from 'react-bootstrap'

const GenbaEdit: NextPage = () => {
  type GenbaEditType = {
    name: string
  }

  const { control, handleSubmit, setValue } = useForm<GenbaEditType>()

  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/genbas/' + id, fetcher)
  if (!id) return <>Loading</>
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>
  setValue('name', data.name)

  const onSubmit = (data: GenbaEditType) => {
    axios
      .put('/api/genbas/' + id, data)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(data))
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
            defaultValue={data.name}
          />
        </Form.Group>
        <Button type='submit'>編集</Button>
      </Form>
    </div>
  )
}

export default GenbaEdit
