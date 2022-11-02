import React, { useContext } from 'react'
import { identity, Matrix } from 'transformation-matrix'
import { Corners } from '../constants'

/** clearTrans を管理する context */
export const ClearTransContext = React.createContext(identity())

export const useClearTransContext = (): Matrix => {
  return useContext(ClearTransContext)
}

/** 編集中の始点と終点を管理する context */
export const MovingCornersContext = React.createContext<Corners>({
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
})

export const useMovingCornersContext = (): Corners => {
  return useContext(MovingCornersContext)
}
