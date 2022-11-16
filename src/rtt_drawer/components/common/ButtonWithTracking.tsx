import React, { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { tracker } from '../../utils'
import { EVENT_CATEGORY } from '../../constants'

type ButtonWithTrackingProps = Readonly<{
  eventCategory: EVENT_CATEGORY
  eventAction: string
  eventLabel?: string
  eventValue?: number
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}> &
  React.ComponentProps<typeof Button>

/**
 * クリック時に google analytics に event データを送信するボタン
 */
const ButtonWithTracking: React.FC<ButtonWithTrackingProps> = ({
  eventCategory,
  eventAction,
  eventLabel,
  eventValue,
  onClick,
  ...otherProps
}) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      tracker.event(eventCategory, eventAction, eventLabel, eventValue)
      if (onClick) {
        onClick(event)
      }
    },
    [eventAction, eventCategory, eventLabel, eventValue, onClick],
  )

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Button as='button' onClick={handleClick} {...otherProps} />
}

export default ButtonWithTracking
