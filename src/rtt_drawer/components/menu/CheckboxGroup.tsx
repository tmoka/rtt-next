/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { Field, WrappedFieldProps } from 'redux-form'
import { arrayReplace } from '../../../common/utils'
import { EVENT_CATEGORY } from '../../constants'
import { tracker } from '../../utils'

type CheckboxGroupInnerProps = Readonly<{
  options: {
    label: string
    value: string
    disabled?: boolean
    className?: string
    style?: React.CSSProperties
    labelTextClass?: string
    eventCategory?: EVENT_CATEGORY
    eventAction?: string
    dataTid?: string
  }[]
}>

const CheckboxGroupInner: React.FC<CheckboxGroupInnerProps & WrappedFieldProps> = ({
  input,
  options,
}) => {
  const { name, onChange } = input
  const inputValues = input.value as string[]

  const checkboxes = options.map((option, index) => {
    const {
      label,
      value,
      disabled,
      className,
      labelTextClass,
      eventCategory,
      eventAction,
      dataTid,
    } = option
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (event.target.checked) {
        if (eventCategory && eventAction) {
          tracker.event(eventCategory, eventAction, undefined, 1)
        }
        onChange([...inputValues, value])
      } else {
        const idx = inputValues.indexOf(value)
        if (idx >= 0) {
          if (eventCategory && eventAction) {
            tracker.event(eventCategory, eventAction, undefined, 0)
          }
          onChange(arrayReplace(inputValues, idx, []))
        }
      }
    }
    const checked = inputValues.includes(value)
    return (
      <div key={`checkbox-${value}`} className={`checkbox ${className || ''}`} style={option.style}>
        <label>
          <input
            type='checkbox'
            name={`${name}[${index}]`}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            data-tid={dataTid}
          />
          <span className={labelTextClass}>{label}</span>
        </label>
      </div>
    )
  })

  return <div>{checkboxes}</div>
}

type CheckboxGroupProps = Readonly<{
  name: string
}> &
  CheckboxGroupInnerProps

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ name, options }) => (
  <Field type='checkbox' name={name} component={CheckboxGroupInner} options={options} />
)

export default CheckboxGroup
