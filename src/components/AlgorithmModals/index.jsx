import React from "react"

import RandomAlgorithmModal from "./random"
import ShortestPathAlgorithmModal from "./shortestPath"
import DfsAlgorithmModal from "./dfs"

export default props => {
  return (
    <>
      <RandomAlgorithmModal />
      <DfsAlgorithmModal />
      <ShortestPathAlgorithmModal />
    </>
  )
}
