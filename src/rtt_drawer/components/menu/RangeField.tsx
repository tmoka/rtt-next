/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback } from 'react'
import { Field } from 'redux-form'
import {
  MenuConfigType,
  TEMP_MENU_KEY_SUFFIX,
  defaultMenuConfig,
  EVENT_CATEGORY,
} from '../../constants'
import { tracker } from '../../utils'

type RangeFieldProps = Readonly<{
  menuConfig: MenuConfigType
  changeField: (field: string, value: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  name: keyof MenuConfigType
  label: string
  min: number
  max: number
  eventCategory?: EVENT_CATEGORY
  eventAction?: string
}>

const RangeField: React.FC<RangeFieldProps> = ({
  menuConfig,
  changeField,
  name,
  label,
  min,
  max,
  eventCategory,
  eventAction,
}) => {
  const tempName = `${name}${TEMP_MENU_KEY_SUFFIX}` as keyof MenuConfigType

  const resetField = useCallback(() => {
    changeField(name, defaultMenuConfig[name])
    changeField(tempName, defaultMenuConfig[name])
  }, [changeField, name, tempName])
  const handleDragEnd = useCallback(() => {
    // tempNameフィールドの内容をnameフィールドにコピーする
    changeField(name, menuConfig[tempName])
    if (eventCategory && eventAction) {
      tracker.event(eventCategory, eventAction, undefined, Number(menuConfig[tempName]))
    }
  }, [changeField, eventAction, eventCategory, menuConfig, name, tempName])

  return (
    <div className='form-group row range-group' key={name}>
      <div className='col-12' onDoubleClick={resetField}>
        <label>{label}</label>
        <span className='float-right'>{menuConfig[tempName]}</span>
      </div>
      <div className='col-12'>
        <Field
          component='input'
          type='range'
          name={tempName}
          className='form-control input-sm'
          min={min}
          max={max}
          normalize={Number}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}

export default RangeField
