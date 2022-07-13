import styled from 'styled-components'
import { OneLineChart } from './OneLineChart'
import { TwoLineChart } from './TwoLineChart'

const alpacaEquity = [
  200,
  200.22384059348,
  199.008830016,
  201.47458677618,
  202.81722451516,
  204.66526581368,
  202.26,
  202.26,
]
const tradestationEquity = [
  1000,
  5000,
]
const Layout = styled.div`
  position: relative;
  display: grid;
  height: 100%;
  grid-template-rows: 2fr 1fr;
`
const LowerRow = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: ${p => `repeat(${p.count}, auto)`};
`

const App = () => {
  return (
    <Layout>
      <OneLineChart data={tradestationEquity} color="purple" />
      <LowerRow count={2}>
        <OneLineChart data={alpacaEquity} color="orange" />
        <TwoLineChart plots={[["orange", alpacaEquity], ["purple", tradestationEquity]]} />
      </LowerRow>
    </Layout>
  )
}

export default App
