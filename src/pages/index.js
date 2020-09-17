import React, { useRef, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import Helmet from "react-helmet"
import IntroductionModal from '../components/IntroductionModal';
import Layout from "../components/Layout"
import MapPlot from "../components/MapPlot"
import Menu from "../components/Menu"

import useSolverWorker from "../hooks/useSolverWorker"
import * as selectors from "../store/selectors"
import * as actions from "../store/actions"

const IndexPage = () => {
  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const algorithm = useSelector(selectors.selectAlgorithm)
  const delay = useSelector(selectors.selectDelay)
  const evaluatingDetailLevel = useSelector(
    selectors.selectEvaluatingDetailLevel
  )
  const points = useSelector(selectors.selectPoints)
  const pointCount = useSelector(selectors.selectPointCount)
  const definingPoints = useSelector(selectors.selectDefiningPoints)

  const solver = useSolverWorker(dispatch, algorithm)

  const onRandomizePoints = useCallback(() => {
    if (!definingPoints) {
      const bounds = mapRef.current.getBounds()
      dispatch(actions.randomizePoints(bounds, pointCount))
    }
  }, [mapRef, dispatch, pointCount, definingPoints])

  const start = useCallback(() => {
    dispatch(actions.startSolving(points, delay, evaluatingDetailLevel))
    solver.postMessage(
      actions.startSolvingAction(points, delay, evaluatingDetailLevel)
    )
  }, [solver, dispatch, delay, points, evaluatingDetailLevel])

  const stop = useCallback(() => {
    dispatch(actions.stopSolving())
    solver.terminate()
  }, [solver, dispatch])

  useEffect(() => {
    solver.postMessage(actions.setDelay(delay))
  }, [delay, solver])

  useEffect(() => {
    solver.postMessage(actions.setEvaluatingDetailLevel(evaluatingDetailLevel))
  }, [evaluatingDetailLevel, solver])


  return (
    <Layout>
      <Helmet title="AlgoVis" />
      <IntroductionModal />
      <Menu
        onStart={start}
        onStop={stop}
        onRandomizePoints={onRandomizePoints}
      />
      <MapPlot ref={mapRef} />
    </Layout>
  )
}

export default IndexPage
