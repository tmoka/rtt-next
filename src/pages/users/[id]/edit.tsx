import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import useSWR from 'swr'
import { Alert } from 'react-bootstrap'

const EditUser: NextPage = () => {
  type EditUserType = {
    name: string
    kana: string
    email: string
  }

  const { control, handleSubmit, setValue } = useForm<EditUserType>()

  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: editUser, error } = useSWR('/api/users/' + id, fetcher)
  if (!id || !editUser) return <Alert variant='warning'>データをロード中です</Alert>
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>
  setValue('name', editUser.name)
  setValue('kana', editUser.kana)
  setValue('email', editUser.email)

  const onSubmit = (editUser: EditUserType) => {
    axios
      .put('/api/users/' + id, editUser)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(editUser))
    router.push('/users')
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <section>
          <label>氏名</label>
          <Controller
            render={({ field }) => <input {...field} />}
            name='name'
            control={control}
            defaultValue=''
          />
        </section>
        <section>
          <label>フリガナ</label>
          <Controller
            render={({ field }) => <input {...field} />}
            name='kana'
            control={control}
            defaultValue=''
          />
        </section>
        <section>
          <label>Email</label>
          <Controller
            render={({ field }) => <input {...field} type='email' />}
            name='email'
            control={control}
            defaultValue=''
          />
        </section>
        <button type='submit'>編集</button>
      </form>
    </div>
  )
}

export default EditUser
