import { Reducer } from 'redux'
import { ZUMEN } from '../constants'
import { CHANGE_ZUMEN_TYPE, ZumenTypeAction } from '../actions'

/**
 * 全現場の選択中の図面を保持するstate
 */
export interface ZumenTypesState {
  // genbaKeyごとに選択中の図面を保持する
  readonly [genbaKey: string]: ZUMEN | undefined
}

const zumenTypesReducer: Reducer<ZumenTypesState, ZumenTypeAction> = (state = {}, action) => {
  switch (action.type) {
    case CHANGE_ZUMEN_TYPE: {
      const { genbaKey, zumenType } = action.payload
      return {
        ...state,
        [genbaKey]: zumenType,
      }
    }
    default:
      return state
  }
}

export default zumenTypesReducer
