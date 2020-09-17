import React, { useRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MapGL from 'react-map-gl';
import DeckGL, { ScatterplotLayer, PathLayer } from 'deck.gl';
import { LinearProgress } from '@material-ui/core';
import * as actions from '../store/actions';
import * as selectors from '../store/selectors';

const TOKEN =
  "pk.eyJ1Ijoia29mb3N1ODkiLCJhIjoiY2p4ZjBlejMzMHVjazNwbWRnamIwdzVzZCJ9.2ZJyTzSQE1FsCoB5G6v7gw"

const MapPlot = React.forwardRef((props, ref) => {
  const mapGlRef = useRef()
  const plotPoints = useSelector(selectors.selectPointsDisplay)
  const plotPaths = useSelector(selectors.selectPlotPaths)
  const viewport = useSelector(selectors.selectViewport)
  const running = useSelector(selectors.selectRunning)
  const definingPoints = useSelector(selectors.selectDefiningPoints)
  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      const map = mapGlRef.current.getMap()
      const { _ne, _sw } = map.getBounds()
      return {
        top: _ne.lat,
        bottom: _sw.lat,
        left: _ne.lng,
        right: _sw.lng,
      }
    },
  }))

  const onViewportChanged = viewport => {
    dispatch(actions.setViewportState(viewport))
  }

  const onDefinedPoint = ({ lngLat }) => {
    dispatch(actions.addDefinedPoint(lngLat))
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
      onNativeClick={definingPoints && onDefinedPoint}
    >
      {running && <LinearProgress color="secondary" />}
      <DeckGL viewState={viewport}>
        <PathLayer
          id="path-layer"
          data={plotPaths}
          getPath={d => d.path}
          getColor={d => d.color}
          pickable={true}
          widthMinPixels={4}
          widthMaxPixels={8}
        />
        <ScatterplotLayer
          id="scatter-layer"
          data={plotPoints}
          pickable={true}
          opacity={0.8}
          getFillColor={p => p.color}
          radiusMinPixels={6}
          raduisMaxPixels={8}
        />
      </DeckGL>
    </MapGL>
  )
})

export default MapPlot
