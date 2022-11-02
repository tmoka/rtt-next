import { createAction } from 'typesafe-actions'
import { MapState } from '../constants'

export const UPDATE_MAP_STATE = '@@rtt-drawer/UPDATE_MAP_STATE'
export const RESET_MAP_STATE = '@@rtt-drawer/RESET_MAP_STATE'

/**
 * MapState を更新する
 * @param mapState
 */
export const updateMapState = createAction(UPDATE_MAP_STATE)<{
  mapState: MapState
}>()

/**
 * MapState をリセットする
 */
export const resetMapState = createAction(RESET_MAP_STATE)<undefined>()
