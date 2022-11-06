import axios from 'axios'
import router from 'next/router'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Form } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'

const SignUp = (): JSX.Element => {
  type UserSignUpType = {
    name: string
    kana: string
    email: string
    password: string
    confirmPassword: string
  }

  const { control, handleSubmit } = useForm<UserSignUpType>()

  const onSubmit = (data: UserSignUpType) => {
    if (data.password !== data.confirmPassword) {
      console.error('パスワードが一致しません')
      return
    }
    axios
      .post('/api/signup', data)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(data))
    router.push('/')
  }

  return (
    <div>
      <h1>アカウント登録</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Email<span style={{ color: 'red' }}>*</span></Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control type='email' onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='email'
            control={control}
            defaultValue=''
          />
          <Form.Label>氏名<span style={{ color: 'red' }}>*</span></Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='name'
            control={control}
            defaultValue=''
          />
          <Form.Label>フリガナ<span style={{ color: 'red' }}>*</span></Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='kana'
            control={control}
            defaultValue=''
          />
          <Form.Label>パスワード</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control type='password' onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='password'
            control={control}
            defaultValue=''
          />
          <Form.Label>確認用パスワード</Form.Label>
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Form.Control type='password' onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
            )}
            name='confirmPassword'
            control={control}
            defaultValue=''
          />
        </Form.Group>
        <Button className='mt-3' type='submit'>アカウント登録</Button>
      </Form>
    </div>
  )
}

export default SignUp
