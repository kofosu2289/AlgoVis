/* eslint-disable no-restricted-globals */
import * as actions from "../store/actions"
import * as utils from "./utils"
import { EVALUATING_PATH_COLOR, EVALUATING_SEGMENT_COLOR } from "../constants"

let DELAY = 0
let EVALUATING_DETAIL_LEVEL = 0

self.onmessage = function({ data: action }) {
  switch (action.type) {
    case actions.START_SOLVING:
      DELAY = action.delay
      EVALUATING_DETAIL_LEVEL = action.evaluatingDetailLevel
      runner(action.points)
      break

    case actions.SET_DELAY:
      DELAY = action.delay
      break

    case actions.SET_EVALUATING_DETAIL_LEVEL:
      EVALUATING_DETAIL_LEVEL = action.level
      break

    default:
      throw new Error(`invalid action sent to solver ${action.type}`)
  }
}

const runner = async points => {
  await dfs(points)
  self.postMessage(actions.stopSolving())
  self.terminate()
}

const setDifference = (setA, setB) => {
  const ret = new Set(setA)
  setB.forEach(p => {
    ret.delete(p)
  })
  return ret
}

const sleep = async () => {
  await utils.sleep(DELAY || 10)
}

const dfs = async (points, path = [], visited = null, overallBest = null) => {
  if (visited === null) {
    // initial call
    path = [points.shift()]
    points = new Set(points)
    visited = new Set()
  }

  if (EVALUATING_DETAIL_LEVEL > 1 && path.length > 2) {
    self.postMessage(
      actions.setEvaluatingPaths([
        {
          path: path.slice(0, path.length - 1),
          color: EVALUATING_SEGMENT_COLOR
        },
        {
          path: path.slice(path.length - 2, path.length + 1),
          color: EVALUATING_PATH_COLOR
        }
      ])
    )
    await sleep()
  }

  const available = setDifference(points, visited)

  if (available.size === 0) {
    // evaluate a complete path
    const backToStart = [...path, path[0]]
    const cost = utils.pathCost(backToStart)

    self.postMessage(
      actions.setEvaluatingPaths(
        [{ path: backToStart, color: EVALUATING_SEGMENT_COLOR }],
        cost
      )
    )

    await sleep()

    return [cost, backToStart]
  }

  let [bestCost, bestPath] = [null, null]

  for (const p of available) {
    visited.add(p)
    path.push(p)

    const [curCost, curPath] = await dfs(points, path, visited, overallBest)

    if (bestCost === null || curCost < bestCost) {
      bestCost = curCost
      bestPath = curPath

      if (overallBest === null || bestCost < overallBest) {
        // found a new best complete path
        overallBest = bestCost
        self.postMessage(actions.setBestPath(bestPath, bestCost))
      }
    }

    visited.delete(p)
    path.pop()

    if (EVALUATING_DETAIL_LEVEL > 1) {
      self.postMessage(
        actions.setEvaluatingPaths([{ path, color: EVALUATING_SEGMENT_COLOR }])
      )
      await sleep()
    }
  }

  return [bestCost, bestPath]
}
