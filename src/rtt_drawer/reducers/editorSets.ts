import { Reducer } from 'redux'
import { EditorAction, REPLACE_EDITOR_SHAPES, SET_EDITOR_TOOL } from '../actions'
import { EditorShape, EditorShapeKind, ZUMEN } from '../constants'

export interface EditorState {
  /** 選択中の編集ツール */
  readonly tool?: EditorShapeKind
  /** 表示中の図形 */
  readonly shapes: EditorShape[]
}

export const initialEditorState: EditorState = { shapes: [] }

export type EditorSetState = { readonly [K in ZUMEN]: EditorState }

const editorStateReducer: Reducer<EditorState, EditorAction> = (
  state = initialEditorState,
  action,
) => {
  switch (action.type) {
    case SET_EDITOR_TOOL: {
      const { tool } = action.payload
      return {
        ...state,
        tool,
      }
    }
    case REPLACE_EDITOR_SHAPES: {
      const { shapes } = action.payload
      return {
        tool: undefined,
        shapes,
      }
    }
    default:
      return state
  }
}

export const initialEditorSetState: EditorSetState = {
  [ZUMEN.HEIMEN]: initialEditorState,
  [ZUMEN.RITSUMEN1]: initialEditorState,
  [ZUMEN.RITSUMEN2]: initialEditorState,
  [ZUMEN.GAIHEKI1]: initialEditorState,
  [ZUMEN.GAIHEKI2]: initialEditorState,
  [ZUMEN.SINGLE_COLUMN]: initialEditorState,
  [ZUMEN.SETSU_COMPARISON]: initialEditorState,
}

export interface EditorSetsState {
  readonly [genbaKey: string]: EditorSetState | undefined
}

export const initialEditorSetsState: EditorSetsState = {}

const EDITOR_ACTION_TYPES = [SET_EDITOR_TOOL, REPLACE_EDITOR_SHAPES]

const editorSetsReducer: Reducer<EditorSetsState, EditorAction> = (
  state = initialEditorSetsState,
  action,
) => {
  if (!EDITOR_ACTION_TYPES.includes(action.type)) {
    return state
  }
  const { genbaKey, zumenType } = action.payload
  const editorSet = state[genbaKey] || initialEditorSetState
  const editorState = editorSet[zumenType]
  return {
    ...state,
    [genbaKey]: {
      ...editorSet,
      [zumenType]: editorStateReducer(editorState, action),
    },
  }
}

export default editorSetsReducer
