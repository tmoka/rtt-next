import { createAction } from 'typesafe-actions'
import { GenbaKeyType } from '../../common/types'
import { ZUMEN, EditorShape, EditorShapeKind } from '../constants'

export const SET_EDITOR_TOOL = '@@rtt-drawer/SET_EDITOR_TOOL'
export const REPLACE_EDITOR_SHAPES = '@@rtt-drawer/REPLACE_EDITOR_SHAPES'

/** 編集ツールを選択 */
export const setEditorTool = createAction(SET_EDITOR_TOOL)<{
  genbaKey: GenbaKeyType
  zumenType: ZUMEN
  tool?: EditorShapeKind
}>()

export const replaceEditorShapes = createAction(REPLACE_EDITOR_SHAPES)<{
  genbaKey: GenbaKeyType
  zumenType: ZUMEN
  shapes: EditorShape[]
}>()
