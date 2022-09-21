import axios from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import useSWR from 'swr'

const UserEdit: NextPage = () => {
  type UserEditType = {
    name: string
    kana: string
    email: string
  }

  const { control, handleSubmit, setValue } = useForm<UserEditType>()

  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/users/' + id, fetcher)
  if (!id) return <>Loading</>
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>
  setValue('name', data.name)
  setValue('kana', data.kana)
  setValue('email', data.email)

  const onSubmit = (data: UserEditType) => {
    axios
      .put('/api/users/' + id, data)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(data))
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

export default UserEdit
