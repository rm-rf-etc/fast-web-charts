import React from 'react'
import { RenderLayer } from '@fwc/fwc-canvas'
import { FwcCanvasReact } from '@fwc/fwc-canvas-react'

const canvasStyle: React.CSSProperties = {
  backgroundColor: 'black',
}
interface Props {
  data: number[]
  color: string
}
export const OneLineChart: React.FC<Props> = ({ data, color }) => {
  return (
    <FwcCanvasReact
      transparentBackground={false}
      canvasStyle={canvasStyle}
      onReady={fwc => {
        const equity = new RenderLayer('alpaca', 3, color)
        const price = equity.newCurve()
        let i = 0;
        let max = -Infinity
        let min = Infinity
        for (const bal of data) {
          max = Math.max(max, bal)
          min = Math.min(min, bal)
          price.addPoint(i++, bal)
        }
        fwc.config({ layers: [equity] })
        fwc.setMinMaxX(0, data.length)
        fwc.setMinMaxY(min, max)
        fwc.renderLayers()
      }}
    />
  )
}
