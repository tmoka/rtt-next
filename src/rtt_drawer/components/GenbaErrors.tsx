import React from 'react'
import { Alert } from 'react-bootstrap'
import NewlineToBreak from './common/NewlineToBreak'
import { KGExceptionType } from '../../common/types'

type GenbaErrorsProps = Readonly<{
  errors: KGExceptionType[]
}>

/**
 * newclasから受け取った例外を表示するコンポーネント
 */
const GenbaErrors: React.FC<GenbaErrorsProps> = ({ errors }) => {
  const errorElems = errors.map((error, i) => {
    const key = i
    return (
      <Alert key={key} variant='danger'>
        <p className='mb-2'>
          <strong>{error.exceptionName}</strong>
        </p>
        <NewlineToBreak text={error.userMessage} />
      </Alert>
    )
  })

  return <div>{errorElems}</div>
}

export default GenbaErrors
