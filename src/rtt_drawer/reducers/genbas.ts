import { Reducer } from 'redux'
import { GenbaType } from '../../common/types'
import { GET_GENBA_BY_KEY_SUCCESS, GenbaAction } from '../actions'

/**
 * 全現場データを保持するstate
 */
export interface GenbasState {
  // genbaKeyごとに現場データを保持する
  readonly [genbaKey: string]: GenbaType | undefined
}

const genbasReducer: Reducer<GenbasState, GenbaAction> = (state = {}, action) => {
  switch (action.type) {
    case GET_GENBA_BY_KEY_SUCCESS: {
      const { genbaKey, genba } = action.payload
      return {
        ...state,
        [genbaKey]: genba,
      }
    }
    default:
      return state
  }
}

export default genbasReducer
