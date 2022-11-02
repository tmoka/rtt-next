import { useCallback, useEffect, useRef } from 'react'

/**
 * ctrl, shift などのキーの状態を取得する
 *
 * @param subKey - キーの種類
 * @returns キーの状態を取得する関数
 */
export const useSubKeyPress = (
  subKey: 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey',
): (() => boolean) => {
  const keyPressedRef = useRef(false)

  const handler = useCallback(
    (event: KeyboardEvent): void => {
      keyPressedRef.current = event[subKey]
    },
    [subKey],
  )

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', handler)
    window.addEventListener('keyup', handler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('keyup', handler)
    }
  }, [handler])

  const getKeyPressed = useCallback(() => keyPressedRef.current, [])
  return getKeyPressed
}
