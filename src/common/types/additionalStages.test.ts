import { AXIS, getAdditionalStageColumnKey } from './additionalStages'

describe('追加ステージ関連のコードが正しく動作すること', () => {
  test('getAdditionalStageKey が正しく動作すること', () => {
    expect(getAdditionalStageColumnKey(1, AXIS.X)).toBe('stage01X')
  })
})
