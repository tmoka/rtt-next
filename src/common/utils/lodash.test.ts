import { mean, uniq, range, chunk } from './lodash'

describe('src/common/utils/lodash.ts の関数が正しく動作すること', () => {
  test('mean 関数が正しく動作すること', () => {
    expect(mean([1, 4, 5, 0])).toEqual(2.5)
    expect(mean([])).toEqual(NaN)
  })

  test('uniq 関数が正しく動作すること', () => {
    expect(uniq([4, 7, 2, 2, 4, 5, 2, 3])).toEqual([4, 7, 2, 5, 3])
    expect(uniq([])).toEqual([])
  })

  test('range 関数が正しく動作すること', () => {
    expect(range(3, 7)).toEqual([3, 4, 5, 6])
    expect(range(3, 7, 2)).toEqual([3, 5])
    expect(range(5, 3)).toEqual([])
  })

  test('chunk 関数が正しく動作すること', () => {
    expect(chunk(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']])
    expect(chunk(['a', 'b'], 1)).toEqual([['a'], ['b']])
    expect(chunk([], 2)).toEqual([])
  })
})
