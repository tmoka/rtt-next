import React from 'react'
import { Field } from 'redux-form'

type SelectProps = Readonly<{
  name: string
  options: { title: string; value: string }[]
  /** テスト用のid */
  dataTid?: string
}>

const Select: React.FC<SelectProps> = ({ name, options, dataTid }) => (
  <Field component='select' name={name} className='form-control input-sm' data-tid={dataTid}>
    <option disabled value=''>
      -----
    </option>
    {options.map(({ title, value }) => (
      <option value={value} key={`option-${value}`}>
        {title}
      </option>
    ))}
  </Field>
)

export default Select
