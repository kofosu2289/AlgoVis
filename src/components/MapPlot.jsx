import React, { useRef, useImperativeHandle, useContext } from 'react';
import DeckGL, { ScatterplotLayer, PathLayer } from 'deck.gl';
import MapGL from 'react-map-gl';
import StoreProvider from '../store/provider';
import * as actions from '../store/actions';

const TOKEN = 'pk.eyJ1Ijoia29mb3N1ODkiLCJhIjoiY2p4ZjBlejMzMHVjazNwbWRnamIwdzVzZCJ9.2ZJyTzSQE1FsCoB5G6v7gw';


const MapPlot = React.forwardRef((props, ref) => {
  const mapGlRef = useRef();
  const { state, dispatch } = useContext(StoreProvider);
  const { points, bestPath, viewport } = state;

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      const map = mapGlRef.current.getMap();
      return map.getBounds();
    }
  }))

  const onViewportChanged = viewport => {
    dispatch(actions.setViewportState(viewport))
  }

  console.log(JSON.stringify(bestPath));

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
        <ScatterplotLayer id="scatter-layer"
                          data={points}
                          pickable={true}
                          opacity={0.8}
                          radiusMinPixels={5}
                          raduisMaxPixels={8}
                          />
        <PathLayer id='path-layer'
                   data={[bestPath]}
                   getPath={d => d.path}
                   getWidth={5}
                   widthUnit='pixels'
                   pickable={true}
                   widthMinPixels={2}
                   widthMaxPixels={4}
                   />
      </DeckGL>
    </MapGL>
  );
})

export default MapPlot;
