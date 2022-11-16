import React from 'react'

export type NewlineToBreakProps = Readonly<{
  text?: string
}>

/**
 * 文字列中の改行を <br /> にエスケープして表示する
 */
const NewlineToBreak: React.FC<NewlineToBreakProps> = ({ text = '' }) => {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const key = i
        return (
          <React.Fragment key={key}>
            {line}
            {i === lines.length - 1 ? null : <br />}
          </React.Fragment>
        )
      })}
    </>
  )
}

export default NewlineToBreak
