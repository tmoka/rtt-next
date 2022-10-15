import React from 'react'
import { Alert } from 'react-bootstrap'
import { format } from 'date-fns'
import NewlineToBreak from './NewlineToBreak'
import { RTTDrawerError } from '../../utils'

export type ErrorBoundaryState = Readonly<{
  // 例外が発生したかどうか
  hasError: boolean
  // 例外発生時刻
  date?: Date
  // 例外名
  errorName?: string
  // ユーザ向けメッセージ
  userMessage?: string
  // デバッグ用メッセージ
  debugMessage?: string
}>

/**
 * 子コンポーネントで発生した例外をキャッチして処理する
 */
class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    let errorName = 'Error'
    let userMessage = '描画エラーが発生しました。'
    if (error instanceof RTTDrawerError) {
      errorName = error.name
      userMessage = error.message
    }

    return {
      hasError: true,
      date: new Date(),
      errorName,
      userMessage,
      debugMessage: (error || '').toString(),
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public componentDidCatch(error: Error, info: object): void {
    // You can also log the error to an error reporting service
    console.error(error, info) // eslint-disable-line no-console
  }

  private handleClose = (): void => {
    this.setState(() => ({
      hasError: false,
    }))
  }

  public render(): React.ReactNode {
    const { hasError, date, errorName, userMessage, debugMessage } = this.state
    const { children } = this.props

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Alert variant='danger' dismissible onClose={this.handleClose}>
          <p className='mb-2'>
            <strong>{errorName}</strong>
            <span className='float-right'>
              <small>{date ? format(date, 'yyyy/MM/dd HH:mm:ss') : ''}</small>
            </span>
          </p>
          <NewlineToBreak text={userMessage} />
          <span className='comment'>{debugMessage}</span>
        </Alert>
      )
    }

    return children
  }
}

export default ErrorBoundary
