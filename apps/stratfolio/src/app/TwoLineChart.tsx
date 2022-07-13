import React from 'react'
import { RenderLayer, Curve } from '@fwc/fwc-canvas'
import { FwcCanvasReact } from '@fwc/fwc-canvas-react'

const canvasStyle: React.CSSProperties = {
  backgroundColor: 'black',
}
interface Props {
  plots: [string, number[]][]
}
export const TwoLineChart: React.FC<Props> = ({ plots }) => {
  return (
    <FwcCanvasReact
      transparentBackground={false}
      canvasStyle={canvasStyle}
      onReady={fwc => {
        let maxY = -Infinity
        let minY = Infinity
        let maxX = -Infinity
        let chartN = 1
        const layers: RenderLayer[] = []
        for (const [color, data] of plots) {
          let i = 0
          const layer = new RenderLayer(`chart${chartN}`, 3, color)
          const price = layer.newCurve()
          chartN++
          for (const bal of data) {
            maxX = Math.max(maxX, i)
            maxY = Math.max(maxY, bal)
            minY = Math.min(minY, bal)
            price.addPoint(i++, bal)
          }
          layers.push(layer)
        }
        fwc.config({ layers })
        fwc.setMinMaxX(0, maxX)
        fwc.setMinMaxY(minY, maxY)
        fwc.renderLayers()
      }}
    />
  )
}
