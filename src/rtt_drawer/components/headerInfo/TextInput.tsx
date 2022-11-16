import React from 'react'
import { Form } from 'react-bootstrap'
import { WrappedFieldProps } from 'redux-form'

type TextInputProps = Readonly<{}> & WrappedFieldProps

const TextInput: React.FC<TextInputProps> = ({ input }) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Form.Control type='text' {...input} />
}

export default TextInput
