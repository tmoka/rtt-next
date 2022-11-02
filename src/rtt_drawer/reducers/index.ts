import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { StateType } from 'typesafe-actions'
import asyncStatusReducer from './asyncStatus'
import editorSetsReducer from './editorSets'
import genbasReducer from './genbas'
import mapStateReducer from './mapState'
import zumenTypesReducer from './zumenTypes'

export * from './asyncStatus'
export * from './editorSets'
export * from './genbas'
// export * from './mapState'; // 今の所は特に export するものがない
export * from './zumenTypes'

export const reducers = {
  asyncStatus: asyncStatusReducer,
  editorSets: editorSetsReducer,
  genbas: genbasReducer,
  mapState: mapStateReducer,
  zumenTypes: zumenTypesReducer,
  form: formReducer,
}

const rootReducer = combineReducers(reducers)

/**
 * state全体
 */
export type RootState = Readonly<StateType<typeof rootReducer>>

export default rootReducer
