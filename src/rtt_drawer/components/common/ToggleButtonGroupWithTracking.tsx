import React, { useCallback } from 'react'
import { ToggleButtonGroup, ToggleButtonGroupProps, ButtonGroupProps } from 'react-bootstrap'
import { BsPrefixComponentClass } from 'react-bootstrap/helpers'
import { tracker } from '../../utils'
import { EVENT_CATEGORY } from '../../constants'

type ButtonWithTrackingProps = Readonly<{
  eventCategory: EVENT_CATEGORY
  eventLabel?: string
  eventValue?: number
  onChange?: (value: string | string[]) => void
}> &
  ToggleButtonGroupProps<string> &
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.ComponentProps<BsPrefixComponentClass<any, ButtonGroupProps>>

/**
 * クリック時に google analytics に event データを送信する ToggleButtonGroup
 */
const ToggleButtonGroupWithTracking: React.FC<ButtonWithTrackingProps> = ({
  children,
  eventCategory,
  eventLabel,
  eventValue,
  onChange,
  ...otherProps
}) => {
  const handleChange = useCallback(
    (value: string | string[]): void => {
      if (Array.isArray(value)) {
        value.forEach((v) => tracker.event(eventCategory, v, eventLabel, eventValue))
      } else {
        tracker.event(eventCategory, value, eventLabel, eventValue)
      }
      if (onChange) {
        onChange(value)
      }
    },
    [eventCategory, eventLabel, eventValue, onChange],
  )

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ToggleButtonGroup {...otherProps} onChange={handleChange}>
      {children}
    </ToggleButtonGroup>
  )
}

export default ToggleButtonGroupWithTracking
