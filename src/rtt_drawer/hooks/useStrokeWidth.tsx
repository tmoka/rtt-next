import { useMemo } from 'react'
import { useClearTransContext } from './contexts'
import { DEFAULT_STROKE_WIDTH } from '../constants'
import { calcScaleFromTrans } from '../utils'

/** 現在の座標系に応じた strokeWidth を計算する */
export const useStrokeWidth = (): number => {
  const clearTrans = useClearTransContext()
  const strokeWidth = useMemo(
    () => Math.round(DEFAULT_STROKE_WIDTH * calcScaleFromTrans(clearTrans)),
    [clearTrans],
  )
  return strokeWidth
}
