/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback } from 'react'
import { Field } from 'redux-form'
import { tracker } from '../../utils'
import { EVENT_CATEGORY } from '../../constants'

type RadioProps = Readonly<{
  name: string
  value: string
  label: string
  className?: string
  labelTextClass?: string
  disabled?: boolean
  eventCategory?: EVENT_CATEGORY
  eventAction?: string
}>

const Radio: React.FC<RadioProps> = ({
  name,
  value,
  label,
  className = '',
  labelTextClass = '',
  disabled = false,
  eventCategory,
  eventAction,
}) => {
  const handleChange = useCallback(() => {
    if (eventCategory && eventAction) {
      tracker.event(eventCategory, eventAction)
    }
  }, [eventAction, eventCategory])

  return (
    <div className={`radio ${className}`} key={`${name}-${value}`}>
      <label>
        <Field
          component='input'
          type='radio'
          name={name}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />
        <span className={labelTextClass}>{label}</span>
      </label>
    </div>
  )
}

export default Radio
