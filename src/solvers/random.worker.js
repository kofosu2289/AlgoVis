/* eslint-disable no-restricted-globals */
import * as actions from "../store/actions"
import * as utils from "./utils"

let DELAY = 0
let SHOW_INTERMEDIATE = false

self.onmessage = function ({ data: action }) {
  switch (action.type) {
    case actions.START_SOLVING:
      DELAY = action.delay
      SHOW_INTERMEDIATE = action.showIntermediatePaths
      run(action.points)
      break

    case actions.SET_DELAY:
      DELAY = action.delay
      break

    case actions.SET_SHOW_INTERMEDIATE_PATHS:
      SHOW_INTERMEDIATE = action.show
      break

    default:
      throw new Error(`invalid action sent to solver ${action.type}`)
  }
}

const run = async points => {
  let best = null
  while (true) {
    const nextPath = points.sort(() => Math.random() - 0.5)
    const cost = utils.pathCost(nextPath)

    if (best === null || cost < best) {
      best = cost
      self.postMessage(actions.setBestPath(nextPath, cost))
    }

    if (SHOW_INTERMEDIATE) {
      self.postMessage(actions.setIntermediatePath(nextPath, cost))
    }

    await utils.sleep(DELAY || 10)
  }
}