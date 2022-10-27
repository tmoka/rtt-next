import { wrapShape } from '../../../modules/react-shape-editor/dist'
import {
  ConstrainResizeFunc,
  WrappedShapeProps,
  WrappedShapeReceivedProps,
} from '../../../modules/react-shape-editor/dist/types'
import { EditorShapeKind, EPSILON, ExtraShapeProps } from '../constants'

/** react-shape-editor の wrapShape の props に自前のデータを追加した関数 */
export const wrapShapeExtra = wrapShape as unknown as (
  prps: React.ComponentType<WrappedShapeReceivedProps & ExtraShapeProps>,
) => React.FC<WrappedShapeProps & ExtraShapeProps>

/** react-shape-editor に渡す constrainResize 関数を生成する */
export const makeConstrainResize =
  (kind: EditorShapeKind, getAltKeyPressed: () => boolean): ConstrainResizeFunc =>
  ({ startCorner, movingCorner, lockedDimension }) => {
    if (lockedDimension || !getAltKeyPressed()) {
      return movingCorner // 制限なし
    }
    switch (kind) {
      case EditorShapeKind.RECT:
        return movingCorner // 制限なし
      case EditorShapeKind.LINE:
        // 動きを x or y 方向に制限する
        if (Math.abs(movingCorner.x - startCorner.x) <= Math.abs(movingCorner.y - startCorner.y)) {
          return { x: startCorner.x + EPSILON, y: movingCorner.y }
        }
        return { x: movingCorner.x, y: startCorner.y + EPSILON }
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`変数の値が不正です。 kind: ${kind}`)
    }
  }
