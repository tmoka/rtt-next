import { BenchGridProps } from './BenchGrid.dev'

const BenchGrid =
  process.env.NODE_ENV === 'production'
    ? () => null
    : // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
      (require('./BenchGrid.dev').default as React.FC<BenchGridProps>)

export default BenchGrid
