import React, { useRef, useImperativeHandle } from "react"
import { useSelector, useDispatch } from "react-redux"
import DeckGL, { ScatterplotLayer, PathLayer } from "deck.gl"
import MapGL from "react-map-gl"
import * as actions from "../store/actions"
import * as selectors from "../store/selectors"

const TOKEN =
  "pk.eyJ1Ijoia29mb3N1ODkiLCJhIjoiY2p4ZjBlejMzMHVjazNwbWRnamIwdzVzZCJ9.2ZJyTzSQE1FsCoB5G6v7gw"

const MapPlot = React.forwardRef((props, ref) => {
  const mapGlRef = useRef()
  const points = useSelector(selectors.selectPoints)
  const bestPath = useSelector(selectors.selectBestPath)
  const viewport = useSelector(selectors.selectViewport)
  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      const map = mapGlRef.current.getMap()
      return map.getBounds()
    },
  }))

  const onViewportChanged = viewport => {
    dispatch(actions.setViewportState(viewport))
  }

  return (
    <MapGL
      {...viewport}
      ref={mapGlRef}
      width="100%"
      height="100%"
      maxPitch={0}
      onViewportChange={onViewportChanged}
      mapboxApiAccessToken={TOKEN}
      disableTokenWarning={true}
    >
      <DeckGL viewState={viewport}>
        <PathLayer
          id="path-layer"
          data={[{ path: bestPath }]}
          getPath={d => d.path}
          getWidth={5}
          widthUnit="pixels"
          pickable={true}
          widthMinPixels={2}
          widthMaxPixels={4}
        />
        <ScatterplotLayer
          id="scatter-layer"
          data={points.map(p => ({ position: p }))}
          pickable={true}
          opacity={0.8}
          getFillColor={[0, 255, 255]}
          radiusMinPixels={5}
          raduisMaxPixels={8}
        />
      </DeckGL>
    </MapGL>
  )
})

export default MapPlot
