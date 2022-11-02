import React from 'react'
import { AsyncAction } from '../../actions'
import { AsyncStatusState } from '../../reducers'
import AsyncStatusItem from './AsyncStatusItem'

export type AsyncStatusProps = Readonly<{
  asyncStatus: AsyncStatusState
}>

/**
 * async action の状態を表示するコンポーネント
 */
const AsyncStatus: React.FC<AsyncStatusProps> = ({ asyncStatus }) => {
  const actions = Object.values(asyncStatus) as (AsyncAction | undefined)[]

  const items = actions.map((action) => {
    if (!action) {
      return null
    }

    return <AsyncStatusItem key={action.type} action={action} />
  })

  return <div>{items}</div>
}

export default React.memo(AsyncStatus)
