/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback } from 'react'
import { Field } from 'redux-form'
import { tracker } from '../../utils'
import { EVENT_CATEGORY } from '../../constants'

type CheckboxProps = Readonly<{
  name: string
  label: string
  className?: string
  labelTextClass?: string
  disabled?: boolean
  eventCategory?: EVENT_CATEGORY
  eventAction?: string
  /** テスト用のid */
  dataTid?: string
}>

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  className = '',
  labelTextClass = '',
  disabled = false,
  eventCategory,
  eventAction,
  dataTid,
}) => {
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, newValue: boolean) => {
      if (eventCategory && eventAction) {
        tracker.event(eventCategory, eventAction, undefined, newValue ? 1 : 0)
      }
    },
    [eventAction, eventCategory],
  )

  return (
    <div className={`checkbox ${className}`} key={name}>
      <label>
        <Field
          component='input'
          type='checkbox'
          name={name}
          disabled={disabled}
          onChange={handleChange}
          data-tid={dataTid}
        />
        <span className={labelTextClass}>{label}</span>
      </label>
    </div>
  )
}

export default Checkbox
