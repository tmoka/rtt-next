import { ActionType } from 'typesafe-actions'
import * as editorActions from './editor'
import * as fontsActions from './fonts'
import * as genbaActions from './genba'
import * as mapStateActions from './mapState'
import * as pdfActions from './pdf'
import * as zumenTypeActions from './zumenType'

export * from './editor'
export * from './fonts'
export * from './genba'
export * from './mapState'
export * from './pdf'
export * from './zumenType'

export type EditorAction = ActionType<typeof editorActions>
export type FontsAction = ActionType<typeof fontsActions>
export type GenbaAction = ActionType<typeof genbaActions>
export type MapStateAction = ActionType<typeof mapStateActions>
export type PDFAction = ActionType<typeof pdfActions>
export type ZumenTypeAction = ActionType<typeof zumenTypeActions>

export type AsyncAction = GenbaAction | FontsAction | PDFAction

/**
 * rtt_drawerの全actionをまとめた型
 */
export type RootAction = AsyncAction | EditorAction | MapStateAction | ZumenTypeAction
