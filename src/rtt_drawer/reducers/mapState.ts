import { Reducer } from 'redux'
import { initialMapState, MapState } from '../constants'
import {
  UPDATE_MAP_STATE,
  RESET_MAP_STATE,
  GET_GENBA_BY_KEY_SUCCESS,
  CHANGE_ZUMEN_TYPE,
  MapStateAction,
  GenbaAction,
  ZumenTypeAction,
} from '../actions'

const mapStateReducer: Reducer<MapState, MapStateAction | GenbaAction | ZumenTypeAction> = (
  state = initialMapState,
  action,
) => {
  switch (action.type) {
    case UPDATE_MAP_STATE:
      return action.payload.mapState
    case RESET_MAP_STATE:
    case GET_GENBA_BY_KEY_SUCCESS:
    case CHANGE_ZUMEN_TYPE:
      // リセットする
      return initialMapState
    default:
      return state
  }
}

export default mapStateReducer
