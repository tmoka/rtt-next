import React, { useCallback } from 'react'
import ja from 'date-fns/locale/ja'
import { Form } from 'react-bootstrap'
import DatePicker, { registerLocale } from 'react-datepicker'
import { WrappedFieldProps } from 'redux-form'

// DatePicker を日本語化する
registerLocale('ja', ja)

type DateInputProps = Readonly<{}> & WrappedFieldProps

/**
 * 日付入力用コンポーネント
 */
const DateInput: React.FC<DateInputProps> = ({ input }) => {
  const handleChange = useCallback(
    (date: Date | null) => {
      // Date を 文字列に変換して redux に渡す
      input.onChange(date ? date.toISOString() : '')
    },
    [input],
  )

  // 文字列を Date に変換して DatePicker に渡す
  const selectedDate = input.value ? new Date(input.value) : undefined

  return (
    <DatePicker
      selected={selectedDate}
      dateFormat='yyyy/MM/dd'
      onChange={handleChange}
      customInput={<Form.Control type='text' />}
      locale='ja'
    />
  )
}

export default DateInput
