import { createAction } from 'typesafe-actions'
import { GenbaKeyType } from '../../common/types'
import { ZUMEN } from '../constants'

export const CHANGE_ZUMEN_TYPE = '@@rtt-drawer/CHANGE_ZUMEN_TYPE'

/**
 * 選択している図面を変更する
 * @param genbaKey
 * @param zumenType
 */
export const changeZumenType = createAction(CHANGE_ZUMEN_TYPE)<{
  genbaKey: GenbaKeyType
  zumenType: ZUMEN
}>()
